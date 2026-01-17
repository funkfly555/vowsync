/**
 * EmailStatusBadge - Status badge for campaigns and email logs
 * @feature 016-email-campaigns
 * @task T005
 */

import { Badge } from '@/components/ui/badge';
import {
  FileEdit,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  MailOpen,
  MousePointerClick,
  AlertTriangle,
  Ban,
  AlertOctagon,
} from 'lucide-react';
import type { CampaignStatus, EmailLogStatus } from '@/types/email';

interface EmailStatusBadgeProps {
  status: CampaignStatus | EmailLogStatus;
  type: 'campaign' | 'log';
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

/**
 * Status configuration for campaigns
 * Colors per design system:
 * - draft: gray
 * - scheduled: blue
 * - sending: orange
 * - sent: green
 * - failed: red
 */
const campaignStatusConfig: Record<
  CampaignStatus,
  { label: string; bgColor: string; textColor: string; icon: typeof FileEdit }
> = {
  draft: {
    label: 'Draft',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: FileEdit,
  },
  scheduled: {
    label: 'Scheduled',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Clock,
  },
  sending: {
    label: 'Sending',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: Loader2,
  },
  sent: {
    label: 'Sent',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: XCircle,
  },
};

/**
 * Status configuration for email logs
 * Colors per design system:
 * - pending: gray
 * - sent: blue
 * - delivered: green
 * - opened: teal
 * - clicked: purple
 * - bounced: orange
 * - soft_bounce: orange
 * - hard_bounce: red
 * - failed: red
 * - spam: red
 */
const logStatusConfig: Record<
  EmailLogStatus,
  { label: string; bgColor: string; textColor: string; icon: typeof Mail }
> = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: Clock,
  },
  sent: {
    label: 'Sent',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Mail,
  },
  delivered: {
    label: 'Delivered',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircle,
  },
  opened: {
    label: 'Opened',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    icon: MailOpen,
  },
  clicked: {
    label: 'Clicked',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: MousePointerClick,
  },
  bounced: {
    label: 'Bounced',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: AlertTriangle,
  },
  soft_bounce: {
    label: 'Soft Bounce',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: AlertTriangle,
  },
  hard_bounce: {
    label: 'Hard Bounce',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: AlertOctagon,
  },
  failed: {
    label: 'Failed',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: XCircle,
  },
  spam: {
    label: 'Spam',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: Ban,
  },
};

/**
 * Status badge component for campaigns and email logs
 * Displays appropriate color and icon based on status type
 */
export function EmailStatusBadge({
  status,
  type,
  size = 'md',
  showIcon = false,
}: EmailStatusBadgeProps) {
  const config =
    type === 'campaign'
      ? campaignStatusConfig[status as CampaignStatus]
      : logStatusConfig[status as EmailLogStatus];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-0.5';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.textColor} border-0 ${sizeClasses} font-medium`}
    >
      {showIcon && (
        <Icon
          className={`${iconSize} mr-1 ${status === 'sending' ? 'animate-spin' : ''}`}
        />
      )}
      {config.label}
    </Badge>
  );
}
