/**
 * Navigation type definitions for the application shell
 */

/**
 * Represents a single menu item in the navigation
 */
export interface NavigationItem {
  /** Unique identifier (e.g., 'home', 'guests') */
  id: string;
  /** Display text (e.g., 'Home', 'Guests') */
  label: string;
  /** Lucide icon name (e.g., 'Home', 'Users') */
  icon: string;
  /** Route path pattern (e.g., '/weddings/:id/dashboard') */
  path: string;
  /** True if feature not yet implemented */
  isPlaceholder: boolean;
  /** Phase number for placeholder (e.g., 'Phase 6') */
  placeholderPhase?: string;
}

/**
 * Groups navigation items (main menu vs bottom menu)
 */
export interface NavigationGroup {
  /** Group identifier: 'main' or 'bottom' */
  id: string;
  /** Items in this group */
  items: NavigationItem[];
}

/**
 * Zustand store state for mobile drawer
 */
export interface NavigationState {
  /** Whether the mobile drawer is open */
  isDrawerOpen: boolean;
  /** Open the mobile drawer */
  openDrawer: () => void;
  /** Close the mobile drawer */
  closeDrawer: () => void;
  /** Toggle the mobile drawer open/closed */
  toggleDrawer: () => void;
}
