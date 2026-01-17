# Research: Notifications System with Bell Icon

**Feature**: 018-notifications
**Date**: 2026-01-17
**Status**: Complete

## Overview

This document captures technical research and design decisions for the Notifications System feature. All unknowns have been resolved based on project standards and user requirements.

---

## 1. Database Schema Analysis

### Decision: Use Existing `notifications` Table

**Rationale**: The `notifications` table was created in Phase 1 (database schema foundation) with all required fields. No new tables or migrations needed.

**Existing Schema (from 03-DATABASE-SCHEMA.md)**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,
  action_label TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS Policies**: Already configured to allow users to access only their own notifications via `user_id = auth.uid()`.

**Alternatives Considered**:
- Create new notification table: Rejected - table already exists with proper schema
- Modify existing table: Not needed - all required fields present

---

## 2. Notification Type System

### Decision: 8 Notification Types with Icon/Color Mapping

**Rationale**: Based on business rules (PRD 06-BUSINESS-RULES.md), notifications map to specific wedding planning events.

**Type Configuration**:

| Type | Icon | Color | Trigger Event |
|------|------|-------|---------------|
| payment_due | DollarSign | red-500 | Payment due in 7 days or today |
| payment_overdue | DollarSign | red-600 | Payment past due date |
| task_due | CheckSquare | orange-500 | Task due in 7 days or today |
| task_overdue | CheckSquare | orange-600 | Task past due date |
| rsvp_deadline | Users | blue-500 | RSVP deadline within 7 days |
| rsvp_overdue | Users | blue-600 | RSVP deadline passed |
| vendor_update | Briefcase | yellow-500 | Contract/insurance expiring |
| budget_warning | AlertTriangle | red-600 | Budget category exceeded |

**Priority Color Mapping** (left border):

| Priority | Tailwind Class | Hex Value |
|----------|----------------|-----------|
| urgent | border-red-500 | #F44336 |
| high | border-orange-500 | #FF9800 |
| normal | border-blue-500 | #2196F3 |
| low | border-gray-400 | #9E9E9E |

**Alternatives Considered**:
- Single icon for all types: Rejected - reduces scanability and user recognition
- More notification types: Rejected - keep MVP focused on documented business rules

---

## 3. Dropdown vs Popover Component

### Decision: Use Shadcn Popover Component

**Rationale**: Shadcn's Popover provides proper positioning, focus management, and accessibility out of the box.

**Implementation Pattern**:
```tsx
<Popover open={isOpen} onOpenChange={setIsOpen}>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && <Badge />}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-96" align="end">
    <NotificationDropdown />
  </PopoverContent>
</Popover>
```

**Accessibility Features**:
- Focus trap within dropdown
- Escape key closes dropdown
- ARIA labels for screen readers
- Proper focus management on open/close

**Alternatives Considered**:
- Custom dropdown: Rejected - accessibility and positioning complexity
- DropdownMenu: Considered but Popover better for content-heavy panels
- Dialog/Modal: Rejected - too heavy for quick notification viewing

---

## 4. Relative Timestamp Formatting

### Decision: Custom Helper with date-fns Fallback

**Rationale**: Simple relative time formatting is straightforward. date-fns available for complex date formatting if needed later.

**Implementation**:
```typescript
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // For older items, use date-fns format
  return format(then, 'MMM d, yyyy');
}
```

**Alternatives Considered**:
- Full date-fns `formatDistanceToNow`: More verbose output than desired
- moment.js: Rejected - deprecated and large bundle size
- Day.js: Could work but date-fns already in project

---

## 5. State Management for Unread Count

### Decision: TanStack Query with 30-Second Polling

**Rationale**: Polling provides near-real-time updates without Supabase Realtime complexity (deferred to future enhancement).

**Implementation**:
```typescript
const { data: count } = useQuery({
  queryKey: ['notifications', 'unread-count', userId],
  queryFn: fetchUnreadCount,
  refetchInterval: 30000,  // Poll every 30 seconds
  staleTime: 15000,        // Consider stale after 15 seconds
});
```

**Cache Invalidation Strategy**:
- Invalidate on `markAsRead` mutation
- Invalidate on `markAllAsRead` mutation
- Invalidate on `deleteNotification` mutation
- Invalidate on page focus (refetchOnWindowFocus: true)

