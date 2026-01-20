-- Migration: 024-guest-menu-management
-- Feature: Guest Management Enhancement & Menu Configuration
-- Date: 2026-01-20
--
-- This migration:
-- 1. Creates meal_options table for menu configuration
-- 2. Adds plus one meal selection columns to guests table
-- 3. Adds plus one attendance and shuttle columns to guest_event_attendance table

-- ============================================
-- 1. CREATE meal_options TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS meal_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    course_type TEXT NOT NULL CHECK (course_type IN ('starter', 'main', 'dessert')),
    option_number INTEGER NOT NULL CHECK (option_number BETWEEN 1 AND 5),
    meal_name TEXT NOT NULL,
    description TEXT,
    dietary_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique option per course per wedding
    UNIQUE (wedding_id, course_type, option_number)
);

-- Index for efficient lookups by wedding
CREATE INDEX IF NOT EXISTS idx_meal_options_wedding_id ON meal_options(wedding_id);

-- Index for course type filtering
CREATE INDEX IF NOT EXISTS idx_meal_options_course_type ON meal_options(wedding_id, course_type);

-- Enable RLS
ALTER TABLE meal_options ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access meal_options for their weddings
CREATE POLICY "Users can view meal_options for their weddings"
    ON meal_options FOR SELECT
    USING (
        wedding_id IN (
            SELECT id FROM weddings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert meal_options for their weddings"
    ON meal_options FOR INSERT
    WITH CHECK (
        wedding_id IN (
            SELECT id FROM weddings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meal_options for their weddings"
    ON meal_options FOR UPDATE
    USING (
        wedding_id IN (
            SELECT id FROM weddings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete meal_options for their weddings"
    ON meal_options FOR DELETE
    USING (
        wedding_id IN (
            SELECT id FROM weddings WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- 2. ALTER guests TABLE
-- ============================================
-- Add plus one meal selection columns

ALTER TABLE guests
    ADD COLUMN IF NOT EXISTS plus_one_starter_choice INTEGER CHECK (plus_one_starter_choice BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS plus_one_main_choice INTEGER CHECK (plus_one_main_choice BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS plus_one_dessert_choice INTEGER CHECK (plus_one_dessert_choice BETWEEN 1 AND 5);

-- ============================================
-- 3. ALTER guest_event_attendance TABLE
-- ============================================
-- Add plus one attendance tracking

ALTER TABLE guest_event_attendance
    ADD COLUMN IF NOT EXISTS plus_one_attending BOOLEAN DEFAULT FALSE;

-- Add shuttle booking columns for primary guest
ALTER TABLE guest_event_attendance
    ADD COLUMN IF NOT EXISTS shuttle_to_event_time TIME,
    ADD COLUMN IF NOT EXISTS shuttle_to_event_pickup_location TEXT,
    ADD COLUMN IF NOT EXISTS shuttle_from_event_time TIME,
    ADD COLUMN IF NOT EXISTS shuttle_from_event_pickup_location TEXT;

-- Add shuttle booking columns for plus one
ALTER TABLE guest_event_attendance
    ADD COLUMN IF NOT EXISTS plus_one_shuttle_to_event_time TIME,
    ADD COLUMN IF NOT EXISTS plus_one_shuttle_to_event_pickup_location TEXT,
    ADD COLUMN IF NOT EXISTS plus_one_shuttle_from_event_time TIME,
    ADD COLUMN IF NOT EXISTS plus_one_shuttle_from_event_pickup_location TEXT;

-- ============================================
-- 4. UPDATED_AT TRIGGER FOR meal_options
-- ============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for meal_options
DROP TRIGGER IF EXISTS update_meal_options_updated_at ON meal_options;
CREATE TRIGGER update_meal_options_updated_at
    BEFORE UPDATE ON meal_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE meal_options IS 'Stores meal options for wedding menu configuration (5 options per course)';
COMMENT ON COLUMN meal_options.course_type IS 'Course type: starter, main, or dessert';
COMMENT ON COLUMN meal_options.option_number IS 'Option number 1-5 within the course';
COMMENT ON COLUMN meal_options.meal_name IS 'Name of the meal option (required)';
COMMENT ON COLUMN meal_options.description IS 'Optional description of the meal';
COMMENT ON COLUMN meal_options.dietary_info IS 'Optional dietary information (e.g., vegetarian, gluten-free)';

COMMENT ON COLUMN guests.plus_one_starter_choice IS 'Plus one starter selection (1-5), references meal_options.option_number';
COMMENT ON COLUMN guests.plus_one_main_choice IS 'Plus one main course selection (1-5), references meal_options.option_number';
COMMENT ON COLUMN guests.plus_one_dessert_choice IS 'Plus one dessert selection (1-5), references meal_options.option_number';

COMMENT ON COLUMN guest_event_attendance.plus_one_attending IS 'Whether the guest plus one is attending this event';
COMMENT ON COLUMN guest_event_attendance.shuttle_to_event_time IS 'Shuttle departure time to event for primary guest';
COMMENT ON COLUMN guest_event_attendance.shuttle_to_event_pickup_location IS 'Pickup location for shuttle to event';
COMMENT ON COLUMN guest_event_attendance.shuttle_from_event_time IS 'Shuttle departure time from event for primary guest';
COMMENT ON COLUMN guest_event_attendance.shuttle_from_event_pickup_location IS 'Pickup location for shuttle from event';
