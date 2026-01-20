# Feature Specification: Guest Management Enhancement & Menu Configuration

**Feature Branch**: `024-guest-menu-management`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "Guest Management Enhancement & Menu Configuration - Menu page, enhanced guest modal with 7 tabs, meal tracking, event attendance, shuttle booking"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Wedding Menu Options (Priority: P1)

As a wedding consultant, I need to configure custom meal options for each wedding with 5 options per course (appetizer, main, dessert), so I can accurately track guest meal selections and provide final counts to the caterer.

**Why this priority**: Menu configuration is foundational - all meal tracking depends on having options configured first. This must be completed before guests can select meals.

**Independent Test**: Can be fully tested by navigating to the Menu page and creating/editing/deleting meal options for each course.

**Acceptance Scenarios**:

1. **Given** I am on the wedding Menu page, **When** I view the page, **Then** I see 3 course sections (Appetizer, Main, Dessert) with up to 5 meal options each
2. **Given** I am editing meal options, **When** I add a new option to a course, **Then** the option is saved with its name and optional description
3. **Given** I have configured meal options, **When** I delete an option, **Then** the option is removed and any guests who selected it show "No Selection"
4. **Given** I need to mark a vegetarian option, **When** I toggle the vegetarian flag on a meal option, **Then** the option displays with a vegetarian indicator

---

### User Story 2 - Manage Guest Basic Information (Priority: P1)

As a wedding consultant, I need to manage guest basic information including name, email, phone, address, group assignment, and personal notes, so I have complete contact details for each guest.

**Why this priority**: Basic guest information is the foundation for all guest management. Every other feature depends on guests existing with proper data.

**Independent Test**: Can be fully tested by opening the guest modal Basic Info tab and editing all fields.

**Acceptance Scenarios**:

1. **Given** I open the guest modal, **When** I am on the Basic Info tab, **Then** I see fields for first name, last name, email, phone, address, group, and notes
2. **Given** I am editing guest info, **When** I save changes, **Then** all fields are persisted correctly
3. **Given** a guest has a plus one, **When** I view basic info, **Then** I see the plus one indicator with their name if provided
4. **Given** I need to categorize guests, **When** I assign a group (e.g., "Bride's Family", "Groom's Friends"), **Then** the guest appears in that group for filtering

---

### User Story 3 - Track Guest RSVP Status (Priority: P1)

As a wedding consultant, I need to track RSVP status for each guest (Attending, Not Attending, Pending, No Response), so I can monitor response rates and follow up with non-responders.

**Why this priority**: RSVP tracking is essential for headcount planning and drives decisions for catering, seating, and logistics.

**Independent Test**: Can be fully tested by changing RSVP status for a guest and verifying the status persists.

**Acceptance Scenarios**:

1. **Given** I open the guest modal RSVP tab, **When** I view the tab, **Then** I see the current RSVP status with options: Attending, Not Attending, Pending, No Response
2. **Given** a guest responds, **When** I update their RSVP status, **Then** the status is saved and reflected in the guest list
3. **Given** I need to track response timing, **When** I update RSVP status, **Then** the response date is automatically recorded
4. **Given** a guest marks "Not Attending", **When** I view their profile, **Then** meal and seating sections show appropriate inactive/disabled state

---

### User Story 4 - Manage Guest Seating Assignments (Priority: P2)

As a wedding consultant, I need to assign guests to tables, so I can create and manage the seating chart for the reception.

**Why this priority**: Seating is important but can be managed later in the planning process. Does not block other guest management features.

**Independent Test**: Can be fully tested by assigning a guest to a table and verifying the assignment.

**Acceptance Scenarios**:

1. **Given** I open the guest modal Seating tab, **When** I view the tab, **Then** I see a table assignment dropdown with available tables
2. **Given** tables exist for the wedding, **When** I assign a guest to a table, **Then** the assignment is saved and the guest appears on that table's list
3. **Given** a guest has a plus one, **When** I assign seating, **Then** both the guest and plus one can be assigned together or separately
4. **Given** a table is at capacity, **When** I try to assign another guest, **Then** I see a warning that the table is full

---

### User Story 5 - Record Guest Dietary Requirements (Priority: P1)

As a wedding consultant, I need to record dietary requirements and allergies for each guest, so I can communicate special needs to the caterer.

**Why this priority**: Dietary information is critical for catering planning and must be captured alongside meal selections. Affects guest safety.

**Independent Test**: Can be fully tested by adding dietary notes and allergy information to a guest.

**Acceptance Scenarios**:

