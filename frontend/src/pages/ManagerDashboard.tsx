import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, attendanceApi } from '../services/api';
import { StoreDashboard, AttendanceStatus, Employee, AttendanceRecord } from '../types';
import { StatusBadge, TrafficLight } from '../components/shared/StatusBadge';
import { Spinner, PageSpinner } from '../components/shared/Spinner';
import { format, parseISO } from 'date-fns';
import { useSocket } from '../hooks/useSocket';

// ── Override Modal ─────────────────────────────────────────────────────────────
const OverrideModal = ({ recordId, onClose, onDone }: { recordId: string; onClose: () => void; onDone: () => void }) => {
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [reason, setReason] = useState('');
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState('');

  const save = async () => {
    if (!reason.trim()) { setErr('Please provide a reason'); return; }
    setBusy(true);
    try { await attendanceApi.override(recordId, status, reason); onDone(); onClose(); }
    catch { setErr('Failed to save override'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b">
          <h3 className="font-bold text-gray-900">Override Attendance</h3>
          <p className="text-xs text-gray-500 mt-0.5">Manually correct the attendance status for edge cases</p>
        </div>
        <div className="p-5 space-y-4">
          {err && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">New Status</p>
            <div className="grid grid-cols-2 gap-2">
              {(['PRESENT','LATE','ABSENT','EARLY_EXIT'] as AttendanceStatus[]).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`py-2.5 text-xs font-semibold rounded-xl border-2 ${status === s ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-600'}`}>
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Reason *</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="e.g. Network issue prevented biometric, employee was on-site"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>
        <div className="p-5 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
          <button onClick={save} disabled={busy} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {busy ? 'Saving…' : 'Save Override'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Employee Row ───────────────────────────────────────────────────────────────
const EmpRow = ({ emp, status, checkIn, checkOut, recordId, onOverride }: {
  emp: Employee | { name: string; role: string; type: string };
  status: string; checkIn?: string; checkOut?: string;
  recordId?: string; onOverride?: (id: string) => void;
}) => (
  <div className="flex items-center justify-between p-4 gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-600">
        {emp.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
        <p className="text-xs text-gray-500 truncate">{emp.role.replace(/_/g, ' ')} · {emp.type.replace(/_/g, ' ')}</p>
        {checkIn && <p className="text-xs text-gray-400">In: {format(parseISO(checkIn), 'h:mm a')}{checkOut ? ` · Out: ${format(parseISO(checkOut), 'h:mm a')}` : ''}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <StatusBadge status={status} />
      {recordId && onOverride && (
        <button onClick={() => onOverride(recordId)} title="Override" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'present' | 'absent' | 'late' | 'earlyExit';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [data, setData]         = useState<StoreDashboard | null>(null);
  const [loading, setLoading]   = useState(true);
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter]     = useState<FilterTab>('all');
  const [overrideId, setOvId]   = useState<string | null>(null);
  const [expandShift, setExpand]= useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.storeId) return;
    setLoading(true);
    try { setData((await dashboardApi.getStore(user.storeId, date)).data); }
    catch { /* show error */ }
    finally { setLoading(false); }
  }, [user?.storeId, date]);

  useEffect(() => { load(); }, [load]);
  useSocket(user?.storeId || null, load); // refresh on real-time events

  if (loading) return <PageSpinner text="Loading dashboard…" />;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500">Failed to load</div>;

  const { summary, shiftBreakdown, employeeLists, store } = data;

  const filterCounts = {
    all:       [...employeeLists.present, ...employeeLists.absent, ...employeeLists.notCheckedIn, ...employeeLists.earlyExit].length,
    present:   employeeLists.present.length,
    absent:    employeeLists.absent.length + employeeLists.notCheckedIn.length,
    late:      employeeLists.late.length,
    earlyExit: employeeLists.earlyExit.length,
  };

  const getRows = (): JSX.Element[] => {
    const toRecRow = (r: AttendanceRecord) => (
      <EmpRow key={r.id} emp={r.employee! as Employee} status={r.status}
        checkIn={r.checkInTime} checkOut={r.checkOutTime} recordId={r.id} onOverride={setOvId} />
    );
    const toEmpRow = (e: Employee, st: string) => (
      <EmpRow key={e.id} emp={e} status={st} />
    );
    switch (filter) {
      case 'present':   return employeeLists.present.map(toRecRow);
      case 'late':      return employeeLists.late.map(toRecRow);
      case 'earlyExit': return employeeLists.earlyExit.map(toRecRow);
      case 'absent':    return [...employeeLists.absent.map(e => toEmpRow(e as Employee, 'ABSENT')), ...employeeLists.notCheckedIn.map(e => toEmpRow(e as Employee, 'NOT_CHECKED_IN'))];
      default:          return [
        ...employeeLists.present.map(toRecRow),
        ...employeeLists.earlyExit.map(toRecRow),
        ...employeeLists.absent.map(e => toEmpRow(e as Employee, 'ABSENT')),
        ...employeeLists.notCheckedIn.map(e => toEmpRow(e as Employee, 'NOT_CHECKED_IN')),
      ];
    }
  };

  const indicatorBar = { GREEN: 'bg-green-500', AMBER: 'bg-yellow-400', RED: 'bg-red-500' }[summary.indicator];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky sub-header */}
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{store.name}</h1>
            <p className="text-xs text-gray-500">{store.address}, {store.city}</p>
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Planned',    val: summary.totalPlanned,  color: 'text-gray-900',    bg: 'bg-white'      },
            { label: 'Present',    val: summary.totalPresent,  color: 'text-green-700',   bg: 'bg-green-50'   },
            { label: 'Late',       val: summary.lateCount,     color: 'text-yellow-700',  bg: 'bg-yellow-50'  },
            { label: 'Absent',     val: summary.absentCount,   color: 'text-red-700',     bg: 'bg-red-50'     },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-2xl border border-gray-100 p-4`}>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.val}</p>
            </div>
          ))}
        </div>

        {/* Overall bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Overall Attendance</h2>
            <TrafficLight indicator={summary.indicator} percentage={summary.percentage} />
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full ${indicatorBar} transition-all`} style={{ width: `${summary.percentage}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{summary.totalPresent} of {summary.totalPlanned} planned headcount present · {summary.earlyExitCount} early exits</p>
        </div>

        {/* Shift breakdown */}
        <div className="space-y-2">
          <h2 className="font-bold text-gray-900">By Shift</h2>
          {shiftBreakdown.map(sb => (
            <div key={sb.shift.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                onClick={() => setExpand(expandShift === sb.shift.id ? null : sb.shift.id)}>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{sb.shift.name}</p>
                    <p className="text-xs text-gray-500">{sb.shift.startTime} – {sb.shift.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrafficLight indicator={sb.indicator} percentage={sb.percentage} size="sm" />
                  <span className="text-sm text-gray-400">{sb.present}/{sb.totalPlanned}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandShift === sb.shift.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandShift === sb.shift.id && (
                <div className="border-t border-gray-50 p-4 grid grid-cols-3 gap-3">
                  {sb.roleBreakdown.map(rb => (
                    <div key={rb.role} className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{rb.role.replace(/_/g, ' ')}</p>
                      <p className="text-xl font-bold text-gray-900">{rb.actual}<span className="text-sm font-normal text-gray-400">/{rb.planned}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Employee list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 mb-3">Employees</h2>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {(Object.entries(filterCounts) as [FilterTab, number][]).map(([k, v]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === k ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                  {k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')} ({v})
                </button>
              ))}
            </div>
          </div>
          {getRows().length === 0
            ? <p className="p-8 text-center text-sm text-gray-400">No employees in this category</p>
            : <div className="divide-y divide-gray-50">{getRows()}</div>
          }
        </div>
      </div>

      {overrideId && <OverrideModal recordId={overrideId} onClose={() => setOvId(null)} onDone={load} />}
    </div>
  );
};
