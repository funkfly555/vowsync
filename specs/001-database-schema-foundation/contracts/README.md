# API Contracts: Database Schema Foundation

**Status**: Not Applicable

## Explanation

This feature (`001-database-schema-foundation`) is a **database-only** implementation that creates:

- 32 PostgreSQL tables via Supabase migrations
- Row Level Security (RLS) policies
- Database functions and triggers
- Storage bucket with RLS

**No API contracts are generated** because:

1. **No custom API endpoints** - Supabase auto-generates REST/GraphQL APIs from tables
2. **No backend service code** - All logic is in PostgreSQL (functions, triggers, RLS)
3. **No frontend in this feature** - Frontend features will define their own API usage

## Future API Contracts

When frontend features are implemented, they will:

1. Use Supabase client library (`@supabase/supabase-js`)
2. Call auto-generated REST endpoints
3. Define TypeScript types generated from database schema

## Related Files

- `data-model.md` - Complete entity definitions with fields and constraints
- `quickstart.md` - Execution guide for applying migrations

## Supabase Auto-Generated Endpoints

Once migrations are applied, Supabase will provide:

```
GET    /rest/v1/weddings          # List weddings (RLS filtered)
POST   /rest/v1/weddings          # Create wedding
PATCH  /rest/v1/weddings?id=eq.X  # Update wedding
DELETE /rest/v1/weddings?id=eq.X  # Delete wedding
```

These follow standard PostgREST conventions and are secured by RLS policies.