1. **Given** I open the guest modal Dietary tab, **When** I view the tab, **Then** I see fields for dietary restrictions and allergy information
2. **Given** a guest has allergies, **When** I enter allergy details, **Then** the information is saved and flagged visually in the guest list
3. **Given** I need standard dietary options, **When** I view the dietary tab, **Then** I see common checkboxes (Vegetarian, Vegan, Gluten-Free, Kosher, Halal) plus a free-text field
4. **Given** a guest has critical allergies, **When** I mark an allergy as severe, **Then** it displays with a warning indicator

---

### User Story 6 - Track Guest Meal Selections (Priority: P1)

As a wedding consultant, I need to track meal selections for each guest (appetizer, main, dessert) using the configured menu options, including plus one meals, so I can provide accurate counts to the caterer.

**Why this priority**: Meal tracking is a core feature that integrates with the menu configuration. Essential for catering management.

**Independent Test**: Can be fully tested by selecting meals for a guest and their plus one from configured options.

**Acceptance Scenarios**:

1. **Given** I open the guest modal Meals tab, **When** I view the tab, **Then** I see dropdowns for Appetizer, Main, and Dessert populated with configured menu options
2. **Given** a guest has a plus one, **When** I view the Meals tab, **Then** I see separate meal selection fields for the plus one
3. **Given** menu options are configured, **When** I select a meal option, **Then** the selection is saved and counted in the menu totals
4. **Given** I need to see meal counts, **When** I view the Menu page, **Then** I see aggregated counts per option (e.g., "Chicken: 45, Fish: 32, Vegetarian: 18")
5. **Given** a guest is marked "Not Attending", **When** I view their Meals tab, **Then** the selections are disabled/hidden

---

### User Story 7 - Manage Event Attendance (Priority: P2)

As a wedding consultant, I need to track which events each guest is invited to and attending, including plus one attendance, so I can plan event capacity and resources.

**Why this priority**: Event attendance tracking is important but uses existing infrastructure. Enhancement to existing functionality.

**Independent Test**: Can be fully tested by toggling event attendance for a guest and their plus one.

**Acceptance Scenarios**:

1. **Given** I open the guest modal Events tab, **When** I view the tab, **Then** I see a list of all wedding events with checkboxes for invited/attending
2. **Given** a guest has a plus one, **When** I view event attendance, **Then** I see separate checkboxes for plus one attendance per event
3. **Given** I mark a guest as attending an event, **When** I save, **Then** the attendance is recorded and event headcounts update
4. **Given** I view an event's details page, **When** I check attendance, **Then** I see accurate guest counts including plus ones

---

### User Story 8 - Book Guest Shuttle Services (Priority: P3)

As a wedding consultant, I need to book shuttle services for guests traveling from the ceremony to the reception, tracking pickup location, vehicle capacity, and plus one inclusion, so I can coordinate transportation logistics.

**Why this priority**: Shuttle booking is an optional feature not needed by all weddings. Enhancement that can be added after core features work.

**Independent Test**: Can be fully tested by creating a shuttle booking for a guest and their plus one.

**Acceptance Scenarios**:

1. **Given** I open the guest modal Shuttle Booking tab, **When** I view the tab, **Then** I see shuttle booking options with pickup locations
2. **Given** shuttle services are available, **When** I book a guest on a shuttle, **Then** the booking is saved with pickup location and vehicle assignment
3. **Given** a guest has a plus one, **When** I book shuttle service, **Then** I can include or exclude the plus one separately
4. **Given** I need to track vehicle capacity, **When** I view shuttle assignments, **Then** I see current passenger count vs. capacity
5. **Given** a shuttle is full, **When** I try to add another passenger, **Then** I see a warning and can choose another shuttle

---

### Edge Cases

- What happens when menu options are deleted after guests have selected them? Display "Option Removed" and prompt for new selection
- What happens when a plus one is added after meal selections? Plus one meals default to "No Selection"
- What happens when RSVP changes from Attending to Not Attending? Preserve meal/event data but mark as inactive
- What happens when a guest is deleted? Prompt for confirmation and cascade delete all related records
- What happens when shuttle capacity is exceeded? Show warning but allow overbooking with confirmation
- How does the system handle guests without plus ones viewing plus one fields? Show "No Plus One" indicator, fields disabled

## Requirements *(mandatory)*

### Functional Requirements

**Menu Configuration (FR-001 to FR-005)**
- **FR-001**: System MUST provide a dedicated Menu page accessible from wedding navigation
- **FR-002**: Menu page MUST display 3 course sections (Appetizer, Main, Dessert)
- **FR-003**: Each course MUST support up to 5 meal options
- **FR-004**: Each meal option MUST have a name (required) and description (optional)
- **FR-005**: Meal options MUST support a vegetarian flag indicator

