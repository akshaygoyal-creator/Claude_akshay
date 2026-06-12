'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoMark, Bag, Camera, Chat, Chart, Sliders, Logout, ArrowUpRight } from '../../lib/icons';

const NAV = [
  ['/dashboard', 'Products', Bag],
  ['/dashboard/upload', 'Add Products', Camera],
  ['/dashboard/share', 'Share', Chat],
  ['/dashboard/analytics', 'Analytics', Chart],
  ['/dashboard/settings', 'Settings', Sliders],
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
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <LogoMark className="w-7 h-7" />
            <span className="font-extrabold tracking-tight">CatalogApp</span>
          </Link>
          <div className="flex items-center gap-1.5">
            {seller?.slug && (
              <a href={`/store/${seller.slug}`} target="_blank" className="btn-secondary !py-1.5 !px-3.5 text-[13px]">
                View store
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              className="btn-ghost !p-2"
              title="Logout"
              onClick={async () => {
                await fetch('/api/seller', { method: 'DELETE' });
                router.push('/');
              }}
            >
              <Logout className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-5 pb-2 flex gap-1 overflow-x-auto">
          {NAV.map(([href, label, Ico]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition ${
                  active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Ico className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-7">{children}</main>
    </div>
  );
}
