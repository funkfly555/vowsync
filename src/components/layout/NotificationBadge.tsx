import { Bell } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationBadgeProps {
  count?: number;
}

export function NotificationBadge({ count = 3 }: NotificationBadgeProps) {
  const handleClick = () => {
    toast('Coming in Phase 14');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A5A5]"
      aria-label={`Notifications: ${count} unread`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-[#D4A5A5] rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}
