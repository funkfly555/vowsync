# Tasks: Database Schema Foundation

**Input**: Design documents from `/specs/001-database-schema-foundation/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), quickstart.md (complete)

**Tests**: Manual testing only via Supabase SQL Editor and Playwright MCP per VowSync constitution. No automated test files.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Migrations**: `supabase/migrations/` at repository root
- **SQL files**: Numbered prefix for execution order (e.g., `00001_`, `00002_`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enable extensions and create core user table that all other tables depend on

- [X] T001 [US8] Apply migration `supabase/migrations/00001_extensions_setup.sql` - Enable uuid-ossp and pg_trgm extensions
- [X] T002 [US8] Apply migration `supabase/migrations/00002_users_table.sql` - Create public.users table extending auth.users

**Checkpoint**: Extensions enabled, users table ready - wedding creation can begin

---

## Phase 2: User Story 1 - Consultant Creates a Wedding (Priority: P1)

**Goal**: Enable wedding CRUD operations with status tracking and RLS protection

**Independent Test**: Create wedding via SQL Editor, verify fields stored correctly, verify RLS isolates data

### Implementation for User Story 1

- [X] T003 [US1] Apply migration `supabase/migrations/00003_wedding_tables.sql` - Create weddings and events tables with constraints
- [X] T004 [US1] Verify wedding table constraints: status CHECK (planning/confirmed/completed/cancelled)
- [X] T005 [US1] Verify events table constraints: event_order 1-10, duration_hours generated column

**Checkpoint**: Wedding and event tables exist with proper constraints

---

## Phase 3: User Story 2 - Consultant Manages Multiple Events (Priority: P1)

**Goal**: Support 1-10 events per wedding with auto-calculated duration

**Independent Test**: Create events with start/end times, verify duration_hours calculates correctly

### Implementation for User Story 2

- [X] T006 [US2] Verify events foreign key to weddings (ON DELETE CASCADE)
- [X] T007 [US2] Test generated column: `duration_hours = EXTRACT(EPOCH FROM (end_time - start_time))/3600`
- [X] T008 [US2] Verify event_type CHECK constraint (ceremony/reception/rehearsal_dinner/welcome_party/brunch/other)

**Checkpoint**: Events linked to weddings with auto-calculated duration

---

## Phase 4: User Story 3 - Consultant Manages Guest List (Priority: P1)

**Goal**: Comprehensive guest management with RSVP, dietary needs, and meal selections

**Independent Test**: Add guests with dietary restrictions, verify meal selection constraints, verify event attendance junction

### Implementation for User Story 3

- [X] T009 [US3] Apply migration `supabase/migrations/00004_guest_tables.sql` - Create guests and guest_event_attendance tables
- [X] T010 [US3] Verify guest constraints: guest_type CHECK (adult/child/vendor/staff), rsvp_status CHECK
- [X] T011 [US3] Verify meal selection constraints: starter_selection, main_selection, dessert_selection (1-5 each)
- [X] T012 [US3] Verify guest_event_attendance junction table with attendance_status and shuttle_required

**Checkpoint**: Full guest management with event attendance tracking

---

## Phase 5: User Story 4 - Consultant Tracks Vendors and Payments (Priority: P2)

**Goal**: Vendor contracts, contacts, payment schedules, and invoices with auto-calculated totals

**Independent Test**: Create vendor with contacts, set up payment milestones, create invoice and verify total calculation

### Implementation for User Story 4

- [X] T013 [US4] Apply migration `supabase/migrations/00005_vendor_tables.sql` - Create vendors, vendor_contacts, vendor_payment_schedule, vendor_invoices
- [X] T014 [US4] Verify vendor constraints: contract_status, insurance fields, banking details
- [X] T015 [US4] Verify vendor_contacts: is_primary, is_onsite_contact flags
- [X] T016 [US4] Verify vendor_payment_schedule: payment_status CHECK (pending/paid/overdue/cancelled)
- [X] T017 [US4] Verify vendor_invoices generated column: `total_amount = amount + vat_amount`

**Checkpoint**: Complete vendor lifecycle management

---

## Phase 6: User Story 5 - Consultant Plans Bar Orders (Priority: P2)

**Goal**: Beverage calculations based on guest counts and event duration

**Independent Test**: Create bar order with items, verify percentage validation and unit calculations

### Implementation for User Story 5

- [X] T018 [P] [US5] Apply migration `supabase/migrations/00006_catalog_tables.sql` - Create catalog_categories, catalog_items, bar_orders, bar_order_items
- [X] T019 [US5] Verify catalog_categories structure for beverages, equipment, decor, catering
- [X] T020 [US5] Verify catalog_items: unit_type, serving_size, cost_per_unit fields
- [X] T021 [US5] Verify bar_orders: event link, adult_count, child_count, event_duration_hours
- [X] T022 [US5] Verify bar_order_items: percentage constraints, calculated_servings, calculated_units

**Checkpoint**: Bar ordering system ready with calculations

---

## Phase 7: User Story 6 - Consultant Manages Equipment (Priority: P2)

**Goal**: Equipment tracking across events with repurposing instructions

**Independent Test**: Create wedding items, assign quantities per event, create repurposing instructions

### Implementation for User Story 6

- [X] T023 [US6] Apply migration `supabase/migrations/00007_equipment_tables.sql` - Create wedding_items, wedding_item_event_quantities, repurposing_instructions
- [X] T024 [US6] Verify wedding_items: aggregation_method CHECK (add/max), total_required calculation
- [X] T025 [US6] Verify wedding_item_event_quantities: quantity_required per event
- [X] T026 [US6] Verify repurposing_instructions: pickup_time/dropoff_time validation, status tracking

**Checkpoint**: Equipment management with cross-event repurposing

---

## Phase 8: User Story 7 - Consultant Tracks Budget (Priority: P2)

**Goal**: Budget categories and line items with variance calculations

**Independent Test**: Create budget category, add line items, verify variance auto-calculation

### Implementation for User Story 7

- [X] T027 [US7] Apply migration `supabase/migrations/00009_budget_tables.sql` - Create budget_categories, budget_line_items
- [X] T028 [US7] Verify budget_categories: projected_amount, actual_amount, variance generated column
- [X] T029 [US7] Verify budget_line_items: vendor_id reference (SET NULL on delete), payment_status

**Checkpoint**: Complete budget tracking with automatic variance

---

## Phase 9: User Story 9 - Consultant Manages Additional Services (Priority: P3)

**Goal**: Staff, shuttle, stationery, beauty, cottages, and shopping lists

**Independent Test**: Create records in each service table, verify calculations and relationships

### Implementation for User Story 9

- [X] T030 [P] [US9] Apply migration `supabase/migrations/00008_services_tables.sql` - Create staff_requirements, shuttle_transport, stationery_items, beauty_services, cottages, cottage_rooms, shopping_list_items
- [X] T031 [US9] Verify staff_requirements: total_staff generated column from role counts
- [X] T032 [US9] Verify shuttle_transport: collection/dropoff details, guest assignments
- [X] T033 [US9] Verify stationery_items: total_cost generated column (quantity * unit_cost)
- [X] T034 [US9] Verify beauty_services: appointment scheduling fields
- [X] T035 [US9] Verify cottages and cottage_rooms: accommodation management
- [X] T036 [US9] Verify shopping_list_items: purchase status tracking

**Checkpoint**: All supporting services available

---

## Phase 10: User Story 10 - System Provides Audit Trail (Priority: P3)

**Goal**: Activity logging, notifications, and email tracking

**Independent Test**: Perform data changes, verify activity log entries, create notifications

### Implementation for User Story 10

- [X] T037 [P] [US10] Apply migration `supabase/migrations/00010_task_tables.sql` - Create pre_post_wedding_tasks
- [X] T038 [P] [US10] Apply migration `supabase/migrations/00011_file_tables.sql` - Create attachments table
- [X] T039 [P] [US10] Apply migration `supabase/migrations/00012_email_tables.sql` - Create email_templates, email_campaigns, email_logs
- [X] T040 [US10] Apply migration `supabase/migrations/00013_notification_tables.sql` - Create notifications, activity_log
- [X] T041 [US10] Verify pre_post_wedding_tasks: task_type, priority, status constraints
- [X] T042 [US10] Verify attachments: file_type constraints, file_size_bytes limit
- [X] T043 [US10] Verify email tables: template variables, campaign metrics, delivery logs
- [X] T044 [US10] Verify notifications: notification_type, priority, is_read tracking
- [X] T045 [US10] Verify activity_log: entity_type, action, old_values, new_values JSONB

**Checkpoint**: Full audit trail and notification system

---

## Phase 11: User Story 8 - System Enforces Data Isolation (Priority: P1)

**Goal**: Complete RLS implementation ensuring consultants only access their own data

**Independent Test**: Query as different users, verify isolation, test admin bypass

### Database Functions

- [X] T046 [US8] Apply migration `supabase/migrations/00014_functions.sql` - Create 4 database functions:
  - `update_updated_at_column()` - Trigger function for timestamps
  - `calculate_event_guest_count(event_id)` - Returns adult/child counts
  - `calculate_wedding_item_total_required(item_id)` - ADD/MAX aggregation
  - `update_wedding_budget_totals(wedding_id)` - Recalculates totals

### Triggers

- [X] T047 [US8] Apply migration `supabase/migrations/00015_triggers.sql` - Create updated_at triggers on all 31 tables (all except activity_log)

### Row Level Security

- [X] T048 [US8] Apply migration `supabase/migrations/00016_enable_rls.sql` - Enable RLS on ALL 32 tables
- [X] T049 [US8] Apply migration `supabase/migrations/00017_rls_policies.sql` - Create all RLS policies:
  - Parent tables: `auth.uid() = consultant_id`
  - Child tables: EXISTS subquery to weddings
  - Catalog tables: authenticated users can SELECT
  - Admin bypass: role = 'admin' sees all

### Storage Security

- [X] T050 [US8] Apply migration `supabase/migrations/00018_storage_bucket.sql` - Create wedding-files bucket with RLS policies

**Checkpoint**: Complete data isolation - security verified

---

## Phase 12: Seed Data & Validation

**Purpose**: Initial data and final verification

### Seed Data

- [X] T051 [P] Apply migration `supabase/migrations/00019_seed_data.sql` - Insert:
  - 4 catalog_categories (Beverages, Equipment, Decor, Catering)
  - 5 catalog_items (wine, champagne, beer, soft_drinks, spirits)
  - Email templates (if defined)

### Final Verification (from quickstart.md)

- [X] T052 Verify table count: `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'` → Expected: 32
- [X] T053 Verify RLS enabled: `SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true` → Expected: 32
- [X] T054 Verify trigger count: `SELECT count(*) FROM information_schema.triggers WHERE trigger_schema = 'public'` → Expected: 31
- [X] T055 Verify functions: `SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'` → Expected: 4
- [X] T056 Verify storage bucket: `SELECT * FROM storage.buckets WHERE id = 'wedding-files'` → Expected: 1 row
- [X] T057 Verify seed data: `SELECT count(*) FROM catalog_categories` → Expected: 4

