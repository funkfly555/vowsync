# Research: Vendor Management System (Phase 7A)

**Branch**: `008-vendor-management` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)

## Summary

All technical decisions for Phase 7A vendor management have been pre-determined based on established VowSync patterns (Phase 6B) and constitution requirements. No clarification questions required - implementation can proceed with existing patterns.

---

## Technology Decisions

### Decision 1: Component Architecture

**Decision**: Follow Phase 6B (Guest Management) component patterns exactly

**Rationale**:
- Established patterns proven in production
- Consistent developer experience across features
- Reduces cognitive load during implementation
- Constitution requirement for code consistency

**Alternatives Considered**:
- Server Components (Next.js) - Rejected: Constitution prohibits Next.js
- Different state management - Rejected: TanStack Query v5 already established

**Pattern Source**: `src/components/guests/`, `src/hooks/useGuests.ts`

---

### Decision 2: Form Implementation

**Decision**: React Hook Form + Zod with 3-tab modal structure

**Rationale**:
- Constitution mandates React Hook Form + Zod
- 3-tab structure accommodates complex vendor data (Basic Info, Contract, Banking)
- max-w-3xl (768px) provides adequate space for form complexity
- Conditional rendering for contract/insurance fields

**Alternatives Considered**:
- Multi-step wizard - Rejected: Tabs provide better UX for editing existing data
- Single long form - Rejected: Poor UX for 20+ fields

**Implementation Details**:
```typescript
// Tab structure
type VendorFormTab = 'basic' | 'contract' | 'banking';

// Conditional fields
const showContractFields = watch('contract_signed');
const showInsuranceFields = watch('insurance_required');
```

---

### Decision 3: Status Badge Calculation

**Decision**: Client-side calculation using pure functions

**Rationale**:
- Contract status depends on dynamic date comparison (today vs expiry)
- Server-side would require frequent recalculation or scheduled jobs
- Pattern matches existing guest RSVP status calculation
- Simple, testable pure functions

**Implementation**:
```typescript
function getContractStatus(vendor: Vendor): ContractStatusBadge {
  if (!vendor.contract_signed) return { label: 'Unsigned', color: 'yellow' };
  if (!vendor.contract_expiry_date) return { label: 'Signed', color: 'green' };

  const today = new Date();
  const expiry = new Date(vendor.contract_expiry_date);
  const daysUntilExpiry = differenceInDays(expiry, today);

  if (daysUntilExpiry < 0) return { label: 'Expired', color: 'red' };
  if (daysUntilExpiry <= 30) return { label: 'Expiring Soon', color: 'orange' };
  return { label: 'Signed', color: 'green' };
}
```

**Payment Status (Phase 7A)**: Placeholder "Pending" badge - full calculation deferred to Phase 7B

---

### Decision 4: Search Implementation

**Decision**: Client-side filtering with 300ms debounce

**Rationale**:
- Typical wedding has 5-15 vendors (small dataset)
- Avoids network round-trips for each keystroke
- 300ms debounce matches established pattern
- Supabase `ilike` for server-side backup if needed

**Implementation**:
```typescript
// Custom hook for debounced search
const debouncedSearch = useDebouncedValue(searchTerm, 300);

// Client-side filter
const filteredVendors = vendors.filter(v =>
  v.company_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
  v.contact_name.toLowerCase().includes(debouncedSearch.toLowerCase())
);
```

---

### Decision 5: Filter Strategy

**Decision**: Client-side filtering for type/status, Supabase for initial fetch

**Rationale**:
- Vendor type filter: Exact match on `vendor_type` field
- Contract status: Requires date calculation (client-side)
- Payment status: Phase 7A placeholder, no filtering needed
- Small dataset makes client-side filtering efficient

**Implementation**:
```typescript
// Supabase fetch (server-side)
const { data } = await supabase
  .from('vendors')
  .select('*')
  .eq('wedding_id', weddingId)
  .order('company_name');

// Client-side status filtering
const filterByContractStatus = (vendors: Vendor[], status: ContractStatusFilter) => {
  if (status === 'all') return vendors;
  return vendors.filter(v => getContractStatus(v).label === status);
};
```

---

