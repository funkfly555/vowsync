/**
 * ReviewStep - Final step in campaign wizard for review and confirmation
 * @feature 016-email-campaigns
 * @task T029
 */

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EmailPreviewCompact } from '@/components/email/campaigns/EmailPreview';
import { useRecipients } from '@/hooks/useRecipients';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Send,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { RecipientType, RecipientFilter } from '@/types/email';

interface ReviewStepProps {
  weddingId: string;
  campaignName: string;
  subject: string;
  bodyHtml: string;
  recipientType: RecipientType;
  filter: RecipientFilter | null;
  scheduledAt: string | null;
  templateName: string | null;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * Review step for campaign wizard
 * Shows summary of all selections before sending/scheduling
 */
export function ReviewStep({
  weddingId,
  campaignName,
  subject,
  bodyHtml,
  recipientType,
  filter,
  scheduledAt,
  templateName,
  onBack,
  onSubmit,
  isSubmitting,
}: ReviewStepProps) {
  // Get recipient count
  const { result, isLoading: recipientsLoading } = useRecipients({
    weddingId,
    recipientType,
    filter,
    excludeInvalidEmails: true,
  });

  const recipientCount = result.totalCount;
  const invalidCount = result.invalidEmailCount;

  // Validation checks
  const validationItems = [
    {
      label: 'Campaign name',
      valid: campaignName.trim().length > 0,
      value: campaignName,
    },
    {
      label: 'Subject line',
      valid: subject.trim().length > 0,
      value: subject.length > 50 ? subject.slice(0, 50) + '...' : subject,
    },
    {
      label: 'Email content',
      valid: bodyHtml.trim().length > 0,
      value: 'Content ready',
    },
    {
      label: 'Recipients',
      valid: recipientCount > 0,
      value: `${recipientCount} ${recipientType}${recipientCount !== 1 ? 's' : ''}`,
    },
  ];

  const allValid = validationItems.every((item) => item.valid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Review Your Campaign</h2>
        <p className="text-sm text-gray-500 mt-1">
          Please review the details before {scheduledAt ? 'scheduling' : 'sending'}
        </p>
      </div>

      {/* Validation checklist */}
      <div className="space-y-2">
        {validationItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {item.valid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-sm text-gray-600">{item.value}</span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Campaign details */}
      <div className="space-y-4">
        <h3 className="font-medium">Campaign Details</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Campaign name */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Campaign</span>
            </div>
            <p className="font-medium">{campaignName}</p>
            {templateName && (
              <p className="text-xs text-gray-500 mt-1">
                Based on: {templateName}
              </p>
            )}
          </div>

          {/* Recipients */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Recipients</span>
            </div>
            {recipientsLoading ? (
              <p className="font-medium">Loading...</p>
            ) : (
              <>
                <p className="font-medium">
                  {recipientCount} {recipientType === 'guest' ? 'guests' : 'vendors'}
                </p>
                {invalidCount > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {invalidCount} with invalid emails excluded
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            {scheduledAt ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="text-xs font-medium uppercase">Delivery</span>
          </div>
          <p className="font-medium">
            {scheduledAt ? (
              <>
                Scheduled for {format(new Date(scheduledAt), 'PPP')} at{' '}
                {format(new Date(scheduledAt), 'p')}
              </>
            ) : (
              'Send immediately'
            )}
          </p>
        </div>
      </div>

      <Separator />

      {/* Email preview */}
      <div className="space-y-3">
        <h3 className="font-medium">Email Preview</h3>
        <EmailPreviewCompact
          subject={subject}
          bodyHtml={bodyHtml}
          recipientType={recipientType}
        />
      </div>

      {/* Warning for invalid emails */}
      {invalidCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Some recipients excluded
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {invalidCount} {recipientType === 'guest' ? 'guests' : 'vendors'} have
              invalid email addresses and will not receive this email.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!allValid || isSubmitting || recipientCount === 0}
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {scheduledAt ? 'Scheduling...' : 'Sending...'}
            </>
          ) : (
            <>
              {scheduledAt ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Campaign
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Campaign
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
