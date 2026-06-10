import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

type Method = 'password' | 'otp' | 'face';
const ROLE_REDIRECT: Record<string, string> = { MEAT_TECHNICIAN: '/employee', SHIFT_SUPERVISOR: '/manager', STORE_MANAGER: '/manager' };

export const LoginPage = () => {
  const { login, loginOtp } = useAuth();
  const nav = useNavigate();

  const [method, setMethod] = useState<Method>('password');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);

  const redirect = () => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    nav(ROLE_REDIRECT[u.role] || '/employee');
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(email, pass); redirect(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed'); }
    finally { setBusy(false); }
  };

  const handleSendOtp = async () => {
    if (!phone) { setErr('Enter phone number'); return; }
    setBusy(true); setErr('');
    try {
      const r = await authApi.sendOtp(phone);
      setOtpSent(true);
      if (r.data.otp) setDemoOtp(r.data.otp);
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to send OTP'); }
    finally { setBusy(false); }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await loginOtp(phone, otp); redirect(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Invalid OTP'); }
    finally { setBusy(false); }
  };

  const handleFace = async () => {
    setFaceScanning(true); setErr('');
    setTimeout(async () => {
      try {
        const empId = window.prompt('Enter your Employee Code for face verification:');
        if (!empId) { setFaceScanning(false); return; }
        // In production: capture real face image from camera stream
        const r = await authApi.verifyFace(empId, 'simulated_face_embedding');
        const { token, employee } = r.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(employee));
        nav(ROLE_REDIRECT[employee.role] || '/employee');
      } catch (e: unknown) {
        setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Face verification failed');
        setFaceScanning(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-3xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Licious Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to mark your attendance</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Method tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            {(['password','otp','face'] as Method[]).map(m => (
              <button key={m} onClick={() => { setMethod(m); setErr(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${method === m ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>
                {m === 'password' ? 'Password' : m === 'otp' ? 'OTP' : 'Face ID'}
              </button>
            ))}
          </div>

          {err && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}

          {/* ── Password ── */}
          {method === 'password' && (
            <form onSubmit={handlePassword} className="space-y-4">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <button type="submit" disabled={busy}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── OTP ── */}
          {method === 'otp' && (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="flex gap-2">
                <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button type="button" onClick={handleSendOtp} disabled={busy || otpSent}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap">
                  {otpSent ? 'Sent ✓' : 'Send'}
                </button>
              </div>
              {demoOtp && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                  Demo OTP: <strong className="font-mono">{demoOtp}</strong>
                </div>
              )}
              {otpSent && <>
                <input type="text" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button type="submit" disabled={busy || otp.length < 6}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {busy ? 'Verifying…' : 'Verify & Sign In'}
                </button>
              </>}
            </form>
          )}

          {/* ── Face ID ── */}
          {method === 'face' && (
            <div className="text-center space-y-5">
              <div className={`relative mx-auto w-36 h-36 rounded-full border-4 flex items-center justify-center bg-gray-50 ${faceScanning ? 'border-red-500' : 'border-gray-200'}`}>
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {faceScanning && <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-25" />}
              </div>
              <p className="text-sm text-gray-500">{faceScanning ? 'Scanning…' : 'Position your face and tap below'}</p>
              <button onClick={handleFace} disabled={faceScanning}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                {faceScanning ? 'Scanning…' : 'Start Face Scan'}
              </button>
            </div>
          )}

          {/* Demo creds */}
          <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-semibold">Ops Admin:</span> ops@licious.com / Licious@123</p>
              <p><span className="font-semibold">Store Mgr:</span> mgr01.licblr001@licious.com / Licious@123</p>
              <p><span className="font-semibold">Technician:</span> mt001.licblr001@licious.com / Licious@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
