'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ProductForm from './ProductForm';

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

  if (products === null) return <p className="text-gray-400">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input className="input !w-48" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
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
        <button className="btn-secondary ml-auto" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
          {view === 'grid' ? '☰ List' : '▦ Grid'}
        </button>
        <Link href="/dashboard/upload" className="btn-primary">+ Add Products</Link>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 rounded p-2" onClick={() => setError('')}>
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <p className="text-4xl">📸</p>
          <h2 className="mt-2 font-bold">Upload your first products</h2>
          <p className="mt-1 text-sm text-gray-500">Add photos and let AI fill in the details.</p>
          <Link href="/dashboard/upload" className="btn-primary mt-4">Add Products</Link>
        </div>
      ) : (
        <div className={view === 'grid' ? 'mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'mt-4 space-y-2'}>
          {products.map((p) => (
            <div key={p.id} className={`card overflow-hidden ${view === 'list' ? 'flex items-center gap-3 p-2' : ''}`}>
              <div className={view === 'grid' ? 'aspect-square bg-gray-100 relative' : 'w-16 h-16 bg-gray-100 rounded-lg shrink-0 relative'}>
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>}
                {!!p.pinned && <span className="absolute top-1 left-1 badge bg-amber-100 text-amber-700">📌</span>}
                {!p.in_stock && <span className="absolute top-1 right-1 badge bg-gray-800/80 text-white">Out of stock</span>}
              </div>
              <div className={view === 'grid' ? 'p-3' : 'flex-1 min-w-0'}>
                <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                <p className="text-xs text-gray-500 truncate">{p.category}</p>
                <p className="text-sm font-bold">{p.price != null ? `₹${p.price}` : '—'}</p>
                <div className="mt-1 flex flex-wrap gap-1 text-xs">
                  <button className="text-blue-600" onClick={() => setEditing(p)}>Edit</button>
                  <button className="text-gray-500" onClick={() => patch(p.id, { in_stock: !p.in_stock })}>{p.in_stock ? 'Mark out' : 'Mark in'}</button>
                  <button className="text-gray-500" onClick={() => patch(p.id, { pinned: !p.pinned })}>{p.pinned ? 'Unpin' : 'Pin'}</button>
                  <button className="text-gray-500" onClick={() => act(p.id, 'POST')}>Duplicate</button>
                  <button className="text-red-500" onClick={() => confirm(`Delete "${p.name}"?`) && act(p.id, 'DELETE')}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold mb-4">Edit product</h2>
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
