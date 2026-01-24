# Feature Specification: Budget-Vendor Integration with Automatic Tracking

**Feature Branch**: `029-budget-vendor-integration`
**Created**: 2026-01-24
**Status**: Draft
**Input**: User description: "Budget-Vendor Integration with Automatic Tracking - Automatic synchronization of vendor invoices and payments with the wedding budget system"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Invoice Creation with Budget Integration (Priority: P1)

As a wedding consultant, I need invoices I create for vendors to automatically create corresponding budget line items, so my projected budget reflects all committed vendor costs without manual data entry.

**Why this priority**: This is the foundation of the integration - without invoice-to-budget linking, no automatic tracking is possible. It eliminates the primary pain point of manual budget updates.

**Independent Test**: Can be fully tested by creating an invoice for a vendor and verifying a budget line item appears in the linked budget category with correct projected cost.

**Acceptance Scenarios**:

1. **Given** a vendor with a default budget category assigned, **When** I create an invoice for R10,000 (excl. VAT), **Then** a budget line item is created with projected_cost = R11,500 (incl. 15% VAT) and the budget category's projected_amount increases by R11,500
2. **Given** I am creating an invoice, **When** I open the Add Invoice modal, **Then** I see a budget category dropdown pre-filled with the vendor's default category
3. **Given** a vendor provides multiple services (e.g., catering and bar), **When** I create an invoice, **Then** I can override the default budget category to allocate the invoice to a different category
4. **Given** an invoice is created, **When** I view the budget page, **Then** the wedding's total projected budget reflects the new invoice amount

---

### User Story 2 - Payment Recording with Budget Updates (Priority: P1)

As a wedding consultant, I need payments I record against invoices to automatically update my budget's actual spending, so I can track what has been paid versus what is still committed.

**Why this priority**: Tied with P1 - without payment tracking, the budget only shows projections. This completes the financial tracking loop and provides real-time spending visibility.

**Independent Test**: Can be fully tested by recording a payment against an existing invoice and verifying the budget line item's actual_cost and category's actual_amount are updated.

**Acceptance Scenarios**:

1. **Given** an invoice of R11,500 with an associated budget line item, **When** I record a full payment of R11,500, **Then** the budget line item's actual_cost becomes R11,500, payment_status becomes 'paid', and the budget category's actual_amount increases by R11,500
2. **Given** an invoice of R11,500, **When** I record a partial payment of R5,000, **Then** the invoice status becomes 'partially_paid', the budget line item's actual_cost becomes R5,000, and payment_status becomes 'partially_paid'
3. **Given** I am about to record a payment, **When** I view the payment modal, **Then** I see a preview showing how this payment will impact the budget category (current actual → new actual)
4. **Given** a payment is recorded, **When** I view the wedding dashboard, **Then** the wedding's budget_actual reflects the new total of all actual spending

---

### User Story 3 - Budget Category Setup with Predefined Types (Priority: P2)

As a wedding consultant, I need to select from predefined wedding category types when creating budget categories, so I can organize my budget consistently and link vendors to appropriate categories.

**Why this priority**: Provides the organizational structure that enables vendor-budget linking. Required before vendors can be assigned default categories.

**Independent Test**: Can be fully tested by creating a new budget category, selecting from the dropdown of 18 predefined types, and verifying the category is created with the correct type.

**Acceptance Scenarios**:

1. **Given** I am creating a new budget category, **When** I open the dropdown, **Then** I see 18 predefined category types sorted by display order (Venue, Catering, Photography, etc.)
2. **Given** my category doesn't match any predefined type, **When** I select "Other/Custom", **Then** I am prompted to enter a custom category name
3. **Given** budget categories exist, **When** I view the budget page, **Then** categories are sorted by their type's display order for consistent organization
4. **Given** I select "Other/Custom", **When** I leave the custom name blank, **Then** I see a validation error requiring a custom name

---

### User Story 4 - Vendor Budget Category Assignment (Priority: P2)

As a wedding consultant, I need to assign a default budget category to each vendor, so their invoices are automatically allocated to the correct budget category.

**Why this priority**: Enables the automatic pre-filling of budget category when creating invoices, reducing friction and errors.

