'use client';

import { useEffect, useState } from 'react';

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/analytics').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="text-ink/40 text-sm">Loading…</p>;

  const stats = [
    ['Storefront views', data.store_views, `${data.store_views_week} this week`],
    ['Product views', data.product_views, 'all time'],
    ['WhatsApp taps', data.whatsapp_taps, '"Order on WhatsApp" clicks'],
    ['Shares', data.shares, 'catalog links copied / shared'],
  ];

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="card p-6">
            <p className="text-[13px] font-medium text-ink/50">{label}</p>
            <p className="mt-1 font-display text-[36px] leading-none font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-ink/40">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 p-6">
        <h2 className="font-bold tracking-tight">Top products <span className="text-ink/40 font-medium text-sm">· last 30 days</span></h2>
        {data.top_products.length === 0 ? (
          <p className="mt-3 text-sm text-ink/40">No product views yet — share your catalog to get started.</p>
        ) : (
          <ol className="mt-4 space-y-2.5">
            {data.top_products.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-ink/5 text-[11px] font-bold text-ink/50">
                  {i + 1}
                </span>
                {p.image && <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover" />}
                <span className="truncate font-medium">{p.name}</span>
                <span className="ml-auto font-bold tracking-tight">{p.views} <span className="text-ink/40 font-medium">views</span></span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
