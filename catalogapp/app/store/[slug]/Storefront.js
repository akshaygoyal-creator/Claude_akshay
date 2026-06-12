'use client';

import { useEffect, useState } from 'react';
import { Clock, ImageIcon, WaGlyph } from '../../../lib/icons';

function track(seller_id, type, product_id) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seller_id, product_id, type }),
  }).catch(() => {});
}

export default function Storefront({ seller, products }) {
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    track(seller.id, 'store_view');
  }, [seller.id]);

  const accent = seller.accent_color || '#6B4EFF';
  const wa = (seller.whatsapp || '').replace(/[^\d]/g, '');
  const initial = (seller.business_name || 'S').trim().charAt(0).toUpperCase();

  function orderLink(p) {
    const msg =
      lang === 'hi'
        ? `नमस्ते, मुझे ${p.name}${seller.show_prices && p.price != null ? ` (₹${p.price})` : ''} ऑर्डर करना है`
        : `Hi, I want to order ${p.name}${seller.show_prices && p.price != null ? ` at ₹${p.price}` : ''}`;
    return `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <main className="min-h-screen bg-cream pb-28">
      <header className="text-white relative" style={{ background: accent }}>
        <div className="max-w-2xl mx-auto px-5 pt-7 pb-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <span className="w-14 h-14 shrink-0 rounded-2xl bg-white text-ink border-[1.5px] border-ink shadow-[3px_3px_0_#221F35] flex items-center justify-center font-display text-2xl font-semibold">
                {initial}
              </span>
              <div>
                <h1 className="font-display text-[24px] font-semibold tracking-tight leading-tight">{seller.business_name}</h1>
                <p className="mt-0.5 text-[13px] font-semibold opacity-85">
                  {[seller.category, seller.city].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <button
              className="shrink-0 rounded-full bg-white text-ink border-[1.5px] border-ink shadow-[2px_2px_0_#221F35] px-3.5 py-1.5 text-[13px] font-extrabold active:translate-y-0.5 active:shadow-none transition"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            >
              {lang === 'en' ? 'हिं' : 'EN'}
            </button>
          </div>
          {seller.description && <p className="mt-4 text-sm opacity-90 leading-relaxed max-w-md font-medium">{seller.description}</p>}
          {seller.hours && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold opacity-85">
              <Clock className="w-3.5 h-3.5" />
              {seller.hours}
            </p>
          )}
        </div>
        <div className="absolute -bottom-px inset-x-0 h-5 bg-cream rounded-t-[1.5rem]" />
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-1 relative grid grid-cols-2 gap-4">
        {products.map((p) => (
          <button
            key={p.id}
            className="bg-white rounded-2xl border-[1.5px] border-ink/15 overflow-hidden text-left transition-all duration-150 hover:-translate-y-1 hover:border-ink hover:shadow-[4px_4px_0_#221F35]"
            onClick={() => {
              setOpen(p);
              track(seller.id, 'product_view', p.id);
            }}
          >
            <div className="aspect-square bg-ink/5 relative">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className={`w-full h-full object-cover ${!p.in_stock ? 'grayscale opacity-60' : ''}`}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/20">
                  <ImageIcon className="w-7 h-7" />
                </div>
              )}
              {!p.in_stock && (
                <span className="absolute top-2 right-2 badge bg-ink text-cream">
                  {lang === 'hi' ? 'स्टॉक खत्म' : 'OUT OF STOCK'}
                </span>
              )}
            </div>
            <div className="p-3.5">
              <h3 className="font-bold text-[13.5px] tracking-tight leading-snug">{p.name}</h3>
              {seller.show_prices && p.price != null ? (
                <p className="mt-1 font-display text-[17px] font-semibold tracking-tight" style={{ color: accent }}>
                  ₹{p.price}
                </p>
              ) : null}
            </div>
          </button>
        ))}
        {products.length === 0 && (
          <p className="col-span-2 text-center text-ink/35 py-20 text-sm font-medium">
            {lang === 'hi' ? 'अभी कोई उत्पाद नहीं' : 'No products yet'}
          </p>
        )}
      </div>

      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          onClick={() => track(seller.id, 'whatsapp_tap')}
          className="fixed bottom-5 right-5 btn text-white border-[1.5px] border-ink shadow-[3px_3px_0_#221F35] active:translate-y-0.5 active:shadow-none"
          style={{ background: accent }}
        >
          <WaGlyph className="w-[18px] h-[18px]" />
          {lang === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Chat on WhatsApp'}
        </a>
      )}

      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto border-t-[1.5px] sm:border-[1.5px] border-ink sm:shadow-[6px_6px_0_#221F35]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden pt-2.5 flex justify-center">
              <span className="w-10 h-1 rounded-full bg-ink/15" />
            </div>
            {open.image && <img src={open.image} alt={open.name} className="w-full aspect-square object-cover mt-2 sm:mt-0" />}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-semibold tracking-tight leading-snug">{open.name}</h2>
                <button
                  className="shrink-0 w-8 h-8 rounded-full bg-cream border-[1.5px] border-ink/15 text-ink/60 hover:border-ink hover:text-ink text-sm font-bold"
                  onClick={() => setOpen(null)}
                >
                  ✕
                </button>
              </div>
              {seller.show_prices && open.price != null ? (
                <p className="mt-1.5 font-display text-[26px] font-semibold tracking-tight" style={{ color: accent }}>
                  ₹{open.price}
                </p>
              ) : null}
              <p className="mt-3 text-sm text-ink/65 leading-relaxed whitespace-pre-wrap font-medium">
                {(lang === 'hi' ? open.description_hi : open.description_en) || ''}
              </p>
              {!open.in_stock ? (
                <p className="mt-5 badge bg-ink/10 text-ink/50">{lang === 'hi' ? 'स्टॉक खत्म' : 'OUT OF STOCK'}</p>
              ) : (
                wa && (
                  <a
                    href={orderLink(open)}
                    target="_blank"
                    onClick={() => track(seller.id, 'whatsapp_tap', open.id)}
                    className="btn w-full mt-5 !py-3 text-white border-[1.5px] border-ink shadow-[3px_3px_0_#221F35] active:translate-y-0.5 active:shadow-none"
                    style={{ background: accent }}
                  >
                    <WaGlyph className="w-[18px] h-[18px]" />
                    {lang === 'hi' ? 'WhatsApp पर ऑर्डर करें' : 'Order on WhatsApp'}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
