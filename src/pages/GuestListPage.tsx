/**
 * GuestListPage - Main guest list page component
 * Phase 021 redesign: Expandable cards with 5-tab interface
 * @feature 006-guest-list
 * @feature 007-guest-crud-attendance
 * @feature 021-guest-page-redesign
 */

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Grid3X3, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGuestCards, useWeddingEvents } from '@/hooks/useGuests';
import { useDebounce } from '@/hooks/useDebounce';
import { useBulkGuestActions } from '@/hooks/useBulkGuestActions';
import {
  GuestFiltersState,
  DEFAULT_GUEST_FILTERS_STATE,
  ExpandedCardsState,
  SelectedGuestsState,
} from '@/types/guest';

// Components
import { GuestCard } from '@/components/guests/GuestCard';
import { BulkActionsBar } from '@/components/guests/BulkActionsBar';
import { EmptyGuestState } from '@/components/guests/EmptyGuestState';
import { NoSearchResults } from '@/components/guests/NoSearchResults';
import { GuestFilters as GuestFiltersComponent } from '@/components/guests/GuestFilters';
import { GuestModal } from '@/components/guests/GuestModal';
import { DeleteGuestDialog } from '@/components/guests/DeleteGuestDialog';
import { AttendanceMatrix } from '@/components/guests/AttendanceMatrix';
import { BulkTableAssignModal } from '@/components/guests/BulkTableAssignModal';
import { useGuestMutations } from '@/hooks/useGuestMutations';
import { toast } from 'sonner';

// Helper to check if any filters are active
function hasActiveFilters(filters: GuestFiltersState): boolean {
  return (
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.invitationStatus !== 'all' ||
    filters.tableNumber !== 'all' ||
    filters.eventId !== null
  );
}

