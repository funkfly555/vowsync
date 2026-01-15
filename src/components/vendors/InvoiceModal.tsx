/**
 * InvoiceModal Component
 * @feature 009-vendor-payments-invoices
 * T037: Modal form to add/edit invoices with auto-calculated VAT
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calculator } from 'lucide-react';
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useVendorInvoiceMutations';
import { calculateVAT, calculateTotal, formatCurrency, canEditInvoice, VAT_RATE } from '@/lib/vendorInvoiceStatus';
import type { VendorInvoice } from '@/types/vendor';

// Form schema without vat_amount since it's auto-calculated
const invoiceFormSchema = z.object({
  invoice_number: z
    .string()
    .min(1, 'Invoice number is required')
    .max(50, 'Invoice number must be less than 50 characters'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  amount: z
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
  invoice?: VendorInvoice | null;
}

const defaultValues: InvoiceFormValues = {
  invoice_number: '',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  amount: 0,
  notes: '',
};

/**
 * Transform invoice to form data for editing
 */
function invoiceToFormData(invoice: VendorInvoice): InvoiceFormValues {
  return {
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    amount: invoice.amount,
    notes: invoice.notes || '',
  };
}

export function InvoiceModal({
  open,
  onClose,
  onSuccess,
  vendorId,
  invoice,
}: InvoiceModalProps) {
  const isEditMode = !!invoice;
  const isReadOnly = isEditMode && invoice && !canEditInvoice(invoice);

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  // Watch amount for VAT calculation
  const watchAmount = form.watch('amount');
  const [calculatedVAT, setCalculatedVAT] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Update VAT calculation when amount changes
  useEffect(() => {
    const amount = watchAmount || 0;
    const vat = calculateVAT(amount);
    const total = calculateTotal(amount, vat);
    setCalculatedVAT(vat);
    setCalculatedTotal(total);
  }, [watchAmount]);

  // Reset form when modal opens/closes or invoice changes
  useEffect(() => {
    if (open) {
      if (invoice) {
        form.reset(invoiceToFormData(invoice));
      } else {
        form.reset(defaultValues);
      }
    }
  }, [open, invoice, form]);

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const formData = {
        ...data,
        vat_amount: calculateVAT(data.amount),
      };

      if (isEditMode && invoice) {
        // Only allow editing notes for paid invoices
        const updateData = isReadOnly
          ? { notes: data.notes }
          : formData;

        await updateInvoice.mutateAsync({
          invoiceId: invoice.id,
          vendorId,
          data: updateData,
        });
      } else {
        await createInvoice.mutateAsync({
          vendorId,
          data: formData,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const isSubmitting = createInvoice.isPending || updateInvoice.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? isReadOnly
                ? 'View Invoice'
                : 'Edit Invoice'
              : 'Add Invoice'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? isReadOnly
                ? 'This invoice has been paid or cancelled. Only notes can be modified.'
                : 'Update invoice details.'
              : 'Add a new invoice for tracking. VAT (15%) will be calculated automatically.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., INV-001"
                      disabled={isReadOnly}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isReadOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isReadOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (excl. VAT)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      disabled={isReadOnly}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount before VAT. VAT will be calculated automatically.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VAT Calculation Display */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calculator className="h-4 w-4" />
                VAT Calculation ({(VAT_RATE * 100).toFixed(0)}%)
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount (excl. VAT):</span>
                <span className="font-medium">{formatCurrency(watchAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT ({(VAT_RATE * 100).toFixed(0)}%):</span>
                <span className="font-medium">{formatCurrency(calculatedVAT)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="font-medium">Total (incl. VAT):</span>
                <span className="font-bold text-green-600">{formatCurrency(calculatedTotal)}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
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

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Save Changes' : 'Add Invoice'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default InvoiceModal;
