# Implementation Tasks: Vendor Card Expandable

**Feature**: 028-vendor-card-expandable
**Generated**: 2026-01-23
**Source**: spec.md, plan.md, data-model.md, api-contracts.md, quickstart.md

## User Story Summary

| ID | Priority | Story | Description |
|----|----------|-------|-------------|
| US1 | P1 | View Vendor Summary | See essential vendor info in collapsed card |
| US2 | P1 | Expand/Collapse Cards | Click to expand/collapse individual cards |
| US3 | P1 | Edit Vendor Inline | Auto-save edits with validation |
| US4 | P2 | Bulk Expand/Collapse | Expand All / Collapse All buttons |
| US5 | P2 | Select in Both States | Checkbox works in collapsed/expanded |
| US6 | P2 | Payments Tab | View payments, Mark as Paid |
| US7 | P2 | Invoices Tab | View invoices, Mark as Paid |
| US8 | P3 | Contacts Tab | View contacts read-only |

---

## Phase 1: Setup

- [ ] T001 [Setup] Create feature branch `028-vendor-card-expandable` from master
- [ ] T002 [Setup] Verify prerequisite files exist: `src/types/vendor.ts`, `src/hooks/useVendors.ts`, `src/pages/vendors/VendorsPage.tsx`
- [ ] T003 [Setup] Create `src/components/vendors/tabs/` directory structure
- [ ] T004 [Setup] Verify GuestCard pattern files available for reference: `src/components/guests/GuestCard.tsx`, `GuestCardCollapsed.tsx`, `GuestCardExpanded.tsx`, `GuestTabs.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

### Zod Schema (blocks US1, US2, US3)

- [ ] T005 [P1] [Foundation] Create `src/schemas/vendor.ts` with vendorEditSchema using Zod
- [ ] T006 [P1] [Foundation] Add validation for vendor_type enum (18 values) in `src/schemas/vendor.ts`
- [ ] T007 [P1] [Foundation] Add validation for company_name (required, min 1) in `src/schemas/vendor.ts`
- [ ] T008 [P1] [Foundation] Add validation for contact_name (required, min 1) in `src/schemas/vendor.ts`
- [ ] T009 [P1] [Foundation] Add validation for contact_email (optional, valid email or empty) in `src/schemas/vendor.ts`
- [ ] T010 [P1] [Foundation] Add validation for website (optional, valid URL or empty) in `src/schemas/vendor.ts`
- [ ] T011 [P1] [Foundation] Add validation for status enum (active/inactive/backup) in `src/schemas/vendor.ts`
- [ ] T012 [P1] [Foundation] Add contract_signed, contract_date, contract_expiry_date validations in `src/schemas/vendor.ts`
- [ ] T013 [P1] [Foundation] Add contract_value, cancellation_policy, cancellation_fee_percentage validations in `src/schemas/vendor.ts`
- [ ] T014 [P1] [Foundation] Add insurance_required, insurance_verified, insurance_expiry_date validations in `src/schemas/vendor.ts`
- [ ] T015 [P1] [Foundation] Add .refine() for contract_expiry_date >= contract_date in `src/schemas/vendor.ts`
- [ ] T016 [P1] [Foundation] Add .refine() for cancellation_fee_percentage 0-100 in `src/schemas/vendor.ts`
- [ ] T017 [P1] [Foundation] Export VendorEditFormData type in `src/schemas/vendor.ts`

### Page State Management (blocks US2, US4)

- [ ] T018 [P1] [Foundation] Add `expandedCards: Set<string>` state to `src/pages/vendors/VendorsPage.tsx`
- [ ] T019 [P1] [Foundation] Add `handleToggleExpand(vendorId: string)` callback in `src/pages/vendors/VendorsPage.tsx`
- [ ] T020 [P1] [Foundation] Add `handleExpandAll()` callback using vendors.map(v => v.id) in `src/pages/vendors/VendorsPage.tsx`
- [ ] T021 [P1] [Foundation] Add `handleCollapseAll()` callback in `src/pages/vendors/VendorsPage.tsx`

---

## Phase 3: US1 - View Vendor Summary in Collapsed Card (P1)

### VendorCardCollapsed Component

- [ ] T022 [P1] [US1] Create `src/components/vendors/VendorCardCollapsed.tsx` with interface props
- [ ] T023 [P1] [US1] Add VendorCardCollapsedProps interface with vendor, isExpanded, isSelected, onToggleExpand, onToggleSelect, paymentSummary
- [ ] T024 [P1] [US1] Implement checkbox with dusty rose checked styling in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T025 [P1] [US1] Display company_name as large bold text (text-lg font-semibold) in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T026 [P1] [US1] Display contact_name as secondary text in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T027 [P1] [US1] Display vendor_type badge using VENDOR_TYPE_CONFIG in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T028 [P1] [US1] Display contract status badge using CONTRACT_STATUS_CONFIG in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T029 [P1] [US1] Display payment summary string (e.g., "2 of 3 paid") in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T030 [P1] [US1] Add ChevronUp/ChevronDown icon based on isExpanded in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T031 [P1] [US1] Apply bg-[#D4A5A5]/10 when isSelected in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T032 [P1] [US1] Apply cursor-pointer and hover:bg-gray-50 styles in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T033 [P1] [US1] Add onClick handler for onToggleExpand on card row in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T034 [P1] [US1] Add e.stopPropagation() on checkbox click in `src/components/vendors/VendorCardCollapsed.tsx`

---

## Phase 4: US2 - Expand/Collapse Individual Cards (P1)

### VendorTabs Component

- [ ] T035 [P1] [US2] Create `src/components/vendors/VendorTabs.tsx` with VendorTabName type
- [ ] T036 [P1] [US2] Define TABS array with 5 tabs: overview, contract, payments, invoices, contacts in `src/components/vendors/VendorTabs.tsx`
- [ ] T037 [P1] [US2] Add Lucide icons: Building2, FileText, CreditCard, Receipt, Users in `src/components/vendors/VendorTabs.tsx`
- [ ] T038 [P1] [US2] Implement VendorTabsProps interface with activeTab, onTabChange in `src/components/vendors/VendorTabs.tsx`
- [ ] T039 [P1] [US2] Apply active tab styling: border-b-2 border-[#D4A5A5] text-[#D4A5A5] in `src/components/vendors/VendorTabs.tsx`
- [ ] T040 [P1] [US2] Apply inactive tab styling: border-transparent text-gray-500 hover:text-gray-700 in `src/components/vendors/VendorTabs.tsx`
- [ ] T041 [P1] [US2] Export VendorTabName type from `src/components/vendors/VendorTabs.tsx`

### VendorCardExpanded Component

- [ ] T042 [P1] [US2] Create `src/components/vendors/VendorCardExpanded.tsx` with SaveStatus type
- [ ] T043 [P1] [US2] Add VendorCardExpandedProps interface with isExpanded, saveStatus, children render prop in `src/components/vendors/VendorCardExpanded.tsx`
- [ ] T044 [P1] [US2] Add useState for activeTab defaulting to 'overview' in `src/components/vendors/VendorCardExpanded.tsx`
- [ ] T045 [P1] [US2] Implement expand/collapse transition: max-h-[2000px] / max-h-0 with duration-200 in `src/components/vendors/VendorCardExpanded.tsx`
- [ ] T046 [P1] [US2] Render VendorTabs component with activeTab and setActiveTab in `src/components/vendors/VendorCardExpanded.tsx`
- [ ] T047 [P1] [US2] Render children(activeTab) for tab content in `src/components/vendors/VendorCardExpanded.tsx`
- [ ] T048 [P1] [US2] Create AutoSaveIndicator subcomponent with saving/saved/error states in `src/components/vendors/VendorCardExpanded.tsx`
- [ ] T049 [P1] [US2] Render AutoSaveIndicator in footer with bg-gray-50 border-t in `src/components/vendors/VendorCardExpanded.tsx`

### Main VendorCard Container

- [ ] T050 [P1] [US2] Replace `src/components/vendors/VendorCard.tsx` with new expandable implementation
- [ ] T051 [P1] [US2] Add VendorCardProps interface with vendor, isExpanded, isSelected, onToggleExpand, onToggleSelect, paymentSummary
- [ ] T052 [P1] [US2] Initialize useForm with zodResolver(vendorEditSchema) in `src/components/vendors/VendorCard.tsx`
- [ ] T053 [P1] [US2] Add saveStatus useState<SaveStatus>('idle') in `src/components/vendors/VendorCard.tsx`
- [ ] T054 [P1] [US2] Wrap component with FormProvider for form context in `src/components/vendors/VendorCard.tsx`
- [ ] T055 [P1] [US2] Render VendorCardCollapsed with all props in `src/components/vendors/VendorCard.tsx`
- [ ] T056 [P1] [US2] Render VendorCardExpanded conditionally based on isExpanded in `src/components/vendors/VendorCard.tsx`
- [ ] T057 [P1] [US2] Apply card container styles: rounded-lg border border-[#E8E8E8] in `src/components/vendors/VendorCard.tsx`

---

## Phase 5: US3 - Edit Vendor Details Inline (P1)

### Hooks Updates

- [ ] T058 [P1] [US3] Add useUpdateVendor mutation to `src/hooks/useVendorMutations.ts`
- [ ] T059 [P1] [US3] Implement optimistic update pattern with onMutate, onError, onSettled in `src/hooks/useVendorMutations.ts`
- [ ] T060 [P1] [US3] Add rollback logic on error in useUpdateVendor mutation in `src/hooks/useVendorMutations.ts`
- [ ] T061 [P1] [US3] Add toast.error on update failure in `src/hooks/useVendorMutations.ts`

### Auto-Save Implementation

- [ ] T062 [P1] [US3] Set up watch() subscription for form changes in `src/components/vendors/VendorCard.tsx`
- [ ] T063 [P1] [US3] Implement 500ms debounce for auto-save in `src/components/vendors/VendorCard.tsx`
- [ ] T064 [P1] [US3] Update saveStatus to 'saving' on mutation start in `src/components/vendors/VendorCard.tsx`
- [ ] T065 [P1] [US3] Update saveStatus to 'saved' on mutation success in `src/components/vendors/VendorCard.tsx`
- [ ] T066 [P1] [US3] Update saveStatus to 'error' on mutation failure in `src/components/vendors/VendorCard.tsx`
- [ ] T067 [P1] [US3] Reset saveStatus to 'idle' after 2 seconds of 'saved' in `src/components/vendors/VendorCard.tsx`

### OverviewTab Component

- [ ] T068 [P1] [US3] Create `src/components/vendors/tabs/OverviewTab.tsx` with useFormContext hook
- [ ] T069 [P1] [US3] Implement two-column grid layout in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T070 [P1] [US3] Add vendor_type select field with 18 options in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T071 [P1] [US3] Add company_name text input with required indicator in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T072 [P1] [US3] Add contact_name text input with required indicator in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T073 [P1] [US3] Add contact_email email input in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T074 [P1] [US3] Add contact_phone tel input in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T075 [P1] [US3] Add address textarea in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T076 [P1] [US3] Add website URL input in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T077 [P1] [US3] Add status select field (active/inactive/backup) in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T078 [P1] [US3] Add notes textarea in `src/components/vendors/tabs/OverviewTab.tsx`
- [ ] T079 [P1] [US3] Display validation errors inline under fields in `src/components/vendors/tabs/OverviewTab.tsx`

### ContractTab Component

- [ ] T080 [P1] [US3] Create `src/components/vendors/tabs/ContractTab.tsx` with useFormContext hook
- [ ] T081 [P1] [US3] Create Contract Details section with header in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T082 [P1] [US3] Add contract_signed checkbox in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T083 [P1] [US3] Add contract_date date picker in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T084 [P1] [US3] Add contract_expiry_date date picker with validation in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T085 [P1] [US3] Add contract_value currency input in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T086 [P1] [US3] Add cancellation_policy textarea in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T087 [P1] [US3] Add cancellation_fee_percentage number input (0-100) in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T088 [P1] [US3] Create Insurance section with header in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T089 [P1] [US3] Add insurance_required checkbox in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T090 [P1] [US3] Add insurance_verified checkbox in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T091 [P1] [US3] Add insurance_expiry_date date picker in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T092 [P1] [US3] Create Banking section (read-only) with header in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T093 [P1] [US3] Display bank_name as read-only text in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T094 [P1] [US3] Display account_name as read-only text in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T095 [P1] [US3] Display masked account_number using maskAccountNumber() in `src/components/vendors/tabs/ContractTab.tsx`
- [ ] T096 [P1] [US3] Display branch_code and swift_code as read-only text in `src/components/vendors/tabs/ContractTab.tsx`

---

## Phase 6: US4 - Bulk Expand/Collapse All Cards (P2)

- [ ] T097 [P2] [US4] Add "Expand All" button to toolbar in `src/pages/vendors/VendorsPage.tsx`
- [ ] T098 [P2] [US4] Add "Collapse All" button to toolbar in `src/pages/vendors/VendorsPage.tsx`
- [ ] T099 [P2] [US4] Wire handleExpandAll to Expand All button onClick in `src/pages/vendors/VendorsPage.tsx`
- [ ] T100 [P2] [US4] Wire handleCollapseAll to Collapse All button onClick in `src/pages/vendors/VendorsPage.tsx`
- [ ] T101 [P2] [US4] Toggle button text based on current expand state in `src/pages/vendors/VendorsPage.tsx`
- [ ] T102 [P2] [US4] Ensure performance: expand 20 cards < 500ms in `src/pages/vendors/VendorsPage.tsx`

---

## Phase 7: US5 - Select Vendors in Both States (P2)

- [ ] T103 [P2] [US5] Verify checkbox works in collapsed state in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T104 [P2] [US5] Verify selected styling applies to entire expanded card in `src/components/vendors/VendorCard.tsx`
- [ ] T105 [P2] [US5] Ensure selection persists when expanding/collapsing in `src/components/vendors/VendorCard.tsx`
- [ ] T106 [P2] [US5] Apply bg-[#D4A5A5]/10 to expanded card when selected in `src/components/vendors/VendorCard.tsx`

---

## Phase 8: US6 - View and Manage Payments Tab (P2)

### Hooks

- [ ] T107 [P2] [US6] Add useVendorPaymentSchedule(vendorId) hook if not exists in `src/hooks/useVendorMutations.ts`
- [ ] T108 [P2] [US6] Add useMarkPaymentAsPaid mutation in `src/hooks/useVendorMutations.ts`
- [ ] T109 [P2] [US6] Implement cache invalidation for vendor-payments query key in `src/hooks/useVendorMutations.ts`

### PaymentsTab Component

- [ ] T110 [P2] [US6] Create `src/components/vendors/tabs/PaymentsTab.tsx` with vendorId prop
- [ ] T111 [P2] [US6] Fetch payments using useVendorPaymentSchedule(vendorId) in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T112 [P2] [US6] Create table with columns: Milestone, Due Date, Amount, Status in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T113 [P2] [US6] Format due_date using date-fns in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T114 [P2] [US6] Format amount as currency in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T115 [P2] [US6] Display status badge (pending/paid/overdue/cancelled) in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T116 [P2] [US6] Add "Mark as Paid" button for unpaid payments in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T117 [P2] [US6] Wire useMarkPaymentAsPaid to button onClick in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T118 [P2] [US6] Add footer with total paid vs total contract value in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T119 [P2] [US6] Add empty state: "No payment milestones have been added for this vendor." in `src/components/vendors/tabs/PaymentsTab.tsx`
- [ ] T120 [P2] [US6] Add loading state while fetching payments in `src/components/vendors/tabs/PaymentsTab.tsx`

---

## Phase 9: US7 - View and Manage Invoices Tab (P2)

### Hooks

- [ ] T121 [P2] [US7] Add useVendorInvoices(vendorId) hook if not exists in `src/hooks/useVendorMutations.ts`
- [ ] T122 [P2] [US7] Add useMarkInvoiceAsPaid mutation in `src/hooks/useVendorMutations.ts`
- [ ] T123 [P2] [US7] Implement cache invalidation for vendor-invoices query key in `src/hooks/useVendorMutations.ts`

### InvoicesTab Component

- [ ] T124 [P2] [US7] Create `src/components/vendors/tabs/InvoicesTab.tsx` with vendorId prop
- [ ] T125 [P2] [US7] Fetch invoices using useVendorInvoices(vendorId) in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T126 [P2] [US7] Create table with columns: Invoice #, Date, Due Date, Amount, VAT, Total, Status in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T127 [P2] [US7] Format dates using date-fns in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T128 [P2] [US7] Format amount, vat_amount, total_amount as currency in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T129 [P2] [US7] Display status badge (unpaid/paid/partially_paid/overdue/cancelled) in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T130 [P2] [US7] Add "Mark as Paid" button for unpaid invoices in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T131 [P2] [US7] Wire useMarkInvoiceAsPaid to button onClick in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T132 [P2] [US7] Add footer with total invoices amount in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T133 [P2] [US7] Add empty state: "No invoices have been recorded for this vendor." in `src/components/vendors/tabs/InvoicesTab.tsx`
- [ ] T134 [P2] [US7] Add loading state while fetching invoices in `src/components/vendors/tabs/InvoicesTab.tsx`

---

## Phase 10: US8 - View and Manage Contacts Tab (P3)

### Hooks

- [ ] T135 [P3] [US8] Add useVendorContacts(vendorId) hook if not exists in `src/hooks/useVendorMutations.ts`

### ContactsTab Component

- [ ] T136 [P3] [US8] Create `src/components/vendors/tabs/ContactsTab.tsx` with vendorId prop
- [ ] T137 [P3] [US8] Fetch contacts using useVendorContacts(vendorId) in `src/components/vendors/tabs/ContactsTab.tsx`
- [ ] T138 [P3] [US8] Create table with columns: Name, Role, Email, Phone, Primary, On-site in `src/components/vendors/tabs/ContactsTab.tsx`
- [ ] T139 [P3] [US8] Display contact_email as mailto link in `src/components/vendors/tabs/ContactsTab.tsx`
- [ ] T140 [P3] [US8] Display contact_phone as tel link in `src/components/vendors/tabs/ContactsTab.tsx`
- [ ] T141 [P3] [US8] Add visual indicator for is_primary contact in `src/components/vendors/tabs/ContactsTab.tsx`
- [ ] T142 [P3] [US8] Add visual indicator for is_onsite_contact in `src/components/vendors/tabs/ContactsTab.tsx`
- [ ] T143 [P3] [US8] Add empty state: "No additional contacts have been added for this vendor." in `src/components/vendors/tabs/ContactsTab.tsx`
- [ ] T144 [P3] [US8] Add loading state while fetching contacts in `src/components/vendors/tabs/ContactsTab.tsx`

---

## Phase 11: Integration & Barrel Exports

- [ ] T145 [P1] [Integration] Create `src/components/vendors/tabs/index.ts` barrel export
- [ ] T146 [P1] [Integration] Export OverviewTab, ContractTab, PaymentsTab, InvoicesTab, ContactsTab from barrel
- [ ] T147 [P1] [Integration] Wire tab content rendering in VendorCardExpanded children prop
- [ ] T148 [P1] [Integration] Pass vendorId to PaymentsTab, InvoicesTab, ContactsTab
- [ ] T149 [P2] [Integration] Pass expanded props from VendorsPage to VendorCard
- [ ] T150 [P2] [Integration] Pass paymentSummary prop from VendorsPage to VendorCard

---

## Phase 12: Polish & Cross-Cutting Concerns

### Accessibility

- [ ] T151 [Polish] Add aria-label to expand/collapse button in `src/components/vendors/VendorCardCollapsed.tsx`
- [ ] T152 [Polish] Add aria-expanded attribute to card container in `src/components/vendors/VendorCard.tsx`
- [ ] T153 [Polish] Add role="tablist" to VendorTabs nav in `src/components/vendors/VendorTabs.tsx`
- [ ] T154 [Polish] Add role="tab" and aria-selected to tab buttons in `src/components/vendors/VendorTabs.tsx`
- [ ] T155 [Polish] Add keyboard navigation (arrow keys) to tabs in `src/components/vendors/VendorTabs.tsx`

### Performance

- [ ] T156 [Polish] Verify expand animation runs at 60fps
- [ ] T157 [Polish] Verify "Expand All" with 20 vendors completes < 500ms
- [ ] T158 [Polish] Verify lazy loading of tab data (payments/invoices/contacts fetch on tab activate)

### Edge Cases

- [ ] T159 [Polish] Handle vendor with no payments (empty state in PaymentsTab)
- [ ] T160 [Polish] Handle vendor with no invoices (empty state in InvoicesTab)
- [ ] T161 [Polish] Handle vendor with no contacts (empty state in ContactsTab)
- [ ] T162 [Polish] Handle expired contract (show "Expired" badge)
- [ ] T163 [Polish] Handle network failure on save (rollback + error toast)
- [ ] T164 [Polish] Reset activeTab to 'overview' on card collapse

### Manual Testing

- [ ] T165 [Testing] Test expand/collapse individual cards
- [ ] T166 [Testing] Test expand/collapse all functionality
- [ ] T167 [Testing] Test all 5 tabs render correctly
- [ ] T168 [Testing] Test inline editing with auto-save
- [ ] T169 [Testing] Test validation errors display inline
- [ ] T170 [Testing] Test Mark as Paid for payments
- [ ] T171 [Testing] Test Mark as Paid for invoices
- [ ] T172 [Testing] Test selection state persists during expand/collapse
- [ ] T173 [Testing] Test keyboard navigation through tabs
- [ ] T174 [Testing] Test animations are smooth (60fps)

---

## Dependency Graph

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundation (Zod Schema + Page State)
    │
    ├─────────────────────────────┬─────────────────────────────┐
    ▼                             ▼                             ▼
Phase 3: US1               Phase 4: US2                  Phase 5: US3
(VendorCardCollapsed)      (VendorTabs, Expanded)        (Hooks, AutoSave, Tabs)
    │                             │                             │
    └─────────────────────────────┴─────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              Phase 6: US4  Phase 7: US5  Phase 8: US6
              (Bulk)        (Select)      (Payments)
                    │             │             │
                    │             │             ▼
                    │             │       Phase 9: US7
                    │             │       (Invoices)
                    │             │             │
                    │             │             ▼
                    │             │       Phase 10: US8
                    │             │       (Contacts)
                    │             │             │
                    └─────────────┴─────────────┘
                                  │
                                  ▼
                          Phase 11: Integration
                                  │
                                  ▼
                          Phase 12: Polish
```

