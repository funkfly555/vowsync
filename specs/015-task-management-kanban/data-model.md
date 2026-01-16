# Data Model: Task Management Kanban

## Database Schema

### Existing Table: `pre_post_wedding_tasks`

The table already exists in Supabase with the following structure:

```sql
CREATE TABLE pre_post_wedding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,

  -- Task Core Fields
  task_type TEXT NOT NULL,  -- delivery, collection, appointment, general, milestone
  title TEXT NOT NULL,
  description TEXT,

  -- Timing
  due_date DATE NOT NULL,
  due_time TIME,
  is_pre_wedding BOOLEAN DEFAULT true,
  days_before_after_wedding INTEGER,

  -- Assignment
  assigned_to TEXT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

  -- Location Details
  location TEXT,
  address TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,

  -- Status Tracking
  status TEXT DEFAULT 'pending',  -- pending, in_progress, completed, cancelled
  completed_date TIMESTAMPTZ,
  completed_by TEXT,

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_date DATE,

  -- Priority & Notes
  priority TEXT DEFAULT 'medium',  -- low, medium, high, critical
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes (Recommended)

```sql
-- Performance indexes for common queries
CREATE INDEX idx_tasks_wedding_id ON pre_post_wedding_tasks(wedding_id);
CREATE INDEX idx_tasks_status ON pre_post_wedding_tasks(status);
CREATE INDEX idx_tasks_due_date ON pre_post_wedding_tasks(due_date);
CREATE INDEX idx_tasks_priority ON pre_post_wedding_tasks(priority);
CREATE INDEX idx_tasks_wedding_status ON pre_post_wedding_tasks(wedding_id, status);
```

### RLS Policies

Row Level Security should be enabled with policies matching other wedding-related tables:

```sql
-- Enable RLS
ALTER TABLE pre_post_wedding_tasks ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (adjust based on your auth model)
CREATE POLICY "Users can manage tasks for their weddings"
ON pre_post_wedding_tasks
FOR ALL
USING (
  wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  )
);
```

## TypeScript Types

### Task Type Definition

```typescript
export type TaskType = 'delivery' | 'collection' | 'appointment' | 'general' | 'milestone';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

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
```

### Form Types

```typescript
export interface CreateTaskInput {
  wedding_id: string;
  task_type: TaskType;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  is_pre_wedding: boolean;
  days_before_after_wedding?: number;
  assigned_to?: string;
  vendor_id?: string;
  location?: string;
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  priority: TaskPriority;
  reminder_date?: string;
  notes?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  status?: TaskStatus;
  completed_date?: string;
  completed_by?: string;
}

export interface UpdateTaskStatusInput {
  id: string;
  status: TaskStatus;
  completed_date?: string;
  completed_by?: string;
}
```

### View Types

```typescript
export interface TaskWithOverdue extends PrePostWeddingTask {
  is_overdue: boolean;
  days_overdue: number | null;
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  task_type?: TaskType | TaskType[];
  assigned_to?: string;
  is_pre_wedding?: boolean;
  search?: string;
}

export interface TaskSortOptions {
  field: 'due_date' | 'priority' | 'status' | 'title' | 'created_at';
  direction: 'asc' | 'desc';
}

export type TaskViewMode = 'kanban' | 'list';

export interface KanbanColumn {
  status: TaskStatus;
  title: string;
  tasks: TaskWithOverdue[];
  count: number;
}
```

## Relationships

```
weddings (1) ──────< (many) pre_post_wedding_tasks
                          │
vendors (1) ──────────────< (many, optional)
```

### Related Tables

- **weddings**: Parent table containing wedding date for due date calculation
- **vendors**: Optional link for tasks assigned to vendors

## Computed Fields (Client-Side)

### Overdue Detection

```typescript
function isTaskOverdue(task: PrePostWeddingTask): boolean {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function getDaysOverdue(task: PrePostWeddingTask): number | null {
  if (!isTaskOverdue(task)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

### Due Date Calculation

```typescript
function calculateDueDate(
  weddingDate: string,
  isPreWedding: boolean,
  daysBeforeAfter: number
): string {
  const wedding = new Date(weddingDate);
  const offset = isPreWedding ? -daysBeforeAfter : daysBeforeAfter;
  wedding.setDate(wedding.getDate() + offset);
  return wedding.toISOString().split('T')[0];
}
```

### Due Soon Detection

```typescript
function getDueSoonStatus(task: PrePostWeddingTask): 'urgent' | 'due_soon' | null {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return null; // Already overdue or due today
  if (diffDays <= 3) return 'urgent';
  if (diffDays <= 7) return 'due_soon';
  return null;
}
```

## Query Patterns

### Fetch Tasks for Wedding

```typescript
const { data: tasks } = await supabase
  .from('pre_post_wedding_tasks')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('due_date', { ascending: true });
```

### Fetch Tasks by Status (for Kanban)

```typescript
const { data: tasks } = await supabase
  .from('pre_post_wedding_tasks')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('priority', { ascending: false })
  .order('due_date', { ascending: true });
```

### Update Task Status

```typescript
const { data } = await supabase
  .from('pre_post_wedding_tasks')
  .update({
    status: newStatus,
    completed_date: newStatus === 'completed' ? new Date().toISOString() : null,
    completed_by: newStatus === 'completed' ? userName : null,
    updated_at: new Date().toISOString()
  })
  .eq('id', taskId)
  .select()
  .single();
```

### Filter Tasks

```typescript
let query = supabase
  .from('pre_post_wedding_tasks')
  .select('*')
  .eq('wedding_id', weddingId);

if (filters.status) {
  query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
}
if (filters.priority) {
  query = query.in('priority', Array.isArray(filters.priority) ? filters.priority : [filters.priority]);
}
if (filters.task_type) {
  query = query.in('task_type', Array.isArray(filters.task_type) ? filters.task_type : [filters.task_type]);
}
if (filters.is_pre_wedding !== undefined) {
  query = query.eq('is_pre_wedding', filters.is_pre_wedding);
}
if (filters.search) {
  query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
}

const { data: tasks } = await query.order('due_date', { ascending: true });
```
