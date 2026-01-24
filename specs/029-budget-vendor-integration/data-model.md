# Data Model: Budget-Vendor Integration

**Feature**: 029-budget-vendor-integration
**Date**: 2026-01-24

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUDGET-VENDOR INTEGRATION                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ budget_category_types│  (NEW - Lookup Table)
├──────────────────────┤
│ id: UUID PK          │
│ name: TEXT UNIQUE    │
│ display_order: INT   │
│ created_at: TIMESTAMP│
│ updated_at: TIMESTAMP│
└──────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐         ┌──────────────────────┐
│  budget_categories   │  N:1    │      weddings        │
├──────────────────────┤◄────────├──────────────────────┤
│ id: UUID PK          │         │ id: UUID PK          │
│ wedding_id: UUID FK  │─────────│ budget_total: DECIMAL│ (recalculated)
│ category_type_id: FK │ (NEW)   │ budget_actual: DECIMAL│ (recalculated)
│ custom_name: TEXT    │ (NEW)   │ ...                  │
│ name: TEXT           │         └──────────────────────┘
│ projected_amount: DEC│ (recalculated)
│ actual_amount: DEC   │ (recalculated)
│ notes: TEXT          │
│ created_at: TIMESTAMP│
│ updated_at: TIMESTAMP│
└──────────────────────┘
         │
         │ 1:N                    ┌──────────────────────┐
         │                        │      vendors         │
         │                        ├──────────────────────┤
         │◄───────────────────────│ id: UUID PK          │
         │  default_budget_       │ wedding_id: UUID FK  │
         │  category_id (NEW)     │ default_budget_      │
         │                        │   category_id: FK    │ (NEW)
         │                        │ ...                  │
         ▼                        └──────────────────────┘
┌──────────────────────┐                    │
│  budget_line_items   │                    │ 1:N
├──────────────────────┤                    ▼
│ id: UUID PK          │         ┌──────────────────────┐
│ category_id: UUID FK │         │   vendor_invoices    │
│ vendor_id: UUID FK   │         ├──────────────────────┤
│ vendor_invoice_id: FK│ (NEW)   │ id: UUID PK          │
│ description: TEXT    │◄────────│ vendor_id: UUID FK   │
│ projected_cost: DEC  │  1:1    │ amount: DECIMAL      │
│ actual_cost: DEC     │         │ vat_amount: DECIMAL  │
│ payment_status: ENUM │         │ ...                  │
│ notes: TEXT          │         └──────────────────────┘
│ created_at: TIMESTAMP│                    │
│ updated_at: TIMESTAMP│                    │ 1:N
└──────────────────────┘                    ▼
                                 ┌──────────────────────┐
                                 │vendor_payment_schedule│
                                 ├──────────────────────┤
                                 │ id: UUID PK          │
                                 │ invoice_id: UUID FK  │
                                 │ amount: DECIMAL      │
                                 │ payment_date: DATE   │
                                 │ ...                  │
                                 └──────────────────────┘
```

## Table Definitions

### NEW: budget_category_types

```sql
CREATE TABLE budget_category_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed with 18 predefined types
INSERT INTO budget_category_types (name, display_order) VALUES
  ('Venue', 1),
  ('Catering', 2),
  ('Photography', 3),
  ('Videography', 4),
  ('Flowers & Florist', 5),
  ('Music/DJ/Band', 6),
  ('Cake & Desserts', 7),
  ('Stationery & Invitations', 8),
  ('Hair & Makeup', 9),
  ('Transportation', 10),
  ('Accommodation', 11),
  ('Decor & Styling', 12),
  ('Rentals & Equipment', 13),
  ('Wedding Planner/Coordinator', 14),
  ('Attire', 15),
  ('Rings', 16),
  ('Favors & Gifts', 17),
  ('Other/Custom', 999);

-- RLS: Read-only for authenticated users
ALTER TABLE budget_category_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view category types"
  ON budget_category_types FOR SELECT
  USING (auth.role() = 'authenticated');

-- Update trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON budget_category_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### UPDATED: budget_categories

```sql
-- Add new columns
ALTER TABLE budget_categories
ADD COLUMN category_type_id UUID REFERENCES budget_category_types(id) ON DELETE SET NULL,
ADD COLUMN custom_name TEXT;

-- Constraint: custom_name required when type is "Other/Custom"
ALTER TABLE budget_categories
ADD CONSTRAINT custom_name_required_for_other
CHECK (
  category_type_id IS NULL OR
  category_type_id != (SELECT id FROM budget_category_types WHERE name = 'Other/Custom') OR
  (custom_name IS NOT NULL AND TRIM(custom_name) != '')
);

-- Index for efficient type lookups
CREATE INDEX idx_budget_categories_type ON budget_categories(category_type_id);
```

