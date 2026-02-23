import React from 'react';
import { complianceColor } from '../../utils/helpers';

export default function ComplianceBar({ pct, present, planned, showLabel = true }) {
  const colors = complianceColor(pct);
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${colors.text}`}>{pct}% staffed</span>
          <span className="text-xs text-gray-500">{present}/{planned}</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colors.bg}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
