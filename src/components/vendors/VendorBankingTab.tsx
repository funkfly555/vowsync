/**
 * VendorBankingTab Component
 * @feature 008-vendor-management
 * @task T023
 *
 * Banking information form tab
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
import { VendorFormData } from '@/types/vendor';

interface VendorBankingTabProps {
  form: UseFormReturn<VendorFormData>;
}

export function VendorBankingTab({ form }: VendorBankingTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Banking information for payment processing. All fields are optional.
      </p>

      {/* Bank Name */}
      <FormField
        control={form.control}
        name="bank_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter bank name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Account Name */}
      <FormField
        control={form.control}
        name="account_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Name</FormLabel>
            <FormControl>
              <Input placeholder="Name on the account" {...field} />
            </FormControl>
            <FormDescription>
              The name as it appears on the bank account
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Account Number */}
      <FormField
        control={form.control}
        name="account_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter account number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Branch Code */}
      <FormField
        control={form.control}
        name="branch_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branch Code / Routing Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter branch code" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SWIFT Code */}
      <FormField
        control={form.control}
        name="swift_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SWIFT / BIC Code</FormLabel>
            <FormControl>
              <Input placeholder="Enter SWIFT code" {...field} />
            </FormControl>
            <FormDescription>
              Required for international wire transfers
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
