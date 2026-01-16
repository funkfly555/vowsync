# Feature Specification: Task Management Kanban

**Feature Branch**: `015-task-management-kanban`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Task Management Kanban - Pre and post-wedding task tracking with Kanban board, list view, and reminders"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Wedding Tasks (Priority: P1)

As a wedding consultant, I need to create pre-wedding and post-wedding tasks with due dates, priorities, and assignments so that I can track all work items leading up to and following the wedding day.

**Why this priority**: This is the core data entry capability - without the ability to create tasks, no other feature can function. It establishes the foundation for all task management.

**Independent Test**: Can be fully tested by creating a task with all required fields and verifying the data persists correctly. Delivers immediate value by documenting a single work item.

**Acceptance Scenarios**:

1. **Given** a wedding exists, **When** I create a new task with title, description, due date, priority, and assignee, **Then** the system saves the task and associates it with the wedding.

2. **Given** I am creating a task, **When** I specify it as a pre-wedding task with days_before_wedding, **Then** the system calculates the actual due date based on the wedding date.

3. **Given** I am creating a task, **When** I specify it as a post-wedding task with days_after_wedding, **Then** the system calculates the actual due date based on the wedding date.

4. **Given** I am creating a task, **When** I select a task type (delivery, collection, appointment, general, milestone), **Then** the type is saved and displayed with appropriate visual indicator.

5. **Given** I am creating a task, **When** I set priority (low, medium, high, critical), **Then** the priority is saved and color-coded according to the design system.

---

### User Story 2 - View Tasks in Kanban Board (Priority: P1)

As a wedding consultant, I need to view all tasks in a Kanban board layout organized by status columns so that I can visualize workflow progress at a glance.

**Why this priority**: The Kanban view is the primary interface for task management, enabling visual workflow tracking and quick status assessment.

**Independent Test**: Can be fully tested by viewing tasks in Kanban columns and verifying correct grouping by status. Delivers value by providing visual task organization.

**Acceptance Scenarios**:

1. **Given** a wedding has tasks, **When** I navigate to the tasks page and select Kanban view, **Then** I see columns for Pending, In Progress, Completed, and Cancelled statuses.

2. **Given** tasks exist in different statuses, **When** I view the Kanban board, **Then** each task card appears in the correct status column.

3. **Given** a task card is displayed, **When** I view it, **Then** I see the title, priority badge (color-coded), due date, assignee, and task type icon.

4. **Given** a task is overdue, **When** I view it on the Kanban board, **Then** it displays an overdue indicator with days overdue count.

5. **Given** I am viewing the Kanban board, **When** I drag a task card to a different column, **Then** the task status updates accordingly.

---

### User Story 3 - View Tasks in List View (Priority: P2)

As a wedding consultant, I need to view all tasks in a sortable, filterable list so that I can efficiently find and manage specific tasks.

**Why this priority**: List view provides an alternative interface for detailed task management, especially useful for bulk operations and detailed filtering.

**Independent Test**: Can be fully tested by viewing tasks in list format with sorting and filtering applied. Delivers value by enabling efficient task lookup.

**Acceptance Scenarios**:

1. **Given** a wedding has tasks, **When** I navigate to the tasks page and select List view, **Then** I see all tasks in a tabular format with columns for title, type, priority, status, due date, and assignee.

2. **Given** I am viewing the task list, **When** I click a column header, **Then** the list sorts by that column (ascending/descending toggle).

3. **Given** I am viewing the task list, **When** I apply filters (by status, priority, type, assignee, or pre/post wedding), **Then** only matching tasks are displayed.

4. **Given** I am viewing the task list, **When** I use the search box, **Then** tasks are filtered by title and description text match.

5. **Given** tasks exist with various due dates, **When** I view the list, **Then** overdue tasks are highlighted and show days overdue.

---

### User Story 4 - Update Task Status (Priority: P2)

As a wedding consultant, I need to update task status as work progresses so that I can track completion and identify blockers.

**Why this priority**: Status tracking enables real-time progress monitoring. Critical for managing wedding preparation workflow.

**Independent Test**: Can be fully tested by updating task status through the workflow and verifying status changes persist. Delivers value by enabling progress tracking.

**Acceptance Scenarios**:

1. **Given** a task with status "pending", **When** I start work on it, **Then** I can update status to "in_progress".

2. **Given** a task with status "in_progress", **When** I complete it, **Then** I can update status to "completed" with a completion timestamp.

3. **Given** a task at any status except completed, **When** I need to cancel it, **Then** I can update status to "cancelled".

4. **Given** a task with any status, **When** the due date has passed and status is not completed/cancelled, **Then** the system automatically marks it as "overdue" (visual indicator, not a status change).

---

### User Story 5 - Edit and Delete Tasks (Priority: P2)

As a wedding consultant, I need to edit existing tasks and delete tasks that are no longer needed so that I can maintain accurate task lists.

**Why this priority**: Editing and deletion are necessary for task maintenance but secondary to creation and tracking.

**Independent Test**: Can be fully tested by editing task fields and deleting tasks. Delivers value by enabling task list maintenance.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** I open it for editing, **Then** I can modify any field and save the changes.

2. **Given** I am editing a task, **When** I change the days_before_after_wedding value, **Then** the system recalculates the actual due date.

3. **Given** an existing task, **When** I delete it, **Then** the system removes the task after confirmation.

4. **Given** I am in Kanban view, **When** I click on a task card, **Then** I can access the edit modal.

---

### User Story 6 - Task Reminders and Notifications (Priority: P3)

