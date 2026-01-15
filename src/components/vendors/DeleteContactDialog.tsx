/**
 * DeleteContactDialog Component
 * @feature 009-vendor-payments-invoices
 * T044: Confirmation dialog for deleting vendor contacts
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
import { useDeleteContact } from '@/hooks/useVendorContactMutations';
import type { VendorContact } from '@/types/vendor';

interface DeleteContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
  contact: VendorContact | null;
}

export function DeleteContactDialog({
  open,
  onClose,
  onSuccess,
  vendorId,
  contact,
}: DeleteContactDialogProps) {
  const deleteContact = useDeleteContact();

  const handleDelete = async () => {
    if (!contact) return;

    try {
      await deleteContact.mutateAsync({
        contactId: contact.id,
        vendorId,
      });
      onSuccess();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  if (!contact) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Contact
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete this contact? This action cannot be undone.
              </p>

              {/* Contact Summary */}
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{contact.contact_name}</span>
                </div>
                {contact.contact_role && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium text-foreground">{contact.contact_role}</span>
                  </div>
                )}
                {contact.contact_email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{contact.contact_email}</span>
                  </div>
                )}
                {contact.contact_phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground">{contact.contact_phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary:</span>
                  <span className={`font-medium ${contact.is_primary ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {contact.is_primary ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Onsite:</span>
                  <span className={`font-medium ${contact.is_onsite_contact ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {contact.is_onsite_contact ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {contact.is_primary && (
                <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-800">
                    <strong>Warning:</strong> This is the primary contact for this vendor.
                    After deletion, you may want to designate another contact as primary.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteContact.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteContact.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteContact.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Contact
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteContactDialog;
