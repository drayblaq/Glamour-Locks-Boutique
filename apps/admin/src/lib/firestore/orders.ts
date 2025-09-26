import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/database';

const COLLECTION_NAME = 'orders';

// Convert Firestore document to Order
const docToOrder = (doc: QueryDocumentSnapshot<DocumentData>): Order => {
  const data = doc.data();
  return {
    id: doc.id,
    orderNumber: data.orderNumber || '',
    orderDate: data.orderDate || '',
    requestId: data.requestId || '',
    customer: data.customer || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      specialInstructions: '',
    },
    items: data.items || [],
    subtotal: data.subtotal || 0,
    shipping: data.shipping || 0,
    total: data.total || 0,
    emailSent: data.emailSent || false,
    status: data.status || 'pending',
    paymentId: data.paymentId || '',
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
};

// Convert Order to Firestore document
const orderToDoc = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docData: any = {
    orderNumber: orderData.orderNumber,
    orderDate: orderData.orderDate,
    customer: orderData.customer,
    items: orderData.items,
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    total: orderData.total,
    emailSent: orderData.emailSent,
    status: orderData.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Only add requestId if it's not undefined or empty
  if (orderData.requestId && orderData.requestId.trim() !== '') {
    docData.requestId = orderData.requestId;
  }
  
  // Only add paymentId if it's not undefined or empty
  if (orderData.paymentId && orderData.paymentId.trim() !== '') {
    docData.paymentId = orderData.paymentId;
  }
  
  return docData;
};

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, COLLECTION_NAME);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docToOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
};

// Get a single order by ID
export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, COLLECTION_NAME, id);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return docToOrder(orderSnap as QueryDocumentSnapshot<DocumentData>);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
};

// Get order by order number
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  try {
    const orders = await getOrders();
    return orders.find(order => order.orderNumber === orderNumber) || null;
  } catch (error) {
    console.error('Error fetching order by number:', error);
    throw new Error('Failed to fetch order by number');
  }
};

// Add a new order
export const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  try {
    console.log('🔥 Firestore addOrder called with orderNumber:', orderData.orderNumber);
    console.log('📦 Items count:', orderData.items.length);
    console.log('👤 Customer:', orderData.customer.firstName, orderData.customer.lastName);
    
    // Check for duplicate orders - get all orders once and check multiple conditions
    console.log('🔍 Checking for duplicate orders...');
    const existingOrders = await getOrders();
    
    // Check by requestId, orderNumber, and paymentId
    if (orderData.requestId) {
      const duplicateByRequestId = existingOrders.find(order => 
        order.requestId === orderData.requestId || 
        order.orderNumber === orderData.orderNumber
      );
      
      if (duplicateByRequestId) {
        console.log('⚠️  Duplicate order detected by requestId/orderNumber, returning existing order:', duplicateByRequestId.id);
        return duplicateByRequestId;
      }
    }
    
    // Check by paymentId if it exists
    if (orderData.paymentId && orderData.paymentId.trim() !== '') {
      const duplicateByPaymentId = existingOrders.find(order => 
        order.paymentId === orderData.paymentId
      );
      
      if (duplicateByPaymentId) {
        console.log('⚠️  Duplicate order detected by paymentId, returning existing order:', duplicateByPaymentId.id);
        return duplicateByPaymentId;
      }
    }
    
    // Check for recent orders with same customer email and similar items
    const recentOrders = existingOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const timeDiff = now.getTime() - orderDate.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      return order.customer.email === orderData.customer.email && 
             minutesDiff < 5; // Within last 5 minutes
    });
    
    if (recentOrders.length > 0) {
      console.log('⚠️  Recent orders found for same customer, checking for duplicates...');
      for (const recentOrder of recentOrders) {
        // Check if items are similar (same items with same quantities)
        if (recentOrder.items.length === orderData.items.length) {
          const itemsMatch = recentOrder.items.every((item, index) => {
            const newItem = orderData.items[index];
            return item.id === newItem.id && item.quantity === newItem.quantity;
          });
          
          if (itemsMatch && Math.abs(recentOrder.total - orderData.total) < 0.01) {
            console.log('⚠️  Duplicate order detected (same customer, same items, recent time), returning existing order:', recentOrder.id);
            return recentOrder;
          }
        }
        
        // Additional check: If one order has "Valued Customer" and the other has real customer data,
        // prefer the one with real customer data and return it
        if (recentOrder.customer.firstName === 'Valued Customer' && 
            orderData.customer.firstName !== 'Valued Customer' &&
            recentOrder.customer.email === orderData.customer.email) {
          console.log('⚠️  Found order with "Valued Customer" placeholder, but new order has real customer data. Returning existing order to prevent duplicate:', recentOrder.id);
          return recentOrder;
        }
        
        if (orderData.customer.firstName === 'Valued Customer' && 
            recentOrder.customer.firstName !== 'Valued Customer' &&
            recentOrder.customer.email === orderData.customer.email) {
          console.log('⚠️  New order has "Valued Customer" placeholder, but existing order has real customer data. Returning existing order:', recentOrder.id);
          return recentOrder;
        }
      }
    }
    
    const docData = orderToDoc(orderData);
    console.log('📄 Document data prepared, saving to Firestore...');
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    console.log('✅ Order saved to Firestore with ID:', docRef.id);
    
    // Get the created document to return the full order
    const createdDoc = await getDoc(docRef);
    if (createdDoc.exists()) {
      const order = docToOrder(createdDoc as QueryDocumentSnapshot<DocumentData>);
      console.log('📋 Order retrieved from Firestore:', order.id);
      return order;
    }
    
    throw new Error('Failed to create order');
  } catch (error) {
    console.error('❌ Error adding order to Firestore:', error);
    throw new Error('Failed to add order');
  }
};

// Update an order
export const updateOrder = async (id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
};

// Get orders by customer email
export const getOrdersByEmail = async (email: string): Promise<Order[]> => {
  try {
    const orders = await getOrders();
    return orders.filter(order => order.customer.email === email);
  } catch (error) {
    console.error('Error fetching orders by email:', error);
    throw new Error('Failed to fetch orders by email');
  }
};

// Get orders by status
export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  try {
    const orders = await getOrders();
    return orders.filter(order => order.status === status);
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw new Error('Failed to fetch orders by status');
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const orders = await getOrders();
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const processingOrders = orders.filter(order => order.status === 'processing').length;
    const shippedOrders = orders.filter(order => order.status === 'shipped').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    const totalRevenue = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw new Error('Failed to fetch order statistics');
  }
}; 