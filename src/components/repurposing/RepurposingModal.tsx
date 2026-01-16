/**
 * RepurposingModal Component
 * @feature 014-repurposing-timeline
 * @task T012
 *
 * Modal wrapper using Dialog from Shadcn/ui
 * Manages create vs edit mode, handles form submission with time conversion
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RepurposingForm } from './RepurposingForm';
import { OvernightStorageDialog } from './OvernightStorageDialog';
import type { RepurposingFormSchemaType } from '@/schemas/repurposing';
import { convertTimeToDbFormat } from '@/schemas/repurposing';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';
import {
  validateRepurposingForm,
  detectOvernightStorage,
  generateOvernightStorageNote,
} from '@/lib/repurposingValidation';
import {
  useWeddingItemsForDropdown,
  useEventsForDropdown,
  useVendorsForDropdown,
} from '@/hooks/useRepurposingInstructions';
import {
  useCreateRepurposingInstruction,
  useUpdateRepurposingInstruction,
} from '@/hooks/useRepurposingMutations';

// =============================================================================
// Types
// =============================================================================

interface RepurposingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  mode: 'create' | 'edit';
  instruction?: RepurposingInstructionWithRelations | null;
}

// =============================================================================
// Main Component
// =============================================================================

export function RepurposingModal({
  open,
  onOpenChange,
  weddingId,
  mode,
  instruction,
}: RepurposingModalProps) {
  const [formData, setFormData] = useState<RepurposingFormSchemaType | null>(null);
  const [showOvernightDialog, setShowOvernightDialog] = useState(false);
  const [validationState, setValidationState] = useState<ReturnType<
    typeof validateRepurposingForm
  > | null>(null);

  // Fetch dropdown data
  const { data: items = [] } = useWeddingItemsForDropdown(weddingId);
  const { data: events = [] } = useEventsForDropdown(weddingId);
  const { data: vendors = [] } = useVendorsForDropdown(weddingId);

  // Mutations
  const createMutation = useCreateRepurposingInstruction(weddingId);
  const updateMutation = useUpdateRepurposingInstruction(weddingId);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Get event details by ID
  const getEventById = useCallback(
    (eventId: string) => events.find((e) => e.id === eventId),
    [events]
  );

  // Handle form submission
  const handleFormSubmit = useCallback(
    (data: RepurposingFormSchemaType) => {
      const fromEvent = getEventById(data.from_event_id);
      const toEvent = getEventById(data.to_event_id);

      // Run validation
      const validation = validateRepurposingForm({
        pickupTime: data.pickup_time,
        dropoffTime: data.dropoff_time,
        fromEventId: data.from_event_id,
        toEventId: data.to_event_id,
        fromEventEndTime: fromEvent?.event_end_time || null,
        toEventStartTime: toEvent?.event_start_time || null,
      });

      setValidationState(validation);

      // Block if there are errors
      if (validation.hasBlockingErrors) {
        return;
      }

      // Check for overnight storage
      const isOvernight = detectOvernightStorage(
        fromEvent?.event_date,
        toEvent?.event_date
      );

      if (isOvernight && mode === 'create') {
        // Show overnight dialog before saving
        setFormData(data);
        setShowOvernightDialog(true);
        return;
      }

      // Proceed with save
      saveInstruction(data);
    },
    [getEventById, mode]
  );

  // Handle overnight storage confirmation
  const handleOvernightConfirm = useCallback(
    (storageLocation: string) => {
      if (!formData) return;

      const overnightNote = generateOvernightStorageNote(storageLocation);
      const updatedNotes = formData.handling_notes
        ? `${formData.handling_notes}\n\n${overnightNote}`
        : overnightNote;

      const dataWithStorage = {
        ...formData,
        handling_notes: updatedNotes,
      };

      setShowOvernightDialog(false);
      saveInstruction(dataWithStorage);
    },
    [formData]
  );

  // Save instruction to database
  const saveInstruction = useCallback(
    async (data: RepurposingFormSchemaType) => {
      const fromEvent = getEventById(data.from_event_id);
      const toEvent = getEventById(data.to_event_id);

      const dbData = {
        wedding_id: weddingId,
        wedding_item_id: data.wedding_item_id,
        from_event_id: data.from_event_id,
        from_event_end_time: fromEvent?.event_end_time || null,
        pickup_location: data.pickup_location,
        pickup_time: convertTimeToDbFormat(data.pickup_time),
        pickup_time_relative: data.pickup_time_relative || null,
        to_event_id: data.to_event_id,
        to_event_start_time: toEvent?.event_start_time || null,
        dropoff_location: data.dropoff_location,
        dropoff_time: convertTimeToDbFormat(data.dropoff_time),
        dropoff_time_relative: data.dropoff_time_relative || null,
        responsible_party: data.responsible_party,
        responsible_vendor_id: data.responsible_vendor_id || null,
        handling_notes: data.handling_notes || null,
        setup_required: data.setup_required,
        breakdown_required: data.breakdown_required,
        is_critical: data.is_critical,
        status: data.status || 'pending',
      };

      try {
        if (mode === 'create') {
          await createMutation.mutateAsync(dbData as never);
        } else if (instruction) {
          // For edit mode, include status-related fields
          const updateData = {
            ...dbData,
            completed_by: data.completed_by || null,
            issue_description: data.issue_description || null,
          };
          await updateMutation.mutateAsync({
            instructionId: instruction.id,
            updates: updateData,
          });
        }
        onOpenChange(false);
        setFormData(null);
        setValidationState(null);
      } catch (error) {
        // Error handled by mutation
        console.error('Error saving instruction:', error);
      }
    },
    [
      weddingId,
      mode,
      instruction,
      getEventById,
      createMutation,
      updateMutation,
      onOpenChange,
    ]
  );

  // Get event names for overnight dialog
  const fromEvent = formData ? getEventById(formData.from_event_id) : null;
  const toEvent = formData ? getEventById(formData.to_event_id) : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? 'Add Repurposing Instruction'
                : 'Edit Repurposing Instruction'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Create an instruction to track item movement between events.'
                : 'Update the repurposing instruction details.'}
            </DialogDescription>
          </DialogHeader>

          <RepurposingForm
            mode={mode}
            initialData={instruction}
            items={items}
            events={events}
            vendors={vendors}
            onSubmit={handleFormSubmit}
            validationState={validationState}
            formId="repurposing-modal-form"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="repurposing-modal-form"
              disabled={isLoading}
              className="min-h-[44px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Instruction' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overnight Storage Dialog */}
      <OvernightStorageDialog
        open={showOvernightDialog}
        onOpenChange={setShowOvernightDialog}
        fromEventName={fromEvent?.event_name || ''}
        fromEventDate={fromEvent?.event_date || ''}
        toEventName={toEvent?.event_name || ''}
        toEventDate={toEvent?.event_date || ''}
        onConfirm={handleOvernightConfirm}
        onCancel={() => {
          setShowOvernightDialog(false);
          setFormData(null);
        }}
      />
    </>
  );
}
