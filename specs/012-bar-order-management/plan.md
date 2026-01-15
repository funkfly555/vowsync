# Implementation Plan: Bar Order Management

**Branch**: `012-bar-order-management` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-bar-order-management/spec.md`

## Summary

Implement a bar order management system that calculates beverage requirements using a two-phase consumption model. Users can create bar orders linked to events, add beverage items with percentage allocations, and the system auto-calculates servings and units needed. Database tables (`bar_orders`, `bar_order_items`) already exist with GENERATED columns for calculations.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+ (strict mode enabled)
**Primary Dependencies**: React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
**Storage**: Supabase PostgreSQL (`bar_orders`, `bar_order_items` tables exist with RLS enabled)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Web (Vite build), responsive 375px+
**Project Type**: Single project (existing VowSync structure)
**Performance Goals**: FCP < 1.2s, TTI < 3.5s, real-time calculation updates
**Constraints**: Mobile-first responsive, WCAG 2.1 AA compliance
**Scale/Scope**: Up to 500 guests per event, typical 5-15 bar order items

### Design System (from Constitution)

#### Colors
```css
--brand-primary: #D4A5A5;       /* Dusty Rose */
--brand-secondary: #A8B8A6;     /* Sage Green */
--accent-gold: #C9A961;         /* Accent Gold */
--background-light: #FAFAFA;
--surface: #F5F5F5;
--border-light: #E8E8E8;
--text-primary: #2C2C2C;
--text-secondary: #6B6B6B;
--success: #4CAF50;
--warning: #FF9800;
--error: #F44336;
--info: #2196F3;
```

#### Status Badge Colors
| Status | Background | Text | Border |
|--------|------------|------|--------|
| draft | bg-gray-100 | text-gray-700 | border-gray-200 |
| confirmed | bg-blue-100 | text-blue-700 | border-blue-200 |
| ordered | bg-orange-100 | text-orange-700 | border-orange-200 |
| delivered | bg-green-100 | text-green-700 | border-green-200 |

### Database Schema (Existing)

```typescript
// bar_orders table
interface BarOrder {
  id: string;                        // UUID PK
  wedding_id: string;                // FK -> weddings.id
  event_id: string | null;           // FK -> events.id (optional)
  vendor_id: string | null;          // FK -> vendors.id (optional)
  name: string;                      // Order name/description
  guest_count_adults: number;        // Number of adult guests
  event_duration_hours: number;      // Total event duration
  first_hours: number;               // Default 2
  first_hours_drinks_per_hour: number; // Default 2
  remaining_hours_drinks_per_hour: number; // Default 1
  total_servings_per_person: number; // GENERATED column
  status: 'draft' | 'confirmed' | 'ordered' | 'delivered';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// bar_order_items table
interface BarOrderItem {
  id: string;                        // UUID PK
  bar_order_id: string;              // FK -> bar_orders.id
  item_name: string;                 // e.g., "Red Wine", "Beer"
  percentage: number;                // 0.40 = 40%
  servings_per_unit: number;         // e.g., 4 glasses per bottle
  cost_per_unit: number | null;      // Optional cost
  calculated_servings: number;       // GENERATED column
  units_needed: number;              // GENERATED column
  total_cost: number | null;         // GENERATED column
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

### Business Rules

#### Consumption Model Calculation
```typescript
// Total servings per person formula
total_servings_per_person =
  (first_hours × first_hours_drinks_per_hour) +
  ((event_duration_hours - first_hours) × remaining_hours_drinks_per_hour)

// Example: 5-hour event with defaults (2hr @ 2drinks, 3hr @ 1drink)
// = (2 × 2) + ((5 - 2) × 1) = 4 + 3 = 7 servings/person
```

#### Item Calculation
```typescript
// Calculated servings for an item
calculated_servings = total_servings_per_person × percentage × guest_count_adults

// Units needed (always round up)
units_needed = CEIL(calculated_servings / servings_per_unit)

// Total cost (if cost provided)
total_cost = units_needed × cost_per_unit
```

#### Percentage Validation Rules
| Total % | Behavior |
|---------|----------|
| 100% | No warning, save allowed |
| 90-99% or 101-110% | Warning displayed, save allowed |
| <90% or >110% | Error displayed, save blocked |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | UUID PKs, RLS enabled, proper constraints | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate calculations, proper validations | [x] |
| VII. Security | RLS, no API key exposure, input validation | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, error boundaries, loading states | [x] |
| X. Performance | FCP < 1.2s, TTI < 3.5s, lazy loading | [x] |
| XI. API Handling | Standard response format, error pattern | [x] |
| XII. Git Workflow | Feature branches, descriptive commits | [x] |
| XIII. Documentation | JSDoc for complex functions, README complete | [x] |
| XIV. Environment | Uses .env, no secrets in git | [x] |
| XV. Prohibited | No violations of prohibited practices | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/012-bar-order-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── bar-orders/          # Feature components
│   │   ├── BarOrderCard.tsx
│   │   ├── BarOrderModal.tsx
│   │   ├── BarOrderItemsTable.tsx
│   │   ├── BarOrderItemModal.tsx
│   │   ├── BarOrderStatusBadge.tsx
│   │   ├── BarOrderEmptyState.tsx
│   │   ├── BarOrderSummary.tsx
│   │   ├── ConsumptionModelForm.tsx
│   │   ├── PercentageWarning.tsx
│   │   └── DeleteBarOrderDialog.tsx
│   └── ui/                  # Shadcn components (existing)
├── hooks/
│   ├── useBarOrders.ts      # Query hook for bar orders list
│   ├── useBarOrder.ts       # Query hook for single bar order with items
│   └── useBarOrderMutations.ts  # Create/update/delete mutations
├── lib/
│   ├── barOrderStatus.ts    # Status helpers and formatters
│   └── barOrderCalculations.ts  # Client-side calculation helpers
├── pages/
│   └── bar-orders/
│       ├── BarOrdersPage.tsx    # List view
│       └── BarOrderDetailPage.tsx  # Detail/edit view
├── schemas/
│   ├── barOrder.ts          # Zod schema for bar order form
│   └── barOrderItem.ts      # Zod schema for item form
└── types/
    └── barOrder.ts          # TypeScript interfaces
```

**Structure Decision**: Single project structure following existing VowSync patterns. Bar orders feature mirrors the vendors/ and budget/ component organization with dedicated pages, hooks, schemas, and types.

## Complexity Tracking

> No constitution violations requiring justification. All gates pass.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
