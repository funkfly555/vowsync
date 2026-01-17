/**
 * CampaignWizard - Multi-step wizard for creating email campaigns
 * @feature 016-email-campaigns
 * @task T030
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TemplateStep } from './TemplateStep';
import { ContentStep } from './ContentStep';
import { RecipientsStep } from './RecipientsStep';
import { ScheduleStep } from './ScheduleStep';
import { ReviewStep } from './ReviewStep';
import { useRecipients } from '@/hooks/useRecipients';
import { useEmailCampaignMutations } from '@/hooks/useEmailCampaignMutations';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2 } from 'lucide-react';
import type {
  RecipientType,
  RecipientFilter,
  EmailTemplate,
  EmailCampaignFormData,
} from '@/types/email';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

type WizardStep = 'template' | 'content' | 'recipients' | 'schedule' | 'review';

interface WizardState {
  // Template selection
  selectedTemplate: EmailTemplate | null;

  // Content
  campaignName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;

  // Recipients
  recipientType: RecipientType;
  filter: RecipientFilter | null;

  // Schedule
  scheduledAt: string | null;
}

interface CampaignWizardProps {
  weddingId: string;
}

// =============================================================================
// Step Configuration
// =============================================================================

const steps: { id: WizardStep; label: string }[] = [
  { id: 'template', label: 'Template' },
  { id: 'content', label: 'Content' },
  { id: 'recipients', label: 'Recipients' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
];

// =============================================================================
// Main Component
// =============================================================================

/**
 * Multi-step campaign creation wizard
 * Orchestrates the entire campaign creation flow
 */
export function CampaignWizard({ weddingId }: CampaignWizardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || '';

  // Current step
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');

  // Wizard state
  const [state, setState] = useState<WizardState>({
    selectedTemplate: null,
    campaignName: '',
    subject: '',
    bodyHtml: '',
    bodyText: '',
    recipientType: 'guest',
    filter: null,
    scheduledAt: null,
  });

  // Mutations
  const { create, send, schedule } = useEmailCampaignMutations(weddingId, userId);

  // Get recipients for submission
  const { result: recipientResult } = useRecipients({
    weddingId,
    recipientType: state.recipientType,
    filter: state.filter,
    excludeInvalidEmails: true,
  });

  // Step index for progress
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // =============================================================================
  // State Updaters
  // =============================================================================

  const handleSelectTemplate = useCallback((template: EmailTemplate | null) => {
    setState((prev) => {
      if (template) {
        return {
          ...prev,
          selectedTemplate: template,
          campaignName: prev.campaignName || `${template.template_name} Campaign`,
          subject: template.subject,
          bodyHtml: template.body_html,
          bodyText: template.body_text || '',
        };
      }
      return {
        ...prev,
        selectedTemplate: null,
      };
    });
  }, []);

  const handleCampaignNameChange = useCallback((name: string) => {
    setState((prev) => ({ ...prev, campaignName: name }));
  }, []);

  const handleSubjectChange = useCallback((subject: string) => {
    setState((prev) => ({ ...prev, subject }));
  }, []);

  const handleBodyHtmlChange = useCallback((bodyHtml: string) => {
    setState((prev) => ({ ...prev, bodyHtml }));
  }, []);

  const handleRecipientTypeChange = useCallback((recipientType: RecipientType) => {
    setState((prev) => ({ ...prev, recipientType }));
  }, []);

  const handleFilterChange = useCallback((filter: RecipientFilter | null) => {
    setState((prev) => ({ ...prev, filter }));
  }, []);

  const handleScheduledAtChange = useCallback((scheduledAt: string | null) => {
    setState((prev) => ({ ...prev, scheduledAt }));
  }, []);

  // =============================================================================
  // Navigation
  // =============================================================================

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1].id);
    }
  };

  const goBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setCurrentStep(steps[idx - 1].id);
    }
  };

  // =============================================================================
  // Submission
  // =============================================================================

  const handleSubmit = async () => {
    const formData: EmailCampaignFormData = {
      template_id: state.selectedTemplate?.id || null,
      campaign_name: state.campaignName,
      subject: state.subject,
      body_html: state.bodyHtml,
      body_text: state.bodyText,
      recipient_type: state.recipientType,
      recipient_filter: state.filter,
      scheduled_at: state.scheduledAt,
    };

    try {
      // Create the campaign
      const campaign = await create.mutateAsync({
        data: formData,
        recipients: recipientResult.recipients,
      });

      if (state.scheduledAt) {
        // Schedule for later
        await schedule.mutateAsync({
          campaignId: campaign.id,
          scheduledAt: state.scheduledAt,
        });
      } else {
        // Send immediately
        await send.mutateAsync({
          campaignId: campaign.id,
          recipients: recipientResult.recipients,
          subject: state.subject,
          recipientType: state.recipientType,
        });
      }

      // Navigate to campaign detail
      navigate(`/weddings/${weddingId}/emails/${campaign.id}`);
    } catch (error) {
      // Error is handled by mutation's onError
      console.error('Campaign submission error:', error);
    }
  };

  const isSubmitting = create.isPending || send.isPending || schedule.isPending;

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress header */}
      <div className="mb-8">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => idx < currentStepIndex && goToStep(step.id)}
              disabled={idx > currentStepIndex}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors',
                idx < currentStepIndex && 'text-green-600 cursor-pointer hover:text-green-700',
                idx === currentStepIndex && 'text-blue-600',
                idx > currentStepIndex && 'text-gray-400 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  idx < currentStepIndex && 'bg-green-100 text-green-600',
                  idx === currentStepIndex && 'bg-blue-100 text-blue-600',
                  idx > currentStepIndex && 'bg-gray-100 text-gray-400'
                )}
              >
                {idx < currentStepIndex ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 'template' && (
            <TemplateStep
              selectedTemplateId={state.selectedTemplate?.id || null}
              onSelectTemplate={handleSelectTemplate}
              onNext={goNext}
            />
          )}

          {currentStep === 'content' && (
            <ContentStep
              recipientType={state.recipientType}
              campaignName={state.campaignName}
              subject={state.subject}
              bodyHtml={state.bodyHtml}
              onCampaignNameChange={handleCampaignNameChange}
              onSubjectChange={handleSubjectChange}
              onBodyHtmlChange={handleBodyHtmlChange}
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {currentStep === 'recipients' && (
            <RecipientsStep
              weddingId={weddingId}
              recipientType={state.recipientType}
              filter={state.filter}
              onRecipientTypeChange={handleRecipientTypeChange}
              onFilterChange={handleFilterChange}
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {currentStep === 'schedule' && (
            <ScheduleStep
              scheduledAt={state.scheduledAt}
              onScheduledAtChange={handleScheduledAtChange}
              onBack={goBack}
              onNext={goNext}
            />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              weddingId={weddingId}
              campaignName={state.campaignName}
              subject={state.subject}
              bodyHtml={state.bodyHtml}
              recipientType={state.recipientType}
              filter={state.filter}
              scheduledAt={state.scheduledAt}
              templateName={state.selectedTemplate?.template_name || null}
              onBack={goBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CampaignWizard;
