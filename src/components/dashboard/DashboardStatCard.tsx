import { cn } from '@/lib/utils';

interface DashboardStatCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  subtitle?: string;
  progressValue?: number;
  className?: string;
}

/**
 * Get progress bar color based on budget percentage
 * Matches Budget page colors exactly
 */
function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-red-500';    // #F44336
  if (percentage >= 90) return 'bg-orange-500';  // #FF9800
  if (percentage >= 70) return 'bg-yellow-500';  // #FF9800
  return 'bg-green-500';                          // #4CAF50
}

/**
 * Stat card component with exact styling per spec:
 * - Background: white (#FFFFFF)
 * - Border-radius: 8px
 * - Box-shadow: 0 2px 8px rgba(0,0,0,0.08)
 * - Padding: 24px
 * - Border: 1px solid #E8E8E8
 */
export function DashboardStatCard({
  title,
  icon,
  children,
  subtitle,
  progressValue,
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg p-6',
        'border border-[#E8E8E8]',
        'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
        className
      )}
      data-testid="dashboard-stat-card"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-1 text-sm text-gray-700">
        {children}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
      {typeof progressValue === 'number' && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className={cn('h-2 rounded-full transition-all', getProgressColor(progressValue))}
            style={{ width: `${Math.min(progressValue, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
