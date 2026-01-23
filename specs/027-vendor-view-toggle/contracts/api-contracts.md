# API Contracts: Vendors View Toggle

**Branch**: `027-vendor-view-toggle` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)

## Overview

All API operations use the Supabase client with RLS (Row Level Security) enabled. No custom API endpoints are needed.

---

## Read Operations

### Fetch Vendors with Aggregates

Fetches all vendors for a wedding with computed aggregate counts.

**Query**:
```typescript
// Main vendors query
const { data: vendors, error } = await supabase
  .from('vendors')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('company_name', { ascending: true });

// Contacts count per vendor
const { data: contactsCounts } = await supabase
  .from('vendor_contacts')
  .select('vendor_id')
  .eq('wedding_id', weddingId);

// Payments count per vendor
const { data: paymentsCounts } = await supabase
  .from('vendor_payment_schedule')
  .select('vendor_id')
  .eq('wedding_id', weddingId);

// Invoices count per vendor
const { data: invoicesCounts } = await supabase
  .from('vendor_invoices')
  .select('vendor_id')
  .eq('wedding_id', weddingId);
```

**Response Shape**:
```typescript
interface VendorWithAggregates {
  // All 27 vendor fields from database
  id: string;
  wedding_id: string;
  vendor_type: string;
  company_name: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'backup';
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

  // Computed aggregates
  contacts_count: number;
  payments_count: number;
  invoices_count: number;
}
```

**Error Handling**:
```typescript
if (error) {
  console.error('Failed to fetch vendors:', error);
  throw new Error('Failed to load vendors');
}
```

---

## Write Operations

### Update Single Vendor Field

Updates a single field on a vendor record (inline edit).

**Mutation**:
```typescript
const { error } = await supabase
  .from('vendors')
  .update({ [field]: value })
  .eq('id', vendorId)
  .eq('wedding_id', weddingId);
```

**Parameters**:
```typescript
interface UpdateVendorFieldParams {
  vendorId: string;
  weddingId: string;
  field: keyof Vendor;  // e.g., 'contact_email', 'contract_value'
  value: string | boolean | number | null;
}
```

**Response**:
- Success: No data returned, error is null
- Failure: error object with message

**Validation** (client-side before mutation):
```typescript
// Required fields cannot be null/empty
if (['vendor_type', 'company_name', 'contact_name'].includes(field) && !value) {
  throw new Error(`${field} is required`);
}

// Email validation
if (field === 'contact_email' && value && !isValidEmail(value)) {
  throw new Error('Invalid email format');
}

// URL validation
if (field === 'website' && value && !isValidUrl(value)) {
  throw new Error('Website must start with http:// or https://');
}

// Percentage validation
if (field === 'cancellation_fee_percentage' && value !== null) {
  if (value < 0 || value > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
}

// Positive number validation
if (field === 'contract_value' && value !== null && value <= 0) {
  throw new Error('Contract value must be positive');
}
```

---

## TanStack Query Integration

### Query Key Structure

```typescript
// Main vendors table data
['vendor-table-data', weddingId]

// Individual vendor (for optimistic updates)
['vendor', vendorId]

// Related data for cache invalidation
['vendors', weddingId]  // Existing vendor list query
```

### Query Configuration

```typescript
const vendorTableQuery = useQuery({
  queryKey: ['vendor-table-data', weddingId],
  queryFn: () => fetchVendorsWithAggregates(weddingId),
  staleTime: 30_000,        // 30 seconds
  gcTime: 5 * 60 * 1000,    // 5 minutes (formerly cacheTime)
  enabled: !!weddingId,
  refetchOnWindowFocus: false,
});
```

### Mutation with Optimistic Updates

```typescript
const updateVendorCell = useMutation({
  mutationFn: async (payload: UpdateVendorFieldParams) => {
    const { error } = await supabase
      .from('vendors')
      .update({ [payload.field]: payload.value })
      .eq('id', payload.vendorId)
      .eq('wedding_id', payload.weddingId);

    if (error) throw error;
  },

  // Optimistic update
  onMutate: async (payload) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: ['vendor-table-data', payload.weddingId],
    });

    // Snapshot previous value
    const previousData = queryClient.getQueryData<VendorTableRow[]>([
      'vendor-table-data',
      payload.weddingId,
    ]);

    // Optimistically update
    queryClient.setQueryData<VendorTableRow[]>(
      ['vendor-table-data', payload.weddingId],
      (old) =>
        old?.map((row) =>
          row.id === payload.vendorId
            ? { ...row, [payload.field]: payload.value }
            : row
        )
    );

    return { previousData };
  },

  // Rollback on error
  onError: (err, payload, context) => {
    if (context?.previousData) {
      queryClient.setQueryData(
        ['vendor-table-data', payload.weddingId],
        context.previousData
      );
    }
    toast.error('Failed to save changes');
  },

  // Refetch on success
  onSettled: (_, __, payload) => {
    queryClient.invalidateQueries({
      queryKey: ['vendor-table-data', payload.weddingId],
    });
    queryClient.invalidateQueries({
      queryKey: ['vendors', payload.weddingId],
    });
  },
});
```

---

## Performance Considerations

### Aggregate Count Optimization

Instead of fetching full related records, use count queries:

```typescript
// Efficient: Count only
const { count } = await supabase
  .from('vendor_contacts')
  .select('*', { count: 'exact', head: true })
  .eq('vendor_id', vendorId);

// Alternative: Group counts in single query
const { data } = await supabase
  .from('vendor_contacts')
  .select('vendor_id')
  .eq('wedding_id', weddingId);

const countsByVendor = data?.reduce((acc, row) => {
  acc[row.vendor_id] = (acc[row.vendor_id] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

### Parallel Fetching

Fetch all data in parallel to minimize load time:

```typescript
const [vendors, contacts, payments, invoices] = await Promise.all([
  supabase.from('vendors').select('*').eq('wedding_id', weddingId),
  supabase.from('vendor_contacts').select('vendor_id').eq('wedding_id', weddingId),
  supabase.from('vendor_payment_schedule').select('vendor_id').eq('wedding_id', weddingId),
  supabase.from('vendor_invoices').select('vendor_id').eq('wedding_id', weddingId),
]);
```

---

## Error Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| PGRST116 | RLS violation | "You don't have permission to modify this vendor" |
| 23505 | Unique constraint | "A vendor with this name already exists" |
| 23503 | Foreign key violation | "Invalid vendor or wedding reference" |
| 22P02 | Invalid input syntax | "Invalid value format" |

---

## Rate Limiting

Supabase client handles rate limiting automatically. For inline edits with debounce:

```typescript
// Debounce inline edits (500ms per spec)
const debouncedSave = useMemo(
  () => debounce((payload: UpdateVendorFieldParams) => {
    updateVendorCell.mutate(payload);
  }, 500),
  [updateVendorCell]
);
```

---

## Security Notes

1. **RLS Enabled**: All tables have Row Level Security. Users can only access vendors for weddings they're associated with.

2. **No Sensitive Data Exposure**: account_number is masked in the UI (last 4 digits) but stored in full in the database.

3. **Input Validation**: All inputs are validated client-side before mutation and server-side via Supabase constraints.

4. **No API Keys in Client**: Supabase client uses anon key which is safe for client-side use with RLS.
