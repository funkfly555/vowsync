/**
 * TaskStatusBadge Component
 * @feature 015-task-management-kanban
 * @task T015
 */

import { cn } from '@/lib/utils';
import { TaskDisplayStatus } from '@/types/task';
import { STATUS_COLORS } from '@/lib/taskUtils';
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TaskDisplayStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const StatusIcons = {
  pending: Clock,
  in_progress: Play,
  completed: CheckCircle2,
  cancelled: XCircle,
  overdue: AlertCircle,
} as const;

/**
 * Status badge with icon and color
 * Uses computed display_status which includes 'overdue'
 */
export function TaskStatusBadge({
  status,
  showIcon = true,
  size = 'sm',
  className,
}: TaskStatusBadgeProps) {
  const config = STATUS_COLORS[status];
  const IconComponent = StatusIcons[status];
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded',
        config.bg,
        config.text,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        className
      )}
    >
      {showIcon && <IconComponent size={iconSize} className="shrink-0" />}
      {config.label}
    </span>
  );
}
