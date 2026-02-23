import React from 'react';
import { statusColor } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusColor(status)}`}>{status}</span>
  );
}
