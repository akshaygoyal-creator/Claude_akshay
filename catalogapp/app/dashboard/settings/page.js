'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#25D366', '#128C7E', '#E11D48', '#7C3AED', '#2563EB', '#EA580C', '#0D9488', '#1F2937'];

export default function Settings() {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/seller').then((r) => r.json()).then((d) => setS(d.seller));
  }, []);

  if (!s) return <p className="text-gray-400">Loading…</p>;
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    const res = await fetch('/api/seller', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: s.business_name,
        category: s.category,
        whatsapp: s.whatsapp,
        city: s.city,
        language: s.language,
        accent_color: s.accent_color,
        description: s.description,
        hours: s.hours,
        show_prices: !!s.show_prices,
      }),
    });
    if (res.ok) {
      setS((await res.json()).seller);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <form onSubmit={save} className="card max-w-lg p-6 space-y-4">
      <h1 className="font-bold text-lg">Storefront settings</h1>
      <label className="block text-sm font-medium">
        Business name
        <input className="input mt-1" value={s.business_name} onChange={set('business_name')} required />
      </label>
      <label className="block text-sm font-medium">
        WhatsApp number for orders
        <input className="input mt-1" value={s.whatsapp} onChange={set('whatsapp')} required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">
          Category
          <input className="input mt-1" value={s.category} onChange={set('category')} />
        </label>
        <label className="block text-sm font-medium">
          City
          <input className="input mt-1" value={s.city} onChange={set('city')} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Business description
        <textarea className="input mt-1" rows={2} value={s.description} onChange={set('description')} />
      </label>
      <label className="block text-sm font-medium">
        Hours (e.g. Mon–Sat 9am–8pm)
        <input className="input mt-1" value={s.hours} onChange={set('hours')} />
      </label>

      <div>
        <p className="text-sm font-medium">Accent color</p>
        <div className="mt-2 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${s.accent_color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
              style={{ background: c }}
              onClick={() => setS({ ...s, accent_color: c })}
            />
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={!!s.show_prices} onChange={(e) => setS({ ...s, show_prices: e.target.checked ? 1 : 0 })} />
        Show prices publicly on storefront
      </label>

      {s.slug && (
        <p className="text-xs text-gray-500">
          Your store: <span className="font-mono">/store/{s.slug}</span> · Plan: <b className="capitalize">{s.plan}</b>
        </p>
      )}

      <button className="btn-primary">{saved ? '✓ Saved' : 'Save settings'}</button>
    </form>
  );
}
