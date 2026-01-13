# Research: Database Schema Foundation

**Feature**: 001-database-schema-foundation
**Date**: 2025-01-13
**Status**: Complete

## Research Summary

This feature is database-only with clear requirements from the spec. No major unknowns required external research. All technical decisions are constrained by the VowSync constitution (Supabase PostgreSQL).

---

## Decision Log

### 1. Primary Key Strategy

**Decision**: UUID using `gen_random_uuid()`
**Rationale**:
- Constitution requires UUID PKs (Section III)
- Supabase native function, no extension needed
- Consistent across all 32 tables
**Alternatives Considered**:
- SERIAL/BIGSERIAL: Rejected - Constitution prohibits
- UUIDv4 via uuid-ossp: Works but gen_random_uuid() is simpler

### 2. Timestamp Strategy

**Decision**: TIMESTAMPTZ with UTC timezone
**Rationale**:
- Wedding events span timezones
- Supabase default behavior
- Triggers auto-update `updated_at`
**Alternatives Considered**:
- TIMESTAMP (without TZ): Rejected - loses timezone context
- Application-level timestamps: Rejected - less reliable

### 3. RLS Implementation Pattern

**Decision**: EXISTS subquery pattern for child tables
**Rationale**:
- Constitution requires RLS on ALL tables (Section VII)
- EXISTS pattern is performant with proper indexes
- Single query path for ownership verification
**Alternatives Considered**:
- JOIN-based policies: More complex, same performance
- Application-level filtering: PROHIBITED by constitution

### 4. Enum Implementation

**Decision**: CHECK constraints on TEXT columns
**Rationale**:
- PostgreSQL native, no type creation needed
- Easy to modify (ALTER TABLE)
- Clear error messages on violation
**Alternatives Considered**:
- CREATE TYPE enum: Harder to modify, overkill for small sets
- Lookup tables: Adds complexity for static values

### 5. Generated Columns vs Triggers

**Decision**: GENERATED ALWAYS AS STORED for calculated values
**Rationale**:
- Duration, totals, variance auto-calculate
- No application logic needed
- Always consistent with source data
**Alternatives Considered**:
- Trigger-based calculation: More flexible but harder to maintain
- Application calculation: Rejected - single source of truth

### 6. Cascade Delete Strategy

**Decision**: ON DELETE CASCADE for child records, ON DELETE SET NULL for optional references
**Rationale**:
- Spec edge cases define this behavior explicitly
- Prevents orphan records
- Vendor references in budget items should SET NULL (preserve history)
**Alternatives Considered**:
- Soft deletes: Not specified in requirements
- Application-level cascades: Error-prone

### 7. Storage Bucket Structure

**Decision**: Single `wedding-files` bucket with folder-per-wedding
**Rationale**:
- RLS can use folder name as wedding_id
- Simple permission model
- Matches Supabase storage patterns
**Alternatives Considered**:
- Bucket-per-wedding: Too many buckets, management overhead
- Flat structure: RLS would be complex

### 8. Migration File Organization

**Decision**: 19 numbered migration files by dependency order
**Rationale**:
- Clear execution sequence
- Easy to debug failures
- Supabase migration convention
**Alternatives Considered**:
- Single monolithic migration: Harder to debug
- Alphabetical naming: Doesn't guarantee order

---

## Technical Constraints Verified

| Constraint | Source | Verified |
|------------|--------|----------|
| PostgreSQL 15+ | Supabase default | Yes |
| RLS required | Constitution VII | Yes - all 32 tables |
| UUID PKs | Constitution III | Yes - all tables |
| snake_case naming | Constitution IV | Yes - all tables/columns |
| Check constraints | Constitution III | Yes - all enums |
| Cascade deletes | Spec edge cases | Yes - defined per relationship |

---

## No Further Research Required

All technical decisions are either:
1. **Mandated by Constitution** - No alternatives allowed
2. **Specified in Requirements** - Clear behavior defined
3. **Standard Supabase Patterns** - Well-documented

**Phase 0 Status**: COMPLETE - Ready for Phase 1 Design