### UPDATED: vendors

```sql
-- Add default budget category reference
ALTER TABLE vendors
ADD COLUMN default_budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL;

-- Index for efficient category lookups
CREATE INDEX idx_vendors_default_budget_category ON vendors(default_budget_category_id);
```

### UPDATED: budget_line_items

```sql
-- Add invoice reference
ALTER TABLE budget_line_items
ADD COLUMN vendor_invoice_id UUID REFERENCES vendor_invoices(id) ON DELETE CASCADE;

-- Ensure 1:1 relationship (one line item per invoice)
CREATE UNIQUE INDEX idx_budget_line_items_invoice
ON budget_line_items(vendor_invoice_id)
WHERE vendor_invoice_id IS NOT NULL;

-- Index for invoice lookups
CREATE INDEX idx_budget_line_items_vendor_invoice ON budget_line_items(vendor_invoice_id);

-- Add payment_status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budget_line_items' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE budget_line_items
    ADD COLUMN payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid'));
  END IF;
END $$;
```

## Trigger Functions

### Category Totals Recalculation

```sql
CREATE OR REPLACE FUNCTION recalculate_budget_category_totals()
RETURNS TRIGGER AS $$
DECLARE
  target_category_id UUID;
BEGIN
  -- Determine which category to recalculate
  target_category_id := COALESCE(NEW.category_id, OLD.category_id);

  -- Recalculate totals
  UPDATE budget_categories
  SET
    projected_amount = COALESCE((
      SELECT SUM(projected_cost)
      FROM budget_line_items
      WHERE category_id = target_category_id
    ), 0),
    actual_amount = COALESCE((
      SELECT SUM(actual_cost)
      FROM budget_line_items
      WHERE category_id = target_category_id
    ), 0),
    updated_at = NOW()
  WHERE id = target_category_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists and recreate
DROP TRIGGER IF EXISTS trigger_recalculate_category_totals ON budget_line_items;

CREATE TRIGGER trigger_recalculate_category_totals
AFTER INSERT OR UPDATE OF projected_cost, actual_cost, category_id OR DELETE
ON budget_line_items
FOR EACH ROW EXECUTE FUNCTION recalculate_budget_category_totals();
```

### Wedding Totals Recalculation

```sql
CREATE OR REPLACE FUNCTION recalculate_wedding_budget_totals()
RETURNS TRIGGER AS $$
DECLARE
  target_wedding_id UUID;
BEGIN
  -- Determine which wedding to recalculate
  target_wedding_id := COALESCE(NEW.wedding_id, OLD.wedding_id);

  -- Recalculate totals
  UPDATE weddings
  SET
    budget_total = COALESCE((
      SELECT SUM(projected_amount)
      FROM budget_categories
      WHERE wedding_id = target_wedding_id
    ), 0),
    budget_actual = COALESCE((
      SELECT SUM(actual_amount)
      FROM budget_categories
      WHERE wedding_id = target_wedding_id
    ), 0),
    updated_at = NOW()
  WHERE id = target_wedding_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists and recreate
DROP TRIGGER IF EXISTS trigger_recalculate_wedding_totals ON budget_categories;

CREATE TRIGGER trigger_recalculate_wedding_totals
AFTER INSERT OR UPDATE OF projected_amount, actual_amount, wedding_id OR DELETE
ON budget_categories
FOR EACH ROW EXECUTE FUNCTION recalculate_wedding_budget_totals();
```

## TypeScript Interfaces

### BudgetCategoryType

```typescript
export interface BudgetCategoryType {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Database row format (snake_case)
export interface BudgetCategoryTypeRow {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}
```

### BudgetCategory (Updated)

