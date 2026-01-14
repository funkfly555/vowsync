# Quickstart: Vendor Management System (Phase 7A)

**Branch**: `008-vendor-management` | **Date**: 2026-01-14

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Project cloned and dependencies installed (`npm install`)
- [ ] Supabase project configured with environment variables
- [ ] Database schema from Phase 1 applied (vendors table exists)
- [ ] Authentication working (Supabase Auth)

## Quick Verification

```bash
# Verify branch
git branch --show-current
# Expected: 008-vendor-management

# Verify dependencies
npm list @tanstack/react-query react-hook-form zod
# All should be installed

# Start development server
npm run dev
```

---

## File Creation Order

### Phase 1: Types & Schemas

```bash
# Create type definitions
touch src/types/vendor.ts

# Create validation schema
touch src/schemas/vendor.ts
```

**vendor.ts** - Copy interfaces from [data-model.md](./data-model.md):
- `Vendor` interface
- `VendorType`, `VendorStatus` types
- `ContractStatusBadge`, `PaymentStatusBadge` interfaces
- `VendorDisplay` interface with computed fields
- `VendorFilters` interface
- `VendorFormData` interface
- Helper functions: `calculateContractStatus`, `calculatePaymentStatus`, `toVendorDisplay`

**vendor.ts (schema)** - Copy Zod schema from [data-model.md](./data-model.md):
- `VENDOR_TYPES` constant array
- `vendorSchema` Zod object
- Date validation refinements

### Phase 2: Data Hooks

```bash
# Create hooks
touch src/hooks/useVendors.ts
touch src/hooks/useVendor.ts
touch src/hooks/useVendorMutations.ts
```

**useVendors.ts** - Fetch all vendors:
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toVendorDisplay, VendorDisplay, VendorFilters } from '@/types/vendor';

export function useVendors(weddingId: string, filters: VendorFilters) {
  return useQuery({
    queryKey: ['vendors', weddingId, filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('company_name');

      if (error) throw error;
      return (data || []).map(toVendorDisplay);
    },
    enabled: !!weddingId,
  });
}
```

**useVendorMutations.ts** - CRUD operations:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { VendorSchemaType } from '@/schemas/vendor';

export function useVendorMutations(weddingId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['vendors', weddingId] });
  };

  const createVendor = useMutation({
    mutationFn: async (data: VendorSchemaType) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .insert([{ wedding_id: weddingId, ...data }])
        .select()
        .single();
      if (error) throw error;
      return vendor;
    },
    onSuccess: invalidate,
  });

  // ... updateVendor, deleteVendor similar pattern

  return { createVendor, updateVendor, deleteVendor };
}
```

### Phase 3: Components

```bash
# Create component directories
mkdir -p src/components/vendors
mkdir -p src/pages/vendors

# Create components
touch src/components/vendors/VendorList.tsx
touch src/components/vendors/VendorCard.tsx
touch src/components/vendors/VendorModal.tsx
touch src/components/vendors/VendorBasicInfoTab.tsx
touch src/components/vendors/VendorContractTab.tsx
touch src/components/vendors/VendorBankingTab.tsx
touch src/components/vendors/ContractStatusBadge.tsx
touch src/components/vendors/PaymentStatusBadge.tsx
touch src/components/vendors/DeleteVendorDialog.tsx

# Create pages
touch src/pages/vendors/VendorsPage.tsx
touch src/pages/vendors/VendorDetailPage.tsx
touch src/components/vendors/VendorOverviewTab.tsx
touch src/components/vendors/VendorContractTabView.tsx
```

### Phase 4: Routing

Update `src/App.tsx`:
```typescript
import { VendorsPage } from '@/pages/vendors/VendorsPage';
import { VendorDetailPage } from '@/pages/vendors/VendorDetailPage';

// Inside routes
<Route element={<AppLayout />}>
  {/* Existing routes */}
  <Route path="/weddings/:weddingId/vendors" element={<VendorsPage />} />
  <Route path="/weddings/:weddingId/vendors/:vendorId" element={<VendorDetailPage />} />
</Route>
```

---

## Key Implementation Details

