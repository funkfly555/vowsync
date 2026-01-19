/**
 * VendorInvoicesCard - Invoice amounts grouped by status
 * Displays amounts only (NO counts) with colored badges
 * @feature 022-dashboard-visual-metrics
 * @task T006, T014, T048-T052
 */

import { useCurrency } from '@/contexts/CurrencyContext';

// Vendor invoice badge colors (T014)
const INVOICE_BADGE_COLORS = {
  overdue: { bg: '#FFEBEE', text: '#C62828' },
  unpaid: { bg: '#FFF3E0', text: '#E65100' },
  partiallyPaid: { bg: '#E3F2FD', text: '#1565C0' },
  paid: { bg: '#E8F5E9', text: '#2E7D32' },
} as const;

interface VendorInvoicesCardProps {
  overdue: number;        // Total amount, NOT count
  unpaid: number;
  partiallyPaid: number;
  paid: number;
  isLoading?: boolean;
}

/**
 * StatusRow - Badge with right-aligned amount (T048, T049)
 */
function StatusRow({
  label,
  amount,
  colorConfig,
  formatCurrency,
}: {
  label: string;
  amount: number;
  colorConfig: { bg: string; text: string };
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      {/* Badge */}
      <span
        className="px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: colorConfig.bg,
          color: colorConfig.text,
        }}
      >
        {label}
      </span>
      {/* Amount only - NO counts (T050) */}
      <span className="text-sm font-medium text-gray-900">
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

/**
 * Loading skeleton (T052)
 */
function VendorInvoicesSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-7 w-24 bg-gray-200 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * VendorInvoicesCard - Amounts by status with colored badges
 */
export function VendorInvoicesCard({
  overdue,
  unpaid,
  partiallyPaid,
  paid,
  isLoading = false,
}: VendorInvoicesCardProps) {
  const { formatCurrency } = useCurrency();

  if (isLoading) {
    return <VendorInvoicesSkeleton />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Vendor Invoices</h3>

      <div className="space-y-1">
        <StatusRow
          label="Overdue"
          amount={overdue}
          colorConfig={INVOICE_BADGE_COLORS.overdue}
          formatCurrency={formatCurrency}
        />
        <StatusRow
          label="Unpaid"
          amount={unpaid}
          colorConfig={INVOICE_BADGE_COLORS.unpaid}
          formatCurrency={formatCurrency}
        />
        <StatusRow
          label="Partially Paid"
          amount={partiallyPaid}
          colorConfig={INVOICE_BADGE_COLORS.partiallyPaid}
          formatCurrency={formatCurrency}
        />
        <StatusRow
          label="Paid"
          amount={paid}
          colorConfig={INVOICE_BADGE_COLORS.paid}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
