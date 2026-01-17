/**
 * useEmailCampaignMutations Hook - Campaign CRUD + send operations
 * @feature 016-email-campaigns
 * @task T022, T031
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type {
  EmailCampaign,
  EmailCampaignFormData,
  Recipient,
  RecipientType,
} from '@/types/email';
import { emailCampaignKeys } from './useEmailCampaigns';

// =============================================================================
// Types
// =============================================================================

interface CreateCampaignParams {
  weddingId: string;
  userId: string;
  data: EmailCampaignFormData;
  recipients: Recipient[];
}

interface UpdateCampaignParams {
  campaignId: string;
  data: Partial<EmailCampaignFormData>;
  recipientCount?: number;
}

interface SendCampaignParams {
  campaignId: string;
  weddingId: string;
  recipients: Recipient[];
  subject: string;
  recipientType: RecipientType;
}

interface ScheduleCampaignParams {
  campaignId: string;
  scheduledAt: string;
}

// =============================================================================
// Email Sending Simulation (T031)
// Status distribution:
// - 90% delivered
// - 5% hard_bounce
// - 3% soft_bounce
// - 2% failed
// =============================================================================

function simulateEmailStatus(): 'delivered' | 'hard_bounce' | 'soft_bounce' | 'failed' {
  const rand = Math.random() * 100;
  if (rand < 90) return 'delivered';
  if (rand < 95) return 'hard_bounce';
  if (rand < 98) return 'soft_bounce';
  return 'failed';
}

async function processEmailSimulation(
  logId: string,
  recipientId: string | null,
  recipientType: RecipientType
): Promise<{ status: string; bounced: boolean }> {
  const status = simulateEmailStatus();
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    status,
    sent_at: now,
    updated_at: now,
  };

  if (status === 'delivered') {
    updateData.delivered_at = now;
  } else if (status === 'hard_bounce' || status === 'soft_bounce') {
    updateData.bounced_at = now;
    updateData.bounce_type = status === 'hard_bounce' ? 'hard' : 'soft';
    updateData.bounce_reason =
      status === 'hard_bounce' ? 'Mailbox does not exist' : 'Mailbox full';

    // Hard bounce: Mark recipient email as invalid (T038)
    if (status === 'hard_bounce' && recipientId) {
      const table = recipientType === 'guest' ? 'guests' : 'vendors';
      await supabase
        .from(table)
        .update({ email_valid: false })
        .eq('id', recipientId);
    }
  } else if (status === 'failed') {
    updateData.error_message = 'Simulated delivery failure';
  }

  await supabase.from('email_logs').update(updateData).eq('id', logId);

  return {
    status,
    bounced: status === 'hard_bounce' || status === 'soft_bounce',
  };
}

// =============================================================================
// Mutation Functions
// =============================================================================

async function createCampaign({
  weddingId,
  userId,
  data,
  recipients,
}: CreateCampaignParams): Promise<EmailCampaign> {
  const { data: campaign, error } = await supabase
    .from('email_campaigns')
    .insert({
      wedding_id: weddingId,
      template_id: data.template_id,
      campaign_name: data.campaign_name,
      campaign_type: 'manual',
      subject: data.subject,
      body_html: data.body_html,
      body_text: data.body_text,
      recipient_type: data.recipient_type,
      recipient_filter: data.recipient_filter,
      status: 'draft',
      total_recipients: recipients.length,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }

  return campaign;
}

async function updateCampaign({
  campaignId,
  data,
  recipientCount,
}: UpdateCampaignParams): Promise<EmailCampaign> {
  const updateData: Record<string, unknown> = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (recipientCount !== undefined) {
    updateData.total_recipients = recipientCount;
  }

  const { data: campaign, error } = await supabase
    .from('email_campaigns')
    .update(updateData)
    .eq('id', campaignId)
    .eq('status', 'draft') // Only update drafts
    .select()
    .single();

  if (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }

  return campaign;
}

async function deleteCampaign(campaignId: string): Promise<void> {
  // Delete associated email logs first
  await supabase.from('email_logs').delete().eq('campaign_id', campaignId);

  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('status', 'draft'); // Only delete drafts

  if (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
}

async function scheduleCampaign({
  campaignId,
  scheduledAt,
}: ScheduleCampaignParams): Promise<EmailCampaign> {
  const { data: campaign, error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'scheduled',
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)
    .eq('status', 'draft')
    .select()
    .single();

  if (error) {
    console.error('Error scheduling campaign:', error);
    throw error;
  }

  return campaign;
}

async function sendCampaign({
  campaignId,
  weddingId,
  recipients,
  subject,
  recipientType,
}: SendCampaignParams): Promise<EmailCampaign> {
  // 1. Update status to sending
  await supabase
    .from('email_campaigns')
    .update({ status: 'sending' })
    .eq('id', campaignId);

  // 2. Create email logs for all recipients
  const emailLogs = recipients.map((r) => ({
    campaign_id: campaignId,
    wedding_id: weddingId,
    recipient_type: recipientType,
    recipient_id: r.id,
    recipient_email: r.email,
    recipient_name: r.name,
    subject,
    status: 'pending',
  }));

  const { data: logs, error: logsError } = await supabase
    .from('email_logs')
    .insert(emailLogs)
    .select();

  if (logsError) {
    console.error('Error creating email logs:', logsError);
    throw logsError;
  }

  // 3. Simulate sending (process each log)
  let totalDelivered = 0;
  let totalBounced = 0;
  let totalFailed = 0;

  for (const log of logs || []) {
    const result = await processEmailSimulation(
      log.id,
      log.recipient_id,
      recipientType
    );

    if (result.status === 'delivered') {
      totalDelivered++;
    } else if (result.bounced) {
      totalBounced++;
    } else {
      totalFailed++;
    }
  }

  // 4. Update campaign stats
  const { data: campaign, error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      total_sent: recipients.length,
      total_delivered: totalDelivered,
      total_bounced: totalBounced,
      total_failed: totalFailed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    console.error('Error updating campaign stats:', error);
    throw error;
  }

  return campaign;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook providing mutation functions for email campaign operations
 */
export function useEmailCampaignMutations(weddingId: string, userId: string) {
  const queryClient = useQueryClient();

  const invalidateCampaigns = () => {
    queryClient.invalidateQueries({
      queryKey: emailCampaignKeys.lists(),
    });
  };

  const createMutation = useMutation({
    mutationFn: (params: { data: EmailCampaignFormData; recipients: Recipient[] }) =>
      createCampaign({ weddingId, userId, ...params }),
    onSuccess: () => {
      invalidateCampaigns();
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: UpdateCampaignParams) => updateCampaign(params),
    onSuccess: () => {
      invalidateCampaigns();
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (campaignId: string) => deleteCampaign(campaignId),
    onSuccess: () => {
      invalidateCampaigns();
      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (params: ScheduleCampaignParams) => scheduleCampaign(params),
    onSuccess: () => {
      invalidateCampaigns();
      toast.success('Campaign scheduled successfully');
    },
    onError: (error) => {
      toast.error(`Failed to schedule campaign: ${error.message}`);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (params: Omit<SendCampaignParams, 'weddingId'>) =>
      sendCampaign({ ...params, weddingId }),
    onSuccess: (campaign) => {
      invalidateCampaigns();
      toast.success(
        `Campaign sent! ${campaign.total_delivered} delivered, ${campaign.total_bounced} bounced.`
      );
    },
    onError: (error) => {
      toast.error(`Failed to send campaign: ${error.message}`);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    schedule: scheduleMutation,
    send: sendMutation,
  };
}
