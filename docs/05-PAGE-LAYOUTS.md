# Page Layouts & UI Specifications

## Overview

This document provides detailed wireframes and specifications for every page in the application.

**Design Principles:**
- Mobile-first responsive design
- Card-based layouts
- Clear visual hierarchy
- Minimum 44px touch targets
- 16px minimum font size

---

## 1. Authentication Pages

### 1.1 Login Page

```
+----------------------------------------------------+
|                    [LOGO - Centered]                |
|              Welcome to Wedding Planner             |
|                                                    |
|  Email:    [___________________________________]   |
|  Password: [___________________________________] 👁️ |
|                                                    |
|  [x] Remember Me                                   |
|                                                    |
|  [           Login Button (Primary)           ]    |
|                                                    |
|  Forgot Password? | Create Account                 |
+----------------------------------------------------+
```

**Elements:**
- Logo: SVG, centered, 120px height
- Form: Max-width 400px, centered
- Inputs: Height 48px, border-radius 6px
- Button: Full width, height 48px, brand primary color
- Links: Text-only, brand primary color

**Mobile (< 768px):**
- Padding: 24px
- Full-width form
- Stacked layout

---

### 1.2 Register Page

```
+----------------------------------------------------+
|                    [LOGO]                          |
|             Create Your Account                    |
|                                                    |
|  Full Name*:     [_____________________________]   |
|  Email*:         [_____________________________]   |
|  Phone:          [_____________________________]   |
|  Company:        [_____________________________]   |
|  Password*:      [_____________________________] 👁️ |
|  Confirm Pass*:  [_____________________________] 👁️ |
|                                                    |
|  [x] I agree to Terms & Conditions                 |
|                                                    |
|  [        Create Account (Primary)        ]        |
|                                                    |
|  Already have an account? Login                    |
+----------------------------------------------------+
```

---

## 2. Main Application Shell

### 2.1 Desktop Layout (>= 1024px)

```
+----------------------------------------------------------------+
| [Logo] Wedding Planner         [🔔 3]  [👤 Profile ▼]         |
+----------+-----------------------------------------------------+
| SIDEBAR  |                                                     |
| (240px)  |          MAIN CONTENT AREA                          |
|          |          (Max-width: 1400px)                        |
| 🏠 Home   |                                                     |
| 👥 Guests |                                                     |
| 🤝 Vendors|                                                     |
| 📅 Events |                                                     |
| 🪑 Items  |                                                     |
| 💰 Budget |                                                     |
| ✓ Tasks  |                                                     |
| 📄 Docs   |                                                     |
|          |                                                     |
| ⚙️ Settings|                                                    |
| 🚪 Logout |                                                     |
+----------+-----------------------------------------------------+
```

