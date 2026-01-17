import { Menu } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ProfileDropdown } from './ProfileDropdown';
import { useNavigation } from '@/hooks/useNavigation';

interface AppHeaderProps {
  weddingId: string;
}

export function AppHeader({ weddingId: _weddingId }: AppHeaderProps) {
  const { openDrawer } = useNavigation();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side: Hamburger (mobile) + Brand */}
        <div className="flex items-center gap-4">
          {/* Hamburger button - visible on mobile/tablet only */}
          <button
            type="button"
            onClick={openDrawer}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A5A5]"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Brand */}
          <h1 className="text-lg font-semibold text-gray-900">
            Wedding Planner
          </h1>
        </div>

        {/* Right side: Notifications + Profile */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
