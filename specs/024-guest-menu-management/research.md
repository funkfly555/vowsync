# Research: Guest Management Enhancement & Menu Configuration

**Feature**: 024-guest-menu-management
**Date**: 2026-01-20
**Status**: Complete

## Research Summary

All technical decisions have been resolved through the provided PRD and database schema analysis.

---

## Decision 1: Database Field Naming Convention

**Decision**: Use snake_case for all database fields

**Rationale**:
- Supabase/PostgreSQL convention is snake_case
- Existing tables (guests, guest_event_attendance) already use snake_case
- TypeScript interfaces can use camelCase with automatic mapping

**Alternatives Considered**:
- camelCase throughout → Rejected: conflicts with existing database structure

---

## Decision 2: Meal Selection Storage Pattern

**Decision**: Use INTEGER (1-5) for meal selections referencing `meal_options.option_number`

**Rationale**:
- Existing `starter_choice`, `main_choice`, `dessert_choice` fields already use INTEGER 1-5
- Maintains backward compatibility with existing data
- Simpler queries without UUID joins
- `meal_options` table provides lookup for meal names per wedding

**Alternatives Considered**:
- UUID foreign key to meal_options.id → Rejected: breaks existing data pattern, more complex queries
- JSON storage of meal selections → Rejected: less queryable, harder to aggregate counts

---

## Decision 3: Plus One Meal Tracking

**Decision**: Add parallel columns to guests table: `plus_one_starter_choice`, `plus_one_main_choice`, `plus_one_dessert_choice`

**Rationale**:
- Consistent with primary guest meal selection pattern
- Simple to query and update
- No additional junction tables needed
- Null values when guest has no plus one

**Alternatives Considered**:
- Separate plus_one_meals junction table → Rejected: over-engineering for simple 3-field data
- JSON column for plus one data → Rejected: less queryable, harder to validate

---

## Decision 4: Shuttle Booking Storage

**Decision**: Extend `guest_event_attendance` table with new shuttle columns

**Rationale**:
- Shuttle bookings are per-guest-per-event (existing relationship)
- Avoids new junction tables
- Keeps all event-related guest data in one place
- Legacy `shuttle_to_event` and `shuttle_from_event` TEXT fields preserved for backward compatibility

**New Fields**:
- `shuttle_to_event_time` (TIME)
- `shuttle_to_event_pickup_location` (TEXT)
- `shuttle_from_event_time` (TIME)
- `shuttle_from_event_pickup_location` (TEXT)
- `plus_one_shuttle_to_event_time` (TIME)
- `plus_one_shuttle_to_event_pickup_location` (TEXT)
- `plus_one_shuttle_from_event_time` (TIME)
- `plus_one_shuttle_from_event_pickup_location` (TEXT)

**Alternatives Considered**:
- New shuttle_bookings table → Rejected: adds complexity, existing table already has shuttle fields
- Using existing shuttle_transport table → Rejected: that table is for wedding-level shuttle logistics, not individual guest bookings

---

## Decision 5: Guest Modal Tab Structure

**Decision**: 7 tabs with icons, 768px max-width modal

**Rationale**:
- Current 600px too narrow for 7 tabs
- 768px provides comfortable space for tab labels + icons
- Tab order follows logical workflow: Basic Info → RSVP → Seating → Dietary → Meals → Events → Shuttle

**Tab Order**:
1. Basic Info (User icon) - core identity
2. RSVP (Mail icon) - response tracking, moved invitation_status here
3. Seating (Armchair icon) - table assignment
4. Dietary (Utensils icon) - food restrictions
5. Meals (UtensilsCrossed icon) - meal selections
6. Events (Calendar icon) - event attendance
7. Shuttle Booking (Bus icon) - transportation

**Alternatives Considered**:
- Collapsible sections instead of tabs → Rejected: harder to navigate, more scrolling
- 5 tabs with combined sections → Rejected: tabs become too overloaded

---

## Decision 6: Menu Configuration Page Design

**Decision**: Single page with 3 course sections, 5 option rows each

**Rationale**:
- Simple, scannable layout
- Matches database constraint (5 options per course)
- Auto-save or save-all button pattern
- Course sections: Starters, Main Courses, Desserts

**Fields per Meal Option**:
- meal_name (required, max 100 chars)
- description (optional, max 500 chars)
- dietary_info (optional, max 100 chars)

