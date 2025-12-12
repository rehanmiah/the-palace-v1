
export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVegetarian: boolean;
  isSpicy: boolean;
  isPopular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: any;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  cuisine: string[];
  isOpen: boolean;
  address: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  restaurantId: string;
  spiceLevel?: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered';
  createdAt: Date;
}
