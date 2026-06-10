/** Parse "HH:MM" → { h, m } */
function hm(t: string) {
  const [h, m] = t.split(':').map(Number);
  return { h, m };
}

/** Is check-in late? Grace period: 15 minutes after shift start. */
export function isLateCheckIn(shiftStart: string, checkIn: Date): boolean {
  const { h, m } = hm(shiftStart);
  const threshold = new Date(checkIn);
  threshold.setHours(h, m + 15, 0, 0);
  // If shift starts before current time by more than 15 min → late
  const shiftStartToday = new Date(checkIn);
  shiftStartToday.setHours(h, m, 0, 0);
  return checkIn.getTime() > shiftStartToday.getTime() + 15 * 60_000;
}

/** Is check-out an early exit? */
export function isEarlyExit(shiftEnd: string, checkOut: Date): boolean {
  const { h, m } = hm(shiftEnd);
  const shiftEndToday = new Date(checkOut);
  shiftEndToday.setHours(h, m, 0, 0);
  return checkOut.getTime() < shiftEndToday.getTime();
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}
