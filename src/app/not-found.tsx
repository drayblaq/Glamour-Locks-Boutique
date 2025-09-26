import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center min-h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
      <TriangleAlert className="h-24 w-24 text-accent mb-6" />
      <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Oops! The page you're looking for seems to have wandered off.
      </p>
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-3 text-lg shadow-lg">
        <Link href="/">Go Back to Homepage</Link>
      </Button>
    </div>
  );
}
