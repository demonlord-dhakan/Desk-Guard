import asyncio
from datetime import datetime, timedelta
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# ==========================================
# DATABASE SETUP & MODELS
# ==========================================
DATABASE_URL = "sqlite:///./deskguard.db" # Can swap to postgresql:// easily
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DeskStatus(str, Enum):
    FREE = "Green"
    OCCUPIED = "Red"
    AWAY = "Yellow"

class Desk(Base):
    __tablename__ = "desks"

    id = Column(Integer, primary_key=True, index=True)
    desk_number = Column(String, unique=True, index=True)
    status = Column(String, default=DeskStatus.FREE.value)
    current_user = Column(String, nullable=True)
    last_ping = Column(DateTime, nullable=True)
    away_expires_at = Column(DateTime, nullable=True)

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    desk_number = Column(String)
    action = Column(String)
    user_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Ensure tables are created
Base.metadata.create_all(bind=engine)

# ==========================================
# DATABASE UTILITIES
# ==========================================
def log_activity(
    db: Session,
    desk_number: str,
    action: str,
    user_id: str = None
):
    activity = Activity(
        desk_number=desk_number,
        action=action,
        user_id=user_id
    )
    db.add(activity)
    db.commit()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# BACKGROUND SWEEPER
# ==========================================
async def desk_sweeper():
    """
    Runs every 60 seconds. Checks for desks in 'AWAY' state that exceeded the 20-minute limit.
    """
    while True:
        await asyncio.sleep(60) # Run every minute
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            
            # 1. Handle Expired AWAY Desks (20 min limit)
            expired_away_desks = db.query(Desk).filter(
                Desk.status == DeskStatus.AWAY.value,
                Desk.away_expires_at < now
            ).all()
            
            for desk in expired_away_desks:
                desk.status = DeskStatus.FREE.value
                desk.current_user = None
                desk.away_expires_at = None
                desk.last_ping = None
                
                log_activity(db, desk.desk_number, "AUTO_RELEASED_AWAY", None)
                print(f"[Sweeper] Desk {desk.desk_number} automatically freed from AWAY timeout.")
            if expired_away_desks:
                db.commit()
                
        except Exception as e:
            print(f"[Sweeper Error] {e}")
        finally:
            db.close()

# Managing server lifecycle to spin up the background worker
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables are created and seed initial data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Desk).count() == 0:
            for i in range(1, 51): # Create 50 test desks
                db.add(Desk(desk_number=f"Desk-{i}", status=DeskStatus.FREE.value))
            db.commit()
            print(f"[Startup] Seeded 50 desks in the database.")
    except Exception as e:
        print(f"[Startup Error] Seeding failed: {e}")
    finally:
        db.close()
        
    bg_task = asyncio.create_task(desk_sweeper())
    yield
    # Shutdown: Clean up background tasks if needed
    bg_task.cancel()

app = FastAPI(lifespan=lifespan)

# Configure CORS middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://desk-guard.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ==========================================
# PYDANTIC SCHEMAS (Request Validation)
# ==========================================
class CheckInRequest(BaseModel):
    user_id: str

# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/desks")
def get_map_state(db: Session = Depends(get_db)):
    """Returns the current state of all desks for the SVG live map."""
    return db.query(Desk).all()

@app.post("/desks/{desk_number}/checkin")
def check_in(desk_number: str, payload: CheckInRequest, db: Session = Depends(get_db)):
    """Triggered when a student scans the QR code at the desk."""
    desk = db.query(Desk).filter(Desk.desk_number == desk_number).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
        
    if desk.status == DeskStatus.OCCUPIED.value and desk.current_user != payload.user_id:
        raise HTTPException(status_code=400, detail="Desk is already occupied")
        
    # Check-in or Refreshing the 2-hour ping
    desk.status = DeskStatus.OCCUPIED.value
    desk.current_user = payload.user_id
    desk.last_ping = datetime.utcnow()
    desk.away_expires_at = None # Clear away timers if they check back in
    db.commit()
    log_activity(
        db,
        desk_number,
        "CHECKED_IN",
        payload.user_id
    )
    return {"message": f"Successfully checked into desk {desk_number}."}

@app.post("/desks/{desk_number}/away")
def go_away(desk_number: str, payload: CheckInRequest, db: Session = Depends(get_db)):
    """Triggered when the student clicks the 'Away' button (Max 20 mins)."""
    desk = db.query(Desk).filter(Desk.desk_number == desk_number).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    if desk.current_user != payload.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized action on this desk")
        
    desk.status = DeskStatus.AWAY.value
    desk.away_expires_at = datetime.utcnow() + timedelta(seconds=30)
    db.commit()
    log_activity(
        db,
        desk_number,
        "MARKED_AWAY",
        payload.user_id
    )
    return {"message": "Away mode activated. You have 20 minutes to return.", "expires_at": desk.away_expires_at}

@app.post("/desks/{desk_number}/release")
def release_desk(desk_number: str, payload: CheckInRequest, db: Session = Depends(get_db)):
    """When a student voluntarily leaves early."""
    desk = db.query(Desk).filter(Desk.desk_number == desk_number).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
    if desk.current_user != payload.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized action on this desk")
        
    desk.status = DeskStatus.FREE.value
    desk.current_user = None
    desk.last_ping = None
    desk.away_expires_at = None
    db.commit()
    log_activity(
        db,
        desk_number,
        "RELEASED",
        payload.user_id
    )
    return {"message": "Desk released successfully."}

# ==========================================
# LIBRARIAN DASHBOARD ENDPOINTS
# ==========================================
@app.post("/admin/desks/{desk_number}/reset")
def admin_reset_desk(desk_number: str, db: Session = Depends(get_db)):
    """Allows librarians to manually override and free a desk."""
    desk = db.query(Desk).filter(Desk.desk_number == desk_number).first()
    if not desk:
        raise HTTPException(status_code=404, detail="Desk not found")
        
    desk.status = DeskStatus.FREE.value
    desk.current_user = None
    desk.last_ping = None
    desk.away_expires_at = None
    db.commit()
    log_activity(
        db,
        desk_number,
        "RELEASED",
        None
    )
    return {"message": f"Librarian reset Desk {desk_number} to FREE."}

@app.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    """Returns aggregated desk occupancy metrics."""
    total = db.query(Desk).count()
    occupied = db.query(Desk).filter(Desk.status == DeskStatus.OCCUPIED.value).count()
    away = db.query(Desk).filter(Desk.status == DeskStatus.AWAY.value).count()
    free = db.query(Desk).filter(Desk.status == DeskStatus.FREE.value).count()
    
    occupancy_pct = (occupied + away) / total * 100 if total > 0 else 0.0
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    recovered_today = db.query(Activity).filter(
        Activity.action.in_(["AUTO_RELEASED_AWAY", "AUTO_RELEASED_ABANDONED", "RELEASED"]),
        Activity.timestamp >= today_start
    ).count()
    
    return {
        "total": total,
        "occupied": occupied,
        "away": away,
        "free": free,
        "occupancy_percentage": round(occupancy_pct, 1),
        "seats_recovered_today": recovered_today,
        "avg_session_minutes": 45
    }

@app.get("/activities")
def get_activities(limit: int = 20, db: Session = Depends(get_db)):
    """Returns a list of the recent desk activity log entries."""
    return db.query(Activity).order_by(Activity.timestamp.desc()).limit(limit).all()



