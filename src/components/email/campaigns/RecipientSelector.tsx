/**
 * RecipientSelector - Component for selecting campaign recipients
 * @feature 016-email-campaigns
 * @task T023
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecipients } from '@/hooks/useRecipients';
import { useWeddingEvents } from '@/hooks/useGuests';
import { Users, AlertTriangle, Filter } from 'lucide-react';
import type {
  RecipientType,
  RecipientFilter,
  GuestFilter,
  VendorFilter,
  Recipient,
} from '@/types/email';
import { cn } from '@/lib/utils';

interface RecipientSelectorProps {
  weddingId: string;
  recipientType: RecipientType;
  filter: RecipientFilter | null;
  onFilterChange: (filter: RecipientFilter | null) => void;
  selectedRecipientIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  showPreview?: boolean;
  maxPreviewCount?: number;
}

/**
 * Recipient selection component with filters
 * Supports both guest and vendor recipient types
 */
export function RecipientSelector({
  weddingId,
  recipientType,
  filter,
  onFilterChange,
  selectedRecipientIds,
  onSelectionChange,
  showPreview = true,
  maxPreviewCount = 10,
}: RecipientSelectorProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Fetch recipients based on current filters
  const { result, isLoading } = useRecipients({
    weddingId,
    recipientType,
    filter,
    excludeInvalidEmails: true,
  });

  // Fetch events for guest event filter
  const { data: events } = useWeddingEvents(weddingId);

  // Handle selection toggle
  const handleToggleRecipient = (recipientId: string) => {
    if (!onSelectionChange || !selectedRecipientIds) return;

    if (selectedRecipientIds.includes(recipientId)) {
      onSelectionChange(selectedRecipientIds.filter((id) => id !== recipientId));
    } else {
      onSelectionChange([...selectedRecipientIds, recipientId]);
    }
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(result.recipients.map((r) => r.id));
  };

  const handleSelectNone = () => {
    if (!onSelectionChange) return;
    onSelectionChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span className="font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-20 inline-block" />
            ) : (
              <>
                {result.totalCount} {recipientType === 'guest' ? 'guests' : 'vendors'}
              </>
            )}
          </span>
          {result.invalidEmailCount > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {result.invalidEmailCount} invalid email{result.invalidEmailCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          {recipientType === 'guest' ? (
            <GuestFilters
              filter={filter as GuestFilter | null}
              onFilterChange={onFilterChange}
              events={events || []}
            />
          ) : (
            <VendorFilters
              filter={filter as VendorFilter | null}
              onFilterChange={onFilterChange}
            />
          )}
        </div>
      )}

      {/* Selection controls */}
      {onSelectionChange && selectedRecipientIds && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSelectNone}>
            Select None
          </Button>
          <span className="text-sm text-gray-500 ml-auto">
            {selectedRecipientIds.length} selected
          </span>
        </div>
      )}

      {/* Recipient preview list */}
      {showPreview && (
        <ScrollArea className="h-64 border rounded-lg">
          <div className="p-2 space-y-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))
            ) : result.recipients.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No recipients match your criteria
              </div>
            ) : (
              <>
                {result.recipients.slice(0, maxPreviewCount).map((recipient) => (
                  <RecipientRow
                    key={recipient.id}
                    recipient={recipient}
                    isSelected={selectedRecipientIds?.includes(recipient.id)}
                    onToggle={
                      onSelectionChange
                        ? () => handleToggleRecipient(recipient.id)
                        : undefined
                    }
                  />
                ))}
                {result.recipients.length > maxPreviewCount && (
                  <div className="px-2 py-3 text-center text-sm text-gray-500 border-t">
                    And {result.recipients.length - maxPreviewCount} more recipients...
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// =============================================================================
// Guest Filters
// =============================================================================

interface GuestFiltersProps {
  filter: GuestFilter | null;
  onFilterChange: (filter: GuestFilter | null) => void;
  events: Array<{ id: string; event_name: string }>;
}

function GuestFilters({ filter, onFilterChange, events }: GuestFiltersProps) {
  const handleChange = (key: keyof GuestFilter, value: unknown) => {
    if (value === 'all' || value === undefined) {
      const newFilter = { ...filter };
      delete newFilter[key];
      onFilterChange(Object.keys(newFilter).length > 0 ? newFilter : null);
    } else {
      onFilterChange({ ...filter, [key]: value });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-sm">Invitation Status</Label>
        <Select
          value={filter?.invitation_status || 'all'}
          onValueChange={(v) => handleChange('invitation_status', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">To Be Sent</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm">Event</Label>
        <Select
          value={filter?.event_id || 'all'}
          onValueChange={(v) => handleChange('event_id', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.event_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="table_assigned"
          checked={filter?.table_assigned === true}
          onCheckedChange={(checked) =>
            handleChange('table_assigned', checked ? true : undefined)
          }
        />
        <Label htmlFor="table_assigned" className="text-sm">
          Has table assignment
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="has_dietary"
          checked={filter?.has_dietary_restrictions === true}
          onCheckedChange={(checked) =>
            handleChange('has_dietary_restrictions', checked ? true : undefined)
          }
        />
        <Label htmlFor="has_dietary" className="text-sm">
          Has dietary restrictions
        </Label>
      </div>
    </div>
  );
}

// =============================================================================
// Vendor Filters
// =============================================================================

interface VendorFiltersProps {
  filter: VendorFilter | null;
  onFilterChange: (filter: VendorFilter | null) => void;
}

function VendorFilters({ filter, onFilterChange }: VendorFiltersProps) {
  const handleChange = (key: keyof VendorFilter, value: unknown) => {
    if (value === 'all' || value === undefined) {
      const newFilter = { ...filter };
      delete newFilter[key];
      onFilterChange(Object.keys(newFilter).length > 0 ? newFilter : null);
    } else {
      onFilterChange({ ...filter, [key]: value });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label className="text-sm">Vendor Type</Label>
        <Select
          value={filter?.vendor_type || 'all'}
          onValueChange={(v) => handleChange('vendor_type', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="venue">Venue</SelectItem>
            <SelectItem value="catering">Catering</SelectItem>
            <SelectItem value="photography">Photography</SelectItem>
            <SelectItem value="florist">Florist</SelectItem>
            <SelectItem value="music">Music/DJ</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm">Contract Status</Label>
        <Select
          value={filter?.contract_status || 'all'}
          onValueChange={(v) => handleChange('contract_status', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm">Payment Status</Label>
        <Select
          value={filter?.payment_status || 'all'}
          onValueChange={(v) => handleChange('payment_status', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// =============================================================================
// Recipient Row
// =============================================================================

interface RecipientRowProps {
  recipient: Recipient;
  isSelected?: boolean;
  onToggle?: () => void;
}

function RecipientRow({ recipient, isSelected, onToggle }: RecipientRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-md transition-colors',
        onToggle && 'cursor-pointer hover:bg-gray-100',
        isSelected && 'bg-blue-50'
      )}
      onClick={onToggle}
    >
      {onToggle && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle()}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{recipient.name}</p>
        <p className="text-xs text-gray-500 truncate">{recipient.email}</p>
      </div>
      {recipient.email_valid === false && (
        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
          Invalid
        </Badge>
      )}
    </div>
  );
}
