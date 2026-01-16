# Implementation Plan: Task Management Kanban

**Branch**: `015-task-management-kanban` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-task-management-kanban/spec.md`

## Summary

Implement a Kanban-style task management system for pre and post-wedding tasks with drag-and-drop status updates, list view alternative, filtering, and automatic overdue detection. Uses existing `pre_post_wedding_tasks` database table with @dnd-kit for drag-and-drop functionality.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, @dnd-kit/core, @dnd-kit/sortable, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`pre_post_wedding_tasks` table exists)
**Testing**: Manual testing with Playwright MCP only (no automated tests)
**Target Platform**: Web (responsive: mobile, tablet, desktop)
**Project Type**: Web application (React SPA)
**Performance Goals**: FCP < 1.2s, TTI < 3.5s, drag-drop response < 100ms
**Constraints**: <500ms filter/sort operations, client-side filtering for <200 tasks
**Scale/Scope**: ~50-200 tasks per wedding, 5 Kanban columns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | ✅ |
| II. Design System | Follows color palette, typography, spacing specs | ✅ |
| III. Database | UUID PKs, RLS enabled, proper constraints | ✅ |
| IV. Code Quality | TypeScript strict, functional components, proper naming | ✅ |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | ✅ |
| VI. Business Logic | Accurate calculations, proper validations | ✅ |
| VII. Security | RLS, no API key exposure, input validation | ✅ |
| VIII. Testing | Manual testing with Playwright MCP only | ✅ |
| IX. Error Handling | Toast notifications, error boundaries, loading states | ✅ |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | ✅ |
| XI. API Handling | Standard response format, error pattern | ✅ |
| XII. Git Workflow | Feature branches, descriptive commits | ✅ |
| XIII. Documentation | JSDoc for complex functions, README complete | ✅ |
| XIV. Environment | Uses .env, no secrets in git | ✅ |
| XV. Prohibited | No violations of prohibited practices | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/015-task-management-kanban/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Data model documentation
├── quickstart.md        # Implementation quickstart guide
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── task.ts                    # TypeScript interfaces
├── schemas/
│   └── task.ts                    # Zod validation schemas
├── lib/
│   └── taskUtils.ts               # Utility functions
├── hooks/
│   ├── useTasks.ts                # Fetch tasks list
│   └── useTaskMutations.ts        # CRUD operations
├── components/
│   └── tasks/
│       ├── TasksPageContent.tsx   # Main page with view toggle
│       ├── TaskKanbanView.tsx     # Kanban board with DnD
│       ├── TaskListView.tsx       # Table/list view
│       ├── TaskCard.tsx           # Kanban card component
│       ├── KanbanColumn.tsx       # Droppable column
│       ├── TaskModal.tsx          # Add/edit modal
│       ├── TaskForm.tsx           # Form with tabs
│       ├── TaskStatusBadge.tsx    # Status badge
│       ├── TaskPriorityBadge.tsx  # Priority badge
│       ├── TaskTypeBadge.tsx      # Task type with icon
│       ├── TaskFilters.tsx        # Filter controls
│       └── DeleteTaskDialog.tsx   # Delete confirmation
└── pages/
    └── TasksPage.tsx              # Route component
```

**Structure Decision**: Single web application following existing VowSync patterns with feature-based component organization under `src/components/tasks/`.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 1: Foundation

**Goal**: Types, schemas, utilities, and data hooks

**Files**:
1. `src/types/task.ts` - TypeScript interfaces for tasks
2. `src/schemas/task.ts` - Zod validation schemas
3. `src/lib/taskUtils.ts` - Overdue detection, days calculation, color mappings
4. `src/hooks/useTasks.ts` - TanStack Query hook for fetching
5. `src/hooks/useTaskMutations.ts` - Create, update, delete, status change

### Phase 2: Badge Components

**Goal**: Reusable badge components for status, priority, and type

