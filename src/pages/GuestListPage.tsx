/**
 * GuestListPage - Main guest list page component
 * @feature 006-guest-list
 * @task T008, T014, T023, T024, T026, T029
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useGuests, useWeddingEvents } from '@/hooks/useGuests';
import { useDebounce } from '@/hooks/useDebounce';
import { GuestFilters, DEFAULT_GUEST_FILTERS, PAGE_SIZE } from '@/types/guest';

// Helper to check if any filters are active
function hasActiveFilters(filters: GuestFilters): boolean {
  return (
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.rsvpStatus !== 'all' ||
    filters.eventId !== null
  );
}
import { GuestTable } from '@/components/guests/GuestTable';
import { GuestCardList } from '@/components/guests/GuestCardList';
import { GuestPagination } from '@/components/guests/GuestPagination';
import { BulkActionsBar } from '@/components/guests/BulkActionsBar';
import { EmptyGuestState } from '@/components/guests/EmptyGuestState';
import { NoSearchResults } from '@/components/guests/NoSearchResults';
import { GuestTableSkeleton } from '@/components/guests/GuestTableSkeleton';
import { ExportRow } from '@/components/guests/ExportRow';
import { GuestFilters as GuestFiltersComponent } from '@/components/guests/GuestFilters';

export function GuestListPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<GuestFilters>(DEFAULT_GUEST_FILTERS);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  // Fetch events for event filter dropdown
  const { data: events = [] } = useWeddingEvents(weddingId || '');

  // Debounce search for performance
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedFilters = { ...filters, search: debouncedSearch };

  // Fetch guests with current filters and pagination
  const { guests, total, isLoading, isError } = useGuests({
    weddingId: weddingId || '',
    page: currentPage,
    filters: debouncedFilters,
  });

  // Handle filter changes - reset to page 1 when filters change
  const handleFiltersChange = (newFilters: Partial<GuestFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Placeholder action handlers
  const handleAddGuest = () => {
    toast.info('Coming in Phase 6B');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditGuest = (_id: string) => {
    toast.info('Coming in Phase 6B');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteGuest = (_id: string) => {
    toast.info('Coming in Phase 6B');
  };

  // Selection handlers
  const handleSelectGuest = (id: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedGuests.size === guests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(guests.map((g) => g.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedGuests(new Set());
  };

  // Handle page changes - clear selection when changing pages
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedGuests(new Set());
  };

  // Calculate pagination values
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, total);

  // Handle invalid wedding ID
  if (!weddingId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Wedding not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Guests</h1>
        <Button onClick={handleAddGuest}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Filters */}
      <GuestFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        events={events}
      />

      {/* Export Row - Export buttons + Results count */}
      {!isLoading && !isError && (
        <ExportRow
          startItem={total > 0 ? startItem : 0}
          endItem={total > 0 ? endItem : 0}
          total={total}
        />
      )}

      {/* Loading State - Skeleton */}
      {isLoading && (
        <>
          {/* Desktop skeleton */}
          <div className="hidden lg:block">
            <GuestTableSkeleton rowCount={5} />
          </div>
          {/* Mobile skeleton */}
          <div className="block lg:hidden space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border border-[#E8E8E8] rounded-lg p-4 bg-white animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="flex gap-2 mb-3">
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading guests. Please try again.</p>
        </div>
      )}

      {/* Bulk Actions Bar - shown when guests are selected */}
      {selectedGuests.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedGuests.size}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Guest List - Desktop Table / Mobile Cards */}
      {!isLoading && !isError && guests.length > 0 && (
        <>
          {/* Desktop: Table view (hidden on mobile) */}
          <div className="hidden lg:block">
            <GuestTable
              guests={guests}
              selectedGuests={selectedGuests}
              onSelectGuest={handleSelectGuest}
              onSelectAll={handleSelectAll}
              onEditGuest={handleEditGuest}
              onDeleteGuest={handleDeleteGuest}
            />
          </div>

          {/* Mobile: Card view (hidden on desktop) */}
          <div className="block lg:hidden">
            <GuestCardList
              guests={guests}
              onEditGuest={handleEditGuest}
              onDeleteGuest={handleDeleteGuest}
            />
          </div>

          {/* Pagination */}
          <GuestPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Empty states */}
      {!isLoading && !isError && guests.length === 0 && (
        hasActiveFilters(filters) ? (
          <NoSearchResults searchTerm={filters.search || undefined} />
        ) : (
          <EmptyGuestState />
        )
      )}
    </div>
  );
}
