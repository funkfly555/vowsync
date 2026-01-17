/**
 * EmailCampaignCard - Card component for displaying campaign in list
 * @feature 016-email-campaigns
 * @task T042
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmailStatusBadge } from '@/components/email/shared/EmailStatusBadge';
import { format } from 'date-fns';
import {
  Users,
  Calendar,
  Send,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Clock,
} from 'lucide-react';
import type { EmailCampaignWithTemplate } from '@/types/email';

interface EmailCampaignCardProps {
  campaign: EmailCampaignWithTemplate;
  weddingId: string;
}

/**
 * Card component displaying campaign summary
 */
export function EmailCampaignCard({ campaign, weddingId }: EmailCampaignCardProps) {
  // Calculate delivery stats
  const deliveryRate =
    campaign.total_sent > 0
      ? Math.round((campaign.total_delivered / campaign.total_sent) * 100)
      : 0;

  const openRate =
    campaign.total_delivered > 0
      ? Math.round((campaign.total_opened / campaign.total_delivered) * 100)
      : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Main info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header with name and status */}
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">
                {campaign.campaign_name}
              </h3>
              <EmailStatusBadge status={campaign.status} type="campaign" size="sm" />
            </div>

            {/* Subject preview */}
            <p className="text-sm text-gray-500 truncate">{campaign.subject}</p>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {campaign.total_recipients}{' '}
                {campaign.recipient_type === 'guest' ? 'guests' : 'vendors'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(campaign.created_at), 'MMM d, yyyy')}
              </span>
              {campaign.email_templates?.template_name && (
                <span className="text-gray-400">
                  Template: {campaign.email_templates.template_name}
                </span>
              )}
            </div>

            {/* Stats for sent campaigns */}
            {campaign.status === 'sent' && (
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {deliveryRate}% delivered
                </span>
                <span className="flex items-center gap-1 text-purple-600">
                  <Send className="h-3.5 w-3.5" />
                  {openRate}% opened
                </span>
                {campaign.total_bounced > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {campaign.total_bounced} bounced
                  </span>
                )}
              </div>
            )}

            {/* Scheduled info */}
            {campaign.status === 'scheduled' && campaign.scheduled_at && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Clock className="h-3.5 w-3.5" />
                Scheduled for {format(new Date(campaign.scheduled_at), 'MMM d, h:mm a')}
              </div>
            )}
          </div>

          {/* Action */}
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/weddings/${weddingId}/emails/${campaign.id}`}>
              View
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
