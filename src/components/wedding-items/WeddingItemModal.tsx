/**
 * WeddingItemModal - Modal wrapper for create/edit wedding item form
 * @feature 013-wedding-items
 * @task T016
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useWeddingItem } from '@/hooks/useWeddingItem';
import { useWeddingItemMutations } from '@/hooks/useWeddingItemMutations';
import type { WeddingItemFormData } from '@/types/weddingItem';
import { WeddingItemForm } from './WeddingItemForm';

interface WeddingItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  itemId?: string; // undefined = create mode, string = edit mode
  onSuccess?: () => void;
}

/**
 * Modal component for creating and editing wedding items
 * Handles loading state for edit mode and form submission
 */
export function WeddingItemModal({
  open,
  onOpenChange,
  weddingId,
  itemId,
  onSuccess,
}: WeddingItemModalProps) {
  const isEditMode = !!itemId;
  const [defaultValues, setDefaultValues] = useState<Partial<WeddingItemFormData> | undefined>(
    undefined
  );

  // Fetch existing item data in edit mode
  const { item, isLoading: isLoadingItem } = useWeddingItem(isEditMode ? itemId : undefined);

  // Mutations
  const { createItem, updateItem } = useWeddingItemMutations({ weddingId });

  // Populate default values when editing
  useEffect(() => {
    if (isEditMode && item) {
      // Transform item data to form data format
      const eventQuantities: Record<string, number> = {};
      item.event_quantities?.forEach((eq) => {
        eventQuantities[eq.event_id] = eq.quantity_required;
      });

      setDefaultValues({
        category: item.category,
        description: item.description,
        aggregation_method: item.aggregation_method,
        number_available: item.number_available,
        cost_per_unit: item.cost_per_unit,
        cost_details: item.cost_details,
        supplier_name: item.supplier_name,
        notes: item.notes,
        event_quantities: eventQuantities,
      });
    } else if (!isEditMode) {
      setDefaultValues(undefined);
    }
  }, [isEditMode, item]);

  // Reset default values when modal closes
  useEffect(() => {
    if (!open) {
      setDefaultValues(undefined);
    }
  }, [open]);

  const handleSubmit = async (data: WeddingItemFormData) => {
    try {
      if (isEditMode && itemId) {
        await updateItem.mutateAsync({
          itemId: itemId,
          data,
        });
        toast.success('Item updated successfully');
      } else {
        await createItem.mutateAsync(data);
        toast.success('Item created successfully');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving wedding item:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} item. Please try again.`);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-full max-h-full md:max-w-2xl md:max-h-[85vh] md:h-auto overflow-y-auto rounded-none md:rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the item details below.'
              : 'Fill in the details for the new wedding item.'}
          </DialogDescription>
        </DialogHeader>

        {isEditMode && (isLoadingItem || !defaultValues) ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <WeddingItemForm
            key={isEditMode ? itemId : 'create'}
            weddingId={weddingId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
            defaultValues={defaultValues}
            mode={isEditMode ? 'edit' : 'create'}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
