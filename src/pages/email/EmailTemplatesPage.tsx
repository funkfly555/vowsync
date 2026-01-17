/**
 * EmailTemplatesPage - Email template management page
 * @feature 016-email-campaigns
 * @task T019
 *
 * Route: /weddings/:weddingId/emails/templates
 */

import { useAuth } from '@/contexts/AuthContext';
import { EmailTemplateList } from '@/components/email/templates/EmailTemplateList';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Email templates management page
 * Displays list of templates with CRUD operations
 * Templates are scoped to the consultant (user)
 */
export function EmailTemplatesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Please log in to manage email templates.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <EmailTemplateList consultantId={user.id} />
    </div>
  );
}
