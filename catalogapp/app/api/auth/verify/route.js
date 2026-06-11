import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { setSession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { phone, code } = await req.json();
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND expires_at > datetime('now')`)
    .get(phone, code);
  if (!row) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
  }
  db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(phone);

  let seller = db.prepare('SELECT * FROM sellers WHERE phone = ?').get(phone);
  const isNew = !seller;
  if (isNew) {
    const info = db.prepare('INSERT INTO sellers (phone, whatsapp) VALUES (?, ?)').run(phone, phone);
    seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(info.lastInsertRowid);
  }
  setSession(seller.id);
  return NextResponse.json({ ok: true, isNew: isNew || !seller.business_name, seller });
}
