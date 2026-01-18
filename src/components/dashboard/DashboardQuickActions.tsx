import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Store, Calendar, Clock, PiggyBank, FileText } from 'lucide-react';
import { GenerateFunctionSheetModal } from '@/components/documents';

interface DashboardQuickActionsProps {
  weddingId: string;
  weddingTitle?: string;
}

/**
 * Quick Actions section with 6 buttons in 2x3 grid
 * - Dusty Rose background (#D4A5A5), white text, 8px radius
 * - Only "Create Event" is functional
 * - Other buttons show toast: "Coming in Phase X"
 */
export function DashboardQuickActions({ weddingId, weddingTitle }: DashboardQuickActionsProps) {
  const navigate = useNavigate();
  const [showDocModal, setShowDocModal] = useState(false);

  // @feature 020-dashboard-settings-fix - Updated to navigate to implemented pages
  const actions = [
    {
      id: 'add-guest',
      label: 'Add Guest',
      icon: UserPlus,
      onClick: () => navigate(`/weddings/${weddingId}/guests`),
    },
    {
      id: 'add-vendor',
      label: 'Add Vendor',
      icon: Store,
      onClick: () => navigate(`/weddings/${weddingId}/vendors`),
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
      onClick: () => navigate(`/weddings/${weddingId}/events`),
    },
    {
      id: 'manage-budget',
      label: 'Manage Budget',
      icon: PiggyBank,
      onClick: () => navigate(`/weddings/${weddingId}/budget`),
    },
    {
      id: 'generate-docs',
      label: 'Generate Docs',
      icon: FileText,
      onClick: () => setShowDocModal(true),
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

      {/* Generate Function Sheet Modal */}
      <GenerateFunctionSheetModal
        open={showDocModal}
        onOpenChange={setShowDocModal}
        weddingId={weddingId}
        weddingTitle={weddingTitle}
      />
    </div>
  );
}
