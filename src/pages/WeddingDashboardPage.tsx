import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { ArrowLeft, RefreshCw, UserCircle, User, CheckSquare, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function WeddingDashboardPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  // @feature 020-dashboard-settings-fix - Added vendorStats, taskStats, itemsStats, barOrdersStats, guestStats, and recentActivity
  const { wedding, metrics, events, vendorStats, taskStats, itemsStats, barOrdersStats, guestStats, recentActivity, isLoading, isError, refetch } = useDashboard(weddingId ?? '');

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
                  <p className="text-sm text-gray-500">
                    {wedding.venue_name && (
                      <>
                        <span className="truncate max-w-[180px] md:max-w-none inline-block align-bottom">
                          {wedding.venue_name}
                        </span>
                        <span className="mx-1 text-gray-400">•</span>
                      </>
                    )}
                    {formatDate(wedding.wedding_date, 'MMMM d, yyyy')}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6" data-testid="dashboard-content">
        {isLoading ? (
          <DashboardStatsGrid metrics={null} events={[]} vendorStats={null} taskStats={null} itemsStats={null} barOrdersStats={null} guestStats={null} isLoading />
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
            {/* 3x2 Stats Grid */}
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                Wedding Statistics
              </h2>
              <DashboardStatsGrid
                metrics={metrics}
                events={events}
                vendorStats={vendorStats}
                taskStats={taskStats}
                itemsStats={itemsStats}
                barOrdersStats={barOrdersStats}
                guestStats={guestStats}
                isLoading={isLoading}
              />
            </section>

            {/* Upcoming Tasks - @feature 020-dashboard-settings-fix */}
            <section aria-labelledby="tasks-heading">
              <h2 id="tasks-heading" className="sr-only">
                Upcoming Tasks
              </h2>
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Upcoming Tasks (Next 7 Days)
                  </h3>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate(`/weddings/${weddingId}/tasks`)}
                    className="text-primary hover:text-primary/80"
                  >
                    View All
                  </Button>
                </div>
                {!taskStats || taskStats.upcoming === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming tasks in the next 7 days</p>
                ) : (
                  <ul className="space-y-2">
                    {taskStats.upcomingTasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            Due: {formatDate(task.due_date, 'EEE, MMM d')}
                            {task.priority && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                    {taskStats.upcoming > 3 && (
                      <li className="text-sm text-gray-500 pt-2">
                        +{taskStats.upcoming - 3} more tasks
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </section>

            {/* Recent Activity - fetches from activity_log table */}
            <section aria-labelledby="activity-heading">
              <h2 id="activity-heading" className="sr-only">
                Recent Activity
              </h2>
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity (Last 5)
                  </h3>
                  <Link
                    to={`/weddings/${weddingId}/activity`}
                    className="text-sm text-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                {!recentActivity || recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                ) : (
                  <ul className="space-y-3">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="flex items-start gap-3 py-2 border-b last:border-b-0">
                        {/* Role-based icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {activity.userRole === 'consultant' ? (
                            <UserCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                            {activity.userFullName && (
                              <span className="text-gray-500 font-normal"> by {activity.userFullName}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section aria-labelledby="actions-heading">
              <h2 id="actions-heading" className="sr-only">
                Quick Actions
              </h2>
              <DashboardQuickActions
                weddingId={weddingId}
                weddingTitle={wedding ? `${wedding.bride_name} & ${wedding.groom_name}` : undefined}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
