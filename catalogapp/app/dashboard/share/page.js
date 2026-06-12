'use client';

import { useEffect, useState } from 'react';
import { Chat, Copy, Check, Qr, Download, Bag, WaGlyph } from '../../../lib/icons';

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

  if (!seller) return <p className="text-slate-400 text-sm">Loading…</p>;

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
    return <p className="text-sm text-slate-500">Finish your business profile in Settings to get your storefront link.</p>;

  const CopyBtn = ({ k, text, ids }) => (
    <button className="btn-secondary" onClick={() => copy(text, k, ids)}>
      {copied === k ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      {copied === k ? 'Copied' : 'Copy'}
    </button>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="inline-flex gap-1 p-1 bg-slate-100 rounded-full">
        {[['en', 'English'], ['hi', 'हिन्दी']].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setLang(v)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
              lang === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="card p-6">
        <h2 className="section-title">
          <span className="icon-chip !w-8 !h-8"><Chat className="w-4 h-4" /></span>
          Share catalog link
        </h2>
        <p className="mt-3 text-sm font-medium bg-slate-50 border border-slate-100 rounded-xl p-3 break-all text-slate-600">{storeUrl}</p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          <CopyBtn k="link" text={storeUrl} />
          <button className="btn-secondary" onClick={() => copy(catalogMsg, 'msg')}>
            {copied === 'msg' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied === 'msg' ? 'Copied' : 'Copy message'}
          </button>
          <a className="btn-wa" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(catalogMsg)}`}>
            <WaGlyph />
            Open in WhatsApp
          </a>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title">
          <span className="icon-chip !w-8 !h-8"><Bag className="w-4 h-4" /></span>
          Product message generator
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">Select products to build a ready-to-send WhatsApp message.</p>
        <div className="mt-3 max-h-56 overflow-y-auto space-y-0.5">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2.5 text-sm p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={selected.includes(p.id)}
                onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((i) => i !== p.id))}
              />
              {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover" />}
              <span className="truncate font-medium">{p.name}</span>
              <span className="ml-auto text-slate-400 font-medium">{p.price != null ? `₹${p.price}` : ''}</span>
            </label>
          ))}
          {products.length === 0 && <p className="text-sm text-slate-400">No products yet.</p>}
        </div>
        {selected.length > 0 && (
          <>
            <pre className="mt-3 text-xs bg-slate-50 border border-slate-100 rounded-xl p-3.5 whitespace-pre-wrap font-sans text-slate-600">{productMsg()}</pre>
            <div className="mt-3 flex gap-2">
              <CopyBtn k="pmsg" text={productMsg()} ids={selected} />
              <a className="btn-wa" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(productMsg())}`}>
                <WaGlyph />
                Open in WhatsApp
              </a>
            </div>
          </>
        )}
      </section>

      <section className="card p-6">
        <h2 className="section-title">
          <span className="icon-chip !w-8 !h-8"><Qr className="w-4 h-4" /></span>
          QR code
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">Print it and display it at your shop — customers scan to open your catalog.</p>
        <div className="mt-4 flex items-center gap-5">
          <img src="/api/qr" alt="Storefront QR code" className="w-32 h-32 border border-slate-200 rounded-2xl p-1.5 bg-white" />
          <a href="/api/qr" download className="btn-secondary">
            <Download className="w-4 h-4" />
            Download PNG (1000×1000)
          </a>
        </div>
      </section>
    </div>
  );
}
