'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import ProductForm from '../ProductForm';

const MAX_FILES = 20;
const MAX_SIZE = 10 * 1024 * 1024;

// Downscale to ≤1200px JPEG so uploads are light and AI extraction is fast.
function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });
}

export default function Upload() {
  const router = useRouter();
  const [tab, setTab] = useState('photos'); // photos | manual | csv
  const [cards, setCards] = useState([]); // {id, image, status: extracting|ready|saved|error, fields, error}
  const [message, setMessage] = useState('');
  const fileRef = useRef();
  const csvRef = useRef();

  async function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, MAX_FILES);
    setMessage('');
    const newCards = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        setMessage(`${file.name} is over 10MB — skipped`);
        continue;
      }
      try {
        const image = await toDataUrl(file);
        newCards.push({ id: crypto.randomUUID(), image, status: 'extracting', fields: null });
      } catch {
        setMessage(`${file.name} could not be read — skipped`);
      }
    }
    setCards((c) => [...c, ...newCards]);
    // AI extraction runs in parallel per photo
    newCards.forEach(async (card) => {
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: card.image }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        setCards((cs) =>
          cs.map((c) =>
            c.id === card.id
              ? {
                  ...c,
                  status: 'ready',
                  fields: {
                    name: d.fields.product_name || '',
                    category: d.fields.category || '',
                    description_en: d.fields.description_en || '',
                    description_hi: d.fields.description_hi || '',
                    price: d.fields.suggested_price_inr || '',
                    tags: d.fields.tags || [],
                  },
                  demo: d.fields.demo,
                }
              : c
          )
        );
      } catch (e) {
        setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, status: 'ready', fields: { name: '', tags: [] }, error: e.message } : c)));
      }
    });
  }

  async function saveCard(card, body) {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, image: card.image }),
    });
    if (res.ok) {
      setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, status: 'saved' } : c)));
    } else {
      setMessage((await res.json()).error);
    }
  }

  async function importCsv(file) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const idx = (name) => header.indexOf(name);
    if (idx('name') === -1) {
      setMessage('CSV must have a header row with at least a "name" column (name, price, description, category, image url)');
      return;
    }
    let ok = 0;
    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cols[idx('name')]?.trim(),
          price: idx('price') >= 0 ? cols[idx('price')]?.trim() : null,
          description_en: idx('description') >= 0 ? cols[idx('description')]?.trim() : '',
          category: idx('category') >= 0 ? cols[idx('category')]?.trim() : '',
          image: idx('image url') >= 0 ? cols[idx('image url')]?.trim() : '',
        }),
      });
      if (res.ok) ok++;
      else {
        setMessage((await res.json()).error);
        break;
      }
    }
    setMessage(`Imported ${ok} products from CSV`);
  }

  return (
    <div>
      <div className="flex gap-2">
        {[['photos', '📸 Upload Photos'], ['manual', '✍️ Manual Entry'], ['csv', '📄 CSV Import']].map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)} className={tab === v ? 'btn-primary' : 'btn-secondary'}>
            {label}
          </button>
        ))}
      </div>

      {message && <p className="mt-3 text-sm text-amber-700 bg-amber-50 rounded p-2">{message}</p>}

      {tab === 'photos' && (
        <div className="mt-4">
          <div
            className="card border-2 border-dashed border-gray-300 p-10 text-center cursor-pointer hover:border-wa"
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            <p className="text-3xl">📸</p>
            <p className="mt-2 font-semibold">Drag & drop or tap to select photos</p>
            <p className="text-xs text-gray-500 mt-1">Up to 20 photos · JPG, PNG, WEBP, HEIC · max 10MB each. AI fills in the details.</p>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="card p-4">
                {card.status === 'extracting' && (
                  <div className="flex items-center gap-3">
                    <img src={card.image} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <p className="text-sm text-gray-500 animate-pulse">🤖 AI is reading this photo…</p>
                  </div>
                )}
                {card.status === 'ready' && (
                  <>
                    {card.error && <p className="text-xs text-red-600 mb-2">AI failed ({card.error}) — fill in manually</p>}
                    {card.demo && <p className="text-xs text-amber-600 mb-2">Demo mode (no ANTHROPIC_API_KEY set) — fill in manually</p>}
                    <ProductForm initial={{ ...card.fields, image: card.image }} saveLabel="Save product" onSave={(body) => saveCard(card, body)} />
                  </>
                )}
                {card.status === 'saved' && (
                  <div className="flex items-center gap-3">
                    <img src={card.image} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <p className="text-sm text-green-600 font-semibold">✓ Saved to catalog</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {cards.length > 0 && cards.every((c) => c.status === 'saved') && (
            <button className="btn-primary mt-4" onClick={() => router.push('/dashboard')}>
              Done — view catalog
            </button>
          )}
        </div>
      )}

      {tab === 'manual' && (
        <div className="card mt-4 p-6 max-w-lg">
          <ProductForm
            saveLabel="Add product"
            onSave={async (body) => {
              const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              if (res.ok) router.push('/dashboard');
              else setMessage((await res.json()).error);
            }}
          />
        </div>
      )}

      {tab === 'csv' && (
        <div className="card mt-4 p-6 max-w-lg">
          <p className="text-sm text-gray-600">
            Upload a CSV with header columns: <code className="bg-gray-100 px-1 rounded">name, price, description, category, image url</code>
          </p>
          <input ref={csvRef} type="file" accept=".csv" className="mt-3" onChange={(e) => e.target.files[0] && importCsv(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}
