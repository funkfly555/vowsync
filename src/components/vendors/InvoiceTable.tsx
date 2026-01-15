/**
 * InvoiceTable Component
 * @feature 009-vendor-payments-invoices
 * T033: Display invoices table with status badges and amounts
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { formatCurrency, canEditInvoice } from '@/lib/vendorInvoiceStatus';
import type { VendorInvoice } from '@/types/vendor';
import { format } from 'date-fns';
import { Pencil, Trash2, FileText, CreditCard } from 'lucide-react';

interface InvoiceTableProps {
  invoices: VendorInvoice[];
  onEdit?: (invoice: VendorInvoice) => void;
  onDelete?: (invoice: VendorInvoice) => void;
  onPayInvoice?: (invoice: VendorInvoice) => void; // T008: Pay This Invoice callback
  isLoading?: boolean;
}

/**
 * Table component for displaying vendor invoices
 * Shows invoice number, dates, amounts (with VAT), and status
 */
/**
 * Check if an invoice can be paid (not already paid/cancelled and no linked payment)
 */
function canPayInvoice(invoice: VendorInvoice): boolean {
  return (
    invoice.status !== 'paid' &&
    invoice.status !== 'cancelled' &&
    !invoice.payment_schedule_id // No existing linked payment
  );
}

export function InvoiceTable({
  invoices,
  onEdit,
  onDelete,
  onPayInvoice,
  isLoading,
}: InvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading invoices...</div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No invoices</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add invoices to track billing and payments.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Invoice #</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">VAT</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoice_number}
              </TableCell>
              <TableCell>
                {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                {format(new Date(invoice.due_date), 'dd MMM yyyy')}
                {invoice.paid_date && (
                  <div className="text-xs text-muted-foreground">
                    Paid: {format(new Date(invoice.paid_date), 'dd MMM yyyy')}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(invoice.amount)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(invoice.vat_amount)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(invoice.total_amount)}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge invoice={invoice} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {/* T008: Pay This Invoice button */}
                  {onPayInvoice && canPayInvoice(invoice) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPayInvoice(invoice)}
                      className="h-8 px-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50"
                      aria-label={`Pay invoice ${invoice.invoice_number}`}
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(invoice)}
                      className="h-8 px-2 text-sm"
                      aria-label={canEditInvoice(invoice) ? `Edit invoice ${invoice.invoice_number}` : `View invoice ${invoice.invoice_number}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(invoice)}
                      className="h-8 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Delete invoice ${invoice.invoice_number}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default InvoiceTable;