**Independent Test**: Can be fully tested by editing a vendor, selecting a budget category from the dropdown, saving, and verifying the assignment persists.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a vendor, **When** I view the form, **Then** I see a "Default Budget Category" dropdown populated with my wedding's budget categories
2. **Given** I assign "Catering" as a vendor's default category, **When** I create an invoice for that vendor, **Then** the budget category dropdown is pre-filled with "Catering"
3. **Given** a vendor has an assigned budget category, **When** I view the vendor card, **Then** I see a badge or indicator showing which budget category the vendor is linked to

---

### User Story 5 - Enhanced Budget Display (Priority: P3)

As a wedding consultant, I need to see a breakdown of projected, actual (paid), invoiced unpaid, and remaining budget amounts, so I can understand my complete financial picture at a glance.

**Why this priority**: Provides visibility into the full financial state. Builds on top of P1 and P2 functionality to surface the integrated data meaningfully.

**Independent Test**: Can be fully tested by creating invoices and payments, then verifying the budget display shows correct breakdowns of all amounts.

**Acceptance Scenarios**:

1. **Given** a budget category with invoices totaling R50,000 and payments of R20,000, **When** I view the category, **Then** I see: Projected: R50,000 | Actual (Paid): R20,000 (40%) | Invoiced Unpaid: R30,000 | Remaining: R0
2. **Given** a budget category, **When** I view it, **Then** I see a progress bar showing percentage of projected budget that has been paid
3. **Given** actual spending reaches 90% of projected, **When** I view the budget category, **Then** I see a warning indicator
4. **Given** actual spending exceeds projected, **When** I view the budget category, **Then** I see an over-budget alert in red

---

### User Story 6 - Invoice Deletion with Budget Cleanup (Priority: P3)

As a wedding consultant, when I delete an invoice, I need the associated budget line item to be automatically removed and totals recalculated, so my budget remains accurate.

**Why this priority**: Ensures data integrity when corrections are made. Important for maintaining trust in the system, but less common than creation flows.

**Independent Test**: Can be fully tested by creating an invoice, verifying budget impact, deleting the invoice, and confirming budget totals are restored.

**Acceptance Scenarios**:

1. **Given** an invoice with an associated budget line item, **When** I delete the invoice, **Then** the budget line item is also deleted
2. **Given** an invoice of R10,000 is deleted, **When** I view the budget category, **Then** the projected_amount is reduced by R10,000
3. **Given** a partially paid invoice is deleted, **When** I view the budget category, **Then** both projected_amount and actual_amount are reduced appropriately

---

### Edge Cases

- What happens when a vendor has no default budget category assigned?
  - Invoice creation still works, but budget category dropdown is empty and user must manually select one
- How does the system handle invoices created before budget integration was implemented?
  - Existing invoices remain as-is without budget line items; only new invoices trigger budget integration
- What happens if a budget category is deleted that has linked invoices?
  - Budget line items' category_id is set to NULL; invoices retain their data but lose budget tracking
- How does the system handle currency formatting for edge values?
  - All values use South African Rand (ZAR) with 2 decimal places, supporting values from R0.01 to R999,999,999.99
- What happens if a payment exceeds the remaining invoice balance?
  - Payment amount is validated to not exceed (invoice_total - already_paid); validation error shown if exceeded

## Requirements *(mandatory)*

### Functional Requirements

**Budget Category Types:**
- **FR-001**: System MUST provide 18 predefined wedding budget category types (Venue, Catering, Photography, Videography, Flowers & Florist, Music/DJ/Band, Cake & Desserts, Stationery & Invitations, Hair & Makeup, Transportation, Accommodation, Decor & Styling, Rentals & Equipment, Wedding Planner/Coordinator, Attire, Rings, Favors & Gifts, Other/Custom)
- **FR-002**: System MUST display category types sorted by a consistent display order
- **FR-003**: System MUST require a custom name when "Other/Custom" type is selected

**Budget Category Management:**
- **FR-004**: System MUST allow users to create budget categories by selecting a category type
- **FR-005**: System MUST display projected_amount, actual_amount, invoiced unpaid, and remaining budget for each category
- **FR-006**: System MUST calculate variance as (actual_amount - projected_amount)

**Vendor-Budget Linking:**
- **FR-007**: System MUST allow assigning a default budget category to each vendor
- **FR-008**: System MUST display the assigned budget category on the vendor card
- **FR-009**: System MUST populate budget category options from the wedding's existing budget categories

