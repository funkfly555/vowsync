# Quickstart: Budget-Vendor Integration

**Feature**: 029-budget-vendor-integration
**Date**: 2026-01-24

## Overview

This feature adds automatic synchronization between vendor invoices/payments and the wedding budget system. When you create an invoice, a budget line item is automatically created. When you record a payment, the budget actuals update in real-time.

## Key Changes

### Database

1. **New Table**: `budget_category_types` - 18 predefined wedding budget categories
2. **Updated**: `budget_categories` - Added `category_type_id` and `custom_name`
3. **Updated**: `vendors` - Added `default_budget_category_id`
4. **Updated**: `budget_line_items` - Added `vendor_invoice_id` and `payment_status`

### Components

1. **AddInvoiceModal** - Now includes budget category selector
2. **RecordPaymentModal** - Now shows budget impact preview
3. **BudgetCategoryCard** - Enhanced display with progress bar
4. **VendorCard** - Shows default budget category badge
5. **OverviewTab** - New "Default Budget Category" field

## Quick Implementation Guide

### Step 1: Run Database Migration

```sql
-- See data-model.md for full migration script
-- Key tables to create/update:
-- 1. budget_category_types (new)
-- 2. budget_categories (add columns)
-- 3. vendors (add column)
-- 4. budget_line_items (add columns)
-- 5. Trigger functions for auto-recalculation
```

### Step 2: Add Types

```typescript
// src/types/budget.ts

export interface BudgetCategoryType {
  id: string;
  name: string;
  displayOrder: number;
}

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface BudgetLineItem {
  id: string;
  categoryId: string;
  vendorId: string | null;
  vendorInvoiceId: string | null;
  projectedCost: number;
  actualCost: number;
  paymentStatus: PaymentStatus;
}
```

### Step 3: Create Hook for Category Types

```typescript
// src/hooks/useBudgetCategoryTypes.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useBudgetCategoryTypes() {
  return useQuery({
    queryKey: ['budget-category-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_category_types')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data;
    },
    staleTime: Infinity, // Rarely changes
  });
}
```

### Step 4: Update AddInvoiceModal

```typescript
// Add budget category selector after amount field
<FormField
  control={form.control}
  name="budgetCategoryId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Budget Category *</FormLabel>
      <Select
        value={field.value}
        onValueChange={field.onChange}
        defaultValue={vendor?.defaultBudgetCategoryId}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {budgetCategories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Step 5: Update Invoice Creation Mutation

```typescript
// In useVendorInvoiceMutations.ts

const createInvoice = useMutation({
  mutationFn: async ({ vendorId, data }) => {
    // Step 1: Create invoice
    const { data: invoice, error } = await supabase
      .from('vendor_invoices')
      .insert({ vendor_id: vendorId, ...data })
      .select()
      .single();

    if (error) throw error;

    // Step 2: Create budget line item
    const invoiceTotal = data.amount + data.vat_amount;
    await supabase.from('budget_line_items').insert({
      category_id: data.budgetCategoryId,
      vendor_id: vendorId,
      vendor_invoice_id: invoice.id,
      description: `Invoice ${data.invoice_number}`,
      projected_cost: invoiceTotal,
      actual_cost: 0,
      payment_status: 'unpaid',
    });

    return invoice;
  },
});
```

### Step 6: Update Payment Recording

```typescript
// In payment recording mutation

const recordPayment = useMutation({
  mutationFn: async ({ invoiceId, data }) => {
    // Get existing payments
    const { data: invoice } = await supabase
      .from('vendor_invoices')
      .select('*, payments:vendor_payment_schedule(*)')
      .eq('id', invoiceId)
      .single();

    const invoiceTotal = invoice.amount + invoice.vat_amount;
    const existingPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const newTotalPaid = existingPaid + data.amount;

    // Validate
    if (data.amount > invoiceTotal - existingPaid) {
      throw new Error('Payment exceeds remaining balance');
    }

    // Create payment
    const { data: payment } = await supabase
      .from('vendor_payment_schedule')
      .insert({ invoice_id: invoiceId, ...data })
      .select()
      .single();

    // Update budget line item
    const newStatus = newTotalPaid >= invoiceTotal
      ? 'paid'
      : newTotalPaid > 0
      ? 'partially_paid'
      : 'unpaid';

    await supabase
      .from('budget_line_items')
      .update({
        actual_cost: newTotalPaid,
        payment_status: newStatus,
      })
      .eq('vendor_invoice_id', invoiceId);

    return payment;
  },
});
```

## Testing Checklist

- [ ] Create invoice → verify budget line item created
- [ ] Verify budget category pre-fills from vendor default
- [ ] Record full payment → verify status becomes 'paid'
- [ ] Record partial payment → verify status becomes 'partially_paid'
- [ ] Verify budget totals recalculate automatically
- [ ] Delete invoice → verify line item and totals update
- [ ] Set vendor default category → verify persistence
- [ ] Test "Other/Custom" category requires custom name

## Key Business Rules

1. **Invoice Total** = amount + vat_amount (15% VAT)
2. **Payment Status** = 'paid' if totalPaid >= invoiceTotal
3. **Budget Calculations**:
   - Invoiced Unpaid = projected - actual
   - Percentage Spent = (actual / projected) × 100
4. **Warnings**: 90% threshold, over-budget alert
5. **Currency**: South African Rand (ZAR), format: `R X,XXX.XX`

## Files to Create/Update

| File | Action | Purpose |
|------|--------|---------|
| `src/types/budget.ts` | UPDATE | Add new interfaces |
| `src/hooks/useBudgetCategoryTypes.ts` | NEW | Fetch category types |
| `src/hooks/useBudgetCategories.ts` | UPDATE | Include type joins |
| `src/hooks/useVendorInvoiceMutations.ts` | UPDATE | Budget integration |
| `src/lib/budgetCalculations.ts` | NEW | Calculation utilities |
| `src/components/vendors/modals/AddInvoiceModal.tsx` | UPDATE | Category selector |
| `src/components/vendors/modals/RecordPaymentModal.tsx` | UPDATE | Impact preview |
| `src/components/budget/BudgetProgressBar.tsx` | NEW | Visual indicator |
| `src/components/vendors/tabs/OverviewTab.tsx` | UPDATE | Default category |
| `src/schemas/vendor.ts` | UPDATE | Add category field |

## References

- [Specification](./spec.md)
- [Data Model](./data-model.md)
- [Research](./research.md)
- [Contracts](./contracts/)
