import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SearchInput } from '@/components/weddings/SearchInput';
import { StatusFilter } from '@/components/weddings/StatusFilter';
import { SortToggle } from '@/components/weddings/SortToggle';
import { WeddingList } from '@/components/weddings/WeddingList';
import { WeddingListSkeleton } from '@/components/weddings/WeddingListSkeleton';
import { EmptyState } from '@/components/weddings/EmptyState';
import { NoResults } from '@/components/weddings/NoResults';
import { DeleteWeddingDialog } from '@/components/weddings/DeleteWeddingDialog';
import { useWeddings, useDeleteWedding } from '@/hooks/useWeddings';
import type { Wedding, WeddingStatus, WeddingListFilters } from '@/types/wedding';

const defaultFilters: WeddingListFilters = {
  search: '',
  status: 'all',
  sortBy: 'wedding_date',
  sortOrder: 'asc',
};

export function WeddingListPage() {
  const [filters, setFilters] = useState<WeddingListFilters>(defaultFilters);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [weddingToDelete, setWeddingToDelete] = useState<Wedding | null>(null);

  const { data: weddings, isLoading, isError, error } = useWeddings(filters);
  const deleteMutation = useDeleteWedding();

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleStatusChange = (status: WeddingStatus | 'all') => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleSortChange = (sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortOrder }));
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleDeleteClick = (wedding: Wedding) => {
    setWeddingToDelete(wedding);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!weddingToDelete) return;

    try {
      await deleteMutation.mutateAsync(weddingToDelete.id);
      toast.success('Wedding deleted successfully');
      setDeleteDialogOpen(false);
      setWeddingToDelete(null);
    } catch {
      toast.error('Failed to delete wedding. Please try again.');
    }
  };

  // Show error toast for data fetch errors
  if (isError) {
    toast.error(`Failed to load weddings: ${error?.message || 'Unknown error'}`);
  }

  const hasFilters = filters.search !== '' || filters.status !== 'all';
  const hasWeddings = weddings && weddings.length > 0;
  const showEmptyState = !isLoading && !hasWeddings && !hasFilters;
  const showNoResults = !isLoading && !hasWeddings && hasFilters;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Weddings
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your wedding portfolio
            </p>
          </div>
          <Button asChild>
            <Link to="/weddings/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Wedding
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 sm:max-w-xs">
            <SearchInput value={filters.search} onChange={handleSearchChange} />
          </div>
          <div className="flex items-center gap-2">
            <StatusFilter value={filters.status} onChange={handleStatusChange} />
            <SortToggle sortOrder={filters.sortOrder} onChange={handleSortChange} />
          </div>
        </div>

        {/* Content */}
        {isLoading && <WeddingListSkeleton />}
        {showEmptyState && <EmptyState />}
        {showNoResults && <NoResults onClearFilters={handleClearFilters} />}
        {hasWeddings && (
          <WeddingList weddings={weddings} onDeleteClick={handleDeleteClick} />
        )}

        {/* Delete Dialog */}
        <DeleteWeddingDialog
          wedding={weddingToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
