# Licious Retail — Attendance Management System

A full-stack real-time attendance management system for Licious Retail Stores, tracking employee attendance against planned manpower across all stores.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Routing | React Router v6 |

## Architecture

```
/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── database/
│   │   ├── schema.js          # SQLite schema + initialization
│   │   └── seed.js            # Sample data for 6 stores
│   └── routes/
│       ├── stores.js          # Store CRUD
│       ├── employees.js       # Employee CRUD + phone lookup
│       ├── shifts.js          # Shift management + current shift detection
│       ├── manpower.js        # Manpower plan CRUD
│       └── attendance.js      # Check-in/out, OTP, summary, export
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx         # Role selection
        │   ├── EmployeePage.jsx        # Employee attendance flow
        │   ├── ManagerDashboardPage.jsx
        │   └── OpsDashboardPage.jsx
        ├── components/
        │   ├── employee/
        │   │   ├── LoginScreen.jsx     # OTP + Face biometric login
        │   │   └── CheckInScreen.jsx   # Geofenced check-in/out
        │   ├── manager/
        │   │   ├── StoreDashboard.jsx  # Shift/role breakdown, employee list
        │   │   └── OverrideModal.jsx   # Manual attendance override
        │   ├── ops/
        │   │   ├── StoreCard.jsx       # Per-store compliance card
        │   │   ├── AggregateMetrics.jsx # Summary bar chart
        │   │   └── RoleBreakdown.jsx   # Cross-store role analysis
        │   └── shared/
        │       ├── StatusBadge.jsx
        │       └── ComplianceBar.jsx
        └── utils/
            ├── api.js          # Axios API client
            └── helpers.js      # Haversine geo, date/time formatters
```

## Quick Start

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Seed Database
```bash
cd backend && npm run seed
```
This creates 6 stores (Bangalore, Hyderabad, Chennai), 72 employees, shifts, manpower plans, and 7 days of historical attendance records.

### 3. Start Backend
```bash
cd backend && npm run dev
# API runs on http://localhost:3001
```

### 4. Start Frontend
```bash
cd frontend && npm run dev
# App runs on http://localhost:3000
```

## Features

### Employee Mobile UI (`/employee`)
- **OTP Login**: Enter phone number → receive 6-digit OTP → verify identity
- **Face Biometric Login**: Simulated face scan with identity confirmation
- **Geo-fenced Check-In**: Device GPS must be within 50m of assigned store
  - Clear error message if outside geofence with distance shown
- **Shift Awareness**: Shows current shift, flags late arrivals (>15 min)
- **Check-Out**: Flags early departures (>15 min before shift end)
- **Live Clock**: Real-time clock display

### Store Manager Dashboard (`/manager`)
- **Store Selector**: Switch between stores via top tab bar
- **Date Picker**: View any date's attendance
- **Summary Cards**: Compliance %, Present/Planned, Absent, Not Checked In
- **Shift View**: Per-shift compliance with green/amber/red indicators
- **Role View**: Store Manager / Shift Supervisor / Meat Technician breakdown
- **Employee List**: Filter by status (Present, Late, Absent, Early Exit)
- **Manual Override**: Change attendance status with mandatory reason logging
- **Auto-refresh**: Updates every 60 seconds

### Central Ops Dashboard (`/ops`)
- **Real-time Store Cards**: All stores with compliance color coding
- **Aggregate Metrics**: Total planned vs present, compliance %, late/absent/early-exit counts
- **Bar Chart**: Visual compliance across stores
- **Role Breakdown**: Cross-store analysis by role
- **Table View**: Sortable tabular view with totals row
- **Date Filters**: Today, Yesterday, This Week, This Month, Custom Range
- **Store Filter**: Drill down to individual store
- **CSV Export**: Full export with all filters applied
- **Auto-refresh**: Updates every 2 minutes

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List all stores |
| GET | `/api/employees?store_id=&role=` | List employees |
| GET | `/api/employees/lookup/phone/:phone` | Find employee by phone |
| GET | `/api/shifts/current/:store_id` | Active shift for store |
| GET | `/api/shifts/employee/:emp_id` | Assigned shift for employee |
| GET | `/api/manpower?store_id=&date=` | Manpower plans |
| POST | `/api/manpower/bulk` | Bulk upsert plans |
| GET | `/api/attendance?date=&store_id=&status=` | Attendance records |
| POST | `/api/attendance/checkin` | Employee check-in |
| POST | `/api/attendance/checkout` | Employee check-out |
| POST | `/api/attendance/otp/send` | Send OTP |
| POST | `/api/attendance/otp/verify` | Verify OTP + get employee |
| POST | `/api/attendance/override` | Manual override |
| GET | `/api/attendance/summary/store/:id` | Store dashboard data |
| GET | `/api/attendance/summary/ops` | All-stores ops data |
| GET | `/api/attendance/export` | CSV export |

## Database Schema

- **stores**: id, name, lat, lng, address, city, geofence_radius
- **employees**: id, name, type (Full-Time/Part-Time), role, store_id, phone, face_biometric_ref
- **shifts**: id, name, start_time, end_time, store_id
- **manpower_plans**: store_id, shift_id, role, planned_count, plan_date (unique constraint)
- **attendance_records**: employee_id, store_id, shift_id, check_in/out times, login_method, geo coords, status, override fields

## Compliance Logic

- **Green**: ≥ 80% planned headcount present
- **Amber**: 50–79% present
- **Red**: < 50% present

## Status Flags

- **Present**: Checked in within 15 min of shift start
- **Late**: Checked in more than 15 min after shift start
- **Early Exit**: Checked out more than 15 min before shift end
- **Absent**: No check-in recorded
