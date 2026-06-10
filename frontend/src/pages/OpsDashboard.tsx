import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi, storeApi, reportApi } from '../services/api';
import { OpsDashboard as OpsType, StoreOpsData, Store, Indicator } from '../types';
import { TrafficLight } from '../components/shared/StatusBadge';
import { Spinner } from '../components/shared/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import { useSocket } from '../hooks/useSocket';

const PIE_COLORS = ['#16a34a', '#ca8a04', '#dc2626', '#f97316'];
type DatePreset = 'today' | 'week' | 'month' | 'custom';
type ViewMode   = 'cards' | 'bar' | 'table';

// ── Store Card ─────────────────────────────────────────────────────────────────
const CARD_BG: Record<Indicator, string> = {
  GREEN: 'border-green-200 bg-green-50',
  AMBER: 'border-yellow-200 bg-yellow-50',
  RED:   'border-red-200 bg-red-50',
};
const PROG_CLR: Record<Indicator, string> = { GREEN: 'bg-green-500', AMBER: 'bg-yellow-400', RED: 'bg-red-500' };

const StoreCard = ({ d, onDrill }: { d: StoreOpsData; onDrill: (id: string) => void }) => (
  <div className={`rounded-2xl border-2 p-4 transition-all hover:shadow-md ${CARD_BG[d.indicator]}`}>
    <div className="flex items-start justify-between mb-2">
      <div>
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{d.store.name}</h3>
        <p className="text-xs text-gray-500">{d.store.city}</p>
      </div>
      <TrafficLight indicator={d.indicator} percentage={d.percentage} size="sm" />
    </div>

    <div className="w-full bg-white/60 rounded-full h-2 mb-3">
      <div className={`h-2 rounded-full ${PROG_CLR[d.indicator]}`} style={{ width: `${Math.min(d.percentage, 100)}%` }} />
    </div>

    <div className="grid grid-cols-4 gap-1 text-center mb-3">
      {[
        { l: 'Planned', v: d.totalPlanned, c: 'text-gray-700' },
        { l: 'Present', v: d.present,      c: 'text-green-700' },
        { l: 'Late',    v: d.late,          c: 'text-yellow-700' },
        { l: 'Absent',  v: d.absent,        c: 'text-red-700' },
      ].map(s => (
        <div key={s.l}>
          <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
          <p className="text-xs text-gray-400">{s.l}</p>
        </div>
      ))}
    </div>

    {d.roleBreakdown.length > 0 && (
      <div className="space-y-1.5 mb-3">
        {d.roleBreakdown.map(rb => (
          <div key={rb.role} className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-28 truncate">{rb.role.replace(/_/g, ' ')}</span>
            <div className="flex-1 bg-white/50 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-red-500" style={{ width: rb.planned ? `${Math.min(rb.actual / rb.planned * 100, 100)}%` : '0%' }} />
            </div>
            <span className="text-gray-600 font-medium w-8 text-right">{rb.actual}/{rb.planned}</span>
          </div>
        ))}
      </div>
    )}

    <button onClick={() => onDrill(d.store.id)} className="w-full text-xs font-semibold text-red-600 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
      View Details →
    </button>
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
export const OpsDashboard = () => {
  const [ops, setOps]             = useState<OpsType | null>(null);
  const [stores, setStores]       = useState<Store[]>([]);
  const [loading, setLoading]     = useState(true);
  const [preset, setPreset]       = useState<DatePreset>('today');
  const [selStore, setSelStore]   = useState('');
  const [startDate, setStart]     = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate,   setEnd]       = useState(format(new Date(), 'yyyy-MM-dd'));
  const [view, setView]           = useState<ViewMode>('cards');
  const [exporting, setExporting] = useState(false);

  const getRange = useCallback(() => {
    const today = new Date();
    switch (preset) {
      case 'today':  return { s: format(today, 'yyyy-MM-dd'), e: format(today, 'yyyy-MM-dd') };
      case 'week':   return { s: format(startOfWeek(today), 'yyyy-MM-dd'), e: format(today, 'yyyy-MM-dd') };
      case 'month':  return { s: format(startOfMonth(today), 'yyyy-MM-dd'), e: format(today, 'yyyy-MM-dd') };
      case 'custom': return { s: startDate, e: endDate };
    }
  }, [preset, startDate, endDate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { s, e } = getRange();
      const params: Record<string, string> = {};
      if (selStore) params.storeId = selStore;

      if (preset === 'today') {
        params.date = s;
        const r = await dashboardApi.getOps(params);
        setOps(r.data);
      } else {
        const r = await dashboardApi.getOpsRange({ startDate: s, endDate: e, ...params });
        const rd = r.data;
        setOps({
          date: `${s} → ${e}`,
          stores: rd.storeBreakdown.map((sb: Record<string, unknown>) => ({
            store: sb.store,
            totalPlanned: sb.planned,
            present: sb.present,
            late: sb.late,
            earlyExit: sb.earlyExit,
            absent: sb.absent,
            percentage: sb.compliance,
            indicator: (sb.compliance as number) >= 90 ? 'GREEN' : (sb.compliance as number) >= 70 ? 'AMBER' : 'RED',
            roleBreakdown: [],
          })) as StoreOpsData[],
          summary: { planned: rd.summary.totalPlanned, present: rd.summary.totalPresent, late: rd.summary.totalLate, earlyExit: rd.summary.totalEarlyExit, absent: rd.summary.totalAbsent, compliance: rd.summary.compliance },
        });
      }
    } catch { /**/ }
    finally { setLoading(false); }
  }, [getRange, preset, selStore]);

  useEffect(() => { storeApi.getAll().then(r => setStores(r.data)); }, []);
  useEffect(() => { load(); }, [load]);
  useSocket('ops', load); // refresh on any real-time event

  const doExport = async (fmt: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      const { s, e } = getRange();
      const params: Record<string, string> = { startDate: s, endDate: e, format: fmt };
      if (selStore) params.storeId = selStore;
      const r = await reportApi.exportDirect(params);
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `attendance_${s}_${e}.${fmt}`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
    finally { setExporting(false); }
  };

  const barData = ops?.stores.map(s => ({
    name: s.store.name.replace('Licious ', ''),
    Planned: s.totalPlanned, Present: s.present, Late: s.late, Absent: s.absent,
  })) ?? [];

  const pieData = ops ? [
    { name: 'Present (on-time)', value: ops.summary.present - ops.summary.late },
    { name: 'Late',              value: ops.summary.late },
    { name: 'Absent',            value: ops.summary.absent },
    { name: 'Early Exit',        value: ops.summary.earlyExit },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky filter bar */}
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Central Ops Dashboard</h1>
              <p className="text-xs text-gray-500">Live attendance across all Licious stores</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Date preset */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {(['today','week','month','custom'] as DatePreset[]).map(p => (
                  <button key={p} onClick={() => setPreset(p)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${preset === p ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              {/* Store filter */}
              <select value={selStore} onChange={e => setSelStore(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {/* View mode */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {(['cards','bar','table'] as ViewMode[]).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              {/* Export */}
              <button onClick={() => doExport('xlsx')} disabled={exporting}
                className="px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                {exporting ? <Spinner size="sm" /> : '↓'} XLSX
              </button>
              <button onClick={() => doExport('csv')} disabled={exporting}
                className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                ↓ CSV
              </button>
            </div>
          </div>
          {preset === 'custom' && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-500">From</span>
              <input type="date" value={startDate} onChange={e => setStart(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500" />
              <span className="text-xs text-gray-500">to</span>
              <input type="date" value={endDate}   onChange={e => setEnd(e.target.value)}   className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64"><Spinner size="lg" text="Loading…" /></div>
        ) : !ops ? (
          <p className="text-center text-gray-500 py-20">Failed to load</p>
        ) : <>
          {/* Summary strip */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { l: 'Total Planned', v: ops.summary.planned,    c: 'text-gray-900',   bg: 'bg-white'      },
              { l: 'Present',       v: ops.summary.present,    c: 'text-green-700',  bg: 'bg-green-50'   },
              { l: 'Late',          v: ops.summary.late,       c: 'text-yellow-700', bg: 'bg-yellow-50'  },
              { l: 'Early Exit',    v: ops.summary.earlyExit,  c: 'text-orange-700', bg: 'bg-orange-50'  },
              { l: 'Absent',        v: ops.summary.absent,     c: 'text-red-700',    bg: 'bg-red-50'     },
              { l: '% Compliance',  v: `${ops.summary.compliance}%`, c: ops.summary.compliance >= 90 ? 'text-green-700' : ops.summary.compliance >= 70 ? 'text-yellow-700' : 'text-red-700', bg: 'bg-white' },
            ].map(c => (
              <div key={c.l} className={`${c.bg} rounded-2xl border border-gray-100 p-3 text-center`}>
                <p className="text-xs text-gray-500">{c.l}</p>
                <p className={`text-2xl font-bold mt-0.5 ${c.c}`}>{c.v}</p>
              </div>
            ))}
          </div>

          {/* Role-wise breakdown (today view only, has roleBreakdown data) */}
          {ops.stores.length > 0 && ops.stores[0].roleBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Role-wise Breakdown (All Stores)</h2>
              <div className="grid grid-cols-3 gap-4">
                {['STORE_MANAGER','SHIFT_SUPERVISOR','MEAT_TECHNICIAN'].map(role => {
                  const totalPlanned = ops.stores.reduce((s, st) => s + (st.roleBreakdown.find(r => r.role === role)?.planned ?? 0), 0);
                  const totalActual  = ops.stores.reduce((s, st) => s + (st.roleBreakdown.find(r => r.role === role)?.actual  ?? 0), 0);
                  const pct = totalPlanned ? Math.round(totalActual / totalPlanned * 100) : 0;
                  return (
                    <div key={role} className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">{role.replace(/_/g, ' ')}</p>
                      <p className="text-2xl font-bold text-gray-900">{totalActual}<span className="text-base font-normal text-gray-400">/{totalPlanned}</span></p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Cards view ── */}
          {view === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ops.stores.map(s => <StoreCard key={s.store.id} d={s} onDrill={() => {}} />)}
            </div>
          )}

          {/* ── Bar chart view ── */}
          {view === 'bar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Store-wise Comparison</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ right: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Planned" fill="#e5e7eb" radius={[4,4,0,0]} />
                    <Bar dataKey="Present" fill="#16a34a" radius={[4,4,0,0]} />
                    <Bar dataKey="Late"    fill="#ca8a04" radius={[4,4,0,0]} />
                    <Bar dataKey="Absent"  fill="#dc2626" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Overall Split</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-gray-600">{d.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Table view ── */}
          {view === 'table' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Store','City','Planned','Present','%','Late','Early Exit','Absent','Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ops.stores.map(s => (
                      <tr key={s.store.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.store.name}</td>
                        <td className="px-4 py-3 text-gray-500">{s.store.city}</td>
                        <td className="px-4 py-3 text-gray-700">{s.totalPlanned}</td>
                        <td className="px-4 py-3 text-green-700 font-semibold">{s.present}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${s.percentage >= 90 ? 'text-green-700' : s.percentage >= 70 ? 'text-yellow-700' : 'text-red-700'}`}>{s.percentage}%</span>
                        </td>
                        <td className="px-4 py-3 text-yellow-700">{s.late}</td>
                        <td className="px-4 py-3 text-orange-700">{s.earlyExit}</td>
                        <td className="px-4 py-3 text-red-700">{s.absent}</td>
                        <td className="px-4 py-3"><TrafficLight indicator={s.indicator} percentage={s.percentage} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>}
      </div>
    </div>
  );
};
