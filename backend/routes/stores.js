const express = require('express');
const router = express.Router();
const { getDb } = require('../database/schema');
const { v4: uuidv4 } = require('uuid');

// GET all stores
router.get('/', (req, res) => {
  const db = getDb();
  const stores = db.prepare('SELECT * FROM stores ORDER BY city, name').all();
  res.json(stores);
});

// GET single store
router.get('/:id', (req, res) => {
  const db = getDb();
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(req.params.id);
  if (!store) return res.status(404).json({ error: 'Store not found' });
  res.json(store);
});

// POST create store
router.post('/', (req, res) => {
  const db = getDb();
  const { name, lat, lng, address, city, geofence_radius } = req.body;
  if (!name || !lat || !lng || !address || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = `store-${uuidv4().slice(0, 8)}`;
  db.prepare('INSERT INTO stores (id, name, lat, lng, address, city, geofence_radius) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, lat, lng, address, city, geofence_radius || 50);
  res.status(201).json({ id, name, lat, lng, address, city });
});

// PUT update store
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, lat, lng, address, city, geofence_radius } = req.body;
  db.prepare('UPDATE stores SET name=?, lat=?, lng=?, address=?, city=?, geofence_radius=? WHERE id=?')
    .run(name, lat, lng, address, city, geofence_radius, req.params.id);
  res.json({ success: true });
});

module.exports = router;
