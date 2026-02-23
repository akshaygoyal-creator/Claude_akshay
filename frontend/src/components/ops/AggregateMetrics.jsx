import React from 'react';
import { complianceColor } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export default function AggregateMetrics({ aggregate, stores }) {
  const colors = complianceColor(aggregate.compliance);

  const chartData = stores?.map(s => ({
    name: s.store.name.replace('Licious - ', ''),
    present: s.totalPresent,
    planned: s.totalPlanned,
    compliance: s.compliance,
  })) || [];

  const metrics = [
    { label: 'Total Planned', value: aggregate.totalPlanned, color: 'text-gray-700', bg: 'bg-gray-50' },
    { label: 'Present', value: aggregate.totalPresent, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Absent', value: aggregate.totalAbsent, color: 'text-red-700', bg: 'bg-red-50' },
    { label: 'Late', value: aggregate.totalLate, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Early Exit', value: aggregate.totalEarlyExit, color: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Compliance', value: `${aggregate.compliance}%`, color: colors.text, bg: colors.light },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {metrics.map(m => (
          <div key={m.label} className={`rounded-xl p-3 text-center ${m.bg}`}>
            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Store Compliance Overview</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 20, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip formatter={(v, n) => [`${v}${n === 'compliance' ? '%' : ''}`, n]} />
                <Bar dataKey="compliance" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.compliance >= 80 ? '#22c55e' : entry.compliance >= 50 ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
