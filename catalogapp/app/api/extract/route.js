import { NextResponse } from 'next/server';
import { extractFromImage } from '../../../lib/ai';
import { currentSeller } from '../../../lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Accepts { image: dataUrl } and returns AI-extracted product fields.
export async function POST(req) {
  const seller = currentSeller();
  if (!seller) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { image } = await req.json();
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image || '');
  if (!match) {
    return NextResponse.json({ error: 'Send a JPEG, PNG or WEBP image as a data URL' }, { status: 400 });
  }
  try {
    const fields = await extractFromImage(match[2], match[1], seller.language);
    return NextResponse.json({ fields });
  } catch (e) {
    return NextResponse.json({ error: 'AI extraction failed: ' + e.message }, { status: 502 });
  }
}
