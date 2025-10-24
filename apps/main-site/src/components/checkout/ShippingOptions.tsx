'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
}

interface ShippingCalculation {
  shippingCost: number;
  breakdown: {
    baseRate: number;
    locationMultiplier: number;
    weightSurcharge: number;
    originalCost: number;
    discount: number;
    freeShippingApplied: boolean;
  };
  estimatedDelivery: string;
}

interface ShippingOptionsProps {
  customerInfo: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  cartTotal: number;
  cartItems: Array<{
    id: string;
    weight?: number;
  }>;
  selectedShipping: string | null;
  onShippingSelect: (optionId: string, cost: number, details: any) => void;
}

const getShippingIcon = (optionId: string) => {
  switch (optionId) {
    case 'standard':
      return <Truck className="h-5 w-5" />;
    case 'express':
      return <Clock className="h-5 w-5" />;
    case 'next-day':
      return <Zap className="h-5 w-5" />;
    default:
      return <Truck className="h-5 w-5" />;
  }
};

export default function ShippingOptions({
  customerInfo,
  cartTotal,
  cartItems,
  selectedShipping,
  onShippingSelect
}: ShippingOptionsProps) {
  const { toast } = useToast();
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [calculations, setCalculations] = useState<Record<string, ShippingCalculation>>({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState<Record<string, boolean>>({});

  // Load shipping options
  useEffect(() => {
    loadShippingOptions();
  }, []);

  // Calculate shipping costs when address or cart changes
  useEffect(() => {
    if (shippingOptions.length > 0 && customerInfo.city && customerInfo.zipCode) {
      calculateAllShippingCosts();
    }
  }, [shippingOptions, customerInfo, cartTotal, cartItems]);

  const loadShippingOptions = async () => {
    try {
      const response = await fetch('/api/shipping-options');
      const data = await response.json();
      
      if (data.success) {
        setShippingOptions(data.shippingOptions);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load shipping options',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading shipping options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipping options',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAllShippingCosts = async () => {
    const newCalculations: Record<string, ShippingCalculation> = {};
    const newCalculating: Record<string, boolean> = {};

    // Set all as calculating
    shippingOptions.forEach(option => {
      newCalculating[option.id] = true;
    });
    setCalculating(newCalculating);

    // Calculate each option
    for (const option of shippingOptions) {
      try {
        const calculation = await calculateShippingCost(option.id);
        if (calculation) {
          newCalculations[option.id] = calculation;
        }
      } catch (error) {
        console.error(`Error calculating shipping for ${option.id}:`, error);
      } finally {
        setCalculating(prev => ({ ...prev, [option.id]: false }));
      }
    }

    setCalculations(newCalculations);
  };

  const calculateShippingCost = async (optionId: string): Promise<ShippingCalculation | null> => {
    try {
      const response = await fetch('/api/calculate-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingOptionId: optionId,
          address: {
            city: customerInfo.city,
            state: customerInfo.state,
            zipCode: customerInfo.zipCode,
            country: customerInfo.country || 'UK'
          },
          cartTotal,
          items: cartItems
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        console.error('Shipping calculation failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return null;
    }
  };

  const handleShippingSelect = (option: ShippingOption) => {
    const calculation = calculations[option.id];
    if (calculation) {
      onShippingSelect(option.id, calculation.shippingCost, {
        optionName: option.name,
        estimatedDelivery: calculation.estimatedDelivery,
        breakdown: calculation.breakdown
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Options</CardTitle>
          <CardDescription>Loading available shipping methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customerInfo.city || !customerInfo.zipCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Options</CardTitle>
          <CardDescription>Please complete your address to see shipping options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Enter your shipping address to calculate delivery options
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Options</CardTitle>
        <CardDescription>Choose your preferred delivery method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {shippingOptions.map((option) => {
          const calculation = calculations[option.id];
          const isCalculating = calculating[option.id];
          const isSelected = selectedShipping === option.id;

          return (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-pink-500 bg-pink-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => !isCalculating && calculation && handleShippingSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getShippingIcon(option.id)}
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {option.name}
                      {isSelected && <Badge variant="secondary">Selected</Badge>}
                    </div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                    {calculation && (
                      <div className="text-sm text-gray-500">
                        Estimated delivery: {calculation.estimatedDelivery}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isCalculating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : calculation ? (
                    <div>
                      <div className="font-semibold">
                        {calculation.shippingCost === 0 ? 'FREE' : `£${calculation.shippingCost.toFixed(2)}`}
                      </div>
                      {calculation.breakdown.freeShippingApplied && (
                        <div className="text-xs text-green-600 line-through">
                          £{calculation.breakdown.originalCost.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">Calculating...</div>
                  )}
                </div>
              </div>
              
              {calculation?.breakdown.freeShippingApplied && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  🎉 Free shipping applied!
                </div>
              )}
            </div>
          );
        })}
        
        {cartTotal >= 50 && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            💡 You qualify for free standard shipping on orders over £50!
          </div>
        )}
        
        {cartTotal >= 75 && cartTotal < 50 && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            💡 Spend £{(75 - cartTotal).toFixed(2)} more for 50% off express shipping!
          </div>
        )}
      </CardContent>
    </Card>
  );
}