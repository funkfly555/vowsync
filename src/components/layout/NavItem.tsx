import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Home,
  Users,
  Mail,
  Handshake,
  Calendar,
  Armchair,
  ArrowLeftRight,
  PiggyBank,
  Wine,
  CheckSquare,
  Activity,
  FileText,
  Settings,
  LogOut,
  UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/types/navigation';
import { getNavPath } from '@/lib/navigation';

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Users,
  Mail,
  Handshake,
  Calendar,
  Armchair,
  ArrowLeftRight,
  PiggyBank,
  Wine,
  CheckSquare,
  Activity,
  FileText,
  Settings,
  LogOut,
  UtensilsCrossed,
};

interface NavItemProps {
  item: NavigationItem;
  weddingId: string;
  isActive: boolean;
  onClick?: () => void;
}

export function NavItem({ item, weddingId, isActive, onClick }: NavItemProps) {
  const navigate = useNavigate();
  const IconComponent = iconMap[item.icon];

  const handleClick = () => {
    if (item.isPlaceholder) {
      toast(`Coming in ${item.placeholderPhase}`);
      return;
    }

    const path = getNavPath(item, weddingId);
    navigate(path);

    // Call optional onClick (used for closing drawer on mobile)
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base styles
        'w-full flex items-center gap-3 px-6 py-3 rounded-md text-left',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A5A5] focus-visible:ring-offset-2',
        // Default state
        'text-[#2C2C2C]',
        // Hover state (only when not active)
        !isActive && 'hover:bg-[#EBEBEB]',
        // Active state
        isActive && 'bg-[#D4A5A5] text-white',
        // Placeholder items get slightly muted text when not active
        item.isPlaceholder && !isActive && 'text-gray-500'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {IconComponent && (
        <IconComponent
          className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-white' : '')}
        />
      )}
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );
}
