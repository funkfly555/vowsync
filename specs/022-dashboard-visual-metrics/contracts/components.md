# Component Contracts: Dashboard Visual Metrics Redesign

**Feature**: 022-dashboard-visual-metrics | **Date**: 2026-01-19 | **Phase**: 1

## Component Hierarchy

```
WeddingDashboardPage.tsx (modified)
├── QuickStatsRow.tsx (new)
│   └── StatPill (internal)
├── BudgetOverviewCard.tsx (new)
│   └── CircularProgress (internal SVG)
├── RsvpStatusCard.tsx (new)
│   └── PieChart (internal SVG)
├── EventTimelineCard.tsx (new)
│   └── EventCard (internal)
├── VendorInvoicesCard.tsx (new)
│   └── StatusRow (internal)
├── ItemsStatusCard.tsx (new)
└── BarOrdersStatusCard.tsx (new)
```

---

## QuickStatsRow

**File**: `src/components/dashboard/QuickStatsRow.tsx`
**Purpose**: Display 4 stat pills with gradient icons in a horizontal row

### Props Interface

```typescript
interface QuickStatsRowProps {
  guestCount: number;
  eventCount: number;
  budgetPercentage: number;
  vendorCount: number;
  isLoading?: boolean;
}
```

### Internal Components

```typescript
interface StatPillProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  gradient: string; // CSS gradient string
}
```

### Visual Specifications

| Stat | Icon | Gradient | Label |
|------|------|----------|-------|
| Guests | Users | `linear-gradient(135deg, #4CAF50, #81C784)` | "Guests" |
| Events | Calendar | `linear-gradient(135deg, #2196F3, #64B5F6)` | "Events" |
| Budget | PiggyBank | `linear-gradient(135deg, #FF9800, #FFB74D)` | "Budget" |
| Vendors | FileText | `linear-gradient(135deg, #9C27B0, #BA68C8)` | "Vendors" |

**Pill Styling**:
- Icon container: 56px diameter circle with gradient background
- Value: 32px bold text
- Label: 14px text, gray-600
- Pill container: white background, rounded-lg, shadow-sm, p-4

### Responsive Behavior

- Desktop: 4 columns `grid-cols-4`
- Tablet: 2 columns `grid-cols-2`
- Mobile: 2 columns `grid-cols-2` (compact)

### Loading State

- 4 skeleton pills with pulse animation

---

## BudgetOverviewCard

**File**: `src/components/dashboard/BudgetOverviewCard.tsx`
**Purpose**: Display circular progress chart showing budget percentage with legend

### Props Interface

```typescript
interface BudgetOverviewCardProps {
  budgetTotal: number;
  budgetSpent: number;
  budgetPercentage: number;
  isLoading?: boolean;
}
```

### SVG Specifications

```typescript
// ViewBox: 0 0 180 180
// Circle positioning
const cx = 90;
const cy = 90;
const radius = 80;
const strokeWidth = 12;
const circumference = 2 * Math.PI * radius; // ~502.65

// Progress calculation
const offset = circumference - (percentage / 100) * circumference;
```

**SVG Structure**:
```jsx
<svg viewBox="0 0 180 180" className="w-full h-full">
  <defs>
    <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4CAF50" />
      <stop offset="100%" stopColor="#81C784" />
    </linearGradient>
  </defs>
  {/* Background circle */}
  <circle cx="90" cy="90" r="80" stroke="#F5F5F5" strokeWidth="12" fill="none" />
  {/* Progress circle */}
  <circle
    cx="90" cy="90" r="80"
    stroke="url(#budgetGradient)"
    strokeWidth="12"
    fill="none"
    strokeLinecap="round"
    strokeDasharray={circumference}
    strokeDashoffset={offset}
    transform="rotate(-90 90 90)"
  />
  {/* Center text */}
  <text x="90" y="85" textAnchor="middle" className="text-[42px] font-bold">{percentage}%</text>
  <text x="90" y="110" textAnchor="middle" className="text-[13px]">spent</text>
</svg>
```

### Legend Format

