/**
 * OverviewTab - Vendor overview form fields
 * Two-column layout with basic vendor information
 * @feature 028-vendor-card-expandable
 * @feature 029-budget-vendor-integration
 * @task T058-T068
 * @task T036-T037: Budget category dropdown for default invoice allocation
 */

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorFormData, VendorType, VendorStatus, VENDOR_TYPE_CONFIG, VENDOR_STATUS_CONFIG } from '@/types/vendor';
import { useBudgetCategories } from '@/hooks/useBudgetCategories';

const VENDOR_TYPES = Object.keys(VENDOR_TYPE_CONFIG) as VendorType[];
const VENDOR_STATUSES: VendorStatus[] = ['active', 'inactive', 'backup'];

interface OverviewTabProps {
  weddingId: string;
}

export function OverviewTab({ weddingId }: OverviewTabProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<VendorFormData>();

  // T037: Fetch wedding's budget categories for dropdown
  const { categories: budgetCategories, isLoading: categoriesLoading } = useBudgetCategories(weddingId);

  const vendorType = watch('vendor_type');
  const status = watch('status');
  const defaultBudgetCategoryId = watch('default_budget_category_id');

  return (
    <div className="p-4">
      {/* Two-column layout on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">Company Information</h3>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company_name"
              {...register('company_name')}
              placeholder="Company name"
              className={errors.company_name ? 'border-red-500' : ''}
            />
            {errors.company_name && (
              <p className="text-sm text-red-500">{errors.company_name.message}</p>
            )}
          </div>

          {/* Vendor Type */}
          <div className="space-y-2">
            <Label htmlFor="vendor_type">
              Vendor Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={vendorType}
              onValueChange={(value) => setValue('vendor_type', value as VendorType, { shouldDirty: true })}
            >
              <SelectTrigger id="vendor_type">
                <SelectValue placeholder="Select vendor type" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {VENDOR_TYPE_CONFIG[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as VendorStatus, { shouldDirty: true })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {VENDOR_STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* T036: Default Budget Category */}
          <div className="space-y-2">
            <Label htmlFor="default_budget_category_id">Default Budget Category</Label>
            <Select
              value={defaultBudgetCategoryId || ''}
              onValueChange={(value) => setValue('default_budget_category_id', value || '', { shouldDirty: true })}
              disabled={categoriesLoading}
            >
              <SelectTrigger id="default_budget_category_id">
                <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select budget category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {budgetCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Invoices from this vendor will default to this budget category
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Business address"
              rows={2}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              placeholder="https://example.com"
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 border-b pb-2">Contact Information</h3>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contact_name">
              Contact Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact_name"
              {...register('contact_name')}
              placeholder="Primary contact name"
              className={errors.contact_name ? 'border-red-500' : ''}
            />
            {errors.contact_name && (
              <p className="text-sm text-red-500">{errors.contact_name.message}</p>
            )}
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email</Label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email')}
              placeholder="contact@example.com"
              className={errors.contact_email ? 'border-red-500' : ''}
            />
            {errors.contact_email && (
              <p className="text-sm text-red-500">{errors.contact_email.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              {...register('contact_phone')}
              placeholder="+1 (555) 123-4567"
              className={errors.contact_phone ? 'border-red-500' : ''}
            />
            {errors.contact_phone && (
              <p className="text-sm text-red-500">{errors.contact_phone.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this vendor..."
              rows={4}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
