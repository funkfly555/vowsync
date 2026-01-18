# Feature Specification: Dashboard Data Settings Fix

**Feature Branch**: `020-dashboard-settings-fix`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Dashboard Data Settings Fix - Fix dashboard to display accurate real-time data from database and implement settings page with currency/timezone preferences"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate Guest Count Display (Priority: P1) 🎯 MVP

As a wedding consultant, I want to see the actual guest counts from my database when I view the wedding dashboard, so that I can trust the numbers and make informed decisions.

**Why this priority**: Guest count is the most fundamental metric for wedding planning. Inaccurate guest counts lead to wrong catering orders, seating arrangements, and budget calculations.

**Independent Test**: Navigate to wedding dashboard and verify Guest Count card shows actual counts from the guests table, matching what's displayed on the Guests page.

**Acceptance Scenarios**:

1. **Given** a wedding with 25 adults and 5 children in the guests table, **When** I view the dashboard, **Then** the Guest Count card shows "Adults: 25", "Children: 5", "Total: 30"
2. **Given** a wedding with no guests, **When** I view the dashboard, **Then** the Guest Count card shows "Adults: 0", "Children: 0", "Total: 0" with "No guests yet" subtitle
3. **Given** a guest is added/deleted on the Guests page, **When** I return to the dashboard, **Then** the counts are updated accordingly

---

### User Story 2 - Accurate Vendor Count Display (Priority: P1) 🎯 MVP

As a wedding consultant, I want to see the actual vendor count and pending payments from my database, so that I can track my vendor relationships accurately.

**Why this priority**: Vendor management is critical for wedding coordination. Knowing how many vendors are assigned and payment status prevents missed payments and service gaps.

**Independent Test**: Navigate to wedding dashboard and verify Vendors card shows actual counts from vendors and vendor_payment_schedule tables.

**Acceptance Scenarios**:

1. **Given** a wedding with 5 vendors and 3 pending payments, **When** I view the dashboard, **Then** the Vendors card shows "Total: 5" and "Pending Payments: 3"
2. **Given** a wedding with no vendors, **When** I view the dashboard, **Then** the Vendors card shows "Total: 0" and "Pending Payments: 0"
3. **Given** a vendor payment is marked as paid, **When** I return to the dashboard, **Then** the pending payments count decreases by 1

---

### User Story 3 - Accurate Task Summary Display (Priority: P2)

As a wedding consultant, I want to see the actual task counts categorized by status, so that I can quickly assess my workload.

**Why this priority**: Task visibility helps consultants prioritize work. While not as critical as guest/vendor data, it improves daily workflow efficiency.

**Independent Test**: Navigate to wedding dashboard and verify an "Upcoming Tasks" section shows real task counts from pre_post_wedding_tasks table.

**Acceptance Scenarios**:

1. **Given** a wedding with 10 tasks (3 pending, 5 in_progress, 2 completed), **When** I view the dashboard, **Then** I see task breakdown with correct counts
2. **Given** a wedding with no tasks, **When** I view the dashboard, **Then** the Tasks section shows "No tasks yet" or similar empty state
3. **Given** the task counts reflect tasks for the next 7 days by default

---

### User Story 4 - Currency Settings (Priority: P2)

As a wedding consultant, I want to set my preferred currency in the settings page, so that all monetary values are displayed consistently throughout the application.

**Why this priority**: Currency consistency is important for South African wedding consultants (default ZAR) but the app may be used in other regions.

**Independent Test**: Navigate to Settings, change currency preference, return to dashboard and verify budget amounts are formatted with the selected currency symbol.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I select "ZAR - South African Rand", **Then** the currency is saved and dashboard shows "R" prefix for budget values
2. **Given** I have set currency to USD, **When** I view any budget values, **Then** they display with "$" prefix
3. **Given** no currency preference is set, **When** I view the dashboard, **Then** ZAR (R) is used as the default

---

### User Story 5 - Timezone Settings (Priority: P3)

As a wedding consultant, I want to set my timezone in the settings page, so that all date/time displays are accurate for my location.

**Why this priority**: Lower priority as most VowSync users are in a single timezone (South Africa), but important for international weddings or consultants.

**Independent Test**: Navigate to Settings, change timezone preference, and verify event times are displayed in the selected timezone.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I select "Africa/Johannesburg" timezone, **Then** the preference is saved
2. **Given** I have set a timezone, **When** I view event times, **Then** they are displayed in my selected timezone
3. **Given** no timezone is set, **When** I view times, **Then** the browser's local timezone is used as default

