/**
 * ContractTab - Contract and insurance form fields
 * Three sections: Contract Details, Insurance, Banking (read-only)
 * @feature 028-vendor-card-expandable
 * @task T069-T080
 */

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { VendorFormData, VendorDisplay } from '@/types/vendor';
import { AlertCircle, Lock } from 'lucide-react';

interface ContractTabProps {
  vendor: VendorDisplay;
}

export function ContractTab({ vendor }: ContractTabProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<VendorFormData>();

  const contractSigned = watch('contract_signed');
  const insuranceRequired = watch('insurance_required');
  const insuranceVerified = watch('insurance_verified');

  return (
    <div className="p-4 space-y-8">
      {/* Contract Details Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 border-b pb-2">Contract Details</h3>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Contract Signed Toggle */}
          <div className="lg:col-span-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="contract_signed" className="text-base font-medium">
                Contract Signed
              </Label>
              <p className="text-sm text-gray-500">
                Has a contract been signed with this vendor?
              </p>
            </div>
            <Switch
              id="contract_signed"
              checked={contractSigned}
              onCheckedChange={(checked) => setValue('contract_signed', checked, { shouldDirty: true })}
            />
          </div>

          {/* Contract Date */}
          <div className="space-y-2">
            <Label htmlFor="contract_date">Contract Date</Label>
            <Input
              id="contract_date"
              type="date"
              {...register('contract_date')}
              className={errors.contract_date ? 'border-red-500' : ''}
            />
            {errors.contract_date && (
              <p className="text-sm text-red-500">{errors.contract_date.message}</p>
            )}
          </div>

          {/* Contract Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="contract_expiry_date">Expiry Date</Label>
            <Input
              id="contract_expiry_date"
              type="date"
              {...register('contract_expiry_date')}
              className={errors.contract_expiry_date ? 'border-red-500' : ''}
            />
            {errors.contract_expiry_date && (
              <p className="text-sm text-red-500">{errors.contract_expiry_date.message}</p>
            )}
          </div>

          {/* Contract Value */}
          <div className="space-y-2">
            <Label htmlFor="contract_value">Contract Value</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <Input
                id="contract_value"
                type="text"
                inputMode="decimal"
                {...register('contract_value')}
                placeholder="0.00"
                className={`pl-7 ${errors.contract_value ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.contract_value && (
              <p className="text-sm text-red-500">{errors.contract_value.message}</p>
            )}
          </div>

          {/* Cancellation Fee Percentage */}
          <div className="space-y-2">
            <Label htmlFor="cancellation_fee_percentage">Cancellation Fee (%)</Label>
            <div className="relative">
              <Input
                id="cancellation_fee_percentage"
                type="text"
                inputMode="decimal"
                {...register('cancellation_fee_percentage')}
                placeholder="0"
                className={`pr-8 ${errors.cancellation_fee_percentage ? 'border-red-500' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            {errors.cancellation_fee_percentage && (
              <p className="text-sm text-red-500">{errors.cancellation_fee_percentage.message}</p>
            )}
          </div>

          {/* Cancellation Policy */}
          <div className="lg:col-span-2 space-y-2">
            <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
            <Textarea
              id="cancellation_policy"
              {...register('cancellation_policy')}
              placeholder="Describe the cancellation terms..."
              rows={3}
              className={errors.cancellation_policy ? 'border-red-500' : ''}
            />
            {errors.cancellation_policy && (
              <p className="text-sm text-red-500">{errors.cancellation_policy.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 border-b pb-2">Insurance</h3>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Insurance Required Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="insurance_required" className="text-base font-medium">
                Insurance Required
              </Label>
              <p className="text-sm text-gray-500">
                Does this vendor need liability insurance?
              </p>
            </div>
            <Switch
              id="insurance_required"
              checked={insuranceRequired}
              onCheckedChange={(checked) => setValue('insurance_required', checked, { shouldDirty: true })}
            />
          </div>

          {/* Insurance Verified Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="insurance_verified" className="text-base font-medium">
                Insurance Verified
              </Label>
              <p className="text-sm text-gray-500">
                Has insurance been confirmed?
              </p>
            </div>
            <Switch
              id="insurance_verified"
              checked={insuranceVerified}
              onCheckedChange={(checked) => setValue('insurance_verified', checked, { shouldDirty: true })}
            />
          </div>

          {/* Insurance Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="insurance_expiry_date">Insurance Expiry Date</Label>
            <Input
              id="insurance_expiry_date"
              type="date"
              {...register('insurance_expiry_date')}
              className={errors.insurance_expiry_date ? 'border-red-500' : ''}
            />
            {errors.insurance_expiry_date && (
              <p className="text-sm text-red-500">{errors.insurance_expiry_date.message}</p>
            )}
          </div>

          {/* Insurance Warning */}
          {insuranceRequired && !insuranceVerified && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Insurance Verification Pending</p>
                <p className="mt-1">
                  This vendor requires insurance but it has not been verified yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Banking Section (Read-only) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <h3 className="font-medium text-gray-900">Banking Information</h3>
          <Lock className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">(Read-only)</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label className="text-gray-500">Bank Name</Label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700">
              {vendor.bank_name || '—'}
            </div>
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label className="text-gray-500">Account Name</Label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700">
              {vendor.account_name || '—'}
            </div>
          </div>

          {/* Account Number (masked) */}
          <div className="space-y-2">
            <Label className="text-gray-500">Account Number</Label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700 font-mono">
              {vendor.maskedAccountNumber || '—'}
            </div>
          </div>

          {/* Branch Code */}
          <div className="space-y-2">
            <Label className="text-gray-500">Branch Code</Label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700">
              {vendor.branch_code || '—'}
            </div>
          </div>

          {/* SWIFT Code */}
          <div className="space-y-2">
            <Label className="text-gray-500">SWIFT Code</Label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700">
              {vendor.swift_code || '—'}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 italic">
          Banking information can only be edited through the vendor settings page for security reasons.
        </p>
      </div>
    </div>
  );
}
