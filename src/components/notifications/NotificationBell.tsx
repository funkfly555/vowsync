/**
 * NotificationBell Component - Bell icon with unread count badge
 * @feature 018-notifications
 * @task T007
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { formatBadgeCount } from '@/lib/notificationHelpers';
import { NotificationDropdown } from './NotificationDropdown';

// =============================================================================
// Props Interface
// =============================================================================

interface NotificationBellProps {
  /** Optional class name for styling */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Bell icon with unread count badge in header
 * Opens a dropdown showing recent notifications
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { count, isLoading } = useUnreadCount();

  // Format badge count (handles 0, 1-99, 99+)
  const badgeText = formatBadgeCount(count);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A5A5]',
            className
          )}
          aria-label={`Notifications${count > 0 ? `: ${count} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />

          {/* Badge - only show if count > 0 */}
          {!isLoading && badgeText && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-[#D4A5A5] rounded-full"
              aria-hidden="true"
            >
              {badgeText}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-32px)] sm:w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
