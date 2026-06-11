'use client';

import { useEffect, useState } from 'react';

export default function Share() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/seller').then((r) => r.json()).then((d) => setSeller(d.seller));
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.products || []));
  }, []);

  if (!seller) return <p className="text-gray-400">Loading…</p>;

  const storeUrl = `${window.location.origin}/store/${seller.slug}`;
  const catalogMsg =
    lang === 'hi'
      ? `नमस्ते! हमारा कैटलॉग देखें: ${storeUrl}`
      : `Hi! Check out our catalog: ${storeUrl}`;

  const productMsg = () => {
    const lines = selected
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => {
        const desc = lang === 'hi' ? p.description_hi : p.description_en;
        return `*${p.name}*${p.price != null ? ` — ₹${p.price}` : ''}\n${desc ? desc + '\n' : ''}`;
      });
    return `${lines.join('\n')}\n${lang === 'hi' ? 'ऑर्डर करें' : 'Order here'}: ${storeUrl}`;
  };

  async function copy(text, key, productIds = []) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
    for (const pid of productIds) {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seller_id: seller.id, product_id: pid, type: 'share' }) });
    }
    if (!productIds.length) {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seller_id: seller.id, type: 'share' }) });
    }
  }

  if (!seller.slug)
    return <p className="text-sm text-gray-600">Finish your business profile in Settings to get your storefront link.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex gap-2">
        {[['en', 'English'], ['hi', 'हिन्दी']].map(([v, label]) => (
          <button key={v} onClick={() => setLang(v)} className={lang === v ? 'btn-primary !py-1.5' : 'btn-secondary !py-1.5'}>
            {label}
          </button>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="font-bold">🔗 Share catalog link</h2>
        <p className="mt-2 text-sm bg-gray-50 rounded p-2 break-all">{storeUrl}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => copy(storeUrl, 'link')}>{copied === 'link' ? '✓ Copied' : 'Copy link'}</button>
          <button className="btn-secondary" onClick={() => copy(catalogMsg, 'msg')}>{copied === 'msg' ? '✓ Copied' : 'Copy message'}</button>
          <a className="btn-primary" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(catalogMsg)}`}>
            Open in WhatsApp
          </a>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">🛍️ Product message generator</h2>
        <p className="text-xs text-gray-500 mt-1">Select products to build a ready-to-send WhatsApp message.</p>
        <div className="mt-3 max-h-56 overflow-y-auto space-y-1">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((i) => i !== p.id))}
              />
              {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />}
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-gray-500">{p.price != null ? `₹${p.price}` : ''}</span>
            </label>
          ))}
          {products.length === 0 && <p className="text-sm text-gray-400">No products yet.</p>}
        </div>
        {selected.length > 0 && (
          <>
            <pre className="mt-3 text-xs bg-gray-50 rounded p-3 whitespace-pre-wrap">{productMsg()}</pre>
            <div className="mt-2 flex gap-2">
              <button className="btn-secondary" onClick={() => copy(productMsg(), 'pmsg', selected)}>{copied === 'pmsg' ? '✓ Copied' : 'Copy message'}</button>
              <a className="btn-primary" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(productMsg())}`}>
                Open in WhatsApp
              </a>
            </div>
          </>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-bold">🧾 QR code</h2>
        <p className="text-xs text-gray-500 mt-1">Print it and display it at your shop — customers scan to open your catalog.</p>
        <div className="mt-3 flex items-center gap-4">
          <img src="/api/qr" alt="Storefront QR code" className="w-32 h-32 border rounded-lg" />
          <a href="/api/qr" download className="btn-secondary">Download PNG (1000×1000)</a>
        </div>
      </section>
    </div>
  );
}
