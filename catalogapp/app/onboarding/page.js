'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Kirana / General Store', 'Home Food / Tiffin', 'Bakery', 'Boutique / Fashion', 'Electronics', 'Handicrafts / Artisan', 'Jewelry', 'Other'];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState('phone'); // phone | otp | profile
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState({ business_name: '', category: CATEGORIES[0], whatsapp: '', city: '', language: 'en' });

  async function post(url, body, method = 'POST') {
    setBusy(true);
    setError('');
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return null;
    }
    return data;
  }

  async function sendOtp(e) {
    e.preventDefault();
    const data = await post('/api/auth/send-otp', { phone });
    if (data) {
      setHint(data.demo_hint || '');
      setStep('otp');
    }
  }

  async function verify(e) {
    e.preventDefault();
    const data = await post('/api/auth/verify', { phone, code });
    if (data) {
      if (data.isNew) {
        setProfile((p) => ({ ...p, whatsapp: phone }));
        setStep('profile');
      } else {
        router.push('/dashboard');
      }
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    const data = await post('/api/seller', profile, 'PATCH');
    if (data) router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center">📦 CatalogApp</h1>

        {step === 'phone' && (
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              WhatsApp / Phone number
              <input className="input mt-1" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send OTP'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verify} className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to {phone}</p>
            {hint && <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">{hint}</p>}
            <input className="input text-center tracking-[0.5em] text-lg" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required />
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Verifying…' : 'Verify & Continue'}</button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">Tell us about your business</p>
            <input className="input" placeholder="Business name *" value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} required />
            <select className="input" value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="input" placeholder="WhatsApp number for orders *" value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} required />
            <input className="input" placeholder="City" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            <div className="flex gap-2">
              {[['en', 'English'], ['hi', 'हिन्दी']].map(([v, label]) => (
                <button type="button" key={v} onClick={() => setProfile({ ...profile, language: v })}
                  className={profile.language === v ? 'btn-primary flex-1' : 'btn-secondary flex-1'}>
                  {label}
                </button>
              ))}
            </div>
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : 'Create my catalog'}</button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
      </div>
    </main>
  );
}
