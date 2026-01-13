import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

interface NoResultsProps {
  onClearFilters: () => void;
}

export function NoResults({ onClearFilters }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <SearchX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-semibold text-foreground">
        No results found
      </h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        We couldn&apos;t find any weddings matching your search or filters. Try adjusting your criteria.
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
