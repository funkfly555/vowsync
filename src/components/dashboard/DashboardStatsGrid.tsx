import { DashboardStatCard } from './DashboardStatCard';
import { formatDate, formatTime } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Users, PiggyBank, Calendar, FileText, Armchair, Wine } from 'lucide-react';
import type { DashboardMetrics, VendorStats, TaskStats, GuestStats } from '@/types/dashboard';
import type { Event } from '@/types/event';
import type { ItemsStats } from '@/hooks/useItemsStats';
import type { BarOrdersStats } from '@/hooks/useBarOrdersStats';

/**
 * @feature 020-dashboard-settings-fix - Added vendorStats, taskStats, itemsStats, barOrdersStats, guestStats props
 */
interface DashboardStatsGridProps {
  metrics: DashboardMetrics | null;
  events: Event[];
  vendorStats: VendorStats | null;
  taskStats: TaskStats | null;
  itemsStats: ItemsStats | null;
  barOrdersStats: BarOrdersStats | null;
  guestStats: GuestStats | null;
  isLoading?: boolean;
}

/**
 * 3x2 grid of stat cards:
 * - Guest Count (row 1, left)
 * - Budget Summary (row 1, right)
 * - Events (row 2, left)
 * - Vendor Invoice Status (row 2, right)
 * - Items (row 3, left)
 * - Bar Orders (row 3, right)
 *
 * Responsive: 2 columns on desktop (≥1024px), 1 column on mobile
 * Gap: 24px between cards
 */
