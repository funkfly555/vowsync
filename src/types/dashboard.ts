// src/types/dashboard.ts
// Dashboard-specific types for wedding dashboard feature

import type { Wedding } from './wedding';
import type { Event } from './event';

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
}

/**
 * Guest statistics for RSVP progress display
 */
export interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number; // (confirmed + declined) / total * 100
}

/**
 * Activity log item from activity_log table
 */
export interface ActivityItem {
  id: string;
  actionType: string;
  entityType: string;
  description: string;
  createdAt: string;
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
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
