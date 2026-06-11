import Link from 'next/link';

const FEATURES = [
  ['📸', 'AI Photo-to-Catalog', 'Upload up to 20 photos. AI writes names, descriptions (English + Hindi) and suggests prices.'],
  ['🏪', 'Mini Storefront', 'A mobile-first store page at your own link, with an Order on WhatsApp button on every product.'],
  ['💬', 'WhatsApp Sharing', 'Ready-to-send product messages, one-tap catalog link sharing and a printable QR code.'],
  ['📊', 'Analytics', 'See storefront views, product views and WhatsApp taps so you know what sells.'],
];

const PLANS = [
  ['Free', '₹0', '10 products · 20 AI extractions/mo', 'Basic storefront, WhatsApp share'],
  ['Starter', '₹499/mo', '50 products · 100 AI extractions/mo', 'QR code, Hindi support, analytics'],
  ['Growth', '₹999/mo', '200 products · 500 AI extractions/mo', 'Collections, CSV upload, custom logo'],
  ['Pro', '₹2,499/mo', 'Unlimited products & extractions', 'Custom domain, priority support, team access'],
];

export default function Home() {
  return (
    <main>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">
            📦 CatalogApp
          </div>
          <Link href="/onboarding" className="btn-primary">
            Start Free
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Your WhatsApp catalog,
          <br />
          <span className="text-wa-dark">ready in 5 minutes</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Upload photos → AI fills in the details in English &amp; Hindi → share a beautiful storefront on WhatsApp. Built
          for kiranas, home businesses, boutiques and artisans.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/onboarding" className="btn-primary text-base px-6 py-3">
            Start Free — no card needed
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16 grid sm:grid-cols-2 gap-4">
        {FEATURES.map(([icon, title, desc]) => (
          <div key={title} className="card p-6">
            <div className="text-3xl">{icon}</div>
            <h3 className="mt-2 font-bold">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center">Simple pricing</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(([name, price, limits, features]) => (
              <div key={name} className="card p-5">
                <h3 className="font-bold">{name}</h3>
                <div className="mt-1 text-2xl font-extrabold">{price}</div>
                <p className="mt-2 text-xs text-gray-500">{limits}</p>
                <p className="mt-1 text-sm text-gray-600">{features}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">Annual plans: 2 months free.</p>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-400">CatalogApp · Made for Indian SMBs</footer>
    </main>
  );
}
