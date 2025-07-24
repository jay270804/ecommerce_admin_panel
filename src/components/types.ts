export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  updatedAt: string;
  __v: number;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  stockUnit: number;
  coverImage: string;
  images: string[];
  discountPercentage: number;
  categoryId: {
    _id: string;
    name: string;
    brand: {
      _id: string;
      name: string;
    };
  };
  tags: string[];
}
export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  _id: string;
  userId: string;
  title: string;
  AddrLine1: string;
  AddrLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  PIN: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress | string;
  orderTotal: number;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}