const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'attendance.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      geofence_radius INTEGER DEFAULT 50,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Part-Time', 'Full-Time')),
      role TEXT NOT NULL CHECK(role IN ('Store Manager', 'Shift Supervisor', 'Meat Technician')),
      store_id TEXT NOT NULL REFERENCES stores(id),
      phone TEXT NOT NULL UNIQUE,
      face_biometric_ref TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      store_id TEXT NOT NULL REFERENCES stores(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS manpower_plans (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES stores(id),
      shift_id TEXT NOT NULL REFERENCES shifts(id),
      role TEXT NOT NULL CHECK(role IN ('Store Manager', 'Shift Supervisor', 'Meat Technician')),
      planned_count INTEGER NOT NULL DEFAULT 0,
      plan_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(store_id, shift_id, role, plan_date)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      store_id TEXT NOT NULL REFERENCES stores(id),
      shift_id TEXT NOT NULL REFERENCES shifts(id),
      check_in_time TEXT,
      check_out_time TEXT,
      login_method TEXT CHECK(login_method IN ('Face Biometric', 'OTP')),
      check_in_lat REAL,
      check_in_lng REAL,
      status TEXT NOT NULL DEFAULT 'Absent' CHECK(status IN ('Present', 'Late', 'Absent', 'Early Exit')),
      is_override INTEGER DEFAULT 0,
      override_reason TEXT,
      override_by TEXT,
      attendance_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(employee_id, attendance_date)
    );

    CREATE TABLE IF NOT EXISTS otp_sessions (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(attendance_date);
    CREATE INDEX IF NOT EXISTS idx_attendance_store ON attendance_records(store_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
    CREATE INDEX IF NOT EXISTS idx_manpower_date ON manpower_plans(plan_date);
  `);
}

module.exports = { getDb };