export function DashboardStatsGrid({ metrics, events, vendorStats, taskStats: _taskStats, itemsStats, barOrdersStats, guestStats, isLoading }: DashboardStatsGridProps) {
  // @feature 020-dashboard-settings-fix - Use currency context for formatting
  const { formatCurrency } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="stats-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[140px] bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  // Guest stats - now using real metrics from useGuestStats hook
  // @feature 020-dashboard-settings-fix - Added RSVP status
  const adultsCount = guestStats?.adults ?? metrics?.adultsCount ?? 0;
  const childrenCount = guestStats?.children ?? metrics?.childrenCount ?? 0;
  const totalGuests = guestStats?.total ?? metrics?.totalGuests ?? 0;
  const guestSubtitle = totalGuests === 0 ? 'No guests yet' : undefined;

  // RSVP Status counts - based on invitation_status only
  // All 4 statuses: pending (to be sent), invited (awaiting response), confirmed, declined
  const rsvpNotInvited = guestStats?.rsvpNotInvited ?? 0;
  const rsvpInvited = guestStats?.rsvpInvited ?? 0;
  const rsvpConfirmed = guestStats?.rsvpConfirmed ?? 0;
  const rsvpDeclined = guestStats?.rsvpDeclined ?? 0;

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
      {/* @feature 020-dashboard-settings-fix - Side-by-side layout with RSVP status */}
      <DashboardStatCard
        title="Guests"
        icon={<Users className="h-5 w-5 text-gray-500" />}
        subtitle={guestSubtitle}
      >
        <div className="flex items-start gap-6">
          {/* Left: Guest Count */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Guest Count</h4>
            <div className="space-y-1.5">
              <p className="text-sm">Adults: {adultsCount}</p>
              <p className="text-sm">Children: {childrenCount}</p>
              <p className="text-sm font-semibold">Total: {totalGuests}</p>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="h-20 w-px bg-gray-200"></div>

          {/* Right: RSVP Status - All 4 invitation statuses (To Be Sent, Invited, Confirmed, Declined) */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">RSVP Status</h4>
            <div className="space-y-1.5">
              <p className="text-sm text-gray-500">To Be Sent: {rsvpNotInvited}</p>
              <p className="text-sm text-blue-600">Invited: {rsvpInvited}</p>
              <p className="text-sm text-green-600">Confirmed: {rsvpConfirmed}</p>
              <p className="text-sm text-red-600">Declined: {rsvpDeclined}</p>
            </div>
          </div>
        </div>
      </DashboardStatCard>

      {/* Card 2 - Budget Summary (top right) */}
      {/* @feature 020-dashboard-settings-fix - Using currency context for formatting */}
      <DashboardStatCard
        title="Budget Summary"
        icon={<PiggyBank className="h-5 w-5 text-gray-500" />}
        subtitle={budgetSubtitle}
        progressValue={budgetPercentage}
      >
        <p>Budget: {budgetTotal > 0 ? formatCurrency(budgetTotal) : 'Not set'}</p>
        <p>Spent: {formatCurrency(budgetSpent)}</p>
        <p>Remaining: {formatCurrency(budgetRemaining)}</p>
      </DashboardStatCard>

      {/* Card 3 - Events (bottom left) */}
      <DashboardStatCard
        title="Events"
        icon={<Calendar className="h-5 w-5 text-gray-500" />}
        subtitle={`${eventCount === 1 ? 'event' : 'events'} planned`}
      >
        <p>Total Events: {eventCount}</p>
        <p className="text-xs text-gray-500 mt-2">{nextEventDisplay}</p>
      </DashboardStatCard>

      {/* Card 4 - Vendor Invoice Status (row 2, right) */}
      {/* @feature 020-dashboard-settings-fix - Using real vendor invoice stats */}
      <DashboardStatCard
        title="Vendor Invoice Status"
        icon={<FileText className="h-5 w-5 text-gray-500" />}
        subtitle={vendorStats?.total === 0 ? 'No vendors yet' : undefined}
      >
        {(vendorStats?.overdue?.count ?? 0) > 0 && (
          <p className="text-red-600 font-medium">
            {vendorStats?.overdue?.count} Overdue Invoice{vendorStats?.overdue?.count !== 1 ? 's' : ''}, total: {formatCurrency(vendorStats?.overdue?.totalAmount ?? 0)}
          </p>
        )}
        {(vendorStats?.unpaid?.count ?? 0) > 0 && (
          <p>
            {vendorStats?.unpaid?.count} Unpaid Invoice{vendorStats?.unpaid?.count !== 1 ? 's' : ''}, total: {formatCurrency(vendorStats?.unpaid?.totalAmount ?? 0)}
          </p>
        )}
        {(vendorStats?.partiallyPaid?.count ?? 0) > 0 && (
          <p className="text-yellow-600">
            {vendorStats?.partiallyPaid?.count} Partially Paid Invoice{vendorStats?.partiallyPaid?.count !== 1 ? 's' : ''}, total: {formatCurrency(vendorStats?.partiallyPaid?.totalAmount ?? 0)}
          </p>
        )}
        {(vendorStats?.paid?.count ?? 0) > 0 && (
          <p className="text-green-600">
            {vendorStats?.paid?.count} Paid Invoice{vendorStats?.paid?.count !== 1 ? 's' : ''}, total: {formatCurrency(vendorStats?.paid?.totalAmount ?? 0)}
          </p>
        )}
        {(vendorStats?.overdue?.count ?? 0) === 0 &&
         (vendorStats?.unpaid?.count ?? 0) === 0 &&
         (vendorStats?.partiallyPaid?.count ?? 0) === 0 &&
         (vendorStats?.paid?.count ?? 0) === 0 && (
          <p className="text-gray-500">No invoices yet</p>
        )}
      </DashboardStatCard>

      {/* Card 5 - Items (row 3, left) */}
      {/* @feature 020-dashboard-settings-fix - Items statistics */}
      <DashboardStatCard
        title="Items"
        icon={<Armchair className="h-5 w-5 text-gray-500" />}
        subtitle={itemsStats?.total === 0 ? 'No items yet' : undefined}
      >
        <p>Total Items: {itemsStats?.total ?? 0}</p>
        {(itemsStats?.shortage ?? 0) > 0 && (
          <p className="text-red-600 font-medium">Items Short: {itemsStats?.shortage}</p>
        )}
        {(itemsStats?.shortage ?? 0) === 0 && (
          <p className="text-green-600">Items Short: 0</p>
        )}
        <p>Total Cost: {formatCurrency(itemsStats?.totalCost ?? 0)}</p>
      </DashboardStatCard>

      {/* Card 6 - Bar Orders (row 3, right) */}
      {/* @feature 020-dashboard-settings-fix - Bar orders statistics */}
      <DashboardStatCard
        title="Bar Orders"
        icon={<Wine className="h-5 w-5 text-gray-500" />}
        subtitle={barOrdersStats?.total === 0 ? 'No bar orders yet' : undefined}
      >
        <p>Total Orders: {barOrdersStats?.total ?? 0}</p>
        {(barOrdersStats?.draft ?? 0) > 0 && (
          <p className="text-yellow-600">Draft: {barOrdersStats?.draft}</p>
        )}
        {(barOrdersStats?.confirmed ?? 0) > 0 && (
          <p className="text-blue-600">Confirmed: {barOrdersStats?.confirmed}</p>
        )}
        {(barOrdersStats?.delivered ?? 0) > 0 && (
          <p className="text-green-600">Delivered: {barOrdersStats?.delivered}</p>
        )}
        {(barOrdersStats?.total ?? 0) === 0 && (
          <p className="text-gray-500">No orders yet</p>
        )}
      </DashboardStatCard>
    </div>
  );
}
