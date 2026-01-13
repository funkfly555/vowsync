# Feature Specification: Database Schema Foundation

**Feature Branch**: `001-database-schema-foundation`
**Created**: 2025-01-13
**Status**: Draft
**Input**: User description: "Create complete Supabase PostgreSQL database schema with 30+ tables, Row Level Security (RLS), triggers, functions, and seed data for wedding planning SaaS platform."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultant Creates a Wedding (Priority: P1)

As a wedding consultant, I need to create and manage wedding records so I can track all details for each client's wedding event.

**Why this priority**: The wedding entity is the core of the entire platform. All other features (guests, vendors, events, budget) depend on weddings existing first. Without this, no other functionality works.

**Independent Test**: Can be fully tested by creating a wedding record via the database dashboard and verifying all required fields are stored correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in consultant, **When** they create a new wedding with bride/groom names and date, **Then** the system stores the wedding with a unique ID and links it to the consultant
2. **Given** a wedding record exists, **When** the consultant updates any field, **Then** the updated_at timestamp automatically refreshes
3. **Given** multiple consultants exist, **When** one consultant queries weddings, **Then** they only see weddings they created (RLS enforcement)
4. **Given** a wedding has a status, **When** set to an invalid value, **Then** the database rejects the entry with a constraint error

---

### User Story 2 - Consultant Manages Multiple Events per Wedding (Priority: P1)

As a wedding consultant, I need to create multiple events (ceremony, reception, rehearsal dinner, etc.) for each wedding so I can plan complex multi-day celebrations.

**Why this priority**: Most weddings have multiple events. Events are the organizational unit for guests, vendors, staffing, and logistics. This is foundational.

**Independent Test**: Can be fully tested by creating events for a wedding and verifying event order, duration calculations, and date/time handling.

**Acceptance Scenarios**:

1. **Given** a wedding exists, **When** the consultant creates events (1-10), **Then** each event is linked to the wedding with proper ordering
2. **Given** an event has start_time and end_time, **When** saved, **Then** the duration_hours is automatically calculated
3. **Given** an event belongs to a wedding, **When** a different consultant queries events, **Then** they cannot see it (RLS via wedding ownership)

---

### User Story 3 - Consultant Manages Guest List (Priority: P1)

As a wedding consultant, I need to manage a comprehensive guest list with RSVP tracking, dietary requirements, and meal selections so I can ensure accurate headcounts and catering.

**Why this priority**: Guest management is critical for catering, seating, and transportation planning. Guest counts drive budget calculations.

**Independent Test**: Can be fully tested by adding guests, setting dietary restrictions, and verifying RSVP status tracking.

**Acceptance Scenarios**:

1. **Given** a wedding exists, **When** the consultant adds guests, **Then** each guest is linked to the wedding with all required fields
2. **Given** a guest has dietary restrictions, **When** saved, **Then** the restrictions are stored and retrievable
3. **Given** a guest has meal selections (starter/main/dessert), **When** choices are made (1-5 options), **Then** selections are constrained to valid values
4. **Given** guests attend multiple events, **When** attendance is tracked per event, **Then** the junction table correctly links guests to events

---

### User Story 4 - Consultant Tracks Vendors and Payments (Priority: P2)

As a wedding consultant, I need to manage vendor contracts, contacts, and payment schedules so I can ensure timely payments and valid insurance/contracts.

**Why this priority**: Vendor management is essential for wedding execution but depends on weddings existing. Payment tracking prevents missed deadlines.

**Independent Test**: Can be fully tested by creating vendors, adding contacts, setting up payment milestones, and recording invoices.

**Acceptance Scenarios**:

1. **Given** a wedding exists, **When** the consultant adds a vendor, **Then** vendor details including contract and insurance info are stored
2. **Given** a vendor exists, **When** multiple contacts are added, **Then** one can be marked as primary and one as onsite contact
3. **Given** a payment schedule exists, **When** payments are made, **Then** status updates from pending to paid with date and reference
4. **Given** an invoice is created, **When** amount and VAT are entered, **Then** total is automatically calculated (generated column)

---

### User Story 5 - Consultant Plans Bar Orders (Priority: P2)

As a wedding consultant, I need to calculate beverage requirements based on guest counts and event duration so I can order the correct quantities.

**Why this priority**: Bar orders involve complex calculations that need to be accurate. This depends on events and guest counts being available.

**Independent Test**: Can be fully tested by creating bar orders with item percentages and verifying calculated servings and unit quantities.

