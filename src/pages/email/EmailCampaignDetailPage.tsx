/**
 * EmailCampaignDetailPage - Campaign detail with stats and logs
 * @feature 016-email-campaigns
 * @task T037
 *
 * Route: /weddings/:weddingId/emails/:campaignId
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailStatusBadge } from '@/components/email/shared/EmailStatusBadge';
import { CampaignStats } from '@/components/email/campaigns/CampaignStats';
import { EmailLogTable } from '@/components/email/logs/EmailLogTable';
import { EmailLogDetail } from '@/components/email/logs/EmailLogDetail';
import { useEmailCampaign } from '@/hooks/useEmailCampaign';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  Mail,
  BarChart3,
  FileText,
} from 'lucide-react';
import type { EmailLog } from '@/types/email';

export function EmailCampaignDetailPage() {
  const { weddingId, campaignId } = useParams<{
    weddingId: string;
    campaignId: string;
  }>();
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const { campaign, isLoading, isError } = useEmailCampaign(campaignId);

  if (!weddingId || !campaignId) {
    return (
      <div className="p-6">
        <p className="text-red-500">Invalid campaign URL</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Campaign not found</p>
          <Button asChild>
            <Link to={`/weddings/${weddingId}/emails`}>Back to Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              to={`/weddings/${weddingId}/emails`}
              className="hover:text-gray-700 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {campaign.campaign_name}
            <EmailStatusBadge status={campaign.status} type="campaign" />
          </h1>
          <p className="text-gray-500">
            {campaign.email_templates?.template_name
              ? `Based on: ${campaign.email_templates.template_name}`
              : 'Custom campaign'}
          </p>
        </div>
      </div>

      {/* Campaign info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard
          icon={Users}
          label="Recipients"
          value={`${campaign.total_recipients} ${
            campaign.recipient_type === 'guest' ? 'guests' : 'vendors'
          }`}
        />
        <InfoCard
          icon={Calendar}
          label="Created"
          value={format(new Date(campaign.created_at), 'MMM d, yyyy')}
        />
        {campaign.sent_at && (
          <InfoCard
            icon={Mail}
            label="Sent"
            value={format(new Date(campaign.sent_at), 'MMM d, h:mm a')}
          />
        )}
        {campaign.scheduled_at && campaign.status === 'scheduled' && (
          <InfoCard
            icon={Clock}
            label="Scheduled"
            value={format(new Date(campaign.scheduled_at), 'MMM d, h:mm a')}
          />
        )}
      </div>

      {/* Tabs for stats and logs */}
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            Email Logs
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Mail className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <CampaignStats campaign={campaign} />
        </TabsContent>

        <TabsContent value="logs">
          <EmailLogTable campaignId={campaignId} onViewLog={setSelectedLog} />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {/* Subject */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">Subject</p>
            <p className="font-medium">{campaign.subject}</p>
          </div>

          {/* Body */}
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <p className="text-sm font-medium text-gray-500">Email Body</p>
            </div>
            <div
              className="p-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: campaign.body_html }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Email log detail modal */}
      <EmailLogDetail
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{label}</span>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
}
