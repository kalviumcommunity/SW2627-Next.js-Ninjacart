export interface Product {
  name: string;
  description: string;
  category: "VEGETABLES" | "FRUITS" | "GRAINS" | "TUBERS" | "HERBS" | "DAIRY" | "OTHER";
  price: number;
  unit: string;
  quantity: number;
  minOrderQuantity: number;
  imageUrl: string | null;
  imagePublicId: string | null;
}

export async function createProduct(product: Product): Promise<Product> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/produce`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    }
  );

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.error || "Failed to create product");
  }

  const result = await response.json();

  return result.data;
}


export async function uploadImage(file: File) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.error || "Failed to upload image");
  }

  const result = await response.json();

  return result.data;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function registerUser(data: RegisterData) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to register");
  }

  const result = await response.json();
  return result;
}
