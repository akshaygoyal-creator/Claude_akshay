import React from 'react';
import { complianceColor } from '../../utils/helpers';
import ComplianceBar from '../shared/ComplianceBar';

const ROLE_ICONS = { 'Store Manager': '👔', 'Shift Supervisor': '🎯', 'Meat Technician': '🔪' };

export default function StoreCard({ data, onClick }) {
  const { store, totalPlanned, totalPresent, totalLate, totalEarlyExit, totalAbsent, compliance, statusColor, roleSummary } = data;
  const colors = complianceColor(compliance);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border-2 ${colors.border} shadow-sm p-4 cursor-pointer hover:shadow-md transition-all group`}
    >
      {/* Store Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 text-sm truncate group-hover:text-licious-red transition-colors">
            {store.name}
          </p>
          <p className="text-xs text-gray-500">{store.city}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ml-2 flex-shrink-0 ${colors.light} ${colors.text}`}>
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          {compliance}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <ComplianceBar pct={compliance} present={totalPresent} planned={totalPlanned} />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span className="text-green-600 font-medium">{totalPresent} present</span>
        {totalLate > 0 && <span className="text-amber-600">{totalLate} late</span>}
        {totalAbsent > 0 && <span className="text-red-600">{totalAbsent} absent</span>}
        {totalEarlyExit > 0 && <span className="text-orange-600">{totalEarlyExit} early exit</span>}
      </div>

      {/* Role Breakdown */}
      <div className="space-y-1">
        {roleSummary.map(r => (
          <div key={r.role} className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{ROLE_ICONS[r.role]} {r.role}</span>
            <span className={`font-medium ${r.present >= r.planned ? 'text-green-600' : 'text-red-600'}`}>
              {r.present}/{r.planned}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
