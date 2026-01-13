import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Plus } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-brand-primary/10 p-4">
        <Heart className="h-12 w-12 text-brand-primary" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-semibold text-foreground">
        No weddings yet
      </h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        Start by creating your first wedding to begin managing your clients&apos; special days.
      </p>
      <Button asChild>
        <Link to="/weddings/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Wedding
        </Link>
      </Button>
    </div>
  );
}
