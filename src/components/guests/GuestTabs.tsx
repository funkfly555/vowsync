/**
 * GuestTabs - Tab navigation component for expanded guest cards
 * 6 tabs: Basic Info, RSVP, Seating, Dietary, Meals, Events & Shuttles
 * @feature 021-guest-page-redesign
 * @feature 024-guest-menu-management
 * @task T009, T016
 */

import { cn } from '@/lib/utils';
import { TabName } from '@/types/guest';
import { User, Mail, MapPin, Utensils, ChefHat, Calendar } from 'lucide-react';

interface GuestTabsProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const TABS: { id: TabName; label: string; icon: React.ReactNode }[] = [
  { id: 'basic', label: 'Basic Info', icon: <User className="h-4 w-4" /> },
  { id: 'rsvp', label: 'RSVP', icon: <Mail className="h-4 w-4" /> },
  { id: 'seating', label: 'Seating', icon: <MapPin className="h-4 w-4" /> },
  { id: 'dietary', label: 'Dietary', icon: <Utensils className="h-4 w-4" /> },
  { id: 'meals', label: 'Meals', icon: <ChefHat className="h-4 w-4" /> },
  { id: 'events-shuttles', label: 'Events & Shuttles', icon: <Calendar className="h-4 w-4" /> },
];

export function GuestTabs({ activeTab, onTabChange }: GuestTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto" aria-label="Guest details tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-[#D4A5A5] text-[#D4A5A5]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