| Indicator | Label | Value |
|-----------|-------|-------|
| Green dot | Total Budget | R XX,XXX.XX |
| Orange dot | Spent | R XX,XXX.XX |
| Gray dot | Remaining | R XX,XXX.XX |

### Edge Cases

- `budgetTotal = 0`: Show 0% with empty ring
- `budgetPercentage > 100`: Cap display at 100%, show red color
- Loading: Skeleton card with placeholder circle

---

## RsvpStatusCard

**File**: `src/components/dashboard/RsvpStatusCard.tsx`
**Purpose**: Display pie chart showing RSVP status breakdown with legend

### Props Interface

```typescript
interface RsvpStatusCardProps {
  pending: number;      // To Be Sent (invitation_status = 'pending')
  invited: number;      // Awaiting response
  confirmed: number;
  declined: number;
  isLoading?: boolean;
}
```

### SVG Specifications

```typescript
// ViewBox: 0 0 160 160
// Pie chart using stroke-dasharray on circles
const cx = 80;
const cy = 80;
const radius = 60;
const circumference = 2 * Math.PI * radius; // ~376.99

// Each segment uses dasharray: [segmentLength, circumference - segmentLength]
// Rotate each segment to start where previous ended
```

### Color Mapping

| Status | Display Name | Color | Order |
|--------|--------------|-------|-------|
| pending | To Be Sent | #FF9800 | 1 |
| confirmed | Confirmed | #4CAF50 | 2 |
| declined | Declined | #F44336 | 3 |
| invited | Invited | #2196F3 | 4 |

### Legend Format

- 16px square color indicators
- Status name: Label text
- Count: Number in parentheses

### Edge Cases

- All zeros: Show empty state message "No guests added yet"
- Single status only: Full circle in that color
- Loading: Skeleton with placeholder circle

---

## EventTimelineCard

**File**: `src/components/dashboard/EventTimelineCard.tsx`
**Purpose**: Display horizontal scrolling timeline of event cards

### Props Interface

```typescript
interface EventTimelineCardProps {
  events: Array<{
    id: string;
    event_name: string;
    event_date: string;
    event_start_time?: string;
    event_order: number;
    expected_guests?: number;
  }>;
  isLoading?: boolean;
}
```

### Internal EventCard

```typescript
interface EventCardProps {
  name: string;
  date: string;
  time?: string;
  guests?: number;
  color: string; // From getEventColor(event_order)
}
```

### Styling

**Container**:
- `overflow-x-auto` for horizontal scroll
- `scroll-snap-type: x mandatory` for snap scrolling
- `gap-4` between cards

**Card**:
- Min-width: 280px
- Padding: p-4
- Border-radius: rounded-lg
- Background: Card color from `getEventColor(event_order)`
- Text: Dark text for readability on pastel backgrounds

### Card Content

```
┌─────────────────────────────┐
│ Event Name                  │
│ 📅 Jan 15, 2026             │
│ 🕐 14:00 (if time exists)   │
│ 👥 150 expected guests      │
└─────────────────────────────┘
```

### Edge Cases

- No events: Show "No events scheduled" with "Add Event" prompt
- Many events: Horizontal scroll with indicators
- Long event names: Truncate with ellipsis

---

## VendorInvoicesCard

**File**: `src/components/dashboard/VendorInvoicesCard.tsx`
**Purpose**: Display invoice amounts grouped by status

### Props Interface

```typescript
interface VendorInvoicesCardProps {
  overdue: number;        // Total amount, NOT count
  unpaid: number;
  partiallyPaid: number;
  paid: number;
  isLoading?: boolean;
}
```

### Status Row Styling

| Status | Badge BG | Badge Text | Amount Position |
|--------|----------|------------|-----------------|
| Overdue | #FFEBEE | #C62828 | Right-aligned |
| Unpaid | #FFF3E0 | #E65100 | Right-aligned |
| Partially Paid | #E3F2FD | #1565C0 | Right-aligned |
| Paid | #E8F5E9 | #2E7D32 | Right-aligned |

### Layout

