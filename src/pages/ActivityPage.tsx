/**
 * Activity Page - Full activity log view
 * @feature 020-dashboard-settings-fix
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { ArrowLeft, UserCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export function ActivityPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const { data: recentActivity, isLoading, isError } = useRecentActivity(weddingId ?? '', 50);

  if (!weddingId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-red-600">Invalid wedding ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/weddings/${weddingId}`)}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-xl text-gray-900">Activity Log</h1>
              <p className="text-sm text-gray-500">All recent activity for this wedding</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2 animate-pulse">
                  <div className="h-5 w-5 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-red-600 text-center py-8">Failed to load activity log</p>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
          ) : (
            <ul className="divide-y">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  {/* Role-based icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {activity.userRole === 'consultant' ? (
                      <UserCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
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
      </main>
    </div>
  );
}
