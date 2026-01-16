# Quickstart: Repurposing Timeline Management

**Feature**: 014-repurposing-timeline
**Date**: 2026-01-16

---

## Prerequisites

- Node.js 18+
- Git
- Access to VowSync Supabase project
- Feature branch `014-repurposing-timeline` checked out

---

## 1. Environment Setup

Ensure your `.env` file has the required Supabase variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 2. Install Dependencies

```bash
cd vowsync
npm install
```

All required dependencies are already in package.json:
- React 18+
- TanStack Query v5
- React Hook Form
- Zod
- Shadcn/ui components
- date-fns
- Lucide React

---

## 3. Database Verification

The `repurposing_instructions` table was created in Phase 1 (001-database-schema-foundation). Verify it exists:

```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'repurposing_instructions'
ORDER BY ordinal_position;
```

Expected columns:
- id, wedding_id, wedding_item_id
- from_event_id, from_event_end_time
- pickup_location, pickup_time, pickup_time_relative
- to_event_id, to_event_start_time
- dropoff_location, dropoff_time, dropoff_time_relative
- responsible_party, responsible_vendor_id
- handling_notes, setup_required, breakdown_required, is_critical
- status, started_at, completed_at, completed_by, issue_description
- created_at, updated_at

---

## 4. File Creation Order

Create files in this order to avoid import errors:

### Phase 1: Types & Schemas
```
src/types/repurposing.ts           # TypeScript interfaces
src/schemas/repurposing.ts         # Zod validation schemas
```

### Phase 2: Utilities
```
src/lib/repurposingValidation.ts   # Time validation utilities
```

### Phase 3: Hooks
```
src/hooks/useRepurposingInstructions.ts  # List query
src/hooks/useRepurposingInstruction.ts   # Single item query
src/hooks/useRepurposingMutations.ts     # CRUD mutations
```

### Phase 4: Components
```
src/components/repurposing/
├── RepurposingStatusBadge.tsx     # Simple, no deps
├── RepurposingEmptyState.tsx      # Simple, no deps
├── RepurposingFilters.tsx         # Uses hooks
├── RepurposingCard.tsx            # Uses StatusBadge
├── RepurposingList.tsx            # Uses Card, Filters
├── RepurposingForm.tsx            # Complex form with tabs
├── OvernightStorageDialog.tsx     # Modal dialog
├── RepurposingModal.tsx           # Uses Form
├── DeleteRepurposingDialog.tsx    # Delete confirmation
├── RepurposingGantt.tsx           # Timeline visualization
└── index.ts                       # Barrel export
```

### Phase 5: Page & Route
```
src/pages/RepurposingPage.tsx      # Main page component
```

Add route to router configuration.

---

## 5. Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:5173/weddings/{weddingId}/repurposing`

---

## 6. Testing Checklist

### Manual Testing (Playwright MCP)

1. **Create Instruction**
   - [ ] Form opens in modal
   - [ ] All tabs navigate correctly
   - [ ] Required field validation works
   - [ ] Time validation error shows when pickup >= dropoff
   - [ ] Time validation warning shows for event timing
   - [ ] Overnight storage dialog appears when dates differ
   - [ ] Save creates record

2. **List View**
   - [ ] Instructions display in cards
   - [ ] Status badges show correct colors
   - [ ] Critical items have red border
   - [ ] Filters work correctly
   - [ ] Empty state shows when no instructions

3. **Gantt Chart**
   - [ ] View toggle switches between list/Gantt
   - [ ] Bars positioned correctly
   - [ ] Bar colors match status
   - [ ] Tooltips show on hover
   - [ ] Click opens edit modal

4. **Status Updates**
   - [ ] Start button works (pending → in_progress)
   - [ ] Complete button works (requires completed_by)
   - [ ] Issue button works (requires description)
   - [ ] Timestamps recorded correctly

5. **Edit & Delete**
   - [ ] Edit loads existing data
   - [ ] Changes save correctly
   - [ ] Delete shows confirmation
   - [ ] Delete removes record

6. **Accessibility**
   - [ ] Keyboard navigation works
   - [ ] Focus indicators visible
   - [ ] Screen reader announces changes

---

## 7. Key Implementation Notes

### Time Format
- Database stores TIME as "HH:MM:SS"
- Form inputs use "HH:MM"
- Convert on submit: `${time}:00`

### Database Field Names
Use snake_case in all Supabase queries:
```typescript
// CORRECT
.eq('wedding_id', weddingId)
.eq('from_event_id', eventId)

// WRONG - will fail
.eq('weddingId', weddingId)
.eq('fromEventId', eventId)
```

### Multiple Event Joins
The table has two FKs to events. Use aliases:
```typescript
.select(`
  *,
  from_event:events!from_event_id(...),
  to_event:events!to_event_id(...)
`)
```

### Status Colors
```typescript
const statusColors = {
  pending: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  issue: 'bg-red-100 text-red-800'
};
```

### Critical Item Border
```typescript
className={cn(
  "rounded-lg border p-6",
  instruction.is_critical && "border-l-2 border-l-red-500"
)}
```

---

## 8. Common Issues

### "relation not found" error
- Verify table exists in Supabase
- Check RLS policies are enabled
- Verify user is authenticated

### Form validation not triggering
- Ensure Zod schema is connected to React Hook Form
- Check `mode: 'onChange'` in useForm

### Gantt bars not positioned correctly
- Verify time parsing: `"14:30:00"` → 870 minutes
- Check percentage calculation: `minutes / 1440 * 100`

### Status update fails
- Check status CHECK constraint allows transition
- Verify required fields (completed_by, issue_description)

---

## 9. Reference Files

- **Spec**: `/specs/014-repurposing-timeline/spec.md`
- **Plan**: `/specs/014-repurposing-timeline/plan.md`
- **Data Model**: `/specs/014-repurposing-timeline/data-model.md`
- **API Contracts**: `/specs/014-repurposing-timeline/contracts/repurposing-api.md`
- **Similar Feature**: `/src/components/wedding-items/` (Phase 13)
- **Constitution**: `/.specify/memory/constitution.md`
