/**
 * CampaignStats - Campaign performance statistics dashboard
 * @feature 016-email-campaigns
 * @task T034
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailStatsCard } from '@/components/email/shared/EmailStatsCard';
import { useEmailLogStats } from '@/hooks/useEmailLogs';
import {
  Send,
  CheckCircle2,
  Mail,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import type { EmailCampaign, CampaignStats as CampaignStatsType } from '@/types/email';

interface CampaignStatsProps {
  campaign: EmailCampaign;
}

/**
 * Calculate campaign statistics from raw numbers
 */
function calculateStats(campaign: EmailCampaign): CampaignStatsType {
  const {
    total_recipients,
    total_sent,
    total_delivered,
    total_opened,
    total_clicked,
    total_bounced,
    total_failed,
  } = campaign;

  return {
    total_recipients,
    total_sent,
    total_delivered,
    total_opened,
    total_clicked,
    total_bounced,
    total_failed,
    delivery_rate: total_sent > 0 ? (total_delivered / total_sent) * 100 : 0,
    open_rate: total_delivered > 0 ? (total_opened / total_delivered) * 100 : 0,
    click_rate: total_opened > 0 ? (total_clicked / total_opened) * 100 : 0,
    bounce_rate: total_sent > 0 ? (total_bounced / total_sent) * 100 : 0,
  };
}

/**
 * Campaign statistics dashboard component
 */
export function CampaignStats({ campaign }: CampaignStatsProps) {
  const stats = calculateStats(campaign);
  const { stats: logStats, isLoading: statsLoading } = useEmailLogStats(campaign.id);

  // Primary metrics
  const primaryMetrics = [
    {
      label: 'Total Sent',
      value: stats.total_sent,
      total: stats.total_recipients,
      icon: Send,
      color: 'blue' as const,
    },
    {
      label: 'Delivered',
      value: stats.total_delivered,
      total: stats.total_sent,
      icon: CheckCircle2,
      color: 'green' as const,
    },
    {
      label: 'Opened',
      value: stats.total_opened,
      total: stats.total_delivered,
      icon: Mail,
      color: 'purple' as const,
    },
    {
      label: 'Bounced',
      value: stats.total_bounced,
      total: stats.total_sent,
      icon: AlertTriangle,
      color: 'orange' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryMetrics.map((metric) => (
          <EmailStatsCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            total={metric.total}
            color={metric.color}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Delivery Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FunnelStep
              label="Sent"
              value={stats.total_sent}
              total={stats.total_recipients}
              color="bg-blue-500"
            />
            <FunnelStep
              label="Delivered"
              value={stats.total_delivered}
              total={stats.total_sent}
              color="bg-green-500"
            />
            <FunnelStep
              label="Opened"
              value={stats.total_opened}
              total={stats.total_delivered}
              color="bg-purple-500"
            />
            <FunnelStep
              label="Clicked"
              value={stats.total_clicked}
              total={stats.total_opened}
              color="bg-indigo-500"
            />
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Delivery Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <StatusRow
                  label="Soft Bounces"
                  value={logStats?.byStatus.soft_bounce || 0}
                  total={stats.total_sent}
                  color="text-amber-600"
                  description="Temporary delivery failures"
                />
                <StatusRow
                  label="Hard Bounces"
                  value={logStats?.byStatus.hard_bounce || 0}
                  total={stats.total_sent}
                  color="text-red-600"
                  description="Permanent delivery failures"
                />
                <StatusRow
                  label="Failed"
                  value={stats.total_failed}
                  total={stats.total_sent}
                  color="text-gray-600"
                  description="Send failures"
                />
                <StatusRow
                  label="Spam Reports"
                  value={logStats?.byStatus.spam || 0}
                  total={stats.total_sent}
                  color="text-red-700"
                  description="Marked as spam"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

interface FunnelStepProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function FunnelStep({ label, value, total, color }: FunnelStepProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-500">
          {value.toLocaleString()} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StatusRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
  description: string;
}

function StatusRow({ label, value, total, color, description }: StatusRowProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className={`font-medium ${color}`}>{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{value}</p>
        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
      </div>
    </div>
  );
}
