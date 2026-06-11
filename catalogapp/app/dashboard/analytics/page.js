'use client';

import { useEffect, useState } from 'react';

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/analytics').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="text-gray-400">Loading…</p>;

  const stats = [
    ['Storefront views', data.store_views, `${data.store_views_week} this week`],
    ['Product views', data.product_views, 'all time'],
    ['WhatsApp taps', data.whatsapp_taps, '"Order on WhatsApp" clicks'],
    ['Shares', data.shares, 'catalog links copied/shared'],
  ];

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-extrabold">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 p-5">
        <h2 className="font-bold">Top products (last 30 days)</h2>
        {data.top_products.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No product views yet — share your catalog to get started.</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {data.top_products.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-5">{i + 1}.</span>
                {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />}
                <span className="truncate">{p.name}</span>
                <span className="ml-auto font-semibold">{p.views} views</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
