# Quickstart: Vendor Card Expandable

**Feature**: 028-vendor-card-expandable
**Date**: 2026-01-23

## Prerequisites

- Feature 027 (Vendor View Toggle) merged to master
- Existing files in place:
  - `src/types/vendor.ts` - All type definitions
  - `src/hooks/useVendors.ts` - Vendor data fetching
  - `src/pages/vendors/VendorsPage.tsx` - Page with Card/Table toggle
  - `src/components/vendors/VendorCard.tsx` - Current card (to be replaced)

## Implementation Order

### Step 1: Add State Management to VendorsPage

```typescript
// src/pages/vendors/VendorsPage.tsx

// Add state for expanded cards
const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

// Toggle individual card
const handleToggleExpand = useCallback((vendorId: string) => {
  setExpandedCards((prev) => {
    const next = new Set(prev);
    if (next.has(vendorId)) {
      next.delete(vendorId);
    } else {
      next.add(vendorId);
    }
    return next;
  });
}, []);

// Expand all
const handleExpandAll = useCallback(() => {
  if (vendors) {
    setExpandedCards(new Set(vendors.map((v) => v.id)));
  }
}, [vendors]);

// Collapse all
const handleCollapseAll = useCallback(() => {
  setExpandedCards(new Set());
}, []);
```

### Step 2: Create Zod Validation Schema

```typescript
// src/schemas/vendor.ts
import { z } from 'zod';

export const vendorEditSchema = z.object({
  // Overview Tab
  vendor_type: z.enum([
    'Catering', 'Photography', 'Videography', 'Flowers', 'Florist',
    'Music/DJ', 'Entertainment', 'Venue', 'Transportation', 'Officiant',
    'Hair/Makeup', 'Hair & Makeup', 'Rentals', 'Decor', 'Cake',
    'Stationery', 'Beverages', 'Other'
  ]),
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'backup']),
  notes: z.string().optional(),

  // Contract Tab
  contract_signed: z.boolean(),
  contract_date: z.string().optional(),
  contract_expiry_date: z.string().optional(),
  contract_value: z.string().optional(),
  cancellation_policy: z.string().optional(),
  cancellation_fee_percentage: z.string().optional(),

  // Insurance
  insurance_required: z.boolean(),
  insurance_verified: z.boolean(),
  insurance_expiry_date: z.string().optional(),
}).refine(
  (data) => {
    if (data.contract_date && data.contract_expiry_date) {
      return new Date(data.contract_expiry_date) >= new Date(data.contract_date);
    }
    return true;
  },
  {
    message: 'Expiry date must be after contract date',
    path: ['contract_expiry_date'],
  }
).refine(
  (data) => {
    if (data.cancellation_fee_percentage) {
      const val = parseFloat(data.cancellation_fee_percentage);
      return !isNaN(val) && val >= 0 && val <= 100;
    }
    return true;
  },
  {
    message: 'Percentage must be between 0 and 100',
    path: ['cancellation_fee_percentage'],
  }
);

export type VendorEditFormData = z.infer<typeof vendorEditSchema>;
```

### Step 3: Create VendorCardCollapsed Component

```typescript
// src/components/vendors/VendorCardCollapsed.tsx
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { VendorDisplay, CONTRACT_STATUS_CONFIG, VENDOR_TYPE_CONFIG } from '@/types/vendor';

interface VendorCardCollapsedProps {
  vendor: VendorDisplay;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  paymentSummary: string; // e.g., "2 of 3 paid"
}

export function VendorCardCollapsed({
  vendor,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  paymentSummary,
}: VendorCardCollapsedProps) {
  const contractConfig = CONTRACT_STATUS_CONFIG[vendor.contractStatus.label];
  const typeConfig = VENDOR_TYPE_CONFIG[vendor.vendor_type];

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 cursor-pointer transition-colors',
        isSelected ? 'bg-[#D4A5A5]/10' : 'hover:bg-gray-50',
        !isExpanded && 'rounded-lg border border-[#E8E8E8]'
      )}
      onClick={onToggleExpand}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect()}
          className="data-[state=checked]:bg-[#D4A5A5] data-[state=checked]:border-[#D4A5A5]"
        />
      </div>

      {/* Company Name */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-[#2C2C2C] truncate">
          {vendor.company_name}
        </h3>
        <p className="text-sm text-gray-500">{vendor.contact_name}</p>
      </div>

      {/* Vendor Type Badge */}
      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
        {typeConfig.label}
      </span>

      {/* Contract Status Badge */}
      <span className={cn('px-2 py-1 text-xs font-medium rounded', contractConfig.bgColor, contractConfig.color)}>
        {vendor.contractStatus.label}
      </span>

      {/* Payment Summary */}
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {paymentSummary}
      </span>

      {/* Expand/Collapse Chevron */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        className="p-1 hover:bg-gray-100 rounded"
      >
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
    </div>
  );
}
```

