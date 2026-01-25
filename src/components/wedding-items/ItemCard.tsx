/**
 * ItemCard - Main expandable card container component
 * Manages expand/collapse state and coordinates collapsed/expanded views
 * Uses FormProvider with auto-save pattern (matches GuestCard.tsx)
 * @feature 031-items-card-table-view
 * @task T018, T050
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ItemCardCollapsed } from './ItemCardCollapsed';
import { ItemCardExpanded } from './ItemCardExpanded';
import { DetailsTab, QuantitiesTab, CostsTab, NotesTab } from './tabs';
import type { WeddingItemWithQuantities, AggregationMethod } from '@/types/weddingItem';
import { weddingItemFormSchema } from '@/schemas/weddingItem';
import { useWeddingItemMutations } from '@/hooks/useWeddingItemMutations';
import { toast } from 'sonner';
import type { ItemTabName } from './ItemTabs';

// Auto-save status type
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Form data type for inline editing
export interface ItemEditFormData {
  category: string;
  description: string;
  aggregation_method: AggregationMethod;
  number_available: number | null;
  cost_per_unit: number | null;
  cost_details: string | null;
  supplier_name: string | null;
  notes: string | null;
  event_quantities: Record<string, number>;
}

interface TabContentProps {
  tab: ItemTabName;
  item: WeddingItemWithQuantities;
}

/**
 * Render the appropriate tab content based on active tab
 */
function TabContent({ tab, item }: TabContentProps) {
  switch (tab) {
    case 'details':
      return <DetailsTab />;
    case 'quantities':
      return <QuantitiesTab weddingId={item.wedding_id} />;
    case 'costs':
      return <CostsTab totalRequired={item.total_required} />;
    case 'notes':
      return <NotesTab />;
    default:
      return null;
  }
}

interface ItemCardProps {
  item: WeddingItemWithQuantities;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
  onDelete: (item: WeddingItemWithQuantities) => void;
}

/**
 * Card wrapper with expand/collapse functionality
 * Pattern matches GuestCard.tsx exactly:
 * - Collapsed view always visible with checkbox + chevron
 * - Expanded view with FormProvider for inline editing
 * - Auto-save on field changes with debouncing
 */
export function ItemCard({
  item,
  isSelected,
  onToggleSelect,
  onDelete,
}: ItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { updateItem } = useWeddingItemMutations({ weddingId: item.wedding_id });
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // Initialize form with item data
  const formMethods = useForm<ItemEditFormData>({
    resolver: zodResolver(weddingItemFormSchema),
    defaultValues: itemToFormData(item),
  });

  const { reset, getValues, watch } = formMethods;

  // Flag to skip watch callback during reset (prevents infinite loop)
  const isResettingRef = useRef(false);

  // Ref to hold the latest performSave function (avoids stale closure issues)
  const performSaveRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Auto-save function
  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const currentValues = getValues();
      await updateItem.mutateAsync({
        itemId: item.id,
        data: formDataToItemUpdate(currentValues),
      });
      setSaveStatus('saved');

      // Mark as resetting to skip watch callback trigger from reset
      isResettingRef.current = true;
      reset(currentValues); // Reset dirty state with current values
      // Use microtask to clear the flag after React processes the reset
      queueMicrotask(() => {
        isResettingRef.current = false;
      });

      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error auto-saving item:', error);
      setSaveStatus('error');
      toast.error('Failed to save changes. Please try again.');

      // Reset error status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [item.id, updateItem, reset, getValues]);

  // Keep performSaveRef updated with latest performSave
  performSaveRef.current = performSave;

  // Subscribe to form changes for auto-save
  // watch() fires on any field change - we debounce and save
  useEffect(() => {
    if (!isExpanded) {
      // Clear debounce timer when card is collapsed
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      return;
    }

    const subscription = watch(() => {
      // Skip if we're in the middle of a reset (prevents infinite loop)
      if (isResettingRef.current) return;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the save operation (500ms delay)
      debounceTimerRef.current = setTimeout(() => {
        performSaveRef.current?.();
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isExpanded, watch]);

  // Handle card expand toggle
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Handle selection toggle
  const handleToggleSelect = useCallback(() => {
    onToggleSelect(item.id);
  }, [item.id, onToggleSelect]);

  // Handle delete action
  const handleDelete = useCallback(() => {
    onDelete(item);
  }, [item, onDelete]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExpanded) {
      handleToggleExpand();
    }
  };

  return (
    <div
      className={cn(
        'bg-white overflow-visible relative transition-all duration-300',
        isExpanded && 'z-10 shadow-lg rounded-lg'
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Collapsed view - always visible */}
      <ItemCardCollapsed
        item={item}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggleExpand={handleToggleExpand}
        onToggleSelect={handleToggleSelect}
      />

      {/* Expanded view - animated in/out */}
      <FormProvider {...formMethods}>
        <ItemCardExpanded
          item={item}
          isExpanded={isExpanded}
          saveStatus={saveStatus}
          onDelete={handleDelete}
        >
          {(activeTab) => <TabContent tab={activeTab} item={item} />}
        </ItemCardExpanded>
      </FormProvider>
    </div>
  );
}

/**
 * Convert Item entity to form data format
 */
function itemToFormData(item: WeddingItemWithQuantities): ItemEditFormData {
  // Transform event_quantities from array to Record<eventId, quantity>
  const eventQuantities: Record<string, number> = {};
  if (item.event_quantities) {
    for (const eq of item.event_quantities) {
      eventQuantities[eq.event_id] = eq.quantity_required;
    }
  }

  return {
    category: item.category,
    description: item.description,
    aggregation_method: item.aggregation_method,
    number_available: item.number_available,
    cost_per_unit: item.cost_per_unit,
    cost_details: item.cost_details,
    supplier_name: item.supplier_name,
    notes: item.notes,
    event_quantities: eventQuantities,
  };
}

/**
 * Convert form data to item update request format
 */
function formDataToItemUpdate(data: ItemEditFormData): Record<string, unknown> {
  return {
    category: data.category,
    description: data.description,
    aggregation_method: data.aggregation_method,
    number_available: data.number_available,
    cost_per_unit: data.cost_per_unit,
    cost_details: data.cost_details || null,
    supplier_name: data.supplier_name || null,
    notes: data.notes || null,
    event_quantities: data.event_quantities,
  };
}