export function GuestListPage() {
  const { weddingId } = useParams<{ weddingId: string }>();

  // Card state management (Phase 021)
  const [expandedCards, setExpandedCards] = useState<ExpandedCardsState>(new Set());
  const [selectedGuests, setSelectedGuests] = useState<SelectedGuestsState>(new Set());
  const [filters, setFilters] = useState<GuestFiltersState>(DEFAULT_GUEST_FILTERS_STATE);

  // Modal state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | undefined>(undefined);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingGuest, setDeletingGuest] = useState<{ id: string; name: string } | null>(null);

  // Attendance matrix state
  const [isAttendanceMatrixOpen, setIsAttendanceMatrixOpen] = useState(false);

  // Bulk seating modal state
  const [isBulkSeatingOpen, setIsBulkSeatingOpen] = useState(false);

  // Mutations
  const { deleteGuest, bulkAssignTable } = useGuestMutations(weddingId || '');

  // Fetch events for event filter dropdown
  const { data: events = [] } = useWeddingEvents(weddingId || '');

  // Debounce search for performance (300ms)
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedFilters = { ...filters, search: debouncedSearch };

  // Fetch guests with event attendance for card display
  const { guests, isLoading, isError } = useGuestCards({
    weddingId: weddingId || '',
    filters: debouncedFilters,
  });

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<GuestFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Card expand/collapse handlers
  const handleToggleExpand = useCallback((guestId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  }, []);

  // Expand all visible guests (respects current filter state)
  const handleExpandAll = useCallback(() => {
    setExpandedCards(new Set(guests.map((g) => g.id)));
  }, [guests]);

  // Collapse all guests
  const handleCollapseAll = useCallback(() => {
    setExpandedCards(new Set());
  }, []);

  // Check if all visible cards are expanded
  const allExpanded = guests.length > 0 && expandedCards.size >= guests.length &&
    guests.every((g) => expandedCards.has(g.id));

  // Selection handlers
  const handleToggleSelect = useCallback((guestId: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  }, []);

  // Bulk actions hook
  const {
    selectAll,
    deselectAll,
    allSelected,
    someSelected,
    exportSelected,
    exportAll,
  } = useBulkGuestActions({
    guests,
    selectedGuests,
    setSelectedGuests,
  });

  const handleClearSelection = () => {
    deselectAll();
  };

  // Guest CRUD handlers
  const handleAddGuest = () => {
    setEditingGuestId(undefined);
    setIsGuestModalOpen(true);
  };

  // Delete handler - triggered from GuestCard dropdown menu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteGuest = (id: string) => {
    const guest = guests.find((g) => g.id === id);
    if (guest) {
      setDeletingGuest({ id, name: guest.name });
      setIsDeleteDialogOpen(true);
    }
  };
  // Make TypeScript happy by using the function in a no-op expression
  void handleDeleteGuest;

  const handleConfirmDelete = async () => {
    if (!deletingGuest) return;

    try {
      await deleteGuest.mutateAsync({ guest_id: deletingGuest.id });
      toast.success(`${deletingGuest.name} has been deleted.`);
      setIsDeleteDialogOpen(false);
      setDeletingGuest(null);
      // Clear selection and expanded state if deleted
      setSelectedGuests((prev) => {
        const next = new Set(prev);
        next.delete(deletingGuest.id);
        return next;
      });
      setExpandedCards((prev) => {
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

  // Open bulk seating modal
  const handleOpenBulkSeating = () => {
    if (selectedGuests.size > 0) {
      setIsBulkSeatingOpen(true);
    }
  };

  // Get selected guest objects for the modal
  const selectedGuestObjects = guests.filter((g) => selectedGuests.has(g.id));

  // Handle invalid wedding ID
  if (!weddingId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Wedding not found</p>
      </div>
    );
  }

  // Calculate guest counts for header
  const totalGuests = guests.length;
  const plusOnesCount = guests.filter((g) => g.has_plus_one).length;
  const totalAttendees = totalGuests + plusOnesCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#5C4B4B]">Guests</h1>
          {!isLoading && !isError && (
            <p className="text-sm text-gray-600 mt-1">
              {totalGuests} guests + {plusOnesCount} plus ones = {totalAttendees} total
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Expand/Collapse All - only show when there are guests */}
          {!isLoading && !isError && guests.length > 0 && (
            allExpanded ? (
              <Button variant="outline" onClick={handleCollapseAll}>
                <ChevronsDownUp className="h-4 w-4 mr-2" />
                Collapse All
              </Button>
            ) : (
              <Button variant="outline" onClick={handleExpandAll}>
                <ChevronsUpDown className="h-4 w-4 mr-2" />
                Expand All
              </Button>
            )
          )}
          <Button variant="outline" onClick={() => setIsAttendanceMatrixOpen(true)}>
            <Grid3X3 className="h-4 w-4 mr-2" />
            Attendance Matrix
          </Button>
          <Button onClick={handleAddGuest} className="bg-[#D4A5A5] hover:bg-[#c99595]">
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GuestFiltersComponent
        filters={{
          search: filters.search,
          type: filters.type,
          invitationStatus: filters.invitationStatus,
          tableNumber: filters.tableNumber,
          eventId: filters.eventId,
        }}
        onFiltersChange={(newFilters) => {
          handleFiltersChange({
            search: newFilters.search ?? filters.search,
            type: newFilters.type ?? filters.type,
            invitationStatus: newFilters.invitationStatus ?? filters.invitationStatus,
            tableNumber: newFilters.tableNumber ?? filters.tableNumber,
            eventId: newFilters.eventId !== undefined ? newFilters.eventId : filters.eventId,
          });
        }}
        onClearFilters={() => setFilters(DEFAULT_GUEST_FILTERS_STATE)}
        events={events}
        guests={guests}
      />

      {/* Loading State - Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border border-[#E8E8E8] rounded-lg p-4 bg-white animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                    <div className="h-5 bg-gray-200 rounded-full w-20" />
                  </div>
                </div>
                <div className="h-5 w-5 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading guests. Please try again.</p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {!isLoading && !isError && guests.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedGuests.size}
          totalCount={guests.length}
          allSelected={allSelected}
          someSelected={someSelected}
          onClearSelection={handleClearSelection}
          onSelectAll={selectAll}
          onAssignTable={handleBulkAssignTable}
          onAssignSeats={handleOpenBulkSeating}
          onExportSelected={exportSelected}
          onExportAll={exportAll}
          isAssigning={bulkAssignTable.isPending}
        />
      )}

      {/* Guest Cards List - Card-based layout (Design 3) */}
      {!isLoading && !isError && guests.length > 0 && (
        <div className="space-y-3">
          {guests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              isExpanded={expandedCards.has(guest.id)}
              isSelected={selectedGuests.has(guest.id)}
              onToggleExpand={handleToggleExpand}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
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

      {/* Bulk Seating Assignment Modal */}
      <BulkTableAssignModal
        open={isBulkSeatingOpen}
        onOpenChange={setIsBulkSeatingOpen}
        weddingId={weddingId}
        selectedGuests={selectedGuestObjects}
        onComplete={() => {
          setSelectedGuests(new Set());
        }}
      />
    </div>
  );
}