```
┌─────────────────────────────────────┐
│ Vendor Invoices                     │
├─────────────────────────────────────┤
│ [Overdue]                R 0.00     │
│ [Unpaid]            R 5,000.00      │
│ [Partially Paid]    R 2,500.00      │
│ [Paid]             R 12,000.00      │
└─────────────────────────────────────┘
```

### Edge Cases

- All zeros: Show all rows with R 0.00
- Large amounts: Format with thousands separator

---

## ItemsStatusCard

**File**: `src/components/dashboard/ItemsStatusCard.tsx`
**Purpose**: Display wedding items availability summary

### Props Interface

```typescript
interface ItemsStatusCardProps {
  total: number;
  shortage: number;
  totalCost?: number;
  isLoading?: boolean;
}
```

### Display Format

```
┌─────────────────────────────────────┐
│ Items Status                        │
├─────────────────────────────────────┤
│ Total Items              25         │
│ Items Short              3 ⚠️       │
│ Total Cost          R 5,000.00      │
└─────────────────────────────────────┘
```

### Styling

- Shortage count: Red text if > 0, green if = 0
- Warning icon if shortage > 0

---

## BarOrdersStatusCard

**File**: `src/components/dashboard/BarOrdersStatusCard.tsx`
**Purpose**: Display bar orders status summary

### Props Interface

```typescript
interface BarOrdersStatusCardProps {
  total: number;
  draft: number;
  confirmed: number;
  delivered: number;
  isLoading?: boolean;
}
```

### Display Format

```
┌─────────────────────────────────────┐
│ Bar Orders                          │
├─────────────────────────────────────┤
│ Total Orders             5          │
│ Draft                    2          │
│ Confirmed                2          │
│ Delivered                1          │
└─────────────────────────────────────┘
```

### Status Colors

- Draft: Yellow/amber indicator
- Confirmed: Blue indicator
- Delivered: Green indicator

---

## Page Layout Contract

### WeddingDashboardPage Modifications

**Grid Layout** (Desktop):
```
┌─────────────────────────────────────────────────────┐
│ Quick Stats Row (full width)                        │
│ [Guests] [Events] [Budget] [Vendors]                │
├───────────────────────────┬─────────────────────────┤
│ Budget Overview           │ RSVP Status             │
│ (2fr)                     │ (1fr)                   │
├───────────────────────────┴─────────────────────────┤
│ Event Timeline (full width, horizontal scroll)      │
├───────────────────────────┬─────────────────────────┤
│ Vendor Invoices           │ Items Status            │
├───────────────────────────┼─────────────────────────┤
│ Bar Orders                │ (empty or future card)  │
└───────────────────────────┴─────────────────────────┘
```

**Mobile Layout**:
- Single column, all cards stack vertically
- Event timeline still scrolls horizontally

### CSS Grid Classes

```typescript
// Main grid
className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6"

// Full width items (Quick Stats, Event Timeline)
className="col-span-1 lg:col-span-2"

// Status cards grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

## Accessibility Requirements

### All Components

- `role="img"` on SVG charts with `aria-label`
- Screen reader text for chart percentages
- Keyboard navigation for interactive elements
- Minimum contrast ratio 4.5:1 for text
- Focus indicators on interactive elements

### Specific Requirements

- Pie chart: `aria-label="RSVP status breakdown: X pending, Y confirmed..."`
- Circular progress: `aria-label="Budget spent: X percent"`
- Timeline cards: Focusable with clear focus indicators
- Status badges: Sufficient contrast for colored backgrounds

---

## Testing Checklist

- [ ] QuickStatsRow renders 4 pills with correct gradients
- [ ] BudgetOverviewCard shows correct percentage in SVG
- [ ] RsvpStatusCard pie segments are proportionally correct
- [ ] EventTimelineCard scrolls horizontally with snap
- [ ] VendorInvoicesCard displays amounts without counts
- [ ] ItemsStatusCard shows shortage warning when > 0
- [ ] BarOrdersStatusCard displays all 3 status counts
- [ ] All components handle zero/null data gracefully
- [ ] Responsive layout works at 320px, 768px, 1024px, 1440px
- [ ] Loading states display skeleton UI
- [ ] Currency formatting uses R prefix with thousands separator
