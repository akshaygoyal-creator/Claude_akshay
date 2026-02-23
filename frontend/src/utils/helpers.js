export function formatTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function statusColor(status) {
  const map = {
    Present: 'bg-green-100 text-green-800',
    Late: 'bg-amber-100 text-amber-800',
    Absent: 'bg-red-100 text-red-800',
    'Early Exit': 'bg-orange-100 text-orange-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export function complianceColor(pct) {
  if (pct >= 80) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' };
  if (pct >= 50) return { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' };
  return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' };
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function downloadCsv(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
