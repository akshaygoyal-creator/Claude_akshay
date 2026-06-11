'use client';

import { useEffect, useState } from 'react';

function track(seller_id, type, product_id) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seller_id, product_id, type }),
  }).catch(() => {});
}

export default function Storefront({ seller, products }) {
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(null); // product detail view

  useEffect(() => {
    track(seller.id, 'store_view');
  }, [seller.id]);

  const accent = seller.accent_color || '#25D366';
  const wa = (seller.whatsapp || '').replace(/[^\d]/g, '');

  function orderLink(p) {
    const msg =
      lang === 'hi'
        ? `नमस्ते, मुझे ${p.name}${seller.show_prices && p.price != null ? ` (₹${p.price})` : ''} ऑर्डर करना है`
        : `Hi, I want to order ${p.name}${seller.show_prices && p.price != null ? ` at ₹${p.price}` : ''}`;
    return `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <header className="text-white" style={{ background: accent }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold">{seller.business_name}</h1>
              <p className="text-sm opacity-90">
                {[seller.category, seller.city].filter(Boolean).join(' · ')}
              </p>
              {seller.description && <p className="mt-2 text-sm opacity-90">{seller.description}</p>}
              {seller.hours && <p className="mt-1 text-xs opacity-75">🕒 {seller.hours}</p>}
            </div>
            <button
              className="bg-white/20 rounded-full px-3 py-1 text-sm font-semibold"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            >
              {lang === 'en' ? 'हिं' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <button key={p.id} className="card overflow-hidden text-left" onClick={() => { setOpen(p); track(seller.id, 'product_view', p.id); }}>
            <div className="aspect-square bg-gray-100 relative">
              {p.image ? (
                <img src={p.image} alt={p.name} className={`w-full h-full object-cover ${!p.in_stock ? 'grayscale opacity-60' : ''}`} loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
              )}
              {!p.in_stock && (
                <span className="absolute top-2 right-2 badge bg-gray-700 text-white">
                  {lang === 'hi' ? 'स्टॉक खत्म' : 'Out of stock'}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
              {seller.show_prices && p.price != null ? <p className="mt-1 font-bold" style={{ color: accent }}>₹{p.price}</p> : null}
            </div>
          </button>
        ))}
        {products.length === 0 && (
          <p className="col-span-2 text-center text-gray-400 py-16">{lang === 'hi' ? 'अभी कोई उत्पाद नहीं' : 'No products yet'}</p>
        )}
      </div>

      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          onClick={() => track(seller.id, 'whatsapp_tap')}
          className="fixed bottom-4 right-4 btn text-white shadow-lg"
          style={{ background: accent }}
        >
          💬 {lang === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Chat on WhatsApp'}
        </a>
      )}

      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 flex items-end sm:items-center justify-center" onClick={() => setOpen(null)}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {open.image && <img src={open.image} alt={open.name} className="w-full aspect-square object-cover" />}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{open.name}</h2>
                <button className="text-gray-400 text-xl leading-none" onClick={() => setOpen(null)}>✕</button>
              </div>
              {seller.show_prices && open.price != null ? (
                <p className="mt-1 text-xl font-extrabold" style={{ color: accent }}>₹{open.price}</p>
              ) : null}
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                {(lang === 'hi' ? open.description_hi : open.description_en) || ''}
              </p>
              {!open.in_stock ? (
                <p className="mt-4 badge bg-gray-200 text-gray-600">{lang === 'hi' ? 'स्टॉक खत्म' : 'Out of stock'}</p>
              ) : (
                wa && (
                  <a
                    href={orderLink(open)}
                    target="_blank"
                    onClick={() => track(seller.id, 'whatsapp_tap', open.id)}
                    className="btn w-full mt-4 text-white"
                    style={{ background: accent }}
                  >
                    💬 {lang === 'hi' ? 'WhatsApp पर ऑर्डर करें' : 'Order on WhatsApp'}
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
