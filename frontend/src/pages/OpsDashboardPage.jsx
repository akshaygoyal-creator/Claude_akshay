import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi, storesApi } from '../utils/api';
import { today, formatDate, downloadCsv } from '../utils/helpers';
import StoreCard from '../components/ops/StoreCard';
import AggregateMetrics from '../components/ops/AggregateMetrics';
import RoleBreakdown from '../components/ops/RoleBreakdown';
import ComplianceBar from '../components/shared/ComplianceBar';

const PRESETS = [
  { label: 'Today', getValue: () => ({ date: today() }) },
  { label: 'Yesterday', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { date: d.toISOString().split('T')[0] }; } },
  {
    label: 'This Week', getValue: () => {
      const now = new Date();
      const start = new Date(now); start.setDate(now.getDate() - now.getDay());
      return { date_from: start.toISOString().split('T')[0], date_to: today() };
    }
  },
  {
    label: 'This Month', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { date_from: start.toISOString().split('T')[0], date_to: today() };
    }
  },
];

export default function OpsDashboardPage() {
  const [data, setData] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('stores'); // stores | roles | table
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Filters
  const [preset, setPreset] = useState('Today');
  const [filterStoreId, setFilterStoreId] = useState('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    storesApi.getAll().then(setStores).catch(console.error);
  }, []);

  const getDateParams = useCallback(() => {
    if (useCustom && customFrom && customTo) {
      return { date_from: customFrom, date_to: customTo };
    }
    const p = PRESETS.find(p => p.label === preset);
    return p ? p.getValue() : { date: today() };
  }, [preset, customFrom, customTo, useCustom]);

  const load = useCallback(() => {
    setLoading(true);
    const params = { ...getDateParams() };
    if (filterStoreId) params.store_id = filterStoreId;
    attendanceApi.getOpsSummary(params)
      .then(d => { setData(d); setLastRefresh(new Date()); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getDateParams, filterStoreId]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 2 min
  useEffect(() => {
    const t = setInterval(load, 120000);
    return () => clearInterval(t);
  }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { ...getDateParams() };
      if (filterStoreId) params.store_id = filterStoreId;
      const blob = await attendanceApi.export(params);
      const filename = `licious-attendance-${today()}.csv`;
      downloadCsv(blob, filename);
    } catch (e) {
      console.error('Export failed', e);
    } finally { setExporting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-licious-red px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-1">
          <Link to="/" className="text-red-200 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </Link>
          <div className="text-center flex-1 mx-3">
            <h1 className="text-white font-black text-lg">Central Ops</h1>
            <p className="text-red-200 text-xs">Real-time attendance across all stores</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-1"
          >
            {exporting
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            Export CSV
          </button>
        </div>
        <p className="text-red-300 text-xs text-center">↻ {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Filters</p>
            <button onClick={load} className="text-xs text-licious-red font-medium">Apply</button>
          </div>

          {/* Date Presets */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => { setPreset(p.label); setUseCustom(false); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${preset === p.label && !useCustom
                    ? 'bg-licious-red text-white'
                    : 'bg-gray-100 text-gray-600'}`}
              >{p.label}</button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${useCustom ? 'bg-licious-red text-white' : 'bg-gray-100 text-gray-600'}`}
            >Custom Range</button>
          </div>

          {/* Custom Range */}
          {useCustom && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-licious-red" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-licious-red" />
              </div>
            </div>
          )}

          {/* Store Filter */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Store</label>
            <select
              value={filterStoreId}
              onChange={e => setFilterStoreId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-licious-red bg-white"
            >
              <option value="">All Stores</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-licious-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Aggregate Metrics */}
            <AggregateMetrics aggregate={data.aggregate} stores={data.stores} />

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {[
                { key: 'stores', label: 'Store Cards' },
                { key: 'roles', label: 'Role Breakdown' },
                { key: 'table', label: 'Table View' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors
                    ${activeTab === tab.key ? 'bg-white shadow text-licious-red' : 'text-gray-500'}`}
                >{tab.label}</button>
              ))}
            </div>

            {/* Store Cards */}
            {activeTab === 'stores' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.stores.map(s => (
                  <StoreCard key={s.store.id} data={s} onClick={() => {}} />
                ))}
              </div>
            )}

            {/* Role Breakdown */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <RoleBreakdown storesSummary={data.stores} />
                {/* Per-store role breakdown */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Per Store</p>
                  <div className="space-y-2">
                    {data.stores.map(s => (
                      <div key={s.store.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                        <p className="font-semibold text-sm text-gray-800 mb-2">{s.store.name.replace('Licious - ', '')} <span className="text-gray-400 font-normal">· {s.store.city}</span></p>
                        <div className="space-y-1.5">
                          {s.roleSummary.map(r => {
                            const pct = r.planned > 0 ? Math.round((r.present / r.planned) * 100) : 0;
                            return (
                              <div key={r.role} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-32 flex-shrink-0">{r.role}</span>
                                <div className="flex-1">
                                  <ComplianceBar pct={pct} present={r.present} planned={r.planned} showLabel={false} />
                                </div>
                                <span className="text-xs font-medium text-gray-700 w-10 text-right">{r.present}/{r.planned}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Table View */}
            {activeTab === 'table' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Store</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">City</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Planned</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Present</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Late</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Absent</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Early Exit</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Compliance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.stores.map(s => {
                        const c = s.compliance >= 80 ? 'text-green-700' : s.compliance >= 50 ? 'text-amber-700' : 'text-red-700';
                        return (
                          <tr key={s.store.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.store.name.replace('Licious - ', '')}</td>
                            <td className="px-4 py-3 text-gray-500">{s.store.city}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{s.totalPlanned}</td>
                            <td className="px-4 py-3 text-right font-medium text-green-700">{s.totalPresent}</td>
                            <td className="px-4 py-3 text-right text-amber-700">{s.totalLate}</td>
                            <td className="px-4 py-3 text-right text-red-700">{s.totalAbsent}</td>
                            <td className="px-4 py-3 text-right text-orange-700">{s.totalEarlyExit}</td>
                            <td className={`px-4 py-3 text-right font-bold ${c}`}>{s.compliance}%</td>
                          </tr>
                        );
                      })}
                      {/* Totals Row */}
                      <tr className="bg-gray-50 font-bold">
                        <td className="px-4 py-3 text-gray-900" colSpan={2}>Total</td>
                        <td className="px-4 py-3 text-right text-gray-900">{data.aggregate.totalPlanned}</td>
                        <td className="px-4 py-3 text-right text-green-700">{data.aggregate.totalPresent}</td>
                        <td className="px-4 py-3 text-right text-amber-700">{data.aggregate.totalLate}</td>
                        <td className="px-4 py-3 text-right text-red-700">{data.aggregate.totalAbsent}</td>
                        <td className="px-4 py-3 text-right text-orange-700">{data.aggregate.totalEarlyExit}</td>
                        <td className={`px-4 py-3 text-right ${data.aggregate.compliance >= 80 ? 'text-green-700' : data.aggregate.compliance >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                          {data.aggregate.compliance}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
