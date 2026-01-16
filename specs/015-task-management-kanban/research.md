# Research: Task Management Kanban

**Feature**: 015-task-management-kanban
**Date**: 2026-01-16
**Status**: Complete

## Research Areas

### 1. Drag-and-Drop Library Selection

**Decision**: @dnd-kit/core + @dnd-kit/sortable

**Rationale**:
- Modern, lightweight React DnD library
- Better TypeScript support than react-beautiful-dnd
- Smaller bundle size (~15kb vs ~30kb)
- Active maintenance and community support
- Flexible API for Kanban boards
- Built-in accessibility support (keyboard navigation, screen readers)
- No peer dependency issues with React 18

**Alternatives Considered**:
- `react-beautiful-dnd`: Deprecated by Atlassian, archived repo
- `react-dnd`: More complex setup, heavier bundle
- `@hello-pangea/dnd`: Fork of react-beautiful-dnd, less proven
- Native HTML5 drag-and-drop: Poor accessibility, inconsistent behavior

**Installation**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### 2. Database Table Verification

**Decision**: Use existing `pre_post_wedding_tasks` table

**Rationale**:
- Table already exists in Supabase with all required fields
- 25 columns covering all task requirements
- Proper foreign keys to weddings and vendors
- RLS should be verified/enabled

**Field Mapping Verified**:
| Feature Requirement | Database Field | Type |
|---------------------|----------------|------|
| Task title | title | TEXT NOT NULL |
| Description | description | TEXT |
| Task type | task_type | TEXT NOT NULL |
| Priority | priority | TEXT DEFAULT 'medium' |
| Status | status | TEXT DEFAULT 'pending' |
| Due date | due_date | DATE NOT NULL |
| Due time | due_time | TIME |
| Pre/post wedding | is_pre_wedding | BOOLEAN |
| Days offset | days_before_after_wedding | INTEGER |
| Assignee | assigned_to | TEXT |
| Vendor link | vendor_id | UUID FK |
| Location | location | TEXT |
| Address | address | TEXT |
| Contact details | contact_person, contact_phone, contact_email | TEXT |
| Completion tracking | completed_date, completed_by | TIMESTAMPTZ, TEXT |
| Reminders | reminder_sent, reminder_date | BOOLEAN, DATE |
| Notes | notes | TEXT |

### 3. Overdue Status Handling

**Decision**: Client-side computed status, not database mutation

**Rationale**:
- Overdue is a derived state based on current date comparison
- Mutating database on every page load would cause unnecessary writes
- Client-side detection is immediate and always accurate
- Simpler to implement without triggers or scheduled jobs
- Status column retains actual workflow state (pending, in_progress, completed, cancelled)

**Implementation Pattern**:
```typescript
// Computed on the client when displaying tasks
function getDisplayStatus(task: Task): TaskStatus {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return task.status;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);
  if (dueDate < today) {
    return 'overdue';
  }
  return task.status;
}
```

### 4. Kanban Column Configuration

**Decision**: 4 workflow columns + 1 computed column

**Columns**:
1. **Pending** - Default status for new tasks
2. **In Progress** - Tasks actively being worked on
3. **Completed** - Finished tasks
4. **Cancelled** - Tasks that won't be done
5. **Overdue** - Computed, shows pending/in_progress tasks past due date

**Drag Rules**:
- Can drag FROM: Pending, In Progress, Overdue
- Can drag TO: Pending, In Progress, Completed, Cancelled
- Cannot drag completed/cancelled tasks
- Overdue column is display-only (computed)

### 5. Wedding Date Synchronization

**Decision**: Calculate days_before_after_wedding on form submit

**Rationale**:
- User sets due_date explicitly
- System calculates days_before_after_wedding based on wedding date
- When wedding date changes, due_date should NOT auto-change (user set it)
- is_pre_wedding calculated based on comparison

**Algorithm**:
```typescript
function calculateDaysRelativeToWedding(
  dueDate: string,
  weddingDate: string
): { is_pre_wedding: boolean; days_before_after_wedding: number } {
  const due = new Date(dueDate);
  const wedding = new Date(weddingDate);
  const diffMs = wedding.getTime() - due.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    is_pre_wedding: diffDays > 0,
    days_before_after_wedding: Math.abs(diffDays)
  };
}
```

### 6. Task Type Icons

**Decision**: Use Lucide React icons matching semantic meaning

**Mapping**:
| Task Type | Icon | Lucide Component |
|-----------|------|------------------|
| delivery | 📦 Package | `Package` |
| collection | 🚚 Truck | `Truck` |
| appointment | 📅 Calendar | `CalendarClock` |
| general | 📝 Note | `ClipboardList` |
| milestone | 🎯 Target | `Target` |

### 7. Priority Urgency Indicators

**Decision**: Visual indicators for due date proximity

**Implementation**:
| Condition | Indicator | Color |
|-----------|-----------|-------|
| Due in 3 days or less | "Urgent" badge | Red |
| Due in 7 days or less | "Due soon" badge | Orange |
| Due today | "Due today" text | Red |
| Overdue N days | "N days overdue" | Red with background |

### 8. Form Tab Structure

**Decision**: 3 tabs for logical grouping

**Tab 1: Details** (primary info)
- Task Type (select)
- Title (required)
- Description (textarea)
- Due Date (required)
- Due Time (optional)
- Priority (select)
- Days relative display (computed, read-only)

**Tab 2: Assignment**
- Assigned To (text)
- Vendor (select with search)
- Location (text)
- Address (text)

**Tab 3: Contact & Notes**
- Contact Person
- Contact Phone
- Contact Email
- Notes (textarea)

### 9. Filter Implementation

**Decision**: Client-side filtering with debounced search

**Rationale**:
- Tasks per wedding typically <200
- Client-side filtering is instant
- No additional API calls needed
- Search debounced at 300ms

**Filter Options**:
- Status (multi-select checkboxes)
- Priority (multi-select checkboxes)
- Task Type (multi-select checkboxes)
- Assignee (text search)
- Pre/Post Wedding (toggle)

### 10. Existing Pattern Compliance

**Verified Patterns from Codebase**:
- Types: `src/types/*.ts` with interface exports
- Schemas: `src/schemas/*.ts` with Zod + type inference
- Hooks: `src/hooks/use*.ts` with TanStack Query patterns
- Query Keys: Factory pattern with `all`, `lists`, `list(id)`, `details`, `detail(id)`
- Components: Feature folders under `src/components/`
- Pages: Route wrappers in `src/pages/`

## Dependencies Summary

**New Dependencies**:
- `@dnd-kit/core`: ^6.x
- `@dnd-kit/sortable`: ^8.x

**Existing Dependencies Used**:
- React 18+
- TanStack Query v5
- React Hook Form
- Zod
- Shadcn/ui (Dialog, Button, Select, Tabs, Input, Textarea)
- Tailwind CSS v3
- date-fns
- Lucide React

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| @dnd-kit learning curve | Low | Medium | Well-documented, examples available |
| Kanban performance with many tasks | Low | Low | Virtual scrolling if >100 tasks |
| Status sync issues | Low | Medium | Optimistic updates with error rollback |
| Mobile drag-and-drop UX | Medium | Medium | List view as primary on mobile |
