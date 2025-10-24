export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  variants?: Array<{
    color: string;
    quantity: number;
    images: string[];
  }>;
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
  paymentStatus: 'pending' | 'paid' | 'failed'
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: Date
}
