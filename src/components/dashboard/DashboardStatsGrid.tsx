import { DashboardStatCard } from './DashboardStatCard';
import { formatDate, formatTime } from '@/lib/utils';
import type { DashboardMetrics } from '@/types/dashboard';
import type { Event } from '@/types/event';

interface DashboardStatsGridProps {
  metrics: DashboardMetrics | null;
  events: Event[];
  isLoading?: boolean;
}

/**
 * 2x2 grid of stat cards:
 * - Guest Count (top left)
 * - Budget Summary (top right)
 * - Events (bottom left)
 * - Vendors (bottom right)
 *
 * Responsive: 2 columns on desktop (≥1024px), 1 column on mobile
 * Gap: 24px between cards
 */
export function DashboardStatsGrid({ metrics, events, isLoading }: DashboardStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[140px] bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  // Guest stats
  const adultsCount = 0; // Will be populated from guest data later
  const childrenCount = 0;
  const totalGuests = metrics?.totalGuests ?? 0;
  const guestSubtitle = totalGuests === 0 ? 'No guests yet' : `${totalGuests} total guests`;

  // Budget stats
  const budgetTotal = metrics?.budgetTotal ?? 0;
  const budgetSpent = metrics?.budgetSpent ?? 0;
  const budgetRemaining = Math.max(0, budgetTotal - budgetSpent);
  const budgetPercentage = metrics?.budgetPercentage ?? 0;
  const budgetSubtitle = budgetTotal <= 0 ? 'Budget not configured' : undefined;

  // Events stats
  const eventCount = events.length;
  const nextEvent = events.length > 0 ? events[0] : null;
  const nextEventDisplay = nextEvent
    ? `Next Event: ${nextEvent.event_name} - ${formatDate(nextEvent.event_date, 'EEE, MMM d, yyyy')} at ${formatTime(nextEvent.event_start_time)}`
    : 'No upcoming events';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="stats-grid">
      {/* Card 1 - Guest Count (top left) */}
      <DashboardStatCard
        title="Guest Count"
        emoji="👥"
        subtitle={guestSubtitle}
      >
        <p>Adults: {adultsCount}</p>
        <p>Children: {childrenCount}</p>
        <p>Total: {totalGuests}</p>
      </DashboardStatCard>

      {/* Card 2 - Budget Summary (top right) */}
      <DashboardStatCard
        title="Budget Summary"
        emoji="💰"
        subtitle={budgetSubtitle}
        progressValue={budgetPercentage}
      >
        <p>Budget: {budgetTotal > 0 ? `$${budgetTotal.toLocaleString()}` : 'Not set'}</p>
        <p>Spent: ${budgetSpent.toLocaleString()}</p>
        <p>Remaining: ${budgetRemaining.toLocaleString()}</p>
      </DashboardStatCard>

      {/* Card 3 - Events (bottom left) */}
      <DashboardStatCard
        title="Events"
        emoji="📅"
        subtitle={`${eventCount === 1 ? 'event' : 'events'} planned`}
      >
        <p>Total Events: {eventCount}</p>
        <p className="text-xs text-gray-500 mt-2">{nextEventDisplay}</p>
      </DashboardStatCard>

      {/* Card 4 - Vendors (bottom right) */}
      <DashboardStatCard
        title="Vendors"
        emoji="🤝"
      >
        <p>Total: 0</p>
        <p>Pending Payments: 0</p>
      </DashboardStatCard>
    </div>
  );
}
