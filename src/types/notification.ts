/**
 * Notification TypeScript Types
 * @feature 018-notifications
 */

// =============================================================================
// Notification Type Enumerations
// =============================================================================

/**
 * Notification type enumeration
 * Maps to notification_type column in database
 */
export type NotificationType =
  | 'payment_due'
  | 'payment_overdue'
  | 'task_due'
  | 'task_overdue'
  | 'rsvp_deadline'
  | 'rsvp_overdue'
  | 'vendor_update'
  | 'budget_warning';

/**
 * Notification priority enumeration
 * Maps to priority column in database
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Entity type enumeration for linking notifications to related entities
 */
export type EntityType = 'vendor' | 'guest' | 'task' | 'payment' | 'budget_category';

// =============================================================================
// Database Entity Types (snake_case - CRITICAL)
// =============================================================================

/**
 * Notification entity as stored in Supabase
 * CRITICAL: Use snake_case field names in all queries
 */
export interface NotificationRow {
  id: string;
  user_id: string;
  wedding_id: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type: EntityType | null;
  entity_id: string | null;
  action_url: string | null;
  action_label: string | null;
  priority: NotificationPriority;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Insert/Update Types
// =============================================================================

/**
 * Type for creating a new notification
 */
export interface NotificationInsert {
  user_id: string;
  wedding_id?: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type?: EntityType | null;
  entity_id?: string | null;
  action_url?: string | null;
  action_label?: string | null;
  priority?: NotificationPriority;
  is_read?: boolean;
}

/**
 * Type for updating a notification (mark as read)
 */
export interface NotificationUpdate {
  is_read?: boolean;
  read_at?: string | null;
}

// =============================================================================
// Filter Types
// =============================================================================

/**
 * Filter options for notifications list
 */
export interface NotificationFilters {
  typeFilter: NotificationType | 'all';
  priorityFilter: NotificationPriority | 'all';
  statusFilter: 'all' | 'read' | 'unread';
}

/**
 * Default filter values
 */
export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
  typeFilter: 'all',
  priorityFilter: 'all',
  statusFilter: 'all',
};

// =============================================================================
// Display Configuration
// =============================================================================

/**
 * Icon and color mapping for notification types
 */
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: string; color: string }
> = {
  payment_due: {
    label: 'Payment Due',
    icon: 'DollarSign',
    color: 'text-red-500',
  },
  payment_overdue: {
    label: 'Payment Overdue',
    icon: 'DollarSign',
    color: 'text-red-600',
  },
  task_due: {
    label: 'Task Due',
    icon: 'CheckSquare',
    color: 'text-orange-500',
  },
  task_overdue: {
    label: 'Task Overdue',
    icon: 'CheckSquare',
    color: 'text-orange-600',
  },
  rsvp_deadline: {
    label: 'RSVP Deadline',
    icon: 'Users',
    color: 'text-blue-500',
  },
  rsvp_overdue: {
    label: 'RSVP Overdue',
    icon: 'Users',
    color: 'text-blue-600',
  },
  vendor_update: {
    label: 'Vendor Update',
    icon: 'Briefcase',
    color: 'text-yellow-500',
  },
  budget_warning: {
    label: 'Budget Warning',
    icon: 'AlertTriangle',
    color: 'text-red-600',
  },
};

/**
 * Priority border color configuration
 */
export const PRIORITY_BORDER_CONFIG: Record<NotificationPriority, string> = {
  urgent: 'border-l-4 border-l-red-500',
  high: 'border-l-4 border-l-orange-500',
  normal: 'border-l-4 border-l-blue-500',
  low: 'border-l-4 border-l-gray-400',
};

/**
 * Priority label configuration
 */
export const PRIORITY_LABEL_CONFIG: Record<
  NotificationPriority,
  { label: string; color: string; bgColor: string }
> = {
  urgent: {
    label: 'Urgent',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  high: {
    label: 'High',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  normal: {
    label: 'Normal',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  low: {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

/**
 * Type filter options for dropdown
 */
export const TYPE_FILTER_OPTIONS: Array<{ value: NotificationType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'payment_due', label: 'Payment Due' },
  { value: 'payment_overdue', label: 'Payment Overdue' },
  { value: 'task_due', label: 'Task Due' },
  { value: 'task_overdue', label: 'Task Overdue' },
  { value: 'rsvp_deadline', label: 'RSVP Deadline' },
  { value: 'rsvp_overdue', label: 'RSVP Overdue' },
  { value: 'vendor_update', label: 'Vendor Update' },
  { value: 'budget_warning', label: 'Budget Warning' },
];

/**
 * Priority filter options for dropdown
 */
export const PRIORITY_FILTER_OPTIONS: Array<{ value: NotificationPriority | 'all'; label: string }> = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

/**
 * Status filter options for dropdown
 */
export const STATUS_FILTER_OPTIONS: Array<{ value: 'all' | 'read' | 'unread'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];
