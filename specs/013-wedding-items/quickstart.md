# Quickstart: Wedding Items Management

**Feature Branch**: `013-wedding-items`
**Created**: 2026-01-16
**Testing**: Manual testing with Playwright MCP

## Prerequisites

1. VowSync development environment running (`npm run dev`)
2. Authenticated user session
3. At least one wedding with:
   - Events created (for event quantity assignment)

## Test Scenarios

### Scenario 1: View Empty Items List

**Steps**:
1. Navigate to `/weddings/:id/items`
2. Verify empty state displays with message and "Add Item" button

**Expected**:
- Empty state component visible
- Helpful message displayed
- "Add Item" button accessible
- Page title shows "Items"

---

### Scenario 2: Create Wedding Item with MAX Aggregation

**Steps**:
1. Click "Add Item" button
2. Select category: "Tables" (or enter custom)
3. Enter description: "Trestle Tables 6ft"
4. Leave aggregation method as "MAX" (default)
5. Enter number available: 25
6. Enter cost per unit: 50
7. Enter supplier name: "ABC Rentals"
8. Click "Save"

**Expected**:
- Modal opens with form
- Category shows suggestions and allows custom input
- Aggregation method defaults to MAX (blue badge preview)
- Item created and appears in list
- Toast notification confirms creation
- total_required shows 0 (no event quantities yet)

---

### Scenario 3: Create Wedding Item with ADD Aggregation

**Steps**:
1. Click "Add Item" button
2. Select category: "Linens"
3. Enter description: "White Napkins"
4. Change aggregation method to "ADD"
5. Enter number available: 500
6. Enter cost per unit: 5
7. Click "Save"

**Expected**:
- ADD aggregation shows orange badge preview
- Tooltip/help text explains ADD sums all event quantities
- Item created with ADD method

---

### Scenario 4: Add Event Quantities (MAX Method)

**Steps**:
1. Click on "Trestle Tables 6ft" item to open detail/edit view
2. See event quantities table with all wedding events
3. Enter quantity for Event 1 (Ceremony): 14
4. Enter quantity for Event 2 (Reception): 20
5. Enter quantity for Event 3 (After-party): 10
6. Save changes

**Expected**:
- Event quantities table shows all events with date
- As quantities are entered, total_required updates in real-time
- For MAX: total_required = 20 (maximum of 14, 20, 10)
- The row with quantity 20 (Reception) is highlighted
- total_cost calculates: 20 × 50 = R1,000

**Calculation Verification**:
- MAX(14, 20, 10) = 20 total required

---

### Scenario 5: Add Event Quantities (ADD Method)

**Steps**:
1. Click on "White Napkins" item
2. Enter quantity for Event 1 (Ceremony): 200
3. Enter quantity for Event 2 (Reception): 150
4. Enter quantity for Event 3 (After-party): 180
5. Save changes