### Success Criteria Validation

- [X] T058 [SC-001] Confirm all 32 tables accessible
- [X] T059 [SC-002] Test wedding creation under 2 minutes
- [X] T060 [SC-003] Query as consultant returns only owned weddings
- [X] T061 [SC-004] Query as different consultant returns zero
- [X] T062 [SC-005] Update record, verify updated_at changes
- [X] T063 [SC-006] Test generated columns (duration_hours, variance, invoice_total)
- [X] T064 [SC-007] Test check constraints reject invalid enums
- [X] T065 [SC-008] Delete wedding, verify cascade removes children
- [X] T066 [SC-009] Query as admin sees all records
- [X] T067 [SC-010] Verify file storage RLS enforcement
- [X] T068 [SC-011] Verify seed data present
- [X] T069 [SC-012] Test foreign key enforcement (orphan prevention)

**Checkpoint**: All success criteria verified - feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2-4: P1 User Stories (US1, US2, US3) - Core wedding/events/guests
    ↓
Phase 5-8: P2 User Stories (US4, US5, US6, US7) - Vendors/bar/equipment/budget
    ↓
Phase 9-10: P3 User Stories (US9, US10) - Services/audit
    ↓
Phase 11: US8 Security (Functions, Triggers, RLS) - CRITICAL
    ↓
