import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, Store, Calendar, Clock, DollarSign, FileText } from 'lucide-react';

interface DashboardQuickActionsProps {
  weddingId: string;
}

/**
 * Quick Actions section with 6 buttons in 2x3 grid
 * - Dusty Rose background (#D4A5A5), white text, 8px radius
 * - Only "Create Event" is functional
 * - Other buttons show toast: "Coming in Phase X"
 */
export function DashboardQuickActions({ weddingId }: DashboardQuickActionsProps) {
  const navigate = useNavigate();

  const showComingSoon = (feature: string, phase: string) => {
    toast(`${feature} coming in ${phase}`);
  };

  const actions = [
    {
      id: 'add-guest',
      label: 'Add Guest',
      icon: UserPlus,
      onClick: () => showComingSoon('Add Guest', 'Phase 6'),
    },
    {
      id: 'add-vendor',
      label: 'Add Vendor',
      icon: Store,
      onClick: () => showComingSoon('Add Vendor', 'Phase 8'),
    },
    {
      id: 'create-event',
      label: 'Create Event',
      icon: Calendar,
      onClick: () => navigate(`/weddings/${weddingId}/events/new`),
    },
    {
      id: 'view-timeline',
      label: 'View Timeline',
      icon: Clock,
      onClick: () => showComingSoon('View Timeline', 'Phase 10'),
    },
    {
      id: 'manage-budget',
      label: 'Manage Budget',
      icon: DollarSign,
      onClick: () => showComingSoon('Manage Budget', 'Phase 9'),
    },
    {
      id: 'generate-docs',
      label: 'Generate Docs',
      icon: FileText,
      onClick: () => showComingSoon('Generate Docs', 'Phase 14'),
    },
  ];

  return (
    <div data-testid="quick-actions">
      <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 bg-[#D4A5A5] hover:bg-[#C49494] text-white rounded-lg transition-colors"
              data-testid={`quick-action-${action.id}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
