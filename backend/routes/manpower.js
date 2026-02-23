const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { v4: uuidv4 } = require('uuid');

// GET manpower plans with filters
router.get('/', (req, res) => {
  const db = getDb();
  const { store_id, date, shift_id } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const planDate = date || today;

  let query = `
    SELECT mp.*, s.name as store_name, sh.name as shift_name, sh.start_time, sh.end_time
    FROM manpower_plans mp
    JOIN stores s ON mp.store_id = s.id
    JOIN shifts sh ON mp.shift_id = sh.id
    WHERE mp.plan_date = ?
  `;
  const params = [planDate];
  if (store_id) { query += ' AND mp.store_id = ?'; params.push(store_id); }
  if (shift_id) { query += ' AND mp.shift_id = ?'; params.push(shift_id); }
  query += ' ORDER BY s.name, sh.start_time, mp.role';

  res.json(db.prepare(query).all(...params));
});

// POST upsert manpower plan
router.post('/', (req, res) => {
  const db = getDb();
  const { store_id, shift_id, role, planned_count, plan_date } = req.body;
  if (!store_id || !shift_id || !role || planned_count === undefined || !plan_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = `plan-${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO manpower_plans (id, store_id, shift_id, role, planned_count, plan_date)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(store_id, shift_id, role, plan_date) DO UPDATE SET planned_count = excluded.planned_count
  `).run(id, store_id, shift_id, role, planned_count, plan_date);
  res.status(201).json({ success: true });
});

// POST bulk upsert (for planning multiple days)
router.post('/bulk', (req, res) => {
  const db = getDb();
  const { plans } = req.body; // array of {store_id, shift_id, role, planned_count, plan_date}
  if (!Array.isArray(plans) || plans.length === 0) {
    return res.status(400).json({ error: 'Plans array required' });
  }
  const stmt = db.prepare(`
    INSERT INTO manpower_plans (id, store_id, shift_id, role, planned_count, plan_date)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(store_id, shift_id, role, plan_date) DO UPDATE SET planned_count = excluded.planned_count
  `);
  const insertMany = db.transaction((items) => {
    for (const p of items) {
      stmt.run(`plan-${uuidv4().slice(0, 8)}`, p.store_id, p.shift_id, p.role, p.planned_count, p.plan_date);
    }
  });
  insertMany(plans);
  res.json({ success: true, count: plans.length });
});

module.exports = router;
