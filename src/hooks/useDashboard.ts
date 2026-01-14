import { useWedding } from './useWeddings';
import { useEvents } from './useEvents';
import { useGuestStats } from './useGuestStats';
import { useRecentActivity } from './useRecentActivity';
import { calculateDaysUntil } from '@/lib/utils';
import type { DashboardMetrics, DashboardData } from '@/types/dashboard';

/**
 * Orchestrator hook that combines all dashboard data queries
 * Runs queries in parallel using TanStack Query for optimal performance
 */
export function useDashboard(weddingId: string): DashboardData {
  // Fetch all data in parallel
  const weddingQuery = useWedding(weddingId);
  const eventsQuery = useEvents(weddingId);
  const guestStatsQuery = useGuestStats(weddingId);
  const activityQuery = useRecentActivity(weddingId, 5);

  // Calculate derived metrics from wedding data
  const metrics: DashboardMetrics | null = weddingQuery.data
    ? calculateMetrics(weddingQuery.data, eventsQuery.data?.length ?? 0, guestStatsQuery.data)
    : null;

  // Aggregate loading and error states
  const isLoading =
    weddingQuery.isLoading ||
    eventsQuery.isLoading ||
    guestStatsQuery.isLoading ||
    activityQuery.isLoading;

  const isError =
    weddingQuery.isError ||
    eventsQuery.isError ||
    guestStatsQuery.isError ||
    activityQuery.isError;

  const error =
    weddingQuery.error ||
    eventsQuery.error ||
    guestStatsQuery.error ||
    activityQuery.error;

  // Refetch function to refresh all data
  const refetch = () => {
    weddingQuery.refetch();
    eventsQuery.refetch();
    guestStatsQuery.refetch();
    activityQuery.refetch();
  };

  return {
    wedding: weddingQuery.data ?? null,
    metrics,
    events: eventsQuery.data ?? [],
    guestStats: guestStatsQuery.data ?? null,
    recentActivity: activityQuery.data ?? [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Calculate dashboard metrics from wedding and related data
 */
function calculateMetrics(
  wedding: { wedding_date: string; budget_total: number; budget_actual: number },
  eventCount: number,
  guestStats: { total: number; confirmed: number } | null | undefined
): DashboardMetrics {
  const daysUntilWedding = calculateDaysUntil(wedding.wedding_date);

  return {
    daysUntilWedding,
    isWeddingPast: daysUntilWedding < 0,
    isWeddingToday: daysUntilWedding === 0,
    totalGuests: guestStats?.total ?? 0,
    confirmedGuests: guestStats?.confirmed ?? 0,
    eventCount,
    budgetSpent: wedding.budget_actual ?? 0,
    budgetTotal: wedding.budget_total ?? 0,
    budgetPercentage:
      wedding.budget_total > 0
        ? Math.round((wedding.budget_actual / wedding.budget_total) * 100)
        : 0,
  };
}
