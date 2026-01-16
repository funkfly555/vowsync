# Data Model: Repurposing Timeline Management

**Feature**: 014-repurposing-timeline
**Date**: 2026-01-16
**Status**: Complete

---

## Entity Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    repurposing_instructions                      │
├─────────────────────────────────────────────────────────────────┤
│ - Links wedding_items to two events (from → to)                  │
│ - Captures pickup/dropoff logistics                              │
│ - Tracks responsible party and vendor                            │
│ - Manages execution status with timestamps                       │
└─────────────────────────────────────────────────────────────────┘
         │               │               │              │
         │               │               │              │
         ▼               ▼               ▼              ▼
    weddings      wedding_items       events         vendors
    (parent)         (item)         (from/to)      (optional)
```

---

## 1. RepurposingInstruction (Database Entity)

### Database Table: `repurposing_instructions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| wedding_id | UUID | FK → weddings, NOT NULL, CASCADE | Parent wedding |
| wedding_item_id | UUID | FK → wedding_items, NOT NULL, CASCADE | Item being moved |
| from_event_id | UUID | FK → events, NOT NULL, CASCADE | Source event |
| from_event_end_time | TIME | NULL | Cached event end time for validation |
| pickup_location | TEXT | NOT NULL | Where to pick up item |
| pickup_time | TIME | NOT NULL | When to pick up |
| pickup_time_relative | TEXT | NULL | Human description (e.g., "30 min after") |
| to_event_id | UUID | FK → events, NOT NULL, CASCADE | Destination event |
| to_event_start_time | TIME | NULL | Cached event start time for validation |
| dropoff_location | TEXT | NOT NULL | Where to deliver item |
| dropoff_time | TIME | NOT NULL | When to deliver |
| dropoff_time_relative | TEXT | NULL | Human description (e.g., "1 hour before") |
| responsible_party | TEXT | NOT NULL | Person/role responsible |
| responsible_vendor_id | UUID | FK → vendors, NULL, SET NULL | Optional vendor link |
| handling_notes | TEXT | NULL | Special handling instructions |
| setup_required | BOOLEAN | DEFAULT false | Needs setup at destination |
| breakdown_required | BOOLEAN | DEFAULT false | Needs breakdown at source |
| is_critical | BOOLEAN | DEFAULT false | High priority flag |
| status | TEXT | CHECK, DEFAULT 'pending' | Current workflow status |
| started_at | TIMESTAMPTZ | NULL | When work started |
| completed_at | TIMESTAMPTZ | NULL | When work completed |
| completed_by | TEXT | NULL | Who completed the work |
| issue_description | TEXT | NULL | Description of any issues |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status CHECK constraint**: `status IN ('pending', 'in_progress', 'completed', 'issue')`

---

## 2. TypeScript Interfaces

### Core Entity Interface

```typescript
/**
 * Status type for repurposing instructions
 */
export type RepurposingStatus = 'pending' | 'in_progress' | 'completed' | 'issue';

/**
 * Database entity - mirrors Supabase repurposing_instructions table
 * CRITICAL: All field names use snake_case matching database columns
 */
export interface RepurposingInstruction {
  id: string;
  wedding_id: string;
  wedding_item_id: string;
  from_event_id: string;
  from_event_end_time: string | null;     // TIME as "HH:MM:SS"
  pickup_location: string;
  pickup_time: string;                     // TIME as "HH:MM:SS"
  pickup_time_relative: string | null;
  to_event_id: string;
  to_event_start_time: string | null;     // TIME as "HH:MM:SS"
  dropoff_location: string;
  dropoff_time: string;                    // TIME as "HH:MM:SS"
  dropoff_time_relative: string | null;
  responsible_party: string;
  responsible_vendor_id: string | null;
  handling_notes: string | null;
  setup_required: boolean;
  breakdown_required: boolean;
  is_critical: boolean;
  status: RepurposingStatus;
  started_at: string | null;               // TIMESTAMPTZ as ISO string
  completed_at: string | null;             // TIMESTAMPTZ as ISO string
  completed_by: string | null;
  issue_description: string | null;
  created_at: string;                      // TIMESTAMPTZ as ISO string
  updated_at: string;                      // TIMESTAMPTZ as ISO string
}
```

