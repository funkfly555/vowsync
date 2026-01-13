# Data Model: Database Schema Foundation

**Feature**: 001-database-schema-foundation
**Date**: 2025-01-13
**Total Entities**: 32 tables

---

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTH.USERS                                      │
│                          (Supabase managed)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PUBLIC.USERS                                    │
│                     (extends auth with role/profile)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   │                │                │
                   ▼                ▼                ▼
            ┌──────────┐    ┌──────────────┐   ┌──────────────┐
            │ WEDDINGS │    │EMAIL_TEMPLATES│   │ NOTIFICATIONS│
            │(boundary)│    │  (per user)   │   │  (per user)  │
            └──────────┘    └──────────────┘   └──────────────┘
                   │
    ┌──────────────┼──────────────────────────────────────────┐
    │              │              │              │              │
    ▼              ▼              ▼              ▼              ▼
┌────────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐
│ EVENTS │   │ GUESTS  │   │ VENDORS │   │BAR_ORDERS│   │BUDGET_CAT│
└────────┘   └─────────┘   └─────────┘   └──────────┘   └──────────┘
    │              │              │              │              │
    ▼              ▼              ▼              ▼              ▼
  [...]          [...]          [...]          [...]          [...]
```

---

## Core Entities

### 1. users (extends auth.users)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | Links to Supabase auth |
| email | TEXT | UNIQUE, NOT NULL | User email |
| full_name | TEXT | NOT NULL | Display name |
| role | TEXT | NOT NULL, CHECK | 'consultant' \| 'admin' \| 'viewer' |
| company_name | TEXT | | Business name |
| phone | TEXT | | Contact number |
| avatar_url | TEXT | | Profile image |
| preferences | JSONB | DEFAULT '{}' | User settings |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

**Indexes**: email, role

---

### 2. weddings (RLS boundary)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| consultant_id | UUID | FK → users, NOT NULL | Owner |
| bride_name | TEXT | NOT NULL | |
| groom_name | TEXT | NOT NULL | |
| wedding_date | DATE | NOT NULL | |
| venue_name | TEXT | NOT NULL | |
| venue_address | TEXT | | |
| venue_contact_name | TEXT | | |
| venue_contact_phone | TEXT | | |
| venue_contact_email | TEXT | | |
| number_of_events | INTEGER | DEFAULT 1, CHECK 1-10 | |
| guest_count_adults | INTEGER | DEFAULT 0 | Aggregated |
| guest_count_children | INTEGER | DEFAULT 0 | Aggregated |
| status | TEXT | DEFAULT 'planning', CHECK | 'planning' \| 'confirmed' \| 'completed' \| 'cancelled' |
| budget_total | DECIMAL(12,2) | DEFAULT 0 | Projected |
| budget_actual | DECIMAL(12,2) | DEFAULT 0 | Actual |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

**Indexes**: consultant_id, wedding_date, status
**RLS**: Parent table - all child access flows through here

---

### 3. events

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| event_order | INTEGER | NOT NULL | 1-10 position |
| event_name | TEXT | NOT NULL | e.g., "Ceremony" |
| event_date | DATE | NOT NULL | |
| event_start_time | TIME | NOT NULL | |
| event_end_time | TIME | NOT NULL | |
| event_location | TEXT | NOT NULL | |
| event_type | TEXT | | Category |
| expected_guests_adults | INTEGER | DEFAULT 0 | |
| expected_guests_children | INTEGER | DEFAULT 0 | |
| duration_hours | DECIMAL(4,2) | GENERATED | Auto-calculated |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, event_date, (wedding_id, event_order)
**Constraints**: UNIQUE(wedding_id, event_order)

---

## Guest Management Entities

### 4. guests

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| name | TEXT | NOT NULL | |
| guest_type | TEXT | DEFAULT 'adult', CHECK | 'adult' \| 'child' \| 'vendor' \| 'staff' |
| invitation_status | TEXT | DEFAULT 'pending', CHECK | 'pending' \| 'invited' \| 'confirmed' \| 'declined' |
| attendance_confirmed | BOOLEAN | DEFAULT FALSE | |
| rsvp_deadline | DATE | | |
| rsvp_received_date | DATE | | |
| rsvp_method | TEXT | CHECK | 'email' \| 'phone' \| 'in_person' \| 'online' \| null |
| rsvp_notes | TEXT | | |
| last_reminder_sent_date | DATE | | |
| has_plus_one | BOOLEAN | DEFAULT FALSE | |
| plus_one_name | TEXT | | |
| plus_one_confirmed | BOOLEAN | DEFAULT FALSE | |
| table_number | TEXT | | |
| table_position | INTEGER | | |
| dietary_restrictions | TEXT | | |
| allergies | TEXT | | |
| dietary_notes | TEXT | | |
| starter_choice | INTEGER | CHECK 1-5 | Meal option |
| main_choice | INTEGER | CHECK 1-5 | Meal option |
| dessert_choice | INTEGER | CHECK 1-5 | Meal option |
| email | TEXT | | |
| phone | TEXT | | |
| email_valid | BOOLEAN | DEFAULT TRUE | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, guest_type, rsvp_deadline, name, email

---

### 5. guest_event_attendance (junction)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| guest_id | UUID | FK → guests, CASCADE, NOT NULL | |
| event_id | UUID | FK → events, CASCADE, NOT NULL | |
| attending | BOOLEAN | DEFAULT FALSE | |
| shuttle_to_event | TEXT | | Shuttle name/route |
| shuttle_from_event | TEXT | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Constraints**: UNIQUE(guest_id, event_id)
**Indexes**: guest_id, event_id, attending

---

## Vendor Management Entities

### 6. vendors

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| vendor_type | TEXT | NOT NULL | Category |
| company_name | TEXT | NOT NULL | |
| contact_name | TEXT | NOT NULL | |
| contact_email | TEXT | | |
| contact_phone | TEXT | | |
| address | TEXT | | |
| website | TEXT | | |
| contract_signed | BOOLEAN | DEFAULT FALSE | |
| contract_date | DATE | | |
| contract_expiry_date | DATE | | |
| contract_value | DECIMAL(12,2) | | |
| cancellation_policy | TEXT | | |
| cancellation_fee_percentage | DECIMAL(5,2) | | |
| insurance_required | BOOLEAN | DEFAULT FALSE | |
| insurance_verified | BOOLEAN | DEFAULT FALSE | |
| insurance_expiry_date | DATE | | |
| bank_name | TEXT | | |
| account_name | TEXT | | |
| account_number | TEXT | | |
| branch_code | TEXT | | |
| swift_code | TEXT | | |
| notes | TEXT | | |
| status | TEXT | DEFAULT 'active', CHECK | 'active' \| 'inactive' \| 'backup' |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, vendor_type, status, contract_expiry_date, insurance_expiry_date

---

### 7. vendor_contacts

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| vendor_id | UUID | FK → vendors, CASCADE, NOT NULL | |
| contact_name | TEXT | NOT NULL | |
| contact_role | TEXT | | |
| contact_email | TEXT | | |
| contact_phone | TEXT | | |
| is_primary | BOOLEAN | DEFAULT FALSE | |
| is_onsite_contact | BOOLEAN | DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: vendor_id, is_primary

---

### 8. vendor_payment_schedule

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| vendor_id | UUID | FK → vendors, CASCADE, NOT NULL | |
| milestone_name | TEXT | NOT NULL | |
| due_date | DATE | NOT NULL | |
| amount | DECIMAL(12,2) | NOT NULL | |
| percentage | DECIMAL(5,2) | | Of total |
| status | TEXT | DEFAULT 'pending', CHECK | 'pending' \| 'paid' \| 'overdue' \| 'cancelled' |
| paid_date | DATE | | |
| payment_method | TEXT | | |
| payment_reference | TEXT | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: vendor_id, status, due_date

---

### 9. vendor_invoices

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| vendor_id | UUID | FK → vendors, CASCADE, NOT NULL | |
| payment_schedule_id | UUID | FK → vendor_payment_schedule, SET NULL | |
| invoice_number | TEXT | NOT NULL | |
| invoice_date | DATE | NOT NULL | |
| due_date | DATE | NOT NULL | |
| amount | DECIMAL(12,2) | NOT NULL | |
| vat_amount | DECIMAL(12,2) | DEFAULT 0 | |
| total_amount | DECIMAL(12,2) | GENERATED | amount + vat_amount |
| status | TEXT | DEFAULT 'unpaid', CHECK | 'unpaid' \| 'paid' \| 'partially_paid' \| 'overdue' \| 'cancelled' |
| paid_date | DATE | | |
| payment_method | TEXT | | |
| payment_reference | TEXT | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: vendor_id, status, due_date

---

## Catalog & Beverage Entities

### 10. catalog_categories (global)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| name | TEXT | UNIQUE, NOT NULL | |
| description | TEXT | | |
| icon | TEXT | | Emoji or icon name |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**RLS**: Global read for authenticated users

---

### 11. catalog_items (global)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| category_id | UUID | FK → catalog_categories, SET NULL | |
| item_name | TEXT | NOT NULL | |
| item_type | TEXT | | Sub-category |
| description | TEXT | | |
| unit_type | TEXT | NOT NULL | e.g., 'Bottle' |
| unit_size | DECIMAL(10,2) | | |
| unit_size_unit | TEXT | | e.g., 'ml' |
| serving_size | DECIMAL(10,2) | | |
| serving_size_unit | TEXT | | |
| servings_per_unit | DECIMAL(10,2) | | |
| typical_cost | DECIMAL(10,2) | | |
| notes | TEXT | | |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: category_id, item_name, item_type, is_active

---

### 12. bar_orders

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| event_id | UUID | FK → events, SET NULL | |
| vendor_id | UUID | FK → vendors, SET NULL | |
| guest_count_adults | INTEGER | NOT NULL | |
| guest_count_children | INTEGER | NOT NULL | |
| event_duration_hours | DECIMAL(4,2) | NOT NULL | |
| first_hours | INTEGER | DEFAULT 2 | High consumption |
| first_hours_drinks_per_hour | DECIMAL(4,2) | DEFAULT 2 | |
| remaining_hours_drinks_per_hour | DECIMAL(4,2) | DEFAULT 1 | |
| total_servings_per_person | DECIMAL(6,2) | GENERATED | Calculated |
| notes | TEXT | | |
| status | TEXT | DEFAULT 'draft', CHECK | 'draft' \| 'confirmed' \| 'ordered' \| 'delivered' |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, event_id, vendor_id

---

### 13. bar_order_items

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| bar_order_id | UUID | FK → bar_orders, CASCADE, NOT NULL | |
| catalog_item_id | UUID | FK → catalog_items, SET NULL | |
| item_name | TEXT | NOT NULL | |
| percentage | DECIMAL(5,4) | NOT NULL, CHECK 0-1 | Portion of drinks |
| calculated_servings | DECIMAL(10,2) | | |
| servings_per_unit | DECIMAL(10,2) | | |
| units_needed | INTEGER | | |
| cost_per_unit | DECIMAL(10,2) | | |
| total_cost | DECIMAL(12,2) | GENERATED | units * cost |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: bar_order_id, catalog_item_id

---

## Equipment & Repurposing Entities

### 14. wedding_items

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| category | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | |
| aggregation_method | TEXT | DEFAULT 'MAX', CHECK | 'ADD' \| 'MAX' |
| number_available | INTEGER | | |
| total_required | INTEGER | DEFAULT 0 | Calculated |
| cost_per_unit | DECIMAL(10,2) | | |
| cost_details | TEXT | | |
| total_cost | DECIMAL(12,2) | | |
| supplier_name | TEXT | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, category, supplier_name

---

### 15. wedding_item_event_quantities

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_item_id | UUID | FK → wedding_items, CASCADE, NOT NULL | |
| event_id | UUID | FK → events, CASCADE, NOT NULL | |
| quantity_required | INTEGER | DEFAULT 0 | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Constraints**: UNIQUE(wedding_item_id, event_id)

---

### 16. repurposing_instructions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| wedding_item_id | UUID | FK → wedding_items, CASCADE, NOT NULL | |
| from_event_id | UUID | FK → events, CASCADE, NOT NULL | |
| from_event_end_time | TIME | | |
| pickup_location | TEXT | NOT NULL | |
| pickup_time | TIME | NOT NULL | |
| pickup_time_relative | TEXT | | e.g., "+30min" |
| to_event_id | UUID | FK → events, CASCADE, NOT NULL | |
| to_event_start_time | TIME | | |
| dropoff_location | TEXT | NOT NULL | |
| dropoff_time | TIME | NOT NULL | |
| dropoff_time_relative | TEXT | | |
| responsible_party | TEXT | NOT NULL | |
| responsible_vendor_id | UUID | FK → vendors, SET NULL | |
| handling_notes | TEXT | | |
| setup_required | BOOLEAN | DEFAULT FALSE | |
| breakdown_required | BOOLEAN | DEFAULT FALSE | |
| is_critical | BOOLEAN | DEFAULT FALSE | |
| status | TEXT | DEFAULT 'pending', CHECK | 'pending' \| 'in_progress' \| 'completed' \| 'issue' |
| started_at | TIMESTAMPTZ | | |
| completed_at | TIMESTAMPTZ | | |
| completed_by | TEXT | | |
| issue_description | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, wedding_item_id, from_event_id, to_event_id, status, responsible_party

---

## Additional Services Entities

### 17. staff_requirements

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| event_id | UUID | FK → events, CASCADE | |
| vendor_id | UUID | FK → vendors, SET NULL | |
| event_date | DATE | | |
| event_hours | DECIMAL(4,2) | | |
| staff_hours | DECIMAL(4,2) | | |
| location | TEXT | | |
| supervisors | INTEGER | DEFAULT 0 | |
| waiters | INTEGER | DEFAULT 0 | |
| bartenders | INTEGER | DEFAULT 0 | |
| runners | INTEGER | DEFAULT 0 | |
| scullers | INTEGER | DEFAULT 0 | |
| total_staff | INTEGER | GENERATED | Sum of all roles |
| staff_room_details | TEXT | | |
| staff_notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, event_id

---

### 18. shuttle_transport

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| event_id | UUID | FK → events, CASCADE, NOT NULL | |
| transport_type | TEXT | NOT NULL, CHECK | 'to_event' \| 'from_event' |
| collection_location | TEXT | NOT NULL | |
| dropoff_location | TEXT | NOT NULL | |
| collection_time | TIME | NOT NULL | |
| number_of_guests | INTEGER | DEFAULT 0 | |
| guest_names | TEXT | | |
| shuttle_name | TEXT | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, event_id, transport_type

---

### 19. stationery_items

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| item_name | TEXT | NOT NULL | |
| details | TEXT | | |
| quantity | INTEGER | DEFAULT 0 | |
| cost_per_item | DECIMAL(10,2) | | |
| total_cost | DECIMAL(12,2) | GENERATED | qty * cost |
| content | TEXT | | Print content |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id

---

### 20. beauty_services

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| vendor_id | UUID | FK → vendors, SET NULL | |
| person_name | TEXT | NOT NULL | |
| role | TEXT | | e.g., "Bride" |
| requires_hair | BOOLEAN | DEFAULT FALSE | |
| requires_makeup | BOOLEAN | DEFAULT FALSE | |
| appointment_time | TIME | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, vendor_id, role

---

### 21. cottages

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| cottage_name | TEXT | NOT NULL | |
| charge_per_room_per_night | DECIMAL(10,2) | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id

---

### 22. cottage_rooms

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| cottage_id | UUID | FK → cottages, CASCADE, NOT NULL | |
| room_name | TEXT | NOT NULL | |
| bed_type | TEXT | | |
| bathroom_type | TEXT | | |
| guest_name | TEXT | | |
| is_occupied | BOOLEAN | DEFAULT FALSE | |
| number_of_nights | INTEGER | DEFAULT 0 | |
| room_cost | DECIMAL(10,2) | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: cottage_id, is_occupied

---

### 23. shopping_list_items

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| item_name | TEXT | NOT NULL | |
| category | TEXT | | |
| description | TEXT | | |
| quantity | INTEGER | DEFAULT 1 | |
| unit | TEXT | | |
| estimated_cost | DECIMAL(10,2) | | |
| actual_cost | DECIMAL(10,2) | | |
| store | TEXT | | |
| purchased | BOOLEAN | DEFAULT FALSE | |
| purchased_date | DATE | | |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, category, purchased

---

## Budget Entities

### 24. budget_categories

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| category_name | TEXT | NOT NULL | |
| projected_amount | DECIMAL(12,2) | DEFAULT 0 | |
| actual_amount | DECIMAL(12,2) | DEFAULT 0 | |
| variance | DECIMAL(12,2) | GENERATED | actual - projected |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id

---

### 25. budget_line_items

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| budget_category_id | UUID | FK → budget_categories, CASCADE, NOT NULL | |
| vendor_id | UUID | FK → vendors, SET NULL | |
| item_description | TEXT | NOT NULL | |
| projected_cost | DECIMAL(12,2) | DEFAULT 0 | |
| actual_cost | DECIMAL(12,2) | DEFAULT 0 | |
| variance | DECIMAL(12,2) | GENERATED | actual - projected |
| payment_status | TEXT | DEFAULT 'unpaid', CHECK | 'unpaid' \| 'partially_paid' \| 'paid' |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: budget_category_id, vendor_id

---

## Task Management Entity

### 26. pre_post_wedding_tasks

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| task_type | TEXT | NOT NULL, CHECK | 'delivery' \| 'collection' \| 'appointment' \| 'general' \| 'milestone' |
| title | TEXT | NOT NULL | |
| description | TEXT | | |
| due_date | DATE | NOT NULL | |
| due_time | TIME | | |
| is_pre_wedding | BOOLEAN | DEFAULT TRUE | |
| days_before_after_wedding | INTEGER | | |
| assigned_to | TEXT | | |
| vendor_id | UUID | FK → vendors, SET NULL | |
| location | TEXT | | |
| address | TEXT | | |
| contact_person | TEXT | | |
| contact_phone | TEXT | | |
| contact_email | TEXT | | |
| status | TEXT | DEFAULT 'pending', CHECK | 'pending' \| 'in_progress' \| 'completed' \| 'cancelled' \| 'overdue' |
| completed_date | TIMESTAMPTZ | | |
| completed_by | TEXT | | |
| reminder_sent | BOOLEAN | DEFAULT FALSE | |
| reminder_date | DATE | | |
| priority | TEXT | DEFAULT 'medium', CHECK | 'low' \| 'medium' \| 'high' \| 'critical' |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, task_type, due_date, status, vendor_id, priority

---

## File Management Entity

### 27. attachments

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| entity_type | TEXT | NOT NULL | Target table |
| entity_id | UUID | | Target row |
| file_name | TEXT | NOT NULL | |
| file_type | TEXT | NOT NULL | |
| file_size | INTEGER | NOT NULL | Bytes |
| storage_path | TEXT | NOT NULL | |
| storage_bucket | TEXT | DEFAULT 'wedding-files' | |
| category | TEXT | | |
| description | TEXT | | |
| uploaded_by | UUID | FK → users, SET NULL | |
| version | INTEGER | DEFAULT 1 | |
| is_latest_version | BOOLEAN | DEFAULT TRUE | |
| previous_version_id | UUID | FK → attachments, SET NULL | |
| is_public | BOOLEAN | DEFAULT FALSE | |
| password_protected | BOOLEAN | DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, (entity_type, entity_id), category, uploaded_by

---

## Email System Entities

### 28. email_templates

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| consultant_id | UUID | FK → users, CASCADE | |
| template_name | TEXT | NOT NULL | |
| template_type | TEXT | NOT NULL | |
| subject | TEXT | NOT NULL | |
| body_html | TEXT | NOT NULL | |
| body_text | TEXT | | |
| variables | JSONB | DEFAULT '[]' | |
| is_default | BOOLEAN | DEFAULT FALSE | |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: consultant_id, template_type
**RLS**: User-specific (consultant_id)

---

### 29. email_campaigns

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| template_id | UUID | FK → email_templates, SET NULL | |
| campaign_name | TEXT | NOT NULL | |
| campaign_type | TEXT | NOT NULL | |
| subject | TEXT | NOT NULL | |
| body_html | TEXT | NOT NULL | |
| body_text | TEXT | | |
| recipient_type | TEXT | NOT NULL | |
| recipient_filter | JSONB | | |
| status | TEXT | DEFAULT 'draft', CHECK | 'draft' \| 'scheduled' \| 'sending' \| 'sent' \| 'failed' |
| scheduled_at | TIMESTAMPTZ | | |
| sent_at | TIMESTAMPTZ | | |
| total_recipients | INTEGER | DEFAULT 0 | |
| total_sent | INTEGER | DEFAULT 0 | |
| total_delivered | INTEGER | DEFAULT 0 | |
| total_opened | INTEGER | DEFAULT 0 | |
| total_clicked | INTEGER | DEFAULT 0 | |
| total_bounced | INTEGER | DEFAULT 0 | |
| total_failed | INTEGER | DEFAULT 0 | |
| created_by | UUID | FK → users, SET NULL | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, status, scheduled_at

---

### 30. email_logs

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| campaign_id | UUID | FK → email_campaigns, SET NULL | |
| wedding_id | UUID | FK → weddings, CASCADE, NOT NULL | |
| recipient_type | TEXT | NOT NULL | |
| recipient_id | UUID | | |
| recipient_email | TEXT | NOT NULL | |
| recipient_name | TEXT | | |
| subject | TEXT | NOT NULL | |
| status | TEXT | DEFAULT 'pending', CHECK | Multiple statuses |
| sent_at | TIMESTAMPTZ | | |
| delivered_at | TIMESTAMPTZ | | |
| opened_at | TIMESTAMPTZ | | |
| first_clicked_at | TIMESTAMPTZ | | |
| bounced_at | TIMESTAMPTZ | | |
| bounce_type | TEXT | | |
| bounce_reason | TEXT | | |
| error_message | TEXT | | |
| open_count | INTEGER | DEFAULT 0 | |
| click_count | INTEGER | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: campaign_id, wedding_id, (recipient_type, recipient_id), status, recipient_email

---

## Notification & Audit Entities

### 31. notifications

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users, CASCADE, NOT NULL | |
| wedding_id | UUID | FK → weddings, CASCADE | |
| notification_type | TEXT | NOT NULL | |
| title | TEXT | NOT NULL | |
| message | TEXT | NOT NULL | |
| entity_type | TEXT | | |
| entity_id | UUID | | |
| action_url | TEXT | | |
| action_label | TEXT | | |
| priority | TEXT | DEFAULT 'normal', CHECK | 'low' \| 'normal' \| 'high' \| 'urgent' |
| is_read | BOOLEAN | DEFAULT FALSE | |
| read_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes**: user_id, wedding_id, notification_type, is_read, created_at DESC
**RLS**: User-specific (user_id)

---

### 32. activity_log

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| wedding_id | UUID | FK → weddings, CASCADE | |
| user_id | UUID | FK → users, SET NULL | |
| action_type | TEXT | NOT NULL | |
| entity_type | TEXT | NOT NULL | |
| entity_id | UUID | | |
| description | TEXT | NOT NULL | |
| changes | JSONB | | Before/after |
| ip_address | INET | | |
| user_agent | TEXT | | |
| created_at | TIMESTAMPTZ | | |

**Indexes**: wedding_id, user_id, (entity_type, entity_id), created_at DESC
**Note**: No updated_at (append-only log)

---

## State Transitions

### Wedding Status Flow
```
planning → confirmed → completed
    ↓
cancelled
```

### Guest RSVP Flow
```
pending → invited → confirmed
              ↓
         declined
```

### Vendor Payment Flow
```
pending → paid
    ↓
overdue → paid
    ↓
cancelled
```

### Task Status Flow
```
pending → in_progress → completed
    ↓          ↓
overdue    cancelled
```

### Repurposing Status Flow
```
pending → in_progress → completed
                 ↓
              issue
```

---

## Validation Rules Summary

| Entity | Rule | Constraint |
|--------|------|------------|
| events | Order 1-10 | CHECK |
| events | UNIQUE per wedding | UNIQUE(wedding_id, event_order) |
| guests | Meal choices 1-5 | CHECK |
| bar_order_items | Percentage 0-1 | CHECK |
| repurposing | pickup_time < dropoff_time | Application-level |
| bar_orders | Total percentages 90-110% | Application-level |