### Decision 6: Vendor Card Grid Layout

**Decision**: CSS Grid with responsive columns (3 → 2 → 1)

**Rationale**:
- Matches card patterns from dashboard and guest list
- Grid provides better alignment than flexbox for cards
- Responsive breakpoints follow constitution (lg: 3col, md: 2col, default: 1col)

**Implementation**:
```typescript
// Tailwind classes
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

### Decision 7: Delete Cascade Behavior

**Decision**: Database cascade delete via foreign key constraints

**Rationale**:
- `vendor_contacts`, `vendor_payment_schedule`, `vendor_invoices` have FK to `vendors`
- ON DELETE CASCADE configured in schema
- Confirmation dialog warns user about cascade
- No additional client-side cleanup needed

**Verification**: Confirmed via Supabase MCP - tables exist with proper constraints

---

### Decision 8: Vendor Type Options

**Decision**: Predefined list with "Other" fallback

**Options**:
- Catering
- Photography
- Videography/Video
- Flowers
- Music/DJ
- Venue
- Transportation
- Officiant
- Hair/Makeup
- Rentals
- Decor
- Other

**Rationale**:
- Covers 90%+ of wedding vendor types
- "Other" handles edge cases
- Stored as text, not enum, for flexibility
- Can be extended without migration

---

## Database Verification

### Tables Confirmed (via Supabase MCP)

| Table | RLS | Status |
|-------|-----|--------|
| vendors | ✅ Enabled | Exists with all required columns |
| vendor_contacts | ✅ Enabled | Exists (Phase 7B CRUD) |
| vendor_payment_schedule | ✅ Enabled | Exists (Phase 7B CRUD) |
| vendor_invoices | ✅ Enabled | Exists (Phase 7B CRUD) |

### Key Columns Verified (vendors table)
- ✅ id (UUID PK)
- ✅ wedding_id (FK to weddings)
- ✅ vendor_type, company_name, contact_name (required)
- ✅ contact_email, contact_phone, address, website
- ✅ contract_signed, contract_date, contract_expiry_date, contract_value
- ✅ cancellation_policy, cancellation_fee_percentage
- ✅ insurance_required, insurance_verified, insurance_expiry_date
- ✅ bank_name, account_name, account_number, branch_code, swift_code
- ✅ notes, status, created_at, updated_at

---

## Existing Pattern References

### Type Organization (from `src/types/guest.ts`)
- Database entity type (`Guest`)
- Display type with computed fields (`GuestDisplay`)
- Filter type (`GuestFilters`)
- Form data type (`GuestFormData`)
- Status calculation function (`calculateRsvpStatus`)

### Hook Pattern (from `src/hooks/useGuests.ts`)
- TanStack Query with queryKey array
- Client-side filtering via select transform
- Loading/error state handling
- Refetch capability

### Mutation Pattern (from `src/hooks/useGuestMutations.ts`)
- Separate mutations for create/update/delete
- Query invalidation after mutation
- Transform functions for insert/update payloads
- Optimistic updates optional

### Routing Pattern (from `src/App.tsx`)
- Routes nested under `<AppLayout>`
- Pattern: `/weddings/:weddingId/vendors`
- Detail page: `/weddings/:weddingId/vendors/:vendorId`

---

## Risk Mitigation

### Risk 1: Large Vendor Lists
**Mitigation**: Virtual scrolling if > 50 vendors (unlikely for single wedding)
**Likelihood**: Low (typical: 5-15 vendors)

### Risk 2: Form Tab Validation
**Mitigation**: Validate all tabs on submit, show errors on relevant tab
**Implementation**: React Hook Form `trigger()` for cross-tab validation

### Risk 3: Banking Information Security
**Mitigation**:
- Mask account numbers on cards (show last 4 digits)
- Full details only on detail page
- RLS prevents cross-user access
- No client-side storage of banking data

---

## No Clarification Needed

All technical decisions are resolved based on:
1. Constitution requirements (mandatory stack)
2. User-provided technical plan (business rules, file structure)
3. Existing codebase patterns (Phase 6B)
4. Verified database schema (Supabase MCP)

**Status**: Ready for Phase 1 (data-model.md, contracts/, quickstart.md)
