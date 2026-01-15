/**
 * PaymentModal Component
 * @feature 009-vendor-payments-invoices
 * T021: Modal form to add new payment milestones
 * T027: Extended for edit mode with pre-populated values
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useCreatePayment, useUpdatePayment } from '@/hooks/useVendorPaymentMutations';
import {
  paymentScheduleSchema,
  PaymentScheduleFormValues,
  defaultPaymentScheduleValues,
} from '@/schemas/paymentSchedule';
import { canEditPayment } from '@/lib/vendorPaymentStatus';
import type { VendorPaymentSchedule } from '@/types/vendor';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
  payment?: VendorPaymentSchedule | null;
  // T009: Optional pre-filled default values for "Pay This Invoice" workflow
  defaultValues?: Partial<PaymentScheduleFormValues>;
  // T010: Optional custom submit handler for invoice-linked payment creation
  onCustomSubmit?: (data: PaymentScheduleFormValues) => Promise<void>;
}

/**
 * Transform payment to form data for editing
 */
function paymentToFormData(payment: VendorPaymentSchedule): PaymentScheduleFormValues {
  return {
    milestone_name: payment.milestone_name,
    due_date: payment.due_date,
    amount: payment.amount,
    percentage: payment.percentage,
    notes: payment.notes || '',
  };
}

export function PaymentModal({
  open,
  onClose,
  onSuccess,
  vendorId,
  payment,
  defaultValues,
  onCustomSubmit,
}: PaymentModalProps) {
  const isEditMode = !!payment;
  const isReadOnly = isEditMode && payment && !canEditPayment(payment);

  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();

  const form = useForm<PaymentScheduleFormValues>({
    resolver: zodResolver(paymentScheduleSchema),
    defaultValues: defaultPaymentScheduleValues,
  });

  // Reset form when modal opens/closes or payment changes
  useEffect(() => {
    if (open) {
      if (payment) {
        form.reset(paymentToFormData(payment));
      } else if (defaultValues) {
        // T009: Use pre-filled values for "Pay This Invoice" workflow
        form.reset({ ...defaultPaymentScheduleValues, ...defaultValues });
      } else {
        form.reset(defaultPaymentScheduleValues);
      }
    }
  }, [open, payment, defaultValues, form]);

  const onSubmit = async (data: PaymentScheduleFormValues) => {
    try {
      // T010: Use custom submit handler if provided (for invoice-linked payments)
      if (onCustomSubmit) {
        await onCustomSubmit(data);
        onSuccess();
        return;
      }

      if (isEditMode && payment) {
        // Only allow editing notes for paid payments
        const updateData = isReadOnly
          ? { notes: data.notes }
          : data;

        await updatePayment.mutateAsync({
          paymentId: payment.id,
          vendorId,
          data: updateData,
        });
      } else {
        await createPayment.mutateAsync({
          vendorId,
          data,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const isSubmitting = createPayment.isPending || updatePayment.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? isReadOnly
                ? 'View Payment'
                : 'Edit Payment'
              : 'Add Payment Milestone'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? isReadOnly
                ? 'This payment has been completed. Only notes can be modified.'
                : 'Update payment milestone details.'
              : 'Add a new payment milestone for tracking.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="milestone_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Initial deposit, Final payment"
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

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (ZAR)</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage of Total (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="e.g., 50"
                      disabled={isReadOnly}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? null : parseFloat(val));
                      }}
                    />
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
                  {isEditMode ? 'Save Changes' : 'Add Payment'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;