**Invoice-Budget Integration:**
- **FR-010**: System MUST display a budget category selector when creating an invoice
- **FR-011**: System MUST pre-fill the budget category with the vendor's default category (if assigned)
- **FR-012**: System MUST allow overriding the default budget category per invoice
- **FR-013**: System MUST create a budget line item when an invoice is created with: vendor_id, vendor_invoice_id, projected_cost = invoice total, actual_cost = 0, payment_status = 'unpaid'
- **FR-014**: System MUST recalculate budget_categories.projected_amount as SUM of linked line items' projected_cost
- **FR-015**: System MUST recalculate weddings.budget_total as SUM of all category projected_amounts

**Payment-Budget Integration:**
- **FR-016**: System MUST update budget line item's actual_cost when a payment is recorded
- **FR-017**: System MUST update budget line item's payment_status to match invoice status (unpaid/partially_paid/paid)
- **FR-018**: System MUST recalculate budget_categories.actual_amount as SUM of linked line items' actual_cost
- **FR-019**: System MUST recalculate weddings.budget_actual as SUM of all category actual_amounts
- **FR-020**: System MUST display budget impact preview when recording a payment

**Budget Display:**
- **FR-021**: System MUST calculate Invoiced Unpaid as (invoice.total - line_item.actual_cost) for unpaid/partially_paid invoices
- **FR-022**: System MUST calculate Total Committed as (Actual + Invoiced Unpaid)
- **FR-023**: System MUST calculate Remaining as (Projected - Total Committed)
- **FR-024**: System MUST display percentage of projected budget spent
- **FR-025**: System MUST show warning when spending reaches 90% of projected
- **FR-026**: System MUST show over-budget alert when actual exceeds projected

**Data Integrity:**
- **FR-027**: System MUST delete associated budget line item when an invoice is deleted
- **FR-028**: System MUST recalculate category and wedding totals after invoice deletion
- **FR-029**: System MUST validate payment amount does not exceed invoice balance
- **FR-030**: System MUST ensure budget category names are unique within a wedding
- **FR-031**: System MUST format all monetary values in South African Rand (ZAR) with 2 decimal places
- **FR-032**: System MUST calculate VAT at 15% (vat_amount = amount * 0.15)

### Key Entities

- **BudgetCategoryType**: Predefined category template with name and display order (18 types). Used to standardize budget organization across weddings.
- **BudgetCategory**: Wedding-specific budget allocation linked to a category type. Tracks projected and actual amounts with auto-calculated variance.
- **BudgetLineItem**: Individual cost entry linking a budget category to a vendor invoice. Tracks projected_cost (from invoice), actual_cost (from payments), and payment_status.
- **Vendor**: Extended with default_budget_category relationship for automatic invoice allocation.
- **VendorInvoice**: Existing entity - no changes. Now has implicit 1:1 relationship with BudgetLineItem via vendor_invoice_id.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Wedding consultants can create an invoice and see the budget updated within 2 seconds without any manual budget entry
- **SC-002**: Recording a payment automatically updates both the invoice status and budget actuals within 2 seconds
- **SC-003**: Budget totals remain accurate after any create/update/delete operation on invoices or payments (100% accuracy)
- **SC-004**: Users can view a complete financial picture (projected, paid, unpaid, remaining) for each budget category on a single screen
- **SC-005**: 90% of invoices are created with a pre-filled budget category (from vendor default), reducing data entry time
- **SC-006**: Budget warnings appear correctly when spending reaches 90% or exceeds projected amounts
- **SC-007**: Deleting an invoice automatically restores budget totals without manual correction
- **SC-008**: All monetary values display consistently in South African Rand (ZAR) format throughout the application

## Assumptions

- Existing invoices created before this feature will not have budget line items; the integration applies to new invoices only
- Users will create budget categories before attempting to link vendors to them
- The 15% VAT rate is fixed for all invoices (South African standard)
- Budget categories use the wedding's currency (ZAR) without multi-currency support
- Payment amounts are validated client-side before submission to prevent over-payment
- The 18 predefined category types cover the majority of wedding vendor categories; edge cases use "Other/Custom"

## Out of Scope

- Data migration tool for linking existing invoices to budget line items
- Budget vs Actual comparison charts and visualizations
- Forecast remaining budget based on spending rate
- Multi-currency support
- Export budget reports to PDF/Excel
- Bulk invoice creation or bulk payment recording
- Recurring invoice templates
