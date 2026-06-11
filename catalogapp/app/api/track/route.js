import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

const TYPES = new Set(['store_view', 'product_view', 'whatsapp_tap', 'share']);

// Public endpoint: storefront visitors fire view/tap events here.
export async function POST(req) {
  const { seller_id, product_id, type } = await req.json();
  if (!seller_id || !TYPES.has(type)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }
  const db = getDb();
  db.prepare('INSERT INTO events (seller_id, product_id, type) VALUES (?, ?, ?)').run(
    Number(seller_id),
    product_id ? Number(product_id) : null,
    type
  );
  if (type === 'share' && product_id) {
    db.prepare('UPDATE products SET share_count = share_count + 1 WHERE id = ?').run(Number(product_id));
  }
  return NextResponse.json({ ok: true });
}
