/**
 * Task Utility Functions
 * @feature 015-task-management-kanban
 */

import {
  PrePostWeddingTask,
  TaskPriority,
  TaskStatus,
  TaskDisplayStatus,
  TaskType,
  TaskWithOverdue,
  DueSoonStatus,
} from '@/types/task';

// =============================================================================
// Overdue Detection (Client-Side Computed)
// =============================================================================

/**
 * Check if a task is overdue
 * A task is overdue if:
 * - Status is 'pending' or 'in_progress'
 * - Due date is before today
 */
export function isTaskOverdue(task: PrePostWeddingTask): boolean {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

/**
 * Get the number of days a task is overdue
 * Returns null if task is not overdue
 */
export function getDaysOverdue(task: PrePostWeddingTask): number | null {
  if (!isTaskOverdue(task)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the display status for a task
 * This includes the computed 'overdue' status
 */
export function getDisplayStatus(task: PrePostWeddingTask): TaskDisplayStatus {
  if (isTaskOverdue(task)) {
    return 'overdue';
  }
  return task.status;
}

/**
 * Transform a task to include overdue information
 */
export function toTaskWithOverdue(task: PrePostWeddingTask): TaskWithOverdue {
  return {
    ...task,
    is_overdue: isTaskOverdue(task),
    days_overdue: getDaysOverdue(task),
    display_status: getDisplayStatus(task),
  };
}

// =============================================================================
// Due Soon Detection
// =============================================================================

/**
 * Get due soon status for visual indicators
 * - 'urgent': Due in 3 days or less
 * - 'due_soon': Due in 7 days or less
 * - null: Not due soon or already overdue
 */
export function getDueSoonStatus(task: PrePostWeddingTask): DueSoonStatus {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Already overdue or due today
  if (diffDays <= 0) return null;
  // Due in 3 days or less
  if (diffDays <= 3) return 'urgent';
  // Due in 7 days or less
  if (diffDays <= 7) return 'due_soon';

  return null;
}

// =============================================================================
// Wedding Date Calculation
// =============================================================================

/**
 * Calculate days relative to wedding date
 * Returns is_pre_wedding and days_before_after_wedding
 */
export function calculateDaysRelativeToWedding(
  dueDate: string,
  weddingDate: string
): { is_pre_wedding: boolean; days_before_after_wedding: number } {
  const due = new Date(dueDate);
  const wedding = new Date(weddingDate);
  due.setHours(0, 0, 0, 0);
  wedding.setHours(0, 0, 0, 0);

  const diffMs = wedding.getTime() - due.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    is_pre_wedding: diffDays > 0,
    days_before_after_wedding: Math.abs(diffDays),
  };
}

/**
 * Format days relative to wedding for display
 */
export function formatDaysRelativeToWedding(
  isPreWedding: boolean,
  days: number | null
): string {
  if (days === null || days === undefined) return '';
  if (days === 0) return 'Wedding day';
  if (isPreWedding) {
    return days === 1 ? '1 day before' : `${days} days before`;
  }
  return days === 1 ? '1 day after' : `${days} days after`;
}

// =============================================================================
// Color Configuration
// =============================================================================

/**
 * Status colors for badges and UI elements
 */
export const STATUS_COLORS: Record<
  TaskDisplayStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Pending',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-300',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
  },
};

/**
 * Priority colors for badges and UI elements
 */
export const PRIORITY_COLORS: Record<
  TaskPriority,
  { label: string; bg: string; text: string }
> = {
  low: {
    label: 'Low',
    bg: 'bg-gray-500',
    text: 'text-white',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-blue-500',
    text: 'text-white',
  },
  high: {
    label: 'High',
    bg: 'bg-orange-500',
    text: 'text-white',
  },
  critical: {
    label: 'Critical',
    bg: 'bg-red-500',
    text: 'text-white',
  },
};

/**
 * Due soon indicator colors
 */
export const DUE_SOON_COLORS: Record<
  'urgent' | 'due_soon',
  { label: string; bg: string; text: string }
> = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
  due_soon: {
    label: 'Due Soon',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
  },
};

// =============================================================================
// Task Type Icons (Lucide icon names)
// =============================================================================

/**
 * Task type icon mapping (Lucide React icon names)
 */
export const TASK_TYPE_ICONS: Record<TaskType, { icon: string; label: string }> = {
  delivery: { icon: 'Package', label: 'Delivery' },
  collection: { icon: 'Truck', label: 'Collection' },
  appointment: { icon: 'CalendarClock', label: 'Appointment' },
  general: { icon: 'ClipboardList', label: 'General' },
  milestone: { icon: 'Target', label: 'Milestone' },
};

// =============================================================================
// Kanban Column Configuration
// =============================================================================

/**
 * Kanban column definitions
 */
export const KANBAN_COLUMNS: {
  id: TaskDisplayStatus;
  title: string;
  allowDrop: boolean;
}[] = [
  { id: 'pending', title: 'Pending', allowDrop: true },
  { id: 'in_progress', title: 'In Progress', allowDrop: true },
  { id: 'completed', title: 'Completed', allowDrop: true },
  { id: 'cancelled', title: 'Cancelled', allowDrop: true },
  { id: 'overdue', title: 'Overdue', allowDrop: false }, // Computed column
];

/**
 * Get tasks grouped by display status for Kanban view
 */
export function groupTasksByStatus(
  tasks: TaskWithOverdue[]
): Record<TaskDisplayStatus, TaskWithOverdue[]> {
  const groups: Record<TaskDisplayStatus, TaskWithOverdue[]> = {
    pending: [],
    in_progress: [],
    completed: [],
    cancelled: [],
    overdue: [],
  };

  for (const task of tasks) {
    groups[task.display_status].push(task);
  }

  return groups;
}

// =============================================================================
// Priority Sorting
// =============================================================================

/**
 * Priority order for sorting (higher number = higher priority)
 */
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/**
 * Compare tasks by priority (descending) then due date (ascending)
 */
export function compareTasksByPriorityAndDate(
  a: PrePostWeddingTask,
  b: PrePostWeddingTask
): number {
  // First compare by priority (higher priority first)
  const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
  if (priorityDiff !== 0) return priorityDiff;

  // Then compare by due date (earlier first)
  return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
}

// =============================================================================
// Status Workflow
// =============================================================================

/**
 * Get valid next statuses for a task
 * Completed and cancelled tasks cannot be dragged
 */
export function getValidNextStatuses(currentStatus: TaskStatus): TaskStatus[] {
  switch (currentStatus) {
    case 'pending':
      return ['in_progress', 'completed', 'cancelled'];
    case 'in_progress':
      return ['pending', 'completed', 'cancelled'];
    case 'completed':
      return []; // Cannot change completed tasks via drag
    case 'cancelled':
      return []; // Cannot change cancelled tasks via drag
    default:
      return [];
  }
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean {
  return getValidNextStatuses(currentStatus).includes(newStatus);
}
