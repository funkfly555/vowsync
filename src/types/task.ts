/**
 * Task TypeScript Types
 * @feature 015-task-management-kanban
 */

// =============================================================================
// Database Enums
// =============================================================================

/**
 * Task type enumeration
 */
export type TaskType = 'delivery' | 'collection' | 'appointment' | 'general' | 'milestone';

/**
 * Task priority enumeration
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Task status enumeration (stored in database)
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Display status includes computed 'overdue' status
 */
export type TaskDisplayStatus = TaskStatus | 'overdue';

// =============================================================================
// Database Entity Types
// =============================================================================

/**
 * Database entity - mirrors Supabase pre_post_wedding_tasks table
 */
export interface PrePostWeddingTask {
  id: string;
  wedding_id: string;

  // Core fields
  task_type: TaskType;
  title: string;
  description: string | null;

  // Timing
  due_date: string; // ISO date string
  due_time: string | null;
  is_pre_wedding: boolean;
  days_before_after_wedding: number | null;

  // Assignment
  assigned_to: string | null;
  vendor_id: string | null;

  // Location
  location: string | null;
  address: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;

  // Status
  status: TaskStatus;
  completed_date: string | null;
  completed_by: string | null;

  // Reminders
  reminder_sent: boolean;
  reminder_date: string | null;

  // Priority & Notes
  priority: TaskPriority;
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// =============================================================================
// View Types
// =============================================================================

/**
 * Task with computed overdue status for display
 */
export interface TaskWithOverdue extends PrePostWeddingTask {
  is_overdue: boolean;
  days_overdue: number | null;
  display_status: TaskDisplayStatus;
}

/**
 * Task with vendor information for display
 */
export interface TaskWithVendor extends TaskWithOverdue {
  vendor?: {
    id: string;
    company_name: string;
  } | null;
}

// =============================================================================
// Form Types
// =============================================================================

/**
 * Form data for creating/editing tasks
 */
export interface TaskFormData {
  // Details Tab
  task_type: TaskType;
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  priority: TaskPriority;

  // Assignment Tab
  assigned_to: string;
  vendor_id: string;
  location: string;
  address: string;

  // Contact Tab
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  notes: string;

  // Reminders
  reminder_date: string;
}

/**
 * Default form values for new task
 */
export const DEFAULT_TASK_FORM: TaskFormData = {
  task_type: 'general',
  title: '',
  description: '',
  due_date: '',
  due_time: '',
  priority: 'medium',
  assigned_to: '',
  vendor_id: '',
  location: '',
  address: '',
  contact_person: '',
  contact_phone: '',
  contact_email: '',
  notes: '',
  reminder_date: '',
};

/**
 * Input for creating a task
 */
export interface CreateTaskInput {
  wedding_id: string;
  task_type: TaskType;
  title: string;
  description?: string | null;
  due_date: string;
  due_time?: string | null;
  is_pre_wedding: boolean;
  days_before_after_wedding?: number | null;
  assigned_to?: string | null;
  vendor_id?: string | null;
  location?: string | null;
  address?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  priority: TaskPriority;
  reminder_date?: string | null;
  notes?: string | null;
}

/**
 * Input for updating a task
 */
export interface UpdateTaskInput extends Partial<Omit<CreateTaskInput, 'wedding_id'>> {
  id: string;
  status?: TaskStatus;
  completed_date?: string | null;
  completed_by?: string | null;
}

/**
 * Input for updating task status only
 */
export interface UpdateTaskStatusInput {
  id: string;
  status: TaskStatus;
  completed_date?: string | null;
  completed_by?: string | null;
}

// =============================================================================
// Filter & Sort Types
// =============================================================================

/**
 * Filter options for task list
 */
export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  task_type?: TaskType | TaskType[];
  assigned_to?: string;
  is_pre_wedding?: boolean;
  search?: string;
}

/**
 * Default filter values
 */
export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: '',
};

/**
 * Sort options for task list
 */
export interface TaskSortOptions {
  field: 'due_date' | 'priority' | 'status' | 'title' | 'created_at';
  direction: 'asc' | 'desc';
}

/**
 * Default sort options
 */
export const DEFAULT_TASK_SORT: TaskSortOptions = {
  field: 'due_date',
  direction: 'asc',
};

// =============================================================================
// View Types
// =============================================================================

/**
 * View mode for tasks page
 */
export type TaskViewMode = 'kanban' | 'list';

/**
 * Kanban column configuration
 */
export interface KanbanColumn {
  id: TaskDisplayStatus;
  title: string;
  tasks: TaskWithVendor[];
  count: number;
}

// =============================================================================
// Due Soon Status
// =============================================================================

/**
 * Due soon status for visual indicators
 */
export type DueSoonStatus = 'urgent' | 'due_soon' | null;
