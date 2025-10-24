# Product Variant System - How It Works

## Overview
Each color variant is now treated as a completely separate product in the cart system. This means:

- Different colors of the same product are separate cart items
- Each variant has its own stock quantity
- Customers see individual stock for each color
- Cart operations work independently for each variant

## Implementation Details

### 1. Product Structure
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  variants?: ProductVariant[];
  // ... other fields
}

interface ProductVariant {
  color: string;
  quantity: number;
  images?: string[];
}
```

### 2. Cart Item Structure
```typescript
interface CartItem {
  id: string; // For variants: "productId-colorname", for regular: "productId"
  name: string; // For variants: "Product Name - Color", for regular: "Product Name"
  price: number;
  quantity: number;
  variant?: {
    color: string;
    variantId: string;
  };
}
```

### 3. How Variants Work in Cart

#### Adding to Cart:
- **Regular Product**: `id: "product123"`, `name: "Hair Shampoo"`
- **Red Variant**: `id: "product123-red"`, `name: "Hair Shampoo - Red"`
- **Blue Variant**: `id: "product123-blue"`, `name: "Hair Shampoo - Blue"`

#### Cart Behavior:
- Each color appears as a separate line item
- Different colors can have different quantities
- Removing one color doesn't affect others
- Stock is tracked separately for each color

### 4. Customer Experience

1. **Product Listing**: Shows total colors available and total stock across variants
2. **Product Detail**: Customer must select a color to see specific stock
3. **Add to Cart**: Each color selection creates a unique cart item
4. **Cart View**: Each color appears as separate product with color in name
5. **Checkout**: Each variant is treated as individual product in order

### 5. Admin Experience

1. **Add Product**: Can add multiple color variants with individual stock
2. **Edit Product**: Can modify stock for each color independently
3. **Inventory**: Each color variant has separate inventory tracking
4. **Orders**: Orders show specific color variants purchased

## Example Scenario

**Product**: "Premium Hair Oil" - £25.00

**Variants**:
- Black: 10 units in stock
- Brown: 5 units in stock  
- Blonde: 0 units in stock (out of stock)

**Customer adds to cart**:
- 2x "Premium Hair Oil - Black" (£25.00 each)
- 1x "Premium Hair Oil - Brown" (£25.00 each)

**Cart shows**:
- Premium Hair Oil - Black × 2 = £50.00
- Premium Hair Oil - Brown × 1 = £25.00
- **Total**: £75.00

**Stock after purchase**:
- Black: 8 units remaining
- Brown: 4 units remaining
- Blonde: Still 0 units (unchanged)

This system ensures each color variant is completely independent while maintaining a clean user experience.