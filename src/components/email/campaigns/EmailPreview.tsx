/**
 * EmailPreview - Preview component for email content
 * @feature 016-email-campaigns
 * @task T024
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Eye } from 'lucide-react';
import type { RecipientType } from '@/types/email';
import { replaceVariables } from '@/types/email';
import { cn } from '@/lib/utils';

interface EmailPreviewProps {
  subject: string;
  bodyHtml: string;
  recipientType: RecipientType;
  sampleData?: Record<string, unknown>;
  viewMode?: 'desktop' | 'mobile';
  onViewModeChange?: (mode: 'desktop' | 'mobile') => void;
}

/**
 * Sample data for preview
 */
const defaultSampleData: Record<string, Record<string, unknown>> = {
  guest: {
    guest: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      table_number: '12',
    },
    wedding: {
      bride_name: 'Sarah',
      groom_name: 'Michael',
      date: 'June 15, 2026',
      venue_name: 'The Grand Ballroom',
    },
    event: {
      name: 'Wedding Reception',
      date: 'June 15, 2026',
      time: '6:00 PM',
      location: 'The Grand Ballroom, 123 Main St',
    },
  },
  vendor: {
    vendor: {
      company_name: 'Elegant Flowers Co.',
      contact_name: 'Jane Doe',
    },
    wedding: {
      bride_name: 'Sarah',
      groom_name: 'Michael',
      date: 'June 15, 2026',
      venue_name: 'The Grand Ballroom',
    },
    event: {
      name: 'Wedding Ceremony',
      date: 'June 15, 2026',
      time: '4:00 PM',
      location: 'Garden Chapel',
    },
  },
};

/**
 * Email preview component with variable replacement and view mode toggle
 */
export function EmailPreview({
  subject,
  bodyHtml,
  recipientType,
  sampleData,
  viewMode: controlledViewMode,
  onViewModeChange,
}: EmailPreviewProps) {
  const [internalViewMode, setInternalViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const viewMode = controlledViewMode ?? internalViewMode;
  const handleViewModeChange = onViewModeChange ?? setInternalViewMode;

  // Merge sample data
  const data = {
    ...defaultSampleData[recipientType],
    ...sampleData,
  };

  // Replace variables with sample data
  const previewSubject = replaceVariables(subject, data);
  const previewBody = replaceVariables(bodyHtml, data);

  return (
    <div className="space-y-4">
      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Email Preview</span>
          <Badge variant="secondary" className="text-xs">
            Sample data
          </Badge>
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3',
              viewMode === 'desktop' && 'bg-white shadow-sm'
            )}
            onClick={() => handleViewModeChange('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3',
              viewMode === 'mobile' && 'bg-white shadow-sm'
            )}
            onClick={() => handleViewModeChange('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Preview container */}
      <div
        className={cn(
          'border rounded-lg bg-gray-100 p-4 transition-all mx-auto',
          viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        )}
      >
        {/* Email client chrome */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Email header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-16">From:</span>
                <span className="text-sm">VowSync &lt;noreply@vowsync.app&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-16">To:</span>
                <span className="text-sm">
                  {recipientType === 'guest'
                    ? 'john.smith@example.com'
                    : 'contact@elegantflowers.com'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 w-16">Subject:</span>
                <span className="text-sm font-medium">{previewSubject}</span>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div
            className="p-6 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewBody }}
          />
        </div>
      </div>

      {/* Variable replacement note */}
      <p className="text-xs text-gray-500 text-center">
        Variables like {'{{guest.name}}'} are replaced with sample data for preview.
        Actual values will be used when sending.
      </p>
    </div>
  );
}

// =============================================================================
// Compact Preview Component
// =============================================================================

interface EmailPreviewCompactProps {
  subject: string;
  bodyHtml: string;
  recipientType: RecipientType;
}

/**
 * Compact email preview for wizard review step
 */
export function EmailPreviewCompact({
  subject,
  bodyHtml,
  recipientType,
}: EmailPreviewCompactProps) {
  const data = defaultSampleData[recipientType];
  const previewSubject = replaceVariables(subject, data);
  const previewBody = replaceVariables(bodyHtml, data);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Subject */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <p className="text-sm">
          <span className="text-gray-500">Subject:</span>{' '}
          <span className="font-medium">{previewSubject}</span>
        </p>
      </div>

      {/* Body preview */}
      <div
        className="p-4 prose prose-sm max-w-none max-h-48 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: previewBody }}
      />
    </div>
  );
}
