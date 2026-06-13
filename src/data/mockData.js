// src/data/mockData.js

export const INITIAL_DESKS = Array.from({ length: 50 }, (_, index) => {
  const id = index + 1;
  let zone = 'Quiet Study';
  if (id > 15 && id <= 30) zone = 'Collaboration Area';
  else if (id > 30 && id <= 40) zone = 'PC Lab';
  else if (id > 40) zone = 'Window View';

  // Seed status to make the dashboard look active and realistic
  let status = 'free';
  let studentName = null;
  let studentId = null;
  let checkInTime = null;
  let lastActive = null;

  // Occupied desks
  const occupiedIds = [2, 5, 8, 9, 14, 18, 20, 22, 25, 29, 32, 33, 36, 42, 45, 47, 49];
  // Away desks (some recently away, some abandoned for long)
  const awayIds = [4, 11, 19, 27, 35, 44, 50];

  if (occupiedIds.includes(id)) {
    status = 'occupied';
    const names = [
      'Liam Carter', 'Emma Watson', 'Noah Davis', 'Olivia Martinez', 'Sophia Vance',
      'James Miller', 'Isabella Garcia', 'Lucas Rodriguez', 'Mia Chen', 'Alexander Kim',
      'Charlotte Brooks', 'Ethan Hunt', 'Amelia Rose', 'Benjamin Cole', 'Harper Lee',
      'Daniel Park', 'Ava Vance'
    ];
    const studentIdx = occupiedIds.indexOf(id) % names.length;
    studentName = names[studentIdx];
    studentId = `STU-${8000 + id * 13}`;
    checkInTime = `${8 + (id % 4)}:${(id * 7) % 60 < 10 ? '0' : ''}${(id * 7) % 60} AM`;
    lastActive = `${(id % 15) + 1} mins ago`;
  } else if (awayIds.includes(id)) {
    status = 'away';
    const names = [
      'Evelyn Moore', 'Mason Taylor', 'Harper Lewis', 'Logan Wright', 
      'Avery Scott', 'Sebastian Hill', 'Ella Green'
    ];
    const studentIdx = awayIds.indexOf(id) % names.length;
    studentName = names[studentIdx];
    studentId = `STU-${9000 + id * 17}`;
    checkInTime = `${9 + (id % 3)}:${(id * 9) % 60 < 10 ? '0' : ''}${(id * 9) % 60} AM`;
    
    // Set some desks as "recently abandoned" (>30 minutes away)
    // We'll store an "awaySinceMinutes" value or relative text
    const awayMinutesList = [12, 35, 8, 48, 15, 42, 5];
    const mins = awayMinutesList[awayIds.indexOf(id) % awayMinutesList.length];
    lastActive = `${mins} mins away`;
  }

  return {
    id,
    zone,
    status,
    studentName,
    studentId,
    checkInTime,
    lastActive
  };
});

export const PEAK_USAGE_HOURS = [
  { hour: '08:00 AM', percentage: 25 },
  { hour: '10:00 AM', percentage: 55 },
  { hour: '12:00 PM', percentage: 78 },
  { hour: '02:00 PM', percentage: 88 },
  { hour: '04:00 PM', percentage: 84 },
  { hour: '06:00 PM', percentage: 70 },
  { hour: '08:00 PM', percentage: 45 },
  { hour: '10:00 PM', percentage: 15 }
];

export const WEEKLY_UTILIZATION = [
  { day: 'Mon', rate: 72 },
  { day: 'Tue', rate: 78 },
  { day: 'Wed', rate: 85 },
  { day: 'Thu', rate: 81 },
  { day: 'Fri', rate: 64 },
  { day: 'Sat', rate: 45 },
  { day: 'Sun', rate: 38 }
];

export const INITIAL_ACTIVITIES = [
  { id: 1, deskId: 14, studentName: 'Sophia Vance', action: 'Checked in', time: '10 mins ago' },
  { id: 2, deskId: 35, studentName: 'Avery Scott', action: 'Marked Away', time: '15 mins ago' },
  { id: 3, deskId: 8, studentName: 'Noah Davis', action: 'Checked in', time: '28 mins ago' },
  { id: 4, deskId: 27, studentName: 'Logan Wright', action: 'Left desk (Away)', time: '48 mins ago' },
  { id: 5, deskId: 22, studentName: 'Lucas Rodriguez', action: 'Checked in', time: '1 hr ago' },
  { id: 6, deskId: 11, studentName: 'Mason Taylor', action: 'Left desk (Away)', time: '35 mins ago' }
];
