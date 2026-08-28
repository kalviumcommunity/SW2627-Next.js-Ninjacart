import Link from 'next/link';

export default function FarmerDashboardPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Farmer Dashboard</h1>
      <p>Welcome to your farm management portal.</p>
      <div style={{ marginTop: '1.5rem' }}>
        <Link 
          href="/farmer/add-produce"
          style={{
            display: 'inline-block',
            padding: '0.6rem 1.2rem',
            backgroundColor: '#16a34a',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500
          }}
        >
          + Add New Produce
        </Link>
      </div>
    </main>
  );
}
