/**
 * useNotificationMutations Hook - Mutations for notifications
 * @feature 018-notifications
 * @task T005
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// =============================================================================
// Hook Return Type
// =============================================================================

interface UseNotificationMutationsReturn {
  markAsRead: ReturnType<typeof useMutation<void, Error, string>>;
  markAllAsRead: ReturnType<typeof useMutation<void, Error, void>>;
  deleteNotification: ReturnType<typeof useMutation<void, Error, string>>;
  createSampleNotifications: ReturnType<typeof useMutation<void, Error, string | null>>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook providing mutations for notification operations
 */
export function useNotificationMutations(): UseNotificationMutationsReturn {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Mark a single notification as read
   */
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      // CRITICAL: Use snake_case field names
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,                           // snake_case
          read_at: new Date().toISOString(),       // snake_case
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
  });

  /**
   * Mark all unread notifications as read for current user
   */
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // CRITICAL: Use snake_case field names
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,                           // snake_case
          read_at: new Date().toISOString(),       // snake_case
        })
        .eq('user_id', user.id)                    // snake_case
        .eq('is_read', false);                     // snake_case

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
    },
  });

  /**
   * Delete a notification
   */
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    },
  });

  /**
   * Create sample notifications (development only)
   */
  const createSampleNotifications = useMutation({
    mutationFn: async (weddingId: string | null) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Build base path for action URLs - MUST include wedding ID for valid routing
      const basePath = weddingId ? `/weddings/${weddingId}` : '';

      // CRITICAL: Use snake_case field names
      const sampleNotifications = [
        {
          user_id: user.id,                        // snake_case
          wedding_id: weddingId,                   // snake_case
          notification_type: 'payment_due',        // snake_case
          title: 'Payment Due Soon',
          message: 'Caterer - Second payment ($5,000) due in 7 days',
          entity_type: 'vendor',                   // snake_case
          action_url: `${basePath}/vendors`,       // snake_case - FULL PATH
          action_label: 'View Vendors',            // snake_case
          priority: 'normal',
          is_read: false,                          // snake_case
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'task_overdue',
          title: 'Task Overdue',
          message: 'Confirm floral delivery is overdue',
          entity_type: 'task',
          action_url: `${basePath}/tasks`,         // FULL PATH
          action_label: 'View Tasks',
          priority: 'urgent',
          is_read: false,
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'rsvp_deadline',
          title: 'RSVP Deadline Today',
          message: "15 guests haven't responded yet",
          entity_type: 'guest',
          action_url: `${basePath}/guests`,        // FULL PATH
          action_label: 'View Guests',
          priority: 'high',
          is_read: false,
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'vendor_update',
          title: 'Contract Expiring Soon',
          message: 'Photographer contract expires in 25 days',
          entity_type: 'vendor',
          action_url: `${basePath}/vendors`,       // FULL PATH
          action_label: 'View Vendors',
          priority: 'normal',
          is_read: true,
        },
        {
          user_id: user.id,
          wedding_id: weddingId,
          notification_type: 'budget_warning',
          title: 'Budget Exceeded',
          message: 'Flowers category is over budget by $800',
          entity_type: 'budget_category',
          action_url: `${basePath}/budget`,        // FULL PATH
          action_label: 'View Budget',
          priority: 'high',
          is_read: false,
        },
      ];

      const { error } = await supabase
        .from('notifications')
        .insert(sampleNotifications);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Sample notifications created!');
    },
    onError: (error) => {
      console.error('Error creating sample notifications:', error);
      toast.error('Failed to create sample notifications');
    },
  });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createSampleNotifications,
  };
}