**Guest Modal - Basic Info Tab (FR-006 to FR-010)**
- **FR-006**: Guest modal MUST have 7 tabs: Basic Info, RSVP, Seating, Dietary, Meals, Events, Shuttle Booking
- **FR-007**: Basic Info tab MUST include: first_name, last_name, email, phone, address, group, notes
- **FR-008**: Basic Info tab MUST display plus one status and name if applicable
- **FR-009**: Guest group assignment MUST use predefined groups (Bride's Family, Bride's Friends, Groom's Family, Groom's Friends, Mutual Friends, Work Colleagues, Other)
- **FR-010**: Address field MUST support multi-line input for full mailing address

**Guest Modal - RSVP Tab (FR-011 to FR-014)**
- **FR-011**: RSVP tab MUST display status options: Attending, Not Attending, Pending, No Response
- **FR-012**: RSVP status change MUST automatically record the response timestamp
- **FR-013**: RSVP tab MUST show response history if status has changed
- **FR-014**: "Not Attending" status MUST visually indicate inactive state in other tabs

**Guest Modal - Seating Tab (FR-015 to FR-017)**
- **FR-015**: Seating tab MUST show table assignment dropdown with available tables
- **FR-016**: System MUST support separate seating for guest and plus one
- **FR-017**: System MUST display table capacity warnings when assigning guests

**Guest Modal - Dietary Tab (FR-018 to FR-021)**
- **FR-018**: Dietary tab MUST include standard restriction checkboxes (Vegetarian, Vegan, Gluten-Free, Kosher, Halal, Dairy-Free, Nut-Free)
- **FR-019**: Dietary tab MUST include free-text field for additional dietary notes
- **FR-020**: Dietary tab MUST include allergy information field with severity indicator
- **FR-021**: Severe allergies MUST display visual warning indicator in guest list

**Guest Modal - Meals Tab (FR-022 to FR-026)**
- **FR-022**: Meals tab MUST display dropdowns for each course populated from configured menu options
- **FR-023**: Meals tab MUST include "No Selection" option in each dropdown
- **FR-024**: Plus one meal selections MUST be displayed separately when guest has a plus one
- **FR-025**: Meal selections MUST be disabled when guest RSVP is "Not Attending"
- **FR-026**: Menu page MUST display aggregated meal counts per option

**Guest Modal - Events Tab (FR-027 to FR-030)**
- **FR-027**: Events tab MUST list all wedding events with invited/attending checkboxes
- **FR-028**: Plus one event attendance MUST be tracked separately per event
- **FR-029**: Event attendance changes MUST update event headcount in real-time
- **FR-030**: Events tab MUST show event date and time alongside each event name

**Guest Modal - Shuttle Booking Tab (FR-031 to FR-035)**
- **FR-031**: Shuttle Booking tab MUST show available shuttle options with pickup locations
- **FR-032**: Shuttle booking MUST track pickup_location, shuttle_id, and plus_one_included flag
- **FR-033**: System MUST display vehicle capacity and current passenger count
- **FR-034**: System MUST warn when shuttle capacity is exceeded
- **FR-035**: Plus one shuttle booking MUST be toggleable independently

### Key Entities

- **MealOption**: Represents a configurable meal option with id, wedding_id, course_type, option_name, description, is_vegetarian, display_order
- **Guest**: Extended to include group, address, dietary restrictions, allergy information
- **GuestEventAttendance**: Extended to include plus_one_attending flag
- **ShuttleBooking**: New entity for tracking guest shuttle reservations
- **ShuttleVehicle**: New entity for managing shuttle vehicles and capacity

## Database Schema *(mandatory)*

### Existing Schema Analysis

The `guests` table already has:
- `name`, `email`, `phone`, `notes` - Basic info fields
- `dietary_restrictions` (TEXT), `allergies` (TEXT), `dietary_notes` (TEXT) - Dietary fields
- `starter_choice`, `main_choice`, `dessert_choice` (INTEGER 1-5) - Meal selection integers
- `invitation_status`, `attendance_confirmed`, `rsvp_*` fields - RSVP tracking
- `has_plus_one`, `plus_one_name`, `plus_one_confirmed` - Plus one tracking
- `table_number`, `table_position` - Seating fields

The `guest_event_attendance` table already has:
- `shuttle_to_event`, `shuttle_from_event` (TEXT) - Shuttle tracking fields

