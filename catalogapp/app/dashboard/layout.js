'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  ['/dashboard', '🛍️ Products'],
  ['/dashboard/upload', '📸 Add Products'],
  ['/dashboard/share', '💬 Share'],
  ['/dashboard/analytics', '📊 Analytics'],
  ['/dashboard/settings', '⚙️ Settings'],
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    fetch('/api/seller')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setSeller(d.seller))
      .catch(() => router.push('/onboarding'));
  }, [router]);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="font-bold whitespace-nowrap">📦 CatalogApp</Link>
          <div className="flex items-center gap-2 text-sm">
            {seller?.slug && (
              <a href={`/store/${seller.slug}`} target="_blank" className="btn-secondary !py-1.5">
                View store ↗
              </a>
            )}
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={async () => {
                await fetch('/api/seller', { method: 'DELETE' });
                router.push('/');
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 ${
                pathname === href ? 'border-wa-dark text-wa-dark font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
