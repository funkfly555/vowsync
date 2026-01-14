/**
 * DeleteVendorDialog Component
 * @feature 008-vendor-management
 * @task T031
 *
 * Confirmation dialog for vendor deletion (FR-010, FR-011)
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { VendorDisplay } from '@/types/vendor';
import { useVendorMutations } from '@/hooks/useVendorMutations';

interface DeleteVendorDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendor: VendorDisplay | null;
}

export function DeleteVendorDialog({ open, onClose, onSuccess, vendor }: DeleteVendorDialogProps) {
  const { deleteVendor } = useVendorMutations({ weddingId: vendor?.wedding_id || '' });

  const handleDelete = async () => {
    if (!vendor) return;

    await deleteVendor.mutateAsync(vendor.id);
    onSuccess();
  };

  if (!vendor) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            Are you sure you want to delete <strong>{vendor.company_name}</strong>?
          </AlertDialogDescription>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action cannot be undone. Deleting this vendor will also permanently remove:
            </p>
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>All additional contacts for this vendor</li>
              <li>All payment schedules and records</li>
              <li>All invoices associated with this vendor</li>
            </ul>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteVendor.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteVendor.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteVendor.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete Vendor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