The `shuttle_transport` table already exists with:
- `wedding_id`, `event_id`, `transport_type`, `collection_location`, `dropoff_location`, `collection_time`, `number_of_guests`, `guest_names`, `shuttle_name`

### New Tables

**meal_options** (NEW - replaces integer-based meal selection with configurable options)
```sql
CREATE TABLE meal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  course_type TEXT NOT NULL CHECK (course_type IN ('appetizer', 'main', 'dessert')),
  option_number INTEGER NOT NULL CHECK (option_number >= 1 AND option_number <= 5),
  option_name TEXT NOT NULL,
  description TEXT,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_id, course_type, option_number)
);
```

### Modified Tables

**guests** (add new columns - preserving existing meal choice integers that reference meal_options.option_number)
```sql
-- New columns for enhanced guest management
ALTER TABLE guests ADD COLUMN IF NOT EXISTS guest_group TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS allergy_severity TEXT CHECK (allergy_severity IN ('none', 'mild', 'moderate', 'severe'));

-- Plus one meal selections (using same integer pattern as guest meals)
ALTER TABLE guests ADD COLUMN IF NOT EXISTS plus_one_starter_choice INTEGER CHECK (plus_one_starter_choice IS NULL OR plus_one_starter_choice >= 1 AND plus_one_starter_choice <= 5);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS plus_one_main_choice INTEGER CHECK (plus_one_main_choice IS NULL OR plus_one_main_choice >= 1 AND plus_one_main_choice <= 5);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS plus_one_dessert_choice INTEGER CHECK (plus_one_dessert_choice IS NULL OR plus_one_dessert_choice >= 1 AND plus_one_dessert_choice <= 5);
```

**guest_event_attendance** (add column for plus one tracking)
```sql
ALTER TABLE guest_event_attendance ADD COLUMN IF NOT EXISTS plus_one_attending BOOLEAN DEFAULT FALSE;
```

### Schema Notes

- Meal selections use INTEGER (1-5) referencing `meal_options.option_number` for the same wedding/course
- This maintains backward compatibility with existing `starter_choice`, `main_choice`, `dessert_choice` fields
- The `shuttle_transport` table already handles shuttle logistics at the wedding/event level
- Individual guest shuttle assignment uses `guest_event_attendance.shuttle_to_event` and `shuttle_from_event` TEXT fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Menu page allows creating 5 meal options per course (15 total) with 100% save success rate
- **SC-002**: Guest modal loads all 7 tabs within 500ms without errors
- **SC-003**: All guest fields (20+ fields across tabs) save correctly with validation
- **SC-004**: Meal selection dropdowns populate from configured options with 0 stale data
- **SC-005**: Event attendance counts accurate to within 0 errors compared to manual count
- **SC-006**: Shuttle booking respects capacity with warning shown 100% of time when exceeded
- **SC-007**: Plus one data tracked separately for meals, events, and shuttle with 100% accuracy
- **SC-008**: RSVP status changes recorded with timestamp for all status transitions
- **SC-009**: Mobile responsive design functional for all 7 tabs at 375px width

## Assumptions

- Wedding tables already exist in the database (from seating feature) or will be created by user
- Shuttle vehicles will be configured separately by the consultant before booking
- Guest groups are predefined and not user-configurable in this phase
- Plus one name and attendance are already tracked in the guests table
- The existing guest list and modal infrastructure will be extended, not replaced
- All data uses snake_case column names per Supabase conventions
- RLS policies will be applied to new tables matching existing patterns

## Technical Notes

### UI Components Needed
- TabGroup component for 7-tab modal layout
- MealOptionCard for menu configuration
- DietaryCheckboxGroup for standard dietary options
- ShuttleBookingCard for shuttle selection
- EventAttendanceList for event checkboxes

### API Endpoints Needed
- GET/POST/PUT/DELETE `/api/weddings/:id/meal-options`
- GET `/api/weddings/:id/meal-options/counts` (aggregated selection counts)
- GET/POST/PUT/DELETE `/api/weddings/:id/shuttle-vehicles`
- GET/POST/PUT/DELETE `/api/guests/:id/shuttle-booking`
- PUT `/api/guests/:id/meals` (meal selections)
- PUT `/api/guests/:id/dietary` (dietary info)
- PUT `/api/guests/:id/events/:eventId/attendance` (event attendance with plus one)

### Integration Points
- Menu options must be configured before guest meal selection works
- Shuttle vehicles must exist before shuttle booking works
- Event list comes from existing events table
- Table list comes from existing tables/seating infrastructure
