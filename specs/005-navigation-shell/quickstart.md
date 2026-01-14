# Quickstart: Navigation Shell

**Feature**: 005-navigation-shell
**Date**: 2026-01-14

## Prerequisites

- Node.js 18+
- Existing VowSync development environment
- Branch: `005-navigation-shell`

## Quick Setup

```bash
# 1. Checkout feature branch
git checkout 005-navigation-shell

# 2. Install dependencies (if any new ones added)
npm install

# 3. Start development server
npm run dev
```

## Key Files to Create

### 1. Navigation Types (`src/types/navigation.ts`)

```typescript
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  isPlaceholder: boolean;
  placeholderPhase?: string;
}

export interface NavigationState {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}
```

### 2. Navigation Store (`src/hooks/useNavigation.ts`)

```typescript
import { create } from 'zustand';
import type { NavigationState } from '@/types/navigation';

export const useNavigation = create<NavigationState>((set) => ({
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));
```

### 3. Navigation Config (`src/lib/navigation.ts`)

```typescript
import type { NavigationItem } from '@/types/navigation';

export const mainNavItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: 'Home', path: '/weddings/:id', isPlaceholder: false },
  { id: 'guests', label: 'Guests', icon: 'Users', path: '/weddings/:id/guests', isPlaceholder: true, placeholderPhase: 'Phase 6' },
  // ... rest of items
];

export const bottomNavItems: NavigationItem[] = [
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings', isPlaceholder: true, placeholderPhase: 'Phase 15' },
  { id: 'logout', label: 'Logout', icon: 'LogOut', path: '', isPlaceholder: true, placeholderPhase: 'Phase 14' },
];
```

### 4. App Layout (`src/components/layout/AppLayout.tsx`)

```typescript
import { Outlet, useParams } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { MobileDrawer } from './MobileDrawer';

export function AppLayout() {
  const { weddingId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader weddingId={weddingId} />
      <AppSidebar weddingId={weddingId} />
      <MobileDrawer weddingId={weddingId} />
      <main className="pt-16 lg:ml-60 p-8 max-w-[1400px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

### 5. Update App.tsx Routes

```typescript
import { AppLayout } from './components/layout/AppLayout';

// Wrap wedding routes with AppLayout
<Route element={<AppLayout />}>
  <Route path="/weddings/:weddingId" element={<WeddingDashboardPage />} />
  <Route path="/weddings/:weddingId/events" element={<EventTimelinePage />} />
  <Route path="/weddings/:weddingId/events/new" element={<CreateEventPage />} />
  <Route path="/weddings/:weddingId/events/:eventId/edit" element={<EditEventPage />} />
</Route>
```

## Design Tokens Reference

```css
/* Header */
--header-height: 64px;
--header-bg: #FFFFFF;
--header-shadow: 0 2px 8px rgba(0,0,0,0.08);

/* Sidebar */
--sidebar-width: 240px;
--sidebar-bg: #F5F5F5;
--nav-item-height: 48px;
--nav-item-radius: 6px;
--nav-item-padding: 12px 24px;

/* Nav Item States */
--nav-default-text: #2C2C2C;
--nav-hover-bg: #EBEBEB;
--nav-active-bg: #D4A5A5;
--nav-active-text: #FFFFFF;

/* Mobile Drawer */
--drawer-width: 280px;
--overlay-bg: rgba(0,0,0,0.5);
```

## Testing Checklist

- [ ] Desktop: Sidebar visible at ≥1024px
- [ ] Desktop: Active nav item highlighted
- [ ] Desktop: Click Events navigates to timeline
- [ ] Mobile: Hamburger visible at <768px
- [ ] Mobile: Drawer opens on hamburger click
- [ ] Mobile: Overlay visible when drawer open
- [ ] Mobile: Drawer closes on overlay click
- [ ] Mobile: Drawer closes on X button click
- [ ] Mobile: Drawer closes after navigation
- [ ] Placeholder: Toast shows for Guests click
- [ ] Keyboard: Tab navigation works
- [ ] Keyboard: Escape closes drawer
