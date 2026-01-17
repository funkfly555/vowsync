/**
 * NotificationsPage - Full page notifications view with filtering and pagination
 * @feature 018-notifications
 * @task T019, T020
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationMutations } from '@/hooks/useNotificationMutations';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { CreateSampleNotifications } from '@/components/notifications/CreateSampleNotifications';
import type { NotificationRow, NotificationType, NotificationPriority } from '@/types/notification';
import { toast } from 'sonner';

// =============================================================================
// Constants
// =============================================================================

const PAGE_SIZE = 20;

// =============================================================================
// Component
// =============================================================================

export function NotificationsPage() {
  const navigate = useNavigate();

  // Filter state
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  // Fetch notifications with filters and pagination
  const { notifications, totalCount, isLoading, error } = useNotifications({
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
    typeFilter,
    priorityFilter,
    statusFilter,
  });

  // Mutations
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationMutations();

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startItem = totalCount > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  // Handle filter changes - reset to page 1
  const handleTypeChange = (value: NotificationType | 'all') => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handlePriorityChange = (value: NotificationPriority | 'all') => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: 'all' | 'read' | 'unread') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = (notification: NotificationRow) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    // Navigate to action_url if provided
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  // Handle delete click - show confirmation
  const handleDeleteClick = (id: string) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;

    try {
      await deleteNotification.mutateAsync(notificationToDelete);
      toast.success('Notification deleted');
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
    toast.success('All notifications marked as read');
  };

  // Generate page numbers for pagination
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Check if any unread notifications exist
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <div className="flex items-center gap-2">
          {/* Dev-only sample notifications button */}
          {import.meta.env.DEV && <CreateSampleNotifications />}

          {/* Mark All Read button */}
          {hasUnread && (
            <Button
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markAllAsRead.isPending}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <NotificationFilters
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        priorityFilter={priorityFilter}
        onPriorityChange={handlePriorityChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
      />

      {/* Results count */}
      {!isLoading && !error && totalCount > 0 && (
        <p className="text-sm text-gray-500">
          Showing {startItem}-{endItem} of {totalCount} notifications
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 bg-white animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading notifications. Please try again.</p>
        </div>
      )}

      {/* Notifications list */}
      {!isLoading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              <NotificationCard
                notification={notification}
                onClick={handleNotificationClick}
                onDelete={handleDeleteClick}
                showDelete
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Bell className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
          <p className="text-sm text-gray-500">
            {typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
              ? 'No notifications match your current filters.'
              : "You're all caught up!"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(page)}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
                className={cn(
                  'h-9 w-9',
                  currentPage === page &&
                    'bg-[#D4A5A5] border-[#D4A5A5] text-white hover:bg-[#C99494] hover:border-[#C99494]'
                )}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteNotification.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
