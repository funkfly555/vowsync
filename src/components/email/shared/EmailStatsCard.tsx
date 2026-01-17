/**
 * EmailStatsCard - Statistics card for email campaign metrics
 * @feature 016-email-campaigns
 * @task T006
 */

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { LucideIcon } from 'lucide-react';

interface EmailStatsCardProps {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'blue' | 'teal' | 'purple' | 'orange' | 'red' | 'gray';
  icon?: LucideIcon;
}

/**
 * Color mappings for stats cards
 */
const colorConfig: Record<
  EmailStatsCardProps['color'],
  { bg: string; text: string; progress: string }
> = {
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    progress: '[&>div]:bg-green-500',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    progress: '[&>div]:bg-blue-500',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    progress: '[&>div]:bg-teal-500',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    progress: '[&>div]:bg-purple-500',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    progress: '[&>div]:bg-orange-500',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    progress: '[&>div]:bg-red-500',
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    progress: '[&>div]:bg-gray-500',
  },
};

/**
 * Calculate percentage safely
 */
function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Email stats card component
 * Displays a metric with value, percentage, and progress bar
 *
 * Styling per design system:
 * - Background: color-50
 * - Border-radius: 8px
 * - Padding: 16px
 */
export function EmailStatsCard({
  label,
  value,
  total,
  color,
  icon: Icon,
}: EmailStatsCardProps) {
  const config = colorConfig[color];
  const percentage = calculatePercentage(value, total);

  return (
    <div
      className={cn(
        'rounded-lg p-4',
        config.bg,
        'border border-transparent'
      )}
      data-testid="email-stats-card"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {Icon && <Icon className={cn('h-4 w-4', config.text)} />}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={cn('text-2xl font-bold', config.text)}>
          {value.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500">
          / {total.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Progress
          value={percentage}
          className={cn('h-2 flex-1 bg-white/50', config.progress)}
        />
        <span className={cn('text-sm font-medium', config.text)}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
