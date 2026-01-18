import { useWedding } from './useWeddings';
import { useEvents } from './useEvents';
import { useGuestStats } from './useGuestStats';
import { useRecentActivity } from './useRecentActivity';
import { useVendorStats } from './useVendorStats';
import { useTaskStats } from './useTaskStats';
import { useItemsStats } from './useItemsStats';
import { useBarOrdersStats } from './useBarOrdersStats';
import { calculateDaysUntil } from '@/lib/utils';
import type { DashboardMetrics, DashboardData, GuestStats, VendorStats, TaskStats } from '@/types/dashboard';

/**
 * Orchestrator hook that combines all dashboard data queries
 * Runs queries in parallel using TanStack Query for optimal performance
 * @feature 020-dashboard-settings-fix - Added vendor and task stats
 */
export function useDashboard(weddingId: string): DashboardData {
  // Fetch all data in parallel
  const weddingQuery = useWedding(weddingId);
  const eventsQuery = useEvents(weddingId);
  const guestStatsQuery = useGuestStats(weddingId);
  const activityQuery = useRecentActivity(weddingId, 5);
  const vendorStatsQuery = useVendorStats(weddingId);
  const taskStatsQuery = useTaskStats(weddingId);
  const itemsStatsQuery = useItemsStats(weddingId);
  const barOrdersStatsQuery = useBarOrdersStats(weddingId);

  // Calculate derived metrics from wedding data
  const metrics: DashboardMetrics | null = weddingQuery.data
    ? calculateMetrics(
        weddingQuery.data,
        eventsQuery.data?.length ?? 0,
        guestStatsQuery.data,
        vendorStatsQuery.data,
        taskStatsQuery.data
      )
    : null;

  // Aggregate loading and error states
  const isLoading =
    weddingQuery.isLoading ||
    eventsQuery.isLoading ||
    guestStatsQuery.isLoading ||
    activityQuery.isLoading ||
    vendorStatsQuery.isLoading ||
    taskStatsQuery.isLoading ||
    itemsStatsQuery.isLoading ||
    barOrdersStatsQuery.isLoading;

  const isError =
    weddingQuery.isError ||
    eventsQuery.isError ||
    guestStatsQuery.isError ||
    activityQuery.isError ||
    vendorStatsQuery.isError ||
    taskStatsQuery.isError ||
    itemsStatsQuery.isError ||
    barOrdersStatsQuery.isError;

  const error =
    weddingQuery.error ||
    eventsQuery.error ||
    guestStatsQuery.error ||
    activityQuery.error ||
    vendorStatsQuery.error ||
    taskStatsQuery.error ||
    itemsStatsQuery.error ||
    barOrdersStatsQuery.error;

  // Refetch function to refresh all data
  const refetch = () => {
    weddingQuery.refetch();
    eventsQuery.refetch();
    guestStatsQuery.refetch();
    activityQuery.refetch();
    vendorStatsQuery.refetch();
    taskStatsQuery.refetch();
    itemsStatsQuery.refetch();
    barOrdersStatsQuery.refetch();
  };

  return {
    wedding: weddingQuery.data ?? null,
    metrics,
    events: eventsQuery.data ?? [],
    guestStats: guestStatsQuery.data ?? null,
    vendorStats: vendorStatsQuery.data ?? null,
    taskStats: taskStatsQuery.data ?? null,
    itemsStats: itemsStatsQuery.data ?? null,
    barOrdersStats: barOrdersStatsQuery.data ?? null,
    recentActivity: activityQuery.data ?? [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Calculate dashboard metrics from wedding and related data
 * @feature 020-dashboard-settings-fix - Added vendor and task counts
 */
function calculateMetrics(
  wedding: { wedding_date: string; budget_total: number; budget_actual: number },
  eventCount: number,
  guestStats: GuestStats | null | undefined,
  vendorStats: VendorStats | null | undefined,
  taskStats: TaskStats | null | undefined
): DashboardMetrics {
  const daysUntilWedding = calculateDaysUntil(wedding.wedding_date);

  return {
    daysUntilWedding,
    isWeddingPast: daysUntilWedding < 0,
    isWeddingToday: daysUntilWedding === 0,
    totalGuests: guestStats?.total ?? 0,
    confirmedGuests: guestStats?.confirmed ?? 0,
    adultsCount: guestStats?.adults ?? 0,
    childrenCount: guestStats?.children ?? 0,
    eventCount,
    budgetSpent: wedding.budget_actual ?? 0,
    budgetTotal: wedding.budget_total ?? 0,
    budgetPercentage:
      wedding.budget_total > 0
        ? Math.round((wedding.budget_actual / wedding.budget_total) * 100)
        : 0,
    vendorCount: vendorStats?.total ?? 0,
    pendingPaymentsCount: vendorStats?.pendingPayments ?? 0,
    upcomingTasksCount: taskStats?.upcoming ?? 0,
  };
}
