import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: number; // Max stars
  starSize?: string; // Tailwind class e.g. h-4 w-4
  className?: string;
}

const StarRating = ({ rating, size = 5, starSize = "h-4 w-4", className }: StarRatingProps) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75 ? 1 : 0; // Adjust threshold for half star
  const roundedFullStars = rating % 1 >= 0.75 ? fullStars + 1 : fullStars; // Round up if .75 or more
  const actualFullStars = halfStar ? fullStars : roundedFullStars;
  const emptyStars = size - actualFullStars - halfStar;

  return (
    <div className={cn("flex items-center gap-0.5 text-yellow-400", className)}>
      {Array(actualFullStars)
        .fill(0)
        .map((_, i) => (
          <Star key={`full-${i}`} fill="currentColor" className={cn(starSize)} />
        ))}
      {halfStar === 1 && <StarHalf key="half" fill="currentColor" className={cn(starSize)} />}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <Star key={`empty-${i}`} className={cn(starSize, "text-muted-foreground/50")} />
        ))}
    </div>
  );
};

export default StarRating;
