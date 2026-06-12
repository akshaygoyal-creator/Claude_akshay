'use client';

import { useEffect, useState } from 'react';
import { Check } from '../../../lib/icons';

const COLORS = ['#6B4EFF', '#FF6B5E', '#10b981', '#0d9488', '#2563eb', '#ea580c', '#ca8a04', '#221F35'];

export default function Settings() {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/seller').then((r) => r.json()).then((d) => setS(d.seller));
  }, []);

  if (!s) return <p className="text-ink/40 text-sm">Loading…</p>;
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
    <form onSubmit={save} className="card max-w-lg p-7 space-y-4">
      <h1 className="font-bold tracking-tight text-lg">Storefront settings</h1>
      <label className="label">
        Business name
        <input className="input mt-1.5" value={s.business_name} onChange={set('business_name')} required />
      </label>
      <label className="label">
        WhatsApp number for orders
        <input className="input mt-1.5" value={s.whatsapp} onChange={set('whatsapp')} required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="label">
          Category
          <input className="input mt-1.5" value={s.category} onChange={set('category')} />
        </label>
        <label className="label">
          City
          <input className="input mt-1.5" value={s.city} onChange={set('city')} />
        </label>
      </div>
      <label className="label">
        Business description
        <textarea className="input mt-1.5" rows={2} value={s.description} onChange={set('description')} />
      </label>
      <label className="label">
        Hours (e.g. Mon–Sat 9am–8pm)
        <input className="input mt-1.5" value={s.hours} onChange={set('hours')} />
      </label>

      <div>
        <p className="label">Accent color</p>
        <div className="mt-2 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition hover:scale-105"
              style={{ background: c }}
              onClick={() => setS({ ...s, accent_color: c })}
            >
              {s.accent_color === c && <Check className="w-4 h-4" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-[13px] font-medium text-ink/60">
        <input type="checkbox" className="accent-violet" checked={!!s.show_prices} onChange={(e) => setS({ ...s, show_prices: e.target.checked ? 1 : 0 })} />
        Show prices publicly on storefront
      </label>

      {s.slug && (
        <p className="text-xs text-ink/40 bg-cream border border-ink/10 rounded-xl p-2.5">
          Your store: <span className="font-mono text-ink/60">/store/{s.slug}</span> · Plan: <b className="capitalize text-ink/60">{s.plan}</b>
        </p>
      )}

      <button className="btn-primary">{saved ? 'Saved ✓' : 'Save settings'}</button>
    </form>
  );
}
