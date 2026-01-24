/**
 * PaymentsInvoicesTab - Unified financial management view
 * Combines invoices and payments into a single comprehensive tab
 * @feature 028-vendor-card-expandable
 * @task Payments & Invoices Redesign
 */

import { useState, useMemo } from 'react';
import { format, isAfter, parseISO } from 'date-fns';
import {
  Check,
  Clock,
  AlertCircle,
  Ban,
  Receipt,
  Plus,
  CreditCard,
  Eye,
  Download,
  Mail,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useVendorInvoices } from '@/hooks/useVendorInvoices';
import { useVendorPayments } from '@/hooks/useVendorPayments';
import { VendorInvoice, VendorPaymentSchedule, InvoiceStatus } from '@/types/vendor';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import { cn } from '@/lib/utils';
import { AddInvoiceModal } from '../modals/AddInvoiceModal';
import { RecordPaymentModal } from '../modals/RecordPaymentModal';

interface PaymentsInvoicesTabProps {
  vendorId: string;
  weddingId: string;
}

type FilterStatus = 'all' | 'paid' | 'unpaid' | 'partially_paid' | 'overdue';

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bgColor: string; icon: typeof Check }> = {
  unpaid: {
    label: 'Unpaid',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: Check,
  },
  partially_paid: {
    label: 'Partial',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: Ban,
  },
};

interface InvoiceWithPayments extends VendorInvoice {
  totalPaid: number;
  balance: number;
  isOverdue: boolean;
}

