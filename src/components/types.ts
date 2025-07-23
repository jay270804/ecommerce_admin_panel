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
  description: string;
  price: number;
  coverImage: string;
  brand: Brand;
  category: Category;
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