---

### User Story 6 - Settings Page Navigation (Priority: P2)

As a wedding consultant, I want to access a Settings page from the navigation drawer, so that I can manage my preferences.

**Why this priority**: Required infrastructure for currency/timezone settings to function.

**Independent Test**: Click on "Settings" in the navigation drawer and verify the Settings page loads with user preferences.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I click "Settings" in the navigation, **Then** I am taken to /settings page
2. **Given** I am on any page, **When** I access settings, **Then** I see my current preferences pre-populated
3. **Given** I save settings, **When** the save completes, **Then** I see a success toast notification

---

### Edge Cases

- What happens when database queries fail? → Show error state with retry button
- What happens when guests table has no guest_type field populated? → Count all as adults by default
- What happens when vendor_payment_schedule has no entries for a vendor? → Show 0 pending payments
- What happens when user has no preferences saved? → Use defaults (ZAR, browser timezone)
- What happens when currency code is invalid? → Fall back to ZAR

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dashboard MUST query guests table and aggregate by guest_type (adult/child) for accurate counts
- **FR-002**: Dashboard MUST query vendors table for total vendor count per wedding
- **FR-003**: Dashboard MUST query vendor_payment_schedule table for pending payment count (status = 'pending' OR status = 'overdue')
- **FR-004**: Dashboard MUST query pre_post_wedding_tasks table for task counts by status
- **FR-005**: System MUST persist user currency preference in users.preferences JSONB column
- **FR-006**: System MUST persist user timezone preference in users.preferences JSONB column
- **FR-007**: System MUST format all monetary values using the user's selected currency
- **FR-008**: Settings page MUST be accessible via navigation drawer at /settings route
- **FR-009**: Default currency MUST be ZAR (South African Rand, symbol "R")
- **FR-010**: Default timezone MUST be the browser's local timezone

### Key Entities

- **users.preferences**: JSONB column storing `{ currency: "ZAR", timezone: "Africa/Johannesburg" }`
- **guests**: Source for guest counts, grouped by guest_type
- **vendors**: Source for vendor count per wedding
- **vendor_payment_schedule**: Source for pending payments (status IN ('pending', 'overdue'))
- **pre_post_wedding_tasks**: Source for task summary counts by status

### Currency Configuration

| Code | Symbol | Name | Format Example |
|------|--------|------|----------------|
| ZAR | R | South African Rand | R 1,234.56 |
| USD | $ | US Dollar | $1,234.56 |
| EUR | € | Euro | €1,234.56 |
| GBP | £ | British Pound | £1,234.56 |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Guest counts on dashboard match actual counts from guests table within 1 second of page load
- **SC-002**: Vendor counts and pending payments match database values accurately
- **SC-003**: Task counts reflect actual data from pre_post_wedding_tasks table
- **SC-004**: Currency formatting applies consistently across all dashboard monetary values
- **SC-005**: Settings changes persist across sessions (page refresh maintains preference)
- **SC-006**: Settings page loads within 2 seconds
- **SC-007**: 100% of monetary values use user's selected currency symbol
- **SC-008**: No hardcoded values (all stats pull from database queries)

### Technical Validation

- TypeScript strict mode passes with no errors
- Production build completes successfully
- TanStack Query caches are invalidated appropriately when data changes
- No console errors on Settings page or Dashboard

## Design References

### Dashboard Stats Grid (Existing)
- 2x2 grid layout with cards: Guest Count, Budget Summary, Events, Vendors
- Each card has emoji icon, title, subtitle, and content area
- Progress bar for budget card showing percentage

### Settings Page (New)
- Clean form layout consistent with existing form patterns
- Shadcn/ui Select components for currency and timezone dropdowns
- Save button with loading state
- Success/error toast notifications using Sonner

### Currency Display
- Currency symbol prefix (R, $, €, £) followed by formatted number
- Thousands separator appropriate for locale
- Two decimal places for monetary values

## Routing

| Route | Component | Description |
|-------|-----------|-------------|
| /settings | SettingsPage | User preferences management |

## Out of Scope

- Multi-currency conversion (just display formatting)
- Timezone conversion for historical data
- User profile management beyond preferences
- Notification preferences
- Language/localization settings
