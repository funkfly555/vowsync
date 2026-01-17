/**
 * RecipientsStep - Third step in campaign wizard for recipient selection
 * @feature 016-email-campaigns
 * @task T027
 */

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RecipientSelector } from '@/components/email/campaigns/RecipientSelector';
import { ArrowLeft, ArrowRight, Users, Building2 } from 'lucide-react';
import type { RecipientType, RecipientFilter } from '@/types/email';
import { cn } from '@/lib/utils';

interface RecipientsStepProps {
  weddingId: string;
  recipientType: RecipientType;
  filter: RecipientFilter | null;
  onRecipientTypeChange: (type: RecipientType) => void;
  onFilterChange: (filter: RecipientFilter | null) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Recipient selection step for campaign wizard
 * Allows switching between guest/vendor and applying filters
 */
export function RecipientsStep({
  weddingId,
  recipientType,
  filter,
  onRecipientTypeChange,
  onFilterChange,
  onBack,
  onNext,
}: RecipientsStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Select Recipients</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose who will receive this email
        </p>
      </div>

      {/* Recipient type toggle */}
      <div className="space-y-3">
        <Label>Recipient Type</Label>
        <RadioGroup
          value={recipientType}
          onValueChange={(v) => {
            onRecipientTypeChange(v as RecipientType);
            onFilterChange(null); // Reset filter when switching type
          }}
          className="grid grid-cols-2 gap-4"
        >
          <Label
            htmlFor="guest"
            className={cn(
              'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
              recipientType === 'guest'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <RadioGroupItem value="guest" id="guest" />
            <Users className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium">Guests</span>
              <p className="text-xs text-gray-500">Wedding attendees</p>
            </div>
          </Label>

          <Label
            htmlFor="vendor"
            className={cn(
              'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
              recipientType === 'vendor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <RadioGroupItem value="vendor" id="vendor" />
            <Building2 className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium">Vendors</span>
              <p className="text-xs text-gray-500">Service providers</p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Recipient selector with filters */}
      <RecipientSelector
        weddingId={weddingId}
        recipientType={recipientType}
        filter={filter}
        onFilterChange={onFilterChange}
        showPreview={true}
        maxPreviewCount={15}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next: Schedule
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
