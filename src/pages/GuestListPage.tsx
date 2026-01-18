/**
 * GuestListPage - Main guest list page component
 * @feature 006-guest-list
 * @feature 007-guest-crud-attendance
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGuests, useWeddingEvents } from '@/hooks/useGuests';
import { useDebounce } from '@/hooks/useDebounce';
import { GuestFilters, DEFAULT_GUEST_FILTERS, PAGE_SIZE } from '@/types/guest';

// Helper to check if any filters are active
function hasActiveFilters(filters: GuestFilters): boolean {
  return (
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.invitationStatus !== 'all' ||
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
import { GuestModal } from '@/components/guests/GuestModal';
import { DeleteGuestDialog } from '@/components/guests/DeleteGuestDialog';
import { AttendanceMatrix } from '@/components/guests/AttendanceMatrix';
import { useGuestMutations } from '@/hooks/useGuestMutations';
import { toast } from 'sonner';

export function GuestListPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<GuestFilters>(DEFAULT_GUEST_FILTERS);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  // Modal state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | undefined>(undefined);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingGuest, setDeletingGuest] = useState<{ id: string; name: string } | null>(null);

  // Attendance matrix state
  const [isAttendanceMatrixOpen, setIsAttendanceMatrixOpen] = useState(false);

  // Mutations
  const { deleteGuest, bulkAssignTable } = useGuestMutations(weddingId || '');

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

  // Guest CRUD handlers
  const handleAddGuest = () => {
    setEditingGuestId(undefined);
    setIsGuestModalOpen(true);
  };

  const handleEditGuest = (id: string) => {
    setEditingGuestId(id);
    setIsGuestModalOpen(true);
  };

  const handleDeleteGuest = (id: string) => {
    // Find the guest name for the confirmation dialog
    const guest = guests.find((g) => g.id === id);
    if (guest) {
      setDeletingGuest({ id, name: guest.name });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingGuest) return;

    try {
      await deleteGuest.mutateAsync({ guest_id: deletingGuest.id });
      toast.success(`${deletingGuest.name} has been deleted.`);
      setIsDeleteDialogOpen(false);
      setDeletingGuest(null);
      // Clear selection if deleted guest was selected
      setSelectedGuests((prev) => {
        const next = new Set(prev);
        next.delete(deletingGuest.id);
        return next;
      });
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Failed to delete guest. Please try again.');
    }
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setDeletingGuest(null);
    }
  };

  // Bulk table assignment handler
  const handleBulkAssignTable = async (tableNumber: string | null) => {
    if (selectedGuests.size === 0) return;

    try {
      await bulkAssignTable.mutateAsync({
        guest_ids: Array.from(selectedGuests),
        table_number: tableNumber,
      });
      toast.success(
        tableNumber
          ? `${selectedGuests.size} guests assigned to Table ${tableNumber}`
          : `Table assignment cleared for ${selectedGuests.size} guests`
      );
      setSelectedGuests(new Set());
    } catch (error) {
      console.error('Error assigning tables:', error);
      toast.error('Failed to assign tables. Please try again.');
    }
  };

  const handleGuestModalClose = (open: boolean) => {
    setIsGuestModalOpen(open);
    if (!open) {
      setEditingGuestId(undefined);
    }
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAttendanceMatrixOpen(true)}>
            <Grid3X3 className="h-4 w-4 mr-2" />
            Attendance Matrix
          </Button>
          <Button onClick={handleAddGuest}>
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GuestFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        events={events}
        guests={guests}
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

      {/* Bulk Actions Bar - always visible for discoverability */}
      {!isLoading && !isError && guests.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedGuests.size}
          onClearSelection={handleClearSelection}
          onAssignTable={handleBulkAssignTable}
          isAssigning={bulkAssignTable.isPending}
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

      {/* Guest Add/Edit Modal */}
      <GuestModal
        open={isGuestModalOpen}
        onOpenChange={handleGuestModalClose}
        weddingId={weddingId}
        guestId={editingGuestId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteGuestDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        guest={deletingGuest}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteGuest.isPending}
      />

      {/* Attendance Matrix Modal */}
      <AttendanceMatrix
        open={isAttendanceMatrixOpen}
        onOpenChange={setIsAttendanceMatrixOpen}
        weddingId={weddingId}
      />
    </div>
  );
}
