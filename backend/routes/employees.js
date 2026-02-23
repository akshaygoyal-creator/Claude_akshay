const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { v4: uuidv4 } = require('uuid');

// GET all employees (with optional store filter)
router.get('/', (req, res) => {
  const db = getDb();
  const { store_id, role } = req.query;
  let query = `
    SELECT e.*, s.name as store_name, s.city
    FROM employees e
    JOIN stores s ON e.store_id = s.id
    WHERE e.is_active = 1
  `;
  const params = [];
  if (store_id) { query += ' AND e.store_id = ?'; params.push(store_id); }
  if (role) { query += ' AND e.role = ?'; params.push(role); }
  query += ' ORDER BY e.role, e.name';
  res.json(db.prepare(query).all(...params));
});

// GET employee by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const emp = db.prepare(`
    SELECT e.*, s.name as store_name, s.lat as store_lat, s.lng as store_lng,
           s.geofence_radius, s.city
    FROM employees e
    JOIN stores s ON e.store_id = s.id
    WHERE e.id = ?
  `).get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(emp);
});

// GET employee by phone (for login)
router.get('/lookup/phone/:phone', (req, res) => {
  const db = getDb();
  const emp = db.prepare(`
    SELECT e.*, s.name as store_name, s.lat as store_lat, s.lng as store_lng,
           s.geofence_radius, s.city, s.address
    FROM employees e
    JOIN stores s ON e.store_id = s.id
    WHERE e.phone = ? AND e.is_active = 1
  `).get(req.params.phone);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(emp);
});

// POST create employee
router.post('/', (req, res) => {
  const db = getDb();
  const { name, type, role, store_id, phone } = req.body;
  if (!name || !type || !role || !store_id || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = `emp-${uuidv4().slice(0, 8)}`;
  try {
    db.prepare('INSERT INTO employees (id, name, type, role, store_id, phone, face_biometric_ref) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, type, role, store_id, phone, `biometric-ref-${id}`);
    res.status(201).json({ id, name, type, role, store_id, phone });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Phone number already exists' });
    throw e;
  }
});

// PUT update employee
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, type, role, store_id, phone } = req.body;
  db.prepare('UPDATE employees SET name=?, type=?, role=?, store_id=?, phone=? WHERE id=?')
    .run(name, type, role, store_id, phone, req.params.id);
  res.json({ success: true });
});

module.exports = router;
