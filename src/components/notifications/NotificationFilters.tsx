/**
 * NotificationFilters Component - Filter controls for full page
 * @feature 018-notifications
 * @task T018
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NotificationType, NotificationPriority } from '@/types/notification';
import {
  TYPE_FILTER_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/types/notification';

// =============================================================================
// Props Interface
// =============================================================================

interface NotificationFiltersProps {
  /** Current type filter value */
  typeFilter: NotificationType | 'all';
  /** Callback when type filter changes */
  onTypeChange: (value: NotificationType | 'all') => void;

  /** Current priority filter value */
  priorityFilter: NotificationPriority | 'all';
  /** Callback when priority filter changes */
  onPriorityChange: (value: NotificationPriority | 'all') => void;

  /** Current status filter value */
  statusFilter: 'all' | 'read' | 'unread';
  /** Callback when status filter changes */
  onStatusChange: (value: 'all' | 'read' | 'unread') => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Filter controls for notifications full page
 * Includes type, priority, and read/unread status filters
 */
export function NotificationFilters({
  typeFilter,
  onTypeChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Type Filter */}
      <Select
        value={typeFilter}
        onValueChange={(value) => onTypeChange(value as NotificationType | 'all')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={priorityFilter}
        onValueChange={(value) => onPriorityChange(value as NotificationPriority | 'all')}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as 'all' | 'read' | 'unread')}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
