# Feature Specification: Budget Tracking System

**Feature Branch**: `011-budget-tracking`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Budget Tracking System - Track wedding budget with categories, actual costs, and visual progress"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Budget Overview (Priority: P1)

As a wedding consultant, I need to see a clear overview of my wedding's budget status at a glance so I can quickly understand total planned spending, actual spending, and remaining budget.

**Why this priority**: This is the foundation of budget tracking - without visibility into totals, consultants cannot make informed financial decisions. This provides immediate value even before adding/editing categories.

**Independent Test**: Navigate to `/weddings/:id/budget`, verify 4 stat cards display (Total Budget, Total Spent, Remaining, % Spent), progress bar shows spending percentage, and data reflects actual database values.

**Acceptance Scenarios**:

1. **Given** a wedding with budget categories totaling R 100,000 projected and R 45,000 actual, **When** I navigate to the budget page, **Then** I see Total Budget: R 100,000, Total Spent: R 45,000, Remaining: R 55,000, and 45% spent.

2. **Given** a wedding with no budget categories, **When** I navigate to the budget page, **Then** I see Total Budget: R 0, Total Spent: R 0, Remaining: R 0, and 0% spent with an empty state message.

3. **Given** budget totals are displayed, **When** spending exceeds 90% of total budget, **Then** the progress bar changes color to indicate warning status.

---

### User Story 2 - Manage Budget Categories (Priority: P1)

As a wedding consultant, I need to add, edit, and delete budget categories so I can organize my wedding expenses into logical groups like Venue, Catering, Flowers, etc.

**Why this priority**: Core CRUD functionality enables consultants to structure their budget. Without this, the overview would be empty and the feature unusable.

**Independent Test**: Add a new category "Venue" with R 50,000 projected, verify it appears in the table. Edit to change projected amount to R 55,000, verify update. Delete a category with R 0 actual, verify removal.

**Acceptance Scenarios**:

1. **Given** I am on the budget page, **When** I click "Add Category" and enter name "Venue", projected R 50,000, and optional notes, **Then** the category appears in the table with R 0 actual and "On Track" status.

2. **Given** a category "Catering" exists with R 30,000 projected, **When** I edit it to R 35,000 projected, **Then** the table updates immediately and wedding totals recalculate.

3. **Given** a category "Decor" exists with R 0 actual, **When** I click delete, **Then** the category is removed without confirmation.

4. **Given** a category "Flowers" exists with R 5,000 actual, **When** I click delete, **Then** I see a confirmation dialog warning that R 5,000 in actual spending will be lost.

---

### User Story 3 - Track Actual Spending (Priority: P1)

As a wedding consultant, I need to record actual amounts spent in each category so I can compare planned vs actual spending and identify budget overruns.

**Why this priority**: Tracking actual spending is the core purpose of budget tracking. Without recording actuals, consultants cannot monitor financial health.

**Independent Test**: Edit an existing category to add actual amount, verify variance calculation, status badge updates, and wedding totals recalculate.

**Acceptance Scenarios**:

1. **Given** a category "Venue" with projected R 50,000 and actual R 0, **When** I edit and set actual to R 45,000, **Then** variance shows R -5,000 (under budget) and status remains "On Track".

2. **Given** a category with projected R 10,000, **When** I set actual to R 9,500 (95%), **Then** status badge shows "90% Spent" with warning color.

3. **Given** a category with projected R 10,000, **When** I set actual to R 12,000, **Then** status badge shows "Over by R 2,000" with error color.

---

### User Story 4 - View Budget Health Status (Priority: P2)

As a wedding consultant, I need to see status badges on each category indicating budget health so I can quickly identify which areas need attention.

**Why this priority**: Visual indicators reduce cognitive load and help consultants prioritize their attention. Important but the underlying data from P1 stories must exist first.

**Independent Test**: Create categories with different actual/projected ratios, verify correct badge displays: green "On Track" (<90%), orange "90% Spent" (90-99%), red "Over by X" (>100%).

**Acceptance Scenarios**:

1. **Given** a category with actual 80% of projected, **When** viewing the table, **Then** I see a green "On Track" badge.

2. **Given** a category with actual 95% of projected, **When** viewing the table, **Then** I see an orange "90% Spent" badge.

3. **Given** a category with actual R 12,000 and projected R 10,000, **When** viewing the table, **Then** I see a red "Over by R 2,000" badge.

---

### User Story 5 - Visualize Budget Allocation (Priority: P2)

As a wedding consultant, I need to see a pie chart showing how budget is allocated across categories so I can understand the proportion of spending in each area.

**Why this priority**: Visual representation helps with financial planning and client communication. Enhances the overview but is not essential for basic budget tracking.

**Independent Test**: Create 3+ categories with different projected amounts, verify pie chart displays proportional slices with category names and amounts.

**Acceptance Scenarios**:

1. **Given** categories Venue (R 50,000), Catering (R 30,000), and Flowers (R 20,000), **When** viewing the budget page, **Then** pie chart shows proportional slices with labels.

2. **Given** no budget categories exist, **When** viewing the budget page, **Then** pie chart is hidden or shows empty state.

---

