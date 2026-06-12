import Link from 'next/link';
import { LogoMark, Camera, Bag, Chat, Chart, Sparkles, Check } from '../lib/icons';

const FEATURES = [
  [Camera, 'AI Photo-to-Catalog', 'Upload up to 20 photos. AI writes names, descriptions in English + Hindi and suggests prices.'],
  [Bag, 'Mini Storefront', 'A fast, mobile-first store page at your own link — with WhatsApp ordering on every product.'],
  [Chat, 'WhatsApp Sharing', 'Ready-to-send product messages, one-tap catalog links and a printable QR code for your shop.'],
  [Chart, 'Analytics', 'Storefront views, product views and WhatsApp taps — know exactly what sells.'],
];

const STEPS = [
  ['Upload photos', 'Drag in product photos straight from your phone gallery.'],
  ['AI fills the details', 'Names, bilingual descriptions, prices and tags — review and save.'],
  ['Share on WhatsApp', 'Send your storefront link or product messages to customers.'],
];

const PLANS = [
  ['Free', '₹0', ['10 products', '20 AI extractions / mo', 'Storefront + WhatsApp share'], false],
  ['Starter', '₹499', ['50 products', '100 AI extractions / mo', 'QR code · Hindi · analytics'], true],
  ['Growth', '₹999', ['200 products', '500 AI extractions / mo', 'Collections · CSV · logo'], false],
  ['Pro', '₹2,499', ['Unlimited everything', 'Custom domain', 'Priority support · team access'], false],
];

export default function Home() {
  return (
    <main>
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[17px] font-extrabold tracking-tight">CatalogApp</span>
          </div>
          <Link href="/onboarding" className="btn-primary !py-2">
            Start Free
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.10),transparent_70%)]" />
        <div className="relative max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
          <span className="badge bg-white border border-slate-200 text-slate-600 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            AI-powered catalogs for WhatsApp sellers
          </span>
          <h1 className="mt-6 text-[44px] sm:text-6xl font-extrabold tracking-[-0.03em] leading-[1.05]">
            Your WhatsApp catalog,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              ready in 5 minutes
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload photos, let AI fill in the details in English &amp; Hindi, and share a beautiful storefront on
            WhatsApp. Built for kiranas, home businesses, boutiques and artisans.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/onboarding" className="btn-primary !px-7 !py-3 text-[15px]">
              Start Free — no card needed
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400 font-medium tracking-wide">
            5-MINUTE SETUP &nbsp;·&nbsp; ENGLISH + हिन्दी &nbsp;·&nbsp; FREE FOREVER PLAN
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-20 grid sm:grid-cols-2 gap-4">
        {FEATURES.map(([Ico, title, desc]) => (
          <div key={title} className="card p-6 hover:-translate-y-0.5 transition-transform duration-200">
            <span className="icon-chip">
              <Ico className="w-[18px] h-[18px]" />
            </span>
            <h3 className="mt-4 font-bold tracking-tight">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border-y border-slate-200/60">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">How it works</h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {STEPS.map(([title, desc], i) => (
              <div key={title} className="text-center px-4">
                <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Simple pricing</h2>
        <p className="mt-2 text-center text-sm text-slate-500">Annual plans get 2 months free.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map(([name, price, items, featured]) => (
            <div
              key={name}
              className={`card p-6 ${featured ? 'ring-2 ring-emerald-500 shadow-[0_12px_40px_-12px_rgba(16,185,129,0.35)]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold tracking-tight">{name}</h3>
                {featured && <span className="badge bg-emerald-50 text-emerald-600">POPULAR</span>}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight">{price}</span>
                {name !== 'Free' && <span className="text-sm text-slate-400">/mo</span>}
              </div>
              <ul className="mt-4 space-y-2">
                {items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200/60 py-10">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <LogoMark className="w-6 h-6" />
            <span className="font-semibold text-slate-500">CatalogApp</span>
          </div>
          <span>Made for Indian SMBs</span>
        </div>
      </footer>
    </main>
  );
}