### Step 4: Create VendorTabs Component

```typescript
// src/components/vendors/VendorTabs.tsx
import { Building2, FileText, CreditCard, Receipt, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VendorTabName = 'overview' | 'contract' | 'payments' | 'invoices' | 'contacts';

const TABS: { id: VendorTabName; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Building2 className="h-4 w-4" /> },
  { id: 'contract', label: 'Contract', icon: <FileText className="h-4 w-4" /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'invoices', label: 'Invoices', icon: <Receipt className="h-4 w-4" /> },
  { id: 'contacts', label: 'Contacts', icon: <Users className="h-4 w-4" /> },
];

interface VendorTabsProps {
  activeTab: VendorTabName;
  onTabChange: (tab: VendorTabName) => void;
}

export function VendorTabs({ activeTab, onTabChange }: VendorTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto" aria-label="Vendor details tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-[#D4A5A5] text-[#D4A5A5]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
```

### Step 5: Create VendorCardExpanded Component

```typescript
// src/components/vendors/VendorCardExpanded.tsx
import { useState, ReactNode } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { VendorTabs, VendorTabName } from './VendorTabs';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface VendorCardExpandedProps {
  isExpanded: boolean;
  saveStatus: SaveStatus;
  children: (activeTab: VendorTabName) => ReactNode;
}

export function VendorCardExpanded({
  isExpanded,
  saveStatus,
  children,
}: VendorCardExpandedProps) {
  const [activeTab, setActiveTab] = useState<VendorTabName>('overview');

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-in-out',
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      )}
    >
      <div className="border-t border-gray-200 bg-white rounded-b-lg">
        {/* Tab Navigation */}
        <VendorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {children(activeTab)}
        </div>

        {/* Auto-save Status Footer */}
        <div className="flex justify-end items-center gap-2 px-4 py-2 bg-gray-50 border-t border-gray-200">
          <AutoSaveIndicator status={saveStatus} />
        </div>
      </div>
    </div>
  );
}

function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-[#D4A5A5]" />
          <span>Saving...</span>
        </div>
      );
    case 'saved':
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>Saved</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Error saving</span>
        </div>
      );
    default:
      return null;
  }
}
```

### Step 6: Create Main VendorCard Component

Follow the pattern from `GuestCard.tsx`:
1. Initialize form with `useForm` and `zodResolver`
2. Set up `saveStatus` state
3. Subscribe to form changes with `watch()`
4. Debounce save operations (500ms)
5. Render collapsed and expanded views

### Step 7: Create Tab Components

Create each tab component in `src/components/vendors/tabs/`:
- `OverviewTab.tsx` - Form fields using react-hook-form
- `ContractTab.tsx` - Contract and insurance fields
- `PaymentsTab.tsx` - Payment table with Mark as Paid
- `InvoicesTab.tsx` - Invoice table with Mark as Paid
- `ContactsTab.tsx` - Read-only contacts table

### Step 8: Update Hooks

Add mutations to `src/hooks/useVendorMutations.ts`:
```typescript
// updateVendor - for auto-save
// markPaymentAsPaid - for payment actions
// markInvoiceAsPaid - for invoice actions
```

## Testing Checklist

- [ ] Card expands when clicked
- [ ] Card collapses when clicked again
- [ ] Expand All button works
- [ ] Collapse All button works
- [ ] All 5 tabs render correctly
- [ ] Overview tab fields are editable
- [ ] Contract tab fields are editable
- [ ] Banking info displays masked account number
- [ ] Payments table shows correct data
- [ ] Mark as Paid works for payments
- [ ] Invoices table shows correct data
- [ ] Mark as Paid works for invoices
- [ ] Contacts table shows read-only data
- [ ] Auto-save triggers on field changes
- [ ] Save status indicator shows correctly
- [ ] Validation errors display inline
- [ ] Selection state persists during expand/collapse
- [ ] Animations are smooth (60fps)
- [ ] Empty states show for no payments/invoices/contacts

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/components/guests/GuestCard.tsx` | Pattern for main container |
| `src/components/guests/GuestCardCollapsed.tsx` | Pattern for collapsed view |
| `src/components/guests/GuestCardExpanded.tsx` | Pattern for expanded view |
| `src/components/guests/GuestTabs.tsx` | Pattern for tabs |
| `src/components/guests/tabs/BasicInfoTab.tsx` | Pattern for form fields |
| `src/types/vendor.ts` | All vendor types |
| `docs/CARD-TABLE-VIEW-PATTERN.md` | Implementation pattern documentation |
