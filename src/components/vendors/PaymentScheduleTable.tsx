/**
 * PaymentScheduleTable Component
 * @feature 009-vendor-payments-invoices
 * T017: Display payment schedule table with status badges
 * T016/T017: Added Invoice column to show linked invoice reference
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
import { PaymentScheduleStatusBadge } from './PaymentStatusBadge';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import { canMarkAsPaid, canEditPayment } from '@/lib/vendorPaymentStatus';
import type { PaymentWithInvoice } from '@/types/vendor';
import { format } from 'date-fns';
import { Pencil, Trash2, CheckCircle, FileText } from 'lucide-react';

interface PaymentScheduleTableProps {
  payments: PaymentWithInvoice[];
  onMarkAsPaid?: (payment: PaymentWithInvoice) => void;
  onEdit?: (payment: PaymentWithInvoice) => void;
  onDelete?: (payment: PaymentWithInvoice) => void;
  isLoading?: boolean;
}

/**
 * Table component for displaying vendor payment schedules
 * Shows description, due date, amount, and status with action buttons
 */
export function PaymentScheduleTable({
  payments,
  onMarkAsPaid,
  onEdit,
  onDelete,
  isLoading,
}: PaymentScheduleTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading payments...</div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <CheckCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No payments scheduled</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add payment milestones to track deposits and installments.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Description</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">
                {payment.milestone_name}
                {payment.percentage && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({payment.percentage}%)
                  </span>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(payment.due_date), 'dd MMM yyyy')}
                {payment.paid_date && (
                  <div className="text-xs text-muted-foreground">
                    Paid: {format(new Date(payment.paid_date), 'dd MMM yyyy')}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>
                {payment.linkedInvoice ? (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Invoice #{payment.linkedInvoice.invoice_number}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <PaymentScheduleStatusBadge payment={payment} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {canMarkAsPaid(payment) && onMarkAsPaid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsPaid(payment)}
                      className="h-8 px-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50"
                      aria-label={`Mark payment ${payment.milestone_name} as paid`}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(payment)}
                      className="h-8 px-2 text-sm"
                      aria-label={canEditPayment(payment) ? `Edit payment ${payment.milestone_name}` : `View payment ${payment.milestone_name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(payment)}
                      className="h-8 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Delete payment ${payment.milestone_name}`}
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

export default PaymentScheduleTable;
