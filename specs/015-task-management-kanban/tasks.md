# Tasks: Task Management Kanban

**Input**: Design documents from `/specs/015-task-management-kanban/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md
**Testing**: Manual testing with Playwright MCP only (no automated tests per constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Single React SPA
- **Base paths**: `src/` for source, manual E2E testing with Playwright MCP

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create directory structure

- [x] T001 Install @dnd-kit dependencies: `npm install @dnd-kit/core @dnd-kit/sortable`
- [x] T002 Create tasks component directory: `src/components/tasks/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, schemas, utilities, and hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create TypeScript interfaces in `src/types/task.ts` - TaskType, TaskPriority, TaskStatus, PrePostWeddingTask, TaskFormData, TaskFilters, TaskWithVendor
- [x] T004 [P] Create Zod validation schemas in `src/schemas/task.ts` - taskFormSchema, taskDbSchema with all field validations
- [x] T005 [P] Create utility functions in `src/lib/taskUtils.ts` - isTaskOverdue, getDaysOverdue, getDueSoonStatus, calculateDaysRelativeToWedding, STATUS_COLORS, PRIORITY_COLORS, TASK_TYPE_ICONS
- [x] T006 Create TanStack Query hook in `src/hooks/useTasks.ts` - taskKeys factory, useTasks hook with vendor join, useVendorsForDropdown helper
- [x] T007 Create mutation hooks in `src/hooks/useTaskMutations.ts` - useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus with optimistic updates

**Checkpoint**: Foundation ready - types, schemas, hooks complete. User story implementation can now begin.

---

## Phase 3: User Story 1 - Create Wedding Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to create pre and post-wedding tasks with all required fields

**Independent Test**: Create a task with all fields (title, description, type, priority, assignee, due date, vendor) and verify it saves correctly to database and appears in task list

### Implementation for User Story 1

- [x] T008 [P] [US1] Create TaskPriorityBadge component in `src/components/tasks/TaskPriorityBadge.tsx` - color-coded priority display (low/medium/high/critical)
- [x] T009 [P] [US1] Create TaskTypeBadge component in `src/components/tasks/TaskTypeBadge.tsx` - icon + label for task types (Package/Truck/CalendarClock/ClipboardList/Target)
- [x] T010 [US1] Create TaskForm component in `src/components/tasks/TaskForm.tsx` - 3-tab form (Details, Assignment, Contact) with React Hook Form + Zod
- [x] T011 [US1] Create TaskModal component in `src/components/tasks/TaskModal.tsx` - Shadcn Dialog wrapper for create/edit with form integration
- [x] T012 [US1] Create minimal TasksPageContent in `src/components/tasks/TasksPageContent.tsx` - header with "+ Add Task" button and modal trigger (list view placeholder)
- [x] T013 [US1] Create TasksPage route wrapper in `src/pages/TasksPage.tsx` - useParams for weddingId, useWedding for wedding date
- [x] T014 [US1] Add route to App.tsx: `/weddings/:weddingId/tasks` element={<TasksPage />}

**Checkpoint**: User Story 1 complete - users can create tasks via modal form. Tasks save to database with all fields.

---

## Phase 4: User Story 2 - View Tasks in Kanban Board (Priority: P1)

**Goal**: Display tasks in Kanban board with drag-and-drop status changes

**Independent Test**: View tasks grouped by status columns, drag a task to new column, verify status updates in database

### Implementation for User Story 2

- [x] T015 [P] [US2] Create TaskStatusBadge component in `src/components/tasks/TaskStatusBadge.tsx` - icon + color for status (pending/in_progress/completed/cancelled/overdue)
- [x] T016 [P] [US2] Create TaskCard component in `src/components/tasks/TaskCard.tsx` - draggable card with priority badge, type icon, title, due date, assignee, dropdown menu
- [x] T017 [US2] Create KanbanColumn component in `src/components/tasks/KanbanColumn.tsx` - useDroppable from @dnd-kit, column header with count, scrollable task list
- [x] T018 [US2] Create TaskKanbanView component in `src/components/tasks/TaskKanbanView.tsx` - DndContext with sensors, 5 columns (pending/in_progress/completed/cancelled/overdue), handleDragEnd with status mutation
- [x] T019 [US2] Update TasksPageContent to include Kanban view as default in `src/components/tasks/TasksPageContent.tsx` - add view state, render TaskKanbanView

**Checkpoint**: User Story 2 complete - Kanban board displays tasks by status, drag-drop updates status, overdue tasks show in red column

---

## Phase 5: User Story 3 - View Tasks in List View (Priority: P2)

**Goal**: Alternative table view with sortable columns and filtering

**Independent Test**: View tasks in table, sort by due date, filter by priority, verify correct results

### Implementation for User Story 3

- [x] T020 [P] [US3] Create TaskFilters component in `src/components/tasks/TaskFilters.tsx` - status, priority, type, assignee filters with Shadcn Select, search input, clear button
- [x] T021 [US3] Create TaskListView component in `src/components/tasks/TaskListView.tsx` - Shadcn Table with sortable columns (title, type, due date, priority, status, assignee), row click to edit, overdue highlighting
- [x] T022 [US3] Update TasksPageContent with view toggle in `src/components/tasks/TasksPageContent.tsx` - add Tabs for Kanban/List, pass filters to both views, filter state management

**Checkpoint**: User Story 3 complete - list view with sorting and filtering works alongside Kanban view

---

## Phase 6: User Story 4 - Update Task Status (Priority: P2)

**Goal**: Status workflow updates and completion tracking

**Independent Test**: Update task from pending → in_progress → completed, verify timestamps captured

### Implementation for User Story 4

