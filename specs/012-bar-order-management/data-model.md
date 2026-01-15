# Data Model: Bar Order Management

**Feature Branch**: `012-bar-order-management`
**Created**: 2026-01-15
**Database**: Supabase PostgreSQL (tables already exist)

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    weddings     │       │     events      │       │    vendors      │
│─────────────────│       │─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ consultant_id   │       │ wedding_id (FK) │       │ wedding_id (FK) │
│ ...             │       │ name            │       │ business_name   │
└────────┬────────┘       │ start_time      │       │ ...             │
         │                │ end_time        │       └────────┬────────┘
         │                │ ...             │                │
         │                └────────┬────────┘                │
         │                         │                         │
         │ 1                       │ 0..1                    │ 0..1
         │                         │                         │
         ▼ *                       ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           bar_orders                                 │
│─────────────────────────────────────────────────────────────────────│
│ id (PK)                    UUID                                      │
│ wedding_id (FK)            UUID NOT NULL → weddings.id CASCADE       │
│ event_id (FK)              UUID NULL → events.id SET NULL            │
│ vendor_id (FK)             UUID NULL → vendors.id SET NULL           │
│ name                       VARCHAR(100) NOT NULL                     │
│ guest_count_adults         INTEGER NOT NULL                          │
│ event_duration_hours       NUMERIC(4,2) NOT NULL                     │
│ first_hours                NUMERIC(4,2) NOT NULL DEFAULT 2           │
│ first_hours_drinks_per_hour NUMERIC(4,2) NOT NULL DEFAULT 2          │
│ remaining_hours_drinks_per_hour NUMERIC(4,2) NOT NULL DEFAULT 1      │
│ total_servings_per_person  NUMERIC(6,2) GENERATED                    │
│ status                     bar_order_status NOT NULL DEFAULT 'draft' │
│ notes                      TEXT NULL                                 │
│ created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()        │
│ updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ 1
                                 │
                                 ▼ *
┌─────────────────────────────────────────────────────────────────────┐
│                        bar_order_items                               │
│─────────────────────────────────────────────────────────────────────│
│ id (PK)                    UUID                                      │
│ bar_order_id (FK)          UUID NOT NULL → bar_orders.id CASCADE     │
│ item_name                  VARCHAR(100) NOT NULL                     │
│ percentage                 NUMERIC(5,4) NOT NULL                     │
│ servings_per_unit          INTEGER NOT NULL                          │
│ cost_per_unit              NUMERIC(10,2) NULL                        │
│ calculated_servings        NUMERIC(10,2) GENERATED                   │
│ units_needed               INTEGER GENERATED                         │
│ total_cost                 NUMERIC(12,2) GENERATED                   │
│ sort_order                 INTEGER NOT NULL DEFAULT 0                │
│ created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()        │
│ updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()        │
└─────────────────────────────────────────────────────────────────────┘
```

## TypeScript Interfaces

### Bar Order

```typescript
// types/barOrder.ts

export type BarOrderStatus = 'draft' | 'confirmed' | 'ordered' | 'delivered';

