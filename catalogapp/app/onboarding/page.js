'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '../../lib/icons';

const CATEGORIES = ['Kirana / General Store', 'Home Food / Tiffin', 'Bakery', 'Boutique / Fashion', 'Electronics', 'Handicrafts / Artisan', 'Jewelry', 'Other'];
const STEPS = ['phone', 'otp', 'profile'];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState('phone');
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
    <main className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(107,78,255,0.10),transparent_70%)]">
      <div className="card w-full max-w-md p-8">
        <div className="flex flex-col items-center">
          <LogoMark className="w-12 h-12" />
          <h1 className="mt-3 text-xl font-extrabold tracking-tight">CatalogApp</h1>
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-violet' : 'w-1.5 bg-ink/10'}`}
              />
            ))}
          </div>
        </div>

        {step === 'phone' && (
          <form onSubmit={sendOtp} className="mt-7 space-y-4">
            <label className="label">
              WhatsApp / Phone number
              <input className="input mt-1.5" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send OTP'}</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verify} className="mt-7 space-y-4">
            <p className="text-sm text-ink/50 text-center">Enter the 6-digit OTP sent to <b className="text-ink/70">{phone}</b></p>
            {hint && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-center">{hint}</p>}
            <input className="input text-center tracking-[0.5em] text-lg font-bold" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required />
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Verifying…' : 'Verify & Continue'}</button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={saveProfile} className="mt-7 space-y-3.5">
            <p className="text-sm text-ink/50 text-center">Tell us about your business</p>
            <input className="input" placeholder="Business name *" value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} required />
            <select className="input" value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="input" placeholder="WhatsApp number for orders *" value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} required />
            <input className="input" placeholder="City" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            <div className="flex gap-2 p-1 bg-ink/5 rounded-full">
              {[['en', 'English'], ['hi', 'हिन्दी']].map(([v, label]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setProfile({ ...profile, language: v })}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                    profile.language === v ? 'bg-white shadow-sm text-ink' : 'text-ink/50'
                  }`}
                >
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