Phase 12: Seed Data & Validation
```

### Migration Order (CRITICAL)

Migrations MUST be executed in this exact sequence due to foreign key dependencies:

1. `00001_extensions_setup.sql` - Extensions first
2. `00002_users_table.sql` - Users before weddings
3. `00003_wedding_tables.sql` - Weddings before child tables
4. `00004_guest_tables.sql` - Guests depend on weddings/events
5. `00005_vendor_tables.sql` - Vendors depend on weddings
6. `00006_catalog_tables.sql` - Catalog and bar orders
7. `00007_equipment_tables.sql` - Equipment depends on weddings/events
8. `00008_services_tables.sql` - Services depend on weddings/events
9. `00009_budget_tables.sql` - Budget depends on weddings/vendors
10. `00010_task_tables.sql` - Tasks depend on weddings
11. `00011_file_tables.sql` - Files depend on weddings
12. `00012_email_tables.sql` - Email depends on weddings
13. `00013_notification_tables.sql` - Notifications depend on weddings/users
14. `00014_functions.sql` - Functions before triggers
15. `00015_triggers.sql` - Triggers on existing tables
16. `00016_enable_rls.sql` - RLS on existing tables
17. `00017_rls_policies.sql` - Policies after RLS enabled
18. `00018_storage_bucket.sql` - Storage after policies
19. `00019_seed_data.sql` - Seed data last

### Parallel Opportunities

- T037, T038, T039 can run in parallel (different table groups)
- T018-T022 (catalog) independent of T023-T026 (equipment)
- All verification tasks (T052-T069) can run in parallel after migrations complete

---

## Implementation Strategy

### Recommended Approach: Supabase MCP

Use `mcp__supabase__apply_migration` for each SQL file:

```
1. Apply migrations 00001-00003 (Setup + Core)
2. Verify weddings and events work
3. Apply migrations 00004-00013 (All tables)
4. Apply migrations 00014-00015 (Functions + Triggers)
5. Apply migrations 00016-00017 (RLS)
6. Apply migration 00018 (Storage)
7. Apply migration 00019 (Seed data)
8. Run all verification queries
```

### Alternative: Supabase SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Execute each migration file in order
3. Verify after each step per quickstart.md

### Rollback Strategy

If issues occur at any phase:
- Check quickstart.md troubleshooting section
- Reset to last successful migration
- Or full reset: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`

---

## Notes

- [P] tasks can run in parallel (different files, no dependencies)
- [US#] label maps task to specific user story
- All migrations use Supabase MCP `apply_migration` tool
- Manual testing only per constitution (no automated test files)
- Commit after each phase completion
- Verify RLS after Phase 11 - security is critical
