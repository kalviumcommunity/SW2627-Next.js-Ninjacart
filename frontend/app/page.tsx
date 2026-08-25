import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🌾 Ninjacart Produce Catalogue System</h1>
      <p>Direct farm-to-retail supply chain platform.</p>
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/login">🔑 Login</Link>
        <Link href="/register">📝 Register</Link>
        <Link href="/farmer/dashboard">🚜 Farmer Dashboard</Link>
        <Link href="/farmer/add-produce">➕ Add Produce</Link>
        <Link href="/orders">📦 Orders</Link>
      </nav>
    </main>
  );
}
