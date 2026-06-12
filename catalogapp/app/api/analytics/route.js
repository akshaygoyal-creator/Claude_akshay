import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { currentSeller } from '../../../lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const seller = currentSeller();
  if (!seller) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const db = getDb();

  const count = (type, since) =>
    db
      .prepare(
        `SELECT COUNT(*) c FROM events WHERE seller_id = ? AND type = ?` +
          (since ? ` AND created_at >= datetime('now', ?)` : '')
      )
      .get(...(since ? [seller.id, type, since] : [seller.id, type])).c;

  const topProducts = db
    .prepare(
      `SELECT p.id, p.name, p.image, COUNT(e.id) views
       FROM events e JOIN products p ON p.id = e.product_id
       WHERE e.seller_id = ? AND e.type = 'product_view' AND e.created_at >= datetime('now', '-30 days')
       GROUP BY p.id ORDER BY views DESC LIMIT 10`
    )
    .all(seller.id);

  return NextResponse.json({
    store_views: count('store_view'),
    store_views_week: count('store_view', '-7 days'),
    product_views: count('product_view'),
    whatsapp_taps: count('whatsapp_tap'),
    shares: count('share'),
    top_products: topProducts,
  });
}
