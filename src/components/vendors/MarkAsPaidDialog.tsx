/**
 * MarkAsPaidDialog Component
 * @feature 009-vendor-payments-invoices
 * T024: Dialog to mark pending payments as paid
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useMarkPaymentAsPaid } from '@/hooks/useVendorPaymentMutations';
import {
  markAsPaidSchema,
  MarkAsPaidFormValues,
  defaultMarkAsPaidValues,
} from '@/schemas/paymentSchedule';
import { formatCurrency } from '@/lib/vendorInvoiceStatus';
import type { VendorPaymentSchedule } from '@/types/vendor';
import { format } from 'date-fns';

interface MarkAsPaidDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
  payment: VendorPaymentSchedule | null;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer (EFT)' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

export function MarkAsPaidDialog({
  open,
  onClose,
  onSuccess,
  vendorId,
  payment,
}: MarkAsPaidDialogProps) {
  const markAsPaid = useMarkPaymentAsPaid();

  const form = useForm<MarkAsPaidFormValues>({
    resolver: zodResolver(markAsPaidSchema),
    defaultValues: defaultMarkAsPaidValues,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        ...defaultMarkAsPaidValues,
        paid_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, form]);

  const onSubmit = async (data: MarkAsPaidFormValues) => {
    if (!payment) return;

    try {
      await markAsPaid.mutateAsync({
        paymentId: payment.id,
        vendorId,
        data,
      });
      onSuccess();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Mark as Paid
          </DialogTitle>
          <DialogDescription>
            Record payment details for this milestone.
          </DialogDescription>
        </DialogHeader>

        {/* Payment Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Milestone:</span>
            <span className="font-medium">{payment.milestone_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-medium">
              {format(new Date(payment.due_date), 'dd MMM yyyy')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(payment.amount)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paid_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
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
                  <FormLabel>Payment Method (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
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
              name="payment_reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Transaction ID, Cheque number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={markAsPaid.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={markAsPaid.isPending}>
                {markAsPaid.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default MarkAsPaidDialog;