### Extended Interface with Relations

```typescript
/**
 * Wedding item reference for display
 */
export interface RepurposingItemRef {
  id: string;
  description: string;
  category: string;
}

/**
 * Event reference for display
 */
export interface RepurposingEventRef {
  id: string;
  event_name: string;
  event_date: string;        // DATE as "YYYY-MM-DD"
  event_start_time?: string; // TIME as "HH:MM:SS"
  event_end_time?: string;   // TIME as "HH:MM:SS"
}

/**
 * Vendor reference for display
 */
export interface RepurposingVendorRef {
  id: string;
  company_name: string;
}

/**
 * Repurposing instruction with all related entities for display
 */
export interface RepurposingInstructionWithRelations extends RepurposingInstruction {
  wedding_items: RepurposingItemRef;
  from_event: RepurposingEventRef;
  to_event: RepurposingEventRef;
  vendors: RepurposingVendorRef | null;
}
```

### Form Data Interface

```typescript
/**
 * Form data for create/edit repurposing instruction modal
 */
export interface RepurposingFormData {
  // Movement tab
  wedding_item_id: string;
  from_event_id: string;
  pickup_location: string;
  pickup_time: string;              // "HH:MM" format for input
  pickup_time_relative: string;
  to_event_id: string;
  dropoff_location: string;
  dropoff_time: string;             // "HH:MM" format for input
  dropoff_time_relative: string;

  // Responsibility tab
  responsible_party: string;
  responsible_vendor_id: string;    // Empty string if none
  setup_required: boolean;
  breakdown_required: boolean;
  is_critical: boolean;

  // Handling tab
  handling_notes: string;

  // Status tab (edit only)
  status: RepurposingStatus;
  completed_by: string;
  issue_description: string;
}

/**
 * Default values for new instruction form
 */
export const DEFAULT_REPURPOSING_FORM: RepurposingFormData = {
  wedding_item_id: '',
  from_event_id: '',
  pickup_location: '',
  pickup_time: '',
  pickup_time_relative: '',
  to_event_id: '',
  dropoff_location: '',
  dropoff_time: '',
  dropoff_time_relative: '',
  responsible_party: '',
  responsible_vendor_id: '',
  setup_required: false,
  breakdown_required: false,
  is_critical: false,
  handling_notes: '',
  status: 'pending',
  completed_by: '',
  issue_description: '',
};
```

### Validation Result Types

```typescript
/**
 * Validation result type
 */
export type ValidationSeverity = 'error' | 'warning' | 'success';

export interface ValidationResult {
  type: ValidationSeverity;
  message: string;
  field?: string;
}

/**
 * Combined validation state for form
 */
export interface RepurposingValidationState {
  pickupBeforeDropoff: ValidationResult;
  pickupAfterEventEnd: ValidationResult;
  dropoffBeforeEventStart: ValidationResult;
  sameEventCheck: ValidationResult;
  hasBlockingErrors: boolean;
  hasWarnings: boolean;
}
```

### Filter State Interface

```typescript
/**
 * Filter state for repurposing list
 */
export interface RepurposingFilters {
  status: RepurposingStatus | 'all';
  responsibleParty: string | 'all';
  eventId: string | 'all';
  itemId: string | 'all';
}

export const DEFAULT_FILTERS: RepurposingFilters = {
  status: 'all',
  responsibleParty: 'all',
  eventId: 'all',
  itemId: 'all',
};
```

### Gantt Chart Types

