/**
 * InvoicesTab Component
 * @feature 009-vendor-payments-invoices
 * T034: Container component for invoice tracking tab
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceTable } from './InvoiceTable';
import { InvoiceModal } from './InvoiceModal';
import { DeleteInvoiceDialog } from './DeleteInvoiceDialog';
import { useVendorInvoices, calculateInvoiceSummary } from '@/hooks/useVendorInvoices';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import type { VendorInvoice } from '@/types/vendor';
import { Plus, FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface InvoicesTabProps {
  vendorId: string;
}

/**
 * Container component for the vendor invoices tab
 * Shows invoice summary cards and invoice table
 */
export function InvoicesTab({ vendorId }: InvoicesTabProps) {
  const { invoices, isLoading, isError, error } = useVendorInvoices(vendorId);
  const summary = calculateInvoiceSummary(invoices);

  // State for modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<VendorInvoice | null>(null);

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleEdit = (invoice: VendorInvoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDelete = (invoice: VendorInvoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleInvoiceModalClose = () => {
    setIsInvoiceModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleInvoiceSuccess = () => {
    setIsInvoiceModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedInvoice(null);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Error loading invoices</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.amountPaid + summary.amountUnpaid + summary.amountOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalInvoices} invoice(s)
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
              {summary.totalPaid} invoice(s) paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.amountUnpaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalUnpaid} invoice(s) unpaid
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
              {summary.totalOverdue} invoice(s) overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Track invoices and billing for this vendor
            </CardDescription>
          </div>
          <Button onClick={handleAddInvoice}>
            <Plus className="mr-2 h-4 w-4" />
            Add Invoice
          </Button>
        </CardHeader>
        <CardContent>
          <InvoiceTable
            invoices={invoices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Invoice Modal for Add/Edit */}
      <InvoiceModal
        open={isInvoiceModalOpen}
        onClose={handleInvoiceModalClose}
        onSuccess={handleInvoiceSuccess}
        vendorId={vendorId}
        invoice={selectedInvoice}
      />

      {/* Delete Invoice Dialog */}
      <DeleteInvoiceDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
        vendorId={vendorId}
        invoice={selectedInvoice}
      />
    </div>
  );
}

export default InvoicesTab;
