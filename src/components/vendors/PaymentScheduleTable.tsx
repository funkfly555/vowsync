/**
 * PaymentScheduleTable Component
 * @feature 009-vendor-payments-invoices
 * T017: Display payment schedule table with status badges
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
import type { VendorPaymentSchedule } from '@/types/vendor';
import { format } from 'date-fns';
import { Pencil, Trash2, CheckCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PaymentScheduleTableProps {
  payments: VendorPaymentSchedule[];
  onMarkAsPaid?: (payment: VendorPaymentSchedule) => void;
  onEdit?: (payment: VendorPaymentSchedule) => void;
  onDelete?: (payment: VendorPaymentSchedule) => void;
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
                <PaymentScheduleStatusBadge payment={payment} />
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
                    {canMarkAsPaid(payment) && onMarkAsPaid && (
                      <DropdownMenuItem onClick={() => onMarkAsPaid(payment)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={() => onEdit(payment)}
                        disabled={!canEditPayment(payment)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {canEditPayment(payment) ? 'Edit' : 'View'}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(payment)}
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

export default PaymentScheduleTable;
