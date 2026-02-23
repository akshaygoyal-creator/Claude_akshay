import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-licious-red via-red-700 to-red-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl font-black text-licious-red">L</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Licious</h1>
        <p className="text-red-200 mt-1 text-sm font-medium">Attendance Management System</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Link
          to="/employee"
          className="flex items-center bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-licious-red rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">Employee</p>
            <p className="text-gray-500 text-sm">Mark attendance & view shifts</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-licious-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          to="/manager"
          className="flex items-center bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-licious-red rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">Store Manager</p>
            <p className="text-gray-500 text-sm">Store-level attendance dashboard</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-licious-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          to="/ops"
          className="flex items-center bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-licious-red rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">Central Ops</p>
            <p className="text-gray-500 text-sm">All stores real-time overview</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-licious-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <p className="text-red-300 text-xs mt-8">© 2025 Licious Retail Pvt. Ltd.</p>
    </div>
  );
}