---

## Parallel Execution Opportunities

### Can Run in Parallel (No Dependencies)

**Within Phase 2:**
- T005-T017 (Zod Schema) || T018-T021 (Page State)

**Within Phase 3-5 (After Foundation):**
- T022-T034 (VendorCardCollapsed) || T035-T041 (VendorTabs) || T058-T061 (Hooks)

**Within Phase 6-10 (After US3):**
- T097-T102 (US4) || T103-T106 (US5) || T107-T120 (US6) || T121-T134 (US7) || T135-T144 (US8)

### Must Run Sequentially

- Phase 2 blocks Phase 3-5 (Foundation required first)
- T042-T057 (VendorCardExpanded, VendorCard) depends on T022-T041
- T068-T096 (Tab components) depends on T052-T054 (FormProvider setup)
- Phase 11 (Integration) depends on all component phases
- Phase 12 (Polish) depends on Phase 11

---

## Summary

| Category | Count |
|----------|-------|
| **Total Tasks** | 174 |
| **Setup Tasks** | 4 |
| **Foundation Tasks** | 17 |
| **US1 Tasks (P1)** | 13 |
| **US2 Tasks (P1)** | 23 |
| **US3 Tasks (P1)** | 39 |
| **US4 Tasks (P2)** | 6 |
| **US5 Tasks (P2)** | 4 |
| **US6 Tasks (P2)** | 14 |
| **US7 Tasks (P2)** | 14 |
| **US8 Tasks (P3)** | 10 |
| **Integration Tasks** | 6 |
| **Polish Tasks** | 24 |

| Priority | Count |
|----------|-------|
| **P1 (Must Have)** | 96 |
| **P2 (Should Have)** | 44 |
| **P3 (Nice to Have)** | 10 |
| **Polish** | 24 |