export function PaymentsInvoicesTab({ vendorId, weddingId }: PaymentsInvoicesTabProps) {
  const { invoices, isLoading: invoicesLoading, isError: invoicesError } = useVendorInvoices(vendorId);
  const { payments, isLoading: paymentsLoading, isError: paymentsError } = useVendorPayments(vendorId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<VendorInvoice | null>(null);

  // Calculate invoices with payment data
  const invoicesWithPayments = useMemo<InvoiceWithPayments[]>(() => {
    if (!invoices) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return invoices.map((invoice) => {
      // Find the payment linked TO this invoice (invoice has payment_schedule_id pointing to payment)
      const linkedPayment = invoice.payment_schedule_id
        ? payments?.find((p) => p.id === invoice.payment_schedule_id && p.status === 'paid')
        : null;
      const totalPaid = linkedPayment ? linkedPayment.amount : 0;
      const balance = invoice.total_amount - totalPaid;

      // Check if overdue
      const dueDate = parseISO(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const isOverdue = isAfter(today, dueDate) && invoice.status !== 'paid' && invoice.status !== 'cancelled';

      return {
        ...invoice,
        totalPaid,
        balance,
        isOverdue,
      };
    });
  }, [invoices, payments]);

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    return invoicesWithPayments.filter((invoice) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!invoice.invoice_number.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'overdue') {
          return invoice.isOverdue;
        }
        return invoice.status === filterStatus;
      }

      return true;
    });
  }, [invoicesWithPayments, searchQuery, filterStatus]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.totalPaid, 0);
    const totalBalance = totalAmount - totalPaid;
    return { totalAmount, totalPaid, totalBalance };
  }, [filteredInvoices]);

  // Get paid payments for payment history (sorted by date descending)
  const paidPayments = useMemo(() => {
    if (!payments) return [];
    return payments
      .filter((p) => p.status === 'paid' && p.paid_date)
      .sort((a, b) => {
        const dateA = a.paid_date ? new Date(a.paid_date).getTime() : 0;
        const dateB = b.paid_date ? new Date(b.paid_date).getTime() : 0;
        return dateB - dateA;
      });
  }, [payments]);

  // Open record payment modal for a specific invoice
  const handleRecordPaymentForInvoice = (invoice: VendorInvoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsRecordPaymentOpen(true);
  };

  // Open record payment modal without preselected invoice
  const handleRecordPayment = () => {
    setSelectedInvoiceForPayment(null);
    setIsRecordPaymentOpen(true);
  };

  // Get row background color based on status
  const getRowClassName = (invoice: InvoiceWithPayments) => {
    if (invoice.status === 'paid') return 'bg-green-50';
    if (invoice.status === 'partially_paid') return 'bg-yellow-50';
    if (invoice.isOverdue) return 'bg-red-50';
    return '';
  };

  const isLoading = invoicesLoading || paymentsLoading;
  const isError = invoicesError || paymentsError;

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-full" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Failed to load financial data. Please try again.</p>
      </div>
    );
  }

  const hasInvoices = invoicesWithPayments.length > 0;

  return (
    <div className="space-y-0">
      {/* Action Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex gap-3">
          <Button
            onClick={() => setIsAddInvoiceOpen(true)}
            className="bg-[#D4A5A5] hover:bg-[#C99595] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
          <Button
            variant="outline"
            onClick={handleRecordPayment}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoice Table or Empty State */}
      {!hasInvoices ? (
        <div className="p-12 text-center">
          <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-medium text-gray-900 mb-2">No Invoices Yet</h4>
          <p className="text-gray-500 mb-6">
            Create your first invoice to start tracking payments
          </p>
          <Button
            onClick={() => setIsAddInvoiceOpen(true)}
            className="bg-[#D4A5A5] hover:bg-[#C99595] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Invoice #</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="text-right font-semibold">Amount</TableHead>
                <TableHead className="text-right font-semibold">VAT</TableHead>
                <TableHead className="text-right font-semibold">Total</TableHead>
                <TableHead className="text-right font-semibold">Paid</TableHead>
                <TableHead className="text-right font-semibold">Balance</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-center font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={invoice.id} className={getRowClassName(invoice)}>
                    <TableCell className="font-medium font-mono">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(invoice.invoice_date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className={cn(invoice.isOverdue && 'text-red-600 font-medium')}>
                      {format(parseISO(invoice.due_date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(invoice.vat_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(invoice.total_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {formatCurrency(invoice.totalPaid)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono font-semibold',
                        invoice.status === 'partially_paid' && 'text-orange-600',
                        invoice.isOverdue && invoice.status !== 'paid' && 'text-red-600'
                      )}
                    >
                      {formatCurrency(invoice.balance)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          statusConfig.bgColor,
                          statusConfig.color
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => alert(`View invoice ${invoice.invoice_number}`)}
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>

                          {(invoice.status === 'unpaid' ||
                            invoice.status === 'partially_paid' ||
                            invoice.isOverdue) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleRecordPaymentForInvoice(invoice)}
                                >
                                  <CreditCard className="h-4 w-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Record Payment</TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => alert(`Download invoice ${invoice.invoice_number}`)}
                              >
                                <Download className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download PDF</TooltipContent>
                          </Tooltip>

                          {invoice.status === 'unpaid' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => alert(`Send reminder for ${invoice.invoice_number}`)}
                                >
                                  <Mail className="h-4 w-4 text-gray-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Send Reminder</TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Totals Row */}
              <TableRow className="bg-[#F5F5F5] border-t-2 border-[#D4A5A5]">
                <TableCell
                  className="px-6 py-4 text-sm font-bold text-gray-900 uppercase"
                  colSpan={5}
                >
                  TOTAL
                </TableCell>
                <TableCell className="px-6 py-4 text-right font-bold text-gray-900 text-base font-mono">
                  {formatCurrency(totals.totalAmount)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right font-bold text-green-600 text-base font-mono">
                  {formatCurrency(totals.totalPaid)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right font-bold text-orange-600 text-base font-mono">
                  {formatCurrency(totals.totalBalance)}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Payment History Section */}
      <div className="mt-6 mx-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
            <span className="text-sm text-gray-500">
              {paidPayments.length} payment{paidPayments.length !== 1 ? 's' : ''} recorded
            </span>
          </div>

          {paidPayments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <CreditCard className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p>No payments recorded yet. Record a payment to track payment history.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paidPayments.map((payment) => (
                <PaymentHistoryItem
                  key={payment.id}
                  payment={payment}
                  invoices={invoices || []}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddInvoiceModal
        open={isAddInvoiceOpen}
        onOpenChange={setIsAddInvoiceOpen}
        vendorId={vendorId}
        weddingId={weddingId}
      />

      <RecordPaymentModal
        open={isRecordPaymentOpen}
        onOpenChange={setIsRecordPaymentOpen}
        vendorId={vendorId}
        weddingId={weddingId}
        invoices={invoicesWithPayments.filter(
          (inv) => inv.status === 'unpaid' || inv.status === 'partially_paid' || inv.isOverdue
        )}
        preselectedInvoice={selectedInvoiceForPayment}
      />
    </div>
  );
}

interface PaymentHistoryItemProps {
  payment: VendorPaymentSchedule;
  invoices: VendorInvoice[];
}

function PaymentHistoryItem({ payment, invoices }: PaymentHistoryItemProps) {
  // Find invoice linked to this payment (invoice.payment_schedule_id points to payment.id)
  const linkedInvoice = invoices.find((inv) => inv.payment_schedule_id === payment.id);

  // Determine if this was a full or partial payment
  const isFullPayment = linkedInvoice
    ? payment.amount >= linkedInvoice.total_amount
    : true;

  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center',
            isFullPayment ? 'bg-green-100' : 'bg-yellow-100'
          )}
        >
          {isFullPayment ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {formatCurrency(payment.amount)}
            {linkedInvoice && (
              <span className="text-gray-500 font-normal ml-2">
                Applied to invoice {linkedInvoice.invoice_number}
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {payment.milestone_name}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-900">
          {payment.paid_date && format(parseISO(payment.paid_date), 'dd MMM yyyy')}
        </p>
        <p className="text-xs text-gray-500">
          {payment.payment_method && (
            <>
              {payment.payment_method}
              {payment.payment_reference && ` • ${payment.payment_reference}`}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
