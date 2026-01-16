# Quickstart Guide: Task Management Kanban

**Feature**: 015-task-management-kanban
**Date**: 2026-01-16

## Prerequisites

Before implementing this feature, ensure:

1. **Database table exists**: `pre_post_wedding_tasks` is already in Supabase
2. **RLS enabled**: Row Level Security policies are active
3. **Dependencies installed**: Run `npm install @dnd-kit/core @dnd-kit/sortable`

## File Structure

Create the following files in order:

```
src/
├── types/
│   └── task.ts                    # TypeScript interfaces
├── schemas/
│   └── task.ts                    # Zod validation schemas
├── hooks/
│   ├── useTasks.ts                # Fetch tasks list
│   └── useTaskMutations.ts        # CRUD operations
├── lib/
│   └── taskUtils.ts               # Utility functions
├── components/
│   └── tasks/
│       ├── TasksPageContent.tsx   # Main page content
│       ├── TaskKanbanView.tsx     # Kanban board
│       ├── TaskListView.tsx       # Table view
│       ├── TaskCard.tsx           # Kanban card
│       ├── KanbanColumn.tsx       # Kanban column
│       ├── TaskModal.tsx          # Add/edit modal
│       ├── TaskForm.tsx           # Form component
│       ├── TaskStatusBadge.tsx    # Status badge
│       ├── TaskPriorityBadge.tsx  # Priority badge
│       ├── TaskTypeBadge.tsx      # Task type with icon
│       ├── TaskFilters.tsx        # Filter controls
│       └── DeleteTaskDialog.tsx   # Delete confirmation
└── pages/
    └── TasksPage.tsx              # Route component
```

## Implementation Order

### Phase 1: Foundation (Types, Schemas, Hooks)

1. **`src/types/task.ts`** - Define all TypeScript interfaces
2. **`src/schemas/task.ts`** - Create Zod validation schemas
3. **`src/lib/taskUtils.ts`** - Utility functions (overdue, days calculation)
4. **`src/hooks/useTasks.ts`** - TanStack Query hook for fetching
5. **`src/hooks/useTaskMutations.ts`** - CRUD mutation hooks

### Phase 2: UI Components

6. **Badge components** - TaskStatusBadge, TaskPriorityBadge, TaskTypeBadge
7. **`TaskCard.tsx`** - Kanban card component
8. **`KanbanColumn.tsx`** - Column with droppable area
9. **`TaskKanbanView.tsx`** - Full Kanban board with DnD
10. **`TaskListView.tsx`** - Table/list view
11. **`TaskFilters.tsx`** - Filter controls
12. **`TaskForm.tsx`** - Form with tabs
13. **`TaskModal.tsx`** - Modal wrapper
14. **`DeleteTaskDialog.tsx`** - Delete confirmation

### Phase 3: Page Integration

15. **`TasksPageContent.tsx`** - Main page with view toggle
16. **`TasksPage.tsx`** - Route wrapper
17. **Update `App.tsx`** - Add route

## Key Patterns

### Query Keys

```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (weddingId: string) => [...taskKeys.lists(), weddingId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};
```

### DnD Setup

```typescript
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

// Column uses useDroppable
const { setNodeRef, isOver } = useDroppable({ id: status });

// Card uses useDraggable
const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
```

### Status Colors

```typescript
const STATUS_COLORS = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700' },
};
```

### Priority Colors

```typescript
const PRIORITY_COLORS = {
  low: { bg: 'bg-gray-500', text: 'text-white' },
  medium: { bg: 'bg-blue-500', text: 'text-white' },
  high: { bg: 'bg-orange-500', text: 'text-white' },
  critical: { bg: 'bg-red-500', text: 'text-white' },
};
```

## Route Configuration

Add to `App.tsx`:

```tsx
import { TasksPage } from './pages/TasksPage';

// Inside Routes, within AppLayout
<Route path="/weddings/:weddingId/tasks" element={<TasksPage />} />
```

## Testing Checklist

### Manual Testing with Playwright MCP

1. **Create Task**: Fill all tabs, verify save
2. **Kanban View**: Verify columns, card display
3. **Drag and Drop**: Drag task between columns, verify status update
4. **List View**: Verify table, sorting, filtering
5. **Edit Task**: Modify fields, verify save
6. **Delete Task**: Confirm dialog, verify removal
7. **Overdue Detection**: Create past-due task, verify indicator
8. **Days Calculation**: Verify relative to wedding date
9. **Filters**: Test each filter type
10. **Search**: Test title/description search

## Common Gotchas

1. **Snake_case in queries**: Use `due_date` not `dueDate`
2. **Overdue is computed**: Don't store in database
3. **DnD sensor setup**: Need mouse and touch sensors
4. **Form time format**: Input uses HH:MM, store as HH:MM:SS
5. **Vendor dropdown**: Filter by wedding_id
