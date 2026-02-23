const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { v4: uuidv4 } = require('uuid');

// Haversine distance in meters
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// GET attendance records with rich filters
router.get('/', (req, res) => {
  const db = getDb();
  const { store_id, employee_id, date, date_from, date_to, status, shift_id } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let query = `
    SELECT ar.*, e.name as employee_name, e.role, e.type as employee_type,
           s.name as store_name, sh.name as shift_name, sh.start_time, sh.end_time
    FROM attendance_records ar
    JOIN employees e ON ar.employee_id = e.id
    JOIN stores s ON ar.store_id = s.id
    JOIN shifts sh ON ar.shift_id = sh.id
    WHERE 1=1
  `;
  const params = [];

  if (date) { query += ' AND ar.attendance_date = ?'; params.push(date); }
  else if (date_from && date_to) { query += ' AND ar.attendance_date BETWEEN ? AND ?'; params.push(date_from, date_to); }
  else { query += ' AND ar.attendance_date = ?'; params.push(today); }

  if (store_id) { query += ' AND ar.store_id = ?'; params.push(store_id); }
  if (employee_id) { query += ' AND ar.employee_id = ?'; params.push(employee_id); }
  if (status) { query += ' AND ar.status = ?'; params.push(status); }
  if (shift_id) { query += ' AND ar.shift_id = ?'; params.push(shift_id); }

  query += ' ORDER BY ar.attendance_date DESC, ar.check_in_time DESC';
  res.json(db.prepare(query).all(...params));
});

// GET today's summary for a store (manager dashboard data)
router.get('/summary/store/:store_id', (req, res) => {
  const db = getDb();
  const { date } = req.query;
  const today = date || new Date().toISOString().split('T')[0];
  const storeId = req.params.store_id;

  // Get all employees for store
  const employees = db.prepare('SELECT * FROM employees WHERE store_id = ? AND is_active = 1').all(storeId);

  // Get attendance for today
  const records = db.prepare(`
    SELECT ar.*, e.name as employee_name, e.role, sh.name as shift_name, sh.start_time, sh.end_time
    FROM attendance_records ar
    JOIN employees e ON ar.employee_id = e.id
    JOIN shifts sh ON ar.shift_id = sh.id
    WHERE ar.store_id = ? AND ar.attendance_date = ?
  `).all(storeId, today);

  // Get manpower plans
  const plans = db.prepare(`
    SELECT mp.*, sh.name as shift_name, sh.start_time, sh.end_time
    FROM manpower_plans mp
    JOIN shifts sh ON mp.shift_id = sh.id
    WHERE mp.store_id = ? AND mp.plan_date = ?
  `).all(storeId, today);

  const shifts = db.prepare('SELECT * FROM shifts WHERE store_id = ? ORDER BY start_time').all(storeId);

  // Find employees not yet checked in
  const checkedInIds = new Set(records.map(r => r.employee_id));
  const notCheckedIn = employees.filter(e => !checkedInIds.has(e.id));

  // Summary by role
  const roles = ['Store Manager', 'Shift Supervisor', 'Meat Technician'];
  const roleSummary = roles.map(role => {
    const planned = plans.filter(p => p.role === role).reduce((sum, p) => sum + p.planned_count, 0);
    const present = records.filter(r => r.role === role && ['Present', 'Late'].includes(r.status)).length;
    const absent = records.filter(r => r.role === role && r.status === 'Absent').length;
    const late = records.filter(r => r.role === role && r.status === 'Late').length;
    return { role, planned, present, absent, late, notCheckedIn: employees.filter(e => e.role === role && !checkedInIds.has(e.id)).length };
  });

  // Summary by shift
  const shiftSummary = shifts.map(shift => {
    const planned = plans.filter(p => p.shift_id === shift.id).reduce((sum, p) => sum + p.planned_count, 0);
    const shiftRecords = records.filter(r => r.shift_id === shift.id);
    const present = shiftRecords.filter(r => ['Present', 'Late'].includes(r.status)).length;
    const pct = planned > 0 ? Math.round((present / planned) * 100) : 0;
    const status = pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red';
    return { ...shift, planned, present, late: shiftRecords.filter(r => r.status === 'Late').length, pct, status };
  });

  res.json({
    date: today,
    store_id: storeId,
    totalEmployees: employees.length,
    totalPresent: records.filter(r => ['Present', 'Late'].includes(r.status)).length,
    totalAbsent: records.filter(r => r.status === 'Absent').length,
    totalLate: records.filter(r => r.status === 'Late').length,
    totalEarlyExit: records.filter(r => r.status === 'Early Exit').length,
    notCheckedInCount: notCheckedIn.length,
    records,
    notCheckedIn,
    roleSummary,
    shiftSummary,
    plans
  });
});

