# API Contracts: Vendor Management

**Feature**: 008-vendor-management | **Date**: 2026-01-14

## Overview

This document defines the API contracts for vendor management operations. All operations use Supabase client with Row Level Security (RLS) enforced at the database level.

---

## Endpoints Summary

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| List Vendors | GET | `/vendors?wedding_id=:id` | Fetch all vendors for a wedding |
| Get Vendor | GET | `/vendors/:id` | Fetch single vendor details |
| Create Vendor | POST | `/vendors` | Create new vendor |
| Update Vendor | PATCH | `/vendors/:id` | Update existing vendor |
| Delete Vendor | DELETE | `/vendors/:id` | Delete vendor (cascade) |

---

## List Vendors

### Request

```typescript
// TanStack Query hook pattern
const queryKey = ['vendors', weddingId, filters];

// Supabase query
const { data, error } = await supabase
  .from('vendors')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('company_name', { ascending: true });
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| wedding_id | UUID | Yes | Filter by wedding |

### Response

```typescript
interface ListVendorsResponse {
  success: true;
  data: Vendor[];
  meta: {
    total: number;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "wedding_id": "987fcdeb-51a2-3bc4-d567-890123456789",
      "vendor_type": "Photography",
      "company_name": "Elegant Captures",
      "contact_name": "Sarah Johnson",
      "contact_email": "sarah@elegantcaptures.com",
      "contact_phone": "+1-555-0123",
      "address": "123 Main St, Anytown, USA",
      "website": "https://elegantcaptures.com",
      "contract_signed": true,
      "contract_date": "2026-01-01",
      "contract_expiry_date": "2026-12-31",
      "contract_value": 5000.00,
      "cancellation_policy": "50% refund if cancelled 30+ days before event",
      "cancellation_fee_percentage": 50.00,
      "insurance_required": true,
      "insurance_verified": true,
      "insurance_expiry_date": "2026-12-31",
      "bank_name": "First National Bank",
      "account_name": "Elegant Captures LLC",
      "account_number": "****4567",
      "branch_code": "012345",
      "swift_code": "FNBKUS44",
      "notes": "Preferred photographer",
      "status": "active",
      "created_at": "2026-01-14T10:30:00Z",
      "updated_at": "2026-01-14T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### Client-Side Filtering

```typescript
// Search filter (FR-003)
const searchFilter = (vendors: VendorDisplay[], search: string) =>
  vendors.filter(v =>
    v.company_name.toLowerCase().includes(search.toLowerCase()) ||
    v.contact_name.toLowerCase().includes(search.toLowerCase())
  );

// Type filter (FR-004)
const typeFilter = (vendors: VendorDisplay[], type: VendorType | 'all') =>
  type === 'all' ? vendors : vendors.filter(v => v.vendor_type === type);

// Contract status filter (FR-004)
const contractStatusFilter = (vendors: VendorDisplay[], status: ContractStatusLabel | 'all') =>
  status === 'all' ? vendors : vendors.filter(v => v.contractStatus.label === status);
```

---

## Get Vendor

### Request

```typescript
const { data, error } = await supabase
  .from('vendors')
  .select('*')
  .eq('id', vendorId)
  .single();
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Vendor ID |

### Response

```typescript
interface GetVendorResponse {
  success: true;
  data: Vendor;
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| PGRST116 | 406 | Vendor not found |
| 42501 | 403 | RLS policy violation |

---

## Create Vendor

### Request

```typescript
interface CreateVendorRequest {
  wedding_id: string;
  vendor_type: VendorType;
  company_name: string;
  contact_name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  website?: string | null;
  contract_signed?: boolean;
  contract_date?: string | null;
  contract_expiry_date?: string | null;
  contract_value?: number | null;
  cancellation_policy?: string | null;
  cancellation_fee_percentage?: number | null;
  insurance_required?: boolean;
  insurance_verified?: boolean;
  insurance_expiry_date?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  branch_code?: string | null;
  swift_code?: string | null;
  notes?: string | null;
  status?: VendorStatus;
}

// Supabase mutation
const { data, error } = await supabase
  .from('vendors')
  .insert([payload])
  .select()
  .single();
```

### Required Fields

| Field | Type | Validation |
|-------|------|------------|
| wedding_id | UUID | Must be valid wedding owned by user |
| vendor_type | VendorType | Must be valid enum value |
| company_name | string | 1-200 characters |
| contact_name | string | 1-100 characters |

### Response

```typescript
interface CreateVendorResponse {
  success: true;
  data: Vendor;
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| 23503 | 409 | Foreign key violation (invalid wedding_id) |
| 23514 | 400 | Check constraint violation (invalid status) |
| 42501 | 403 | RLS policy violation |

---

## Update Vendor

### Request

```typescript
interface UpdateVendorRequest {
  vendor_type?: VendorType;
  company_name?: string;
  contact_name?: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  website?: string | null;
  contract_signed?: boolean;
  contract_date?: string | null;
  contract_expiry_date?: string | null;
  contract_value?: number | null;
  cancellation_policy?: string | null;
  cancellation_fee_percentage?: number | null;
  insurance_required?: boolean;
  insurance_verified?: boolean;
  insurance_expiry_date?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  branch_code?: string | null;
  swift_code?: string | null;
  notes?: string | null;
  status?: VendorStatus;
}

// Supabase mutation
const { data, error } = await supabase
  .from('vendors')
  .update(payload)
  .eq('id', vendorId)
  .select()
  .single();
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Vendor ID to update |

### Response

```typescript
interface UpdateVendorResponse {
  success: true;
  data: Vendor;
}
```

---

## Delete Vendor

### Request

```typescript
// Supabase mutation
const { error } = await supabase
  .from('vendors')
  .delete()
  .eq('id', vendorId);
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Vendor ID to delete |

### Cascade Behavior (FR-011)

Deleting a vendor will automatically delete:
- All `vendor_contacts` with matching `vendor_id`
- All `vendor_payment_schedule` with matching `vendor_id`
- All `vendor_invoices` with matching `vendor_id`

### Response

```typescript
interface DeleteVendorResponse {
  success: true;
  data: null;
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| PGRST116 | 406 | Vendor not found |
| 42501 | 403 | RLS policy violation |

---

## TanStack Query Integration

### Query Keys

```typescript
// Vendor list
const vendorListKey = (weddingId: string) => ['vendors', weddingId];

// Single vendor
const vendorKey = (vendorId: string) => ['vendor', vendorId];
```

### Cache Invalidation

```typescript
// After create/update/delete
queryClient.invalidateQueries({ queryKey: ['vendors', weddingId] });
queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
```

### Optimistic Updates (Optional)

```typescript
// For better UX on delete
queryClient.setQueryData(
  ['vendors', weddingId],
  (old: VendorDisplay[]) => old.filter(v => v.id !== vendorId)
);
```

---

## Error Handling Pattern

```typescript
try {
  const { data, error } = await supabaseOperation();

  if (error) {
    // Handle Supabase error
    throw new Error(mapErrorCode(error.code));
  }

  return { success: true, data };
} catch (error) {
  console.error('Vendor operation failed:', error);
  toast.error(getUserFriendlyMessage(error));
  throw error;
}
```

### Error Code Mapping

```typescript
const mapErrorCode = (code: string): string => {
  switch (code) {
    case 'PGRST116':
      return 'Vendor not found';
    case '23503':
      return 'Invalid wedding reference';
    case '23514':
      return 'Invalid vendor status';
    case '42501':
      return 'Permission denied';
    default:
      return 'An unexpected error occurred';
  }
};
```

---

## Rate Limiting

| Operation | Limit | Window |
|-----------|-------|--------|
| All operations | 100 requests | 10 seconds |

Rate limiting is enforced by Supabase default configuration.

---

## Security

### RLS Policies

All vendor operations are protected by Row Level Security:

```sql
-- SELECT: Users can only view vendors for weddings they own
CREATE POLICY "Users can view vendors of their weddings"
  ON vendors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = vendors.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- INSERT: Users can only create vendors for weddings they own
CREATE POLICY "Users can create vendors for their weddings"
  ON vendors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = vendors.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- UPDATE: Users can only update vendors for weddings they own
CREATE POLICY "Users can update vendors of their weddings"
  ON vendors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = vendors.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

-- DELETE: Users can only delete vendors for weddings they own
CREATE POLICY "Users can delete vendors of their weddings"
  ON vendors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = vendors.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

### Input Validation

All input is validated:
1. Client-side: Zod schema validation
2. Server-side: PostgreSQL constraints and RLS policies