### User Story 6 - Auto-Update Wedding Totals (Priority: P3)

As a wedding consultant, I need the wedding's overall budget totals to automatically update when categories change so I don't have to manually calculate totals.

**Why this priority**: Automation reduces manual work and prevents calculation errors. This happens behind the scenes and enhances data integrity.

**Independent Test**: Add a category, verify wedding.budget_total increases. Update actual amount, verify wedding.budget_actual updates. Delete category, verify totals decrease.

**Acceptance Scenarios**:

1. **Given** a wedding with 2 categories totaling R 80,000 projected, **When** I add a new category with R 20,000 projected, **Then** the wedding's budget_total updates to R 100,000.

2. **Given** a category with R 5,000 actual, **When** I update actual to R 8,000, **Then** the wedding's budget_actual increases by R 3,000.

---

### Edge Cases

- What happens when a category has R 0 projected amount? Display variance as N/A and status as "On Track" (no division by zero).
- How does system handle very large budgets (e.g., R 9,999,999.99)? Currency formatting should handle thousands separators correctly.
- What if user enters negative amounts? Validation prevents negative values for both projected and actual amounts.
- What happens if editing a category fails mid-operation? Form shows error message, data remains unchanged, user can retry.
- How does the page behave with 50+ categories? Table remains scrollable and performant, pie chart limits legend display.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a budget overview page at `/weddings/:id/budget` accessible from sidebar navigation.
- **FR-002**: System MUST show 4 summary stat cards: Total Budget, Total Spent, Remaining Balance, and Percentage Spent.
- **FR-003**: System MUST display a progress bar showing spending percentage with color-coded status (normal, warning at 90%, danger at 100%+).
- **FR-004**: System MUST display all budget categories in a sortable table with columns: Category Name, Projected Amount, Actual Amount, Variance, and Status.
- **FR-005**: Users MUST be able to add new budget categories with name (required), projected amount (required), and notes (optional).
- **FR-006**: Users MUST be able to edit existing categories to update projected amount, actual amount, and notes.
- **FR-007**: Users MUST be able to delete categories, with confirmation required when actual amount is greater than R 0.
- **FR-008**: System MUST display status badges indicating budget health: "On Track" (green, <90%), "90% Spent" (orange, 90-99%), "Over by R X" (red, >100%).
- **FR-009**: System MUST display a pie chart showing budget allocation by category (projected amounts).
- **FR-010**: System MUST automatically update the wedding's budget_total and budget_actual fields when categories are created, updated, or deleted.
- **FR-011**: System MUST show an empty state message when no budget categories exist for a wedding.
- **FR-012**: System MUST validate category_name (required, max 100 characters).
- **FR-013**: System MUST validate projected_amount (required, >= 0, max 9,999,999.99).
- **FR-014**: System MUST validate actual_amount (>= 0, max 9,999,999.99, defaults to 0).
- **FR-015**: System MUST format all currency values in South African Rand (R X,XXX.XX format).

### Key Entities

- **Budget Category**: Represents a spending category for a wedding budget. Contains category name, projected (planned) amount, actual (spent) amount, calculated variance, and optional notes. Belongs to a single wedding.

- **Wedding (existing)**: Contains aggregated budget_total (sum of all category projected amounts) and budget_actual (sum of all category actual amounts) that are auto-updated when categories change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view complete budget overview within 2 seconds of navigating to the budget page.
- **SC-002**: Users can add a new budget category in under 30 seconds (open form, enter data, save).
- **SC-003**: Budget totals and percentages recalculate and display within 1 second of any category change.
- **SC-004**: 100% of category status badges display the correct state based on actual/projected ratio.
- **SC-005**: Currency values display consistently in R X,XXX.XX format across all components.
- **SC-006**: Empty state message appears when wedding has zero budget categories.
- **SC-007**: Pie chart accurately represents proportional budget allocation for all non-zero categories.
- **SC-008**: Delete confirmation dialog appears 100% of the time when attempting to delete a category with actual > 0.
- **SC-009**: Page layout adapts correctly to mobile viewport (stat cards stack, table scrolls horizontally, pie chart moves below table).
- **SC-010**: Wedding budget_total and budget_actual fields remain synchronized with category sum after any CRUD operation.

## Assumptions

- The `budget_categories` table already exists in Supabase with the required schema (id, wedding_id, category_name, projected_amount, actual_amount, variance, notes, created_at, updated_at).
- The `weddings` table already has budget_total and budget_actual columns.
- The recharts library is already available in the project for pie chart rendering.
- Currency formatting follows South African Rand conventions (R symbol, comma thousands separator, period decimal).
- The sidebar navigation component exists and can accommodate a new "Budget" link.
- Row Level Security (RLS) policies exist to ensure users can only access budget categories for weddings they own.

## Dependencies

- Existing wedding detail page and routing structure
- Supabase client configuration
- Shadcn/ui component library
- recharts library for visualizations
- React Hook Form and Zod for form handling and validation

## Out of Scope

- Budget line items within categories (Phase 8B - future)
- Linking line items to vendors (Phase 8B - future)
- Historical budget vs actual tracking over time
- Budget export/reporting functionality
- Budget templates or category presets
- Multi-currency support
