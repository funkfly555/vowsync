import type { NavigationItem } from '@/types/navigation';

/**
 * Main navigation items displayed in the sidebar
 */
export const mainNavItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'Home',
    path: '/weddings/:id',
    isPlaceholder: false,
  },
  {
    id: 'guests',
    label: 'Guests',
    icon: 'Users',
    path: '/weddings/:id/guests',
    isPlaceholder: false,
  },
  {
    id: 'vendors',
    label: 'Vendors',
    icon: 'Handshake',
    path: '/weddings/:id/vendors',
    isPlaceholder: false,
  },
  {
    id: 'events',
    label: 'Events',
    icon: 'Calendar',
    path: '/weddings/:id/events',
    isPlaceholder: false,
  },
  {
    id: 'items',
    label: 'Items',
    icon: 'Armchair',
    path: '/weddings/:id/items',
    isPlaceholder: false,
  },
  {
    id: 'repurposing',
    label: 'Repurposing',
    icon: 'ArrowLeftRight',
    path: '/weddings/:id/repurposing',
    isPlaceholder: false,
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: 'DollarSign',
    path: '/weddings/:id/budget',
    isPlaceholder: false,
  },
  {
    id: 'bar-orders',
    label: 'Bar Orders',
    icon: 'Wine',
    path: '/weddings/:id/bar-orders',
    isPlaceholder: false,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: 'CheckSquare',
    path: '/weddings/:id/tasks',
    isPlaceholder: true,
    placeholderPhase: 'Phase 12',
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: 'FileText',
    path: '/weddings/:id/docs',
    isPlaceholder: true,
    placeholderPhase: 'Phase 14',
  },
];

/**
 * Bottom navigation items (Settings, Logout)
 */
export const bottomNavItems: NavigationItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    isPlaceholder: true,
    placeholderPhase: 'Phase 15',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: 'LogOut',
    path: '',
    isPlaceholder: true,
    placeholderPhase: 'Phase 14',
  },
];

/**
 * Get the actual path for a navigation item, replacing :id with weddingId
 */
export function getNavPath(item: NavigationItem, weddingId: string): string {
  return item.path.replace(':id', weddingId);
}

/**
 * Check if a navigation item is active based on current pathname
 */
export function isNavItemActive(
  item: NavigationItem,
  pathname: string,
  weddingId: string
): boolean {
  const itemPath = getNavPath(item, weddingId);

  // For home, check exact match or just the wedding base path
  if (item.id === 'home') {
    return pathname === itemPath || pathname === `/weddings/${weddingId}`;
  }

  // For other items, check if pathname starts with the item path
  return pathname.startsWith(itemPath);
}
