# Research: Wedding CRUD Interface

**Feature**: 002-wedding-crud
**Date**: 2026-01-13

---

## Research Questions

### 1. Project Setup (Vite + React + TypeScript)

**Decision**: Use Vite with React 18 and TypeScript strict mode

**Rationale**:
- Constitution mandates Vite (not CRA or Next.js)
- Vite provides fast HMR and optimized builds
- TypeScript strict mode required by constitution

**Alternatives Considered**:
- Next.js - PROHIBITED by constitution
- Create React App - PROHIBITED by constitution

**Implementation**:
```bash
npm create vite@latest vowsync -- --template react-ts
```

---

### 2. Component Library (Shadcn/ui)

**Decision**: Use Shadcn/ui with Radix primitives

**Rationale**:
- Constitution mandates Shadcn/ui
- Copy/paste components allow full customization
- Built on Radix for accessibility
- Works seamlessly with Tailwind CSS

**Alternatives Considered**:
- Material-UI - PROHIBITED by constitution
- Chakra UI - PROHIBITED by constitution
- Bootstrap - PROHIBITED by constitution

**Required Components**:
- Button, Card, Input, Select, Badge, Dialog, Textarea, Label, Toast/Sonner

---

### 3. Form Management (React Hook Form + Zod)

**Decision**: React Hook Form with Zod resolver

**Rationale**:
- Constitution mandates React Hook Form and Zod
- Excellent TypeScript integration
- Performant (uncontrolled inputs)
- Zod schemas provide type inference

**Alternatives Considered**:
- Formik - PROHIBITED by constitution
- Yup - PROHIBITED by constitution

**Pattern**:
```typescript
const schema = z.object({
  bride_name: z.string().min(1, "Required"),
  wedding_date: z.date().refine(d => d > new Date(), "Must be future")
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema)
});
```

---

### 4. Data Fetching (TanStack Query v5)

**Decision**: TanStack Query for server state management

**Rationale**:
- Constitution mandates React Query (TanStack Query v5)
- Automatic caching, background refetching
- Optimistic updates for instant UI feedback
- Works well with Supabase

**Alternatives Considered**:
- SWR - Not mandated by constitution
- Plain fetch - Missing caching/state management

**Hooks Structure**:
- `useWeddings()` - List with filtering/sorting
- `useWedding(id)` - Single wedding fetch
- `useCreateWedding()` - Mutation for create
- `useUpdateWedding()` - Mutation for update
- `useDeleteWedding()` - Mutation for delete

---

### 5. Routing (React Router v6)

**Decision**: React Router v6 with declarative routes

**Rationale**:
- Constitution mandates React Router v6
- Mature, well-documented
- Supports lazy loading

**Routes**:
```typescript
<Routes>
  <Route path="/" element={<WeddingListPage />} />
  <Route path="/weddings/new" element={<CreateWeddingPage />} />
  <Route path="/weddings/:id/edit" element={<EditWeddingPage />} />
</Routes>
```

---

### 6. State Management (Zustand)

**Decision**: Use Zustand only if needed for UI state

**Rationale**:
- Constitution allows Zustand OR Redux Toolkit
- TanStack Query handles server state
- Zustand simpler for UI-only state (filters, search)

**Alternatives Considered**:
- Redux Toolkit - More boilerplate than needed
- Context API - PROHIBITED for global state by constitution

**Use Cases**:
- Search query persistence
- Filter state
- Sort preferences

---

### 7. Supabase Integration

**Decision**: Direct Supabase client with RLS

**Rationale**:
- Constitution mandates Supabase for all data
- RLS already configured in Phase 1
- Use service role temporarily until auth (Phase 14)

**Client Setup**:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Temporary Auth Bypass**:
- Hardcode consultant_id: `'a3fb1821-52bb-4f2a-9e7e-b09148ad44ce'`
- Filter queries by this ID
- Remove in Phase 14 when auth is implemented

---

### 8. Design System Implementation

**Decision**: Custom Tailwind config with constitution colors

**Rationale**:
- Constitution provides exact color values
- Tailwind config extends default theme
- CSS variables for dynamic theming potential

**tailwind.config.js**:
```javascript
theme: {
  extend: {
    colors: {
      brand: {
        primary: '#D4A5A5',    // Dusty Rose
        secondary: '#A8B8A6',  // Sage Green
      },
      accent: {
        gold: '#C9A961',
      },
    },
    fontFamily: {
      display: ['Playfair Display', 'Georgia', 'serif'],
    },
  },
}
```

---

### 9. Toast Notifications

**Decision**: Sonner (via Shadcn toast) for notifications

**Rationale**:
- Shadcn/ui recommends Sonner
- Beautiful, accessible toasts
- Easy API: `toast.success()`, `toast.error()`

**Usage**:
```typescript
import { toast } from "sonner";

// Success
toast.success("Wedding created successfully");

// Error
toast.error("Failed to create wedding. Please try again.");
```

---

### 10. Date Handling

**Decision**: date-fns for date manipulation and formatting

**Rationale**:
- Constitution mandates date-fns
- Tree-shakeable (small bundle)
- Immutable operations
- Great TypeScript support

**Usage**:
```typescript
import { format, isFuture, parseISO } from 'date-fns';

// Display: "June 15, 2026"
format(wedding.wedding_date, 'MMMM d, yyyy');

// Validation
isFuture(parseISO(dateString));
```

---

## Resolved Clarifications

| Question | Resolution |
|----------|------------|
| Guest count display | Show 0 until guest management (Phase 6) |
| Hardcoded user ID | Use `a3fb1821-52bb-4f2a-9e7e-b09148ad44ce` |
| RLS bypass | Query with hardcoded consultant_id filter |
| Edit date validation | Allow past dates for existing weddings |
| Number of events | Store count only, no event management |

---

## Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "zustand": "^4.5.0",
    "date-fns": "^3.3.0",
    "lucide-react": "^0.312.0",
    "sonner": "^1.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| RLS blocks queries without auth | Filter by hardcoded consultant_id |
| No user in users table | Create test user in database |
| Performance with large lists | Implement pagination/virtual scroll |
| Browser compatibility | Test on Chrome, Firefox, Safari |
