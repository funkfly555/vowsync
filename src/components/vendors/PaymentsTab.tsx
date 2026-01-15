/**
 * PaymentsTab Component
 * @feature 009-vendor-payments-invoices
 * T018: Container component for payment schedule tab
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentScheduleTable } from './PaymentScheduleTable';
import { PaymentModal } from './PaymentModal';
import { MarkAsPaidDialog } from './MarkAsPaidDialog';
import { DeletePaymentDialog } from './DeletePaymentDialog';
import { VendorTotalsSummary } from './VendorTotalsSummary';
import { useVendorPaymentsWithInvoices, calculatePaymentSummary } from '@/hooks/useVendorPayments';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import type { PaymentWithInvoice } from '@/types/vendor';
import { Plus, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentsTabProps {
  vendorId: string;
}

/**
 * Container component for the vendor payments tab
 * Shows payment summary cards and payment schedule table
 */
export function PaymentsTab({ vendorId }: PaymentsTabProps) {
  const { payments, isLoading, isError, error } = useVendorPaymentsWithInvoices(vendorId);
  const summary = calculatePaymentSummary(payments);

  // State for modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithInvoice | null>(null);

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleMarkAsPaid = (payment: PaymentWithInvoice) => {
    setSelectedPayment(payment);
    setIsMarkPaidDialogOpen(true);
  };

  const handleEdit = (payment: PaymentWithInvoice) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  const handleMarkPaidClose = () => {
    setIsMarkPaidDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleMarkPaidSuccess = () => {
    setIsMarkPaidDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleDelete = (payment: PaymentWithInvoice) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedPayment(null);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Error loading payments</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* T012: Financial Totals Summary */}
      <VendorTotalsSummary vendorId={vendorId} />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.amountPending + summary.amountOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalPending + summary.totalOverdue} payment(s) pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.amountPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalPaid} payment(s) completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.amountPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalPending} payment(s) scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.amountOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalOverdue} payment(s) overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Schedule</CardTitle>
            <CardDescription>
              Track payment milestones for this vendor
            </CardDescription>
          </div>
          <Button onClick={handleAddPayment}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </CardHeader>
        <CardContent>
          <PaymentScheduleTable
            payments={payments}
            onMarkAsPaid={handleMarkAsPaid}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Payment Modal for Add/Edit */}
      <PaymentModal
        open={isPaymentModalOpen}
        onClose={handlePaymentModalClose}
        onSuccess={handlePaymentSuccess}
        vendorId={vendorId}
        payment={selectedPayment}
      />

      {/* Mark as Paid Dialog */}
      <MarkAsPaidDialog
        open={isMarkPaidDialogOpen}
        onClose={handleMarkPaidClose}
        onSuccess={handleMarkPaidSuccess}
        vendorId={vendorId}
        payment={selectedPayment}
      />

      {/* Delete Payment Dialog */}
      <DeletePaymentDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
        vendorId={vendorId}
        payment={selectedPayment}
      />
    </div>
  );
}

export default PaymentsTab;
