import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceApi, shiftApi } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Spinner } from '../components/shared/Spinner';
import { Shift, AttendanceRecord } from '../types';
import { format, parseISO } from 'date-fns';

type MsgType = 'ok' | 'warn' | 'err';

export const EmployeePage = () => {
  const { user } = useAuth();
  const geo = useGeolocation();

  const [shifts, setShifts]           = useState<Shift[]>([]);
  const [todayRecs, setTodayRecs]     = useState<AttendanceRecord[]>([]);
  const [history, setHistory]         = useState<AttendanceRecord[]>([]);
  const [selectedShift, setSelected]  = useState('');
  const [lm, setLm]                   = useState<'OTP' | 'FACE_BIOMETRIC'>('OTP');
  const [busy, setBusy]               = useState(false);
  const [msg, setMsg]                 = useState<{ type: MsgType; text: string } | null>(null);
  const [tab, setTab]                 = useState<'action' | 'history'>('action');

  const load = useCallback(async () => {
    if (!user) return;
    const [sr, tr, hr] = await Promise.all([
      shiftApi.getAll(user.storeId),
      attendanceApi.todayAttendance(),
      attendanceApi.myAttendance({ limit: '15' }),
    ]);
    setShifts(sr.data);
    setTodayRecs(tr.data);
    setHistory(hr.data);
    if (sr.data.length && !selectedShift) setSelected(sr.data[0].id);
  }, [user, selectedShift]);

  useEffect(() => { load(); geo.getLocation(); }, []); // eslint-disable-line

  const rec = todayRecs.find(r => r.shiftId === selectedShift);
  const checkedIn  = !!rec?.checkInTime;
  const checkedOut = !!rec?.checkOutTime;

  const handleCheckIn = async () => {
    if (!geo.lat || !geo.lng) { setMsg({ type: 'err', text: 'Cannot get your location. Enable GPS and try again.' }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await attendanceApi.checkIn({ shiftId: selectedShift, latitude: geo.lat, longitude: geo.lng, loginMethod: lm });
      setMsg({ type: r.data.isLate ? 'warn' : 'ok', text: r.data.message });
      await load();
    } catch (e: unknown) {
      setMsg({ type: 'err', text: (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Check-in failed' });
    } finally { setBusy(false); }
  };

  const handleCheckOut = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await attendanceApi.checkOut(selectedShift);
      setMsg({ type: r.data.isEarlyExit ? 'warn' : 'ok', text: r.data.message });
      await load();
    } catch (e: unknown) {
      setMsg({ type: 'err', text: (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Check-out failed' });
    } finally { setBusy(false); }
  };

  const shiftData = shifts.find(s => s.id === selectedShift);
  const today = format(new Date(), 'EEEE, d MMM yyyy');

  const msgCls: Record<MsgType, string> = {
    ok:   'bg-green-50  border-green-200  text-green-700',
    warn: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    err:  'bg-red-50    border-red-200    text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Today</p>
          <h1 className="text-lg font-bold text-gray-900">{today}</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            {user?.storeName}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {(['action','history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              {t === 'action' ? 'Check In / Out' : 'History'}
            </button>
          ))}
        </div>

        {tab === 'action' && <>
          {/* Today's records */}
          {todayRecs.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Today's Records</p>
              <div className="space-y-2">
                {todayRecs.map(r => (
                  <div key={r.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.shift?.name}</p>
                      <p className="text-xs text-gray-400">
                        {r.checkInTime && `In: ${format(parseISO(r.checkInTime), 'h:mm a')}`}
                        {r.checkOutTime && ` · Out: ${format(parseISO(r.checkOutTime), 'h:mm a')}`}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GPS status */}
          <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
            geo.loading ? 'bg-blue-50 border-blue-100' :
            geo.error   ? 'bg-red-50  border-red-100'  :
            geo.lat     ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
          }`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${geo.error ? 'bg-red-100' : geo.lat ? 'bg-green-100' : 'bg-gray-100'}`}>
              {geo.loading ? <Spinner size="sm" /> : (
                <svg className={`w-5 h-5 ${geo.error ? 'text-red-500' : geo.lat ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${geo.error ? 'text-red-700' : geo.lat ? 'text-green-700' : 'text-gray-600'}`}>
                {geo.loading ? 'Getting location…' : geo.error ? 'Location Error' : geo.lat ? 'Location Acquired' : 'Location Needed'}
              </p>
              <p className={`text-xs truncate ${geo.error ? 'text-red-500' : 'text-gray-400'}`}>
                {geo.error || (geo.lat ? `${geo.lat.toFixed(5)}, ${geo.lng?.toFixed(5)}` : 'Tap Enable to share GPS')}
              </p>
            </div>
            {(!geo.lat || geo.error) && (
              <button onClick={geo.getLocation} className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">Enable</button>
            )}
          </div>

          {/* Shift + method selector */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Shift</p>
              <div className="space-y-2">
                {shifts.map(s => {
                  const r = todayRecs.find(r => r.shiftId === s.id);
                  return (
                    <button key={s.id} onClick={() => setSelected(s.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${selectedShift === s.id ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.startTime} – {s.endTime}</p>
                      </div>
                      {r && <StatusBadge status={r.status} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Login Method</p>
              <div className="flex gap-2">
                {(['OTP','FACE_BIOMETRIC'] as const).map(m => (
                  <button key={m} onClick={() => setLm(m)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${lm === m ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>
                    {m === 'OTP' ? '📱 OTP' : '👤 Face ID'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shift info card */}
          {shiftData && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{shiftData.name}</p>
                  <p className="text-sm text-gray-500">{shiftData.startTime} → {shiftData.endTime}</p>
                </div>
                {rec && <StatusBadge status={rec.status} />}
              </div>
              {rec?.checkInTime && (
                <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Checked In</p>
                    <p className="text-base font-bold text-gray-900">{format(parseISO(rec.checkInTime), 'h:mm a')}</p>
                  </div>
                  {rec.checkOutTime && (
                    <div>
                      <p className="text-xs text-gray-400">Checked Out</p>
                      <p className="text-base font-bold text-gray-900">{format(parseISO(rec.checkOutTime), 'h:mm a')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {msg && <div className={`p-4 rounded-2xl border text-sm font-medium ${msgCls[msg.type]}`}>{msg.text}</div>}

          {/* Action buttons */}
          {!checkedIn && (
            <button onClick={handleCheckIn} disabled={busy || !geo.lat || !selectedShift}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-base hover:bg-red-700 disabled:opacity-50 active:scale-95 transition-all shadow-sm">
              {busy ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Checking in…</span> : '✓ Check In'}
            </button>
          )}
          {checkedIn && !checkedOut && (
            <button onClick={handleCheckOut} disabled={busy}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-base hover:bg-black disabled:opacity-50 active:scale-95 transition-all shadow-sm">
              {busy ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Checking out…</span> : '↩ Check Out'}
            </button>
          )}
          {checkedIn && checkedOut && (
            <div className="py-4 text-center font-semibold text-green-700 bg-green-50 rounded-2xl border border-green-200">
              ✓ Shift complete — have a great day!
            </div>
          )}
        </>}

        {tab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-700">Recent Attendance</p>
            </div>
            {history.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">No records yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.map(r => (
                  <div key={r.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.date}</p>
                      <p className="text-xs text-gray-500">{r.shift?.name}</p>
                      <p className="text-xs text-gray-400">
                        {r.checkInTime && `In: ${format(parseISO(r.checkInTime), 'h:mm a')}`}
                        {r.checkOutTime && ` · Out: ${format(parseISO(r.checkOutTime), 'h:mm a')}`}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
