import Link from 'next/link';
import { LogoMark, Camera, Bag, Chat, Chart, Sparkles, Check } from '../lib/icons';

const FEATURES = [
  [Camera, 'AI Photo-to-Catalog', 'Upload up to 20 photos. AI writes names, descriptions in English + Hindi and suggests prices.', 'bg-violet-soft'],
  [Bag, 'Mini Storefront', 'A fast, mobile-first store page at your own link — with WhatsApp ordering on every product.', 'bg-coral-soft'],
  [Chat, 'WhatsApp Sharing', 'Ready-to-send product messages, one-tap catalog links and a printable QR code for your shop.', 'bg-mint'],
  [Chart, 'Analytics', 'Storefront views, product views and WhatsApp taps — know exactly what sells.', 'bg-butter'],
];

const STEPS = [
  ['Upload photos', 'Drag in product photos straight from your phone gallery.', 'bg-coral text-white'],
  ['AI fills the details', 'Names, bilingual descriptions, prices and tags — review and save.', 'bg-violet text-white'],
  ['Share on WhatsApp', 'Send your storefront link or product messages to customers.', 'bg-ink text-cream'],
];

const PLANS = [
  ['Free', '₹0', ['10 products', '20 AI extractions / mo', 'Storefront + WhatsApp share'], false],
  ['Starter', '₹499', ['50 products', '100 AI extractions / mo', 'QR code · Hindi · analytics'], true],
  ['Growth', '₹999', ['200 products', '500 AI extractions / mo', 'Collections · CSV · logo'], false],
  ['Pro', '₹2,499', ['Unlimited everything', 'Custom domain', 'Priority support · team access'], false],
];

function Squiggle({ className }) {
  return (
    <svg viewBox="0 0 220 14" fill="none" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M3 10.5C25 3.5 47 3.5 69 8.5C91 13.5 113 13.5 135 8C157 2.5 179 2.5 201 7.5L217 10.5"
        stroke="#FF6B5E"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur-xl border-b-[1.5px] border-ink/10">
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
        <div className="pointer-events-none absolute -top-20 -left-24 w-72 h-72 rounded-full bg-violet-soft blur-2xl opacity-70" />
        <div className="pointer-events-none absolute top-24 -right-20 w-64 h-64 rounded-full bg-coral-soft blur-2xl opacity-70" />
        <div className="relative max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
          <span className="eyebrow">
            <Sparkles className="w-3.5 h-3.5 text-violet" />
            AI-powered catalogs for WhatsApp sellers
          </span>
          <h1 className="mt-7 font-display text-[46px] sm:text-[64px] font-semibold tracking-[-0.02em] leading-[1.04]">
            Your WhatsApp catalog,
            <br />
            <span className="relative inline-block italic text-violet pb-3">
              ready in 5 minutes
              <Squiggle className="absolute bottom-0 left-0 w-full h-3" />
            </span>
          </h1>
          <p className="mt-7 text-lg text-ink/60 max-w-xl mx-auto leading-relaxed font-medium">
            Upload photos, let AI fill in the details in English &amp; Hindi, and share a beautiful storefront on
            WhatsApp. Built for kiranas, home businesses, boutiques and artisans.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link href="/onboarding" className="btn-primary !px-7 !py-3.5 text-[15px]">
              Start Free — no card needed
            </Link>
          </div>
          <p className="mt-5 text-[11px] text-ink/40 font-extrabold tracking-[0.14em] uppercase">
            5-minute setup &nbsp;·&nbsp; English + हिन्दी &nbsp;·&nbsp; Free forever plan
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-20 grid sm:grid-cols-2 gap-5">
        {FEATURES.map(([Ico, title, desc, tint]) => (
          <div key={title} className={`card-pop p-7 ${tint} hover:-translate-y-1 transition-transform duration-200`}>
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-white border-[1.5px] border-ink text-ink">
              <Ico className="w-[18px] h-[18px]" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-ink/65 leading-relaxed font-medium">{desc}</p>
          </div>
        ))}
      </section>

      <section className="border-y-[1.5px] border-ink/10 bg-white">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <h2 className="text-center font-display text-4xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {STEPS.map(([title, desc, chip], i) => (
              <div key={title} className="text-center px-4">
                <span
                  className={`inline-flex w-11 h-11 items-center justify-center rounded-full border-[1.5px] border-ink shadow-[2px_2px_0_#221F35] text-[15px] font-extrabold ${chip}`}
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm text-ink/55 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-20">
        <h2 className="text-center font-display text-4xl font-semibold tracking-tight">
          Simple, <span className="italic text-violet">honest</span> pricing
        </h2>
        <p className="mt-3 text-center text-sm text-ink/50 font-medium">Annual plans get 2 months free.</p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map(([name, price, items, featured]) => (
            <div key={name} className={`card-pop p-6 ${featured ? 'bg-violet text-white' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold tracking-tight">{name}</h3>
                {featured && <span className="badge bg-butter text-ink border-[1.5px] border-ink">POPULAR</span>}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-[34px] font-semibold tracking-tight">{price}</span>
                {name !== 'Free' && <span className={`text-sm ${featured ? 'text-white/60' : 'text-ink/40'}`}>/mo</span>}
              </div>
              <ul className="mt-4 space-y-2">
                {items.map((it) => (
                  <li key={it} className={`flex items-start gap-2 text-sm font-medium ${featured ? 'text-white/85' : 'text-ink/65'}`}>
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${featured ? 'text-butter' : 'text-violet'}`} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t-[1.5px] border-ink/10 py-10">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between text-sm text-ink/40 font-medium">
          <div className="flex items-center gap-2">
            <LogoMark className="w-6 h-6" />
            <span className="font-bold text-ink/60">CatalogApp</span>
          </div>
          <span>Made with care for Indian SMBs</span>
        </div>
      </footer>
    </main>
  );
}
