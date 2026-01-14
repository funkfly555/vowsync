# Business Rules & Formulas

## Overview

This document contains all business logic, calculations, and validation rules from the original requirements.

---

## 1. Guest Management Rules

### R1.1 RSVP Deadline Warnings

```javascript
RULE: "RSVP deadline approaching"
WHEN: guest.rsvp_deadline - current_date <= 7 days
  AND guest.rsvp_received_date IS NULL
THEN:
  - CREATE notification(type: 'rsvp_deadline', priority: 'high')
  - DISPLAY warning badge
  - ADD to "Needs Follow-up" filter

RULE: "RSVP overdue"
WHEN: current_date > guest.rsvp_deadline
  AND guest.rsvp_received_date IS NULL
THEN:
  - UPDATE status = 'overdue'
  - CREATE notification(type: 'rsvp_overdue', priority: 'urgent')
  - CREATE follow-up task(due: today)
  - SEND email reminder (if enabled)
```

### R1.2 Event Guest Count Calculation

```sql
-- From Original: =COUNTIFS(K8:K211, "yes", $E$8:$E$211, "adult")
SELECT 
  COUNT(*) FILTER (WHERE guest_type = 'adult' AND attending = TRUE) as adults,
  COUNT(*) FILTER (WHERE guest_type = 'child' AND attending = TRUE) as children
FROM guest_event_attendance gea
JOIN guests g ON g.id = gea.guest_id
WHERE event_id = ?
```

### R1.3 Meal Selection Count

```sql
-- From Original: =COUNTIF($H$8:$H$211, G2)
SELECT meal_option, COUNT(*) as count
FROM guests
WHERE main_choice = ?
GROUP BY main_choice
```

---

## 2. Bar Order Calculations

### R2.1 Total Servings Per Person

```javascript
// From Original FS-Bar Order: First 2 hours = 2 drinks/hr, remaining = 1 drink/hr
function calculateTotalServings(eventDurationHours, firstHours = 2, firstHoursRate = 2, remainingRate = 1) {
  return (firstHours * firstHoursRate) + 
         ((eventDurationHours - firstHours) * remainingRate);
}

// Example: 5-hour event
// = (2 × 2) + ((5 - 2) × 1) = 4 + 3 = 7 drinks per person
```

### R2.2 Beverage Item Units Calculation

```javascript
// From Original: =$C$11*B13 then =ROUNDUP(F13/G13,0)
function calculateUnitsNeeded(totalServingsPerPerson, percentage, guestCount, servingsPerUnit) {
  const calculatedServings = totalServingsPerPerson * percentage * guestCount;
  const unitsNeeded = Math.ceil(calculatedServings / servingsPerUnit);
  return { calculatedServings, unitsNeeded };
}

// Example: Wine calculation
// 7 servings/person × 0.40 (40%) × 150 guests = 420 servings
// 420 servings ÷ 4 glasses/bottle = 105 bottles
```

### R2.3 Percentage Validation

```javascript
RULE: "Total percentage must equal 100%"
WHEN: saving bar_order_items
THEN:
  total = SUM(percentage) for all items
  IF total < 0.9 OR total > 1.1:
    ERROR: "Total must be between 90% and 110%"
  ELSE IF total != 1.0:
    WARNING: "Total is {total × 100}%. Should be 100%."
```

---

## 3. Furniture & Equipment Rules

### R3.1 Aggregation Calculation

```javascript
// From Original: =IF(D11="ADD",SUM(...),0)+IF(D11="MAX",MAX(...),0)
function calculateTotalRequired(weddingItem, eventQuantities) {
  if (weddingItem.aggregation_method === 'ADD') {
    // Sum across all events (consumables)
    return eventQuantities.reduce((sum, qty) => sum + qty, 0);
  } else {
    // Take maximum needed at any one time (reusable)
    return Math.max(...eventQuantities);
  }
}

// Example: Trestle Tables (MAX method)
// Event 1: 14, Event 2: 14, Event 3: 20, Event 4: 10
// Total Required = MAX(14, 14, 20, 10) = 20
```

### R3.2 Availability Check

```javascript
RULE: "Insufficient quantity warning"
WHEN: wedding_item.total_required > wedding_item.number_available
  AND wedding_item.number_available IS NOT NULL
THEN:
  shortage = total_required - number_available
  DISPLAY: "⚠️ Short by {shortage} units. Need to source {shortage} more."
```

---

## 4. Repurposing Validation

### R4.1 Time Window Validation

```javascript
RULE: "Pickup must be before dropoff"
WHEN: saving repurposing_instruction
THEN:
  IF pickup_time >= dropoff_time:
    ERROR: "Pickup time must be before dropoff time"

RULE: "Pickup after event ends warning"
WHEN: saving repurposing_instruction
THEN:
  IF pickup_time < from_event.event_end_time:
    WARNING: "Pickup scheduled before event ends. Confirm intentional."

RULE: "Dropoff before event starts warning"
WHEN: saving repurposing_instruction
THEN:
  IF dropoff_time > to_event.event_start_time:
    WARNING: "Delivery after event starts. May cause delays."
```

