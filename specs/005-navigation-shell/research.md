# Research: Navigation Shell

**Feature**: 005-navigation-shell
**Date**: 2026-01-14

## Research Summary

This feature is primarily UI-focused with no significant unknowns. All technologies are already in use in the project.

---

## 1. React Router Nested Layouts

**Decision**: Use React Router v6 Outlet pattern for layout wrapping

**Rationale**:
- Already using React Router v6 in the project
- Outlet pattern cleanly separates layout from page content
- Maintains existing route structure without breaking changes

**Alternatives Considered**:
- HOC wrapper pattern - rejected (less clean, harder to maintain)
- Context-based layout - rejected (violates constitution, Context API not for state)

**Implementation Pattern**:
```tsx
// App.tsx
<Route element={<AppLayout />}>
  <Route path="/weddings/:weddingId" element={<WeddingDashboardPage />} />
  <Route path="/weddings/:weddingId/events" element={<EventTimelinePage />} />
</Route>

// AppLayout.tsx
function AppLayout() {
  return (
    <div>
      <AppHeader />
      <AppSidebar />
      <main><Outlet /></main>
    </div>
  );
}
```

---

## 2. Mobile Drawer State Management

**Decision**: Use Zustand for drawer open/close state

**Rationale**:
- Constitution mandates Zustand for global state
- Simple boolean state (isOpen)
- Needs to be accessible from header (hamburger) and drawer (close button)

**Alternatives Considered**:
- Local useState in AppLayout - rejected (harder to manage from multiple components)
- Context API - rejected (prohibited by constitution)

**Store Pattern**:
```tsx
interface NavigationStore {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}
```

---

## 3. Responsive Breakpoint Implementation

**Decision**: Use Tailwind's responsive utilities with lg: prefix for desktop

**Rationale**:
- Spec defines: Mobile <768px, Desktop ≥1024px
- Tailwind's `lg:` prefix corresponds to 1024px breakpoint
- Tailwind's `md:` prefix corresponds to 768px breakpoint

**Implementation**:
- Sidebar: `hidden lg:block` (show on desktop only)
- Hamburger: `lg:hidden` (show on mobile/tablet only)
- Main content: `lg:ml-[240px]` (sidebar margin on desktop only)

---

## 4. Active State Detection

**Decision**: Use React Router's useLocation hook with pathname matching

**Rationale**:
- Already using React Router
- useLocation provides current pathname
- Simple string comparison for exact or partial matches

**Implementation Pattern**:
```tsx
const location = useLocation();
const isActive = location.pathname.includes('/events')
  || location.pathname.endsWith('/dashboard');
```

---

## 5. Animation for Mobile Drawer

**Decision**: Use Tailwind CSS transitions with transform

**Rationale**:
- No external animation library needed
- Tailwind provides smooth transitions
- Meets <300ms animation requirement

**Implementation**:
```css
/* Closed state */
.drawer { transform: translateX(-100%); transition: transform 200ms ease-out; }

/* Open state */
.drawer-open { transform: translateX(0); }
```

---

## 6. Keyboard Navigation

**Decision**: Use semantic HTML with proper tabIndex and focus management

**Rationale**:
- Constitution requires keyboard navigation
- Native HTML elements (button, a, nav) provide accessibility
- Focus trap needed for mobile drawer

**Implementation**:
- All nav items are `<button>` or `<a>` elements
- Mobile drawer gets focus when opened
- Escape key closes drawer
- Tab navigation cycles through menu items

---

## No NEEDS CLARIFICATION Remaining

All technical decisions have been made. Ready for Phase 1.
