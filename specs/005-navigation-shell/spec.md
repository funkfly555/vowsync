# Feature Specification: Navigation Shell

**Feature Branch**: `005-navigation-shell`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Create a navigation shell for the wedding management application with header, sidebar, and mobile drawer"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop Navigation (Priority: P1)

Wedding planners using desktop computers need a persistent navigation sidebar to quickly access different sections of the wedding management system while maintaining context of which wedding they're managing.

**Why this priority**: Navigation is foundational - users cannot access any features without it. Desktop is the primary use case for wedding planners who work extensively on detailed planning.

**Independent Test**: Can be fully tested by navigating between Dashboard and Events pages using sidebar links, verifying active state highlighting.

**Acceptance Scenarios**:

1. **Given** user is on any wedding page (dashboard or events), **When** they view the left sidebar, **Then** they see all 8 menu items (Home, Guests, Vendors, Events, Items, Budget, Tasks, Docs) plus Settings and Logout at the bottom
2. **Given** user is viewing the sidebar, **When** they hover over a menu item, **Then** the background lightens to #EBEBEB
3. **Given** user is on the Dashboard page, **When** they view the sidebar, **Then** the "Home" item shows active state (dusty rose background #D4A5A5, white text)
4. **Given** user is on the Events page, **When** they view the sidebar, **Then** the "Events" item shows active state
5. **Given** user clicks "Events" in sidebar, **When** the navigation completes, **Then** user is taken to the events timeline page for the current wedding

---

### User Story 2 - Top Header with Branding (Priority: P1)

Users need a persistent header showing the application brand and quick access to notifications and profile options.

**Why this priority**: Header provides essential context (branding) and future access points (notifications, profile) that users expect in a professional application.

**Independent Test**: Can be verified by checking header presence on all pages with correct branding, icons, and positioning.

**Acceptance Scenarios**:

1. **Given** user is on any page within the application, **When** they view the top header, **Then** they see "Wedding Planner" brand text on the left
2. **Given** user views the header, **When** they look at the right side, **Then** they see a notification bell icon with badge showing "3" and a profile dropdown showing "Profile"
3. **Given** user scrolls down the page content, **When** they look at the header, **Then** it remains fixed at the top of the viewport
4. **Given** user views the header, **When** they observe the styling, **Then** header has 64px height, white background, and subtle shadow

---

### User Story 3 - Mobile Navigation Drawer (Priority: P2)

Wedding planners using mobile devices or tablets need access to the same navigation options through a mobile-friendly drawer interface.

**Why this priority**: Mobile access is secondary to desktop for detailed wedding planning work, but still necessary for quick checks and updates on the go.

**Independent Test**: Can be tested by opening mobile drawer, navigating to Events, and closing drawer via overlay tap.

**Acceptance Scenarios**:

1. **Given** user is on mobile viewport (< 768px), **When** they view the page, **Then** they see a hamburger menu button on the left of the header instead of the sidebar
2. **Given** user taps the hamburger button, **When** the drawer animates, **Then** a 280px wide navigation drawer slides in from the left
3. **Given** the drawer is open, **When** user views the screen, **Then** they see a semi-transparent overlay (rgba(0,0,0,0.5)) covering the main content
4. **Given** the drawer is open, **When** user taps the overlay, **Then** the drawer closes
5. **Given** the drawer is open, **When** user taps a close button (X) at the top of the drawer, **Then** the drawer closes
6. **Given** the drawer is open, **When** user taps "Events", **Then** they navigate to the events page and the drawer closes automatically

---

### User Story 4 - Placeholder Navigation Items (Priority: P3)

Users clicking on features not yet implemented should receive clear feedback that the feature is coming in a future phase.

**Why this priority**: Provides professional user experience for incomplete features rather than broken links or errors.

**Independent Test**: Can be tested by clicking any placeholder menu item and verifying toast message appears.

**Acceptance Scenarios**:

1. **Given** user clicks "Guests" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 6"
2. **Given** user clicks "Vendors" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 8"
3. **Given** user clicks "Items" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 7"
4. **Given** user clicks "Budget" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 9"
5. **Given** user clicks "Tasks" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 12"
6. **Given** user clicks "Docs" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 14"
7. **Given** user clicks "Settings" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 15"
8. **Given** user clicks "Logout" in navigation, **When** the action completes, **Then** a toast notification appears saying "Coming in Phase 14"

---

### Edge Cases

- What happens when user navigates directly to a wedding URL without going through wedding list? Navigation should still display correctly with the weddingId from URL.
- What happens when user resizes browser from desktop to mobile? Layout should responsively switch between sidebar and hamburger menu.
- What happens on tablet viewport (768px - 1023px)? Should use desktop layout with sidebar.
- What happens when notification bell or profile dropdown is clicked? Show toast "Coming in Phase 14" (authentication features).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a fixed header at the top of all wedding management pages with height 64px, white background, and shadow
- **FR-002**: System MUST display "Wedding Planner" brand text in the header on the left side
- **FR-003**: System MUST display notification bell icon with badge "3" and profile dropdown on the right side of header
- **FR-004**: System MUST display a fixed sidebar (240px width) on desktop viewports (>=1024px) with #F5F5F5 background
- **FR-005**: System MUST display 8 primary menu items in the sidebar: Home, Guests, Vendors, Events, Items, Budget, Tasks, Docs
- **FR-006**: System MUST display Settings and Logout items at the bottom of the sidebar
- **FR-007**: System MUST highlight the active menu item with #D4A5A5 background and white text
- **FR-008**: System MUST show hover state on menu items with #EBEBEB background
- **FR-009**: System MUST provide working navigation for Home (dashboard) and Events (events timeline) menu items
- **FR-010**: System MUST show toast notifications for placeholder menu items indicating which phase the feature is planned for
- **FR-011**: System MUST display hamburger menu button on mobile viewports (<768px)
- **FR-012**: System MUST provide a slide-in drawer (280px width) when hamburger is tapped on mobile
- **FR-013**: System MUST display semi-transparent overlay when mobile drawer is open
- **FR-014**: System MUST close mobile drawer when overlay is tapped or close button is clicked
- **FR-015**: System MUST automatically close mobile drawer after navigation occurs
- **FR-016**: Main content area MUST have left margin of 240px on desktop to accommodate sidebar
- **FR-017**: Main content area MUST have padding of 32px and max-width of 1400px

### Key Entities

- **Navigation Item**: Represents a menu entry with icon, label, route path, and active/placeholder status
- **Layout State**: Tracks whether mobile drawer is open/closed and current viewport size

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate between Dashboard and Events pages within 1 second using sidebar/drawer links
- **SC-002**: Active navigation state correctly highlights the current page 100% of the time
- **SC-003**: Mobile drawer opens and closes smoothly with animation completing in under 300ms
- **SC-004**: Layout transitions between desktop and mobile viewports without visual glitches
- **SC-005**: All placeholder menu items display appropriate toast messages when clicked
- **SC-006**: Navigation is accessible via keyboard (tab navigation, enter to select)

## Assumptions

- Wedding list page (/) does not use the navigation shell - it is a standalone page
- Navigation shell only applies to pages under /weddings/:id/* routes
- The weddingId is always available in the URL for wedding-specific pages
- Notification count "3" is a static placeholder until notification system is built
- Profile dropdown is non-functional until authentication is implemented in Phase 14