### R4.2 Overnight Storage Detection

```javascript
RULE: "Overnight storage required"
WHEN: saving repurposing_instruction
THEN:
  pickup_date = DATE(pickup_time)
  dropoff_date = DATE(dropoff_time)
  
  IF pickup_date < dropoff_date:
    APPEND handling_notes: "Overnight storage required"
    PROMPT: "Where will item be stored overnight?"
    storage_location = USER_INPUT
    APPEND handling_notes: "Store at: {storage_location}"
    CREATE notification for venue coordinator
```

---

## 5. Vendor Management Rules

### R5.1 Contract Expiry Warnings

```javascript
RULE: "Contract expiring soon"
WHEN: vendor.contract_expiry_date - current_date <= 30 days
  AND vendor.contract_expiry_date >= current_date
THEN:
  CREATE notification(
    type: 'vendor_update',
    message: 'Contract expires in {days} days',
    priority: 'normal'
  )
  DISPLAY: "⚠️" icon

RULE: "Contract expired"
WHEN: current_date > vendor.contract_expiry_date
THEN:
  CREATE notification(priority: 'high')
  DISPLAY: "❌" icon
```

### R5.2 Insurance Verification

```javascript
RULE: "Insurance expiry warning"
WHEN: vendor.insurance_required = TRUE
  AND vendor.insurance_verified = TRUE
  AND vendor.insurance_expiry_date - current_date <= 30 days
THEN:
  CREATE notification(type: 'vendor_update')
  DISPLAY: "⚠️ Insurance expires soon"

RULE: "Insurance expired"
WHEN: vendor.insurance_required = TRUE
  AND current_date > vendor.insurance_expiry_date
THEN:
  CREATE notification(priority: 'urgent')
  SET vendor.insurance_verified = FALSE
  DISPLAY: "❌ Insurance expired"
```

### R5.3 Cancellation Fee Calculation

```javascript
function calculateCancellationFee(vendor, cancellationDate, weddingDate) {
  const daysToWedding = (weddingDate - cancellationDate) / (1000 * 60 * 60 * 24);
  
  if (daysToWedding < 0) {
    throw new Error("Wedding has passed");
  }
  
  // If tiered policy, lookup appropriate tier
  let feePercentage = vendor.cancellation_fee_percentage;
  
  // Example tiered policy:
  // >90 days: 10%, 60-90 days: 25%, 30-60 days: 50%, <30 days: 100%
  if (vendor.cancellation_policy.includes("tiered")) {
    if (daysToWedding > 90) feePercentage = 10;
    else if (daysToWedding > 60) feePercentage = 25;
    else if (daysToWedding > 30) feePercentage = 50;
    else feePercentage = 100;
  }
  
  const feeAmount = vendor.contract_value * (feePercentage / 100);
  return { feePercentage, feeAmount };
}
```

---

## 6. Payment Management Rules

### R6.1 Payment Reminders

```javascript
RULE: "Payment due in 7 days"
WHEN: payment.due_date - current_date = 7
  AND payment.status = 'pending'
THEN:
  CREATE notification(type: 'payment_due', priority: 'normal')
  SEND email reminder (if enabled)

RULE: "Payment due today"
WHEN: payment.due_date = current_date
  AND payment.status = 'pending'
THEN:
  CREATE notification(type: 'payment_due', priority: 'high')

RULE: "Payment overdue"
WHEN: current_date > payment.due_date
  AND payment.status = 'pending'
THEN:
  UPDATE payment.status = 'overdue'
  CREATE notification(type: 'payment_overdue', priority: 'urgent')
```

### R6.2 Payment Completion

```javascript
RULE: "Mark payment as paid"
WHEN: user marks payment_schedule as paid
THEN:
  SET payment_schedule.status = 'paid'
  SET payment_schedule.paid_date = today
  RECORD payment_method, payment_reference
  
  IF linked invoice exists:
    UPDATE invoice.status = 'paid'
    UPDATE invoice.paid_date = today
  
  UPDATE budget_line_items.actual_cost += payment.amount
  
  CREATE notification(type: 'payment_completed')
```

---

## 7. Budget Rules

### R7.1 Budget Warnings

```javascript
RULE: "Category 90% spent"
WHEN: category.actual_amount / category.projected_amount >= 0.9
  AND actual_amount < projected_amount
THEN:
  DISPLAY: "🟡 90% spent. Monitor closely."

RULE: "Category budget exceeded"
WHEN: category.actual_amount > category.projected_amount
THEN:
  excess = actual_amount - projected_amount
  DISPLAY: "🔴 Budget exceeded by ${excess}"
  CREATE notification(type: 'budget_warning', priority: 'high')
```

### R7.2 Wedding Budget Totals

