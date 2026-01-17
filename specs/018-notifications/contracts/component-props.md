# Component Props Contracts: Notifications System

**Feature**: 018-notifications
**Date**: 2026-01-17

---

## Component Hierarchy

```
NotificationBell (header)
└── NotificationDropdown
    ├── NotificationCard (×10 max)
    │   └── NotificationIcon
    └── Link to NotificationsPage

NotificationsPage (full page)
├── NotificationFilters
├── CreateSampleNotifications (dev only)
└── NotificationCard (×20 per page)
    └── NotificationIcon
```

---

## NotificationBell

**Location**: `src/components/notifications/NotificationBell.tsx`
**Purpose**: Bell icon in header with unread count badge

### Props Interface

```typescript
interface NotificationBellProps {
  /** Optional class name for styling */
  className?: string;
}
```

### Internal State

```typescript
// Managed internally, not exposed as props
const [isOpen, setIsOpen] = useState(false);
const { count, isLoading } = useUnreadCount();
```

### Usage Example

```tsx
// In NavigationShell.tsx header
<NotificationBell className="mr-4" />
```

### Behavior Contract

| Trigger | Action |
|---------|--------|
| Click bell | Toggle dropdown open/closed |
| Click outside | Close dropdown |
| Escape key | Close dropdown |
| unreadCount > 0 | Show badge with count |
| unreadCount > 9 | Show "9+" badge |
| unreadCount === 0 | Hide badge |

---

## NotificationDropdown

**Location**: `src/components/notifications/NotificationDropdown.tsx`
**Purpose**: Dropdown panel showing recent notifications

### Props Interface

```typescript
interface NotificationDropdownProps {
  /** Callback when dropdown should close */
  onClose: () => void;
}
```

### Internal Dependencies

```typescript
const { notifications, isLoading } = useNotifications({ limit: 10 });
const { markAllAsRead } = useNotificationMutations();
const navigate = useNavigate();
```

### Usage Example

```tsx
// In NotificationBell.tsx
<PopoverContent className="w-96" align="end">
  <NotificationDropdown onClose={() => setIsOpen(false)} />
</PopoverContent>
```

### Behavior Contract

| Trigger | Action |
|---------|--------|
| Render | Fetch 10 most recent notifications |
| Click "Mark All Read" | Mark all unread as read, invalidate cache |
| Click notification | Mark as read, navigate if action_url, close dropdown |
| Click "View All" | Navigate to /notifications, close dropdown |
| No notifications | Show empty state message |

---

## NotificationCard

**Location**: `src/components/notifications/NotificationCard.tsx`
**Purpose**: Individual notification display

### Props Interface

```typescript
interface NotificationCardProps {
  /** Notification data */
  notification: NotificationRow;

  /** Callback when card is clicked */
  onClick?: (notification: NotificationRow) => void;

  /** Callback when delete is clicked (full page only) */
  onDelete?: (id: string) => void;

  /** Whether to show delete button (full page only) */
  showDelete?: boolean;

  /** Optional class name for styling */
  className?: string;
}
```

### Usage Examples

```tsx
// In dropdown (no delete)
<NotificationCard
  notification={notification}
  onClick={handleNotificationClick}
/>

// In full page (with delete)
<NotificationCard
  notification={notification}
  onClick={handleNotificationClick}
  onDelete={handleDelete}
  showDelete={true}
/>
```

### Behavior Contract

| State | Visual Style |
|-------|--------------|
| `is_read === false` | Bold title, bg-gray-50, priority border |
| `is_read === true` | Normal title, bg-white, opacity-60, gray border |
| `priority === 'urgent'` | Red left border |
| `priority === 'high'` | Orange left border |
| `priority === 'normal'` | Blue left border |
| `priority === 'low'` | Gray left border |

### Click Behavior

| Click Target | Action |
|--------------|--------|
| Card body | Trigger onClick callback |
| Delete button | Trigger onDelete callback |
| Action button | Navigate to action_url (same as card click) |

---

## NotificationIcon

**Location**: `src/components/notifications/NotificationIcon.tsx`
**Purpose**: Type-specific icon with color

### Props Interface

```typescript
interface NotificationIconProps {
  /** Notification type for icon selection */
  type: NotificationType;

  /** Optional size class override */
  className?: string;
}
```

### Usage Example

```tsx
<NotificationIcon type={notification.notification_type} className="h-5 w-5" />
```

### Icon Mapping

