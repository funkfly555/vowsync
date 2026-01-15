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
import { Pencil, Trash2, FileText, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InvoiceTableProps {
  invoices: VendorInvoice[];
  onEdit?: (invoice: VendorInvoice) => void;
  onDelete?: (invoice: VendorInvoice) => void;
  isLoading?: boolean;
}

/**
 * Table component for displaying vendor invoices
 * Shows invoice number, dates, amounts (with VAT), and status
 */
export function InvoiceTable({
  invoices,
  onEdit,
  onDelete,
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={() => onEdit(invoice)}
                        disabled={!canEditInvoice(invoice)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {canEditInvoice(invoice) ? 'Edit' : 'View'}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(invoice)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default InvoiceTable;
