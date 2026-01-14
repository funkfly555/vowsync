import { useParams, useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { PlaceholderSection } from '@/components/dashboard/PlaceholderSection';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export function WeddingDashboardPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const { wedding, metrics, events, isLoading, isError, refetch } = useDashboard(weddingId ?? '');

  if (!weddingId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-red-600">Invalid wedding ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="wedding-dashboard">
      {/* Header */}
      <header className="border-b bg-white" data-testid="dashboard-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              aria-label="Back to wedding list"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              {isLoading ? (
                <div className="h-7 w-48 bg-gray-200 animate-pulse rounded" />
              ) : wedding ? (
                <>
                  <h1 className="font-semibold text-xl text-gray-900">
                    {wedding.bride_name} & {wedding.groom_name}
                  </h1>
                  <p className="text-sm text-gray-500">{formatDate(wedding.wedding_date, 'MMMM d, yyyy')}</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6" data-testid="dashboard-content">
        {isLoading ? (
          <DashboardStatsGrid metrics={null} events={[]} isLoading />
        ) : isError ? (
          <div className="text-center py-12" data-testid="dashboard-error">
            <p className="text-red-600 mb-4">Failed to load dashboard</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 2x2 Stats Grid */}
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                Wedding Statistics
              </h2>
              <DashboardStatsGrid
                metrics={metrics}
                events={events}
                isLoading={isLoading}
              />
            </section>

            {/* Upcoming Tasks (Placeholder) */}
            <section aria-labelledby="tasks-heading">
              <h2 id="tasks-heading" className="sr-only">
                Upcoming Tasks
              </h2>
              <PlaceholderSection
                title="Upcoming Tasks (Next 7 Days)"
                message="Task management coming in Phase 12"
                showViewAll
              />
            </section>

            {/* Recent Activity (Placeholder) */}
            <section aria-labelledby="activity-heading">
              <h2 id="activity-heading" className="sr-only">
                Recent Activity
              </h2>
              <PlaceholderSection
                title="Recent Activity"
                message="Activity logging will be implemented later"
                showViewAll
              />
            </section>

            {/* Quick Actions */}
            <section aria-labelledby="actions-heading">
              <h2 id="actions-heading" className="sr-only">
                Quick Actions
              </h2>
              <DashboardQuickActions weddingId={weddingId} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
