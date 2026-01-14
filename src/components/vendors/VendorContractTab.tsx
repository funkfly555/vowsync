/**
 * VendorContractTab Component
 * @feature 008-vendor-management
 * @task T022
 *
 * Contract details form tab with conditional fields (FR-008)
 */

import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { VendorFormData } from '@/types/vendor';

interface VendorContractTabProps {
  form: UseFormReturn<VendorFormData>;
}

export function VendorContractTab({ form }: VendorContractTabProps) {
  const contractSigned = form.watch('contract_signed');
  const insuranceRequired = form.watch('insurance_required');

  return (
    <div className="space-y-6">
      {/* Contract Signed Checkbox */}
      <FormField
        control={form.control}
        name="contract_signed"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Contract Signed</FormLabel>
              <FormDescription>
                Check this if a contract has been signed with this vendor
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {/* Conditional Contract Fields - only show if contract_signed */}
      {contractSigned && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          {/* Contract Date */}
          <FormField
            control={form.control}
            name="contract_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contract Expiry Date */}
          <FormField
            control={form.control}
            name="contract_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contract Value */}
          <FormField
            control={form.control}
            name="contract_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cancellation Policy */}
          <FormField
            control={form.control}
            name="cancellation_policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancellation Policy</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the cancellation policy..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cancellation Fee Percentage */}
          <FormField
            control={form.control}
            name="cancellation_fee_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancellation Fee (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Percentage of contract value charged for cancellation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Insurance Required Checkbox */}
      <FormField
        control={form.control}
        name="insurance_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Insurance Required</FormLabel>
              <FormDescription>
                Check this if insurance verification is required for this vendor
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {/* Conditional Insurance Fields - only show if insurance_required */}
      {insuranceRequired && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          {/* Insurance Verified */}
          <FormField
            control={form.control}
            name="insurance_verified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Insurance Verified</FormLabel>
                  <FormDescription>
                    Check this once insurance has been verified
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Insurance Expiry Date */}
          <FormField
            control={form.control}
            name="insurance_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
