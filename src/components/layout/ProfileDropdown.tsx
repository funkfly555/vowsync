import { User } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileDropdown() {
  const handleClick = () => {
    toast('Coming in Phase 14');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A5A5]"
      aria-label="User profile"
    >
      <User className="h-5 w-5" />
      <span className="hidden sm:inline font-medium">Profile</span>
    </button>
  );
}
