'use client';

import { useState } from 'react';

// Shared create/edit product form used by the dashboard and upload review cards.
export default function ProductForm({ initial = {}, onSave, onCancel, saveLabel = 'Save' }) {
  const [p, setP] = useState({
    name: initial.name || '',
    category: initial.category || '',
    description_en: initial.description_en || '',
    description_hi: initial.description_hi || '',
    price: initial.price ?? '',
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags ? JSON.parse(initial.tags).join(', ') : '',
    image: initial.image || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    await onSave({
      ...p,
      price: p.price === '' ? null : Number(p.price),
      tags: p.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {p.image && <img src={p.image} alt="" className="w-20 h-20 object-cover rounded-xl border border-slate-100" />}
      <input className="input" placeholder="Product name *" value={p.name} onChange={set('name')} required />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Category" value={p.category} onChange={set('category')} />
        <input className="input" placeholder="Price (₹)" type="number" min="0" step="0.01" value={p.price} onChange={set('price')} />
      </div>
      <textarea className="input" rows={2} placeholder="Description (English)" value={p.description_en} onChange={set('description_en')} />
      <textarea className="input" rows={2} placeholder="विवरण (हिन्दी)" value={p.description_hi} onChange={set('description_hi')} />
      <input className="input" placeholder="Tags (comma separated)" value={p.tags} onChange={set('tags')} />
      <div className="flex gap-2 justify-end pt-1">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Saving…' : saveLabel}
        </button>
      </div>
    </form>
  );
}