export interface BarOrder {
  id: string;
  wedding_id: string;
  event_id: string | null;
  vendor_id: string | null;
  name: string;
  guest_count_adults: number;
  event_duration_hours: number;
  first_hours: number;
  first_hours_drinks_per_hour: number;
  remaining_hours_drinks_per_hour: number;
  total_servings_per_person: number; // GENERATED
  status: BarOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BarOrderItem {
  id: string;
  bar_order_id: string;
  item_name: string;
  percentage: number;
  servings_per_unit: number;
  cost_per_unit: number | null;
  calculated_servings: number;   // GENERATED
  units_needed: number;          // GENERATED
  total_cost: number | null;     // GENERATED
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface BarOrderWithRelations extends BarOrder {
  event: {
    name: string;
    start_time: string;
    end_time: string;
  } | null;
  vendor: {
    business_name: string;
  } | null;
  items: BarOrderItem[];
}

// Form data types (without generated/readonly fields)
export interface BarOrderFormData {
  name: string;
  event_id: string | null;
  vendor_id: string | null;
  guest_count_adults: number;
  event_duration_hours: number;
  first_hours: number;
  first_hours_drinks_per_hour: number;
  remaining_hours_drinks_per_hour: number;
  status: BarOrderStatus;
  notes: string | null;
}

export interface BarOrderItemFormData {
  item_name: string;
  percentage: number;
  servings_per_unit: number;
  cost_per_unit: number | null;
  sort_order: number;
}

// Summary types for aggregation
export interface BarOrderSummary {
  totalUnits: number;
  totalCost: number;
  totalPercentage: number;
  itemCount: number;
}
```

## Database Schema (Existing)

### ENUM Type

```sql
-- Already exists
CREATE TYPE bar_order_status AS ENUM ('draft', 'confirmed', 'ordered', 'delivered');
```

### bar_orders Table

```sql
-- Already exists with GENERATED column
CREATE TABLE bar_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  guest_count_adults INTEGER NOT NULL CHECK (guest_count_adults >= 0),
  event_duration_hours NUMERIC(4,2) NOT NULL CHECK (event_duration_hours > 0 AND event_duration_hours <= 24),
  first_hours NUMERIC(4,2) NOT NULL DEFAULT 2 CHECK (first_hours >= 0),
  first_hours_drinks_per_hour NUMERIC(4,2) NOT NULL DEFAULT 2 CHECK (first_hours_drinks_per_hour >= 0),
  remaining_hours_drinks_per_hour NUMERIC(4,2) NOT NULL DEFAULT 1 CHECK (remaining_hours_drinks_per_hour >= 0),
  total_servings_per_person NUMERIC(6,2) GENERATED ALWAYS AS (
    (first_hours * first_hours_drinks_per_hour) +
    (GREATEST(event_duration_hours - first_hours, 0) * remaining_hours_drinks_per_hour)
  ) STORED,
  status bar_order_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT first_hours_lte_duration CHECK (first_hours <= event_duration_hours)
);
```

### bar_order_items Table

```sql
-- Already exists with GENERATED columns
CREATE TABLE bar_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_order_id UUID NOT NULL REFERENCES bar_orders(id) ON DELETE CASCADE,
  item_name VARCHAR(100) NOT NULL,
  percentage NUMERIC(5,4) NOT NULL CHECK (percentage > 0 AND percentage <= 1),
  servings_per_unit INTEGER NOT NULL CHECK (servings_per_unit > 0),
  cost_per_unit NUMERIC(10,2) CHECK (cost_per_unit >= 0),
  calculated_servings NUMERIC(10,2) GENERATED ALWAYS AS (
    -- Note: This requires a trigger or view since GENERATED can't reference other tables
    -- Actual implementation uses a trigger to compute this
  ) STORED,
  units_needed INTEGER GENERATED ALWAYS AS (
    CEIL(calculated_servings / servings_per_unit)
  ) STORED,
  total_cost NUMERIC(12,2) GENERATED ALWAYS AS (
    units_needed * cost_per_unit
  ) STORED,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Row Level Security (Existing)

```sql
-- Already exists
ALTER TABLE bar_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_order_items ENABLE ROW LEVEL SECURITY;

-- bar_orders policies
CREATE POLICY "Users can view bar orders of their weddings"
  ON bar_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM weddings
    WHERE weddings.id = bar_orders.wedding_id
    AND weddings.consultant_id = auth.uid()
  ));

CREATE POLICY "Users can insert bar orders to their weddings"
  ON bar_orders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM weddings
    WHERE weddings.id = bar_orders.wedding_id
    AND weddings.consultant_id = auth.uid()
  ));

CREATE POLICY "Users can update bar orders of their weddings"
  ON bar_orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM weddings
    WHERE weddings.id = bar_orders.wedding_id
    AND weddings.consultant_id = auth.uid()
  ));

CREATE POLICY "Users can delete bar orders of their weddings"
  ON bar_orders FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM weddings
    WHERE weddings.id = bar_orders.wedding_id
    AND weddings.consultant_id = auth.uid()
  ));

-- bar_order_items policies (via bar_orders)
CREATE POLICY "Users can view bar order items of their weddings"
  ON bar_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bar_orders
    JOIN weddings ON weddings.id = bar_orders.wedding_id
    WHERE bar_orders.id = bar_order_items.bar_order_id
    AND weddings.consultant_id = auth.uid()
  ));

-- Similar INSERT, UPDATE, DELETE policies for bar_order_items
```

## Indexes (Existing)

```sql
-- Already exists
CREATE INDEX idx_bar_orders_wedding_id ON bar_orders(wedding_id);
CREATE INDEX idx_bar_orders_event_id ON bar_orders(event_id);
CREATE INDEX idx_bar_orders_vendor_id ON bar_orders(vendor_id);
CREATE INDEX idx_bar_orders_status ON bar_orders(status);
CREATE INDEX idx_bar_order_items_bar_order_id ON bar_order_items(bar_order_id);
CREATE INDEX idx_bar_order_items_sort_order ON bar_order_items(bar_order_id, sort_order);
```

## Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| name | 1-100 characters | "Name must be 1-100 characters" |
| guest_count_adults | >= 0 | "Guest count must be 0 or more" |
| event_duration_hours | 0 < x <= 24 | "Duration must be between 0 and 24 hours" |
| first_hours | 0 <= x <= duration | "First hours cannot exceed event duration" |
| percentage | 0 < x <= 1 | "Percentage must be between 0% and 100%" |
| servings_per_unit | > 0 | "Servings per unit must be positive" |
| cost_per_unit | >= 0 or null | "Cost must be 0 or more" |

## Calculation Formulas

### Total Servings Per Person (GENERATED)
```
total_servings_per_person =
  (first_hours × first_hours_drinks_per_hour) +
  (MAX(event_duration_hours - first_hours, 0) × remaining_hours_drinks_per_hour)
```

### Calculated Servings (per item)
```
calculated_servings =
  bar_order.total_servings_per_person ×
  item.percentage ×
  bar_order.guest_count_adults
```

### Units Needed
```
units_needed = CEIL(calculated_servings / servings_per_unit)
```

### Total Cost (per item)
```
total_cost = units_needed × cost_per_unit  (null if cost_per_unit is null)
```

### Order Summary Totals
```
totalUnits = SUM(items.units_needed)
totalCost = SUM(items.total_cost) where total_cost is not null
totalPercentage = SUM(items.percentage)
```