**Sidebar:**
- Width: 240px fixed
- Background: Surface color (#F5F5F5)
- Active item: Brand primary background, white text
- Hover: Lighten background

**Header:**
- Height: 64px
- Background: White
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Fixed position

**Main Content:**
- Padding: 32px
- Max-width: 1400px
- Centered

---

### 2.2 Mobile Layout (< 768px)

```
+--------------------------------+
| [☰]  Wedding Planner  [🔔][👤] |
+--------------------------------+
|                                |
|    MAIN CONTENT (Full-width)   |
|                                |
|                                |
+--------------------------------+
```

**Navigation:**
- Hamburger menu (drawer from left)
- Full-screen overlay when open
- Swipe to close

---

## 3. Dashboard (Home)

### 3.1 Desktop View

```
+----------------------------------------------------------------+
| Wedding Dashboard: Smith - Johnson Wedding         [Edit]      |
| November 15, 2026                                              |
+----------------------------------------------------------------+
|                                                                |
| +---------------------------+  +---------------------------+   |
| | 👥 GUEST COUNT            |  | 💰 BUDGET SUMMARY         |   |
| | Adults:      150          |  | Budget:      $50,000      |   |
| | Children:     20          |  | Spent:       $42,350      |   |
| | Total:       170          |  | Remaining:   $7,650       |   |
| |                           |  | [Progress Bar 85%]        |   |
| +---------------------------+  +---------------------------+   |
|                                                                |
| +---------------------------+  +---------------------------+   |
| | 📅 EVENTS                 |  | 🤝 VENDORS                |   |
| | Total Events:     5       |  | Total:          12        |   |
| | Next Event:               |  | Pending Payments: 3       |   |
| |   Reception               |  |                           |   |
| |   Nov 15, 6pm             |  | [View Vendors Button]     |   |
| +---------------------------+  +---------------------------+   |
|                                                                |
| Upcoming Tasks (Next 7 Days)                    [View All]     |
| +------------------------------------------------------------+ |
| | ☐ Send RSVP reminders              Due: Tomorrow          | |
| | ☐ Confirm floral delivery          Due: In 3 days         | |
| | ☐ Final payment to Caterer         Due: In 5 days         | |
| +------------------------------------------------------------+ |
|                                                                |
| Recent Activity                                 [View All]     |
| +------------------------------------------------------------+ |
| | • Guest John Doe RSVP received              2 hours ago   | |
| | • Invoice paid to Photographer              Yesterday     | |
| | • Menu finalized                            3 days ago    | |
| +------------------------------------------------------------+ |
|                                                                |
| Quick Actions                                                  |
| [+ Add Guest] [+ Add Vendor] [+ Create Event]                  |
| [📄 Generate Function Sheet] [✉️ Send Vendor Briefs]           |
+----------------------------------------------------------------+
```

**Card Specifications:**
- Border-radius: 8px
- Padding: 24px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Background: White

**Grid System:**
- 2 columns on desktop (1fr 1fr)
- Gap: 24px
- Single column on mobile

---

### 3.2 Mobile View

```
+-------------------------------+
| Smith - Johnson Wedding       |
| Nov 15, 2026          [Edit]  |
+-------------------------------+
|                               |
| [Card: Guest Count]           |
| Adults: 150 | Children: 20    |
|                               |
| [Card: Budget Summary]        |
| $42,350 / $50,000 (85%)       |
| [Progress Bar]                |
|                               |
| [Card: Events]                |
| 5 Events | Next: Reception    |
|                               |
| [Card: Vendors]               |
| 12 Total | 3 Pending Payments |
|                               |
| [Upcoming Tasks - Expandable] |
|                               |
| [Quick Actions - Bottom Bar]  |
+-------------------------------+
```

---

## 4. Guest Management

### 4.1 Guest List Page

```
+----------------------------------------------------------------+
| Guests                                        [+ Add Guest]    |
+----------------------------------------------------------------+
| [Search...] 🔍                                                 |
|                                                                |
| Filters: [All Types ▼] [RSVP Status ▼] [Event ▼]              |
| Export: [CSV] [Excel]                         Showing 1-50/170|
+----------------------------------------------------------------+
|                                                                |
| TABLE (Responsive):                                            |
| +---+----------------+-------+----------+-------+-----------+  |
| |☐ | Name           | Type  | RSVP     | Table | Actions   |  |
| +---+----------------+-------+----------+-------+-----------+  |
| |☐ | John Smith     | Adult | ✅ Yes   | 5     | [✏️][🗑️] |  |
| |☐ | Jane Doe       | Adult | ⏳ Pending| -    | [✏️][🗑️] |  |
| |☐ | Tom Kid        | Child | ✅ Yes   | 8     | [✏️][🗑️] |  |
| +---+----------------+-------+----------+-------+-----------+  |
|                                                                |
| [Pagination: < 1 2 3 4 5 >]                                    |
|                                                                |
| Selected: 0 | Bulk Actions: [Assign Table ▼] [Send Email ▼]   |
+----------------------------------------------------------------+
```

**Mobile Table (< 768px):**
- Cards instead of table rows
- Swipe actions (edit, delete)
- Filters in collapsible drawer

```
+-------------------------------+
| [Card] John Smith             |
| Adult | RSVP: ✅ Yes           |
| Table: 5                      |
| [Edit] [Delete]               |
+-------------------------------+
```

---

### 4.2 Add/Edit Guest Modal

```
+------------------------------------------------------------+
| Add Guest                                         [X Close] |
+------------------------------------------------------------+
|                                                            |
| TABS: [Basic Info] [RSVP] [Dietary] [Meal] [Events]       |
|                                                            |
| --- BASIC INFO TAB ---                                     |
| Name*:          [_____________________________________]    |
| Email:          [_____________________________________]    |
| Phone:          [_____________________________________]    |
| Type*:          [Adult ▼]                                  |
|                                                            |
| Invitation Status: [Invited ▼]                             |
| [☐] Attendance Confirmed                                   |
|                                                            |
| --- RSVP TAB ---                                           |
| RSVP Deadline:     [📅 Select Date]                        |
| RSVP Received:     [📅 _____________]                      |
| RSVP Method:       [Email ▼]                               |
|                                                            |
| Plus One                                                   |
| [☐] Has Plus One                                           |
| Plus One Name:     [_____________________________________] |
| [☐] Plus One Confirmed                                     |
|                                                            |
| --- DIETARY TAB ---                                        |
| Restrictions:      [_____________________________________] |
| Allergies:         [_____________________________________] |
| Notes:             [_____________________________________] |
|                                                            |
| --- MEAL TAB ---                                           |
| Starter:           [Option 1 ▼]                            |
| Main:              [Option 2 ▼]                            |
| Dessert:           [Option 1 ▼]                            |
|                                                            |
| [Cancel]                            [Save Guest (Primary)] |
+------------------------------------------------------------+
```

**Modal Specifications:**
- Max-width: 600px
- Padding: 32px
- Border-radius: 12px
- Overlay: rgba(0,0,0,0.5) with backdrop-filter blur

---

### 4.3 Event Attendance Matrix

```
+----------------------------------------------------------------+
| Event Attendance                              [Save All]       |
+----------------------------------------------------------------+
| [Search guests...]                                             |
|                                                                |
| TABLE (Horizontal Scroll on Mobile):                           |
| +--------+----------+----------+----------+----------+         |
| | Guest  | Event 1  | Event 2  | Event 3  | Event 4  |         |
| |        | Welcome  | Breakfast| Ceremony | Reception|         |
| +--------+----------+----------+----------+----------+         |
| | John   |    ☑️    |    ☑️    |    ☑️    |    ☐     |         |
| | Shuttle| [Bus A▼] | [Car ▼]  | [Bus B▼] | [_____]  |         |
| +--------+----------+----------+----------+----------+         |
| | Jane   |    ☑️    |    ☐     |    ☑️    |    ☑️    |         |
| | ...                                                          |
| +----------------------------------------------------------+   |
|                                                                |
| Event Totals:  150      120      130      140                  |
+----------------------------------------------------------------+
```

**Mobile View:**
- Show one event at a time
- Swipe to navigate between events
- Sticky guest name column

---

## 5. Vendor Management

### 5.1 Vendor List

```
+----------------------------------------------------------------+
| Vendors                                        [+ Add Vendor]  |
+----------------------------------------------------------------+
| [Search...] 🔍                                                 |
|                                                                |
| Filters: [All Types ▼] [Contract ▼] [Payment ▼]               |
+----------------------------------------------------------------+
|                                                                |
| VENDOR CARDS (Grid: 3 cols desktop, 1 col mobile):            |
|                                                                |
| +-------------------------+  +-------------------------+       |
| | 🍽️ ABC Catering          |  | 💐 Flowers Plus         |       |
| | Contact: John Doe       |  | Contact: Sarah M.       |       |
| | ✅ Contract Signed       |  | ✅ Contract Signed       |       |
| | ⏳ Payment Due Soon      |  | ✅ Paid in Full          |       |
| | [View] [Edit] [Delete]  |  | [View] [Edit] [Delete]  |       |
| +-------------------------+  +-------------------------+       |
|                                                                |
+----------------------------------------------------------------+
```

**Card Hover:**
- Slight lift (translateY(-2px))
- Enhanced shadow

---

### 5.2 Vendor Detail Page

```
+----------------------------------------------------------------+
| Vendor: ABC Catering                            [Edit] [Delete]|
+----------------------------------------------------------------+
|                                                                |
| TABS: [Overview] [Contract] [Payments] [Invoices] [Files]     |
|                                                                |
| --- OVERVIEW TAB ---                                           |
|                                                                |
| [Card: Basic Information]                                      |
| Type: Catering                                                 |
| Company: ABC Catering Services                                 |
| Contact: John Doe                                              |
| Email: john@abccatering.com                                    |
| Phone: +1 (555) 123-4567                                       |
| Website: www.abccatering.com                                   |
|                                                                |
| [Card: Additional Contacts]                                    |
| +--------------------------------------------------------+     |
| | Name      | Role        | Email         | Primary | Onsite| |
| +--------------------------------------------------------+     |
| | Sarah J.  | On-site Mgr | sarah@abc.com |   ✅    |  ✅   | |
| | Tom K.    | Chef        | tom@abc.com   |   ☐     |  ☐   | |
| +--------------------------------------------------------+     |
| [+ Add Contact]                                                |
|                                                                |
| [Card: Banking Details]                                        |
| Bank: First National Bank                                      |
| Account: ABC Catering Ltd                                      |
| Number: 12345678                                               |
| Branch: 001                                                    |
|                                                                |
| --- CONTRACT TAB ---                                           |
|                                                                |
| [Card: Contract Details]                                       |
| Status: ✅ Signed                                               |
| Signed Date: January 1, 2026                                   |
| Expiry: December 31, 2026                                      |
| Value: $15,000                                                 |
|                                                                |
| Cancellation Policy:                                           |
| 30 days notice required, 50% cancellation fee                  |
|                                                                |
| Insurance: ✅ Required & Verified                               |
| Expiry: December 31, 2026                                      |
|                                                                |
| [View Contract PDF] [Upload New Version]                       |
|                                                                |
| --- PAYMENTS TAB ---                                           |
|                                                                |
| [Card: Payment Schedule]                                       |
| +--------------------------------------------------------+     |
| | Milestone     | Due Date   | Amount  | Status         |     |
| +--------------------------------------------------------+     |
| | Deposit       | Feb 1      | $5,000  | ✅ Paid        |     |
| | Second        | Aug 1      | $5,000  | ⏳ Due Soon    |     |
| | Final Payment | Nov 15     | $5,000  | Pending        |     |
| +--------------------------------------------------------+     |
| [+ Add Payment]                                                |
|                                                                |
+----------------------------------------------------------------+
```

---

## 6. Event Management

### 6.1 Events Timeline

```
+----------------------------------------------------------------+
| Events                                         [+ Add Event]   |
+----------------------------------------------------------------+
|                                                                |
| TIMELINE VIEW (Vertical on Mobile):                            |
|                                                                |
| Day 1: Wednesday, November 13, 2026                            |
| +------------------------------------------------------------+ |
| | [Card] 🍽️ Welcome Dinner                 6:00 PM - 9:00 PM| |
| | Location: Thatch Boma | Duration: 3 hours                  | |
| | Guests: 150 adults, 20 children                            | |
| | [View Details] [Edit] [Duplicate] [Delete]                 | |
| +------------------------------------------------------------+ |
|                                                                |
| Day 2: Thursday, November 14, 2026                             |
| +------------------------------------------------------------+ |
| | [Card] 🥐 Breakfast                      8:00 AM - 10:00 AM| |
| | Location: Boma | Duration: 2 hours                          | |
| | Guests: 150 adults, 20 children                            | |
| +------------------------------------------------------------+ |
| | [Card] 💒 Wedding Ceremony               2:00 PM - 3:00 PM| |
| | Location: Weir | Duration: 1 hour                           | |
| +------------------------------------------------------------+ |
| | [Card] 🍾 Canapés                        3:30 PM - 4:30 PM| |
| | Location: Weir | Duration: 1 hour                           | |
| +------------------------------------------------------------+ |
| | [Card] 🎉 Reception                      6:00 PM - 11:00 PM| |
| | Location: Stone Barn | Duration: 5 hours                   | |
| | Guests: 170 total                                          | |
| +------------------------------------------------------------+ |
|                                                                |
+----------------------------------------------------------------+
```

**Card Colors:**
- Event 1: #E8B4B8 background
- Event 2: #F5E6D3 background
- Event 3: #C9D4C5 background
- Event 4: #E5D4EF background
- Event 5: #FFE5CC background

---

## 7. Budget Pages

### 7.1 Budget Overview

```
+----------------------------------------------------------------+
| Budget                                                         |
+----------------------------------------------------------------+
|                                                                |
| [4 Stat Cards in Grid]                                         |
| +---------------+  +---------------+  +---------------+        |
| | Total Budget  |  | Total Spent   |  | Remaining     |        |
| | $50,000       |  | $42,350       |  | $7,650        |        |
| +---------------+  +---------------+  +---------------+        |
|                                                                |
| [Progress Bar: 85% filled]                                     |
|                                                                |
| Budget by Category                             [+ Add Category]|
| +------------------------------------------------------------+ |
| | Category     | Projected | Actual  | Variance | Status   | |
| +------------------------------------------------------------+ |
| | Venue        | $10,000   | $10,000 | $0       | ✅       | |
| | Catering     | $15,000   | $14,200 | -$800    | ✅ Under | |
| | Flowers      | $5,000    | $5,800  | +$800    | ⚠️ Over  | |
| | Photography  | $8,000    | $8,000  | $0       | ✅       | |
| | ...                                                        | |
| +------------------------------------------------------------+ |
| Total          $50,000     $42,350    -$7,650                  |
|                                                                |
| [Pie Chart: Category Breakdown]                                |
|                                                                |
+----------------------------------------------------------------+
```

---

## 8. Task Management

### 8.1 Tasks Kanban View

```
+----------------------------------------------------------------+
| Tasks                                          [+ Add Task]    |
+----------------------------------------------------------------+
| Views: [Kanban] [List] [Timeline]                              |
| Filters: [All Types ▼] [Priority ▼] [Assigned To ▼]           |
+----------------------------------------------------------------+
|                                                                |
| +---------------+ +---------------+ +---------------+          |
| | PENDING (15)  | |IN PROGRESS(8) | | COMPLETED(45) |          |
| +---------------+ +---------------+ +---------------+          |
| |               | |               | |               |          |
| | [Task Card 1] | | [Task Card 4] | | [Task Card 7] |          |
| | Send RSVPs    | | Confirm Floral| | Booked Band   |          |
| | Priority: High| | Priority: Med | | Completed     |          |
| | Due: Tomorrow | | Due: Today    | | Yesterday     |          |
| |               | |               | |               |          |
| | [Task Card 2] | | [Task Card 5] | | [Task Card 8] |          |
| | ...           | | ...           | | ...           |          |
| |               | |               | |               |          |
| | [+ Add]       | | [+ Add]       | | [+ Add]       |          |
| +---------------+ +---------------+ +---------------+          |
|                                                                |
| Drag & drop enabled between columns                            |
+----------------------------------------------------------------+
```

**Task Card:**
```
+---------------------------+
| [Priority Badge: High 🔴] |
| Send RSVP Reminders       |
|                           |
| Due: Tomorrow             |
| Assigned: Sarah           |
|                           |
| [⋮ Menu]                  |
+---------------------------+
```

---

## 9. Repurposing Timeline (NEW)

### 9.1 Gantt Chart View

```
+----------------------------------------------------------------+
| Repurposing Timeline                                           |
+----------------------------------------------------------------+
| Filter: [All Items ▼] [Responsible ▼]    View: [Gantt][List]  |
+----------------------------------------------------------------+
|                                                                |
| GANTT CHART (Horizontal scroll):                               |
|                                                                |
| Item             | Wed Nov 13 | Thu Nov 14 | Fri Nov 15 |      |
| -----------------|------------|------------|------------|      |
| Trestles (14x)   |            |            |            |      |
|   Event 1        |████████████|            |            |      |
|                             ↓ Moses 11am                       |
|   Event 2        |            |████████    |            |      |
|                                     ↓ Moses 12pm               |
|   Event 3        |            |        ████|            |      |
| -----------------|------------|------------|------------|      |
| Umbrellas (10x)  |            |            |            |      |
|   Event 1        |████████████|            |            |      |
|                             ↓ Overnight                        |
|   Event 2        |            |████████    |            |      |
|                                     ↓ Moses 1pm                |
|   Event 3        |            |        ████|            |      |
|                                            ↓ Overnight         |
|   Event 4        |            |            |████████    |      |
| -----------------|------------|------------|------------|      |
|                                                                |
| Legend:                                                        |
| █ Item in use | ↓ Movement | ✅ Completed | ⏳ Pending | ⚠️ Issue|
+----------------------------------------------------------------+
```

---

## 10. Email & Notifications

### 10.1 Notification Dropdown

```
+----------------------------------------+
| Notifications        [Mark All Read]   |
+----------------------------------------+
|                                        |
| [🔴 Card] Payment Due in 7 Days        |
| Caterer - Second payment $5,000        |
| 2 hours ago              [View]        |
+----------------------------------------+
| [⚠️ Card] RSVP Deadline Today          |
| 5 guests haven't responded             |
| 3 hours ago              [View]        |
+----------------------------------------+
| [ℹ️ Card] Task Completed               |
| Floral delivery confirmed              |
| 1 day ago                [View]        |
+----------------------------------------+
|                                        |
| [View All Notifications]               |
+----------------------------------------+
```

---

## 11. Document Generation

### 11.1 Generate Function Sheet Modal

```
+------------------------------------------------------------+
| Generate Function Sheet                          [X Close] |
+------------------------------------------------------------+
|                                                            |
| Select Sections to Include:                                |
|                                                            |
| [☑] Wedding Overview                                       |
| [☑] Event Summary                                          |
| [☑] Guest List & Attendance                                |
| [☑] Meal Selections                                        |
| [☑] Bar Orders                                             |
| [☑] Furniture & Equipment                                  |
| [☑] Repurposing Instructions                               |
| [☑] Staff Requirements                                     |
| [☑] Transportation                                         |
| [☑] Vendor Contacts                                        |
| [☑] Budget Summary                                         |
| [☑] Timeline                                               |
|                                                            |
| [Select All] [Deselect All]                                |
|                                                            |
| Format:                                                    |
| [●] PDF  [○] DOCX  [○] Both                                |
|                                                            |
| Branding:                                                  |
| [Upload Logo]                                              |
| Primary Color: [#D4A5A5] [🎨 Color Picker]                 |
|                                                            |
| [Cancel]                        [Generate Document]        |
+------------------------------------------------------------+
```

---

## Responsive Breakpoints Summary

```css
/* Mobile */
@media (max-width: 767px) {
  - Single column layouts
  - Full-width cards
  - Hamburger navigation
  - Bottom tab bar
  - Stacked forms
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  - 2 column grids
  - Collapsible sidebar
  - Touch-optimized
}

/* Desktop */
@media (min-width: 1024px) {
  - Fixed sidebar (240px)
  - Multi-column layouts
  - Hover interactions
  - Keyboard shortcuts
}
```

---

## Component Library

All pages use components from **Shadcn/ui**:
- Button
- Input
- Select
- Checkbox
- Radio
- Switch
- Table
- Card
- Modal/Dialog
- Dropdown
- Badge
- Progress
- Tabs
- Calendar/DatePicker
- Tooltip
- Toast/Alert

---

**END OF PAGE LAYOUTS**

