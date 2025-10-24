export interface Review {
  id: string;
  user: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[]; // URLs
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  discountPrice?: number; // Optional discounted price
  rating?: number; // Optional average rating (1-5)
  tags?: string[]; // Optional tags for badges (e.g., 'new', 'bestseller')
  variants?: Array<{
    color: string;
    quantity: number;
    images: string[];
  }>;
}

export interface NavigationLink {
  href: string;
  label: string;
}

export type HairType = 'Straight' | 'Wavy' | 'Curly' | 'Coily';
export type ProductCategory = 'Shampoo' | 'Conditioner' | 'Oil' | 'Serum' | 'Mask' | 'Styling';
export type ProductConcern = 'Dryness' | 'Frizz' | 'Damage' | 'Hair Fall' | 'Scalp Care' | 'Volume';

export interface Filters {
  hairType: HairType[];
  category: ProductCategory[];
  concern: ProductConcern[];
}
