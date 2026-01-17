/**
 * ContentStep - Second step in campaign wizard for content editing
 * @feature 016-email-campaigns
 * @task T026
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/email/shared/RichTextEditor';
import { VariableHelperInline } from '@/components/email/templates/VariableHelper';
import { EmailPreview } from '@/components/email/campaigns/EmailPreview';
import { ArrowLeft, ArrowRight, Eye, Edit } from 'lucide-react';
import type { RecipientType } from '@/types/email';

interface ContentStepProps {
  recipientType: RecipientType;
  campaignName: string;
  subject: string;
  bodyHtml: string;
  onCampaignNameChange: (name: string) => void;
  onSubjectChange: (subject: string) => void;
  onBodyHtmlChange: (html: string) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Content editing step for campaign wizard
 * Allows editing subject, body with live preview
 */
export function ContentStep({
  recipientType,
  campaignName,
  subject,
  bodyHtml,
  onCampaignNameChange,
  onSubjectChange,
  onBodyHtmlChange,
  onBack,
  onNext,
}: ContentStepProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [subjectCursorPosition, setSubjectCursorPosition] = useState<number | null>(null);

  // Handle variable insertion into subject
  const handleInsertSubjectVariable = (variable: string) => {
    if (subjectCursorPosition !== null) {
      const before = subject.slice(0, subjectCursorPosition);
      const after = subject.slice(subjectCursorPosition);
      onSubjectChange(before + variable + after);
    } else {
      onSubjectChange(subject + variable);
    }
  };

  // Validate before proceeding
  const canProceed = campaignName.trim() && subject.trim() && bodyHtml.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Edit Email Content</h2>
        <p className="text-sm text-gray-500 mt-1">
          Customize your email subject and body
        </p>
      </div>

      {/* Tabs for edit/preview */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6 mt-4">
          {/* Campaign name */}
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input
              id="campaignName"
              placeholder="e.g., Save the Date Announcement"
              value={campaignName}
              onChange={(e) => onCampaignNameChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Internal name for tracking purposes
            </p>
          </div>

          {/* Subject line */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject">Subject Line</Label>
              <VariableHelperInline
                recipientType={recipientType}
                onInsertVariable={handleInsertSubjectVariable}
              />
            </div>
            <Input
              id="subject"
              placeholder="e.g., You're Invited to {{wedding.bride_name}} & {{wedding.groom_name}}'s Wedding!"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              onSelect={(e) => setSubjectCursorPosition(e.currentTarget.selectionStart ?? null)}
            />
          </div>

          {/* Body editor */}
          <div className="space-y-2">
            <Label>Email Body</Label>
            <RichTextEditor
              content={bodyHtml}
              onChange={onBodyHtmlChange}
              recipientType={recipientType}
              placeholder="Write your email content here..."
              minHeight={300}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <EmailPreview
            subject={subject}
            bodyHtml={bodyHtml}
            recipientType={recipientType}
          />
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next: Select Recipients
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