// GET central ops dashboard - all stores summary
router.get('/summary/ops', (req, res) => {
  const db = getDb();
  const { date, date_from, date_to, store_id } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let dateFilter = '';
  let dateParams = [];
  if (date) { dateFilter = 'AND ar.attendance_date = ?'; dateParams = [date]; }
  else if (date_from && date_to) { dateFilter = 'AND ar.attendance_date BETWEEN ? AND ?'; dateParams = [date_from, date_to]; }
  else { dateFilter = 'AND ar.attendance_date = ?'; dateParams = [today]; }

  let planDateFilter = dateFilter.replace(/ar\.attendance_date/g, 'mp.plan_date');

  const storeFilter = store_id ? 'AND s.id = ?' : '';
  const storeParams = store_id ? [store_id] : [];

  const stores = db.prepare(`SELECT * FROM stores ${store_id ? 'WHERE id = ?' : ''} ORDER BY city, name`).all(...storeParams);

  const summary = stores.map(store => {
    const records = db.prepare(`
      SELECT ar.*, e.role FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      WHERE ar.store_id = ? ${dateFilter}
    `).all(store.id, ...dateParams);

    const plans = db.prepare(`
      SELECT * FROM manpower_plans mp WHERE mp.store_id = ? ${planDateFilter}
    `).all(store.id, ...dateParams);

    const totalPlanned = plans.reduce((s, p) => s + p.planned_count, 0);
    const totalPresent = records.filter(r => ['Present', 'Late'].includes(r.status)).length;
    const totalLate = records.filter(r => r.status === 'Late').length;
    const totalEarlyExit = records.filter(r => r.status === 'Early Exit').length;
    const totalAbsent = records.filter(r => r.status === 'Absent').length;
    const compliance = totalPlanned > 0 ? Math.round((totalPresent / totalPlanned) * 100) : 0;
    const statusColor = compliance >= 80 ? 'green' : compliance >= 50 ? 'amber' : 'red';

    const roles = ['Store Manager', 'Shift Supervisor', 'Meat Technician'];
    const roleSummary = roles.map(role => ({
      role,
      planned: plans.filter(p => p.role === role).reduce((s, p) => s + p.planned_count, 0),
      present: records.filter(r => r.role === role && ['Present', 'Late'].includes(r.status)).length
    }));

    return {
      store,
      totalPlanned,
      totalPresent,
      totalLate,
      totalEarlyExit,
      totalAbsent,
      compliance,
      statusColor,
      roleSummary
    };
  });

  // Aggregate totals
  const aggregate = {
    totalPlanned: summary.reduce((s, x) => s + x.totalPlanned, 0),
    totalPresent: summary.reduce((s, x) => s + x.totalPresent, 0),
    totalLate: summary.reduce((s, x) => s + x.totalLate, 0),
    totalEarlyExit: summary.reduce((s, x) => s + x.totalEarlyExit, 0),
    totalAbsent: summary.reduce((s, x) => s + x.totalAbsent, 0),
  };
  aggregate.compliance = aggregate.totalPlanned > 0
    ? Math.round((aggregate.totalPresent / aggregate.totalPlanned) * 100)
    : 0;

  res.json({ stores: summary, aggregate, dateRange: { date, date_from, date_to, today } });
});

