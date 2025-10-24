export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  id: string;
  shippingOptionId: string;
  zoneId: string;
  price: number;
  freeShippingThreshold?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerShippingSelection {
  optionId: string;
  name: string;
  price: number;
  estimatedDays: {
    min: number;
    max: number;
  };
}