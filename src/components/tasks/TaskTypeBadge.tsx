/**
 * TaskTypeBadge Component
 * @feature 015-task-management-kanban
 * @task T009
 */

import { cn } from '@/lib/utils';
import { TaskType } from '@/types/task';
import { TASK_TYPE_ICONS } from '@/lib/taskUtils';
import {
  Package,
  Truck,
  CalendarClock,
  ClipboardList,
  Target,
} from 'lucide-react';

interface TaskTypeBadgeProps {
  taskType: TaskType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const IconComponents = {
  Package,
  Truck,
  CalendarClock,
  ClipboardList,
  Target,
} as const;

/**
 * Task type badge with icon and optional label
 * Uses Lucide icons matching semantic meaning
 */
export function TaskTypeBadge({
  taskType,
  showLabel = true,
  size = 'sm',
  className,
}: TaskTypeBadgeProps) {
  const config = TASK_TYPE_ICONS[taskType];
  const IconComponent = IconComponents[config.icon as keyof typeof IconComponents];

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-gray-600',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        className
      )}
    >
      <IconComponent size={iconSize} className="shrink-0" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

/**
 * Get the icon component for a task type (utility for other components)
 */
export function getTaskTypeIcon(taskType: TaskType) {
  const config = TASK_TYPE_ICONS[taskType];
  return IconComponents[config.icon as keyof typeof IconComponents];
}
