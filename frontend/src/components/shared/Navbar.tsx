import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const isManagerOrAbove = ['STORE_MANAGER', 'SHIFT_SUPERVISOR'].includes(user.role);

  const links = [
    { to: '/employee', label: 'My Attendance', show: true },
    { to: '/manager',  label: 'Store Dashboard', show: isManagerOrAbove },
    { to: '/ops',      label: 'Ops Dashboard',   show: isManagerOrAbove },
  ].filter(l => l.show);

  const active = (to: string) => pathname.startsWith(to);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">Licious Attendance</span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors ${active(l.to) ? 'text-red-600 border-b-2 border-red-600 pb-0.5' : 'text-gray-600 hover:text-red-600'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role.replace(/_/g, ' ')} · {user.storeName}</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            Sign out
          </button>
          <button className="md:hidden p-1" onClick={() => setOpen(o => !o)}>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 py-2">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm font-medium ${active(l.to) ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
