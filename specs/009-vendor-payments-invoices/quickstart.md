# Quickstart: Vendor Payments & Invoices (Phase 7B)

**Date**: 2026-01-14
**Prerequisites**: Phase 7A Vendor Management complete

---

## Quick Setup

### 1. Verify Branch

```bash
git checkout 009-vendor-payments-invoices
git pull origin 009-vendor-payments-invoices
```

### 2. Install Dependencies

```bash
npm install
```

No new dependencies required - all packages from Phase 7A are sufficient.

### 3. Start Development Server

```bash
npm run dev
```

Access at: http://localhost:5173

### 4. Test Login

- **Email**: test@example.com
- **Password**: password123

---

## Development Workflow

### Component Development Order

1. **Types & Schemas** (foundation)
   - Add interfaces to `src/types/vendor.ts`
   - Create `src/schemas/paymentSchedule.ts`
   - Create `src/schemas/invoice.ts`
   - Create `src/schemas/vendorContact.ts`

2. **Status Logic** (business rules)
   - Create `src/lib/vendorPaymentStatus.ts`

3. **Hooks** (data layer)
   - Create `src/hooks/useVendorPayments.ts`
   - Create `src/hooks/useVendorPaymentMutations.ts`
   - Create `src/hooks/useVendorInvoices.ts`
   - Create `src/hooks/useVendorInvoiceMutations.ts`
   - Create `src/hooks/useVendorContacts.ts`
   - Create `src/hooks/useVendorContactMutations.ts`

4. **Components** (UI layer)
   - Status badges first (reusable)
   - Tables (display)
   - Modals (forms)
   - Dialogs (confirmations)
   - Tab containers

5. **Integration**
   - Update `VendorDetailPage.tsx` to use new tabs

---

## Testing Checklist

### Manual Testing with Playwright MCP

```bash
# Start dev server first
npm run dev

# Then use Playwright MCP commands in Claude
```

### Payment Schedule Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | View payments | Navigate to vendor → Payments tab | Table displays with status badges |
| 2 | Add payment | Click "Add Payment" → Fill form → Save | Payment appears in table |
| 3 | Edit payment | Click edit icon → Modify → Save | Changes persist |
| 4 | Mark as paid | Click "Mark as Paid" → Enter date → Confirm | Status changes to green "Paid" |
| 5 | Delete payment | Click delete → Confirm | Payment removed |
| 6 | Status badges | Create payments with various due dates | Correct colors shown |

### Invoice Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 7 | View invoices | Navigate to vendor → Invoices tab | Table displays |
| 8 | Add invoice | Click "Add Invoice" → Fill form → Save | Invoice appears |
| 9 | VAT calculation | Enter amount → VAT auto-calculates | Total = amount + VAT |
| 10 | Edit invoice | Click edit → Modify → Save | Changes persist |
| 11 | Delete invoice | Click delete → Confirm | Invoice removed |

### Contact Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 12 | View contacts | Overview tab → Contacts section | Contacts list displays |
| 13 | Add contact | Click "Add Contact" → Fill → Save | Contact appears |
| 14 | Edit contact | Click edit → Modify → Save | Changes persist |
| 15 | Delete contact | Click delete → Confirm | Contact removed |

---

## Key Files Reference

### Types (extend existing)

```typescript
// src/types/vendor.ts - ADD these interfaces

export interface VendorPaymentSchedule {
  id: string;
  vendor_id: string;
  milestone_name: string;
  due_date: string;
  amount: number;
  percentage: number | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorInvoice {
  id: string;
  vendor_id: string;
  payment_schedule_id: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorContact {
  id: string;
  vendor_id: string;
  contact_name: string;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_primary: boolean;
  is_onsite_contact: boolean;
  created_at: string;
  updated_at: string;
}
```

### Status Calculation

```typescript
// src/lib/vendorPaymentStatus.ts

import { differenceInDays } from 'date-fns';

export type PaymentDisplayStatus = 'pending' | 'due-soon' | 'overdue' | 'paid' | 'cancelled';

export interface PaymentStatusDisplay {
  status: PaymentDisplayStatus;
  label: string;
  color: string;
  icon: string;
}

export function getPaymentDisplayStatus(payment: {
  status: string;
  due_date: string;
  paid_date: string | null;
}): PaymentStatusDisplay {
  // Paid takes precedence
  if (payment.paid_date || payment.status === 'paid') {
    return { status: 'paid', label: 'Paid', color: '#4CAF50', icon: '✅' };
  }

  // Cancelled
  if (payment.status === 'cancelled') {
    return { status: 'cancelled', label: 'Cancelled', color: '#9E9E9E', icon: '⊘' };
  }

  const today = new Date();
  const dueDate = new Date(payment.due_date);
  const daysUntilDue = differenceInDays(dueDate, today);

  // Overdue
  if (daysUntilDue < 0) {
    return {
      status: 'overdue',
      label: `Overdue by ${Math.abs(daysUntilDue)} days`,
      color: '#F44336',
      icon: '❌'
    };
  }

  // Due soon (within 7 days)
  if (daysUntilDue <= 7) {
    return {
      status: 'due-soon',
      label: daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} days`,
      color: '#FF9800',
      icon: '⚠️'
    };
  }

  // Pending (more than 7 days away)
  return { status: 'pending', label: 'Pending', color: '#2196F3', icon: '⏳' };
}
```

---

## Common Patterns

### Query Hook Pattern

```typescript
// src/hooks/useVendorPayments.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VendorPaymentSchedule } from '@/types/vendor';

export function useVendorPayments(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-payments', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_payment_schedule')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as VendorPaymentSchedule[];
    },
    enabled: !!vendorId
  });
}
```

### Mutation Hook Pattern

```typescript
// src/hooks/useVendorPaymentMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useVendorPaymentMutations(vendorId: string) {
  const queryClient = useQueryClient();

  const createPayment = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const { data: payment, error } = await supabase
        .from('vendor_payment_schedule')
        .insert({ vendor_id: vendorId, ...data })
        .select()
        .single();

      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments', vendorId] });
      toast.success('Payment added successfully');
    },
    onError: () => {
      toast.error('Failed to add payment');
    }
  });

  // ... other mutations

  return { createPayment, /* ... */ };
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Payments not loading | Check vendorId is valid UUID |
| Status badge wrong color | Verify date comparison logic |
| VAT not calculating | Check amount field is number, not string |
| Toast not showing | Ensure Toaster component in layout |
| Form not submitting | Check Zod schema matches form fields |

### Debug Commands

```typescript
// Check Supabase connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Log query results
const { data } = useVendorPayments(vendorId);
console.log('Payments:', data);

// Check RLS is working
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id);
```

---

## Git Workflow

### Commit After Each Component Group

```bash
# After types & schemas
git add src/types/vendor.ts src/schemas/
git commit -m "Add payment/invoice/contact types and schemas"

# After hooks
git add src/hooks/
git commit -m "Add vendor payment/invoice/contact hooks"

# After components
git add src/components/vendors/
git commit -m "Add PaymentsTab, InvoicesTab, and ContactsSection components"

# After integration
git add src/pages/vendors/VendorDetailPage.tsx
git commit -m "Integrate Phase 7B tabs into VendorDetailPage"
```

### Final Push

```bash
git push origin 009-vendor-payments-invoices
```
