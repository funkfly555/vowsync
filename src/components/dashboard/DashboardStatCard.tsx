import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface DashboardStatCardProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
  subtitle?: string;
  progressValue?: number;
  className?: string;
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
  emoji,
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
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        {emoji} {title}
      </h3>
      <div className="space-y-1 text-sm text-gray-700">
        {children}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
      {typeof progressValue === 'number' && (
        <Progress value={progressValue} className="mt-3 h-2" />
      )}
    </div>
  );
}
