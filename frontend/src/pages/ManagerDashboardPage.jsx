import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storesApi } from '../utils/api';
import StoreDashboard from '../components/manager/StoreDashboard';

export default function ManagerDashboardPage() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storesApi.getAll().then(s => {
      setStores(s);
      if (s.length > 0) setSelectedStore(s[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-licious-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedStore) {
    return (
      <div>
        {/* Store Selector Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
            <Link to="/" className="text-gray-400 hover:text-licious-red flex-shrink-0 mr-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </Link>
            {stores.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStore(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${selectedStore.id === s.id
                    ? 'bg-licious-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >{s.name.replace('Licious - ', '')}</button>
            ))}
          </div>
        </div>
        <StoreDashboard store={selectedStore} />
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-gray-500">
      <p>No stores found. Please seed the database.</p>
      <Link to="/" className="text-licious-red underline text-sm mt-2 inline-block">← Back</Link>
    </div>
  );
}
