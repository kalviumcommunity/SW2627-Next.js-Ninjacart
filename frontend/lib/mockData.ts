export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  farmerName: string;
  image: string;
  status: 'AVAILABLE' | 'SOLD_OUT';
}

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Organic Farm-Fresh Tomatoes',
    price: 45,
    quantity: 120,
    category: 'Vegetables',
    farmerName: 'Ramesh Patel',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'prod-2',
    name: 'Premium Shimla Apples',
    price: 180,
    quantity: 65,
    category: 'Fruits',
    farmerName: 'Suresh Kumar',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'prod-3',
    name: 'Fresh Hydroponic Spinach',
    price: 30,
    quantity: 0,
    category: 'Leafy Greens',
    farmerName: 'Ananya Sharma',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    status: 'SOLD_OUT',
  },
  {
    id: 'prod-4',
    name: 'Organic Golden Corn',
    price: 25,
    quantity: 200,
    category: 'Grains',
    farmerName: 'Rajesh Goud',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'prod-5',
    name: 'Red Bell Peppers (Capsicum)',
    price: 85,
    quantity: 40,
    category: 'Vegetables',
    farmerName: 'Manish Verma',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'prod-6',
    name: 'Fresh Alphonso Mangoes',
    price: 650,
    quantity: 0,
    category: 'Fruits',
    farmerName: 'Vijay Deshmukh',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    status: 'SOLD_OUT',
  },
];
