# API Endpoints Summary

## Overview

RESTful API built with Supabase client libraries. All endpoints use JWT authentication.

---

## Authentication

```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/reset-password
```

---

## Weddings

```
GET    /api/weddings              - List all weddings for consultant
POST   /api/weddings              - Create new wedding
GET    /api/weddings/:id          - Get wedding details
PUT    /api/weddings/:id          - Update wedding
DELETE /api/weddings/:id          - Delete wedding
GET    /api/weddings/:id/dashboard - Get dashboard data
```

---

## Events

```
GET    /api/weddings/:wid/events  - List events for wedding
POST   /api/weddings/:wid/events  - Create event
GET    /api/events/:id            - Get event details
PUT    /api/events/:id            - Update event
DELETE /api/events/:id            - Delete event
```

---

## Guests

```
GET    /api/weddings/:wid/guests                    - List guests (with filters)
POST   /api/weddings/:wid/guests                    - Create guest
GET    /api/guests/:id                              - Get guest details
PUT    /api/guests/:id                              - Update guest
DELETE /api/guests/:id                              - Delete guest
POST   /api/weddings/:wid/guests/bulk-import        - Import CSV/Excel
GET    /api/events/:eid/attendance                  - Get attendance matrix
PUT    /api/attendance/:id                          - Update attendance
POST   /api/guests/send-rsvp-reminders              - Send RSVP reminders
```

---

## Vendors

```
GET    /api/weddings/:wid/vendors          - List vendors
POST   /api/weddings/:wid/vendors          - Create vendor
GET    /api/vendors/:id                    - Get vendor details
PUT    /api/vendors/:id                    - Update vendor
DELETE /api/vendors/:id                    - Delete vendor
GET    /api/vendors/:id/payments           - Get payment schedule
POST   /api/vendors/:id/payments           - Add payment milestone
PUT    /api/payments/:id/mark-paid         - Mark payment as paid
GET    /api/vendors/:id/invoices           - Get invoices
POST   /api/vendors/:id/invoices           - Add invoice
```

---

## Bar Orders

```
GET    /api/weddings/:wid/bar-orders       - List bar orders
POST   /api/weddings/:wid/bar-orders       - Create bar order
GET    /api/bar-orders/:id                 - Get bar order
PUT    /api/bar-orders/:id                 - Update bar order
DELETE /api/bar-orders/:id                 - Delete bar order
GET    /api/catalog-items                  - List catalog items
POST   /api/catalog-items                  - Add catalog item
```

---

## Furniture & Equipment

```
GET    /api/weddings/:wid/items            - List wedding items
POST   /api/weddings/:wid/items            - Create item
GET    /api/items/:id                      - Get item details
PUT    /api/items/:id                      - Update item
DELETE /api/items/:id                      - Delete item
GET    /api/items/:id/quantities           - Get event quantities
PUT    /api/items/:id/calculate-total      - Recalculate total required
```

---

## Repurposing

```
GET    /api/weddings/:wid/repurposing                  - List instructions
POST   /api/weddings/:wid/repurposing                  - Create instruction
GET    /api/repurposing/:id                            - Get details
PUT    /api/repurposing/:id                            - Update
DELETE /api/repurposing/:id                            - Delete
PUT    /api/repurposing/:id/mark-completed             - Mark completed
GET    /api/weddings/:wid/repurposing/by-party/:name   - Tasks for person
```

---

## Budget

```
GET    /api/weddings/:wid/budget                       - Get budget overview
GET    /api/weddings/:wid/budget/categories            - List categories
POST   /api/weddings/:wid/budget/categories            - Add category
PUT    /api/budget/categories/:id                      - Update category
DELETE /api/budget/categories/:id                      - Delete category
GET    /api/budget/categories/:id/line-items           - List line items
POST   /api/budget/categories/:id/line-items           - Add line item
```

---

## Tasks

```
GET    /api/weddings/:wid/tasks            - List tasks (with filters)
POST   /api/weddings/:wid/tasks            - Create task
GET    /api/tasks/:id                      - Get task details
PUT    /api/tasks/:id                      - Update task
DELETE /api/tasks/:id                      - Delete task
PUT    /api/tasks/:id/mark-completed       - Mark completed
```

---

## Email

```
GET    /api/email-templates                - List templates
POST   /api/email-templates                - Create template
PUT    /api/email-templates/:id            - Update template
GET    /api/weddings/:wid/campaigns        - List campaigns
POST   /api/weddings/:wid/campaigns        - Create/send campaign
GET    /api/campaigns/:id/stats            - Get campaign stats
GET    /api/email-logs                     - Get email logs
```

---

## Notifications

```
GET    /api/notifications                  - Get user notifications
PUT    /api/notifications/:id/mark-read    - Mark as read
PUT    /api/notifications/mark-all-read    - Mark all as read
DELETE /api/notifications/:id              - Delete notification
```

---

## Files

```
GET    /api/weddings/:wid/attachments      - List files
POST   /api/weddings/:wid/attachments      - Upload file
GET    /api/attachments/:id                - Get file details
DELETE /api/attachments/:id                - Delete file
GET    /api/attachments/:id/download       - Download file
GET    /api/attachments/:id/versions       - Get version history
```

---

## Documents

```
POST   /api/weddings/:wid/generate-function-sheet    - Generate Function Sheet
POST   /api/vendors/:vid/generate-brief              - Generate Vendor Brief
```

---

## Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { ... }
  }
}
```

---

**Note:** All endpoints are protected by Supabase RLS. Users can only access their own wedding data.

