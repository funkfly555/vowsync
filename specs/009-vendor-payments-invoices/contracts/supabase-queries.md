# Supabase Query Contracts: Vendor Payments & Invoices

**Date**: 2026-01-14
**Description**: API contracts for Supabase database operations

---

## Payment Schedule Queries

### Fetch All Payments for Vendor

**Operation**: SELECT
**Table**: `vendor_payment_schedule`
**Use Case**: Display payment schedule table in PaymentsTab

```typescript
// Hook: useVendorPayments.ts
const { data: payments, isLoading, error } = useQuery({
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
```

**Response Type**:
```typescript
VendorPaymentSchedule[]
```

---

### Create Payment

**Operation**: INSERT
**Table**: `vendor_payment_schedule`
**Use Case**: Add new payment milestone

```typescript
// Hook: useVendorPaymentMutations.ts
const createPayment = useMutation({
  mutationFn: async (data: VendorPaymentScheduleFormData) => {
    const { data: payment, error } = await supabase
      .from('vendor_payment_schedule')
      .insert({
        vendor_id: vendorId,
        milestone_name: data.milestone_name,
        due_date: data.due_date,
        amount: data.amount,
        percentage: data.percentage || null,
        notes: data.notes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return payment;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-payments', vendorId] });
    toast.success('Payment added successfully');
  },
  onError: (error) => {
    toast.error('Failed to add payment');
    console.error('Create payment error:', error);
  }
});
```

**Request Body**:
```typescript
{
  milestone_name: string;
  due_date: string;      // "YYYY-MM-DD"
  amount: number;
  percentage?: number;
  notes?: string;
}
```

---

### Update Payment

**Operation**: UPDATE
**Table**: `vendor_payment_schedule`
**Use Case**: Edit payment details (only for unpaid payments)

```typescript
const updatePayment = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: Partial<VendorPaymentScheduleFormData> }) => {
    const { data: payment, error } = await supabase
      .from('vendor_payment_schedule')
      .update({
        milestone_name: data.milestone_name,
        due_date: data.due_date,
        amount: data.amount,
        percentage: data.percentage,
        notes: data.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return payment;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-payments', vendorId] });
    toast.success('Payment updated successfully');
  }
});
```

---

### Mark Payment as Paid

**Operation**: UPDATE
**Table**: `vendor_payment_schedule`
**Use Case**: Record payment completion

```typescript
const markAsPaid = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: MarkAsPaidFormData }) => {
    const { data: payment, error } = await supabase
      .from('vendor_payment_schedule')
      .update({
        status: 'paid',
        paid_date: data.paid_date,
        payment_method: data.payment_method || null,
        payment_reference: data.payment_reference || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return payment;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-payments', vendorId] });
    toast.success('Payment marked as paid');
  }
});
```

**Request Body**:
```typescript
{
  paid_date: string;           // "YYYY-MM-DD"
  payment_method?: string;     // "EFT", "Credit Card", "Cash"
  payment_reference?: string;  // Bank reference
}
```

---

### Delete Payment

**Operation**: DELETE
**Table**: `vendor_payment_schedule`
**Use Case**: Remove incorrect payment entry

```typescript
const deletePayment = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from('vendor_payment_schedule')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-payments', vendorId] });
    toast.success('Payment deleted');
  }
});
```

---

## Invoice Queries

### Fetch All Invoices for Vendor

**Operation**: SELECT
**Table**: `vendor_invoices`
**Use Case**: Display invoice table in InvoicesTab

```typescript
// Hook: useVendorInvoices.ts
const { data: invoices, isLoading, error } = useQuery({
  queryKey: ['vendor-invoices', vendorId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('vendor_invoices')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data as VendorInvoice[];
  },
  enabled: !!vendorId
});
```

---

### Create Invoice

**Operation**: INSERT
**Table**: `vendor_invoices`
**Use Case**: Add new invoice

```typescript
const createInvoice = useMutation({
  mutationFn: async (data: VendorInvoiceFormData) => {
    const { data: invoice, error } = await supabase
      .from('vendor_invoices')
      .insert({
        vendor_id: vendorId,
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        amount: data.amount,
        vat_amount: data.vat_amount,
        // total_amount is auto-calculated by database
        payment_schedule_id: data.payment_schedule_id || null,
        status: 'unpaid',
        notes: data.notes || null
      })
      .select()
      .single();

    if (error) throw error;
    return invoice;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-invoices', vendorId] });
    toast.success('Invoice added successfully');
  }
});
```

