import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ninjacart | Farm to Retail Produce Supply Chain Platform',
  description:
    'Direct farm-to-retail supply chain marketplace for fresh fruits, vegetables, grains, tubers, and herbs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="navbar">
          <div className="navbar-container">
            <Link href="/" className="logo-brand">
              <span className="logo-badge">🌾 NINJAKART</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#64748b' }}>Direct-to-Retail</span>
            </Link>

            <nav className="nav-links">
              <Link href="/catalogue" className="nav-link">
                🛍️ Produce Catalogue
              </Link>
              <Link href="/farmer/dashboard" className="nav-link">
                🚜 Farmer Portal
              </Link>
              <Link href="/orders" className="nav-link">
                📦 Orders
              </Link>
              <Link
                href="/login"
                style={{
                  padding: '0.45rem 1rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginLeft: '0.5rem',
                }}
              >
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
