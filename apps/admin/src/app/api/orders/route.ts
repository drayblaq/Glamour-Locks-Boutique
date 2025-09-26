import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

// GET - Fetch all orders and stats
export async function GET() {
  try {
    const [orders, stats] = await Promise.all([
      database.getOrders(),
      database.getOrderStats(),
    ]);
    
    return NextResponse.json({ orders, stats });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    const updatedOrder = await database.updateOrder(orderId, { status });
    
    if (updatedOrder) {
      return NextResponse.json({ success: true, order: updatedOrder });
    }
    
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE - Delete an order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }
    
    const deleted = await database.deleteOrder(orderId);
    
    if (deleted) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/orders - Creating new order...');
    console.log('🕐 Timestamp:', new Date().toISOString());
    console.log('🔗 Request URL:', request.url);
    console.log('📋 Request headers:', Object.fromEntries(request.headers.entries()));
    
    const orderData = await request.json();
    
    console.log('📋 Order data received:', {
      orderNumber: orderData.orderNumber,
      requestId: orderData.requestId,
      customerEmail: orderData.customer?.email,
      itemsCount: orderData.items?.length,
      total: orderData.total,
      paymentId: orderData.paymentId
    });
    
    if (!orderData || !orderData.customer || !orderData.items || !orderData.total) {
      console.log('❌ Missing required order fields');
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    // Validate that items array is not empty
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.log('❌ Order has no items');
      console.log('📦 Received items:', orderData.items);
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }
    
    // Additional validation: Check for placeholder customer data
    if (orderData.customer.firstName === 'Valued Customer' || 
        orderData.customer.firstName === '' || 
        orderData.customer.lastName === '') {
      console.log('❌ Order has placeholder or empty customer data');
      console.log('👤 Customer data:', orderData.customer);
      return NextResponse.json({ error: 'Invalid customer information' }, { status: 400 });
    }

    // Log the items being saved
    console.log('📦 Saving order with items:', orderData.items.map((item: any) => ({ id: item.id, name: item.name, quantity: item.quantity })));

    // Validate customer information
    if (!orderData.customer.email || !orderData.customer.firstName || !orderData.customer.lastName) {
      console.log('❌ Missing required customer information');
      return NextResponse.json({ error: 'Missing required customer information' }, { status: 400 });
    }
    
    // Ensure status is set
    if (!orderData.status) {
      orderData.status = 'pending';
    }
    
    console.log('💾 Saving order to database...');
    const newOrder = await database.createOrder(orderData);
    console.log('✅ Order saved successfully with ID:', newOrder.id);
    
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}