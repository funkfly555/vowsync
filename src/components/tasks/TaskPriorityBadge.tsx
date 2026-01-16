/**
 * TaskPriorityBadge Component
 * @feature 015-task-management-kanban
 * @task T008
 */

import { cn } from '@/lib/utils';
import { TaskPriority } from '@/types/task';
import { PRIORITY_COLORS } from '@/lib/taskUtils';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Color-coded priority badge component
 * Displays priority level with appropriate background color
 */
export function TaskPriorityBadge({
  priority,
  size = 'sm',
  className,
}: TaskPriorityBadgeProps) {
  const config = PRIORITY_COLORS[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded',
        config.bg,
        config.text,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        className
      )}
    >
      {config.label}
    </span>
  );
}
