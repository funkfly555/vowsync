/**
 * VendorCard - Main expandable card container component
 * Manages expand/collapse state and coordinates collapsed/expanded views
 * @feature 028-vendor-card-expandable
 * @task T046-T057
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorCardCollapsed } from './VendorCardCollapsed';
import { VendorCardExpanded, SaveStatus } from './VendorCardExpanded';
import { VendorTabName } from './VendorTabs';
import { OverviewTab, ContractTab, PaymentsInvoicesTab, ContactsTab } from './tabs';
import { VendorDisplay, VendorFormData } from '@/types/vendor';
import { vendorFormSchema, VendorSchemaType } from '@/schemas/vendor';
import { useVendorMutations } from '@/hooks/useVendorMutations';
import { useVendorPayments, calculatePaymentSummary } from '@/hooks/useVendorPayments';
import { toast } from 'sonner';

interface TabContentProps {
  tab: VendorTabName;
  vendor: VendorDisplay;
  weddingId: string;
}

/**
 * Render the appropriate tab content based on active tab
 */
function TabContent({ tab, vendor, weddingId }: TabContentProps) {
  switch (tab) {
    case 'overview':
      return <OverviewTab />;
    case 'contract':
      return <ContractTab vendor={vendor} />;
    case 'payments-invoices':
      return <PaymentsInvoicesTab vendorId={vendor.id} weddingId={weddingId} />;
    case 'contacts':
      return <ContactsTab vendorId={vendor.id} />;
    default:
      return null;
  }
}

interface VendorCardProps {
  vendor: VendorDisplay;
  weddingId: string;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: (vendorId: string) => void;
  onToggleSelect: (vendorId: string) => void;
  onDelete?: (vendorId: string) => void;
}

export function VendorCard({
  vendor,
  weddingId,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onDelete,
}: VendorCardProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { updateVendor } = useVendorMutations({ weddingId });
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // Fetch payments to calculate summary
  const { payments } = useVendorPayments(vendor.id);
  const paymentSummary = calculatePaymentSummary(payments);
  const paymentSummaryDisplay = paymentSummary.totalPayments > 0
    ? `${paymentSummary.totalPaid} of ${paymentSummary.totalPayments} paid`
    : '—';

  // Initialize form with vendor data
  const formMethods = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: vendorToFormData(vendor),
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
      await updateVendor.mutateAsync({
        vendorId: vendor.id,
        data: formDataToVendorUpdate(currentValues),
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
      console.error('Error auto-saving vendor:', error);
      setSaveStatus('error');
      toast.error('Failed to save changes. Please try again.');

      // Reset error status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [vendor.id, updateVendor, reset, getValues]);

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
    onToggleExpand(vendor.id);
  }, [vendor.id, onToggleExpand]);

  // Handle selection toggle
  const handleToggleSelect = useCallback(() => {
    onToggleSelect(vendor.id);
  }, [vendor.id, onToggleSelect]);

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
      <VendorCardCollapsed
        vendor={vendor}
        isExpanded={isExpanded}
        isSelected={isSelected}
        paymentSummary={paymentSummaryDisplay}
        onToggleExpand={handleToggleExpand}
        onToggleSelect={handleToggleSelect}
        onDelete={onDelete ? () => onDelete(vendor.id) : undefined}
      />

      {/* Expanded view - animated in/out */}
      <FormProvider {...formMethods}>
        <VendorCardExpanded
          isExpanded={isExpanded}
          saveStatus={saveStatus}
        >
          {(activeTab) => <TabContent tab={activeTab} vendor={vendor} weddingId={weddingId} />}
        </VendorCardExpanded>
      </FormProvider>
    </div>
  );
}

/**
 * Convert Vendor entity to form data format
 */
function vendorToFormData(vendor: VendorDisplay): VendorFormData {
  return {
    // Basic Info
    vendor_type: vendor.vendor_type,
    company_name: vendor.company_name,
    contact_name: vendor.contact_name,
    contact_email: vendor.contact_email || '',
    contact_phone: vendor.contact_phone || '',
    address: vendor.address || '',
    website: vendor.website || '',
    notes: vendor.notes || '',
    status: vendor.status,
    // Contract Details
    contract_signed: vendor.contract_signed,
    contract_date: vendor.contract_date || '',
    contract_expiry_date: vendor.contract_expiry_date || '',
    contract_value: vendor.contract_value?.toString() || '',
    cancellation_policy: vendor.cancellation_policy || '',
    cancellation_fee_percentage: vendor.cancellation_fee_percentage?.toString() || '',
    insurance_required: vendor.insurance_required,
    insurance_verified: vendor.insurance_verified,
    insurance_expiry_date: vendor.insurance_expiry_date || '',
    // Banking Information (read-only in UI, but included for form completeness)
    bank_name: vendor.bank_name || '',
    account_name: vendor.account_name || '',
    account_number: vendor.account_number || '',
    branch_code: vendor.branch_code || '',
    swift_code: vendor.swift_code || '',
  };
}

/**
 * Convert form data to vendor update request format
 * Only includes editable fields (Overview and Contract tabs)
 */
function formDataToVendorUpdate(data: VendorFormData): Partial<VendorSchemaType> {
  return {
    // Overview Tab fields
    vendor_type: data.vendor_type as VendorSchemaType['vendor_type'],
    company_name: data.company_name,
    contact_name: data.contact_name,
    contact_email: data.contact_email || null,
    contact_phone: data.contact_phone || null,
    address: data.address || null,
    website: data.website || null,
    notes: data.notes || null,
    status: data.status,
    // Contract Tab fields
    contract_signed: data.contract_signed,
    contract_date: data.contract_date || null,
    contract_expiry_date: data.contract_expiry_date || null,
    contract_value: data.contract_value ? parseFloat(data.contract_value) : null,
    cancellation_policy: data.cancellation_policy || null,
    cancellation_fee_percentage: data.cancellation_fee_percentage
      ? parseFloat(data.cancellation_fee_percentage)
      : null,
    insurance_required: data.insurance_required,
    insurance_verified: data.insurance_verified,
    insurance_expiry_date: data.insurance_expiry_date || null,
    // Note: Banking fields are NOT included - they are read-only
  };
}
