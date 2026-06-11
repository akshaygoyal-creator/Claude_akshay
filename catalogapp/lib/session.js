import { cookies } from 'next/headers';
import { getDb } from './db';

const COOKIE = 'catalogapp_seller';

export function setSession(sellerId) {
  cookies().set(COOKIE, String(sellerId), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export function currentSeller() {
  const id = cookies().get(COOKIE)?.value;
  if (!id) return null;
  return getDb().prepare('SELECT * FROM sellers WHERE id = ?').get(Number(id)) || null;
}
