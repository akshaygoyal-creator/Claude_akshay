import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { currentSeller } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

function ownedProduct(id) {
  const seller = currentSeller();
  if (!seller) return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) };
  const product = getDb().prepare('SELECT * FROM products WHERE id = ? AND seller_id = ?').get(Number(id), seller.id);
  if (!product) return { error: NextResponse.json({ error: 'Product not found' }, { status: 404 }) };
  return { seller, product };
}

export async function PATCH(req, { params }) {
  const { error, product } = ownedProduct(params.id);
  if (error) return error;
  const b = await req.json();
  const db = getDb();

  const strings = ['name', 'category', 'description_en', 'description_hi', 'image'];
  for (const f of strings) {
    if (b[f] !== undefined) db.prepare(`UPDATE products SET ${f} = ? WHERE id = ?`).run(String(b[f]), product.id);
  }
  if (b.price !== undefined) {
    db.prepare('UPDATE products SET price = ? WHERE id = ?').run(b.price === '' || b.price === null ? null : Number(b.price), product.id);
  }
  if (b.tags !== undefined) db.prepare('UPDATE products SET tags = ? WHERE id = ?').run(JSON.stringify(b.tags), product.id);
  if (b.in_stock !== undefined) db.prepare('UPDATE products SET in_stock = ? WHERE id = ?').run(b.in_stock ? 1 : 0, product.id);
  if (b.pinned !== undefined) db.prepare('UPDATE products SET pinned = ? WHERE id = ?').run(b.pinned ? 1 : 0, product.id);

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(product.id);
  return NextResponse.json({ product: updated });
}

export async function DELETE(req, { params }) {
  const { error, product } = ownedProduct(params.id);
  if (error) return error;
  getDb().prepare('DELETE FROM products WHERE id = ?').run(product.id);
  return NextResponse.json({ ok: true });
}

// Duplicate a product
export async function POST(req, { params }) {
  const { error, product, seller } = ownedProduct(params.id);
  if (error) return error;
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO products (seller_id, name, category, description_en, description_hi, price, tags, image, in_stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      seller.id,
      product.name + ' (copy)',
      product.category,
      product.description_en,
      product.description_hi,
      product.price,
      product.tags,
      product.image,
      product.in_stock
    );
  return NextResponse.json({ product: db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid) });
}
