/**
 * CreateEmailCampaignPage - Create new email campaign wizard
 * @feature 016-email-campaigns
 * @task T032
 *
 * Route: /weddings/:weddingId/emails/new
 */

import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CampaignWizard } from '@/components/email/campaigns/CampaignWizard';
import { ArrowLeft } from 'lucide-react';

export function CreateEmailCampaignPage() {
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/weddings/${weddingId}/emails`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Email Campaign</h1>
        <p className="text-gray-500 mt-1">
          Send personalized emails to your guests or vendors
        </p>
      </div>

      {/* Campaign wizard */}
      <CampaignWizard weddingId={weddingId} />
    </div>
  );
}