**Acceptance Scenarios**:

1. **Given** an event exists, **When** a bar order is created, **Then** it links to the event with guest counts and duration
2. **Given** bar order items have percentages, **When** calculated, **Then** the total percentages must be between 90-110%
3. **Given** servings per person and units needed, **When** calculated, **Then** units are rounded up correctly (ROUNDUP formula)

---

### User Story 6 - Consultant Manages Equipment and Repurposing (Priority: P2)

As a wedding consultant, I need to track furniture/equipment quantities across events and plan item movement between venues so nothing is forgotten.

**Why this priority**: Equipment tracking prevents shortages. Repurposing instructions ensure items move correctly between multi-event weddings.

**Independent Test**: Can be fully tested by creating items, assigning quantities per event, and creating repurposing instructions.

**Acceptance Scenarios**:

1. **Given** a wedding item exists, **When** quantities are assigned per event, **Then** total_required is calculated (ADD or MAX method)
2. **Given** equipment needs to move between events, **When** repurposing instructions are created, **Then** pickup and dropoff details are recorded
3. **Given** repurposing times, **When** pickup_time >= dropoff_time, **Then** the system validates the constraint

---

### User Story 7 - Consultant Tracks Budget (Priority: P2)

As a wedding consultant, I need to track budget categories and line items with projected vs actual costs so I can monitor spending and identify variances.

**Why this priority**: Budget tracking is critical for financial management but depends on weddings and vendors existing.

**Independent Test**: Can be fully tested by creating budget categories, adding line items, and verifying variance calculations.

**Acceptance Scenarios**:

1. **Given** a wedding exists, **When** budget categories are created, **Then** projected and actual amounts can be tracked
2. **Given** projected and actual amounts, **When** saved, **Then** variance is automatically calculated (actual - projected)
3. **Given** budget totals change, **When** line items are updated, **Then** wedding budget totals are recalculated

---

### User Story 8 - System Enforces Data Isolation (Priority: P1)

As a platform operator, I need to ensure consultants can only access their own wedding data so client information remains private and secure.

**Why this priority**: Security is non-negotiable. Data isolation via RLS is the foundation of multi-tenant security.

**Independent Test**: Can be fully tested by authenticating as different users and verifying query results only return owned data.

**Acceptance Scenarios**:

1. **Given** RLS is enabled on all tables, **When** a consultant queries any table, **Then** only records linked to their weddings are returned
2. **Given** a child table (guests, vendors), **When** queried, **Then** ownership is verified via EXISTS subquery to weddings
3. **Given** an admin user, **When** they query any table, **Then** they can see all records (admin bypass)
4. **Given** RLS policies exist, **When** INSERT/UPDATE/DELETE operations occur, **Then** the same ownership rules apply

---

### User Story 9 - Consultant Manages Additional Services (Priority: P3)

As a wedding consultant, I need to track staff requirements, transportation, stationery, beauty services, and accommodation so I can coordinate all aspects of the wedding.

**Why this priority**: These are supporting features that enhance the platform but are not critical for initial functionality.

**Independent Test**: Can be fully tested by creating records in each service table and verifying relationships.

**Acceptance Scenarios**:

1. **Given** an event exists, **When** staff requirements are set, **Then** total_staff is automatically calculated from role counts
2. **Given** shuttle transport is planned, **When** guest lists are assigned, **Then** collection and dropoff details are tracked
3. **Given** stationery items exist, **When** quantity and unit cost are set, **Then** total_cost is calculated automatically

---

### User Story 10 - System Provides Audit Trail (Priority: P3)

As a platform operator, I need activity logging and notifications so users can track changes and receive important alerts.

**Why this priority**: Audit trails and notifications are important for compliance and user experience but not blocking for core functionality.

**Independent Test**: Can be fully tested by performing operations and verifying activity log entries are created.

**Acceptance Scenarios**:

1. **Given** any data change occurs, **When** logged, **Then** the activity_log records user, action, entity, and changes
2. **Given** important events occur, **When** notifications are generated, **Then** users see them with appropriate priority
3. **Given** an email campaign is sent, **When** recipients receive emails, **Then** delivery and engagement metrics are tracked

---

### Edge Cases

- What happens when a wedding is deleted? All child records (events, guests, vendors) must cascade delete
- What happens when a vendor is referenced by budget line items? The reference is set to NULL, not cascade deleted
- What happens when invalid enum values are inserted? Check constraints reject the insert with clear error
- What happens when RLS is bypassed? All queries without valid auth token return empty results
- What happens when events overlap in time? The system allows this (valid for multi-venue weddings)
- What happens when bar order percentages don't total 90-110%? The system flags this as a validation warning (not hard constraint)

