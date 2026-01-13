# Implementation Plan: Database Schema Foundation

**Branch**: `001-database-schema-foundation` | **Date**: 2025-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-database-schema-foundation/spec.md`

## Summary

Build complete Supabase PostgreSQL database with 30+ tables, Row Level Security (RLS), database functions, triggers, and storage buckets for the VowSync wedding planning SaaS platform. This is a database-only feature with no frontend components - all work is executed via Supabase migrations and SQL.

## Technical Context

**Language/Version**: SQL (PostgreSQL 15+ via Supabase)
**Primary Dependencies**: Supabase (PostgreSQL, Auth, Storage)
**Storage**: Supabase PostgreSQL with RLS
**Testing**: Manual testing via Supabase SQL Editor + Playwright MCP for verification
**Target Platform**: Supabase cloud (managed PostgreSQL)
**Project Type**: Database migrations (no frontend code in this feature)
**Performance Goals**: N/A (database schema only)
**Constraints**: Must use Supabase migrations, RLS required on ALL tables
**Scale/Scope**: 30+ tables, 67 functional requirements, 10 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] Supabase only (no frontend in this feature) |
| II. Design System | Follows color palette, typography, spacing specs | [N/A] Database-only feature |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] All tables use UUID PKs, RLS on ALL tables |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [N/A] SQL only, snake_case naming |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [N/A] Database-only feature |
| VI. Business Logic | Accurate calculations, proper validations | [x] Generated columns, check constraints |
| VII. Security | RLS, no API key exposure, input validation | [x] RLS on ALL 30+ tables |
| VIII. Testing | Manual testing with Playwright MCP only | [x] Manual SQL testing |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [N/A] Database-only feature |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [N/A] Database-only feature |
| XI. API Handling | Standard response format, error pattern | [N/A] Database-only feature |
| XII. Git Workflow | Feature branches, descriptive commits | [x] On feature branch |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] SQL comments for functions |
| XIV. Environment | Uses .env, no secrets in git | [x] Supabase handles secrets |
| XV. Prohibited | No violations of prohibited practices | [x] No violations |

**Gate Status**: PASS - All applicable gates satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-database-schema-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (execution guide)
├── contracts/           # Phase 1 output (not applicable - no API)
│   └── README.md        # Explains N/A for database-only feature
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    ├── 00001_extensions_setup.sql
    ├── 00002_users_table.sql
    ├── 00003_wedding_tables.sql
    ├── 00004_guest_tables.sql
    ├── 00005_vendor_tables.sql
    ├── 00006_catalog_tables.sql
    ├── 00007_equipment_tables.sql
    ├── 00008_services_tables.sql
    ├── 00009_budget_tables.sql
    ├── 00010_task_tables.sql
    ├── 00011_file_tables.sql
    ├── 00012_email_tables.sql
    ├── 00013_notification_tables.sql
    ├── 00014_functions.sql
    ├── 00015_triggers.sql
    ├── 00016_enable_rls.sql
    ├── 00017_rls_policies.sql
    ├── 00018_storage_bucket.sql
    └── 00019_seed_data.sql
```

**Structure Decision**: Database-only feature using Supabase migrations. All SQL files go in `supabase/migrations/` directory with numbered prefixes for execution order.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Execution Order (CRITICAL)

The migrations MUST be executed in this exact order due to foreign key dependencies:

1. **Extensions & setup** (00001)
2. **Users table** (00002) - extends auth.users
3. **Parent tables** - weddings, events (00003)
4. **Child tables** - guests, vendors, catalog, equipment, services, budget, tasks, files, email, notifications (00004-00013)
5. **Database functions** (00014)
6. **Triggers** on all tables with updated_at (00015)
7. **Enable RLS** on ALL tables (00016)
8. **Create RLS policies** (00017)
9. **Storage buckets & RLS** (00018)
10. **Seed initial data** (00019)

---

## Table Summary (30+ Tables)

| Category | Tables | Count |
|----------|--------|-------|
| Core | users, weddings, events | 3 |
| Guests | guests, guest_event_attendance | 2 |
| Vendors | vendors, vendor_contacts, vendor_payment_schedule, vendor_invoices | 4 |
| Catalog | catalog_categories, catalog_items, bar_orders, bar_order_items | 4 |
| Equipment | wedding_items, wedding_item_event_quantities, repurposing_instructions | 3 |
| Services | staff_requirements, shuttle_transport, stationery_items, beauty_services, cottages, cottage_rooms, shopping_list_items | 7 |
| Budget | budget_categories, budget_line_items | 2 |
| Tasks | pre_post_wedding_tasks | 1 |
| Files | attachments | 1 |
| Email | email_templates, email_campaigns, email_logs | 3 |
| Notifications | notifications, activity_log | 2 |
| **TOTAL** | | **32** |

---

## Database Functions (4)

1. **update_updated_at_column()** - Trigger function for auto-updating timestamps
2. **calculate_event_guest_count(event_id)** - Returns adult/child counts for an event
3. **calculate_wedding_item_total_required(item_id)** - ADD or MAX aggregation for equipment
4. **update_wedding_budget_totals(wedding_id)** - Recalculates budget totals

---

## RLS Policy Pattern

### Parent Table (weddings)
```sql
-- SELECT: auth.uid() = consultant_id OR admin
-- INSERT: auth.uid() = consultant_id
-- UPDATE: auth.uid() = consultant_id
-- DELETE: auth.uid() = consultant_id
```

### Child Tables (via wedding_id)
```sql
-- SELECT: EXISTS subquery to weddings WHERE consultant_id = auth.uid() OR admin
-- INSERT/UPDATE/DELETE: EXISTS subquery to weddings WHERE consultant_id = auth.uid()
```

### Catalog Tables (global read)
```sql
-- SELECT: auth.uid() IS NOT NULL
-- No INSERT/UPDATE/DELETE for regular users
```

---

## Success Criteria Mapping

| SC | Criteria | Verified By |
|----|----------|-------------|
| SC-001 | All 30+ tables created | `SELECT count(*) FROM information_schema.tables` |
| SC-002 | Test wedding in <2 min | Manual INSERT via SQL Editor |
| SC-003 | RLS returns only own weddings | Query as authenticated consultant |
| SC-004 | Different consultant sees zero | Query as different user |
| SC-005 | updated_at auto-refreshes | UPDATE any record, check timestamp |
| SC-006 | Generated columns work | Check duration_hours, total_cost, variance |
| SC-007 | Check constraints reject invalid | INSERT invalid enum value |
| SC-008 | Cascade delete works | DELETE wedding, verify children gone |
| SC-009 | Admin sees all | Query as admin user |
| SC-010 | Storage RLS works | Upload/access file test |
| SC-011 | Seed data present | SELECT from catalog_categories |
| SC-012 | FK relationships enforced | INSERT orphan record (should fail) |
