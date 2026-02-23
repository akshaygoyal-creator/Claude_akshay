import React, { useState } from 'react';
import { attendanceApi } from '../../utils/api';

const STATUSES = ['Present', 'Late', 'Absent', 'Early Exit'];

export default function OverrideModal({ employee, date, currentStatus, onClose, onSuccess }) {
  const [status, setStatus] = useState(currentStatus || 'Present');
  const [reason, setReason] = useState('');
  const [overrideBy, setOverrideBy] = useState('Store Manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('Please provide a reason'); return; }
    setLoading(true); setError('');
    try {
      await attendanceApi.override({ employee_id: employee.id, date, status, reason, override_by: overrideBy });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || 'Override failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Manual Override</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="font-semibold text-gray-900">{employee.name || employee.employee_name}</p>
          <p className="text-sm text-gray-500">{employee.role} · {date}</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${status === s
                    ? 'bg-licious-red text-white border-licious-red'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Override By</label>
            <input
              type="text"
              value={overrideBy}
              onChange={e => setOverrideBy(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-licious-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. System failure, employee was present"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-licious-red resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-licious-red text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Override'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
