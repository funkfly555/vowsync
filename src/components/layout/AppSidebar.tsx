import { useLocation } from 'react-router-dom';
import { NavItem } from './NavItem';
import { mainNavItems, bottomNavItems, isNavItemActive } from '@/lib/navigation';

interface AppSidebarProps {
  weddingId: string;
}

export function AppSidebar({ weddingId }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:pt-16 bg-[#F5F5F5] border-r border-gray-200"
      aria-label="Main navigation"
    >
      {/* Main navigation items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            weddingId={weddingId}
            isActive={isNavItemActive(item, location.pathname, weddingId)}
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
            isActive={false} // Bottom items are never active
          />
        ))}
      </nav>
    </aside>
  );
}
