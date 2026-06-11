import './globals.css';

export const metadata = {
  title: 'CatalogApp — WhatsApp Catalog for Your Business',
  description:
    'Upload product photos, let AI fill in the details in English and Hindi, and share your catalog on WhatsApp in 5 minutes.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
