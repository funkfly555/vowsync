# Quickstart: Database Schema Foundation

**Feature**: 001-database-schema-foundation
**Estimated Execution**: 30-45 minutes
**Prerequisites**: Supabase project provisioned

---

## Prerequisites Checklist

- [ ] Supabase project created at https://supabase.com
- [ ] Project URL and anon key available
- [ ] Access to Supabase SQL Editor
- [ ] Git repository cloned locally

---

## Execution Options

### Option A: Supabase MCP (Recommended)

Use the Supabase MCP to apply migrations directly:

```bash
# Migrations are applied via mcp__supabase__apply_migration tool
# Each migration is tracked automatically
```

### Option B: Supabase SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Execute each migration file in order
3. Verify after each step

### Option C: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

---

## Migration Execution Order

Execute migrations in this exact sequence:

| # | Migration | Description | Verify |
|---|-----------|-------------|--------|
| 1 | 00001_extensions_setup.sql | Enable uuid-ossp, pg_trgm | Check extensions list |
| 2 | 00002_users_table.sql | Create public.users | `SELECT * FROM users` |
| 3 | 00003_wedding_tables.sql | weddings, events | Check table structure |
| 4 | 00004_guest_tables.sql | guests, guest_event_attendance | Check tables |
| 5 | 00005_vendor_tables.sql | vendors, contacts, payments, invoices | Check tables |
| 6 | 00006_catalog_tables.sql | categories, items, bar_orders | Check tables |
| 7 | 00007_equipment_tables.sql | items, quantities, repurposing | Check tables |
| 8 | 00008_services_tables.sql | staff, shuttle, beauty, cottages, etc. | Check tables |
| 9 | 00009_budget_tables.sql | categories, line_items | Check tables |
| 10 | 00010_task_tables.sql | pre_post_wedding_tasks | Check table |
| 11 | 00011_file_tables.sql | attachments | Check table |
| 12 | 00012_email_tables.sql | templates, campaigns, logs | Check tables |
| 13 | 00013_notification_tables.sql | notifications, activity_log | Check tables |
| 14 | 00014_functions.sql | 4 database functions | `\df` to list |
| 15 | 00015_triggers.sql | updated_at triggers (31 tables) | Check trigger count |
| 16 | 00016_enable_rls.sql | Enable RLS on all 32 tables | Check RLS status |
| 17 | 00017_rls_policies.sql | Create all RLS policies | Check policy count |
| 18 | 00018_storage_bucket.sql | wedding-files bucket + RLS | Check storage |
| 19 | 00019_seed_data.sql | Catalog categories and items | `SELECT * FROM catalog_categories` |

---

## Verification Steps

### Step 1: Verify Table Count

```sql
SELECT count(*)
FROM information_schema.tables
WHERE table_schema = 'public';
-- Expected: 32
```

### Step 2: Verify RLS Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
-- Expected: 32 rows
```

### Step 3: Verify Triggers

```sql
SELECT count(*)
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Expected: 31 (all tables except activity_log)
```

### Step 4: Verify Functions

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
-- Expected: 4 functions
```

### Step 5: Verify Storage Bucket

```sql
SELECT * FROM storage.buckets WHERE id = 'wedding-files';
-- Expected: 1 row, public = false
```

### Step 6: Verify Seed Data

```sql
SELECT * FROM catalog_categories;
-- Expected: 4 rows (Beverages, Equipment, Decor, Catering)

SELECT count(*) FROM catalog_items;
-- Expected: 5 rows (wine, champagne, beer, soft drinks)
```

---

## Test RLS (Critical)

### Create Test User

1. Go to Supabase Dashboard → Authentication
2. Create a test user with email/password
3. Note the user's UUID from auth.users

### Insert Test Data

```sql
-- As authenticated user (use Supabase client or set role)
INSERT INTO public.users (id, email, full_name, role)
VALUES ('USER_UUID_HERE', 'test@example.com', 'Test User', 'consultant');

INSERT INTO weddings (consultant_id, bride_name, groom_name, wedding_date, venue_name)
VALUES ('USER_UUID_HERE', 'Jane', 'John', '2025-06-15', 'Grand Ballroom');
```

### Verify RLS

```sql
-- As same user: should see 1 wedding
SELECT * FROM weddings;

-- As different user or anonymous: should see 0 weddings
SELECT * FROM weddings; -- Empty
```

---

## Rollback Instructions

If issues occur, rollback in reverse order:

```sql
-- Drop all tables (DESTRUCTIVE)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
-- ... continue for all tables ...

-- Or reset entire public schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

---

## Success Criteria Verification

| SC | Test | Expected |
|----|------|----------|
| SC-001 | `SELECT count(*) FROM information_schema.tables WHERE table_schema='public'` | 32 |
| SC-002 | Manual INSERT of wedding via SQL Editor | < 2 minutes |
| SC-003 | Query weddings as owner | Returns owned records |
| SC-004 | Query weddings as different user | Returns 0 |
| SC-005 | UPDATE any record, check updated_at | Timestamp changes |
| SC-006 | Check events.duration_hours after INSERT | Calculated correctly |
| SC-007 | INSERT wedding with status='invalid' | Error: check constraint |
| SC-008 | DELETE wedding, SELECT guests | Children deleted |
| SC-009 | Query as admin user | Returns all records |
| SC-010 | Upload file via Storage API | Accessible only to owner |
| SC-011 | `SELECT * FROM catalog_categories` | 4 rows |
| SC-012 | INSERT guest with invalid wedding_id | Error: FK violation |

---

## Next Steps

After successful migration:

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement frontend features that use the schema
3. Generate TypeScript types: `supabase gen types typescript`

---

## Troubleshooting

### Error: Permission denied

**Cause**: RLS is enabled but no policies exist
**Fix**: Run 00017_rls_policies.sql

### Error: Function does not exist

**Cause**: Functions not created before triggers
**Fix**: Run 00014_functions.sql before 00015_triggers.sql

### Error: Relation does not exist

**Cause**: Tables created out of order
**Fix**: Re-run migrations in correct order

### Error: auth.uid() returns NULL

**Cause**: Not authenticated or using service role key
**Fix**: Use authenticated client or set JWT in SQL Editor