**Alternatives Considered**:
- Inline editing in a table → Rejected: less intuitive for data entry
- Separate pages per course → Rejected: unnecessary navigation

---

## Decision 7: Course Type Naming

**Decision**: Use 'starter', 'main', 'dessert' for course_type enum

**Rationale**:
- Matches existing guest fields: `starter_choice`, `main_choice`, `dessert_choice`
- Clear, unambiguous naming
- Consistent with PRD specifications

**Alternatives Considered**:
- 'appetizer' instead of 'starter' → Rejected: existing fields use 'starter'
- Numeric course ordering → Rejected: less readable

---

## Decision 8: Invitation Status Field Location

**Decision**: Move `invitation_status` from Basic Info tab to RSVP tab

**Rationale**:
- Invitation status is part of the RSVP workflow
- Groups all response-related fields together
- Basic Info tab focuses on identity/contact information

---

## Decision 9: Plus One Attendance Tracking

**Decision**: Add `plus_one_attending` boolean to `guest_event_attendance` table

**Rationale**:
- Tracks plus one attendance separately from primary guest
- Enables accurate headcount per event
- Controls shuttle booking visibility for plus one

**Alternatives Considered**:
- Separate attendance record for plus one → Rejected: plus one doesn't have own guest record
- JSON array of attendees → Rejected: harder to query and aggregate

---

## Decision 10: API/Hook Patterns

**Decision**: Follow existing VowSync patterns for hooks and Supabase queries

**Rationale**:
- Consistency with codebase (useGuests, useVendors patterns)
- TanStack Query v5 for server state
- Zod schemas for validation
- React Hook Form for form management

**New Hooks Needed**:
- `useMealOptions(weddingId)` - fetch meal options
- `useMealOptionMutations()` - CRUD for meal options
- Update `useGuest` to include plus one meal fields
- Update `useGuestEventAttendance` to include shuttle and plus one fields

---

## Technical Stack Confirmation

All decisions align with VowSync Constitution:

| Requirement | Implementation |
|-------------|----------------|
| React 18+ | Yes - existing setup |
| TypeScript strict | Yes - existing setup |
| Tailwind CSS | Yes - existing setup |
| Shadcn/ui | Yes - Tabs, Input, Select, Checkbox, Button, Card components |
| Supabase | Yes - all data storage |
| React Hook Form | Yes - for all forms |
| Zod | Yes - for all validation |
| TanStack Query | Yes - for server state |
| Lucide React | Yes - for all icons |

---

## Open Questions (RESOLVED)

| Question | Resolution |
|----------|------------|
| How to handle meal option deletion with existing selections? | Display "Option Removed" in dropdown, preserve integer value |
| Should shuttle times be relative or absolute? | Absolute TIME values with pickup location TEXT |
| How to handle RSVP "Not Attending" state in Meals tab? | Disable meal selection dropdowns, show "Not Attending" message |
| Maximum modal width for 7 tabs? | 768px (increased from 600px) |
| Course type naming convention? | 'starter', 'main', 'dessert' to match existing fields |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Migration could fail on existing data | Using ADD COLUMN IF NOT EXISTS, preserving existing fields |
| Meal options not configured before guest selections | Show "Option 1-5" fallback labels in dropdowns |
| Plus one shuttle without plus one attendance | Shuttle tab only shows events where plus_one_attending = true |
| Tab overflow on mobile | Responsive design with horizontal scroll or dropdown for mobile |

---

## Dependencies

### External Dependencies (Existing)
- Supabase client (already configured)
- TanStack Query v5 (already installed)
- React Hook Form (already installed)
- Zod (already installed)
- Shadcn/ui components (already installed)
- Lucide React icons (already installed)
- date-fns (already installed)

### Internal Dependencies
- Existing guests table and useGuests hook
- Existing events table and useEvents hook
- Existing guest_event_attendance table
- Existing sidebar navigation component
- Existing guest modal structure

---

## Conclusion

All technical decisions have been resolved. The implementation can proceed with:

1. Database migration for meal_options table and column additions
2. Menu Management page with 3 course sections
3. Enhanced Guest Modal with 7 tabs
4. Updated Meals tab with plus one section
5. New Events tab for attendance selection
6. New Shuttle Booking tab for transportation management
