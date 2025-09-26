"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import Link from 'next/link';
import type { CartItem } from '@/app/contexts/CartContext';

interface CartItemDisplayProps {
  item: CartItem;
  quantity: number;
  onRemove: (itemId: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
}

const CartItemDisplay = ({ item, quantity, onRemove, onQuantityChange }: CartItemDisplayProps) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      onQuantityChange(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-start gap-6 p-6 border-b bg-white rounded-xl shadow-md">
      <div className="relative h-32 w-32 rounded-lg overflow-hidden border shadow-sm">
        <Image
          src={item.image || '/placeholder-image.jpg'}
          alt={item.name}
          fill
          sizes="128px"
          className="object-cover"
          data-ai-hint="product"
        />
      </div>
      <div className="flex-grow">
        <Link href={`/products/${item.id}`} className="hover:text-primary">
          <h3 className="text-lg font-semibold text-primary">{item.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <p className="text-md font-medium text-accent mt-1">£{item.price.toFixed(2)}</p>
        <div className="flex items-center mt-2 gap-2">
          <label htmlFor={`quantity-${item.id}`} className="text-sm mr-2">Qty:</label>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onQuantityChange(item.id, Math.max(1, quantity - 1))}
            aria-label={`Decrease quantity for ${item.name}`}
          >
            -
          </Button>
          <Input
            type="number"
            id={`quantity-${item.id}`}
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            className="w-12 h-8 text-sm text-center"
            aria-label={`Quantity for ${item.name}`}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onQuantityChange(item.id, quantity + 1)}
            aria-label={`Increase quantity for ${item.name}`}
          >
            +
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-lg font-semibold text-foreground">£{(item.price * quantity).toFixed(2)}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${item.name} from cart`}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CartItemDisplay;