**Expected**:
- For ADD: total_required = 530 (200 + 150 + 180)
- No row highlighted (ADD doesn't have a "winning" row)
- total_cost calculates: 530 × 5 = R2,650

**Calculation Verification**:
- ADD: 200 + 150 + 180 = 530 total required

---

### Scenario 6: View Availability Status - Sufficient

**Steps**:
1. View "Trestle Tables 6ft" in list (available=25, required=20)

**Expected**:
- Green "✅ 25 available" badge/status
- Sufficient status indicator

---

### Scenario 7: View Availability Status - Shortage

**Steps**:
1. View "White Napkins" in list (available=500, required=530)

**Expected**:
- Orange "⚠️ Short by 30" badge/status
- Shortage warning indicator
- Shortage count visible

---

### Scenario 8: View Availability Status - Unknown

**Steps**:
1. Create new item without setting number_available
2. View item in list

**Expected**:
- Gray "❓ Availability not set" badge/status
- Unknown status indicator

---

### Scenario 9: Change Aggregation Method

**Steps**:
1. Open "Trestle Tables 6ft" item (currently MAX with quantities 14, 20, 10)
2. Change aggregation method from MAX to ADD
3. Save changes

**Expected**:
- total_required recalculates: 14 + 20 + 10 = 44
- total_cost recalculates: 44 × 50 = R2,200
- Badge changes from blue (MAX) to orange (ADD)
- Row highlighting removed (ADD doesn't highlight)

---

### Scenario 10: Filter by Category

**Steps**:
1. Create items in categories: "Tables", "Chairs", "Linens"
2. Use category filter dropdown
3. Select "Tables"

**Expected**:
- Filter dropdown shows unique categories from items
- Only table items displayed after filtering
- Item count updates to show filtered count

---

### Scenario 11: Filter by Supplier

**Steps**:
1. Create items with suppliers: "ABC Rentals", "XYZ Decor"
2. Use supplier filter dropdown
3. Select "ABC Rentals"

**Expected**:
- Filter dropdown shows unique suppliers
- Only items from ABC Rentals displayed
- Can combine with category filter

---

### Scenario 12: Clear Filters

**Steps**:
1. Apply category and/or supplier filters
2. Click "Clear filters" button

**Expected**:
- All filters reset
- All items displayed
- Filter dropdowns reset to "All"

---

### Scenario 13: View Summary Statistics

**Steps**:
1. Create multiple items with costs
2. View summary section at top of list

**Expected**:
- Total Items count
- Total Cost (sum of all total_cost values)
- Items with shortage count (orange warning indicator)
- Items with sufficient availability count
- Items with unknown availability count

---

### Scenario 14: Edit Wedding Item

**Steps**:
1. Click edit on existing item
2. Change description to "Updated Table Description"
3. Change cost_per_unit to 55
4. Save changes

**Expected**:
- Form pre-populates with existing values
- Changes save successfully
- total_cost recalculates with new cost
- Toast confirms update

---

### Scenario 15: Delete Wedding Item

**Steps**:
1. Click delete icon on an item
2. Confirmation dialog appears
3. Click "Delete" to confirm

**Expected**:
- Confirmation dialog shows item description
- Warning about deleting event quantities included
- Item removed from list after confirmation
- Toast confirms deletion
- Summary statistics update

---

### Scenario 16: Cost Display Without cost_per_unit

**Steps**:
1. Create item without entering cost_per_unit
2. View item in list

**Expected**:
- total_cost shows as "-" or "Not set"
- Item still functions normally
- Summary excludes from total cost calculation

---

### Scenario 17: Event Breakdown Display (MAX Highlighting)

**Steps**:
1. Open item with MAX aggregation and quantities [14, 20, 10]
2. View event breakdown table

**Expected**:
- Reception row (quantity 20) highlighted with special background
- Clear indicator this is the "determining" quantity
- Footer shows: "Total (MAX): 20"

---

### Scenario 18: Event Breakdown Display (ADD)

**Steps**:
1. Open item with ADD aggregation and quantities [200, 150, 180]
2. View event breakdown table

**Expected**:
- No row highlighting (all contribute equally)
- Footer shows: "Total (ADD): 530"
- Each quantity clearly visible

---

### Scenario 19: Inline Quantity Editing

**Steps**:
1. Open item detail view
2. Click on quantity field for an event
3. Change value from 20 to 25
4. Tab out or click away

**Expected**:
- Quantity updates immediately
- total_required recalculates in real-time
- total_cost recalculates in real-time
- No need to click separate save button

---

### Scenario 20: Mobile Responsive Layout

**Steps**:
1. Open DevTools and set viewport to 375px width
2. Navigate to items list
3. Open an item detail view
4. Test add/edit modals

**Expected**:
- Items display in single column
- Event quantities table scrolls horizontally or uses mobile layout
- Modals full-width with proper padding
- Forms usable with touch targets ≥44px
- No horizontal overflow on page

---

### Scenario 21: Keyboard Navigation

**Steps**:
1. Navigate to items page
2. Use Tab to move through interactive elements
3. Use Enter to activate buttons
4. Use Tab in modal forms
5. Use Escape to close modals

**Expected**:
- All interactive elements focusable
- Focus indicators visible (2px brand-primary outline)
- Enter activates buttons and links
- Escape closes modals
- Tab order logical (left-to-right, top-to-bottom)

---

### Scenario 22: Edge Case - All Quantities Zero

**Steps**:
1. Create item with MAX aggregation
2. Set all event quantities to 0

**Expected**:
- total_required = 0
- total_cost = 0 (if cost_per_unit set)
- Availability status shows correctly (if number_available set)
- No errors or crashes

---

### Scenario 23: Edge Case - No Events Exist

**Steps**:
1. Navigate to wedding with no events
2. Create wedding item
3. View event quantities section

**Expected**:
- Message indicating no events available
- total_required remains 0
- Link/suggestion to create events first

---

### Scenario 24: Edge Case - Event Deleted with Quantities

**Steps**:
1. Create item with event quantities
2. Delete one of the events (via Events page)
3. Return to Items page

**Expected**:
- Event quantities for deleted event are cascade deleted
- total_required recalculates automatically
- Item still displays correctly
- No orphaned data

---

## Quick Smoke Test

Minimum validation for feature completeness:

1. ✅ Navigate to `/weddings/:id/items` - page loads
2. ✅ Create item with MAX aggregation - item appears in list
3. ✅ Add event quantities [14, 20, 10] - total shows 20
4. ✅ Create item with ADD aggregation - item appears
5. ✅ Add event quantities [200, 150, 180] - total shows 530
6. ✅ Verify availability statuses display correctly
7. ✅ Filter by category - only matching items shown
8. ✅ Summary shows correct totals
9. ✅ Mobile view - responsive layout works
10. ✅ Delete item - removed successfully

---

## Test Data Template

```json
{
  "items": [
    {
      "category": "Tables",
      "description": "Trestle Tables 6ft",
      "aggregation_method": "MAX",
      "number_available": 25,
      "cost_per_unit": 50,
      "supplier_name": "ABC Rentals",
      "event_quantities": {
        "ceremony": 14,
        "reception": 20,
        "after_party": 10
      }
    },
    {
      "category": "Chairs",
      "description": "White Chiavari Chairs",
      "aggregation_method": "MAX",
      "number_available": 200,
      "cost_per_unit": 15,
      "supplier_name": "ABC Rentals",
      "event_quantities": {
        "ceremony": 150,
        "reception": 175,
        "after_party": 100
      }
    },
    {
      "category": "Linens",
      "description": "White Napkins",
      "aggregation_method": "ADD",
      "number_available": 500,
      "cost_per_unit": 5,
      "supplier_name": "XYZ Decor",
      "event_quantities": {
        "ceremony": 200,
        "reception": 150,
        "after_party": 180
      }
    }
  ]
}
```

**Expected Calculations**:

| Item | Method | Quantities | Total | Available | Status | Cost |
|------|--------|------------|-------|-----------|--------|------|
| Trestle Tables | MAX | 14, 20, 10 | 20 | 25 | ✅ Sufficient | R1,000 |
| Chiavari Chairs | MAX | 150, 175, 100 | 175 | 200 | ✅ Sufficient | R2,625 |
| White Napkins | ADD | 200, 150, 180 | 530 | 500 | ⚠️ Short by 30 | R2,650 |

**Summary**:
- Total Items: 3
- Total Cost: R6,275
- Shortage Count: 1
- Sufficient Count: 2