As a wedding consultant, I need to see upcoming task reminders so that I don't miss important deadlines.

**Why this priority**: Reminders enhance the task management experience but are not essential for core functionality.

**Independent Test**: Can be fully tested by viewing reminder indicators and verifying correct calculation. Delivers value by surfacing time-sensitive tasks.

**Acceptance Scenarios**:

1. **Given** a task has a due date within 7 days, **When** I view it, **Then** it displays a "due soon" indicator.

2. **Given** a task has a due date within 3 days, **When** I view it, **Then** it displays an "urgent" indicator.

3. **Given** tasks exist with various due dates, **When** I view the task list or Kanban, **Then** tasks due today are highlighted distinctly.

4. **Given** I am on the wedding dashboard, **When** tasks are due soon, **Then** I see a summary count of upcoming tasks.

---

### Edge Cases

- What happens when the wedding date changes? The system recalculates all task due dates based on days_before_after_wedding values.
- What happens when a task has no assignee? Task displays "Unassigned" and can still be managed normally.
- What happens when a completed task's due date passes? No overdue indicator shown for completed/cancelled tasks.
- How does the system handle tasks with the same due date? They appear together, sorted by priority (critical first) then creation time.
- What happens when days_before_after_wedding is 0? Task is due on the wedding day itself.
- What happens when filtering shows no results? Display empty state with "No tasks match your filters" message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create tasks with title (required), description (optional), type (required), priority (required), and assignee (optional).
- **FR-002**: System MUST support task types: delivery, collection, appointment, general, milestone.
- **FR-003**: System MUST support priority levels: low, medium, high, critical.
- **FR-004**: System MUST support status values: pending, in_progress, completed, cancelled.
- **FR-005**: System MUST track is_pre_wedding (boolean) to distinguish pre-wedding vs post-wedding tasks.
- **FR-006**: System MUST track days_before_after_wedding (integer) for relative date calculation.
- **FR-007**: System MUST calculate actual due_date based on wedding date and days_before_after_wedding.
- **FR-008**: System MUST recalculate due_date when wedding date changes.
- **FR-009**: System MUST provide Kanban board view with columns for each status.
- **FR-010**: System MUST provide List view with sorting and filtering capabilities.
- **FR-011**: System MUST support drag-and-drop status changes in Kanban view.
- **FR-012**: System MUST support filtering by status, priority, type, assignee, and pre/post wedding.
- **FR-013**: System MUST support text search on title and description.
- **FR-014**: System MUST detect and visually indicate overdue tasks (due_date < today AND status not completed/cancelled).
- **FR-015**: System MUST display priority with color coding: low (#22C55E green), medium (#3B82F6 blue), high (#F59E0B amber), critical (#EF4444 red).
- **FR-016**: System MUST display status with color coding: pending (#6B7280 gray), in_progress (#3B82F6 blue), completed (#22C55E green), cancelled (#9CA3AF gray), overdue (#EF4444 red).
- **FR-017**: System MUST allow editing of all task fields.
- **FR-018**: System MUST allow deletion of tasks with confirmation.
- **FR-019**: System MUST display task counts per status in Kanban column headers.
- **FR-020**: System MUST indicate "due soon" (within 7 days) and "urgent" (within 3 days) states visually.

### Key Entities

- **Pre/Post Wedding Task**: Represents a work item to be completed before or after the wedding. Contains title, description, type, priority, status, assignee, and relative date information. Links to wedding.

- **Wedding**: The parent entity containing the wedding date used for task due date calculation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete task in under 1 minute.
- **SC-002**: Users can identify all overdue tasks within 10 seconds using Kanban or filtered list view.
- **SC-003**: Kanban board accurately displays all tasks in correct status columns.
- **SC-004**: Status updates via drag-and-drop complete in under 2 seconds.
- **SC-005**: 100% of tasks show correct due date based on wedding date and days_before_after_wedding.
- **SC-006**: Due date recalculation occurs automatically within 1 second when wedding date changes.
- **SC-007**: 90% of users can successfully create, view, and update a task on first attempt without documentation.
- **SC-008**: Filtering and sorting operations complete in under 500ms.

## Assumptions

- The `pre_post_wedding_tasks` table already exists in the database with all required fields as specified.
- Wedding data is already managed through existing wedding features.
- Users access this feature through the existing wedding detail navigation structure.
- The routing convention follows existing patterns: `/weddings/:id/tasks` for the main view.
- Modal overlays are used for create/edit operations, consistent with other features in the application.
- The design system colors and component styles specified are already available in the application.
- Drag-and-drop functionality uses existing library (react-beautiful-dnd or similar).

## Design References

### Visual Design

- **Priority Colors**: Low (#22C55E green), Medium (#3B82F6 blue), High (#F59E0B amber), Critical (#EF4444 red)
- **Status Colors**: Pending (#6B7280 gray), In Progress (#3B82F6 blue), Completed (#22C55E green), Cancelled (#9CA3AF gray), Overdue (#EF4444 red)
- **Task Card Style**: 8px radius, 16px padding, subtle shadow, white background
- **Kanban Column**: 300px width, gray header, scrollable content area

### User Interface

- Main view toggles between Kanban board and List view via tabs/toggle
- Create/Edit via modal overlay
- Filters displayed above board/list
- Priority badges with colored backgrounds
- Status badges with colored backgrounds
- Due date with relative time display ("in 3 days", "2 days overdue")
- Task type icons: 📦 delivery, 🚚 collection, 📅 appointment, 📝 general, 🎯 milestone
