import type { Review } from '@/lib/types';
import StarRating from './StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle2 } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const userInitial = review.user.charAt(0).toUpperCase();
  return (
    <div className="p-4 border rounded-lg bg-card shadow-sm">
      <div className="flex items-start mb-2">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={`https://placehold.co/40x40.png`} alt={review.user} data-ai-hint="person avatar"/>
          <AvatarFallback><UserCircle2 /></AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <p className="font-semibold text-foreground">{review.user}</p>
          <StarRating rating={review.rating} />
        </div>
        <p className="ml-auto text-xs text-muted-foreground whitespace-nowrap">{new Date(review.date).toLocaleDateString()}</p>
      </div>
      <p className="text-sm text-foreground/80">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
