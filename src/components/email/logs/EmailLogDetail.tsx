/**
 * EmailLogDetail - Detail view for a single email log
 * @feature 016-email-campaigns
 * @task T036
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { EmailStatusBadge } from '@/components/email/shared/EmailStatusBadge';
import { format } from 'date-fns';
import {
  Mail,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MousePointer,
  XCircle,
} from 'lucide-react';
import type { EmailLog } from '@/types/email';

interface EmailLogDetailProps {
  log: EmailLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal dialog showing detailed email log information
 */
export function EmailLogDetail({ log, open, onOpenChange }: EmailLogDetailProps) {
  if (!log) return null;

  // Build timeline of events
  const timeline = buildTimeline(log);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipient info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">{log.recipient_name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{log.recipient_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <EmailStatusBadge status={log.status} type="log" />
            </div>
          </div>

          <Separator />

          {/* Subject */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Subject</p>
            <p className="font-medium">{log.subject}</p>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">Timeline</p>
            <div className="space-y-3">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`p-1.5 rounded-full ${event.iconBg} text-white flex-shrink-0`}
                  >
                    <event.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.label}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error/Bounce info */}
          {(log.bounce_reason || log.error_message) && (
            <>
              <Separator />
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-700 text-sm">
                      {log.bounce_type === 'hard'
                        ? 'Hard Bounce'
                        : log.bounce_type === 'soft'
                        ? 'Soft Bounce'
                        : 'Error'}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {log.bounce_reason || log.error_message}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Engagement stats */}
          {(log.open_count > 0 || log.click_count > 0) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Eye className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{log.open_count}</p>
                  <p className="text-xs text-gray-500">Total Opens</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <MousePointer className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{log.click_count}</p>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

interface TimelineEvent {
  label: string;
  time: string;
  icon: React.ElementType;
  iconBg: string;
}

function buildTimeline(log: EmailLog): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Created
  events.push({
    label: 'Email queued',
    time: format(new Date(log.created_at), 'MMM d, yyyy h:mm a'),
    icon: Clock,
    iconBg: 'bg-gray-400',
  });

  // Sent
  if (log.sent_at) {
    events.push({
      label: 'Email sent',
      time: format(new Date(log.sent_at), 'MMM d, yyyy h:mm a'),
      icon: Mail,
      iconBg: 'bg-blue-500',
    });
  }

  // Delivered
  if (log.delivered_at) {
    events.push({
      label: 'Email delivered',
      time: format(new Date(log.delivered_at), 'MMM d, yyyy h:mm a'),
      icon: CheckCircle2,
      iconBg: 'bg-green-500',
    });
  }

  // Bounced
  if (log.bounced_at) {
    events.push({
      label: log.bounce_type === 'hard' ? 'Hard bounce' : 'Soft bounce',
      time: format(new Date(log.bounced_at), 'MMM d, yyyy h:mm a'),
      icon: AlertTriangle,
      iconBg: 'bg-amber-500',
    });
  }

  // Opened
  if (log.opened_at) {
    events.push({
      label: 'Email opened',
      time: format(new Date(log.opened_at), 'MMM d, yyyy h:mm a'),
      icon: Eye,
      iconBg: 'bg-purple-500',
    });
  }

  // Clicked
  if (log.first_clicked_at) {
    events.push({
      label: 'Link clicked',
      time: format(new Date(log.first_clicked_at), 'MMM d, yyyy h:mm a'),
      icon: MousePointer,
      iconBg: 'bg-indigo-500',
    });
  }

  // Failed
  if (log.status === 'failed' && log.error_message) {
    events.push({
      label: 'Delivery failed',
      time: log.updated_at
        ? format(new Date(log.updated_at), 'MMM d, yyyy h:mm a')
        : 'Unknown',
      icon: XCircle,
      iconBg: 'bg-red-500',
    });
  }

  return events;
}
