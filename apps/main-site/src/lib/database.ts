import { 
  getOrders as getFirestoreOrders,
  getOrder as getFirestoreOrder,
  getOrderByNumber as getFirestoreOrderByNumber,
  addOrder as addFirestoreOrder,
  updateOrder as updateFirestoreOrder,
  deleteOrder as deleteFirestoreOrder,
  getOrdersByEmail as getFirestoreOrdersByEmail,
  getOrdersByStatus as getFirestoreOrdersByStatus,
  getOrderStats as getFirestoreOrderStats
} from '@/lib/firestore/orders';

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  requestId?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    specialInstructions: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    quantity: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentId?: string;
}

class DatabaseService {
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return await addFirestoreOrder(orderData);
  }

  async getOrders(): Promise<Order[]> {
    return await getFirestoreOrders();
  }

  async getOrderById(id: string): Promise<Order | null> {
    return await getFirestoreOrder(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return await getFirestoreOrderByNumber(orderNumber);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    await updateFirestoreOrder(id, updates);
    return await getFirestoreOrder(id);
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      await deleteFirestoreOrder(id);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return await getFirestoreOrdersByStatus(status);
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return await getFirestoreOrdersByEmail(email);
  }

  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const stats = await getFirestoreOrderStats();
    return {
      total: stats.totalOrders,
      pending: stats.pendingOrders,
      processing: stats.processingOrders,
      shipped: stats.shippedOrders,
      completed: stats.completedOrders,
      cancelled: stats.cancelledOrders,
      totalRevenue: stats.totalRevenue,
    };
  }

  // Migration helper for future database implementation
  async migrateToDatabase(): Promise<void> {
    console.log('Database migration not implemented yet. Using Firestore storage.');
    // This would be implemented when moving to a real database
  }
}

export const database = new DatabaseService(); 