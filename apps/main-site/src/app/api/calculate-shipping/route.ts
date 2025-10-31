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

// Location-based shipping multipliers (admin configurable in production)
const locationMultipliers = {
  'UK': {
    'London': 1.0,
    'Manchester': 1.1,
    'Birmingham': 1.1,
    'default': 1.2
  },
  'US': {
    'New York': 1.5,
    'California': 1.7,
    'Texas': 1.6,
    'default': 1.8
  },
  'default': 2.0
};

// Base shipping rates
const baseShippingRates = {
  'standard': 2.49,
  'express': 9.99,
  'next-day': 7.55
};

function calculateLocationMultiplier(address: ShippingCalculationRequest['address']): number {
  const country = address.country || 'UK';
  const city = address.city || '';
  
  const countryRates = locationMultipliers[country as keyof typeof locationMultipliers] || locationMultipliers.default;
  
  if (typeof countryRates === 'object') {
    return countryRates[city as keyof typeof countryRates] || countryRates.default;
  }
  
  return countryRates;
}

function calculateWeightSurcharge(items: ShippingCalculationRequest['items']): number {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0.5), 0);
  
  // Add surcharge for heavy items (over 5kg)
  if (totalWeight > 5) {
    return Math.ceil((totalWeight - 5) / 2) * 2.50; // £2.50 per 2kg over 5kg
  }
  
  return 0;
}

function applyFreeShippingThreshold(cartTotal: number, shippingCost: number): number {
  // Free standard shipping over £50
  if (cartTotal >= 50 && shippingCost <= 2.49) {
    return 0;
  }
  
  // 50% discount on express shipping over £75
  if (cartTotal >= 75 && shippingCost > 2.49 && shippingCost <= 9.99) {
    return shippingCost * 0.5;
  }
  
  return shippingCost;
}

export async function POST(request: NextRequest) {
  try {
    const data: ShippingCalculationRequest = await request.json();
    
    if (!data.shippingOptionId || !data.address || data.cartTotal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get base shipping rate
    const baseRate = baseShippingRates[data.shippingOptionId as keyof typeof baseShippingRates];
    if (!baseRate) {
      return NextResponse.json({ error: 'Invalid shipping option' }, { status: 400 });
    }
    
    // Calculate location multiplier
    const locationMultiplier = calculateLocationMultiplier(data.address);
    
    // Calculate weight surcharge
    const weightSurcharge = calculateWeightSurcharge(data.items || []);
    
    // Calculate total shipping cost
    let shippingCost = (baseRate * locationMultiplier) + weightSurcharge;
    
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
        locationMultiplier,
        weightSurcharge,
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
    case 'express':
      daysToAdd = 2;
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