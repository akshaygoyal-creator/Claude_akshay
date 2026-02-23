import React, { useState, useEffect } from 'react';
import { attendanceApi, shiftsApi } from '../../utils/api';
import { haversineDistance, formatTime } from '../../utils/helpers';

export default function CheckInScreen({ employee, loginMethod, onSuccess, onLogout }) {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [geoStatus, setGeoStatus] = useState('loading'); // loading | ok | error | outside
  const [distance, setDistance] = useState(null);
  const [shiftInfo, setShiftInfo] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Get geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setLocationError('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        const dist = Math.round(haversineDistance(latitude, longitude, employee.store_lat, employee.store_lng));
        setDistance(dist);
        if (dist <= employee.geofence_radius) {
          setGeoStatus('ok');
        } else {
          setGeoStatus('outside');
          setLocationError(`You are ${dist}m away. Must be within ${employee.geofence_radius}m of ${employee.store_name}.`);
        }
      },
      (err) => {
        // For demo: simulate being inside geofence
        setLocation({ lat: employee.store_lat + 0.00001, lng: employee.store_lng + 0.00001 });
        setDistance(5);
        setGeoStatus('ok');
        setLocationError('GPS permission denied — using demo location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [employee]);

  // Load shift and today's record
  useEffect(() => {
    shiftsApi.getForEmployee(employee.id).then(setShiftInfo).catch(console.error);
    attendanceApi.getAll({ employee_id: employee.id }).then(records => {
      const today = new Date().toISOString().split('T')[0];
      setTodayRecord(records.find(r => r.attendance_date === today) || null);
    }).catch(console.error);
  }, [employee.id]);

  const handleCheckIn = async () => {
    if (geoStatus === 'outside') { setError(locationError); return; }
    if (!location) { setError('Location not available'); return; }
    setLoading(true); setError('');
    try {
      const res = await attendanceApi.checkIn({
        employee_id: employee.id,
        lat: location.lat,
        lng: location.lng,
        login_method: loginMethod,
        shift_id: shiftInfo?.assignedShift?.id,
      });
      setSuccess(res);
      setTodayRecord({ ...todayRecord, check_in_time: new Date().toISOString(), status: res.status });
      if (onSuccess) onSuccess(res);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || 'Check-in failed');
    } finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    setLoading(true); setError('');
    try {
      const res = await attendanceApi.checkOut({ employee_id: employee.id });
      setSuccess({ ...res, isCheckout: true });
      setTodayRecord(prev => ({ ...prev, check_out_time: new Date().toISOString(), status: res.status }));
    } catch (e) {
      setError(e.response?.data?.error || 'Check-out failed');
    } finally { setLoading(false); }
  };

  const shift = shiftInfo?.assignedShift;
  const timeStr = now.toTimeString().slice(0, 5);
  const isLate = shift && timeStr > shift.start_time;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-licious-red px-4 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onLogout} className="text-red-200 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-white font-bold text-lg">{employee.name}</p>
            <p className="text-red-200 text-xs">{employee.role} · {employee.store_name}</p>
          </div>
          <div className="w-6" />
        </div>
        {/* Clock */}
        <div className="text-center">
          <p className="text-5xl font-black text-white tracking-tight">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
          <p className="text-red-200 text-sm mt-1">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 -mt-2">
        {/* Success Banner */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-green-800">{success.isCheckout ? 'Checked Out!' : 'Checked In!'}</p>
            <p className="text-green-600 text-sm mt-1">
              {success.isCheckout
                ? success.isEarlyExit ? '⚠️ Early exit recorded' : 'Have a great rest of your day!'
                : success.isLate ? `⚠️ Late arrival — ${success.shiftName}` : `On time — ${success.shiftName}`}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Geofence Status */}
        <div className={`card flex items-center gap-3 ${geoStatus === 'ok' ? 'border-green-200' : geoStatus === 'outside' ? 'border-red-200' : 'border-gray-200'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${geoStatus === 'ok' ? 'bg-green-100' : geoStatus === 'outside' ? 'bg-red-100' : 'bg-gray-100'}`}>
            {geoStatus === 'loading' && <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
            {geoStatus === 'ok' && <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            {geoStatus === 'outside' && <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            {geoStatus === 'error' && <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-800">
              {geoStatus === 'ok' ? `✓ Within geofence (${distance}m away)` : geoStatus === 'outside' ? `Outside geofence` : geoStatus === 'loading' ? 'Getting location...' : 'Location unavailable'}
            </p>
            <p className="text-xs text-gray-500 truncate">{employee.store_name} · {employee.address}</p>
            {locationError && geoStatus !== 'outside' && <p className="text-xs text-amber-600 mt-0.5">{locationError}</p>}
            {geoStatus === 'outside' && <p className="text-xs text-red-600 mt-0.5">{locationError}</p>}
          </div>
        </div>

        {/* Shift Info */}
        {shift && (
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-2">YOUR SHIFT</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{shift.name}</p>
                <p className="text-gray-500 text-sm">{shift.start_time} – {shift.end_time}</p>
              </div>
              <div className={`badge ${isLate ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {isLate ? 'Running Late' : 'On Time'}
              </div>
            </div>
          </div>
        )}
        {!shift && shiftInfo && (
          <div className="card border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-700 font-medium">No active shift at this time</p>
            {shiftInfo.allShifts?.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">Next: {shiftInfo.allShifts[0]?.name} at {shiftInfo.allShifts[0]?.start_time}</p>
            )}
          </div>
        )}

        {/* Today's Status */}
        {todayRecord && (
          <div className="card">
            <p className="text-xs text-gray-500 font-medium mb-2">TODAY'S ATTENDANCE</p>
            <div className="flex items-center gap-3">
              <div className={`badge ${todayRecord.status === 'Present' ? 'bg-green-100 text-green-700' : todayRecord.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                {todayRecord.status}
              </div>
              <div className="text-sm text-gray-600">
                {todayRecord.check_in_time && <span>In: {formatTime(todayRecord.check_in_time)}</span>}
                {todayRecord.check_out_time && <span className="ml-3">Out: {formatTime(todayRecord.check_out_time)}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Login Method Badge */}
        <div className="flex items-center gap-2 px-1">
          <div className="badge bg-gray-100 text-gray-600">
            {loginMethod === 'Face Biometric' ? '👤 Face Biometric' : '📱 OTP Login'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {!todayRecord?.check_in_time && (
            <button
              onClick={handleCheckIn}
              disabled={loading || geoStatus === 'outside' || geoStatus === 'loading'}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? 'Checking In...' : 'Check In'}
            </button>
          )}
          {todayRecord?.check_in_time && !todayRecord?.check_out_time && (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking Out...' : 'Check Out'}
            </button>
          )}
          {todayRecord?.check_out_time && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Attendance complete for today. See you tomorrow! 👋
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
