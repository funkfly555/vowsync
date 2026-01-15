# Quickstart: Bar Order Management

**Feature Branch**: `012-bar-order-management`
**Created**: 2026-01-15
**Testing**: Manual testing with Playwright MCP

## Prerequisites

1. VowSync development environment running (`npm run dev`)
2. Authenticated user session
3. At least one wedding with:
   - Events created (for event linking)
   - Vendors created (for vendor linking)
   - Guests assigned to events (for adult count auto-population)

## Test Scenarios

### Scenario 1: View Empty Bar Orders List

**Steps**:
1. Navigate to `/weddings/:id/bar-orders`
2. Verify empty state displays with message and "Create Order" button

**Expected**:
- Empty state component visible
- Helpful message displayed
- "Create Bar Order" button accessible
- Page title shows "Bar Orders"

---

### Scenario 2: Create Bar Order with Event Linkage

**Steps**:
1. Click "Create Bar Order" button
2. Enter name: "Reception Bar"
3. Select an event from dropdown
4. Verify guest count auto-populates with adult guests from event
5. Verify duration auto-populates from event duration
6. Keep default consumption parameters (2hr @ 2, remainder @ 1)
7. Optionally select a vendor
8. Click "Create"

**Expected**:
- Modal opens with form
- Event dropdown shows available events
- Guest count updates when event selected
- Duration updates when event selected
- Total servings per person displays calculated value
- Order created with "draft" status
- Toast notification confirms creation
- Order appears in list with correct details

**Calculation Verification**:
- For 5-hour event: (2 × 2) + (3 × 1) = 7 servings/person

---

### Scenario 3: Create Bar Order with Custom Consumption Model

**Steps**:
1. Click "Create Bar Order" button
2. Enter name: "Cocktail Hour"
3. Enter guest count: 150
4. Enter duration: 2 hours
5. Set first hours: 1
6. Set first hours drinks/hr: 3
7. Set remaining hours drinks/hr: 2
8. Click "Create"

**Expected**:
- Total servings = (1 × 3) + (1 × 2) = 5 servings/person
- Order created successfully
- Card shows correct calculated value

---

### Scenario 4: Add Beverage Items

**Steps**:
1. Open an existing bar order (click card or detail link)
2. Click "Add Item" button
3. Enter: Wine, 40%, 4 servings/bottle, R150/bottle
4. Save and add another: Beer, 30%, 1 serving/bottle, R25/bottle
5. Save and add another: Spirits, 30%, 20 servings/bottle, R350/bottle

**Expected**:
- Items table displays all three items
- Calculated servings shown for each
- Units needed (rounded up) shown for each
- Total cost calculated for each
- Summary shows totals

**Calculation Verification** (assuming 7 servings/person, 150 guests):
- Wine: 7 × 0.40 × 150 = 420 servings → CEIL(420/4) = 105 bottles → R15,750
- Beer: 7 × 0.30 × 150 = 315 servings → 315 bottles → R7,875
- Spirits: 7 × 0.30 × 150 = 315 servings → CEIL(315/20) = 16 bottles → R5,600

---

### Scenario 5: Percentage Validation - Warning

**Steps**:
1. Open bar order with existing items
2. Adjust percentages to total 95%
3. Observe warning message
4. Save order

**Expected**:
- Warning displays: "Total is 95.0%. Should be 100%."
- Warning is yellow/orange styling
- Save is allowed (not blocked)
- Order saves successfully

---

### Scenario 6: Percentage Validation - Error

**Steps**:
1. Open bar order with existing items
2. Adjust percentages to total 85%
3. Attempt to save

**Expected**:
- Error displays: "Total percentage must be between 90% and 110%"
- Error is red styling
- Save button disabled or shows error
- Order does not save until fixed

---

### Scenario 7: Status Progression

**Steps**:
1. Create new bar order (starts as "draft")
2. Open order and change status to "confirmed"
3. Verify badge color changes to blue
4. Change status to "ordered"
5. Verify badge color changes to orange
6. Change status to "delivered"
7. Verify badge color changes to green

**Expected**:
| Status | Badge Color |
|--------|-------------|
| draft | gray |
| confirmed | blue |
| ordered | orange |
| delivered | green |

