import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SortToggleProps {
  sortOrder: 'asc' | 'desc';
  onChange: (order: 'asc' | 'desc') => void;
}

export function SortToggle({ sortOrder, onChange }: SortToggleProps) {
  const toggleSort = () => {
    onChange(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleSort}
      className="gap-2"
      aria-label={`Sort by date ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
    >
      {sortOrder === 'asc' ? (
        <>
          <ArrowUp className="h-4 w-4" />
          <span className="hidden sm:inline">Date (Earliest)</span>
        </>
      ) : (
        <>
          <ArrowDown className="h-4 w-4" />
          <span className="hidden sm:inline">Date (Latest)</span>
        </>
      )}
    </Button>
  );
}
