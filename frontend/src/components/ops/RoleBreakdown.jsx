import React from 'react';
import ComplianceBar from '../shared/ComplianceBar';
import { complianceColor } from '../../utils/helpers';

const ROLES = ['Store Manager', 'Shift Supervisor', 'Meat Technician'];
const ROLE_ICONS = { 'Store Manager': '👔', 'Shift Supervisor': '🎯', 'Meat Technician': '🔪' };

export default function RoleBreakdown({ storesSummary }) {
  const roleTotals = ROLES.map(role => {
    const planned = storesSummary.reduce((sum, s) => sum + (s.roleSummary.find(r => r.role === role)?.planned || 0), 0);
    const present = storesSummary.reduce((sum, s) => sum + (s.roleSummary.find(r => r.role === role)?.present || 0), 0);
    const pct = planned > 0 ? Math.round((present / planned) * 100) : 0;
    return { role, planned, present, pct };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-sm font-bold text-gray-700 mb-3">Role-wise Breakdown (All Stores)</p>
      <div className="space-y-3">
        {roleTotals.map(r => {
          const colors = complianceColor(r.pct);
          return (
            <div key={r.role}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{ROLE_ICONS[r.role]}</span>
                  <span className="text-sm font-medium text-gray-700">{r.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{r.present}/{r.planned}</span>
                  <span className={`badge text-xs ${colors.light} ${colors.text}`}>{r.pct}%</span>
                </div>
              </div>
              <ComplianceBar pct={r.pct} present={r.present} planned={r.planned} showLabel={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
