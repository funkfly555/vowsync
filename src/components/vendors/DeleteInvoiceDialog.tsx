/**
 * DeleteInvoiceDialog Component
 * @feature 009-vendor-payments-invoices
 * @feature 029-budget-vendor-integration
 * T038: Confirmation dialog for deleting invoices
 * T050: Mention budget impact when deleting invoice linked to budget
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
import { Loader2, AlertTriangle, Tag } from 'lucide-react';
import { useDeleteInvoice } from '@/hooks/useVendorInvoiceMutations';
import { useBudgetLineItemByInvoice } from '@/hooks/useBudgetLineItems';
import { useBudgetCategory } from '@/hooks/useBudgetCategories';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import type { VendorInvoice } from '@/types/vendor';
import { format } from 'date-fns';

interface DeleteInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
  invoice: VendorInvoice | null;
}

export function DeleteInvoiceDialog({
  open,
  onClose,
  onSuccess,
  vendorId,
  invoice,
}: DeleteInvoiceDialogProps) {
  const deleteInvoice = useDeleteInvoice();

  // T050: Check if this invoice has a linked budget line item
  const { lineItem: budgetLineItem } = useBudgetLineItemByInvoice(invoice?.id);
  const { category: budgetCategory } = useBudgetCategory(budgetLineItem?.budget_category_id);

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      await deleteInvoice.mutateAsync({
        invoiceId: invoice.id,
        vendorId,
      });
      onSuccess();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  if (!invoice) return null;

  const isPaid = invoice.status === 'paid' || invoice.paid_date;
  const hasBudgetLink = !!budgetLineItem;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Invoice
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>

              {/* Invoice Summary */}
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice #:</span>
                  <span className="font-medium text-foreground">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total (incl. VAT):</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-blue-600'}`}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>

              {isPaid && (
                <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-800">
                    <strong>Warning:</strong> This invoice has been marked as paid.
                    Deleting it will remove the payment record from your tracking history.
                  </p>
                </div>
              )}

              {/* T050: Budget impact warning */}
              {hasBudgetLink && (
                <div className="flex items-start gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
                  <Tag className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-purple-800">
                    <strong>Budget Impact:</strong> This invoice is linked to the{' '}
                    <span className="font-medium">{budgetCategory?.category_name || 'budget'}</span>{' '}
                    category. Deleting it will automatically update the budget totals.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteInvoice.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteInvoice.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteInvoice.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Invoice
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteInvoiceDialog;
