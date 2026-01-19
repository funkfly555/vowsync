/**
 * useBulkGuestActions - Hook for bulk guest operations
 * Provides assignTable, exportSelected, selectAll, deselectAll methods
 * @feature 021-guest-page-redesign
 * @task T037
 */

import { useCallback } from 'react';
import { GuestCardDisplayItem } from '@/types/guest';

interface UseBulkGuestActionsProps {
  guests: GuestCardDisplayItem[];
  selectedGuests: Set<string>;
  setSelectedGuests: React.Dispatch<React.SetStateAction<Set<string>>>;
}

interface UseBulkGuestActionsResult {
  /** Select all currently visible guests */
  selectAll: () => void;
  /** Deselect all guests */
  deselectAll: () => void;
  /** Toggle select all / deselect all */
  toggleSelectAll: () => void;
  /** Check if all visible guests are selected */
  allSelected: boolean;
  /** Check if some but not all guests are selected */
  someSelected: boolean;
  /** Export selected guests to CSV and trigger download */
  exportSelected: () => void;
  /** Export all guests to CSV and trigger download */
  exportAll: () => void;
}

/**
 * Generate CSV content from guest data
 */
function generateGuestCSV(guests: GuestCardDisplayItem[]): string {
  // CSV header
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Guest Type',
    'Invitation Status',
    'Table Number',
    'Has Plus One',
    'Plus One Name',
    'Plus One Confirmed',
    'Events Attending',
    'Total Events',
  ];

  // CSV rows
  const rows = guests.map((guest) => [
    escapeCsvField(guest.name),
    escapeCsvField(guest.email || ''),
    escapeCsvField(guest.phone || ''),
    escapeCsvField(guest.guest_type),
    escapeCsvField(guest.invitation_status),
    escapeCsvField(guest.table_number || ''),
    guest.has_plus_one ? 'Yes' : 'No',
    escapeCsvField(guest.plus_one_name || ''),
    guest.plus_one_confirmed ? 'Yes' : 'No',
    guest.attendingEventsCount.toString(),
    guest.totalEventsCount.toString(),
  ]);

  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape a field for CSV format
 */
function escapeCsvField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Trigger download of CSV content
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useBulkGuestActions({
  guests,
  selectedGuests,
  setSelectedGuests,
}: UseBulkGuestActionsProps): UseBulkGuestActionsResult {
  const allSelected = guests.length > 0 && selectedGuests.size === guests.length;
  const someSelected = selectedGuests.size > 0 && selectedGuests.size < guests.length;

  const selectAll = useCallback(() => {
    setSelectedGuests(new Set(guests.map((g) => g.id)));
  }, [guests, setSelectedGuests]);

  const deselectAll = useCallback(() => {
    setSelectedGuests(new Set());
  }, [setSelectedGuests]);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [allSelected, deselectAll, selectAll]);

  const exportSelected = useCallback(() => {
    const selectedGuestData = guests.filter((g) => selectedGuests.has(g.id));
    if (selectedGuestData.length === 0) return;

    const csv = generateGuestCSV(selectedGuestData);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `guests-selected-${timestamp}.csv`);
  }, [guests, selectedGuests]);

  const exportAll = useCallback(() => {
    if (guests.length === 0) return;

    const csv = generateGuestCSV(guests);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `guests-all-${timestamp}.csv`);
  }, [guests]);

  return {
    selectAll,
    deselectAll,
    toggleSelectAll,
    allSelected,
    someSelected,
    exportSelected,
    exportAll,
  };
}