---

### Scenario 8: Edit Bar Order

**Steps**:
1. Open existing bar order
2. Click edit/pencil icon
3. Change name to "Updated Reception Bar"
4. Change guest count to 175
5. Save changes

**Expected**:
- Form pre-populates with existing values
- Changes save successfully
- Item calculations update with new guest count
- Toast confirms update

---

### Scenario 9: Delete Bar Order

**Steps**:
1. From list view, click delete icon on order
2. Confirmation dialog appears
3. Click "Delete" to confirm

**Expected**:
- Confirmation dialog shows order name
- Warning about deleting items included
- Order removed from list after confirmation
- Toast confirms deletion

---

### Scenario 10: Edit and Delete Items

**Steps**:
1. Open bar order detail page
2. Click edit icon on an item row
3. Change percentage from 40% to 45%
4. Save item
5. Click delete icon on another item
6. Confirm deletion

**Expected**:
- Item updates with new percentage
- Calculations update immediately
- Deleted item removed from table
- Summary totals recalculate

---

### Scenario 11: Order Summary Totals

**Steps**:
1. Create order with multiple items
2. View summary section

**Expected**:
- Total Units: Sum of all units_needed
- Total Cost: Sum of all total_cost (R X,XXX format)
- Percentage Total: Sum of all percentages (with warning if not 100%)

---

### Scenario 12: Mobile Responsive Layout

**Steps**:
1. Open DevTools and set viewport to 375px width
2. Navigate to bar orders list
3. Open a bar order detail page
4. Test all modals and forms

**Expected**:
- Cards stack in single column
- Items table scrolls horizontally or uses mobile layout
- Modals full-width with proper padding
- Forms usable with touch targets ≥44px
- No horizontal overflow on page

---

### Scenario 13: Edge Case - Zero Guest Count

**Steps**:
1. Create order with guest count = 0
2. Add items

**Expected**:
- Calculations result in 0 servings
- Units needed = 0 (not NaN or error)
- Cost = R0.00
- No errors or crashes

---

### Scenario 14: Edge Case - Duration Equals First Hours

**Steps**:
1. Create order with duration = 2 hours
2. Keep first_hours = 2 (default)

**Expected**:
- Remaining hours = 0
- Calculation: (2 × 2) + (0 × 1) = 4 servings/person
- No errors

---

### Scenario 15: Keyboard Navigation

**Steps**:
1. Navigate to bar orders page
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

## Quick Smoke Test

Minimum validation for feature completeness:

1. ✅ Navigate to `/weddings/:id/bar-orders` - page loads
2. ✅ Create bar order with event - order appears in list
3. ✅ Add 3 items with percentages totaling 100% - no warnings
4. ✅ Verify calculations match formulas - correct math
5. ✅ Change status draft → delivered - badges update
6. ✅ Mobile view - responsive layout works
7. ✅ Delete order - removed successfully

## Test Data Template

```json
{
  "barOrder": {
    "name": "Reception Bar",
    "guest_count_adults": 150,
    "event_duration_hours": 5,
    "first_hours": 2,
    "first_hours_drinks_per_hour": 2,
    "remaining_hours_drinks_per_hour": 1
  },
  "items": [
    { "item_name": "Red Wine", "percentage": 0.25, "servings_per_unit": 4, "cost_per_unit": 150 },
    { "item_name": "White Wine", "percentage": 0.15, "servings_per_unit": 4, "cost_per_unit": 120 },
    { "item_name": "Beer", "percentage": 0.30, "servings_per_unit": 1, "cost_per_unit": 25 },
    { "item_name": "Spirits", "percentage": 0.20, "servings_per_unit": 20, "cost_per_unit": 350 },
    { "item_name": "Soft Drinks", "percentage": 0.10, "servings_per_unit": 1, "cost_per_unit": 15 }
  ]
}
```

Expected calculations:
- Total servings/person: (2×2) + (3×1) = 7
- Total servings for wine (25%): 7 × 0.25 × 150 = 262.5 → 263 servings → 66 bottles
- Total servings for beer (30%): 7 × 0.30 × 150 = 315 → 315 bottles
- Total percentage: 100% ✓