// POST check-in
router.post('/checkin', (req, res) => {
  const db = getDb();
  const { employee_id, lat, lng, login_method, shift_id } = req.body;

  if (!employee_id || lat === undefined || lng === undefined || !login_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emp = db.prepare(`
    SELECT e.*, s.lat as store_lat, s.lng as store_lng, s.geofence_radius
    FROM employees e JOIN stores s ON e.store_id = s.id
    WHERE e.id = ?
  `).get(employee_id);

  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  // Geofence check
  const distance = haversineDistance(lat, lng, emp.store_lat, emp.store_lng);
  if (distance > emp.geofence_radius) {
    return res.status(403).json({
      error: 'Outside geofence',
      message: `You are ${Math.round(distance)}m away from your store. Must be within ${emp.geofence_radius}m.`,
      distance: Math.round(distance),
      required: emp.geofence_radius
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date = ?').get(employee_id, today);
  if (existing && existing.check_in_time) {
    return res.status(409).json({ error: 'Already checked in today', record: existing });
  }

  // Determine shift
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);

  let resolvedShiftId = shift_id;
  if (!resolvedShiftId) {
    const activeShift = db.prepare('SELECT * FROM shifts WHERE store_id = ? AND ? >= start_time AND ? <= end_time').get(emp.store_id, timeStr, timeStr);
    resolvedShiftId = activeShift?.id;
  }

  if (!resolvedShiftId) {
    // Allow check-in to upcoming shift (within 30 min window)
    const upcoming = db.prepare("SELECT * FROM shifts WHERE store_id = ? AND start_time > ? ORDER BY start_time LIMIT 1").get(emp.store_id, timeStr);
    if (upcoming) {
      const startMins = timeToMinutes(upcoming.start_time);
      const nowMins = timeToMinutes(timeStr);
      if (startMins - nowMins <= 30) resolvedShiftId = upcoming.id;
    }
  }

  if (!resolvedShiftId) {
    return res.status(400).json({ error: 'No active or upcoming shift found for check-in at this time' });
  }

  const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(resolvedShiftId);
  const checkInMins = timeToMinutes(timeStr);
  const shiftStartMins = timeToMinutes(shift.start_time);
  const isLate = checkInMins > shiftStartMins + 15;
  const status = isLate ? 'Late' : 'Present';

  const checkInTime = now.toISOString();
  const recId = existing ? existing.id : `att-${uuidv4().slice(0, 8)}`;

  if (existing) {
    db.prepare('UPDATE attendance_records SET check_in_time=?, login_method=?, check_in_lat=?, check_in_lng=?, status=?, shift_id=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(checkInTime, login_method, lat, lng, status, resolvedShiftId, existing.id);
  } else {
    db.prepare('INSERT INTO attendance_records (id, employee_id, store_id, shift_id, check_in_time, login_method, check_in_lat, check_in_lng, status, attendance_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(recId, employee_id, emp.store_id, resolvedShiftId, checkInTime, login_method, lat, lng, status, today);
  }

  res.json({ success: true, status, isLate, shiftName: shift.name, checkInTime });
});

// POST check-out
router.post('/checkout', (req, res) => {
  const db = getDb();
  const { employee_id } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'employee_id required' });

  const today = new Date().toISOString().split('T')[0];
  const record = db.prepare('SELECT ar.*, sh.end_time FROM attendance_records ar JOIN shifts sh ON ar.shift_id = sh.id WHERE ar.employee_id = ? AND ar.attendance_date = ?').get(employee_id, today);

  if (!record) return res.status(404).json({ error: 'No check-in record found for today' });
  if (record.check_out_time) return res.status(409).json({ error: 'Already checked out' });

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  const shiftEndMins = timeToMinutes(record.end_time);
  const nowMins = timeToMinutes(timeStr);
  const isEarlyExit = nowMins < shiftEndMins - 15;

  const newStatus = isEarlyExit ? 'Early Exit' : record.status;
  const checkOutTime = now.toISOString();

  db.prepare("UPDATE attendance_records SET check_out_time=?, status=?, updated_at=datetime('now') WHERE id=?")
    .run(checkOutTime, newStatus, record.id);

  res.json({ success: true, isEarlyExit, status: newStatus, checkOutTime });
});

// POST OTP send
router.post('/otp/send', (req, res) => {
  const db = getDb();
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });

  const emp = db.prepare('SELECT id FROM employees WHERE phone = ? AND is_active = 1').get(phone);
  if (!emp) return res.status(404).json({ error: 'Phone number not registered' });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const id = uuidv4();

  db.prepare("DELETE FROM otp_sessions WHERE phone = ?").run(phone);
  db.prepare("INSERT INTO otp_sessions (id, phone, otp, expires_at) VALUES (?, ?, ?, ?)").run(id, phone, otp, expiresAt);

  // In production this would send SMS. For demo, return in response.
  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ success: true, message: 'OTP sent', otp_demo: otp }); // Remove otp_demo in production
});

