import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { currentSeller } from '../../../lib/session';

export const dynamic = 'force-dynamic';

const FREE_PLAN_LIMIT = 10;

export async function GET(req) {
  const seller = currentSeller();
  if (!seller) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const stock = searchParams.get('stock') || '';
  const sort = searchParams.get('sort') || 'newest';

  let sql = 'SELECT * FROM products WHERE seller_id = ?';
  const args = [seller.id];
  if (q) {
    sql += ' AND name LIKE ?';
    args.push(`%${q}%`);
  }
  if (category) {
    sql += ' AND category = ?';
    args.push(category);
  }
  if (stock === 'in') sql += ' AND in_stock = 1';
  if (stock === 'out') sql += ' AND in_stock = 0';

  const order = {
    newest: 'pinned DESC, id DESC',
    price_asc: 'pinned DESC, price ASC',
    price_desc: 'pinned DESC, price DESC',
    name: 'pinned DESC, name COLLATE NOCASE ASC',
    shared: 'pinned DESC, share_count DESC',
  }[sort] || 'pinned DESC, id DESC';
  sql += ` ORDER BY ${order}`;

  const products = getDb().prepare(sql).all(...args);
  const categories = getDb()
    .prepare("SELECT DISTINCT category FROM products WHERE seller_id = ? AND category != ''")
    .all(seller.id)
    .map((r) => r.category);
  return NextResponse.json({ products, categories });
}

export async function POST(req) {
  const seller = currentSeller();
  if (!seller) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const db = getDb();

  const count = db.prepare('SELECT COUNT(*) c FROM products WHERE seller_id = ?').get(seller.id).c;
  if (seller.plan === 'free' && count >= FREE_PLAN_LIMIT) {
    return NextResponse.json(
      { error: `Free plan is limited to ${FREE_PLAN_LIMIT} products. Upgrade to add more.` },
      { status: 403 }
    );
  }

  const b = await req.json();
  if (!b.name || !b.name.trim()) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }
  const info = db
    .prepare(
      `INSERT INTO products (seller_id, name, category, description_en, description_hi, price, tags, image, in_stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      seller.id,
      b.name.trim(),
      b.category || '',
      b.description_en || '',
      b.description_hi || '',
      b.price != null && b.price !== '' ? Number(b.price) : null,
      JSON.stringify(b.tags || []),
      b.image || '',
      b.in_stock === false ? 0 : 1
    );
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  return NextResponse.json({ product });
}
