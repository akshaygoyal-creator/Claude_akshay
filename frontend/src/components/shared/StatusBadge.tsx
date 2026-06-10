import React from 'react';
import { AttendanceStatus, Indicator } from '../../types';

const BADGE: Record<string, { label: string; cls: string }> = {
  PRESENT:       { label: 'Present',       cls: 'bg-green-100  text-green-800  border border-green-200'  },
  LATE:          { label: 'Late',           cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  ABSENT:        { label: 'Absent',         cls: 'bg-red-100    text-red-800    border border-red-200'    },
  EARLY_EXIT:    { label: 'Early Exit',     cls: 'bg-orange-100 text-orange-800 border border-orange-200' },
  NOT_CHECKED_IN:{ label: 'Not Checked In', cls: 'bg-gray-100   text-gray-700   border border-gray-200'   },
};

export const StatusBadge = ({ status }: { status: AttendanceStatus | string }) => {
  const c = BADGE[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
};

const IND_STYLE: Record<Indicator, { dot: string; text: string; label: string }> = {
  GREEN: { dot: 'bg-green-500', text: 'text-green-700', label: 'On Track'    },
  AMBER: { dot: 'bg-yellow-400',text: 'text-yellow-700',label: 'Below Target' },
  RED:   { dot: 'bg-red-500',   text: 'text-red-700',   label: 'Critical'    },
};

export const TrafficLight = ({
  indicator, percentage, size = 'md',
}: { indicator: Indicator; percentage: number; size?: 'sm' | 'md' | 'lg' }) => {
  const s = IND_STYLE[indicator];
  const dot = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];
  return (
    <div className="flex items-center gap-2">
      <div className={`${dot} rounded-full ${s.dot} flex-shrink-0`} />
      <span className={`font-semibold text-sm ${s.text}`}>{percentage}%</span>
      {size !== 'sm' && <span className="text-xs text-gray-500">{s.label}</span>}
    </div>
  );
};
