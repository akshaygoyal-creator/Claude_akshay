import { NextResponse } from 'next/server';
import { getDb, slugify } from '../../../lib/db';
import { currentSeller, clearSession } from '../../../lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const seller = currentSeller();
  if (!seller) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  return NextResponse.json({ seller });
}

export async function PATCH(req) {
  const seller = currentSeller();
  if (!seller) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const body = await req.json();
  const db = getDb();

  const fields = ['business_name', 'category', 'whatsapp', 'city', 'language', 'accent_color', 'description', 'hours'];
  for (const f of fields) {
    if (body[f] !== undefined) db.prepare(`UPDATE sellers SET ${f} = ? WHERE id = ?`).run(String(body[f]), seller.id);
  }
  if (body.show_prices !== undefined) {
    db.prepare('UPDATE sellers SET show_prices = ? WHERE id = ?').run(body.show_prices ? 1 : 0, seller.id);
  }
  if (body.business_name && !seller.slug) {
    db.prepare('UPDATE sellers SET slug = ? WHERE id = ?').run(slugify(body.business_name), seller.id);
  }
  const updated = db.prepare('SELECT * FROM sellers WHERE id = ?').get(seller.id);
  return NextResponse.json({ seller: updated });
}

export async function DELETE() {
  clearSession();
  return NextResponse.json({ ok: true });
}
