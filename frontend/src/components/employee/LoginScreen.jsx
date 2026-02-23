import React, { useState } from 'react';
import { attendanceApi } from '../../utils/api';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('phone'); // 'phone' | 'otp' | 'face'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('enter_phone'); // 'enter_phone' | 'enter_otp'

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    setLoading(true); setError('');
    try {
      const res = await attendanceApi.sendOtp(phone);
      setDemoOtp(res.otp_demo); // Demo only
      setStep('enter_otp');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await attendanceApi.verifyOtp(phone, otp);
      onLogin(res.employee, 'OTP');
    } catch (e) {
      setError(e.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleFaceScan = async () => {
    setLoading(true); setError('');
    // Simulated face biometric — in production integrate with a real face recognition SDK
    await new Promise(r => setTimeout(r, 2000));
    // For demo: prompt for phone to identify employee
    setLoading(false);
    setMode('face_fallback');
  };

  const handleFaceLogin = async () => {
    if (!phone || phone.length < 10) { setError('Enter registered phone for face login'); return; }
    setLoading(true); setError('');
    try {
      const emp = await fetch(`/api/employees/lookup/phone/${phone}`).then(r => r.json());
      if (emp.error) throw new Error(emp.error);
      setLoading(false);
      onLogin(emp, 'Face Biometric');
    } catch (e) {
      setError(e.message || 'Face authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-licious-red to-red-900 flex flex-col">
      {/* Header */}
      <div className="pt-16 pb-8 px-6 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow">
          <span className="text-2xl font-black text-licious-red">L</span>
        </div>
        <h1 className="text-2xl font-black text-white">Attendance</h1>
        <p className="text-red-200 text-sm mt-1">Mark your attendance securely</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-6">
        {/* Login method tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('phone'); setStep('enter_phone'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === 'phone' || mode === 'face_fallback' ? '' : 'text-gray-500'} ${mode === 'phone' || mode === 'face_fallback' ? 'bg-white shadow text-licious-red' : ''}`}
          >OTP Login</button>
          <button
            onClick={() => { setMode('face'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === 'face' ? 'bg-white shadow text-licious-red' : 'text-gray-500'}`}
          >Face Scan</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* OTP Flow */}
        {(mode === 'phone') && (
          <div className="space-y-4">
            {step === 'enter_phone' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter phone number"
                      className="flex-1 px-4 py-3 text-gray-900 focus:outline-none text-base"
                    />
                  </div>
                </div>
                <button onClick={handleSendOtp} disabled={loading} className="btn-primary">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            )}

            {step === 'enter_otp' && (
              <>
                <p className="text-sm text-gray-600 text-center">OTP sent to +91 {phone}</p>
                {demoOtp && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-600 font-medium">Demo OTP</p>
                    <p className="text-2xl font-bold text-blue-800 tracking-widest">{demoOtp}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="tel"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit OTP"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-licious-red"
                  />
                </div>
                <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary">
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button onClick={() => setStep('enter_phone')} className="btn-secondary">
                  Back
                </button>
              </>
            )}
          </div>
        )}

        {/* Face Scan */}
        {mode === 'face' && (
          <div className="space-y-4 text-center">
            <div
              onClick={handleFaceScan}
              className={`w-48 h-48 mx-auto rounded-full border-4 flex items-center justify-center cursor-pointer transition-all
                ${loading ? 'border-licious-red animate-pulse bg-red-50' : 'border-gray-200 hover:border-licious-red bg-gray-50'}`}
            >
              {loading ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-licious-red border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-licious-red font-medium">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <svg className="w-16 h-16 text-gray-300 mx-auto -mt-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 mt-2 font-medium">Tap to scan face</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">Position your face in the circle</p>
          </div>
        )}

        {/* Face fallback — confirm identity by phone */}
        {mode === 'face_fallback' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 text-center">
              Face scan completed. Confirm your identity.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Phone Number</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter phone number"
                  className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
                />
              </div>
            </div>
            <button onClick={handleFaceLogin} disabled={loading} className="btn-primary">
              {loading ? 'Authenticating...' : 'Confirm Face Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
