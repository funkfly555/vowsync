/**
 * Notification Helper Functions
 * @feature 018-notifications
 */

import { format } from 'date-fns';
import type { NotificationPriority, NotificationType } from '@/types/notification';
import { PRIORITY_BORDER_CONFIG, NOTIFICATION_TYPE_CONFIG } from '@/types/notification';

// =============================================================================
// Relative Timestamp Formatting
// =============================================================================

/**
 * Format a timestamp as a relative time string
 * - < 1 minute: "Just now"
 * - < 60 minutes: "Xm ago"
 * - < 24 hours: "Xh ago"
 * - < 7 days: "Xd ago"
 * - >= 7 days: "MMM d, yyyy"
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // For older items, use formatted date
  return format(then, 'MMM d, yyyy');
}

// =============================================================================
// Priority Styling
// =============================================================================

/**
 * Get the Tailwind CSS class for priority-based left border
 */
export function getPriorityBorderClass(priority: NotificationPriority): string {
  return PRIORITY_BORDER_CONFIG[priority] || PRIORITY_BORDER_CONFIG.normal;
}

/**
 * Get priority display label
 */
export function getPriorityLabel(priority: NotificationPriority): string {
  const labels: Record<NotificationPriority, string> = {
    urgent: 'Urgent',
    high: 'High',
    normal: 'Normal',
    low: 'Low',
  };
  return labels[priority] || 'Normal';
}

// =============================================================================
// Notification Type Helpers
// =============================================================================

/**
 * Get icon name for a notification type
 */
export function getNotificationIcon(type: NotificationType): string {
  return NOTIFICATION_TYPE_CONFIG[type]?.icon || 'Bell';
}

/**
 * Get color class for a notification type
 */
export function getNotificationIconColor(type: NotificationType): string {
  return NOTIFICATION_TYPE_CONFIG[type]?.color || 'text-gray-500';
}

/**
 * Get display label for a notification type
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  return NOTIFICATION_TYPE_CONFIG[type]?.label || 'Notification';
}

// =============================================================================
// Badge Formatting
// =============================================================================

/**
 * Format the unread count for display in the badge
 * - 0: returns null (hide badge)
 * - 1-99: returns the count as string
 * - > 99: returns "99+"
 */
export function formatBadgeCount(count: number): string | null {
  if (count <= 0) return null;
  if (count > 99) return '99+';
  return count.toString();
}

// =============================================================================
// Read/Unread Styling
// =============================================================================

/**
 * Get CSS classes for notification card based on read state
 */
export function getReadStateClasses(isRead: boolean): {
  container: string;
  title: string;
  message: string;
} {
  if (isRead) {
    return {
      container: 'bg-white opacity-60',
      title: 'font-normal text-gray-600',
      message: 'text-gray-500',
    };
  }
  return {
    container: 'bg-gray-50',
    title: 'font-semibold text-gray-900',
    message: 'text-gray-700',
  };
}
