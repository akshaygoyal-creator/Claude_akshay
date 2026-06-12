import { Manrope, Fraunces } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

export const metadata = {
  title: 'CatalogApp — WhatsApp Catalog for Your Business',
  description:
    'Upload product photos, let AI fill in the details in English and Hindi, and share your catalog on WhatsApp in 5 minutes.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF6EF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
