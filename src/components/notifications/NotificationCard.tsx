/**
 * NotificationCard Component - Individual notification display
 * @feature 018-notifications
 * @task T009 (placeholder for T007 dependency)
 */

import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationIcon } from './NotificationIcon';
import {
  formatRelativeTime,
  getPriorityBorderClass,
  getReadStateClasses,
} from '@/lib/notificationHelpers';
import type { NotificationRow } from '@/types/notification';

// =============================================================================
// Props Interface
// =============================================================================

interface NotificationCardProps {
  /** Notification data */
  notification: NotificationRow;

  /** Callback when card is clicked */
  onClick?: (notification: NotificationRow) => void;

  /** Callback when delete is clicked (full page only) */
  onDelete?: (id: string) => void;

  /** Whether to show delete button (full page only) */
  showDelete?: boolean;

  /** Optional class name for styling */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Individual notification card with icon, title, message, and timestamp
 * Supports click handling, delete functionality, and visual states for read/unread
 */
export function NotificationCard({
  notification,
  onClick,
  onDelete,
  showDelete = false,
  className,
}: NotificationCardProps) {
  const { is_read, notification_type, priority, title, message, action_label, created_at } =
    notification;

  // Get styling based on read state and priority
  const readStateClasses = getReadStateClasses(is_read);
  const priorityBorderClass = getPriorityBorderClass(priority);
  const relativeTime = formatRelativeTime(created_at);

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  // Handle delete click (stop propagation to prevent card click)
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-100',
        readStateClasses.container,
        priorityBorderClass,
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <NotificationIcon type={notification_type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className={cn('text-sm truncate', readStateClasses.title)}>{title}</p>

        {/* Message */}
        <p className={cn('text-sm mt-0.5 line-clamp-2', readStateClasses.message)}>
          {message}
        </p>

        {/* Footer: Timestamp + Action Label */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{relativeTime}</span>
          {action_label && (
            <>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-[#D4A5A5]">{action_label}</span>
            </>
          )}
        </div>
      </div>

      {/* Delete button (full page only) */}
      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
          onClick={handleDelete}
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