- [x] T023 [US4] Add quick status actions to TaskCard in `src/components/tasks/TaskCard.tsx` - dropdown menu with "Start", "Complete", "Cancel" actions using useUpdateTaskStatus
- [x] T024 [US4] Add quick complete button to TaskListView rows in `src/components/tasks/TaskListView.tsx` - checkmark icon button for marking complete
- [x] T025 [US4] Verify completion timestamp capture in useUpdateTaskStatus in `src/hooks/useTaskMutations.ts` - set completed_date and completed_by on completion

**Checkpoint**: User Story 4 complete - status can be updated via drag-drop, menu, or quick buttons with proper tracking

---

## Phase 7: User Story 5 - Edit and Delete Tasks (Priority: P2)

**Goal**: Task editing and deletion with confirmation

**Independent Test**: Edit a task's title and due date, delete a task, verify changes persist

### Implementation for User Story 5

- [ ] T026 [US5] Create DeleteTaskDialog component in `src/components/tasks/DeleteTaskDialog.tsx` - Shadcn AlertDialog with task title, confirm/cancel buttons
- [ ] T027 [US5] Add edit mode to TaskModal in `src/components/tasks/TaskModal.tsx` - load existing task data, update title to "Edit Task", call useUpdateTask on save
- [ ] T028 [US5] Wire up edit/delete in TaskCard and TaskListView - edit opens modal with task data, delete opens DeleteTaskDialog

**Checkpoint**: User Story 5 complete - full CRUD operations working on tasks

---

## Phase 8: User Story 6 - Task Reminders and Notifications (Priority: P3)

**Goal**: Visual indicators for upcoming and urgent tasks

**Independent Test**: Create task due in 3 days, verify "urgent" badge displays; create task due in 7 days, verify "due soon" badge

### Implementation for User Story 6

- [ ] T029 [US6] Add due soon/urgent indicators to TaskCard in `src/components/tasks/TaskCard.tsx` - call getDueSoonStatus, show badge if urgent/due_soon
- [ ] T030 [US6] Add due soon/urgent indicators to TaskListView in `src/components/tasks/TaskListView.tsx` - badge in due date column for upcoming tasks
- [ ] T031 [US6] Add overdue count badge to Kanban column header in `src/components/tasks/KanbanColumn.tsx` - highlight overdue column with count

**Checkpoint**: User Story 6 complete - visual reminders surface time-sensitive tasks

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, error handling, and manual testing

- [ ] T032 Add loading states to TasksPageContent in `src/components/tasks/TasksPageContent.tsx` - skeleton loading for Kanban/List views
- [ ] T033 Add error handling with toast notifications in all mutation hooks in `src/hooks/useTaskMutations.ts` - show toast on success/error
- [ ] T034 Add empty states to Kanban and List views - "No tasks yet" with create button
- [ ] T035 Verify responsive design - mobile list view as default, test on narrow screens
- [ ] T036 Add navigation link to tasks page in wedding navigation sidebar
- [ ] T037 Run quickstart.md validation with Playwright MCP - test all acceptance scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 - complete US1 first (creates tasks needed for Kanban)
  - US3, US4, US5 are P2 - can proceed after US2
  - US6 is P3 - complete last
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - creates the task creation flow
- **User Story 2 (P1)**: Soft dependency on US1 (need tasks to display in Kanban)
- **User Story 3 (P2)**: No dependencies - list view is independent
- **User Story 4 (P2)**: Depends on US2 (Kanban drag-drop) and US3 (list quick actions)
- **User Story 5 (P2)**: Depends on US1 (modal) - adds edit/delete functionality
- **User Story 6 (P3)**: Depends on US2 and US3 - adds badges to existing components

### Within Each Phase

- Tasks marked [P] can run in parallel
- Sequential tasks depend on previous tasks in same phase
- Commit after each task or logical group

### Parallel Opportunities

**Phase 2 (Foundational)**:
```bash
# Can run in parallel:
Task: "T003 - Create TypeScript interfaces in src/types/task.ts"
Task: "T004 - Create Zod validation schemas in src/schemas/task.ts"
Task: "T005 - Create utility functions in src/lib/taskUtils.ts"
```

**Phase 3 (US1)**:
```bash
# Can run in parallel:
Task: "T008 - TaskPriorityBadge"
Task: "T009 - TaskTypeBadge"
```

**Phase 4 (US2)**:
```bash
# Can run in parallel:
Task: "T015 - TaskStatusBadge"
Task: "T016 - TaskCard"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T007)
3. Complete Phase 3: User Story 1 - Create Tasks (T008-T014)
4. Complete Phase 4: User Story 2 - Kanban View (T015-T019)
5. **STOP and VALIDATE**: Test task creation and Kanban display
6. Deploy/demo if ready - MVP delivers core task management

### Incremental Delivery

1. MVP: US1 + US2 → Users can create and view tasks in Kanban
2. Add US3 → Users get list view alternative
3. Add US4 → Users get quick status updates
4. Add US5 → Users can edit and delete tasks
5. Add US6 → Users get reminder indicators
6. Polish → Production-ready

### Total Task Count

- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1)**: 7 tasks
- **Phase 4 (US2)**: 5 tasks
- **Phase 5 (US3)**: 3 tasks
- **Phase 6 (US4)**: 3 tasks
- **Phase 7 (US5)**: 3 tasks
- **Phase 8 (US6)**: 3 tasks
- **Phase 9 (Polish)**: 6 tasks

**Total**: 37 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No automated tests per constitution - manual testing with Playwright MCP
- Database table `pre_post_wedding_tasks` already exists
- Design system colors defined in spec.md and constitution
- @dnd-kit/core for drag-and-drop per research.md decision