// POST OTP verify
router.post('/otp/verify', (req, res) => {
  const db = getDb();
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' });

  const session = db.prepare("SELECT * FROM otp_sessions WHERE phone = ? AND used = 0 ORDER BY created_at DESC LIMIT 1").get(phone);
  if (!session) return res.status(401).json({ error: 'No active OTP session' });
  if (new Date(session.expires_at) < new Date()) return res.status(401).json({ error: 'OTP expired' });
  if (session.otp !== String(otp)) return res.status(401).json({ error: 'Invalid OTP' });

  db.prepare("UPDATE otp_sessions SET used = 1 WHERE id = ?").run(session.id);

  const emp = db.prepare(`
    SELECT e.*, s.name as store_name, s.lat as store_lat, s.lng as store_lng,
           s.geofence_radius, s.city, s.address
    FROM employees e JOIN stores s ON e.store_id = s.id
    WHERE e.phone = ?
  `).get(phone);

  res.json({ success: true, employee: emp });
});

// POST manual override
router.post('/override', (req, res) => {
  const db = getDb();
  const { employee_id, date, status, reason, override_by, shift_id } = req.body;
  if (!employee_id || !status || !reason || !override_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const today = date || new Date().toISOString().split('T')[0];
  const existing = db.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date = ?').get(employee_id, today);

  if (existing) {
    db.prepare("UPDATE attendance_records SET status=?, is_override=1, override_reason=?, override_by=?, updated_at=datetime('now') WHERE id=?")
      .run(status, reason, override_by, existing.id);
  } else {
    const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
    const resolvedShift = shift_id || db.prepare('SELECT id FROM shifts WHERE store_id = ? LIMIT 1').get(emp?.store_id)?.id;
    const id = `att-${uuidv4().slice(0, 8)}`;
    db.prepare('INSERT INTO attendance_records (id, employee_id, store_id, shift_id, status, is_override, override_reason, override_by, attendance_date) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)')
      .run(id, employee_id, emp.store_id, resolvedShift, status, reason, override_by, today);
  }

  res.json({ success: true });
});

// GET export data
router.get('/export', (req, res) => {
  const db = getDb();
  const { store_id, date, date_from, date_to } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let query = `
    SELECT ar.attendance_date as "Date",
           e.name as "Employee Name", e.role as "Role", e.type as "Type",
           s.name as "Store", s.city as "City",
           sh.name as "Shift", sh.start_time as "Shift Start", sh.end_time as "Shift End",
           ar.check_in_time as "Check-In Time", ar.check_out_time as "Check-Out Time",
           ar.login_method as "Login Method", ar.status as "Status",
           ar.is_override as "Manual Override", ar.override_reason as "Override Reason"
    FROM attendance_records ar
    JOIN employees e ON ar.employee_id = e.id
    JOIN stores s ON ar.store_id = s.id
    JOIN shifts sh ON ar.shift_id = sh.id
    WHERE 1=1
  `;
  const params = [];

  if (date) { query += ' AND ar.attendance_date = ?'; params.push(date); }
  else if (date_from && date_to) { query += ' AND ar.attendance_date BETWEEN ? AND ?'; params.push(date_from, date_to); }
  else { query += ' AND ar.attendance_date = ?'; params.push(today); }

  if (store_id) { query += ' AND ar.store_id = ?'; params.push(store_id); }
  query += ' ORDER BY ar.attendance_date, s.name, e.role, e.name';

  const rows = db.prepare(query).all(...params);

  // CSV conversion
  if (rows.length === 0) return res.json([]);
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="attendance-${today}.csv"`);
  res.send(csv);
});

module.exports = router;
