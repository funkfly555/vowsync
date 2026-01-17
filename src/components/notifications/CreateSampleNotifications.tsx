/**
 * CreateSampleNotifications Component - Dev-only utility for testing
 * @feature 018-notifications
 * @task T026
 */

import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationMutations } from '@/hooks/useNotificationMutations';
import { toast } from 'sonner';

// =============================================================================
// Component
// =============================================================================

/**
 * Dev-only button to create sample notifications for testing
 * Only rendered when import.meta.env.DEV is true
 */
export function CreateSampleNotifications() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { createSampleNotifications } = useNotificationMutations();

  const handleClick = async () => {
    try {
      await createSampleNotifications.mutateAsync(weddingId || null);
      toast.success('Sample notifications created!');
    } catch (err) {
      console.error('Error creating sample notifications:', err);
      toast.error('Failed to create sample notifications');
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={createSampleNotifications.isPending}
    >
      <Plus className="h-4 w-4 mr-2" />
      {createSampleNotifications.isPending ? 'Creating...' : 'Create Samples'}
    </Button>
  );
}
