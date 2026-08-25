export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Produce Details</h1>
      <p>Viewing product ID: {productId}</p>
    </main>
  );
}
