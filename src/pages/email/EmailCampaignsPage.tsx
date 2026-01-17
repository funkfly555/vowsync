/**
 * EmailCampaignsPage - Email campaign list page
 * @feature 016-email-campaigns
 * @task T044
 *
 * Route: /weddings/:weddingId/emails
 */

import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmailCampaignList } from '@/components/email/campaigns/EmailCampaignList';
import { ArrowLeft, FileText } from 'lucide-react';

/**
 * Page component for viewing all email campaigns for a wedding
 */
export function EmailCampaignsPage() {
  const { weddingId } = useParams<{ weddingId: string }>();

  if (!weddingId) {
    return (
      <div className="p-6">
        <p className="text-red-500">Wedding ID is required</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/weddings/${weddingId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wedding
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/weddings/${weddingId}/emails/templates`}>
            <FileText className="h-4 w-4 mr-2" />
            Manage Templates
          </Link>
        </Button>
      </div>

      {/* Campaign list */}
      <EmailCampaignList weddingId={weddingId} />
    </div>
  );
}
