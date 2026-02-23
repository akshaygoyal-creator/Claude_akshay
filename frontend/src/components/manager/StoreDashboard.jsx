import React, { useState, useEffect, useCallback } from 'react';
import { attendanceApi } from '../../utils/api';
import { formatTime, formatDate, complianceColor, today } from '../../utils/helpers';
import ComplianceBar from '../shared/ComplianceBar';
import StatusBadge from '../shared/StatusBadge';
import OverrideModal from './OverrideModal';

const ROLE_ICONS = {
  'Store Manager': '👔',
  'Shift Supervisor': '🎯',
  'Meat Technician': '🔪',
};

export default function StoreDashboard({ store }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today());
  const [activeTab, setActiveTab] = useState('overview'); // overview | employees
  const [filterStatus, setFilterStatus] = useState('all');
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(() => {
    setLoading(true);
    attendanceApi.getStoreSummary(store.id, { date })
      .then(d => { setData(d); setLastRefresh(new Date()); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [store.id, date]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const filteredRecords = data ? (filterStatus === 'all'
    ? data.records
    : data.records.filter(r => r.status === filterStatus)) : [];

  const filteredNotCheckedIn = data ? (filterStatus === 'all' || filterStatus === 'Absent'
    ? data.notCheckedIn : []) : [];

  const totalPresent = data ? data.records.filter(r => ['Present', 'Late'].includes(r.status)).length : 0;
  const totalPlanned = data?.shiftSummary?.reduce((s, sh) => s + sh.planned, 0) || 0;
  const compliance = totalPlanned > 0 ? Math.round((totalPresent / totalPlanned) * 100) : 0;
  const colors = complianceColor(compliance);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-licious-red px-4 pt-10 pb-5">
        <h1 className="text-white font-black text-xl">{store.name}</h1>
        <p className="text-red-200 text-sm">{store.city} · Store Manager View</p>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-red-700 text-white text-sm rounded-xl px-3 py-1.5 border border-red-500 focus:outline-none"
          />
          <button onClick={load} className="bg-red-700 text-white text-xs rounded-xl px-3 py-1.5 border border-red-500">
            Refresh
          </button>
          <span className="text-red-300 text-xs ml-auto">↻ {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-licious-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && data && (
        <div className="px-4 py-4 space-y-4 pb-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`card ${colors.border}`}>
              <p className="text-xs text-gray-500 mb-1">Compliance</p>
              <p className={`text-3xl font-black ${colors.text}`}>{compliance}%</p>
              <ComplianceBar pct={compliance} present={totalPresent} planned={totalPlanned} showLabel={false} />
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 mb-1">Present / Planned</p>
              <p className="text-3xl font-black text-gray-900">{totalPresent}<span className="text-lg text-gray-400">/{totalPlanned}</span></p>
              <p className="text-xs text-gray-500">{data.totalLate} late · {data.totalEarlyExit} early exit</p>
            </div>
            <div className="card border-red-100">
              <p className="text-xs text-gray-500 mb-1">Absent</p>
              <p className="text-3xl font-black text-red-600">{data.totalAbsent}</p>
            </div>
            <div className="card border-amber-100">
              <p className="text-xs text-gray-500 mb-1">Not Checked In</p>
              <p className="text-3xl font-black text-amber-600">{data.notCheckedInCount}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['overview', 'employees'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors capitalize
                  ${activeTab === tab ? 'bg-white shadow text-licious-red' : 'text-gray-500'}`}
              >{tab === 'overview' ? 'Shifts & Roles' : 'Employee List'}</button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* By Shift */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">By Shift</h3>
                <div className="space-y-2">
                  {data.shiftSummary.map(sh => {
                    const c = complianceColor(sh.pct);
                    return (
                      <div key={sh.id} className={`card ${c.border}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{sh.name}</p>
                            <p className="text-xs text-gray-500">{sh.start_time} – {sh.end_time}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${c.light} ${c.text}`}>
                            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                            {sh.pct}%
                          </div>
                        </div>
                        <ComplianceBar pct={sh.pct} present={sh.present} planned={sh.planned} />
                        {sh.late > 0 && <p className="text-xs text-amber-600 mt-1">{sh.late} late arrival{sh.late > 1 ? 's' : ''}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Role */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">By Role</h3>
                <div className="space-y-2">
                  {data.roleSummary.map(r => {
                    const pct = r.planned > 0 ? Math.round((r.present / r.planned) * 100) : 0;
                    const c = complianceColor(pct);
                    return (
                      <div key={r.role} className="card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{ROLE_ICONS[r.role]}</span>
                            <p className="font-medium text-gray-800 text-sm">{r.role}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{r.present}/{r.planned}</span>
                        </div>
                        <ComplianceBar pct={pct} present={r.present} planned={r.planned} />
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          {r.late > 0 && <span className="text-amber-600">{r.late} late</span>}
                          {r.absent > 0 && <span className="text-red-600">{r.absent} absent</span>}
                          {r.notCheckedIn > 0 && <span className="text-gray-500">{r.notCheckedIn} not checked in</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="space-y-3">
              {/* Filter */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'Present', 'Late', 'Absent', 'Early Exit'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                      ${filterStatus === s
                        ? 'bg-licious-red text-white'
                        : 'bg-white border border-gray-200 text-gray-600'}`}
                  >{s === 'all' ? 'All' : s}</button>
                ))}
              </div>

              {/* Records */}
              {filteredRecords.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{r.employee_name}</p>
                      <p className="text-xs text-gray-500">{ROLE_ICONS[r.role]} {r.role} · {r.shift_name}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                        {r.check_in_time && <span>In: {formatTime(r.check_in_time)}</span>}
                        {r.check_out_time && <span>Out: {formatTime(r.check_out_time)}</span>}
                        {r.login_method && <span className="text-gray-400">· {r.login_method}</span>}
                      </div>
                      {r.is_override ? <p className="text-xs text-blue-600 mt-1">🔧 Override: {r.override_reason}</p> : null}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={r.status} />
                      <button
                        onClick={() => setOverrideTarget(r)}
                        className="text-xs text-licious-red hover:underline"
                      >Override</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Not Checked In */}
              {(filterStatus === 'all' || filterStatus === 'Absent') && filteredNotCheckedIn.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 px-1 mb-2">NOT YET CHECKED IN ({filteredNotCheckedIn.length})</p>
                  {filteredNotCheckedIn.map(e => (
                    <div key={e.id} className="card border-gray-100 mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">{e.name}</p>
                          <p className="text-xs text-gray-400">{ROLE_ICONS[e.role]} {e.role}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="badge bg-gray-100 text-gray-500">Not Checked In</span>
                          <button
                            onClick={() => setOverrideTarget({ ...e, employee_name: e.name })}
                            className="text-xs text-licious-red hover:underline"
                          >Override</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredRecords.length === 0 && filteredNotCheckedIn.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p>No records found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Override Modal */}
      {overrideTarget && (
        <OverrideModal
          employee={overrideTarget}
          date={date}
          currentStatus={overrideTarget.status}
          onClose={() => setOverrideTarget(null)}
          onSuccess={() => { setOverrideTarget(null); load(); }}
        />
      )}
    </div>
  );
}
