import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { phone } = await req.json();
  if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 });
  }
  // Demo OTP delivery: a real deployment plugs an SMS gateway (MSG91/Twilio) here.
  const code = '123456';
  getDb()
    .prepare(
      `INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, datetime('now', '+10 minutes'))
       ON CONFLICT(phone) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at`
    )
    .run(phone, code);
  return NextResponse.json({ ok: true, demo_hint: 'Use OTP 123456 (demo mode — no SMS gateway configured)' });
}
