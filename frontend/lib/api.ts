export interface Product {
  id?: string;
  name: string;
  description?: string | null;
  category: "VEGETABLES" | "FRUITS" | "GRAINS" | "TUBERS" | "HERBS" | "DAIRY" | "OTHER";
  price: number;
  unit: string;
  quantity: number;
  minOrderQuantity: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  status?: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "ARCHIVED";
  farmerId?: string;
  farmer?: {
    id: string;
    userId: string;
    phone?: string | null;
    location?: string | null;
    bio?: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
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

/**
 * Get a single produce item by ID
 */
export async function getProduce(id: string): Promise<Product> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/produce/${id}`
  );

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.error || "Failed to fetch product");
  }

  const result = await response.json();
  return result.data;
}

interface OrderItemData {
  produceId: string;
  quantity: number;
}

interface OrderData {
  items: OrderItemData[];
  deliveryAddress?: string;
  notes?: string;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: OrderData) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    }
  );

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.error || "Failed to create order");
  }

  const result = await response.json();
  return result.data;
}
