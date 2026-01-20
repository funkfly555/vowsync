/**
 * Activity Logging Utility
 * @feature 020-dashboard-settings-fix
 *
 * Logs user actions to the activity_log table for audit trail
 * and dashboard Recent Activity display.
 */

import { supabase } from '@/lib/supabase';

export type ActionType = 'created' | 'updated' | 'deleted' | 'completed' | 'cancelled';
export type EntityType = 'guest' | 'vendor' | 'event' | 'task' | 'payment' | 'invoice' | 'budget' | 'bar_order' | 'wedding_item' | 'meal_option';

interface LogActivityParams {
  weddingId: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  description: string;
  changes?: Record<string, unknown>;
}

/**
 * Log an activity to the activity_log table
 * This is a fire-and-forget operation - errors are logged but don't throw
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  const { weddingId, actionType, entityType, entityId, description, changes } = params;

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn('Activity log: No authenticated user, skipping log');
      return;
    }

    // Insert activity log entry
    const { error } = await supabase
      .from('activity_log')
      .insert({
        wedding_id: weddingId,
        user_id: user.id,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        description: description,
        changes: changes || null,
      });

    if (error) {
      // Log error but don't throw - activity logging shouldn't break main operations
      console.error('Failed to log activity:', error);
    }
  } catch (err) {
    // Catch any unexpected errors
    console.error('Activity logging error:', err);
  }
}

/**
 * Helper to generate standard activity descriptions
 */
export const activityDescriptions = {
  guest: {
    created: (name: string) => `Added guest: ${name}`,
    updated: (name: string) => `Updated guest: ${name}`,
    deleted: (name: string) => `Removed guest: ${name}`,
  },
  vendor: {
    created: (name: string) => `Added vendor: ${name}`,
    updated: (name: string) => `Updated vendor: ${name}`,
    deleted: (name: string) => `Removed vendor: ${name}`,
  },
  event: {
    created: (name: string) => `Created event: ${name}`,
    updated: (name: string) => `Updated event: ${name}`,
    deleted: (name: string) => `Deleted event: ${name}`,
  },
  task: {
    created: (title: string) => `Created task: ${title}`,
    updated: (title: string) => `Updated task: ${title}`,
    deleted: (title: string) => `Deleted task: ${title}`,
    completed: (title: string) => `Completed task: ${title}`,
    cancelled: (title: string) => `Cancelled task: ${title}`,
  },
  payment: {
    created: (details: string) => `Scheduled payment: ${details}`,
    updated: (details: string) => `Updated payment: ${details}`,
    deleted: (details: string) => `Removed payment: ${details}`,
    completed: (details: string) => `Marked payment as paid: ${details}`,
  },
  invoice: {
    created: (number: string) => `Created invoice: ${number}`,
    updated: (number: string) => `Updated invoice: ${number}`,
    deleted: (number: string) => `Deleted invoice: ${number}`,
  },
  budget: {
    created: (name: string) => `Added budget category: ${name}`,
    updated: (name: string) => `Updated budget category: ${name}`,
    deleted: (name: string) => `Removed budget category: ${name}`,
  },
  bar_order: {
    created: (name: string) => `Created bar order: ${name}`,
    updated: (name: string) => `Updated bar order: ${name}`,
    deleted: (name: string) => `Deleted bar order: ${name}`,
  },
  wedding_item: {
    created: (name: string) => `Added item: ${name}`,
    updated: (name: string) => `Updated item: ${name}`,
    deleted: (name: string) => `Removed item: ${name}`,
  },
  mealOption: {
    created: (name: string, course: string) => `Added ${course} option: ${name}`,
    updated: (name: string) => `Updated menu option: ${name}`,
    deleted: (name: string, course: string) => `Removed ${course} option: ${name}`,
  },
};
