# Quick Start: Testing & Deployment Guide

## 📋 Pre-Migration Checklist

Before testing, ensure:

- [ ] Backend is running on `http://127.0.0.1:8000`
- [ ] Backend endpoints are working (verify with curl or Postman):
  - [ ] `GET /desks` - returns list of desk objects
  - [ ] `GET /activities` - returns list of activity objects
  - [ ] `GET /statistics` - returns analytics data (optional)

---

## 🚀 Deployment Steps

### Step 1: Install API Client Module

**File: `src/api/apiClient.js`** - Already created ✓

### Step 2: Update Main App

**File: `src/App.jsx`** - Already updated ✓

- Imports apiClient
- Fetches data on mount
- Makes API calls for desk operations

### Step 3: Update Admin Page

**File: `src/pages/AdminDashboard.jsx`** - Already updated ✓

- Fetches analytics from backend
- Falls back to default data if needed

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Start Backend Server

```bash
# From backend folder
python main.py
# or
python -m uvicorn main:app --reload
```

---

## ✅ Testing Checklist

### Phase 1: App Startup

1. Open browser to `http://localhost:5173` (Vite dev server)
2. Wait for page to load (should show "Loading dashboard data...")
3. Verify no error messages appear
4. Dashboard should display with:
   - ✓ Total Desks count
   - ✓ Occupied count
   - ✓ Available count
   - ✓ Away/Reserving count
   - ✓ Occupancy percentage

**Expected Result:** Dashboard shows real data from backend

---

### Phase 2: Dashboard Page

1. Navigate to Dashboard (should be default)
2. Verify all KPI cards are visible:
   - [ ] Total Desks (should be 50)
   - [ ] Occupied (should match API response)
   - [ ] Available Free (should match API response)
   - [ ] Away/Reserving (should match API response)
   - [ ] Occupancy Rate % (should match calculation)

3. Verify Activity Feed shows real data:
   - [ ] At least 6 activities visible
   - [ ] Activities show "Just now", "10 mins ago", etc.
   - [ ] Each activity has: deskId, studentName, action, time

4. Test Quick Desk Finder:
   - [ ] Type "5" in search → Shows desks with 5 in number
   - [ ] Type "Quiet" in search → Shows Quiet Study zone desks
   - [ ] Click on desk → Navigates to LibraryMap with desk selected

**Expected Result:** All real data from backend displayed correctly

---

### Phase 3: Library Map Page

1. Click "Library Map" navigation
2. Verify desk grid displays:
   - [ ] 4 zones visible (Quiet Study, Collaboration, PC Lab, Window)
   - [ ] Desks colored by status:
     - ✓ Green = Free
     - ✓ Red = Occupied
     - ✓ Yellow = Away
   - [ ] Desk numbers shown (01-50)
   - [ ] Zone headers show "X / Y available"

3. Test Desk Selection:
   - [ ] Click a free desk (green) → Detail panel opens
   - [ ] Click occupied desk (red) → Shows student info
   - [ ] Click away desk (yellow) → Shows away status

4. Test Detail Panel - Free Desk:
   - [ ] Shows "Free" status badge
   - [ ] Shows check-in form
   - [ ] Can enter student name
   - [ ] Can optionally enter student ID
   - [ ] Click "Confirm Check-in" → API call made ✓

5. Test Detail Panel - Occupied Desk:
   - [ ] Shows student information
   - [ ] Shows check-in time
   - [ ] Shows "Mark Away" button
   - [ ] Shows "Check Out / Release" button

6. Test Desk Operations:
   - [ ] Check in to free desk → Desk turns red, activity log updates
   - [ ] Mark as away → Desk turns yellow, activity log updates
   - [ ] Release desk → Desk turns green, activity log updates

**Expected Result:** All desk operations work with real API calls

---

### Phase 4: Admin Dashboard

1. Click "Admin Dashboard" navigation
2. Verify page displays:
   - [ ] Three summary highlight cards appear
   - [ ] Analytics chart area visible

3. Verify Weekly Utilization Chart:
   - [ ] X-axis shows days (Mon-Sun)
   - [ ] Y-axis shows utilization rates
   - [ ] Bars render correctly
   - [ ] Uses either API data or fallback data

