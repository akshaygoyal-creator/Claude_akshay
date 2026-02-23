const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { v4: uuidv4 } = require('uuid');

// GET shifts (optionally by store)
router.get('/', (req, res) => {
  const db = getDb();
  const { store_id } = req.query;
  let query = `SELECT sh.*, s.name as store_name FROM shifts sh JOIN stores s ON sh.store_id = s.id`;
  const params = [];
  if (store_id) { query += ' WHERE sh.store_id = ?'; params.push(store_id); }
  query += ' ORDER BY sh.start_time';
  res.json(db.prepare(query).all(...params));
});

// GET current/active shift for a store
router.get('/current/:store_id', (req, res) => {
  const db = getDb();
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5); // HH:MM
  const shifts = db.prepare(`
    SELECT * FROM shifts WHERE store_id = ? ORDER BY start_time
  `).all(req.params.store_id);

  const active = shifts.filter(s => s.start_time <= timeStr && timeStr <= s.end_time);
  const upcoming = shifts.filter(s => s.start_time > timeStr).slice(0, 1);

  res.json({ active, upcoming, all: shifts });
});

// GET shift for an employee (based on their store)
router.get('/employee/:employee_id', (req, res) => {
  const db = getDb();
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.employee_id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  const shifts = db.prepare('SELECT * FROM shifts WHERE store_id = ? ORDER BY start_time').all(emp.store_id);

  // Find shift window: can check in 30 min before shift starts
  const assignedShift = shifts.find(s => {
    const startMinus30 = subtractMinutes(s.start_time, 30);
    return timeStr >= startMinus30 && timeStr <= s.end_time;
  });

  res.json({
    assignedShift: assignedShift || null,
    allShifts: shifts,
    currentTime: timeStr
  });
});

function subtractMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m - mins;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(Math.max(0, nh)).padStart(2, '0')}:${String(Math.max(0, nm)).padStart(2, '0')}`;
}

// POST create shift
router.post('/', (req, res) => {
  const db = getDb();
  const { name, start_time, end_time, store_id } = req.body;
  if (!name || !start_time || !end_time || !store_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = `shift-${uuidv4().slice(0, 8)}`;
  db.prepare('INSERT INTO shifts (id, name, start_time, end_time, store_id) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, start_time, end_time, store_id);
  res.status(201).json({ id, name, start_time, end_time, store_id });
});

module.exports = router;
