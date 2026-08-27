// Type definitions - using development's better structured types
export type ProduceCategory =
  | 'VEGETABLES'
  | 'FRUITS'
  | 'GRAINS'
  | 'TUBERS'
  | 'HERBS'
  | 'DAIRY'
  | 'OTHER';

export type ProduceStatus =
  | 'AVAILABLE'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'ARCHIVED';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Farmer {
  id: string;
  userId: string;
  user: User;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
}

export interface Produce {
  id: string;
  name: string;
  description?: string | null;
  category: ProduceCategory;
  price: number;
  unit: string;
  quantity: number;
  minOrderQuantity: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  status: ProduceStatus;
  farmerId: string;
  farmer?: Farmer;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductData {
  name: string;
  description?: string | null;
  category?: ProduceCategory;
  price: number;
  unit?: string;
  quantity?: number;
  minOrderQuantity?: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  status?: ProduceStatus;
}

// Type alias for Task #20 compatibility and produce responses
export type Product = Produce;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedProducesResponse {
  produces: Produce[];
  pagination: PaginationMeta;
}

export interface ProduceQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'quantity' | 'name';
  order?: 'asc' | 'desc';
  farmerId?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface OrderItemData {
  produceId: string;
  quantity: number;
}

interface OrderData {
  items: OrderItemData[];
  deliveryAddress: string;
  notes?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// High-quality fallback dataset matching seed data for local preview & offline resilience
export const SAMPLE_PRODUCES: Produce[] = [
  {
    id: 'prod-001',
    name: 'Organic Roma Tomatoes',
    description: 'Vine-ripened, farm-fresh juicy red Roma tomatoes. Ideal for retail stores, grocery chains, and culinary supply. Grown using natural organic compost in Nashik farms.',
    category: 'VEGETABLES',
    price: 32.5,
    unit: 'kg',
    quantity: 500,
    minOrderQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    farmerId: 'farmer-001',
    farmer: {
      id: 'farmer-001',
      userId: 'user-farmer-001',
      user: {
        id: 'user-farmer-001',
        name: 'Ramesh Patel',
        email: 'ramesh.farmer@ninjacart.com',
      },
      phone: '+91 98765 43210',
      location: 'Nashik, Maharashtra',
      bio: 'Specializing in fresh organic tomatoes, onions, and seasonal bell peppers with 15+ years experience.',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    name: 'Red Nashik Onions',
    description: 'Sun-cured medium to large grade Nashik red onions with exceptional shelf-life and authentic pungent aroma.',
    category: 'VEGETABLES',
    price: 28.0,
    unit: 'kg',
    quantity: 1200,
    minOrderQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    farmerId: 'farmer-001',
    farmer: {
      id: 'farmer-001',
      userId: 'user-farmer-001',
      user: {
        id: 'user-farmer-001',
        name: 'Ramesh Patel',
        email: 'ramesh.farmer@ninjacart.com',
      },
      phone: '+91 98765 43210',
      location: 'Nashik, Maharashtra',
      bio: 'Specializing in fresh organic tomatoes, onions, and seasonal bell peppers with 15+ years experience.',
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'prod-003',
    name: 'Green Bell Peppers (Capsicum)',
    description: 'Crisp, thick-walled green capsicum harvested early morning. Hand-sorted for size and shine.',
    category: 'VEGETABLES',
    price: 45.0,
    unit: 'kg',
    quantity: 300,
    minOrderQuantity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    farmerId: 'farmer-001',
    farmer: {
      id: 'farmer-001',
      userId: 'user-farmer-001',
      user: {
        id: 'user-farmer-001',
        name: 'Ramesh Patel',
        email: 'ramesh.farmer@ninjacart.com',
      },
      phone: '+91 98765 43210',
      location: 'Nashik, Maharashtra',
      bio: 'Specializing in fresh organic tomatoes, onions, and seasonal bell peppers with 15+ years experience.',
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'prod-004',
    name: 'Shimla Royal Delicious Apples',
    description: 'Sweet, aromatic, hand-picked A-grade red apples from Himachal orchards. Crisp texture with balanced sweetness.',
    category: 'FRUITS',
    price: 120.0,
    unit: 'kg',
    quantity: 800,
    minOrderQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    farmerId: 'farmer-002',
    farmer: {
      id: 'farmer-002',
      userId: 'user-farmer-002',
      user: {
        id: 'user-farmer-002',
        name: 'Sunita Devi',
        email: 'sunita.farmer@ninjacart.com',
      },
      phone: '+91 98123 45678',
      location: 'Shimla, Himachal Pradesh',
      bio: 'High altitude orchard producing premium Royal Delicious apples, plums, and cherries.',
    },
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'prod-005',
    name: 'Himachal Sweet Plums',
    description: 'Fresh succulent plums packed in protective crates for zero transit damage. Limited seasonal batch.',
    category: 'FRUITS',
    price: 95.0,
    unit: 'box',
    quantity: 80,
    minOrderQuantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1521995995252-94458cfca142?auto=format&fit=crop&w=800&q=80',
    status: 'LOW_STOCK',
    farmerId: 'farmer-002',
    farmer: {
      id: 'farmer-002',
      userId: 'user-farmer-002',
      user: {
        id: 'user-farmer-002',
        name: 'Sunita Devi',
        email: 'sunita.farmer@ninjacart.com',
      },
      phone: '+91 98123 45678',
      location: 'Shimla, Himachal Pradesh',
      bio: 'High altitude orchard producing premium Royal Delicious apples, plums, and cherries.',
    },
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'prod-006',
    name: 'Hydroponic Baby Spinach',
    description: 'Pesticide-free, nutrient-rich crisp baby spinach leaves, washed and packed in 500g oxygenated pouches.',
    category: 'HERBS',
    price: 60.0,
    unit: 'kg',
    quantity: 150,
    minOrderQuantity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    farmerId: 'farmer-003',
    farmer: {
      id: 'farmer-003',
      userId: 'user-farmer-003',
      user: {
        id: 'user-farmer-003',
        name: 'Gopal Reddy',
        email: 'gopal.farmer@ninjacart.com',
      },
      phone: '+91 97654 32109',
      location: 'Kolar, Karnataka',
      bio: 'Hydroponic and open farm leafy greens, spinach, coriander, and organic carrots.',
    },
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'prod-007',
    name: 'Fresh Kolar Carrots',
    description: 'Sweet, tender, bright orange washed carrots ready for supermarket display and retail sale.',
    category: 'TUBERS',
    price: 38.0,
    unit: 'kg',
    quantity: 0,
    minOrderQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
    status: 'OUT_OF_STOCK',
    farmerId: 'farmer-003',
    farmer: {
      id: 'farmer-003',
      userId: 'user-farmer-003',
      user: {
        id: 'user-farmer-003',
        name: 'Gopal Reddy',
        email: 'gopal.farmer@ninjacart.com',
      },
      phone: '+91 97654 32109',
      location: 'Kolar, Karnataka',
      bio: 'Hydroponic and open farm leafy greens, spinach, coriander, and organic carrots.',
    },
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'prod-008',
    name: 'Organic Basmati Paddy Grain',
    description: 'Single-origin premium unpolished aromatic basmati grains direct from farm fields.',
    category: 'GRAINS',
    price: 85.0,
    unit: 'bag',
    quantity: 450,
    minOrderQuantity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    farmerId: 'farmer-003',
    farmer: {
      id: 'farmer-003',
      userId: 'user-farmer-003',
      user: {
        id: 'user-farmer-003',
        name: 'Gopal Reddy',
        email: 'gopal.farmer@ninjacart.com',
      },
      phone: '+91 97654 32109',
      location: 'Kolar, Karnataka',
      bio: 'Hydroponic and open farm leafy greens, spinach, coriander, and organic carrots.',
    },
    createdAt: new Date(Date.now() - 25200000).toISOString(),
  },
];

/**
 * Fetch paginated produce listings from backend with fallback support
 */
export async function getProduces(params: ProduceQueryParams = {}): Promise<PaginatedProducesResponse> {
  const {
    page = 1,
    limit = 8,
    category,
    status,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    farmerId,
  } = params;

  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (category && category !== 'ALL') query.set('category', category);
  if (status && status !== 'ALL') query.set('status', status);
  if (search) query.set('search', search);
  if (sortBy) query.set('sortBy', sortBy);
  if (order) query.set('order', order);
  if (farmerId) query.set('farmerId', farmerId);

  try {
    const res = await fetch(`${BACKEND_URL}/api/produce?${query.toString()}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {
    // Backend unreachable — gracefully fallback to client-side filtered data
  }

  // Client-side filtering fallback
  let filtered = [...SAMPLE_PRODUCES];

  if (category && category !== 'ALL') {
    filtered = filtered.filter((p) => p.category.toUpperCase() === category.toUpperCase());
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((p) => p.status.toUpperCase() === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (farmerId) {
    filtered = filtered.filter((p) => p.farmerId === farmerId);
  }

  // Sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'price') comparison = a.price - b.price;
    else if (sortBy === 'quantity') comparison = a.quantity - b.quantity;
    else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else comparison = (a.id > b.id ? 1 : -1);

    return order === 'asc' ? comparison : -comparison;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginatedItems = filtered.slice(start, start + limit);

  return {
    produces: paginatedItems,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore: start + paginatedItems.length < total,
    },
  };
}

/**
 * Fetch a single produce item by its ID (Task #20)
 */
export async function getProduce(id: string): Promise<Produce> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/produce/${id}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {
    // Backend fallback
  }

  const found = SAMPLE_PRODUCES.find((p) => p.id === id);
  if (found) {
    return found;
  }
  throw new Error('Failed to fetch product');
}

/**
 * Alias for backwards compatibility
 */
export async function getProduceById(id: string): Promise<Produce | null> {
  try {
    return await getProduce(id);
  } catch {
    const found = SAMPLE_PRODUCES.find((p) => p.id === id);
    return found || null;
  }
}

/**
 * Create produce listing (Farmer action)
 */
export async function createProduct(product: CreateProductData): Promise<any> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${BACKEND_URL}/api/produce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch {
    // Fallback simulation
  }

  const created: Produce = {
    id: `prod-${Date.now()}`,
    name: product.name || 'New Produce',
    description: ('description' in product && product.description) ? product.description : '',
    category: (product.category ? (product.category.toUpperCase() as ProduceCategory) : 'VEGETABLES'),
    price: product.price || 0,
    unit: ('unit' in product && product.unit) ? product.unit : 'kg',
    quantity: product.quantity || 0,
    minOrderQuantity: ('minOrderQuantity' in product && product.minOrderQuantity) ? product.minOrderQuantity : 1,
    imageUrl: ('imageUrl' in product && product.imageUrl) ? product.imageUrl : null,
    status: product.quantity && product.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
    farmerId: 'farmer-001',
    createdAt: new Date().toISOString(),
  };

  return created;
}

/**
 * Image upload handler
 */
export async function uploadImage(file: File) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BACKEND_URL}/api/upload/image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.error || 'Failed to upload image');
  }

  const result = await response.json();
  return result.data;
}

/**
 * User registration handler
 */
export async function registerUser(data: RegisterData) {
  const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to register');
  }

  const result = await response.json();
  return result;
}

/**
 * Create a new order (Task #20)
 */
export async function createOrder(orderData: OrderData) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${BACKEND_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.error || 'Failed to create order');
  }

  const result = await response.json();
  return result.data;
}
