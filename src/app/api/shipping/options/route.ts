import { NextRequest, NextResponse } from 'next/server';
import { 
  getShippingOptions, 
  getActiveShippingOptions,
  addShippingOption, 
  updateShippingOption, 
  deleteShippingOption 
} from '@/lib/firestore/shipping';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const options = activeOnly 
      ? await getActiveShippingOptions()
      : await getShippingOptions();
    
    return NextResponse.json({ options });
  } catch (error) {
    console.error('Error fetching shipping options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping options' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, estimatedDays, isActive = true } = body;

    if (!name || !description || price === undefined || !estimatedDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const option = await addShippingOption({
      name,
      description,
      price: Number(price),
      estimatedDays,
      isActive,
    });

    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping option:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping option' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing option ID' },
        { status: 400 }
      );
    }

    await updateShippingOption(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating shipping option:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping option' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing option ID' },
        { status: 400 }
      );
    }

    await deleteShippingOption(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipping option:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipping option' },
      { status: 500 }
    );
  }
}