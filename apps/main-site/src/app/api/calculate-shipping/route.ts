import { NextRequest, NextResponse } from 'next/server';

interface ShippingCalculationRequest {
  shippingOptionId: string;
  address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  cartTotal: number;
  items: Array<{
    id: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }>;
}

// Fixed shipping rates (no location multipliers)
const baseShippingRates = {
  'standard': 2.49,
  'next-day': 7.55
};

// Weight surcharge removed - fixed shipping prices

function applyFreeShippingThreshold(cartTotal: number, shippingCost: number): number {
  // Free standard shipping over £50
  if (cartTotal >= 50 && shippingCost <= 2.49) {
    return 0;
  }
  
  return shippingCost;
}

export async function POST(request: NextRequest) {
  try {
    const data: ShippingCalculationRequest = await request.json();
    
    if (!data.shippingOptionId || !data.address || data.cartTotal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get base shipping rate (fixed price, no multipliers)
    const baseRate = baseShippingRates[data.shippingOptionId as keyof typeof baseShippingRates];
    if (!baseRate) {
      return NextResponse.json({ error: 'Invalid shipping option' }, { status: 400 });
    }
    
    // Calculate total shipping cost (fixed price, no location or weight multipliers)
    let shippingCost = baseRate;
    
    // Apply free shipping thresholds
    const originalCost = shippingCost;
    shippingCost = applyFreeShippingThreshold(data.cartTotal, shippingCost);
    
    // Round to 2 decimal places
    shippingCost = Math.round(shippingCost * 100) / 100;
    
    const response = {
      success: true,
      shippingCost,
      breakdown: {
        baseRate,
        locationMultiplier: 1.0,
        weightSurcharge: 0,
        originalCost,
        discount: originalCost - shippingCost,
        freeShippingApplied: originalCost !== shippingCost
      },
      estimatedDelivery: getEstimatedDelivery(data.shippingOptionId, data.address)
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 });
  }
}

function getEstimatedDelivery(shippingOptionId: string, address: any): string {
  const baseDate = new Date();
  let daysToAdd = 3; // default
  
  switch (shippingOptionId) {
    case 'standard':
      daysToAdd = 5;
      break;
    case 'next-day':
      daysToAdd = 1;
      break;
  }
  
  // Add extra day for international shipping
  if (address.country && address.country !== 'UK') {
    daysToAdd += 1;
  }
  
  // Skip weekends
  while (daysToAdd > 0) {
    baseDate.setDate(baseDate.getDate() + 1);
    if (baseDate.getDay() !== 0 && baseDate.getDay() !== 6) { // Not Sunday or Saturday
      daysToAdd--;
    }
  }
  
  return baseDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}