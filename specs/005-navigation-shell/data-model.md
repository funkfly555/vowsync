# Data Model: Navigation Shell

**Feature**: 005-navigation-shell
**Date**: 2026-01-14

## Overview

This feature is UI-only and does not require database changes. The data model describes the TypeScript interfaces for navigation state and configuration.

---

## TypeScript Interfaces

### NavigationItem

Represents a single menu item in the navigation.

```typescript
interface NavigationItem {
  id: string;              // Unique identifier (e.g., 'home', 'guests')
  label: string;           // Display text (e.g., 'Home', 'Guests')
  icon: string;            // Lucide icon name (e.g., 'Home', 'Users')
  path: string;            // Route path pattern (e.g., '/weddings/:id/dashboard')
  isPlaceholder: boolean;  // True if feature not yet implemented
  placeholderPhase?: string; // Phase number for placeholder (e.g., 'Phase 6')
}
```

### NavigationGroup

Groups navigation items (main menu vs bottom menu).

```typescript
interface NavigationGroup {
  id: string;              // 'main' or 'bottom'
  items: NavigationItem[];
}
```

### NavigationState

Zustand store state for mobile drawer.

```typescript
interface NavigationState {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}
```

---

## Navigation Configuration

Static configuration for all menu items.

### Main Menu Items

| ID | Label | Icon | Path | Placeholder | Phase |
|----|-------|------|------|-------------|-------|
| home | Home | Home | /weddings/:id | No | - |
| guests | Guests | Users | /weddings/:id/guests | Yes | Phase 6 |
| vendors | Vendors | Handshake | /weddings/:id/vendors | Yes | Phase 8 |
| events | Events | Calendar | /weddings/:id/events | No | - |
| items | Items | Armchair | /weddings/:id/items | Yes | Phase 7 |
| budget | Budget | DollarSign | /weddings/:id/budget | Yes | Phase 9 |
| tasks | Tasks | CheckSquare | /weddings/:id/tasks | Yes | Phase 12 |
| docs | Docs | FileText | /weddings/:id/docs | Yes | Phase 14 |

### Bottom Menu Items

| ID | Label | Icon | Path | Placeholder | Phase |
|----|-------|------|------|-------------|-------|
| settings | Settings | Settings | /settings | Yes | Phase 15 |
| logout | Logout | LogOut | - | Yes | Phase 14 |

---

## State Transitions

### Drawer State

```
CLOSED ──[hamburger click]──> OPEN
OPEN ──[overlay click]──> CLOSED
OPEN ──[close button click]──> CLOSED
OPEN ──[navigation click]──> CLOSED
OPEN ──[escape key]──> CLOSED
OPEN ──[resize to desktop]──> CLOSED
```

---

## Database Changes

**None required.** This feature is entirely frontend UI.