## Requirements *(mandatory)*

### Functional Requirements

#### Core Infrastructure
- **FR-001**: System MUST enable UUID generation extension for unique identifiers
- **FR-002**: System MUST enable fuzzy text search extension for search functionality
- **FR-003**: System MUST use UTC timezone for all timestamp storage
- **FR-004**: System MUST auto-update `updated_at` timestamps via triggers on all tables

#### User Management
- **FR-005**: System MUST store user profiles extending authentication with role (consultant/admin/viewer)
- **FR-006**: System MUST support user preferences storage in flexible format

#### Wedding & Events
- **FR-007**: System MUST support weddings with status tracking (planning/confirmed/completed/cancelled)
- **FR-008**: System MUST support 1-10 events per wedding with ordering
- **FR-009**: System MUST auto-calculate event duration from start and end times
- **FR-010**: System MUST track guest counts (adults/children) at wedding level

#### Guest Management
- **FR-011**: System MUST support guest types (adult/child/vendor/staff)
- **FR-012**: System MUST track RSVP status with deadline and response tracking
- **FR-013**: System MUST support plus-one guests with confirmation status
- **FR-014**: System MUST track seating assignments (table number/position)
- **FR-015**: System MUST store dietary restrictions, allergies, and notes
- **FR-016**: System MUST support meal selections (starter/main/dessert) with 1-5 choices each
- **FR-017**: System MUST track guest attendance per event via junction table
- **FR-018**: System MUST track shuttle requirements per event per guest

#### Vendor Management
- **FR-019**: System MUST store vendor details with contract information
- **FR-020**: System MUST track insurance verification and expiry
- **FR-021**: System MUST store banking details for payments
- **FR-022**: System MUST support multiple contacts per vendor with primary/onsite flags
- **FR-023**: System MUST track milestone-based payment schedules
- **FR-024**: System MUST track invoices with auto-calculated totals (amount + VAT)
- **FR-025**: System MUST support payment status tracking (pending/paid/overdue/cancelled)

#### Beverage Management
- **FR-026**: System MUST provide item catalog with categories
- **FR-027**: System MUST calculate bar orders based on guest counts and duration
- **FR-028**: System MUST validate bar order item percentages total appropriately

#### Equipment Management
- **FR-029**: System MUST track equipment quantities per event
- **FR-030**: System MUST calculate totals using ADD or MAX aggregation methods
- **FR-031**: System MUST support repurposing instructions between events
- **FR-032**: System MUST track repurposing status and completion timestamps

#### Additional Services
- **FR-033**: System MUST calculate total staff from role-based requirements
- **FR-034**: System MUST track shuttle transport with collection/dropoff details
- **FR-035**: System MUST calculate stationery total costs
- **FR-036**: System MUST track beauty service appointments
- **FR-037**: System MUST manage cottage accommodation and room assignments
- **FR-038**: System MUST track shopping list items with purchase status

#### Budget Management
- **FR-039**: System MUST track budget categories with projected/actual amounts
- **FR-040**: System MUST auto-calculate variance (actual - projected)
- **FR-041**: System MUST track budget line items linked to vendors
- **FR-042**: System MUST track payment status per line item

#### Task Management
- **FR-043**: System MUST support task types (delivery/collection/appointment/general/milestone)
- **FR-044**: System MUST track task priority (low/medium/high/critical)
- **FR-045**: System MUST track pre-wedding and post-wedding tasks with day offsets

#### File Management
- **FR-046**: System MUST support file attachments linked to any entity
- **FR-047**: System MUST support file versioning with latest flag
- **FR-048**: System MUST enforce file size limits (10MB max)
- **FR-049**: System MUST restrict file types (PDF/JPG/PNG/DOCX/XLSX)

#### Email System
- **FR-050**: System MUST support reusable email templates with variables
- **FR-051**: System MUST track email campaigns with delivery metrics
- **FR-052**: System MUST log individual email delivery and engagement

#### Notifications & Audit
- **FR-053**: System MUST support in-app notifications with priority levels
- **FR-054**: System MUST track notification read status
- **FR-055**: System MUST log all data changes with before/after values
- **FR-056**: System MUST record user agent and IP for audit entries

