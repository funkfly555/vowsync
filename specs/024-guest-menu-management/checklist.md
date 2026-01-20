# Requirements Checklist: Guest Management Enhancement & Menu Configuration

**Feature**: 024-guest-menu-management
**Generated**: 2026-01-20

## User Stories

| ID | Priority | Story | Status |
|----|----------|-------|--------|
| US1 | P1 | Configure Wedding Menu Options | [ ] |
| US2 | P1 | Manage Guest Basic Information | [ ] |
| US3 | P1 | Track Guest RSVP Status | [ ] |
| US4 | P2 | Manage Guest Seating Assignments | [ ] |
| US5 | P1 | Record Guest Dietary Requirements | [ ] |
| US6 | P1 | Track Guest Meal Selections | [ ] |
| US7 | P2 | Manage Event Attendance | [ ] |
| US8 | P3 | Book Guest Shuttle Services | [ ] |

## Functional Requirements

### Menu Configuration (FR-001 to FR-005)
- [ ] FR-001: Menu page accessible from wedding navigation
- [ ] FR-002: Menu page displays 3 course sections (Appetizer, Main, Dessert)
- [ ] FR-003: Each course supports up to 5 meal options
- [ ] FR-004: Meal options have name (required) and description (optional)
- [ ] FR-005: Meal options support vegetarian flag indicator

### Guest Modal - Basic Info Tab (FR-006 to FR-010)
- [ ] FR-006: Guest modal has 7 tabs
- [ ] FR-007: Basic Info tab includes all required fields
- [ ] FR-008: Basic Info tab displays plus one status
- [ ] FR-009: Guest group assignment with predefined groups
- [ ] FR-010: Address field supports multi-line input

### Guest Modal - RSVP Tab (FR-011 to FR-014)
- [ ] FR-011: RSVP status options (Attending, Not Attending, Pending, No Response)
- [ ] FR-012: RSVP status change records timestamp
- [ ] FR-013: RSVP tab shows response history
- [ ] FR-014: "Not Attending" status indicates inactive state

### Guest Modal - Seating Tab (FR-015 to FR-017)
- [ ] FR-015: Table assignment dropdown available
- [ ] FR-016: Separate seating for guest and plus one
- [ ] FR-017: Table capacity warnings displayed

### Guest Modal - Dietary Tab (FR-018 to FR-021)
- [ ] FR-018: Standard restriction checkboxes
- [ ] FR-019: Free-text field for additional dietary notes
- [ ] FR-020: Allergy information field with severity
- [ ] FR-021: Severe allergies display visual warning

### Guest Modal - Meals Tab (FR-022 to FR-026)
- [ ] FR-022: Dropdowns for each course from menu options
- [ ] FR-023: "No Selection" option in dropdowns
- [ ] FR-024: Plus one meal selections displayed separately
- [ ] FR-025: Meal selections disabled when Not Attending
- [ ] FR-026: Menu page displays aggregated meal counts

### Guest Modal - Events Tab (FR-027 to FR-030)
- [ ] FR-027: Events list with invited/attending checkboxes
- [ ] FR-028: Plus one event attendance tracked separately
- [ ] FR-029: Event headcount updates in real-time
- [ ] FR-030: Event date and time shown

### Guest Modal - Shuttle Booking Tab (FR-031 to FR-035)
- [ ] FR-031: Available shuttle options displayed
- [ ] FR-032: Shuttle booking tracks pickup_location, shuttle_id, plus_one_included
- [ ] FR-033: Vehicle capacity and passenger count displayed
- [ ] FR-034: Capacity exceeded warning shown
- [ ] FR-035: Plus one shuttle booking independently toggleable

## Database Schema

### New Tables
- [ ] meal_options table created with RLS
- [ ] shuttle_vehicles table created with RLS
- [ ] shuttle_bookings table created with RLS

### Modified Tables
- [ ] guests.guest_group column added
- [ ] guests.address column added
- [ ] guests.dietary_restrictions column added
- [ ] guests.allergy_info column added
- [ ] guests.allergy_severity column added
- [ ] guests.rsvp_response_date column added
- [ ] guests.appetizer_selection column added
- [ ] guests.main_selection column added
- [ ] guests.dessert_selection column added
- [ ] guests.plus_one_appetizer_selection column added
- [ ] guests.plus_one_main_selection column added
- [ ] guests.plus_one_dessert_selection column added
- [ ] guest_event_attendance.plus_one_attending column added

## Success Criteria

- [ ] SC-001: Menu page creates 5 options per course with 100% success
- [ ] SC-002: Guest modal loads 7 tabs within 500ms
- [ ] SC-003: All guest fields save correctly with validation
- [ ] SC-004: Meal dropdowns populate from configured options
- [ ] SC-005: Event attendance counts accurate
- [ ] SC-006: Shuttle booking respects capacity with warnings
- [ ] SC-007: Plus one data tracked separately with 100% accuracy
- [ ] SC-008: RSVP timestamp recorded for all transitions
- [ ] SC-009: Mobile responsive at 375px width

## Edge Cases

- [ ] Menu option deletion with existing selections handled
- [ ] Plus one added after meal selections handled
- [ ] RSVP change from Attending to Not Attending handled
- [ ] Guest deletion with cascade confirmed
- [ ] Shuttle capacity exceeded with overbooking option
- [ ] Guests without plus ones see appropriate disabled state

## Technical Components

### UI Components
- [ ] TabGroup component for 7-tab modal
- [ ] MealOptionCard for menu configuration
- [ ] DietaryCheckboxGroup for dietary options
- [ ] ShuttleBookingCard for shuttle selection
- [ ] EventAttendanceList for event checkboxes

### API Endpoints
- [ ] GET/POST/PUT/DELETE /api/weddings/:id/meal-options
- [ ] GET /api/weddings/:id/meal-options/counts
- [ ] GET/POST/PUT/DELETE /api/weddings/:id/shuttle-vehicles
- [ ] GET/POST/PUT/DELETE /api/guests/:id/shuttle-booking
- [ ] PUT /api/guests/:id/meals
- [ ] PUT /api/guests/:id/dietary
- [ ] PUT /api/guests/:id/events/:eventId/attendance
