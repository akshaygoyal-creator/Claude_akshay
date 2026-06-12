import { notFound } from 'next/navigation';
import { getDb } from '../../../lib/db';
import Storefront from './Storefront';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const seller = getDb().prepare('SELECT * FROM sellers WHERE slug = ?').get(params.slug);
  if (!seller) return {};
  return {
    title: `${seller.business_name} — Catalog`,
    description: seller.description || `Browse the catalog of ${seller.business_name} and order on WhatsApp.`,
  };
}

export default function StorePage({ params }) {
  const db = getDb();
  const seller = db.prepare('SELECT * FROM sellers WHERE slug = ?').get(params.slug);
  if (!seller) notFound();
  const products = db
    .prepare('SELECT * FROM products WHERE seller_id = ? ORDER BY pinned DESC, id DESC')
    .all(seller.id);

  const publicSeller = {
    id: seller.id,
    business_name: seller.business_name,
    category: seller.category,
    city: seller.city,
    whatsapp: seller.whatsapp,
    accent_color: seller.accent_color,
    description: seller.description,
    hours: seller.hours,
    show_prices: seller.show_prices,
    slug: seller.slug,
  };

  return <Storefront seller={publicSeller} products={products} />;
}
