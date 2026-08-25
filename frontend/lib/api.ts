interface Product {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export async function createProduct(product: Product): Promise<Product> {
  // MOCK — replace with real fetch once Jovab's backend is live
  console.log("Mock: sending product:", product);
  return product;
}