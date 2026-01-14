/**
 * VendorModal Component
 * @feature 008-vendor-management
 * @task T024, T025, T027
 *
 * 3-tab modal for creating and editing vendors
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { VendorDisplay, VendorFormData, DEFAULT_VENDOR_FORM } from '@/types/vendor';
import { vendorFormSchema, vendorSchema } from '@/schemas/vendor';
import { useVendorMutations } from '@/hooks/useVendorMutations';
import { VendorBasicInfoTab } from './VendorBasicInfoTab';
import { VendorContractTab } from './VendorContractTab';
import { VendorBankingTab } from './VendorBankingTab';

interface VendorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendor: VendorDisplay | null;
  weddingId: string;
}

/**
 * Transform VendorDisplay to form data for editing
 */
function vendorToFormData(vendor: VendorDisplay): VendorFormData {
  return {
    vendor_type: vendor.vendor_type,
    company_name: vendor.company_name,
    contact_name: vendor.contact_name,
    contact_email: vendor.contact_email || '',
    contact_phone: vendor.contact_phone || '',
    address: vendor.address || '',
    website: vendor.website || '',
    notes: vendor.notes || '',
    status: vendor.status,
    contract_signed: vendor.contract_signed,
    contract_date: vendor.contract_date || '',
    contract_expiry_date: vendor.contract_expiry_date || '',
    contract_value: vendor.contract_value?.toString() || '',
    cancellation_policy: vendor.cancellation_policy || '',
    cancellation_fee_percentage: vendor.cancellation_fee_percentage?.toString() || '',
    insurance_required: vendor.insurance_required,
    insurance_verified: vendor.insurance_verified,
    insurance_expiry_date: vendor.insurance_expiry_date || '',
    bank_name: vendor.bank_name || '',
    account_name: vendor.account_name || '',
    account_number: vendor.account_number || '',
    branch_code: vendor.branch_code || '',
    swift_code: vendor.swift_code || '',
  };
}

export function VendorModal({ open, onClose, onSuccess, vendor, weddingId }: VendorModalProps) {
  const isEditMode = !!vendor;
  const { createVendor, updateVendor } = useVendorMutations({ weddingId });

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: DEFAULT_VENDOR_FORM,
  });

  // Reset form when modal opens/closes or vendor changes
  useEffect(() => {
    if (open) {
      if (vendor) {
        form.reset(vendorToFormData(vendor));
      } else {
        form.reset(DEFAULT_VENDOR_FORM);
      }
    }
  }, [open, vendor, form]);

  const handleSubmit = async (data: VendorFormData) => {
    // Transform form data to database format using vendorSchema
    const schemaData = vendorSchema.parse(data);

    if (isEditMode && vendor) {
      await updateVendor.mutateAsync({ vendorId: vendor.id, data: schemaData });
    } else {
      await createVendor.mutateAsync(schemaData);
    }
    onSuccess();
  };

  const isSubmitting = createVendor.isPending || updateVendor.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Vendor' : 'Add Vendor'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contract">Contract Details</TabsTrigger>
                <TabsTrigger value="banking">Banking</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <VendorBasicInfoTab form={form} />
              </TabsContent>

              <TabsContent value="contract" className="mt-6">
                <VendorContractTab form={form} />
              </TabsContent>

              <TabsContent value="banking" className="mt-6">
                <VendorBankingTab form={form} />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
