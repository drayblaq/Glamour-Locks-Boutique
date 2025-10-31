import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for shipping options (replace with database in production)
let shippingOptions = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '3-5 working days',
    price: 2.49,
    estimatedDays: '3-5',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '1-2 working days',
    price: 9.99,
    estimatedDays: '1-2',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'next-day',
    name: 'Next Day Delivery',
    description: 'Next working day',
    price: 7.55,
    estimatedDays: '1',
    isActive: true,
    sortOrder: 3
  }
];

// GET - Fetch shipping options
export async function GET() {
  try {
    const activeOptions = shippingOptions
      .filter(option => option.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    return NextResponse.json({ success: true, shippingOptions: activeOptions });
  } catch (error: any) {
    console.error('Error fetching shipping options:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping options' }, { status: 500 });
  }
}

// POST - Create new shipping option (admin only)
export async function POST(request: NextRequest) {
  try {
    const optionData = await request.json();
    
    if (!optionData.name || !optionData.description || optionData.price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const newOption = {
      id: optionData.id || `shipping-${Date.now()}`,
      name: optionData.name,
      description: optionData.description,
      price: parseFloat(optionData.price),
      estimatedDays: optionData.estimatedDays || '3-5',
      isActive: optionData.isActive !== false,
      sortOrder: optionData.sortOrder || shippingOptions.length + 1
    };
    
    shippingOptions.push(newOption);
    
    return NextResponse.json({ success: true, shippingOption: newOption });
  } catch (error: any) {
    console.error('Error creating shipping option:', error);
    return NextResponse.json({ error: 'Failed to create shipping option' }, { status: 500 });
  }
}

// PUT - Update shipping option (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing shipping option ID' }, { status: 400 });
    }
    
    const optionIndex = shippingOptions.findIndex(option => option.id === id);
    if (optionIndex === -1) {
      return NextResponse.json({ error: 'Shipping option not found' }, { status: 404 });
    }
    
    shippingOptions[optionIndex] = { ...shippingOptions[optionIndex], ...updates };
    
    return NextResponse.json({ success: true, shippingOption: shippingOptions[optionIndex] });
  } catch (error: any) {
    console.error('Error updating shipping option:', error);
    return NextResponse.json({ error: 'Failed to update shipping option' }, { status: 500 });
  }
}

// DELETE - Delete shipping option (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing shipping option ID' }, { status: 400 });
    }
    
    const optionIndex = shippingOptions.findIndex(option => option.id === id);
    if (optionIndex === -1) {
      return NextResponse.json({ error: 'Shipping option not found' }, { status: 404 });
    }
    
    shippingOptions.splice(optionIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting shipping option:', error);
    return NextResponse.json({ error: 'Failed to delete shipping option' }, { status: 500 });
  }
}