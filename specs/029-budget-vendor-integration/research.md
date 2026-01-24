# Research: Budget-Vendor Integration with Automatic Tracking

**Feature**: 029-budget-vendor-integration
**Date**: 2026-01-24
**Status**: Complete - All clarifications resolved

## Executive Summary

This document captures all technical research and decisions for implementing automatic budget-vendor integration. The user provided comprehensive specifications including exact database field names, TypeScript interfaces, business rules, and component requirements. No clarifications needed.

## Database Schema Decisions

### 1. Budget Category Types (New Lookup Table)

**Decision**: Create `budget_category_types` table with 18 predefined wedding categories.

**Rationale**:
- Consistent category names across all weddings
- Display order control for UI consistency
- Future-proof for localization or category expansion

**Schema**:
```sql
CREATE TABLE budget_category_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data (18 types)**:
1. Venue
2. Catering
3. Photography
4. Videography
5. Flowers & Florist
6. Music/DJ/Band
7. Cake & Desserts
8. Stationery & Invitations
9. Hair & Makeup
10. Transportation
11. Accommodation
12. Decor & Styling
13. Rentals & Equipment
14. Wedding Planner/Coordinator
15. Attire
16. Rings
17. Favors & Gifts
18. Other/Custom (display_order = 999)

### 2. Budget Categories Update

**Decision**: Add `category_type_id` and `custom_name` columns.

**Schema Changes**:
```sql
ALTER TABLE budget_categories
ADD COLUMN category_type_id UUID REFERENCES budget_category_types(id),
ADD COLUMN custom_name TEXT;

-- Constraint: custom_name required only when type is "Other/Custom"
ALTER TABLE budget_categories
ADD CONSTRAINT custom_name_required_for_other
CHECK (
  (category_type_id IS NULL) OR
  (category_type_id != (SELECT id FROM budget_category_types WHERE name = 'Other/Custom')) OR
  (custom_name IS NOT NULL AND custom_name != '')
);
```

### 3. Vendors Update

**Decision**: Add `default_budget_category_id` for automatic invoice allocation.

**Schema Change**:
```sql
ALTER TABLE vendors
ADD COLUMN default_budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL;
```

**Behavior**:
- When creating invoice, pre-fill budget category with vendor's default
- User can override per invoice
- If vendor has no default, dropdown is empty (user must select)

### 4. Budget Line Items Update

**Decision**: Add `vendor_invoice_id` for 1:1 linking with invoices.

**Schema Change**:
```sql
ALTER TABLE budget_line_items
ADD COLUMN vendor_invoice_id UUID UNIQUE REFERENCES vendor_invoices(id) ON DELETE CASCADE;

-- Ensure one line item per invoice
CREATE UNIQUE INDEX idx_budget_line_items_vendor_invoice
ON budget_line_items(vendor_invoice_id)
WHERE vendor_invoice_id IS NOT NULL;
```

## Field Naming Conventions

**CRITICAL**: All Supabase queries MUST use snake_case field names.

| TypeScript Interface | Database Column |
|---------------------|-----------------|
| `projectedAmount` | `projected_amount` |
| `actualAmount` | `actual_amount` |
| `categoryTypeId` | `category_type_id` |
| `customName` | `custom_name` |
| `defaultBudgetCategoryId` | `default_budget_category_id` |
| `vendorInvoiceId` | `vendor_invoice_id` |
| `paymentStatus` | `payment_status` |
| `displayOrder` | `display_order` |

## TypeScript Interfaces

### BudgetCategoryType
```typescript
interface BudgetCategoryType {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### BudgetCategory (Updated)
```typescript
interface BudgetCategory {
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
  // Computed fields (not in DB)
  invoicedUnpaid?: number;
  totalCommitted?: number;
  remaining?: number;
  percentageSpent?: number;
}
```

### BudgetLineItem (Updated)
```typescript
interface BudgetLineItem {
  id: string;
  categoryId: string;
  vendorId: string | null;
  vendorInvoiceId: string | null;
  description: string;
  projectedCost: number;
  actualCost: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Vendor (Updated)
```typescript
interface VendorDisplay {
  // ... existing fields ...
  defaultBudgetCategoryId: string | null;
  defaultBudgetCategory?: BudgetCategory; // Joined data
}
```

## Business Rules

### BR-001: Invoice Creation → Budget Line Item
```typescript
// When invoice is created:
const lineItem = {
  category_id: selectedBudgetCategoryId,
  vendor_id: vendorId,
  vendor_invoice_id: newInvoice.id,
  description: `Invoice ${invoiceNumber}`,
  projected_cost: invoiceTotal, // amount + vat_amount
  actual_cost: 0,
  payment_status: 'unpaid'
};
```

### BR-002: Payment Recording → Budget Update
```typescript
// When payment is recorded:
const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0) + newPayment.amount;
const invoiceTotal = invoice.amount + invoice.vat_amount;