#### Security (Critical)
- **FR-057**: System MUST enable Row Level Security on ALL tables
- **FR-058**: System MUST restrict access to wedding owner (consultant_id = auth.uid())
- **FR-059**: System MUST verify child table access via parent wedding ownership
- **FR-060**: System MUST allow admin users to view all data
- **FR-061**: System MUST apply RLS to file storage bucket
- **FR-062**: System MUST prevent access to data without valid authentication

#### Data Integrity
- **FR-063**: System MUST use check constraints for all enum values
- **FR-064**: System MUST cascade delete child records when parent is deleted
- **FR-065**: System MUST set NULL for optional references when target is deleted
- **FR-066**: System MUST enforce NOT NULL on required fields
- **FR-067**: System MUST enforce UNIQUE constraints where appropriate

### Key Entities

- **User**: Wedding consultant or admin who accesses the platform. Has role, profile info, preferences.
- **Wedding**: Core entity representing a client's wedding. Links to consultant. Contains date, names, budget totals, status.
- **Event**: A specific occasion within a wedding (ceremony, reception, etc.). Has order, timing, location.
- **Guest**: Person invited to the wedding. Has contact info, RSVP status, dietary needs, meal choices.
- **Guest Event Attendance**: Junction linking guests to events with attendance and shuttle flags.
- **Vendor**: Service provider for the wedding. Has contract, insurance, banking details.
- **Vendor Contact**: Contact person at a vendor. Has role, contact info, primary/onsite flags.
- **Vendor Payment Schedule**: Milestone payment for a vendor. Has amount, due date, status.
- **Vendor Invoice**: Invoice from vendor. Has amounts, VAT, total, status.
- **Catalog Category**: Category for items in the catalog (beverages, equipment).
- **Catalog Item**: Item available for ordering. Has unit info, serving sizes, cost.
- **Bar Order**: Beverage order for an event. Has guest counts, calculated quantities.
- **Bar Order Item**: Specific item in a bar order with percentage and calculated units.
- **Wedding Item**: Furniture/equipment for a wedding. Has aggregation method, costs.
- **Wedding Item Event Quantity**: Quantity of item needed per event.
- **Repurposing Instruction**: Instructions for moving items between events.
- **Staff Requirements**: Staffing needs per event by role.
- **Shuttle Transport**: Transportation arrangements for guests.
- **Stationery Item**: Print materials for wedding.
- **Beauty Service**: Hair/makeup appointments.
- **Cottage**: Accommodation property.
- **Cottage Room**: Individual room in cottage with guest assignment.
- **Shopping List Item**: Items to purchase for wedding.
- **Budget Category**: Budget grouping with projected/actual totals.
- **Budget Line Item**: Individual expense within a category.
- **Pre/Post Wedding Task**: Task to be completed before or after wedding.
- **Attachment**: File uploaded and linked to any entity.
- **Email Template**: Reusable email template with variables.
- **Email Campaign**: Bulk email campaign with metrics.
- **Email Log**: Individual email send record.
- **Notification**: In-app notification for user.
- **Activity Log**: Audit trail entry for data changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 30+ tables are created and accessible via the database interface
- **SC-002**: A test wedding can be manually created with all required fields in under 2 minutes
- **SC-003**: Querying as an authenticated consultant returns only their weddings (100% RLS enforcement)
- **SC-004**: Querying as a different consultant returns zero records for another consultant's data
- **SC-005**: Updating any record automatically updates the `updated_at` timestamp within 1 second
- **SC-006**: Generated columns (duration_hours, total_cost, variance, invoice_total) calculate correctly on all test cases
- **SC-007**: Check constraints reject 100% of invalid enum values with clear error messages
- **SC-008**: Cascade delete removes all child records when a wedding is deleted
- **SC-009**: Admin users can view all records across all consultants
- **SC-010**: File storage bucket enforces RLS (users can only access files for their weddings)
- **SC-011**: Seed data is present for catalog categories, catalog items, and email templates
- **SC-012**: All foreign key relationships are properly enforced (no orphan records possible)

## Assumptions

- Supabase project is already provisioned and accessible
- Authentication is handled by Supabase Auth (auth.uid() available in RLS policies)
- The schema will be applied via Supabase migrations
- All consultants are authenticated users with valid JWT tokens
- The initial schema supports the wedding domain as specified; additional fields may be added later
- Email sending functionality will be implemented separately (this schema only stores templates and logs)
- File upload functionality will be implemented separately (this schema creates the storage bucket and policies)
