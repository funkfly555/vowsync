# Component Contract: ViewToggle

**Location**: `src/components/guests/ViewToggle.tsx`
**Type**: UI Component
**Priority**: P1

## Purpose

Toggle buttons allowing users to switch between Card View and Table View on the Guests page.

## Props Interface

```typescript
interface ViewToggleProps {
  /** Current active view mode */
  activeView: GuestViewMode;
  /** Callback when view is changed */
  onViewChange: (view: GuestViewMode) => void;
  /** Optional className for container */
  className?: string;
}
```

## Visual Specification

```
┌─────────────────────────────────────────────────┐
│  [Card View]  [Table View]                       │
│   (active)     (inactive)                        │
└─────────────────────────────────────────────────┘

Active Button:
- Background: #D4A5A5 (dusty rose)
- Text: white
- Border: none

Inactive Button:
- Background: white
- Text: #2C2C2C (dark gray)
- Border: 1px solid #E8E8E8
```

## Behavior

1. **Initial State**: Reflects `activeView` prop
2. **Click Handler**: Calls `onViewChange` with selected view
3. **Visual Feedback**: Instant style change on click
4. **Accessibility**: Keyboard navigable, ARIA role="radiogroup"

## Implementation

```tsx
import { cn } from '@/lib/utils';
import type { GuestViewMode } from '@/types/guest-table';

interface ViewToggleProps {
  activeView: GuestViewMode;
  onViewChange: (view: GuestViewMode) => void;
  className?: string;
}

export function ViewToggle({ activeView, onViewChange, className }: ViewToggleProps) {
  const views: { value: GuestViewMode; label: string }[] = [
    { value: 'card', label: 'Card View' },
    { value: 'table', label: 'Table View' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="View selection"
      className={cn('flex gap-1', className)}
    >
      {views.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={activeView === value}
          onClick={() => onViewChange(value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            activeView === value
              ? 'bg-[#D4A5A5] text-white'
              : 'bg-white text-[#2C2C2C] border border-[#E8E8E8] hover:bg-gray-50'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

## Test Cases

1. **Renders both buttons**: Card View and Table View visible
2. **Shows correct active state**: Active button has dusty rose background
3. **Calls onViewChange**: Click triggers callback with correct value
4. **Keyboard navigation**: Tab between buttons, Enter/Space to select
5. **ARIA attributes**: Correct roles and aria-checked values
