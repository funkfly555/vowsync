# API Contracts: Vendor Card Expandable

**Feature**: 028-vendor-card-expandable
**Date**: 2026-01-23

## Overview

All API operations use Supabase client with RLS enabled. No new API endpoints needed - using existing Supabase operations.

## Vendor Operations

### Fetch Vendors

**Query**: `useVendors(weddingId)`
**Table**: `vendors`

```typescript
const { data } = await supabase
  .from('vendors')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('company_name', { ascending: true });
```

**Response**:
```typescript
interface Vendor {
  id: string;
  wedding_id: string;
  vendor_type: VendorType;
  company_name: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  status: VendorStatus;
  contract_signed: boolean;
  contract_date: string | null;
  contract_expiry_date: string | null;
  contract_value: number | null;
  cancellation_policy: string | null;
  cancellation_fee_percentage: number | null;
  insurance_required: boolean;
  insurance_verified: boolean;
  insurance_expiry_date: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  branch_code: string | null;
  swift_code: string | null;
  created_at: string;
  updated_at: string;
}
```

### Update Vendor

**Mutation**: `useUpdateVendor`
**Table**: `vendors`

```typescript
const { data, error } = await supabase
  .from('vendors')
  .update({
    // Only include changed fields
    vendor_type: formData.vendor_type,
    company_name: formData.company_name,
    contact_name: formData.contact_name,
    contact_email: formData.contact_email || null,
    contact_phone: formData.contact_phone || null,
    address: formData.address || null,
    website: formData.website || null,
    notes: formData.notes || null,
    status: formData.status,
    contract_signed: formData.contract_signed,
    contract_date: formData.contract_date || null,
    contract_expiry_date: formData.contract_expiry_date || null,
    contract_value: parseFloat(formData.contract_value) || null,
    cancellation_policy: formData.cancellation_policy || null,
    cancellation_fee_percentage: parseFloat(formData.cancellation_fee_percentage) || null,
    insurance_required: formData.insurance_required,
    insurance_verified: formData.insurance_verified,
    insurance_expiry_date: formData.insurance_expiry_date || null,
    updated_at: new Date().toISOString(),
  })
  .eq('id', vendorId)
  .select()
  .single();
```

**Payload**:
```typescript
interface VendorUpdatePayload {
  vendor_id: string;
  data: Partial<Vendor>;
}
```

**Optimistic Update**:
```typescript
// In mutation config
onMutate: async ({ vendor_id, data }) => {
  await queryClient.cancelQueries({ queryKey: ['vendors', weddingId] });
  const previousVendors = queryClient.getQueryData(['vendors', weddingId]);

  queryClient.setQueryData(['vendors', weddingId], (old: Vendor[]) =>
    old.map((v) => (v.id === vendor_id ? { ...v, ...data } : v))
  );

  return { previousVendors };
},

onError: (err, { vendor_id }, context) => {
  queryClient.setQueryData(['vendors', weddingId], context.previousVendors);
  toast.error('Failed to save changes');
},

onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['vendors', weddingId] });
},
```

---

## Payment Operations

### Fetch Vendor Payments

**Query**: `useVendorPaymentSchedule(vendorId)`
**Table**: `vendor_payment_schedule`

```typescript
const { data } = await supabase
  .from('vendor_payment_schedule')
  .select('*')
  .eq('vendor_id', vendorId)
  .order('due_date', { ascending: true });
```

**Response**:
```typescript
interface VendorPaymentSchedule {
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
```

### Mark Payment as Paid

**Mutation**: `useMarkPaymentAsPaid`
**Table**: `vendor_payment_schedule`

```typescript
const { data, error } = await supabase
  .from('vendor_payment_schedule')
  .update({
    status: 'paid',
    paid_date: paidDate,  // ISO date string
    payment_method: paymentMethod || null,
    payment_reference: paymentReference || null,
    updated_at: new Date().toISOString(),
  })
  .eq('id', paymentId)
  .select()
  .single();
```

**Payload**:
```typescript
interface MarkPaymentAsPaidPayload {
  payment_id: string;
  paid_date: string;          // ISO date string
  payment_method?: string;
  payment_reference?: string;
}
```

**Cache Invalidation**:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['vendor-payments', vendorId] });
  queryClient.invalidateQueries({ queryKey: ['vendors', weddingId] });
  toast.success('Payment marked as paid');
},
```

---

## Invoice Operations

### Fetch Vendor Invoices

**Query**: `useVendorInvoices(vendorId)`
**Table**: `vendor_invoices`

```typescript
const { data } = await supabase
  .from('vendor_invoices')
  .select('*')
  .eq('vendor_id', vendorId)
  .order('invoice_date', { ascending: false });
```

**Response**:
```typescript
interface VendorInvoice {
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
```

### Mark Invoice as Paid

**Mutation**: `useMarkInvoiceAsPaid`
**Table**: `vendor_invoices`

```typescript
const { data, error } = await supabase
  .from('vendor_invoices')
  .update({
    status: 'paid',
    paid_date: paidDate,  // ISO date string
    payment_method: paymentMethod || null,
    payment_reference: paymentReference || null,
    updated_at: new Date().toISOString(),
  })
  .eq('id', invoiceId)
  .select()
  .single();
```

**Payload**:
```typescript
interface MarkInvoiceAsPaidPayload {
  invoice_id: string;
  paid_date: string;          // ISO date string
  payment_method?: string;
  payment_reference?: string;
}
```

**Cache Invalidation**:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['vendor-invoices', vendorId] });
  queryClient.invalidateQueries({ queryKey: ['vendors', weddingId] });
  toast.success('Invoice marked as paid');
},
```

---

## Contact Operations

### Fetch Vendor Contacts

**Query**: `useVendorContacts(vendorId)`
**Table**: `vendor_contacts`

```typescript
const { data } = await supabase
  .from('vendor_contacts')
  .select('*')
  .eq('vendor_id', vendorId)
  .order('is_primary', { ascending: false })
  .order('contact_name', { ascending: true });
```

**Response**:
```typescript
interface VendorContact {
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

**Note**: Contacts are read-only in this feature (per spec Out of Scope)

---

## Error Handling

### Error Response Format

```typescript
interface SupabaseError {
  message: string;
  code: string;
  details: string | null;
  hint: string | null;
}
```

### Error Handling Pattern

```typescript
const handleError = (error: SupabaseError) => {
  console.error('API Error:', error);

  // User-friendly messages
  if (error.code === 'PGRST116') {
    toast.error('Record not found');
  } else if (error.code === '23505') {
    toast.error('Duplicate entry');
  } else if (error.code === '42501') {
    toast.error('Permission denied');
  } else {
    toast.error('An error occurred. Please try again.');
  }
};
```

---

## Query Keys

| Query | Key Pattern |
|-------|-------------|
| All vendors | `['vendors', weddingId]` |
| Vendor payments | `['vendor-payments', vendorId]` |
| Vendor invoices | `['vendor-invoices', vendorId]` |
| Vendor contacts | `['vendor-contacts', vendorId]` |

---

## RLS Policies

All operations are protected by Row Level Security:

```sql
-- Vendors: Users can only access vendors for their weddings
CREATE POLICY "Users can view vendors for their weddings"
  ON vendors FOR SELECT
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update vendors for their weddings"
  ON vendors FOR UPDATE
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE user_id = auth.uid()
  ));

-- Similar policies exist for vendor_payment_schedule, vendor_invoices, vendor_contacts
```
