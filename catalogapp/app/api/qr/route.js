import QRCode from 'qrcode';
import { NextResponse } from 'next/server';
import { currentSeller } from '../../../lib/session';

export const dynamic = 'force-dynamic';

// Returns a 1000x1000 PNG QR code pointing at the seller's storefront.
export async function GET(req) {
  const seller = currentSeller();
  if (!seller || !seller.slug) {
    return NextResponse.json({ error: 'Set up your business profile first' }, { status: 401 });
  }
  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
  const url = `${base}/store/${seller.slug}`;
  const png = await QRCode.toBuffer(url, { width: 1000, margin: 2 });
  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${seller.slug}-qr.png"`,
    },
  });
}