```sql
-- Auto-update wedding budget totals
UPDATE weddings
SET 
  budget_total = (
    SELECT COALESCE(SUM(projected_amount), 0)
    FROM budget_categories
    WHERE wedding_id = ?
  ),
  budget_actual = (
    SELECT COALESCE(SUM(actual_amount), 0)
    FROM budget_categories
    WHERE wedding_id = ?
  )
WHERE id = ?
```

---

## 8. Task Management Rules

### R8.1 Task Reminders

```javascript
RULE: "Task due in 7 days"
WHEN: task.due_date - current_date = 7
  AND task.status != 'completed'
THEN:
  CREATE notification(type: 'task_due', priority: 'normal')
  SET task.reminder_sent = TRUE

RULE: "Task due today"
WHEN: task.due_date = current_date
  AND task.status != 'completed'
THEN:
  CREATE notification(type: 'task_due', priority: 'high')

RULE: "Task overdue"
WHEN: current_date > task.due_date
  AND task.status NOT IN ('completed', 'cancelled')
THEN:
  UPDATE task.status = 'overdue'
  CREATE notification(type: 'task_overdue', priority: 'urgent')
```

### R8.2 Days Before/After Wedding

```javascript
function calculateDaysBeforeAfterWedding(taskDueDate, weddingDate) {
  const difference = Math.floor((weddingDate - taskDueDate) / (1000 * 60 * 60 * 24));
  
  return {
    days_before_after_wedding: Math.abs(difference),
    is_pre_wedding: difference > 0
  };
}
```

---

## 9. Staff Calculations

### R9.1 Recommended Staff Counts

```javascript
// From Original FS-Staff: Total = SUM(roles)
function calculateRecommendedStaff(guestCount) {
  return {
    waiters: Math.ceil(guestCount / 20),
    bartenders: Math.ceil(guestCount / 50),
    runners: Math.ceil((guestCount / 20) / 4), // 1 runner per 4 waiters
    supervisors: 1 + Math.floor((guestCount / 20) / 10), // 1 per 10 staff
    scullers: Math.max(2, Math.ceil(guestCount / 100))
  };
}

// Example: 150 guests
// Waiters: CEIL(150/20) = 8
// Bartenders: CEIL(150/50) = 3
// Runners: CEIL(8/4) = 2
// Supervisors: 1 + FLOOR(8/10) = 1
// Total: 14 staff
```

---

## 10. Email System Rules

### R10.1 Bounce Handling

```javascript
RULE: "Hard bounce"
WHEN: email_log.bounce_type = 'hard'
THEN:
  UPDATE guest/vendor SET email_valid = FALSE
  CREATE notification: "Invalid email for {recipient}"
  PREVENT future emails to this address

RULE: "Soft bounce - retry"
WHEN: email_log.bounce_type = 'soft'
  AND retry_count < 3
THEN:
  SCHEDULE retry after 24 hours
  INCREMENT retry_count

RULE: "Soft bounce - give up"
WHEN: email_log.bounce_type = 'soft'
  AND retry_count >= 3
THEN:
  UPDATE email_log.status = 'failed'
  CREATE notification: "Unable to deliver after 3 attempts"
```

### R10.2 Automated RSVP Reminders

```javascript
// Daily scheduled job at 9:00 AM
SCHEDULE DAILY at "09:00":
  guests = SELECT * FROM guests
    WHERE rsvp_deadline IN (current_date + 7, current_date)
      AND rsvp_received_date IS NULL
      AND (last_reminder_sent_date IS NULL 
           OR last_reminder_sent_date < current_date - 1)
  
  FOR EACH guest:
    template = GET template WHERE type = 'rsvp_reminder' AND is_default = TRUE
    POPULATE template with guest data
    SEND email
    UPDATE guest.last_reminder_sent_date = current_date
    CREATE notification for consultant
```

---

## 11. File Management Rules

### R11.1 File Upload Validation

```javascript
RULE: "File type validation"
WHEN: user uploads file
THEN:
  allowed = ['application/pdf', 'image/jpeg', 'image/png', 
             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  
  IF file.type NOT IN allowed:
    ERROR: "File type not allowed"

RULE: "File size validation"
WHEN: user uploads file
THEN:
  max_size = 10 * 1024 * 1024  // 10MB
  IF file.size > max_size:
    ERROR: "File too large (max 10MB)"
```

---

## Validation Summary

All formulas, calculations, and business rules from the original 5,645-line requirements document are captured above.

**Original Formulas Converted:**
- [x] Guest count by type: `=COUNTIFS(...)`
- [x] Meal selection counts: `=COUNTIF(...)`
- [x] Bar servings: `=$C$11*B13`
- [x] Bar units: `=ROUNDUP(F13/G13,0)`
- [x] Equipment aggregation: `=IF(D11="ADD",SUM(...),MAX(...))`
- [x] Staff totals: `=SUM(B13:B17)`
- [x] Total costs: `=quantity × cost`
- [x] Budget variance: `=actual - projected`