### 1. Search Debounce (300ms)

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);
```

### 2. Contract Status Badge Colors

```typescript
const statusColors = {
  green: 'bg-green-100 text-green-800',   // Signed
  yellow: 'bg-yellow-100 text-yellow-800', // Unsigned
  orange: 'bg-orange-100 text-orange-800', // Expiring Soon
  red: 'bg-red-100 text-red-800',          // Expired
};
```

### 3. Conditional Contract Fields

```typescript
const contractSigned = watch('contract_signed');

{contractSigned && (
  <>
    <FormField name="contract_date" ... />
    <FormField name="contract_expiry_date" ... />
    <FormField name="contract_value" ... />
    {/* ... more contract fields */}
  </>
)}
```

### 4. Grid Layout

```typescript
// VendorList.tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {vendors.map(vendor => (
    <VendorCard key={vendor.id} vendor={vendor} />
  ))}
</div>
```

### 5. Modal Size

```typescript
// VendorModal.tsx
<Dialog>
  <DialogContent className="max-w-3xl"> {/* 768px */}
    <Tabs defaultValue="basic">
      <TabsList>
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="contract">Contract Details</TabsTrigger>
        <TabsTrigger value="banking">Banking Information</TabsTrigger>
      </TabsList>
      {/* ... tab content */}
    </Tabs>
  </DialogContent>
</Dialog>
```

---

## Testing Checklist

### Manual Testing with Playwright MCP

```bash
# Start dev server
npm run dev

# Test in browser
# 1. Navigate to /weddings/:weddingId/vendors
# 2. Click "Add Vendor" - verify modal opens
# 3. Fill Basic Info tab (vendor_type, company_name, contact_name)
# 4. Switch to Contract tab - verify fields hidden
# 5. Check "Contract Signed" - verify fields appear
# 6. Switch to Banking tab - fill optional fields
# 7. Click Save - verify vendor appears in list
# 8. Verify contract status badge is correct
# 9. Click vendor card - verify navigation to detail page
# 10. Click edit icon - verify modal opens with data
# 11. Click delete icon - verify confirmation dialog
# 12. Test search with 300ms debounce
# 13. Test filters (type, contract status)
```

### Acceptance Criteria Verification

- [ ] US-1: View vendors in card grid (3 cols desktop, 1 col mobile)
- [ ] US-2: Add vendor with 3-tab modal
- [ ] US-3: Edit vendor with pre-populated data
- [ ] US-4: Delete vendor with confirmation
- [ ] US-5: View vendor detail page with tabs
- [ ] US-6: Filter vendors by type, contract status

---

## Common Issues

### Issue: Form validation not working
**Solution**: Ensure Zod schema is connected to React Hook Form:
```typescript
const form = useForm<VendorSchemaType>({
  resolver: zodResolver(vendorSchema),
  defaultValues: DEFAULT_VENDOR_FORM,
});
```

### Issue: Contract fields not hiding/showing
**Solution**: Use `watch()` for conditional rendering:
```typescript
const contractSigned = form.watch('contract_signed');
```

### Issue: Status badge colors wrong
**Solution**: Verify Tailwind classes match design system:
- Success (green): `#4CAF50` → `bg-green-500`
- Warning (yellow): `#FF9800` → `bg-yellow-500`
- Error (red): `#F44336` → `bg-red-500`
- Info (blue): `#2196F3` → `bg-blue-500`

### Issue: Search not debouncing
**Solution**: Ensure debounce hook is implemented correctly:
```typescript
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Success Metrics

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Page load | < 2s | Chrome DevTools Performance |
| Add vendor | < 3 min | Manual timing |
| Search response | < 500ms | Chrome DevTools Network |
| Badge visibility | At a glance | Visual inspection |
| Detail page load | < 1s | Chrome DevTools Performance |

---

## Next Steps (After Phase 7A)

Phase 7B will add:
- Payment schedule CRUD (vendor_payment_schedule table)
- Invoice management CRUD (vendor_invoices table)
- Additional contacts CRUD (vendor_contacts table)
- Full payment status badge calculation
- Payments and Invoices tab implementations
