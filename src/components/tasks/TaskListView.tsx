/**
 * TaskListView Component
 * @feature 015-task-management-kanban
 * @task T021
 *
 * Table view with sortable columns
 */

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskWithVendor, TaskFilters } from '@/types/task';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskTypeBadge } from './TaskTypeBadge';
import { TaskStatusBadge } from './TaskStatusBadge';
import {
  formatDaysRelativeToWedding,
  getDueSoonStatus,
  DUE_SOON_COLORS,
} from '@/lib/taskUtils';
import { format } from 'date-fns';
import { useTaskMutations } from '@/hooks/useTaskMutations';

type SortField = 'title' | 'task_type' | 'due_date' | 'priority' | 'status' | 'assigned_to';
type SortDirection = 'asc' | 'desc';

interface TaskListViewProps {
  tasks: TaskWithVendor[];
  filters: TaskFilters;
  weddingId: string;
  weddingDate?: string;
  onEditTask?: (task: TaskWithVendor) => void;
  onDeleteTask?: (task: TaskWithVendor) => void;
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export function TaskListView({
  tasks,
  filters,
  weddingId,
  weddingDate,
  onEditTask,
  onDeleteTask,
}: TaskListViewProps) {
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { updateTaskStatus } = useTaskMutations({ weddingId, weddingDate });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(search);
        const matchesDescription = task.description?.toLowerCase().includes(search);
        const matchesAssignee = task.assigned_to?.toLowerCase().includes(search);
        if (!matchesTitle && !matchesDescription && !matchesAssignee) {
          return false;
        }
      }

      // Status filter
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Type filter
      if (filters.task_type && task.task_type !== filters.task_type) {
        return false;
      }

      // Assignee filter
      if (filters.assigned_to && task.assigned_to !== filters.assigned_to) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'task_type':
          comparison = a.task_type.localeCompare(b.task_type);
          break;
        case 'due_date':
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'assigned_to':
          comparison = (a.assigned_to || '').localeCompare(b.assigned_to || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTasks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleQuickComplete = (task: TaskWithVendor) => {
    if (task.status !== 'completed') {
      updateTaskStatus.mutate({ id: task.id, status: 'completed' });
    }
  };

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 hover:bg-transparent"
        onClick={() => handleSort(field)}
      >
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    </TableHead>
  );

  if (sortedTasks.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        <p>No tasks match your filters.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <SortableHeader field="title" className="min-w-[200px]">
              Title
            </SortableHeader>
            <SortableHeader field="task_type" className="w-[120px]">
              Type
            </SortableHeader>
            <SortableHeader field="due_date" className="w-[140px]">
              Due Date
            </SortableHeader>
            <SortableHeader field="priority" className="w-[100px]">
              Priority
            </SortableHeader>
            <SortableHeader field="status" className="w-[120px]">
              Status
            </SortableHeader>
            <SortableHeader field="assigned_to" className="w-[140px]">
              Assignee
            </SortableHeader>
            <TableHead className="w-[80px]">Vendor</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => {
            const dueSoonStatus = getDueSoonStatus(task);
            const formattedDueDate = format(new Date(task.due_date), 'MMM d, yyyy');
            const relativeDays =
              task.is_pre_wedding !== null && task.days_before_after_wedding !== null
                ? formatDaysRelativeToWedding(task.is_pre_wedding, task.days_before_after_wedding)
                : null;

            return (
              <TableRow
                key={task.id}
                className={cn(
                  'cursor-pointer hover:bg-gray-50',
                  task.is_overdue && 'bg-red-50/50'
                )}
                onClick={() => onEditTask?.(task)}
              >
                {/* Quick Complete Checkbox */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={task.status === 'completed'}
                    disabled={task.status === 'completed' || task.status === 'cancelled'}
                    onCheckedChange={() => handleQuickComplete(task)}
                  />
                </TableCell>

                {/* Title */}
                <TableCell className="font-medium">
                  <div className="line-clamp-1">{task.title}</div>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <TaskTypeBadge taskType={task.task_type} showLabel />
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{formattedDueDate}</div>
                    {relativeDays && (
                      <div className="text-xs text-gray-500">{relativeDays}</div>
                    )}
                    {dueSoonStatus && (
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded',
                          DUE_SOON_COLORS[dueSoonStatus].bg,
                          DUE_SOON_COLORS[dueSoonStatus].text
                        )}
                      >
                        {DUE_SOON_COLORS[dueSoonStatus].label}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <TaskPriorityBadge priority={task.priority} />
                </TableCell>

                {/* Status */}
                <TableCell>
                  <TaskStatusBadge status={task.display_status} />
                </TableCell>

                {/* Assignee */}
                <TableCell>
                  <span className="text-sm text-gray-600 truncate max-w-[120px] block">
                    {task.assigned_to || '-'}
                  </span>
                </TableCell>

                {/* Vendor */}
                <TableCell>
                  {task.vendor ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate max-w-[60px]">
                        {task.vendor.company_name}
                      </span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTask?.(task)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {task.status !== 'completed' && task.status !== 'cancelled' && (
                        <DropdownMenuItem onClick={() => handleQuickComplete(task)}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteTask?.(task)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
