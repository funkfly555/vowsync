# Quickstart: Guest List Page

**Feature**: 006-guest-list
**Date**: 2026-01-14

## Overview

Implement a read-only guest list page displaying wedding guests in a responsive table/card layout with search, filtering, and pagination.

## Prerequisites

- [ ] Phase 5 Navigation Shell complete (AppLayout available)
- [ ] `guests` table exists in Supabase
- [ ] `guest_event_attendance` table exists in Supabase
- [ ] Development server running (`npm run dev`)

## Quick Start Commands

```bash
# 1. Ensure on correct branch
git checkout 006-guest-list

# 2. Add required Shadcn components
npx shadcn@latest add table
npx shadcn@latest add checkbox
npx shadcn@latest add dropdown-menu

# 3. Start development server
npm run dev

# 4. View guest list (replace :weddingId with actual ID)
# http://localhost:5173/weddings/:weddingId/guests
```

## Implementation Order

### Step 1: Types and Schemas (15 min)

Create `src/types/guest.ts`:
```typescript
export type GuestType = 'adult' | 'child' | 'vendor' | 'staff';
export type RsvpStatus = 'yes' | 'overdue' | 'pending';

export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  guest_type: GuestType;
  rsvp_deadline: string | null;
  rsvp_received_date: string | null;
  table_number: string | null;
  // ... other fields
}
```

Create `src/schemas/guest.ts`:
```typescript
import { z } from 'zod';

export const guestTypeSchema = z.enum(['adult', 'child', 'vendor', 'staff']);
export const rsvpStatusSchema = z.enum(['yes', 'overdue', 'pending']);
```

### Step 2: Data Hook (20 min)

Create `src/hooks/useGuests.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 50;

export function useGuests(weddingId: string, page: number) {
  return useQuery({
    queryKey: ['guests', weddingId, page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('guests')
        .select('*', { count: 'exact' })
        .eq('wedding_id', weddingId)
        .order('name', { ascending: true })
        .range(from, to);

      if (error) throw error;
      return { guests: data, total: count };
    },
  });
}
```

### Step 3: Page Component (30 min)

Create `src/pages/GuestListPage.tsx`:
```typescript
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useGuests } from '@/hooks/useGuests';
import { Plus } from 'lucide-react';

export function GuestListPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { data, isLoading } = useGuests(weddingId!, 1);

  const handleAddGuest = () => {
    toast.info('Coming in Phase 6B');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Guests</h1>
        <Button onClick={handleAddGuest}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Filters, Table, Pagination go here */}
    </div>
  );
}
```

### Step 4: Add Route (5 min)

Update `src/App.tsx`:
```typescript
import { GuestListPage } from './pages/GuestListPage';

// Inside Routes, within AppLayout:
<Route path="/weddings/:weddingId/guests" element={<GuestListPage />} />
```

### Step 5: Core Components (60 min)

1. **RsvpBadge** - Color-coded status badges
2. **GuestTable** - Desktop table view
3. **GuestCard** - Mobile card view
4. **GuestFilters** - Search and filter controls
5. **GuestPagination** - Page navigation

### Step 6: Integration (30 min)

1. Wire up filters to state
2. Connect pagination to query
3. Add responsive breakpoints
4. Test placeholder toasts

## Key Patterns

### RSVP Status Calculation
```typescript
function calculateRsvpStatus(guest: Guest): RsvpStatus {
  if (guest.rsvp_received_date) return 'yes';
  if (guest.rsvp_deadline && new Date(guest.rsvp_deadline) < new Date()) return 'overdue';
  return 'pending';
}
```

### Responsive Layout
```tsx
{/* Desktop */}
<div className="hidden lg:block">
  <GuestTable guests={guests} />
</div>

{/* Mobile */}
<div className="block lg:hidden">
  <GuestCardList guests={guests} />
</div>
```

### Placeholder Actions
```typescript
const handlePlaceholder = () => {
  toast.info('Coming in Phase 6B');
};
```

## Testing Checklist

- [ ] Page loads at `/weddings/:weddingId/guests`
- [ ] Guests display sorted by name A-Z
- [ ] RSVP badges show correct colors (green/red/yellow)
- [ ] Table number shows "-" when null
- [ ] Search filters in real-time
- [ ] Type filter works correctly
- [ ] Pagination shows for 50+ guests
- [ ] Mobile shows cards below 768px
- [ ] All action buttons show Phase 6B toast
- [ ] Empty state shows when no guests

## File Structure

```
src/
├── types/
│   └── guest.ts              # Types
├── schemas/
│   └── guest.ts              # Zod schemas
├── hooks/
│   └── useGuests.ts          # TanStack Query hook
├── components/
│   ├── ui/
│   │   ├── table.tsx         # Shadcn
│   │   ├── checkbox.tsx      # Shadcn
│   │   └── dropdown-menu.tsx # Shadcn
│   └── guests/
│       ├── GuestTable.tsx
│       ├── GuestCard.tsx
│       ├── GuestRow.tsx
│       ├── GuestFilters.tsx
│       ├── GuestPagination.tsx
│       ├── RsvpBadge.tsx
│       ├── BulkActionsBar.tsx
│       └── EmptyGuestState.tsx
└── pages/
    └── GuestListPage.tsx
```

## Common Issues

### Issue: Guests not loading
- Check `wedding_id` is valid UUID
- Verify RLS policies allow access
- Check Supabase connection

### Issue: Event filter not working
- Ensure `guest_event_attendance` records exist
- Check join query syntax

### Issue: Mobile layout not switching
- Verify Tailwind breakpoints: `lg:` = 1024px
- Check `hidden lg:block` classes

## References

- Spec: `specs/006-guest-list/spec.md`
- Plan: `specs/006-guest-list/plan.md`
- Research: `specs/006-guest-list/research.md`
- Contracts: `specs/006-guest-list/contracts/guest-api.ts`
- Database: `docs/03-DATABASE-SCHEMA.md` (Section 4)