**Request Body**:
```typescript
{
  invoice_number: string;
  invoice_date: string;     // "YYYY-MM-DD"
  due_date: string;         // "YYYY-MM-DD"
  amount: number;           // Subtotal before VAT
  vat_amount: number;       // VAT amount
  payment_schedule_id?: string;  // Link to payment milestone
  notes?: string;
}
```

---

### Update Invoice

**Operation**: UPDATE
**Table**: `vendor_invoices`
**Use Case**: Edit invoice details

```typescript
const updateInvoice = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: Partial<VendorInvoiceFormData> }) => {
    const { data: invoice, error } = await supabase
      .from('vendor_invoices')
      .update({
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        amount: data.amount,
        vat_amount: data.vat_amount,
        payment_schedule_id: data.payment_schedule_id,
        notes: data.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return invoice;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-invoices', vendorId] });
    toast.success('Invoice updated successfully');
  }
});
```

---

### Mark Invoice as Paid

**Operation**: UPDATE
**Table**: `vendor_invoices`
**Use Case**: Record invoice payment

```typescript
const markInvoicePaid = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: MarkAsPaidFormData }) => {
    const { data: invoice, error } = await supabase
      .from('vendor_invoices')
      .update({
        status: 'paid',
        paid_date: data.paid_date,
        payment_method: data.payment_method || null,
        payment_reference: data.payment_reference || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return invoice;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-invoices', vendorId] });
    toast.success('Invoice marked as paid');
  }
});
```

---

### Delete Invoice

**Operation**: DELETE
**Table**: `vendor_invoices`
**Use Case**: Remove invoice entry

```typescript
const deleteInvoice = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from('vendor_invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-invoices', vendorId] });
    toast.success('Invoice deleted');
  }
});
```

---

## Contact Queries

### Fetch All Contacts for Vendor

**Operation**: SELECT
**Table**: `vendor_contacts`
**Use Case**: Display contacts in Overview tab

```typescript
// Hook: useVendorContacts.ts
const { data: contacts, isLoading, error } = useQuery({
  queryKey: ['vendor-contacts', vendorId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('vendor_contacts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('is_primary', { ascending: false })
      .order('contact_name', { ascending: true });

    if (error) throw error;
    return data as VendorContact[];
  },
  enabled: !!vendorId
});
```

---

### Create Contact

**Operation**: INSERT
**Table**: `vendor_contacts`
**Use Case**: Add additional contact person

```typescript
const createContact = useMutation({
  mutationFn: async (data: VendorContactFormData) => {
    const { data: contact, error } = await supabase
      .from('vendor_contacts')
      .insert({
        vendor_id: vendorId,
        contact_name: data.contact_name,
        contact_role: data.contact_role || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        is_primary: data.is_primary || false,
        is_onsite_contact: data.is_onsite_contact || false
      })
      .select()
      .single();

    if (error) throw error;
    return contact;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] });
    toast.success('Contact added successfully');
  }
});
```

---

### Update Contact

**Operation**: UPDATE
**Table**: `vendor_contacts`
**Use Case**: Edit contact details

```typescript
const updateContact = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: Partial<VendorContactFormData> }) => {
    const { data: contact, error } = await supabase
      .from('vendor_contacts')
      .update({
        contact_name: data.contact_name,
        contact_role: data.contact_role,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        is_primary: data.is_primary,
        is_onsite_contact: data.is_onsite_contact,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return contact;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] });
    toast.success('Contact updated successfully');
  }
});
```

---

### Delete Contact

**Operation**: DELETE
**Table**: `vendor_contacts`
**Use Case**: Remove contact

```typescript
const deleteContact = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from('vendor_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-contacts', vendorId] });
    toast.success('Contact deleted');
  }
});
```

---

## Error Handling Pattern

All queries follow this error handling pattern:

```typescript
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');

  if (error) throw error;
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('Failed to complete operation. Please try again.');
  throw error;
}
```

---

## Cache Invalidation Strategy

| Action | Invalidate Keys |
|--------|-----------------|
| Create payment | `['vendor-payments', vendorId]` |
| Update payment | `['vendor-payments', vendorId]` |
| Delete payment | `['vendor-payments', vendorId]` |
| Mark payment paid | `['vendor-payments', vendorId]` |
| Create invoice | `['vendor-invoices', vendorId]` |
| Update invoice | `['vendor-invoices', vendorId]` |
| Delete invoice | `['vendor-invoices', vendorId]` |
| Mark invoice paid | `['vendor-invoices', vendorId]` |
| Create contact | `['vendor-contacts', vendorId]` |
| Update contact | `['vendor-contacts', vendorId]` |
| Delete contact | `['vendor-contacts', vendorId]` |
