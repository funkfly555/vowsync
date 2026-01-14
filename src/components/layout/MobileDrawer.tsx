import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavItem } from './NavItem';
import { DrawerOverlay } from './DrawerOverlay';
import { useNavigation } from '@/hooks/useNavigation';
import { mainNavItems, bottomNavItems, isNavItemActive } from '@/lib/navigation';

interface MobileDrawerProps {
  weddingId: string;
}

export function MobileDrawer({ weddingId }: MobileDrawerProps) {
  const location = useLocation();
  const { isDrawerOpen, closeDrawer } = useNavigation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Focus management: focus close button when drawer opens
  useEffect(() => {
    if (isDrawerOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isDrawerOpen]);

  // Close drawer on route change
  useEffect(() => {
    if (isDrawerOpen) {
      closeDrawer();
    }
    // Only react to pathname changes, not to closeDrawer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle navigation click - close drawer after navigation
  const handleNavClick = () => {
    closeDrawer();
  };

  return (
    <>
      {/* Overlay */}
      <DrawerOverlay isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-xl',
          'transform transition-transform duration-200 ease-out',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer header with close button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A5A5]"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              weddingId={weddingId}
              isActive={isNavItemActive(item, location.pathname, weddingId)}
              onClick={handleNavClick}
            />
          ))}
        </nav>

        {/* Separator */}
        <div className="px-3">
          <div className="border-t border-gray-300" />
        </div>

        {/* Bottom navigation items */}
        <nav className="py-4 px-3 space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              weddingId={weddingId}
              isActive={false}
              onClick={handleNavClick}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
