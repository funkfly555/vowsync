/**
 * DeletePaymentDialog Component
 * @feature 009-vendor-payments-invoices
 * T030: Confirmation dialog for deleting payment milestones
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
import { useDeletePayment } from '@/hooks/useVendorPaymentMutations';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import type { VendorPaymentSchedule } from '@/types/vendor';
import { format } from 'date-fns';

interface DeletePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
  payment: VendorPaymentSchedule | null;
}

export function DeletePaymentDialog({
  open,
  onClose,
  onSuccess,
  vendorId,
  payment,
}: DeletePaymentDialogProps) {
  const deletePayment = useDeletePayment();

  const handleDelete = async () => {
    if (!payment) return;

    try {
      await deletePayment.mutateAsync({
        paymentId: payment.id,
        vendorId,
      });
      onSuccess();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  if (!payment) return null;

  const isPaid = payment.status === 'paid' || payment.paid_date;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Payment Milestone
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete this payment milestone? This action cannot be undone.
              </p>

              {/* Payment Summary */}
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Milestone:</span>
                  <span className="font-medium text-foreground">{payment.milestone_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(payment.due_date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-blue-600'}`}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              {isPaid && (
                <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-800">
                    <strong>Warning:</strong> This payment has already been marked as paid.
                    Deleting it will remove the payment record from your tracking history.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePayment.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePayment.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deletePayment.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeletePaymentDialog;
