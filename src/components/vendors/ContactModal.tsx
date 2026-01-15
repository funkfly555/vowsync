/**
 * ContactModal Component
 * @feature 009-vendor-payments-invoices
 * T043: Modal form to add/edit vendor contacts
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useCreateContact, useUpdateContact } from '@/hooks/useVendorContactMutations';
import { vendorContactSchema, defaultVendorContactValues, type VendorContactFormValues } from '@/schemas/vendorContact';
import type { VendorContact } from '@/types/vendor';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId: string;
  contact?: VendorContact | null;
}

/**
 * Transform contact to form data for editing
 */
function contactToFormData(contact: VendorContact): VendorContactFormValues {
  return {
    contact_name: contact.contact_name,
    contact_role: contact.contact_role || '',
    contact_email: contact.contact_email || '',
    contact_phone: contact.contact_phone || '',
    is_primary: contact.is_primary,
    is_onsite_contact: contact.is_onsite_contact,
  };
}

export function ContactModal({
  open,
  onClose,
  onSuccess,
  vendorId,
  contact,
}: ContactModalProps) {
  const isEditMode = !!contact;

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const form = useForm<VendorContactFormValues>({
    resolver: zodResolver(vendorContactSchema),
    defaultValues: defaultVendorContactValues,
  });

  // Reset form when modal opens/closes or contact changes
  useEffect(() => {
    if (open) {
      if (contact) {
        form.reset(contactToFormData(contact));
      } else {
        form.reset(defaultVendorContactValues);
      }
    }
  }, [open, contact, form]);

  const onSubmit = async (data: VendorContactFormValues) => {
    try {
      if (isEditMode && contact) {
        await updateContact.mutateAsync({
          contactId: contact.id,
          vendorId,
          data: {
            contact_name: data.contact_name,
            contact_role: data.contact_role || undefined,
            contact_email: data.contact_email || undefined,
            contact_phone: data.contact_phone || undefined,
            is_primary: data.is_primary,
            is_onsite_contact: data.is_onsite_contact,
          },
        });
      } else {
        await createContact.mutateAsync({
          vendorId,
          data: {
            contact_name: data.contact_name,
            contact_role: data.contact_role || undefined,
            contact_email: data.contact_email || undefined,
            contact_phone: data.contact_phone || undefined,
            is_primary: data.is_primary,
            is_onsite_contact: data.is_onsite_contact,
          },
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const isSubmitting = createContact.isPending || updateContact.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Contact' : 'Add Contact'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update contact details for this vendor.'
              : 'Add a new contact person for this vendor.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., John Smith"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Event Coordinator"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The contact's position or role at the vendor company.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+27 12 345 6789"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <p className="text-sm font-medium">Contact Settings</p>

              <FormField
                control={form.control}
                name="is_primary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Primary Contact
                      </FormLabel>
                      <FormDescription>
                        Mark as the main point of contact for this vendor.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_onsite_contact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Onsite Contact
                      </FormLabel>
                      <FormDescription>
                        This person will be present at the wedding venue.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ContactModal;
