/**
 * QuickStatsRow - Display 4 stat pills with circular pastel icons
 * Shows Guests count, Events count, Budget percentage, and Vendors count
 * Icons match sidebar navigation exactly (Users, Calendar, PiggyBank, Briefcase)
 * @feature 022-dashboard-visual-metrics
 * @task T002, T012, T015-T019
 */

import { Users, Calendar, PiggyBank, Handshake, LucideIcon } from 'lucide-react';

// Pastel color constants for Quick Stats icons
const STAT_COLORS = {
  guests: { bg: '#A8B8A6', icon: '#FFFFFF' },      // Soft sage green, white icon
  events: { bg: '#D4E5F7', icon: '#2196F3' },      // Soft blue, blue icon
  budget: { bg: '#D4A5A5', icon: '#FFFFFF' },      // Soft dusty rose, white icon
  vendors: { bg: '#E5D4EF', icon: '#9C27B0' },     // Soft purple, purple icon
} as const;

interface QuickStatsRowProps {
  guestCount: number;
  eventCount: number;
  budgetPercentage: number;
  vendorCount: number;
  isLoading?: boolean;
}

interface StatPillProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  colors: { bg: string; icon: string };
}

/**
 * StatPill - Individual stat pill with pastel icon container (56px circle)
 * Icons match sidebar navigation exactly
 * @task T015
 */
function StatPill({ icon: Icon, value, label, colors }: StatPillProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-4 flex items-center gap-4">
      {/* Pastel icon container - 56px circle */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: colors.bg }}
      >
        <Icon className="w-7 h-7" style={{ color: colors.icon }} strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        {/* Value: 32px bold (T019) */}
        <span className="text-[32px] font-bold leading-tight text-gray-900">
          {value}
        </span>
        {/* Label: 14px gray-600 (T019) */}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for stat pills (T018)
 */
function StatPillSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-4 flex items-center gap-4 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex flex-col gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/**
 * QuickStatsRow - Row of 4 stat pills with responsive grid (T017)
 * Desktop: 4 columns, Mobile: 2 columns
 */
export function QuickStatsRow({
  guestCount,
  eventCount,
  budgetPercentage,
  vendorCount,
  isLoading = false,
}: QuickStatsRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPillSkeleton />
        <StatPillSkeleton />
        <StatPillSkeleton />
        <StatPillSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatPill
        icon={Users}
        value={guestCount}
        label="Guests"
        colors={STAT_COLORS.guests}
      />
      <StatPill
        icon={Calendar}
        value={eventCount}
        label="Events"
        colors={STAT_COLORS.events}
      />
      <StatPill
        icon={PiggyBank}
        value={`${Math.round(budgetPercentage)}%`}
        label="Budget"
        colors={STAT_COLORS.budget}
      />
      <StatPill
        icon={Handshake}
        value={vendorCount}
        label="Vendors"
        colors={STAT_COLORS.vendors}
      />
    </div>
  );
}
