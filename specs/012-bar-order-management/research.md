# Research: Bar Order Management

**Feature Branch**: `012-bar-order-management`
**Created**: 2026-01-15
**Status**: Complete - No unknowns

## Research Summary

No significant unknowns require investigation for this feature. The user provided comprehensive technical specifications including:

- Database schema (tables already exist in Supabase)
- Business rules with exact calculation formulas
- Component specifications with file paths
- Design system references from constitution
- Validation rules with specific thresholds

## Resolved Decisions

### D1: Database Schema
**Decision**: Use existing `bar_orders` and `bar_order_items` tables
**Rationale**: Tables already exist with GENERATED columns for `total_servings_per_person`, `calculated_servings`, `units_needed`, and `total_cost`. No schema changes needed.

### D2: Calculation Strategy
**Decision**: Server-side calculations via PostgreSQL GENERATED columns
**Rationale**: GENERATED columns ensure calculation consistency and atomicity. Client shows preview calculations for UX, but source of truth is database.

### D3: Percentage Validation Approach
**Decision**: Soft validation (warning) for 90-110% range, hard validation (error) outside range
**Rationale**: User specified: 100% = no warning, 90-110% = warning allowed, <90% or >110% = blocked. This allows flexibility while preventing major errors.

### D4: Event Linking
**Decision**: Optional event linkage with manual guest count override
**Rationale**: When event is selected, guest count auto-populates from event's adult count. If event is deleted, order retains last known guest count and event_id becomes null.

### D5: Status Workflow
**Decision**: Linear status progression: draft → confirmed → ordered → delivered
**Rationale**: Matches existing vendor payment/invoice status patterns. No backwards transitions required per spec.

### D6: Catalog Integration
**Decision**: Deferred to Phase 9B
**Rationale**: User explicitly marked catalog item selection as out of scope. Current implementation uses free-text item names.

## Existing Patterns to Follow

### From Vendors Feature (Phase 7-9)
- Status badge component pattern (`PaymentStatusBadge.tsx`, `InvoiceStatusBadge.tsx`)
- Modal form pattern with React Hook Form + Zod
- Delete confirmation dialog pattern
- TanStack Query hooks for data fetching
- Toast notifications for CRUD operations

### From Budget Feature (Phase 11)
- Card grid layout for list display
- Summary totals component pattern
- Empty state component pattern
- Stat cards for overview metrics

### From Events Feature (Phase 3)
- Duration display and calculation
- Event selection dropdown pattern
- Timeline/card layout options

## Technical Patterns

### Query Hook Pattern
```typescript
// useBarOrders.ts - List query
export function useBarOrders(weddingId: string) {
  return useQuery({
    queryKey: ['bar-orders', weddingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_orders')
        .select(`
          *,
          event:events(name, start_time, end_time),
          vendor:vendors(business_name),
          items:bar_order_items(*)
        `)
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
```

### Mutation Hook Pattern
```typescript
// useBarOrderMutations.ts
export function useBarOrderMutations(weddingId: string) {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: async (data: BarOrderFormData) => {
      const { data: order, error } = await supabase
        .from('bar_orders')
        .insert({ ...data, wedding_id: weddingId })
        .select()
        .single();
      if (error) throw error;
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-orders', weddingId] });
      toast.success('Bar order created');
    },
    onError: () => toast.error('Failed to create bar order'),
  });

  return { createOrder, updateOrder, deleteOrder };
}
```

### Zod Schema Pattern
```typescript
// schemas/barOrder.ts
export const barOrderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  event_id: z.string().uuid().nullable(),
  vendor_id: z.string().uuid().nullable(),
  guest_count_adults: z.number().int().min(1, 'Must have at least 1 guest'),
  event_duration_hours: z.number().min(0.5).max(24),
  first_hours: z.number().min(0),
  first_hours_drinks_per_hour: z.number().min(0),
  remaining_hours_drinks_per_hour: z.number().min(0),
  status: z.enum(['draft', 'confirmed', 'ordered', 'delivered']),
  notes: z.string().nullable(),
}).refine(
  (data) => data.first_hours <= data.event_duration_hours,
  { message: 'First hours cannot exceed event duration', path: ['first_hours'] }
);
```

## No Further Research Required

All technical decisions have been made based on:
1. User-provided specifications
2. Existing VowSync patterns
3. Constitution requirements
4. Database schema (already exists)

Proceed to Phase 1: Generate data-model.md, contracts/, and quickstart.md.
