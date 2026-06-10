# Licious Retail Stores — Attendance Management System

A full-stack, real-time attendance tracking system that measures actual employee attendance against planned manpower across all stores.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Backend   | Node.js · Express · TypeScript · Prisma ORM |
| Database  | SQLite (swap `DATABASE_URL` for PostgreSQL/MySQL in production) |
| Real-time | Socket.io |
| Frontend  | React · TypeScript · Tailwind CSS · Recharts |
| Export    | xlsx library (XLSX + CSV) |

---

## Quick Start

### 1 — Install dependencies
```bash
cd backend  && npm install
cd frontend && npm install
```

### 2 — Configure environment
```bash
cp backend/.env.example backend/.env
# Defaults work out of the box for local dev
```

### 3 — Bootstrap the database
```bash
cd backend
npm run db:generate   # generate Prisma client
npm run db:push       # create SQLite tables
npm run db:seed       # seed stores, shifts, employees, manpower plans + sample attendance
```

### 4 — Start both servers
```bash
# Terminal 1 — API on :5000
cd backend && npm run dev

# Terminal 2 — UI on :3000
cd frontend && npm start
```

Open **http://localhost:3000**

---

## Demo Credentials  (password: `Licious@123` for all)

| Role | Email |
|------|-------|
| Ops Admin (STORE_MANAGER) | ops@licious.com |
| Store Manager — Indiranagar | mgr01.licblr001@licious.com |
| Shift Supervisor | sup01.licblr001@licious.com |
| Meat Technician | mt001.licblr001@licious.com |

---

## Feature Map

### Employee Mobile-First UI (`/employee`)
- GPS acquisition with clear error states and in-app Enable button
- **Geo-fence check**: Haversine distance against store coords + configurable radius — shows exact error message if outside
- Shift selector (Morning / Afternoon / Night) with current status pill
- **Login method**: OTP or Face Biometric (placeholder; wire to real face-recognition API via `auth.controller.ts → verifyFace`)
- **Late arrival** auto-flagged when check-in > 15 min after shift start
- **Early exit** auto-flagged when check-out before shift end time
- Attendance history tab (last 15 records)

### Store Manager / Supervisor Dashboard (`/manager`)
- Date picker — view any past or future date
- Summary cards: Planned / Present / Late / Absent
- Animated progress bar with GREEN / AMBER / RED traffic light
- **Shift accordion**: each shift shows % compliance + per-role breakdown (Manager / Supervisor / Technician)
- Employee list filterable by: All · Present · Absent · Late · Early Exit
- **Override modal**: select new status + mandatory reason — audit trail preserved (`overriddenBy`, `overrideReason`)
- Real-time updates via Socket.io (no refresh needed)

### Central Ops Dashboard (`/ops`)
- **3 view modes**: Cards · Bar chart · Table
- **Date filters**: Today · This Week · This Month · Custom range
- Store dropdown filter
- Summary strip: Planned / Present / Late / Early Exit / Absent / % Compliance
- **Role-wise aggregate** (Store Managers / Supervisors / Technicians) across all stores
- Store cards with per-role progress bars and traffic light
- **Export**: XLSX (two sheets: Attendance + Summary) and CSV — respects all active filters
- Real-time updates via Socket.io

---

## API Reference

### Auth
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/otp/send` | Public |
| POST | `/api/auth/otp/verify` | Public |
| POST | `/api/auth/face/verify` | Public |
| GET  | `/api/auth/me` | Auth |

### Attendance
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/attendance/checkin` | Auth |
| POST | `/api/attendance/checkout` | Auth |
| GET  | `/api/attendance/today` | Auth |
| GET  | `/api/attendance/my` | Auth |
| PUT  | `/api/attendance/override/:id` | Manager / Supervisor |
| GET  | `/api/attendance/store/:storeId` | Manager / Supervisor |

### Dashboards
| Method | Path | Access |
|--------|------|--------|
| GET | `/api/dashboard/store/:storeId` | Manager / Supervisor |
| GET | `/api/dashboard/ops` | Auth |
| GET | `/api/dashboard/ops/range` | Auth |

### Reports
| Method | Path | Params |
|--------|------|--------|
| GET | `/api/reports/export` | `startDate`, `endDate`, `storeId?`, `format=xlsx\|csv` |

---

## Database Schema

```
Store          — id, storeCode, name, lat, lng, address, city, geofenceRadius
Employee       — id, employeeCode, name, email, phone, type, role, storeId, faceDataRef
Shift          — id, shiftCode, name, startTime, endTime, storeId
ManpowerPlan   — storeId + shiftId + role + date → plannedCount  (unique composite key)
AttendanceRecord — employeeId + shiftId + date → checkIn/Out, status, loginMethod, GPS  (unique)
OtpToken       — employeeId, otp, expiresAt, used
```

### Attendance Status Flow
```
ABSENT (default) → PRESENT (on-time check-in) → EARLY_EXIT (check-out before shift end)
               ↘ LATE (check-in > 15 min grace) → EARLY_EXIT
```

---

## Seeded Data

- **4 stores**: Indiranagar & Koramangala (Bangalore), Banjara Hills (Hyderabad), Andheri (Mumbai)
- **6 employees per store**: 1 Store Manager + 2 Supervisors + 3 Technicians (mix of Full/Part time)
- **3 shifts per store**: Morning 07–15 · Afternoon 15–23 · Night 23–07
- **Manpower plans**: today + 6 days ahead, 1+1+2 per role per shift per store
- **Sample attendance**: today's morning shift — Present + Late + Absent mix across all stores

---

## Face Biometric Integration

The `verifyFace` function in `backend/src/controllers/auth.controller.ts` contains a clearly marked stub:

```typescript
// ── Face recognition stub ──────────────────────────────────────────────
// Replace with: const match = await faceRecognitionService.compare(faceData, emp.faceDataRef);
const match = Math.random() > 0.08; // 92% success for demo
```

Replace with your preferred service (AWS Rekognition, Azure Face API, DeepFace, etc.) and store the reference embedding/ID in `employee.faceDataRef`.