```typescript
/**
 * Gantt bar data for visualization
 */
export interface GanttBarData {
  id: string;
  itemId: string;
  itemDescription: string;
  pickupTime: number;       // Minutes since midnight
  dropoffTime: number;      // Minutes since midnight
  status: RepurposingStatus;
  isCritical: boolean;
  isOvernight: boolean;
  fromEventName: string;
  toEventName: string;
}

/**
 * Gantt row representing an item with its movement bars
 */
export interface GanttRowData {
  itemId: string;
  itemDescription: string;
  itemCategory: string;
  bars: GanttBarData[];
}
```

---

## 3. State Transitions

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               │               ▼
    ┌─────────────┐        │        ┌─────────────┐
    │ IN_PROGRESS │        │        │    ISSUE    │
    └──────┬──────┘        │        └─────────────┘
           │               │               ▲
           ├───────────────┘               │
           │                               │
           ▼                               │
    ┌─────────────┐                        │
    │  COMPLETED  ├────────────────────────┘
    └─────────────┘
```

**Transition Rules**:
- `pending` → `in_progress`: Sets `started_at = NOW()`
- `pending` → `issue`: Requires `issue_description`
- `in_progress` → `completed`: Sets `completed_at = NOW()`, requires `completed_by`
- `in_progress` → `issue`: Requires `issue_description`
- `completed` → `issue`: Requires `issue_description`
- `issue` → `in_progress`: Clears `issue_description`, sets `started_at` if null

---

## 4. Validation Rules

### R4.1: Time Window Validation

| Rule | Condition | Severity | Message |
|------|-----------|----------|---------|
| Pickup < Dropoff | pickup_time >= dropoff_time | ERROR | "Pickup time must be before dropoff time" |
| Pickup after event ends | pickup_time < from_event.event_end_time | WARNING | "Pickup scheduled before event ends. Confirm intentional." |
| Dropoff before event starts | dropoff_time > to_event.event_start_time | WARNING | "Delivery after event starts. May cause delays." |
| Same event check | from_event_id === to_event_id | ERROR | "Source and destination events must be different" |

### R4.2: Overnight Storage Detection

| Condition | Action |
|-----------|--------|
| from_event.event_date !== to_event.event_date | Show OvernightStorageDialog |
| User enters storage location | Append to handling_notes: "Overnight storage required. Location: {input}" |

---

## 5. Database Indexes

```sql
-- Existing indexes from schema
CREATE INDEX idx_repurposing_wedding ON repurposing_instructions(wedding_id);
CREATE INDEX idx_repurposing_item ON repurposing_instructions(wedding_item_id);
CREATE INDEX idx_repurposing_from_event ON repurposing_instructions(from_event_id);
CREATE INDEX idx_repurposing_to_event ON repurposing_instructions(to_event_id);
CREATE INDEX idx_repurposing_status ON repurposing_instructions(status);
CREATE INDEX idx_repurposing_responsible ON repurposing_instructions(responsible_party);
```

---

## 6. RLS Policies

```sql
-- RLS is enabled on repurposing_instructions table
-- Policies follow child table pattern per constitution

CREATE POLICY "Users can view repurposing instructions of their weddings"
  ON repurposing_instructions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = repurposing_instructions.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert repurposing instructions to their weddings"
  ON repurposing_instructions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = repurposing_instructions.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

CREATE POLICY "Users can update repurposing instructions of their weddings"
  ON repurposing_instructions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = repurposing_instructions.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete repurposing instructions from their weddings"
  ON repurposing_instructions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = repurposing_instructions.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

---

## 7. Related Entities Summary

| Entity | Relationship | On Delete |
|--------|--------------|-----------|
| weddings | Parent (wedding_id) | CASCADE |
| wedding_items | Reference (wedding_item_id) | CASCADE |
| events (from) | Reference (from_event_id) | CASCADE |
| events (to) | Reference (to_event_id) | CASCADE |
| vendors | Optional reference (responsible_vendor_id) | SET NULL |
