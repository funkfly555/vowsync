/**
 * NotificationDropdown Component - Dropdown panel showing recent notifications
 * @feature 018-notifications
 * @task T010 (placeholder for T007 dependency)
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationMutations } from '@/hooks/useNotificationMutations';
import { NotificationCard } from './NotificationCard';
import type { NotificationRow } from '@/types/notification';

// =============================================================================
// Props Interface
// =============================================================================

interface NotificationDropdownProps {
  /** Callback when dropdown should close */
  onClose: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Dropdown panel showing recent notifications
 * Displays up to 10 most recent notifications with actions
 */
export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { weddingId } = useParams<{ weddingId: string }>();
  const { notifications, isLoading } = useNotifications({ limit: 10 });
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = (notification: NotificationRow) => {
    // Mark as read if not already
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  // Handle "Mark All Read" click
  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  // Handle "View All" click
  const handleViewAll = () => {
    if (weddingId) {
      navigate(`/weddings/${weddingId}/notifications`);
    }
    onClose();
  };

  // Check if there are any unread notifications
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#D4A5A5] hover:text-[#C49494] hover:bg-gray-50"
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="max-h-[400px]">
        {isLoading ? (
          // Loading state
          <div className="p-4 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          // Notification cards
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <Button
          variant="ghost"
          className="w-full text-sm text-[#D4A5A5] hover:text-[#C49494] hover:bg-gray-100"
          onClick={handleViewAll}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );
}