**Files**:
6. `src/components/tasks/TaskStatusBadge.tsx`
7. `src/components/tasks/TaskPriorityBadge.tsx`
8. `src/components/tasks/TaskTypeBadge.tsx`

### Phase 3: Kanban Components

**Goal**: Kanban board with drag-and-drop

**Files**:
9. `src/components/tasks/TaskCard.tsx` - Draggable task card
10. `src/components/tasks/KanbanColumn.tsx` - Droppable column
11. `src/components/tasks/TaskKanbanView.tsx` - Full board with DnD context

### Phase 4: List View

**Goal**: Alternative table view with sorting

**Files**:
12. `src/components/tasks/TaskListView.tsx` - Sortable table view

### Phase 5: Filters and Form

**Goal**: Filter controls and task form

**Files**:
13. `src/components/tasks/TaskFilters.tsx` - Multi-select filters
14. `src/components/tasks/TaskForm.tsx` - Tabbed form (Details, Assignment, Contact)
15. `src/components/tasks/TaskModal.tsx` - Modal wrapper

### Phase 6: Delete and Page Integration

**Goal**: Complete page with all features

**Files**:
16. `src/components/tasks/DeleteTaskDialog.tsx` - Confirmation dialog
17. `src/components/tasks/TasksPageContent.tsx` - Main page content
18. `src/pages/TasksPage.tsx` - Route wrapper
19. `src/App.tsx` - Add route

### Phase 7: E2E Testing

**Goal**: Manual testing with Playwright MCP

**Tests**:
- Create task with all fields
- Drag-drop status changes
- List view sorting/filtering
- Edit task
- Delete task
- Overdue detection
- Mobile responsive

## Dependencies

### New Dependencies to Install

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### Existing Dependencies Used

- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form management
- `zod` - Validation
- `@hookform/resolvers` - Zod resolver
- `date-fns` - Date utilities
- `lucide-react` - Icons
- Shadcn/ui components: Dialog, Button, Select, Tabs, Input, Textarea, Badge, DropdownMenu, Table

## Key Implementation Details

### Kanban DnD Architecture

```typescript
// TaskKanbanView.tsx structure
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <div className="grid grid-cols-5 gap-4">
    {columns.map(column => (
      <KanbanColumn
        key={column.status}
        status={column.status}
        tasks={column.tasks}
      />
    ))}
  </div>
</DndContext>
```

### Status Flow

```
pending ──┬──> in_progress ──┬──> completed
          │                  │
          └──> cancelled     └──> cancelled

[computed: overdue when due_date < today AND status in (pending, in_progress)]
```

### Color System

**Priority**:
- Low: #9E9E9E (gray)
- Medium: #2196F3 (blue)
- High: #FF9800 (orange)
- Critical: #F44336 (red)

**Status**:
- Pending: #9E9E9E (gray)
- In Progress: #2196F3 (blue)
- Completed: #4CAF50 (green)
- Cancelled: #9E9E9E (gray)
- Overdue: #F44336 (red)

### Task Type Icons (Lucide)

- delivery: `Package`
- collection: `Truck`
- appointment: `CalendarClock`
- general: `ClipboardList`
- milestone: `Target`

## Route Configuration

```tsx
// App.tsx
<Route path="/weddings/:weddingId/tasks" element={<TasksPage />} />
```

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| DnD library learning curve | @dnd-kit has excellent docs, simple API |
| Mobile drag experience | Provide list view as primary on mobile |
| Large task lists (>100) | Client-side filtering sufficient, add virtual scroll if needed |
| Status sync on drag | Optimistic update with error rollback |

## Success Criteria

From spec.md:
- SC-001: Create task in <1 minute
- SC-002: Identify overdue tasks in <10 seconds
- SC-003: Accurate Kanban column display
- SC-004: Status drag-drop in <2 seconds
- SC-005: 100% correct due date calculation
- SC-006: Auto-recalculate on wedding date change
- SC-007: 90% first-attempt success rate
- SC-008: Filter/sort in <500ms