**Alternatives Considered**:
- Supabase Realtime subscriptions: Deferred - adds complexity for MVP
- Long polling: Similar to current approach but less standard
- WebSockets: Overkill for notification counts

---

## 6. Header Integration Location

### Decision: Add NotificationBell to NavigationShell Header

**Rationale**: Bell icon should be visible on all authenticated pages, positioned near user menu.

**Integration Point**: `src/components/layout/NavigationShell.tsx` or equivalent header component.

**Placement**:
```tsx
<header className="flex items-center justify-between px-6 py-4 border-b">
  <Logo />
  <div className="flex items-center gap-4">
    <NotificationBell />  {/* New component */}
    <UserMenu />
  </div>
</header>
```

**Alternatives Considered**:
- Sidebar placement: Rejected - less discoverable
- Floating button: Rejected - doesn't match app aesthetic
- Bottom navigation (mobile): Could add later for mobile-specific UX

---

## 7. Full Page Pagination Strategy

### Decision: Simple Offset-Based Pagination (20 per page)

**Rationale**: Notification lists are typically small (<1000 items). Offset pagination is simple and sufficient.

**Implementation**:
```typescript
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

**Page Size**: 20 notifications per page (balances load time and scrolling)

**Alternatives Considered**:
- Cursor-based pagination: Overkill for expected data volumes
- Infinite scroll: Could add later, but pagination clearer for filtering
- Load all: Rejected - performance concern with large notification histories

---

## 8. Development Testing Utility

### Decision: "Create Sample Notifications" Button (Dev Only)

**Rationale**: Manual notification creation is needed for testing since automated generation is deferred.

**Environment Check**:
```typescript
{import.meta.env.DEV && (
  <CreateSampleNotifications />
)}
```

**Sample Data Coverage**:
- 1x payment_due (normal priority)
- 1x task_overdue (urgent priority)
- 1x rsvp_deadline (high priority)
- 1x vendor_update (normal priority, read)
- 1x budget_warning (high priority)

**Alternatives Considered**:
- Seed database script: Would work but button is more interactive
- Storybook mocks: Not using Storybook in this project
- Factory functions: Could add but button is simpler for manual testing

---

## 9. Click Outside Behavior

### Decision: Shadcn Popover Handles Automatically

**Rationale**: Popover component has built-in click-outside-to-close behavior.

**Additional Behaviors**:
- Escape key closes dropdown (built-in)
- Clicking notification navigates and closes dropdown
- Clicking "View All" navigates and closes dropdown

**Alternatives Considered**:
- Custom click-outside hook: Not needed with Popover
- Modal backdrop: Too heavy for dropdown

---

## 10. Mobile Responsiveness

### Decision: Responsive Dropdown Width with Full-Screen Option

**Rationale**: 400px dropdown may be too wide on mobile. Use responsive classes.

**Implementation**:
```tsx
<PopoverContent
  className="w-[calc(100vw-32px)] sm:w-96"
  align="end"
  sideOffset={8}
>
```

**Mobile Breakpoints**:
- < 640px: Full width minus padding
- >= 640px: Fixed 384px (w-96)

**Alternatives Considered**:
- Always full-width on mobile: Considered but responsive approach is cleaner
- Separate mobile component: Adds complexity

---

## Summary of Decisions

| Topic | Decision | Key Rationale |
|-------|----------|---------------|
| Database | Use existing table | Already created in Phase 1 |
| Component | Shadcn Popover | Built-in a11y and positioning |
| Timestamps | Custom helper + date-fns | Simple relative times |
| State | TanStack Query + polling | Near-real-time without Realtime complexity |
| Header | NavigationShell integration | Global visibility |
| Pagination | Offset-based, 20/page | Simple, sufficient for scale |
| Dev Testing | Sample button | Interactive testing |
| Mobile | Responsive width | Works across viewports |

---

## Dependencies Confirmed

All dependencies are already installed in the project:

- [x] React 18+
- [x] TanStack Query v5
- [x] Shadcn/ui (Popover, Button, Badge, ScrollArea, Select)
- [x] Lucide React (Bell, DollarSign, CheckSquare, Users, Briefcase, AlertTriangle, Trash2)
- [x] date-fns
- [x] Tailwind CSS v3
- [x] Supabase client

No new package installations required.
