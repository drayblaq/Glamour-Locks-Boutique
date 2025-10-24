'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Package } from 'lucide-react';
import { ShippingOption } from '@/lib/types/shipping';
import { CustomerShippingSelection } from '@/lib/types/shipping';

interface ShippingOptionsProps {
  onShippingSelect: (shipping: CustomerShippingSelection) => void;
  selectedShipping?: CustomerShippingSelection;
  subtotal: number;
}

export default function ShippingOptions({ 
  onShippingSelect, 
  selectedShipping, 
  subtotal 
}: ShippingOptionsProps) {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShippingOptions();
  }, []);

  const fetchShippingOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping/options?active=true');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping options');
      }
      const data = await response.json();
      setShippingOptions(data.options || []);
      
      // Auto-select first option if none selected
      if (data.options?.length > 0 && !selectedShipping) {
        const firstOption = data.options[0];
        onShippingSelect({
          optionId: firstOption.id,
          name: firstOption.name,
          price: firstOption.price,
          estimatedDays: firstOption.estimatedDays,
        });
      }
    } catch (err) {
      console.error('Error fetching shipping options:', err);
      setError('Failed to load shipping options');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (optionId: string) => {
    const option = shippingOptions.find(opt => opt.id === optionId);
    if (option) {
      onShippingSelect({
        optionId: option.id,
        name: option.name,
        price: option.price,
        estimatedDays: option.estimatedDays,
      });
    }
  };

  const formatDeliveryTime = (estimatedDays: { min: number; max: number }) => {
    if (estimatedDays.min === estimatedDays.max) {
      return `${estimatedDays.min} ${estimatedDays.min === 1 ? 'day' : 'days'}`;
    }
    return `${estimatedDays.min}-${estimatedDays.max} ${estimatedDays.max === 1 ? 'day' : 'days'}`;
  };

  const getShippingIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('express') || lowerName.includes('next day')) {
      return <Package className="w-5 h-5 text-orange-500" />;
    }
    if (lowerName.includes('standard')) {
      return <Truck className="w-5 h-5 text-blue-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-center py-4">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (shippingOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No shipping options available. Please contact support.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Options
        </CardTitle>
        <CardDescription>
          Choose your preferred delivery method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedShipping?.optionId || ''} 
          onValueChange={handleShippingChange}
          className="space-y-3"
        >
          {shippingOptions.map((option) => (
            <div key={option.id} className="relative">
              <RadioGroupItem
                value={option.id}
                id={option.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.id}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-all"
              >
                <div className="flex items-start gap-3 flex-1">
                  {getShippingIcon(option.name)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{option.name}</span>
                      {option.name.toLowerCase().includes('express') && (
                        <Badge variant="secondary" className="text-xs">
                          Fast
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {option.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Delivery in {formatDeliveryTime(option.estimatedDays)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {option.price === 0 ? 'FREE' : `£${option.price.toFixed(2)}`}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {selectedShipping && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">
                Selected: {selectedShipping.name}
              </span>
              <span className="font-semibold text-green-800">
                {selectedShipping.price === 0 ? 'FREE' : `£${selectedShipping.price.toFixed(2)}`}
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Estimated delivery: {formatDeliveryTime(selectedShipping.estimatedDays)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}