-- Migration: 025-guest-page-fixes
-- Description: Add gender, wedding_party_side, and wedding_party_role columns to guests table
-- Date: 2026-01-21

-- =============================================================================
-- ADD NEW COLUMNS TO GUESTS TABLE
-- =============================================================================

-- Add gender column with CHECK constraint
-- Values: 'male', 'female', or NULL
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));

-- Add wedding_party_side column with CHECK constraint
-- Values: 'bride', 'groom', or NULL
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS wedding_party_side TEXT CHECK (wedding_party_side IN ('bride', 'groom'));

-- Add wedding_party_role column with CHECK constraint
-- Values: role names or NULL
-- Note: Role validation by side is enforced at application level
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS wedding_party_role TEXT CHECK (
  wedding_party_role IN (
    'best_man',
    'groomsmen',
    'maid_of_honor',
    'bridesmaids',
    'parent',
    'close_relative',
    'relative',
    'other'
  )
);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN guests.gender IS 'Guest gender for seating arrangements and formal invitations. Feature: 025-guest-page-fixes';
COMMENT ON COLUMN guests.wedding_party_side IS 'Which side of the wedding party the guest belongs to (bride or groom). Feature: 025-guest-page-fixes';
COMMENT ON COLUMN guests.wedding_party_role IS 'Role in the wedding party. Roles are side-specific: bride side has maid_of_honor/bridesmaids, groom side has best_man/groomsmen. Feature: 025-guest-page-fixes';

-- =============================================================================
-- RLS POLICIES (No changes needed)
-- =============================================================================
-- Existing RLS policies on guests table already cover these new columns
-- since they operate at row level based on wedding_id ownership

-- =============================================================================
-- ROLLBACK SCRIPT (for reference)
-- =============================================================================
-- To rollback this migration:
-- ALTER TABLE guests DROP COLUMN IF EXISTS gender;
-- ALTER TABLE guests DROP COLUMN IF EXISTS wedding_party_side;
-- ALTER TABLE guests DROP COLUMN IF EXISTS wedding_party_role;
