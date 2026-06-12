import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db;

export function getDb() {
  if (db) return db;
  const dir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  db = new Database(path.join(dir, 'catalogapp.db'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      business_name TEXT NOT NULL DEFAULT '',
      slug TEXT UNIQUE,
      category TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      city TEXT DEFAULT '',
      language TEXT DEFAULT 'en',
      accent_color TEXT DEFAULT '#6B4EFF',
      description TEXT DEFAULT '',
      hours TEXT DEFAULT '',
      show_prices INTEGER DEFAULT 1,
      plan TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL REFERENCES sellers(id),
      name TEXT NOT NULL,
      category TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      description_hi TEXT DEFAULT '',
      price REAL,
      tags TEXT DEFAULT '[]',
      image TEXT DEFAULT '',
      in_stock INTEGER DEFAULT 1,
      pinned INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL,
      product_id INTEGER,
      type TEXT NOT NULL, -- store_view | product_view | whatsapp_tap | share
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS otp_codes (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_events_seller ON events(seller_id, type);
  `);
  return db;
}

export function slugify(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'store';
  const d = getDb();
  let slug = base;
  let i = 1;
  while (d.prepare('SELECT 1 FROM sellers WHERE slug = ?').get(slug)) {
    slug = `${base}-${++i}`;
  }
  return slug;
}
