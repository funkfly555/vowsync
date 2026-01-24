/**
 * RecordPaymentModal - Modal for recording payments against invoices
 * @feature 028-vendor-card-expandable
 * @task Payments & Invoices Redesign
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreatePaymentFromInvoice } from '@/hooks/useVendorPaymentMutations';
import { VendorInvoice, PAYMENT_METHOD_OPTIONS } from '@/types/vendor';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';

interface InvoiceWithBalance extends VendorInvoice {
  balance: number;
  totalPaid: number;
}

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  weddingId: string;
  invoices: InvoiceWithBalance[];
  preselectedInvoice?: VendorInvoice | null;
}

// Form validation schema
const recordPaymentSchema = z.object({
  invoice_id: z.string().min(1, 'Please select an invoice'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;

export function RecordPaymentModal({
  open,
  onOpenChange,
  vendorId,
  weddingId: _weddingId,
  invoices,
  preselectedInvoice,
}: RecordPaymentModalProps) {
  const { mutate: createPaymentFromInvoice, isPending } = useCreatePaymentFromInvoice();
  const [selectedInvoiceBalance, setSelectedInvoiceBalance] = useState<number>(0);
  const [showOverpayWarning, setShowOverpayWarning] = useState(false);

  const form = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      invoice_id: '',
      amount: 0,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: '',
      reference: '',
      notes: '',
    },
  });

  const watchAmount = form.watch('amount');
  const watchInvoiceId = form.watch('invoice_id');

  // Update balance when invoice selection changes
  useEffect(() => {
    if (watchInvoiceId) {
      const invoice = invoices.find((inv) => inv.id === watchInvoiceId);
      if (invoice) {
        setSelectedInvoiceBalance(invoice.balance);
      }
    } else {
      setSelectedInvoiceBalance(0);
    }
  }, [watchInvoiceId, invoices]);

  // Check for overpayment
  useEffect(() => {
    const amount = Number(watchAmount) || 0;
    setShowOverpayWarning(amount > selectedInvoiceBalance && selectedInvoiceBalance > 0);
  }, [watchAmount, selectedInvoiceBalance]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const initialInvoiceId = preselectedInvoice?.id || '';
      const initialBalance = preselectedInvoice
        ? invoices.find((inv) => inv.id === preselectedInvoice.id)?.balance || 0
        : 0;

      form.reset({
        invoice_id: initialInvoiceId,
        amount: initialBalance,
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: '',
        reference: '',
        notes: '',
      });
      setSelectedInvoiceBalance(initialBalance);
      setShowOverpayWarning(false);
    }
  }, [open, preselectedInvoice, invoices]);

  // Handle invoice selection change
  const handleInvoiceChange = (invoiceId: string) => {
    form.setValue('invoice_id', invoiceId);
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      form.setValue('amount', invoice.balance);
      setSelectedInvoiceBalance(invoice.balance);
    }
  };

  const onSubmit = (data: RecordPaymentFormData) => {
    const selectedInvoice = invoices.find((inv) => inv.id === data.invoice_id);
    if (!selectedInvoice) return;

    createPaymentFromInvoice(
      {
        vendorId,
        invoice: selectedInvoice,
        data: {
          milestone_name: `Payment for ${selectedInvoice.invoice_number}`,
          due_date: data.payment_date,
          amount: data.amount,
          notes: data.notes,
        },
        markAsPaid: true,
        paidDate: data.payment_date,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  const hasInvoices = invoices.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment against an outstanding invoice.
          </DialogDescription>
        </DialogHeader>

        {!hasInvoices ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No outstanding invoices to pay. Create an invoice first.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="invoice_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply to Invoice *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleInvoiceChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an invoice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            <span className="font-mono">{invoice.invoice_number}</span>
                            <span className="text-gray-500 ml-2">
                              — {formatCurrency(invoice.balance)} outstanding
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-8"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    {selectedInvoiceBalance > 0 && (
                      <p className="text-sm text-gray-500">
                        Outstanding balance: {formatCurrency(selectedInvoiceBalance)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showOverpayWarning && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment amount exceeds the outstanding balance of{' '}
                    {formatCurrency(selectedInvoiceBalance)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_METHOD_OPTIONS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PAY-001, TRX-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || showOverpayWarning}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
