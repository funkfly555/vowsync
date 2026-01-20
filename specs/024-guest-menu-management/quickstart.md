# Quickstart: Guest Management Enhancement & Menu Configuration

**Feature**: 024-guest-menu-management
**Date**: 2026-01-20

## Prerequisites

Before starting implementation, ensure:

1. **Database Migration Applied**
   ```bash
   # Run migration via Supabase CLI or dashboard
   supabase db push
   ```

2. **Dependencies Installed** (all already in project)
   - Shadcn/ui components: Tabs, Select, Input, Checkbox, Button, Card
   - Lucide React icons
   - TanStack Query v5
   - React Hook Form + Zod
   - date-fns

---

## Implementation Order

### Phase 1: Database & Types
1. Apply `contracts/migration.sql` to Supabase
2. Generate TypeScript types: `supabase gen types typescript`
3. Create/update type definitions in `src/types/`

### Phase 2: Menu Configuration Page
1. Create `src/pages/MenuPage.tsx`
2. Create `src/hooks/useMealOptions.ts`
3. Add route to wedding navigation
4. Test CRUD operations for meal options

### Phase 3: Guest Modal Enhancement
1. Expand modal width to 768px
2. Implement 7-tab structure
3. Update each tab incrementally

### Phase 4: Individual Tabs
1. **Basic Info Tab** - Reorganize existing fields
2. **RSVP Tab** - Move invitation_status here
3. **Seating Tab** - Existing functionality
4. **Dietary Tab** - Existing functionality
5. **Meals Tab** - Add plus one section
6. **Events Tab** - New event attendance UI
7. **Shuttle Tab** - New shuttle booking UI

### Phase 5: Integration & Testing
1. Test meal selections with configured options
2. Test plus one workflows
3. Test shuttle bookings
4. Verify event attendance counts

---

## Key Code Patterns

### Meal Options Hook
```typescript
// src/hooks/useMealOptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useMealOptions(weddingId: string) {
  return useQuery({
    queryKey: ['meal-options', weddingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_options')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('course_type')
        .order('option_number');

      if (error) throw error;
      return data;
    },
    enabled: !!weddingId,
  });
}

export function useMealOptionMutations(weddingId: string) {
  const queryClient = useQueryClient();

  const upsertMealOption = useMutation({
    mutationFn: async (option: MealOptionInsert) => {
      const { data, error } = await supabase
        .from('meal_options')
        .upsert(option, {
          onConflict: 'wedding_id,course_type,option_number'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-options', weddingId] });
    },
  });

  return { upsertMealOption };
}
```

### Guest Modal Tabs Structure
```typescript
// src/components/guests/GuestModal.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Armchair, Utensils, UtensilsCrossed, Calendar, Bus } from 'lucide-react';

const GUEST_TABS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'rsvp', label: 'RSVP', icon: Mail },
  { id: 'seating', label: 'Seating', icon: Armchair },
  { id: 'dietary', label: 'Dietary', icon: Utensils },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'shuttle', label: 'Shuttle', icon: Bus },
] as const;

// Modal width: max-w-3xl (768px)
```

### Meal Selection Dropdown
```typescript
// Helper to get meal option label
function getMealOptionLabel(
  options: MealOption[],
  courseType: string,
  optionNumber: number | null
): string {
  if (!optionNumber) return 'No Selection';

  const option = options.find(
    o => o.course_type === courseType && o.option_number === optionNumber
  );

  return option?.meal_name ?? `Option ${optionNumber}`;
}
```

---

## Database Quick Reference

### meal_options Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| wedding_id | UUID | FK to weddings |
| course_type | TEXT | 'starter', 'main', 'dessert' |
| option_number | INTEGER | 1-5 |
| meal_name | TEXT | Required name |
| description | TEXT | Optional |
| dietary_info | TEXT | Optional |

### guests Table (New Columns)
| Column | Type | Description |
|--------|------|-------------|
| plus_one_starter_choice | INTEGER | 1-5, nullable |
| plus_one_main_choice | INTEGER | 1-5, nullable |
| plus_one_dessert_choice | INTEGER | 1-5, nullable |

### guest_event_attendance Table (New Columns)
| Column | Type | Description |
|--------|------|-------------|
| plus_one_attending | BOOLEAN | Default false |
| shuttle_to_event_time | TIME | Nullable |
| shuttle_to_event_pickup_location | TEXT | Nullable |
| shuttle_from_event_time | TIME | Nullable |
| shuttle_from_event_pickup_location | TEXT | Nullable |
| plus_one_shuttle_* | (same pattern) | For plus one |

---

## Validation Rules

### Meal Options
- `meal_name`: Required, max 100 characters
- `description`: Optional, max 500 characters
- `dietary_info`: Optional, max 100 characters
- `option_number`: 1-5 only
- `course_type`: 'starter', 'main', 'dessert' only

### Meal Selections
- Disabled when RSVP status is 'Not Attending'
- Plus one selections only enabled when guest has plus one
- Integer values 1-5 or null for no selection

### Shuttle Bookings
- Only shown for events where guest is attending
- Plus one shuttle only when plus_one_attending is true
- Time format: HH:MM (24-hour)

---

## Testing Checklist

- [ ] Create meal options for all 3 courses
- [ ] Edit existing meal option
- [ ] Delete meal option (verify guest selections show "Option Removed")
- [ ] Select meals for guest (all 3 courses)
- [ ] Select meals for plus one
- [ ] Change RSVP to "Not Attending" (verify meals disabled)
- [ ] Toggle event attendance
- [ ] Toggle plus one event attendance
- [ ] Book shuttle for guest
- [ ] Book shuttle for plus one
- [ ] Verify meal counts on Menu page
- [ ] Test on mobile (375px width)