| Type | Icon | Color Class |
|------|------|-------------|
| `payment_due` | DollarSign | text-red-500 |
| `payment_overdue` | DollarSign | text-red-600 |
| `task_due` | CheckSquare | text-orange-500 |
| `task_overdue` | CheckSquare | text-orange-600 |
| `rsvp_deadline` | Users | text-blue-500 |
| `rsvp_overdue` | Users | text-blue-600 |
| `vendor_update` | Briefcase | text-yellow-500 |
| `budget_warning` | AlertTriangle | text-red-600 |
| (unknown) | Bell | text-gray-500 |

---

## NotificationFilters

**Location**: `src/components/notifications/NotificationFilters.tsx`
**Purpose**: Filter controls for full page

### Props Interface

```typescript
interface NotificationFiltersProps {
  /** Current type filter value */
  typeFilter: string;
  /** Callback when type filter changes */
  onTypeChange: (value: string) => void;

  /** Current priority filter value */
  priorityFilter: string;
  /** Callback when priority filter changes */
  onPriorityChange: (value: string) => void;

  /** Current status filter value */
  statusFilter: 'all' | 'read' | 'unread';
  /** Callback when status filter changes */
  onStatusChange: (value: 'all' | 'read' | 'unread') => void;
}
```

### Usage Example

```tsx
// In NotificationsPage.tsx
<NotificationFilters
  typeFilter={typeFilter}
  onTypeChange={setTypeFilter}
  priorityFilter={priorityFilter}
  onPriorityChange={setPriorityFilter}
  statusFilter={statusFilter}
  onStatusChange={setStatusFilter}
/>
```

### Filter Options

**Type Filter**:
- `all` - All Types
- `payment_due` - Payment Due
- `payment_overdue` - Payment Overdue
- `task_due` - Task Due
- `task_overdue` - Task Overdue
- `rsvp_deadline` - RSVP Deadline
- `rsvp_overdue` - RSVP Overdue
- `vendor_update` - Vendor Update
- `budget_warning` - Budget Warning

**Priority Filter**:
- `all` - All Priorities
- `urgent` - Urgent
- `high` - High
- `normal` - Normal
- `low` - Low

**Status Filter**:
- `all` - All
- `unread` - Unread
- `read` - Read

---

## CreateSampleNotifications

**Location**: `src/components/notifications/CreateSampleNotifications.tsx`
**Purpose**: Development utility to create test notifications

### Props Interface

```typescript
interface CreateSampleNotificationsProps {
  /** Optional class name for styling */
  className?: string;
}
```

### Usage Example

```tsx
// In NotificationsPage.tsx (dev only)
{import.meta.env.DEV && (
  <CreateSampleNotifications className="ml-auto" />
)}
```

### Behavior Contract

| Trigger | Action |
|---------|--------|
| Click button | Insert 5 sample notifications to database |
| Success | Show toast "Sample notifications created!" |
| Error | Show toast with error message |
| Production env | Component not rendered |

### Sample Data Generated

```typescript
const sampleNotifications = [
  { notification_type: 'payment_due', priority: 'normal', is_read: false },
  { notification_type: 'task_overdue', priority: 'urgent', is_read: false },
  { notification_type: 'rsvp_deadline', priority: 'high', is_read: false },
  { notification_type: 'vendor_update', priority: 'normal', is_read: true },
  { notification_type: 'budget_warning', priority: 'high', is_read: false },
];
```

---

## NotificationsPage

**Location**: `src/pages/NotificationsPage.tsx`
**Purpose**: Full-page notifications list with filters

### Props Interface

```typescript
// No props - route component
interface NotificationsPageProps {}
```

### Internal State

```typescript
const [typeFilter, setTypeFilter] = useState('all');
const [priorityFilter, setPriorityFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
const [page, setPage] = useState(0);

const { notifications, isLoading, totalCount } = useNotifications({
  limit: 20,
  offset: page * 20,
  typeFilter,
  priorityFilter,
  statusFilter,
});
```

### Route Configuration

```tsx
// In App.tsx or router configuration
<Route path="/notifications" element={<NotificationsPage />} />
```

### Behavior Contract

| State | Display |
|-------|---------|
| Loading | Skeleton cards or spinner |
| No notifications | Empty state message |
| Has notifications | List of NotificationCard components |
| Filter change | Reset to page 0, refetch |

---

## Shared Types Reference

```typescript
// Types used across components (from src/types/notification.ts)

export interface NotificationRow {
  id: string;
  user_id: string;
  wedding_id: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type: EntityType | null;
  entity_id: string | null;
  action_url: string | null;
  action_label: string | null;
  priority: NotificationPriority;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'payment_due'
  | 'payment_overdue'
  | 'task_due'
  | 'task_overdue'
  | 'rsvp_deadline'
  | 'rsvp_overdue'
  | 'vendor_update'
  | 'budget_warning';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type EntityType = 'vendor' | 'guest' | 'task' | 'payment' | 'budget_category';
```
