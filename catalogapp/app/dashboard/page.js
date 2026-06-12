'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import { Plus, Search, Grid, ListIcon, Camera, ImageIcon } from '../../lib/icons';

export default function Products() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('grid');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [sort, setSort] = useState('newest');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams({ q, category, stock, sort });
    const res = await fetch('/api/products?' + params);
    if (res.ok) {
      const d = await res.json();
      setProducts(d.products);
      setCategories(d.categories);
    }
  }, [q, category, stock, sort]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function patch(id, body) {
    const res = await fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) setError((await res.json()).error);
    load();
  }

  async function act(id, method) {
    const res = await fetch(`/api/products/${id}`, { method });
    if (!res.ok) setError((await res.json()).error);
    load();
  }

  if (products === null) return <p className="text-ink/40 text-sm">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className="input !w-52 !pl-9" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input !w-auto" value={stock} onChange={(e) => setStock(e.target.value)}>
          <option value="">All stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="name">Name</option>
          <option value="shared">Most shared</option>
        </select>
        <button className="btn-secondary !p-2.5 ml-auto" title="Toggle view" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
          {view === 'grid' ? <ListIcon className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
        </button>
        <Link href="/dashboard/upload" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Products
        </Link>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-2.5 cursor-pointer" onClick={() => setError('')}>
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <div className="card mt-6 p-14 text-center">
          <span className="icon-chip !w-12 !h-12 mx-auto">
            <Camera className="w-5 h-5" />
          </span>
          <h2 className="mt-4 font-bold tracking-tight">Upload your first products</h2>
          <p className="mt-1 text-sm text-ink/50">Add photos and let AI fill in the details.</p>
          <Link href="/dashboard/upload" className="btn-primary mt-5">Add Products</Link>
        </div>
      ) : (
        <div className={view === 'grid' ? 'mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'mt-5 space-y-2'}>
          {products.map((p) => (
            <div
              key={p.id}
              className={`card overflow-hidden hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_16px_40px_-16px_rgba(15,23,42,0.16)] transition-shadow ${
                view === 'list' ? 'flex items-center gap-3 p-2.5' : ''
              }`}
            >
              <div className={view === 'grid' ? 'aspect-square bg-ink/5 relative' : 'w-16 h-16 bg-ink/5 rounded-xl shrink-0 relative overflow-hidden'}>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/25">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                {!!p.pinned && <span className="absolute top-2 left-2 badge bg-white/90 backdrop-blur text-amber-600 shadow-sm">PINNED</span>}
                {!p.in_stock && <span className="absolute top-2 right-2 badge bg-ink/80 backdrop-blur text-white">OUT OF STOCK</span>}
              </div>
              <div className={view === 'grid' ? 'p-3.5' : 'flex-1 min-w-0'}>
                <h3 className="font-semibold text-sm tracking-tight truncate">{p.name}</h3>
                <p className="text-xs text-ink/40 truncate">{p.category || '—'}</p>
                <p className="mt-0.5 text-[15px] font-bold tracking-tight">{p.price != null ? `₹${p.price}` : '—'}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 text-xs font-medium">
                  <button className="text-ink/60 hover:text-ink" onClick={() => setEditing(p)}>Edit</button>
                  <button className="text-ink/40 hover:text-ink/70" onClick={() => patch(p.id, { in_stock: !p.in_stock })}>{p.in_stock ? 'Mark out' : 'Mark in'}</button>
                  <button className="text-ink/40 hover:text-ink/70" onClick={() => patch(p.id, { pinned: !p.pinned })}>{p.pinned ? 'Unpin' : 'Pin'}</button>
                  <button className="text-ink/40 hover:text-ink/70" onClick={() => act(p.id, 'POST')}>Duplicate</button>
                  <button className="text-red-400 hover:text-red-600" onClick={() => confirm(`Delete "${p.name}"?`) && act(p.id, 'DELETE')}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold tracking-tight mb-4">Edit product</h2>
            <ProductForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSave={async (body) => {
                await patch(editing.id, body);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
