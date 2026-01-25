/**
 * VendorBasicInfoTab Component
 * @feature 008-vendor-management
 * @feature 029-budget-vendor-integration
 * @task T021
 *
 * Basic information form tab for vendor modal
 */

import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorFormData, VENDOR_TYPE_CONFIG, VENDOR_STATUS_CONFIG, VendorType, VendorStatus } from '@/types/vendor';
import { VENDOR_TYPES, VENDOR_STATUSES } from '@/schemas/vendor';
import { useBudgetCategories } from '@/hooks/useBudgetCategories';

interface VendorBasicInfoTabProps {
  form: UseFormReturn<VendorFormData>;
  weddingId: string;
}

export function VendorBasicInfoTab({ form, weddingId }: VendorBasicInfoTabProps) {
  // Fetch wedding's budget categories for dropdown
  const { categories: budgetCategories, isLoading: categoriesLoading } = useBudgetCategories(weddingId);

  return (
    <div className="space-y-4">
      {/* Vendor Type */}
      <FormField
        control={form.control}
        name="vendor_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor Type *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {VENDOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {VENDOR_TYPE_CONFIG[type as VendorType].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Default Budget Category - Feature 029 */}
      <FormField
        control={form.control}
        name="default_budget_category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Budget Category</FormLabel>
            <Select
              value={field.value || '__none__'}
              onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
              disabled={categoriesLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select budget category'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {budgetCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Invoices from this vendor will default to this budget category
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Company Name */}
      <FormField
        control={form.control}
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter company name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Contact Name */}
      <FormField
        control={form.control}
        name="contact_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter contact name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Contact Email */}
      <FormField
        control={form.control}
        name="contact_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="contact@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Contact Phone */}
      <FormField
        control={form.control}
        name="contact_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 000-0000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address */}
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Website */}
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Status */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {VENDOR_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {VENDOR_STATUS_CONFIG[status as VendorStatus].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional notes about this vendor..."
                className="resize-none"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
