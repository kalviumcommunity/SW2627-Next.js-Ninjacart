import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="main-content">
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #10b981 100%)',
          borderRadius: '24px',
          padding: '3.5rem 2.5rem',
          color: '#ffffff',
          marginBottom: '3rem',
          boxShadow: '0 20px 25px -5px rgba(6, 78, 59, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '1rem',
              letterSpacing: '0.04em',
            }}
          >
            🌾 INDIA&apos;S DIRECT AGRI-SUPPLY PLATFORM
          </span>
          <h1
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            Fresh Produce, Directly From Farmers to Retailers.
          </h1>
          <p
            style={{
              fontSize: '1.15rem',
              color: '#d1fae5',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            Empowering farmers with fair market pricing and giving retailers overnight harvest delivery with complete batch traceability.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/catalogue"
              style={{
                backgroundColor: '#ffffff',
                color: '#064e3b',
                padding: '0.85rem 1.75rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🛍️ Explore Retailer Catalogue &rarr;
            </Link>
            <Link
              href="/farmer/dashboard"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(8px)',
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🚜 Farmer Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🥦</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Fresh Farm Catalogue
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Browse live produce listings directly updated by registered farmers across regional harvest centers.
          </p>
          <Link href="/catalogue" style={{ color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>
            Browse Catalogue &rarr;
          </Link>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👨‍🌾</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Farmer Direct Profiles
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Full visibility into farmer credentials, regional farming practices, and direct farm origin locations.
          </p>
          <Link href="/farmer/add-produce" style={{ color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>
            List New Produce &rarr;
          </Link>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📦</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Seamless Wholesale Ordering
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1rem' }}>
            Instant order placement with minimum order quantity thresholds, quantity steppers, and transparent billing.
          </p>
          <Link href="/orders" style={{ color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>
            View Orders &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
