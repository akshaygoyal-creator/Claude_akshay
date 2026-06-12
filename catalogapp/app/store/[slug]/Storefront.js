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

  const accent = seller.accent_color || '#10b981';
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
    <main className="min-h-screen bg-[#f6f7f6] pb-28">
      <header
        className="text-white relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${accent}, ${accent}dd 60%, ${accent}bb)` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_85%_-10%,rgba(255,255,255,0.22),transparent_55%)]" />
        <div className="relative max-w-2xl mx-auto px-5 pt-7 pb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <span className="w-14 h-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center text-2xl font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                {initial}
              </span>
              <div>
                <h1 className="text-[22px] font-extrabold tracking-tight leading-tight">{seller.business_name}</h1>
                <p className="mt-0.5 text-[13px] font-medium opacity-85">
                  {[seller.category, seller.city].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <button
              className="shrink-0 rounded-full bg-white/15 backdrop-blur border border-white/25 px-3.5 py-1.5 text-[13px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            >
              {lang === 'en' ? 'हिं' : 'EN'}
            </button>
          </div>
          {seller.description && <p className="mt-4 text-sm opacity-90 leading-relaxed max-w-md">{seller.description}</p>}
          {seller.hours && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium opacity-80">
              <Clock className="w-3.5 h-3.5" />
              {seller.hours}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 -mt-3 relative grid grid-cols-2 gap-3.5">
        {products.map((p) => (
          <button
            key={p.id}
            className="card overflow-hidden text-left hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_20px_44px_-18px_rgba(15,23,42,0.20)] transition-all duration-200"
            onClick={() => {
              setOpen(p);
              track(seller.id, 'product_view', p.id);
            }}
          >
            <div className="aspect-square bg-slate-100 relative">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className={`w-full h-full object-cover ${!p.in_stock ? 'grayscale opacity-60' : ''}`}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-7 h-7" />
                </div>
              )}
              {!p.in_stock && (
                <span className="absolute top-2 right-2 badge bg-slate-900/75 backdrop-blur text-white">
                  {lang === 'hi' ? 'स्टॉक खत्म' : 'OUT OF STOCK'}
                </span>
              )}
            </div>
            <div className="p-3.5">
              <h3 className="font-semibold text-[13.5px] tracking-tight leading-snug">{p.name}</h3>
              {seller.show_prices && p.price != null ? (
                <p className="mt-1 font-extrabold tracking-tight" style={{ color: accent }}>
                  ₹{p.price}
                </p>
              ) : null}
            </div>
          </button>
        ))}
        {products.length === 0 && (
          <p className="col-span-2 text-center text-slate-400 py-20 text-sm">
            {lang === 'hi' ? 'अभी कोई उत्पाद नहीं' : 'No products yet'}
          </p>
        )}
      </div>

      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          onClick={() => track(seller.id, 'whatsapp_tap')}
          className="fixed bottom-5 right-5 btn text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)]"
          style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}dd)` }}
        >
          <WaGlyph className="w-[18px] h-[18px]" />
          {lang === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Chat on WhatsApp'}
        </a>
      )}

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden pt-2.5 flex justify-center">
              <span className="w-10 h-1 rounded-full bg-slate-200" />
            </div>
            {open.image && <img src={open.image} alt={open.name} className="w-full aspect-square object-cover mt-2 sm:mt-0" />}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-extrabold tracking-tight leading-snug">{open.name}</h2>
                <button
                  className="shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-semibold"
                  onClick={() => setOpen(null)}
                >
                  ✕
                </button>
              </div>
              {seller.show_prices && open.price != null ? (
                <p className="mt-1.5 text-[22px] font-extrabold tracking-tight" style={{ color: accent }}>
                  ₹{open.price}
                </p>
              ) : null}
              <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {(lang === 'hi' ? open.description_hi : open.description_en) || ''}
              </p>
              {!open.in_stock ? (
                <p className="mt-5 badge bg-slate-100 text-slate-500">{lang === 'hi' ? 'स्टॉक खत्म' : 'OUT OF STOCK'}</p>
              ) : (
                wa && (
                  <a
                    href={orderLink(open)}
                    target="_blank"
                    onClick={() => track(seller.id, 'whatsapp_tap', open.id)}
                    className="btn w-full mt-5 !py-3 text-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.3)]"
                    style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}dd)` }}
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