4. Verify Peak Hours Chart:
   - [ ] X-axis shows times (08:00 AM - 10:00 PM)
   - [ ] Y-axis shows percentage
   - [ ] Line chart renders correctly
   - [ ] Uses either API data or fallback data

5. Verify Away Desks Table:
   - [ ] Shows desks with status "away"
   - [ ] If desks away, shows: Desk #, Zone, Student, Duration, Warning
   - [ ] If no away desks, shows "No desks are currently in Away status"
   - [ ] "Release Desk" buttons work
   - [ ] Clicking release changes desk to "free"

**Expected Result:** Admin features work, analytics display correctly

---

## 🐛 Troubleshooting

### Issue: "Loading dashboard data..." stays forever

**Solution:**

1. Check browser console (F12) for errors
2. Verify backend is running: `curl http://127.0.0.1:8000/desks`
3. Check backend logs for errors
4. Ensure backend is on port 8000

### Issue: Red error message about backend not running

**Solution:**

1. Start backend: `python main.py` (from backend directory)
2. Verify it's on http://127.0.0.1:8000
3. Refresh browser

### Issue: Desk operations not working

**Solution:**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try desk operation
4. Check if POST request was made
5. Check response status and body
6. Verify API endpoint path matches backend

### Issue: Charts not displaying on Admin page

**Solution:**

1. Check if `/statistics` endpoint exists
2. Verify response format matches expected shape
3. Check browser console for fetch errors
4. Fallback data should display if API fails

### Issue: Activity log not updating

**Solution:**

1. Check if `/activities` endpoint returns data
2. Verify activity objects have: id, deskId, studentName, action, time
3. Check browser console for transformation errors

---

## 📊 API Response Format Check

To verify backend responses are correct format, test with curl:

### Test 1: Get Desks

```bash
curl http://127.0.0.1:8000/desks
```

Expected: Array of desk objects with fields: desk_number/id, zone, status, student_name, student_id, check_in_time, last_active

### Test 2: Get Activities

```bash
curl http://127.0.0.1:8000/activities
```

Expected: Array of activity objects with fields: id, desk_id, student_name, action, time

### Test 3: Get Statistics

```bash
curl http://127.0.0.1:8000/statistics
```

Expected: Object with: peak_hours (array) and weekly_utilization (array)

### Test 4: Check In Desk

```bash
curl -X POST http://127.0.0.1:8000/desks/1/checkin \
  -H "Content-Type: application/json" \
  -d '{"student_name":"John","student_id":"STU-1234"}'
```

Expected: Updated desk object with status="occupied"

---

## 🎯 Success Criteria

✅ **Migration Successful If:**

1. App loads without JavaScript errors
2. All three pages (Dashboard, Map, Admin) display correctly
3. Desk counts are > 0
4. Activity feed shows real entries
5. Desk operations (check-in, away, release) work
6. Activities update in real-time after operations
7. Analytics charts display on admin page
8. Browser Network tab shows:
   - GET /desks
   - GET /activities
   - GET /statistics
   - POST /desks/{id}/checkin, etc.

---

## 🔧 Configuration

### Change Backend URL

If backend is on different URL, edit `src/api/apiClient.js` line 3:

**Current:**

```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

**Change to:**

```javascript
const API_BASE_URL = "http://your-backend-url:port";
```

Then restart dev server.

---

## 📝 Notes

- mockData.js is still in codebase but not imported
- Can be deleted after confirming migration works
- No database needed for frontend (uses backend API)
- Styling and UI are 100% unchanged
- All component interfaces are the same

---

## ✨ Post-Migration Cleanup (Optional)

After confirming everything works, you can delete:

- `src/data/mockData.js` - No longer used

Or keep it as a reference for fallback data structure.

---

## 📞 Support

If issues arise:

1. Check troubleshooting section above
2. Review MIGRATION_AUDIT.md for expected data structures
3. Check CODE_CHANGES_REFERENCE.md for exact implementation
4. Verify backend endpoints with curl
5. Check browser DevTools Network and Console tabs
