/**
 * TaskCard Component
 * @feature 015-task-management-kanban
 * @task T016, T023
 *
 * Draggable card for Kanban board with quick status actions
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { TaskWithVendor } from '@/types/task';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskTypeBadge } from './TaskTypeBadge';
import {
  formatDaysRelativeToWedding,
  getDueSoonStatus,
  DUE_SOON_COLORS,
} from '@/lib/taskUtils';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
  Building2,
  Calendar,
  Play,
  Check,
  Ban,
} from 'lucide-react';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface TaskCardProps {
  task: TaskWithVendor;
  weddingId?: string;
  weddingDate?: string;
  onEdit?: (task: TaskWithVendor) => void;
  onDelete?: (task: TaskWithVendor) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, weddingId, weddingDate, onEdit, onDelete, isDragging }: TaskCardProps) {
  const { updateTaskStatus } = useTaskMutations({ weddingId: weddingId || '', weddingDate });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: task.id,
    data: { task },
    disabled: task.status === 'completed' || task.status === 'cancelled',
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  // Check for due soon status
  const dueSoonStatus = getDueSoonStatus(task);

  // Status action handlers
  const handleStart = () => {
    updateTaskStatus.mutate({ id: task.id, status: 'in_progress' });
  };

  const handleComplete = () => {
    updateTaskStatus.mutate({ id: task.id, status: 'completed' });
  };

  const handleCancel = () => {
    updateTaskStatus.mutate({ id: task.id, status: 'cancelled' });
  };

  // Format due date
  const formattedDueDate = format(new Date(task.due_date), 'MMM d');
  const relativeDays = task.is_pre_wedding !== null && task.days_before_after_wedding !== null
    ? formatDaysRelativeToWedding(task.is_pre_wedding, task.days_before_after_wedding)
    : null;

  // Check if task can be dragged
  const canDrag = task.status !== 'completed' && task.status !== 'cancelled';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border p-3 shadow-sm transition-shadow',
        'hover:shadow-md',
        canDrag && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg',
        task.is_overdue && 'border-red-300 bg-red-50/50'
      )}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
    >
      {/* Header: Priority + Type + Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <TaskPriorityBadge priority={task.priority} />
          <TaskTypeBadge taskType={task.task_type} showLabel={false} />
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(task)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {/* Quick Status Actions */}
            {task.status === 'pending' && (
              <DropdownMenuItem onClick={handleStart}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </DropdownMenuItem>
            )}
            {(task.status === 'pending' || task.status === 'in_progress') && (
              <>
                <DropdownMenuItem onClick={handleComplete}>
                  <Check className="h-4 w-4 mr-2" />
                  Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCancel}>
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete?.(task)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
        {task.title}
      </h4>

      {/* Due Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
        <Calendar className="h-3 w-3" />
        <span>{formattedDueDate}</span>
        {relativeDays && (
          <span className="text-gray-400">({relativeDays})</span>
        )}
      </div>

      {/* Due Soon / Urgent Badge */}
      {dueSoonStatus && (
        <div className="mb-2">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
              DUE_SOON_COLORS[dueSoonStatus].bg,
              DUE_SOON_COLORS[dueSoonStatus].text
            )}
          >
            {DUE_SOON_COLORS[dueSoonStatus].label}
          </span>
        </div>
      )}

      {/* Footer: Assignee + Vendor */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {task.assigned_to && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{task.assigned_to}</span>
          </div>
        )}
        {task.vendor && (
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{task.vendor.company_name}</span>
          </div>
        )}
        {!task.assigned_to && !task.vendor && (
          <span className="text-gray-400 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
}
