/**
 * VendorFilters Component
 * @feature 008-vendor-management
 * @task T040
 *
 * Advanced filtering by vendor type, contract status, and payment status (FR-004)
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  VendorFilters as VendorFiltersType,
  VendorType,
  ContractStatusLabel,
  PaymentStatusLabel,
  DEFAULT_VENDOR_FILTERS,
  VENDOR_TYPE_CONFIG,
} from '@/types/vendor';
import { VENDOR_TYPES } from '@/schemas/vendor';

const CONTRACT_STATUS_OPTIONS: ContractStatusLabel[] = [
  'Signed',
  'Unsigned',
  'Expiring Soon',
  'Expired',
];

const PAYMENT_STATUS_OPTIONS: PaymentStatusLabel[] = [
  'Paid',
  'Pending',
  'Due Soon',
  'Overdue',
];

interface VendorFiltersProps {
  filters: VendorFiltersType;
  onFiltersChange: (filters: VendorFiltersType) => void;
}

export function VendorFilters({ filters, onFiltersChange }: VendorFiltersProps) {
  const hasActiveFilters =
    filters.vendorType !== 'all' ||
    filters.contractStatus !== 'all' ||
    filters.paymentStatus !== 'all';

  const handleVendorTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      vendorType: value as VendorType | 'all',
    });
  };

  const handleContractStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      contractStatus: value as ContractStatusLabel | 'all',
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      paymentStatus: value as PaymentStatusLabel | 'all',
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      ...DEFAULT_VENDOR_FILTERS,
      search: filters.search, // Keep search query
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Vendor Type Filter */}
      <Select value={filters.vendorType} onValueChange={handleVendorTypeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Vendor Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {VENDOR_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {VENDOR_TYPE_CONFIG[type as VendorType].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Contract Status Filter */}
      <Select value={filters.contractStatus} onValueChange={handleContractStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Contract Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Contracts</SelectItem>
          {CONTRACT_STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Payment Status Filter */}
      <Select value={filters.paymentStatus} onValueChange={handlePaymentStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          {PAYMENT_STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-gray-500">
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