lineItem.actual_cost = totalPaid;
lineItem.payment_status =
  totalPaid >= invoiceTotal ? 'paid' :
  totalPaid > 0 ? 'partially_paid' : 'unpaid';
```

### BR-003: Category Totals Recalculation
```typescript
// After any line item change:
category.projected_amount = SUM(line_items.projected_cost);
category.actual_amount = SUM(line_items.actual_cost);
```

### BR-004: Wedding Totals Recalculation
```typescript
// After any category change:
wedding.budget_total = SUM(categories.projected_amount);
wedding.budget_actual = SUM(categories.actual_amount);
```

### BR-005: Invoice Deletion → Cleanup
```typescript
// ON DELETE CASCADE handles line item removal
// Recalculate category and wedding totals
```

### BR-006: Payment Validation
```typescript
// Prevent over-payment:
const maxPayment = invoiceTotal - alreadyPaid;
if (newPayment.amount > maxPayment) {
  throw new ValidationError('Payment exceeds remaining balance');
}
```

### BR-007: Budget Display Calculations
```typescript
const invoicedUnpaid = projectedAmount - actualAmount;
const totalCommitted = actualAmount + invoicedUnpaid; // = projectedAmount
const remaining = projectedAmount - totalCommitted; // = 0 when fully invoiced
const percentageSpent = (actualAmount / projectedAmount) * 100;
```

### BR-008: Warning Thresholds
```typescript
const isNearLimit = percentageSpent >= 90 && percentageSpent < 100;
const isOverBudget = actualAmount > projectedAmount;
```

### BR-009: VAT Calculation
```typescript
const VAT_RATE = 0.15; // 15% South African VAT
const vatAmount = amount * VAT_RATE;
const total = amount + vatAmount;
```

### BR-010: Currency Formatting
```typescript
const formatCurrency = (amount: number): string => {
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
```

## Supabase Query Patterns

### Fetch Budget Categories with Types
```typescript
const { data } = await supabase
  .from('budget_categories')
  .select(`
    *,
    category_type:budget_category_types(*)
  `)
  .eq('wedding_id', weddingId)
  .order('category_type(display_order)');
```

### Fetch Vendors with Default Category
```typescript
const { data } = await supabase
  .from('vendors')
  .select(`
    *,
    default_budget_category:budget_categories(id, name)
  `)
  .eq('wedding_id', weddingId);
```

### Create Invoice with Budget Line Item (Transaction)
```typescript
// Step 1: Create invoice
const { data: invoice } = await supabase
  .from('vendor_invoices')
  .insert({ vendor_id, invoice_number, amount, vat_amount, ... })
  .select()
  .single();

// Step 2: Create budget line item
await supabase
  .from('budget_line_items')
  .insert({
    category_id: budgetCategoryId,
    vendor_id: vendorId,
    vendor_invoice_id: invoice.id,
    description: `Invoice ${invoice_number}`,
    projected_cost: amount + vat_amount,
    actual_cost: 0,
    payment_status: 'unpaid'
  });

// Step 3: Recalculate category totals (or use DB trigger)
```

### Update Line Item on Payment
```typescript
await supabase
  .from('budget_line_items')
  .update({
    actual_cost: newTotalPaid,
    payment_status: newStatus
  })
  .eq('vendor_invoice_id', invoiceId);
```

## Component Specifications

### AddInvoiceModal Updates
- Add budget category dropdown after amount field
- Pre-fill with vendor's default_budget_category_id
- Show category name with type icon
- Validation: budget category required

### RecordPaymentModal Updates
- Add budget impact preview section
- Show: "Budget Category: [name]"
- Show: "Current Actual: R X → New Actual: R Y"
- Calculate and display percentage change

### BudgetCategoryCard Updates
- Display: Projected | Actual (Paid) | Invoiced Unpaid | Remaining
- Progress bar showing percentage paid
- Warning badge at 90%, danger badge when over

### VendorCard Updates
- Show badge with default budget category name
- "Budget: [Category Name]" or "Budget: Not Set"

### OverviewTab Updates
- Add "Default Budget Category" dropdown field
- Populated with wedding's budget categories
- Optional field (can be null)

## Database Triggers (Recommended)

### Auto-Recalculate Category Totals
```sql
CREATE OR REPLACE FUNCTION recalculate_budget_category_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE budget_categories
  SET
    projected_amount = COALESCE((
      SELECT SUM(projected_cost)
      FROM budget_line_items
      WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    ), 0),
    actual_amount = COALESCE((
      SELECT SUM(actual_cost)
      FROM budget_line_items
      WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    ), 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.category_id, OLD.category_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_category_totals
AFTER INSERT OR UPDATE OR DELETE ON budget_line_items
FOR EACH ROW EXECUTE FUNCTION recalculate_budget_category_totals();
```

### Auto-Recalculate Wedding Totals
```sql
CREATE OR REPLACE FUNCTION recalculate_wedding_budget_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_wedding_id UUID;
BEGIN
  v_wedding_id := COALESCE(NEW.wedding_id, OLD.wedding_id);

  UPDATE weddings
  SET
    budget_total = COALESCE((
      SELECT SUM(projected_amount)
      FROM budget_categories
      WHERE wedding_id = v_wedding_id
    ), 0),
    budget_actual = COALESCE((
      SELECT SUM(actual_amount)
      FROM budget_categories
      WHERE wedding_id = v_wedding_id
    ), 0),
    updated_at = NOW()
  WHERE id = v_wedding_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_wedding_totals
AFTER INSERT OR UPDATE OR DELETE ON budget_categories
FOR EACH ROW EXECUTE FUNCTION recalculate_wedding_budget_totals();
```

## RLS Policies

### budget_category_types (Read-only, Public)
```sql
-- All authenticated users can read category types
CREATE POLICY "Authenticated users can view category types"
  ON budget_category_types FOR SELECT
  USING (auth.role() = 'authenticated');
```

### budget_categories (Wedding-scoped)
```sql
-- Standard wedding-scoped RLS (already exists, verify includes new columns)
```

### budget_line_items (Category-scoped via Wedding)
```sql
-- Standard category→wedding chain RLS (already exists)
```

## Migration Strategy

1. **Phase 1: Schema Changes**
   - Create budget_category_types table and seed data
   - Add columns to budget_categories, vendors, budget_line_items
   - Create indexes and constraints
   - Add RLS policies

2. **Phase 2: Trigger Functions**
   - Create recalculation triggers
   - Test with sample data

3. **Phase 3: Frontend Integration**
   - Update types and interfaces
   - Update hooks and mutations
   - Update components

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Existing invoices? | Remain as-is; only new invoices trigger integration |
| Category deletion? | Line items' category_id set to NULL; invoices retain data |
| Currency support? | ZAR only, no multi-currency |
| Over-payment handling? | Validation prevents; error shown to user |

## References

- Spec: [spec.md](./spec.md)
- Checklist: [checklists/requirements.md](./checklists/requirements.md)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
