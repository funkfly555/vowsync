// src/types/dashboard.ts
// Dashboard-specific types for wedding dashboard feature

import type { Wedding } from './wedding';
import type { Event } from './event';
import type { ItemsStats } from '@/hooks/useItemsStats';
import type { BarOrdersStats } from '@/hooks/useBarOrdersStats';

/**
 * Dashboard metric data calculated from wedding and related tables
 */
export interface DashboardMetrics {
  daysUntilWedding: number;
  isWeddingPast: boolean;
  isWeddingToday: boolean;
  totalGuests: number;
  confirmedGuests: number;
  eventCount: number;
  budgetSpent: number;
  budgetTotal: number;
  budgetPercentage: number;
  adultsCount: number;         // @feature 020-dashboard-settings-fix
  childrenCount: number;       // @feature 020-dashboard-settings-fix
  vendorCount: number;         // @feature 020-dashboard-settings-fix
  pendingPaymentsCount: number; // @feature 020-dashboard-settings-fix
  upcomingTasksCount: number;  // @feature 020-dashboard-settings-fix
}

/**
 * Guest statistics for RSVP progress display
 * @feature 020-dashboard-settings-fix - All 4 invitation statuses counted
 */
export interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number; // (confirmed + declined) / total * 100
  adults: number;    // guest_type = 'adult' OR guest_type IS NULL
  children: number;  // guest_type = 'child'
  rsvpNotInvited: number; // invitation_status = 'pending' (to be sent)
  rsvpInvited: number;    // invitation_status = 'invited' (awaiting response)
  rsvpConfirmed: number;  // invitation_status = 'confirmed'
  rsvpDeclined: number;   // invitation_status = 'declined'
}

/**
 * Invoice statistics by status for dashboard display
 * @feature 020-dashboard-settings-fix
 */
export interface InvoiceStatusStats {
  count: number;
  totalAmount: number;
}

/**
 * Vendor invoice statistics for dashboard display
 * @feature 020-dashboard-settings-fix
 */
export interface VendorStats {
  total: number;           // Count of vendors for wedding
  pendingPayments: number; // Legacy field for backwards compatibility
  overdue: InvoiceStatusStats;        // Overdue invoices (including partially_paid if overdue)
  unpaid: InvoiceStatusStats;         // Unpaid invoices not yet overdue
  partiallyPaid: InvoiceStatusStats;  // Partially paid invoices not yet overdue
  paid: InvoiceStatusStats;           // Paid invoices
}

/**
 * Task summary for dashboard display
 * @feature 020-dashboard-settings-fix
 */
export interface TaskSummary {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
}

/**
 * Task statistics for dashboard display
 * @feature 020-dashboard-settings-fix
 */
export interface TaskStats {
  upcoming: number;           // Tasks due in next 7 days (not completed/cancelled)
  upcomingTasks: TaskSummary[]; // Top 3 upcoming tasks for display
}

/**
 * Activity item for dashboard display
 * @feature 020-dashboard-settings-fix - Updated to support activity_log with user info
 */
export interface ActivityItem {
  id: string;
  actionType: string;
  entityType: string;
  description: string;
  createdAt: string;
  userName?: string;
  userFullName?: string;
  userRole?: 'consultant' | 'admin' | 'viewer' | null;
  isRead?: boolean;
}

/**
 * Quick action button definition
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  href: string;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Dashboard data aggregate returned by useDashboard hook
 */
export interface DashboardData {
  wedding: Wedding | null;
  metrics: DashboardMetrics | null;
  events: Event[];
  guestStats: GuestStats | null;
  recentActivity: ActivityItem[];
  vendorStats: VendorStats | null;  // @feature 020-dashboard-settings-fix
  taskStats: TaskStats | null;      // @feature 020-dashboard-settings-fix
  itemsStats: ItemsStats | null;    // @feature 020-dashboard-settings-fix
  barOrdersStats: BarOrdersStats | null; // @feature 020-dashboard-settings-fix
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