```typescript
export interface BudgetCategory {
  id: string;
  weddingId: string;
  name: string;
  categoryTypeId: string | null;
  customName: string | null;
  projectedAmount: number;
  actualAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined data
  categoryType?: BudgetCategoryType;
}

// Computed display values
export interface BudgetCategoryDisplay extends BudgetCategory {
  invoicedUnpaid: number;      // projected - actual
  totalCommitted: number;       // actual + invoicedUnpaid = projected
  remaining: number;            // projected - totalCommitted
  percentageSpent: number;      // (actual / projected) * 100
  isNearLimit: boolean;         // >= 90%
  isOverBudget: boolean;        // actual > projected
}

// Database row format
export interface BudgetCategoryRow {
  id: string;
  wedding_id: string;
  name: string;
  category_type_id: string | null;
  custom_name: string | null;
  projected_amount: number;
  actual_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### BudgetLineItem (Updated)

```typescript
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface BudgetLineItem {
  id: string;
  categoryId: string;
  vendorId: string | null;
  vendorInvoiceId: string | null;
  description: string;
  projectedCost: number;
  actualCost: number;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Database row format
export interface BudgetLineItemRow {
  id: string;
  category_id: string;
  vendor_id: string | null;
  vendor_invoice_id: string | null;
  description: string;
  projected_cost: number;
  actual_cost: number;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### Vendor (Updated)

```typescript
export interface VendorDisplay {
  // ... existing fields ...
  defaultBudgetCategoryId: string | null;
  // Joined data
  defaultBudgetCategory?: {
    id: string;
    name: string;
  };
}

// Database row format addition
export interface VendorRow {
  // ... existing fields ...
  default_budget_category_id: string | null;
}
```

## Calculation Functions

```typescript
/**
 * Calculate display values for a budget category
 */
export function calculateBudgetCategoryDisplay(
  category: BudgetCategory
): BudgetCategoryDisplay {
  const projected = category.projectedAmount || 0;
  const actual = category.actualAmount || 0;
  const invoicedUnpaid = projected - actual;
  const totalCommitted = actual + invoicedUnpaid;
  const remaining = projected - totalCommitted;
  const percentageSpent = projected > 0 ? (actual / projected) * 100 : 0;

  return {
    ...category,
    invoicedUnpaid,
    totalCommitted,
    remaining,
    percentageSpent,
    isNearLimit: percentageSpent >= 90 && percentageSpent < 100,
    isOverBudget: actual > projected,
  };
}

/**
 * Format currency in South African Rand
 */
export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate VAT at 15%
 */
export function calculateVAT(amount: number): number {
  return amount * 0.15;
}

/**
 * Calculate total including VAT
 */
export function calculateTotal(amount: number, vat: number): number {
  return amount + vat;
}
```

## Migration Script

```sql
-- Migration: 029_budget_vendor_integration
-- Description: Add budget-vendor integration with automatic tracking

-- 1. Create budget_category_types table
CREATE TABLE IF NOT EXISTS budget_category_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Seed category types
INSERT INTO budget_category_types (name, display_order) VALUES
  ('Venue', 1),
  ('Catering', 2),
  ('Photography', 3),
  ('Videography', 4),
  ('Flowers & Florist', 5),
  ('Music/DJ/Band', 6),
  ('Cake & Desserts', 7),
  ('Stationery & Invitations', 8),
  ('Hair & Makeup', 9),
  ('Transportation', 10),
  ('Accommodation', 11),
  ('Decor & Styling', 12),
  ('Rentals & Equipment', 13),
  ('Wedding Planner/Coordinator', 14),
  ('Attire', 15),
  ('Rings', 16),
  ('Favors & Gifts', 17),
  ('Other/Custom', 999)
ON CONFLICT (name) DO NOTHING;

-- 3. Enable RLS on budget_category_types
ALTER TABLE budget_category_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view category types"
  ON budget_category_types FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Add columns to budget_categories
ALTER TABLE budget_categories
ADD COLUMN IF NOT EXISTS category_type_id UUID REFERENCES budget_category_types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS custom_name TEXT;

-- 5. Add column to vendors
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS default_budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL;

-- 6. Add column to budget_line_items
ALTER TABLE budget_line_items
ADD COLUMN IF NOT EXISTS vendor_invoice_id UUID REFERENCES vendor_invoices(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid'));

-- 7. Create unique index for 1:1 invoice relationship
CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_line_items_invoice
ON budget_line_items(vendor_invoice_id)
WHERE vendor_invoice_id IS NOT NULL;

-- 8. Create recalculation triggers (defined above)
-- See Trigger Functions section

-- 9. Update trigger for budget_category_types
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON budget_category_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Indexes Summary

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| budget_category_types | PRIMARY | id | Primary key |
| budget_category_types | UNIQUE | name | Prevent duplicate types |
| budget_categories | idx_budget_categories_type | category_type_id | Type lookups |
| vendors | idx_vendors_default_budget_category | default_budget_category_id | Category lookups |
| budget_line_items | idx_budget_line_items_invoice | vendor_invoice_id (UNIQUE WHERE NOT NULL) | 1:1 invoice relationship |
| budget_line_items | idx_budget_line_items_vendor_invoice | vendor_invoice_id | Invoice lookups |
