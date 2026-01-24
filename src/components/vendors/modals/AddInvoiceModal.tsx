/**
 * AddInvoiceModal - Modal for creating new invoices
 * @feature 028-vendor-card-expandable
 * @task Payments & Invoices Redesign
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateInvoice } from '@/hooks/useVendorInvoiceMutations';
import { useVendorInvoices } from '@/hooks/useVendorInvoices';
import { calculateVAT, calculateTotal, formatCurrency } from '@/lib/vendorInvoiceStatus';

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  weddingId: string;
}

// Form validation schema
const addInvoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.invoice_date && data.due_date) {
      return new Date(data.due_date) >= new Date(data.invoice_date);
    }
    return true;
  },
  {
    message: 'Due date must be on or after invoice date',
    path: ['due_date'],
  }
);

type AddInvoiceFormData = z.infer<typeof addInvoiceSchema>;

export function AddInvoiceModal({
  open,
  onOpenChange,
  vendorId,
  weddingId: _weddingId,
}: AddInvoiceModalProps) {
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { invoices } = useVendorInvoices(vendorId);

  const [calculatedVat, setCalculatedVat] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Generate next invoice number suggestion
  const generateNextInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const prefix = 'INV';

    if (!invoices || invoices.length === 0) {
      return `${prefix}-${year}-001`;
    }

    // Find the highest invoice number for this year
    const yearInvoices = invoices.filter((inv) =>
      inv.invoice_number.includes(`${year}`)
    );

    if (yearInvoices.length === 0) {
      return `${prefix}-${year}-001`;
    }

    // Extract numbers and find max
    const numbers = yearInvoices
      .map((inv) => {
        const match = inv.invoice_number.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const maxNumber = Math.max(...numbers, 0);
    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
    return `${prefix}-${year}-${nextNumber}`;
  };

  const form = useForm<AddInvoiceFormData>({
    resolver: zodResolver(addInvoiceSchema),
    defaultValues: {
      invoice_number: '',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
      amount: 0,
      notes: '',
    },
  });

  // Watch amount to calculate VAT and total
  const watchAmount = form.watch('amount');

  useEffect(() => {
    const amount = Number(watchAmount) || 0;
    const vat = calculateVAT(amount);
    const total = calculateTotal(amount, vat);
    setCalculatedVat(vat);
    setCalculatedTotal(total);
  }, [watchAmount]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        invoice_number: generateNextInvoiceNumber(),
        invoice_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        amount: 0,
        notes: '',
      });
      setCalculatedVat(0);
      setCalculatedTotal(0);
    }
  }, [open, invoices]);

  const onSubmit = (data: AddInvoiceFormData) => {
    createInvoice(
      {
        vendorId,
        data: {
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          due_date: data.due_date,
          amount: data.amount,
          vat_amount: calculatedVat,
          notes: data.notes,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for this vendor. VAT is calculated at 15%.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-2026-001" {...field} />
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
                    <FormLabel>Invoice Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Due Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                  <FormLabel>Amount (excl. VAT) *</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calculated fields */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (15%)</span>
                <span className="font-mono">{formatCurrency(calculatedVat)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                <span>Total Amount</span>
                <span className="font-mono text-[#D4A5A5]">{formatCurrency(calculatedTotal)}</span>
              </div>
            </div>

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
                disabled={isPending}
                className="bg-[#D4A5A5] hover:bg-[#C99595] text-white"
              >
                {isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
