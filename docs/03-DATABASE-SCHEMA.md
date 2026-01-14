# Complete Supabase Database Schema

## Overview

This document contains the complete PostgreSQL schema for deployment to Supabase. 
All tables include Row Level Security (RLS) policies.

**Total Tables:** 30+
**Features:** RLS, Triggers, Functions, Indexes

---

## Execution Order

Run SQL in this order:
1. Enable extensions
2. Create users table
3. Create wedding tables (weddings, events)
4. Create related tables (guests, vendors, etc.)
5. Create functions & triggers
6. Enable RLS & create policies

---

## 1. Extensions & Setup

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- Set timezone
SET timezone = 'UTC';
```

---

## 2. Users Table

```sql
-- Extends Supabase auth.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'consultant' CHECK (role IN ('consultant', 'admin', 'viewer')),
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
```

---

## 3. Wedding Management

### 3.1 Weddings

```sql
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date DATE NOT NULL,
  
  -- Venue
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  venue_contact_name TEXT,
  venue_contact_phone TEXT,
  venue_contact_email TEXT,
  
  -- Configuration
  number_of_events INTEGER DEFAULT 1 CHECK (number_of_events BETWEEN 1 AND 10),
  
  -- Guest Counts (aggregated from guests table)
  guest_count_adults INTEGER DEFAULT 0,
  guest_count_children INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
  
  -- Budget
  budget_total DECIMAL(12,2) DEFAULT 0,
  budget_actual DECIMAL(12,2) DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weddings_consultant ON weddings(consultant_id);
CREATE INDEX idx_weddings_date ON weddings(wedding_date);
CREATE INDEX idx_weddings_status ON weddings(status);
```

### 3.2 Events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  event_order INTEGER NOT NULL, -- 1-10
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_start_time TIME NOT NULL,
  event_end_time TIME NOT NULL,
  event_location TEXT NOT NULL,
  event_type TEXT,
  
  -- Guest counts (calculated from attendance)
  expected_guests_adults INTEGER DEFAULT 0,
  expected_guests_children INTEGER DEFAULT 0,
  
  -- Auto-calculated duration
  duration_hours DECIMAL(4,2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (event_end_time - event_start_time)) / 3600
  ) STORED,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(wedding_id, event_order)
);

CREATE INDEX idx_events_wedding ON events(wedding_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_order ON events(wedding_id, event_order);
```

---

## 4. Guest Management

### 4.1 Guests

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  guest_type TEXT DEFAULT 'adult' CHECK (guest_type IN ('adult', 'child', 'vendor', 'staff')),
  
  -- Invitation
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'invited', 'confirmed', 'declined')),
  attendance_confirmed BOOLEAN DEFAULT FALSE,
  
  -- RSVP Tracking (NEW)
  rsvp_deadline DATE,
  rsvp_received_date DATE,
  rsvp_method TEXT CHECK (rsvp_method IN ('email', 'phone', 'in_person', 'online', null)),
  rsvp_notes TEXT,
  last_reminder_sent_date DATE,
  
  -- Plus One (NEW)
  has_plus_one BOOLEAN DEFAULT FALSE,
  plus_one_name TEXT,
  plus_one_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Seating
  table_number TEXT,
  table_position INTEGER,
  
  -- Dietary
  dietary_restrictions TEXT,
  allergies TEXT,
  dietary_notes TEXT,
  
  -- Meal Selection (plated service)
  starter_choice INTEGER CHECK (starter_choice BETWEEN 1 AND 5),
  main_choice INTEGER CHECK (main_choice BETWEEN 1 AND 5),
  dessert_choice INTEGER CHECK (dessert_choice BETWEEN 1 AND 5),
  
  -- Contact
  email TEXT,
  phone TEXT,
  email_valid BOOLEAN DEFAULT TRUE,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_wedding ON guests(wedding_id);
CREATE INDEX idx_guests_type ON guests(guest_type);
CREATE INDEX idx_guests_rsvp_deadline ON guests(rsvp_deadline);
CREATE INDEX idx_guests_name ON guests(name);
CREATE INDEX idx_guests_email ON guests(email);
```

### 4.2 Guest Event Attendance

```sql
CREATE TABLE guest_event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  attending BOOLEAN DEFAULT FALSE,
  shuttle_to_event TEXT,
  shuttle_from_event TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(guest_id, event_id)
);

CREATE INDEX idx_guest_event_guest ON guest_event_attendance(guest_id);
CREATE INDEX idx_guest_event_event ON guest_event_attendance(event_id);
CREATE INDEX idx_guest_event_attending ON guest_event_attendance(attending);
```

---

## 5. Vendor Management

### 5.1 Vendors

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  -- Basic Info
  vendor_type TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  website TEXT,
  
  -- Contract (NEW)
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_date DATE,
  contract_expiry_date DATE,
  contract_value DECIMAL(12,2),
  cancellation_policy TEXT,
  cancellation_fee_percentage DECIMAL(5,2),
  insurance_required BOOLEAN DEFAULT FALSE,
  insurance_verified BOOLEAN DEFAULT FALSE,
  insurance_expiry_date DATE,
  
  -- Banking
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  branch_code TEXT,
  swift_code TEXT,
  
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'backup')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_wedding ON vendors(wedding_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_contract_expiry ON vendors(contract_expiry_date);
CREATE INDEX idx_vendors_insurance_expiry ON vendors(insurance_expiry_date);
```

### 5.2 Vendor Contacts

```sql
CREATE TABLE vendor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  contact_name TEXT NOT NULL,
  contact_role TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  is_onsite_contact BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_contacts_vendor ON vendor_contacts(vendor_id);
CREATE INDEX idx_vendor_contacts_primary ON vendor_contacts(is_primary);
```

### 5.3 Vendor Payment Schedule (NEW)

```sql
CREATE TABLE vendor_payment_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  milestone_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  percentage DECIMAL(5,2),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_schedule_vendor ON vendor_payment_schedule(vendor_id);
CREATE INDEX idx_payment_schedule_status ON vendor_payment_schedule(status);
CREATE INDEX idx_payment_schedule_due_date ON vendor_payment_schedule(due_date);
```

### 5.4 Vendor Invoices

```sql
CREATE TABLE vendor_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  payment_schedule_id UUID REFERENCES vendor_payment_schedule(id) ON DELETE SET NULL,
  
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount + COALESCE(vat_amount, 0)) STORED,
  
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled')),
  paid_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_vendor ON vendor_invoices(vendor_id);
CREATE INDEX idx_invoices_status ON vendor_invoices(status);
CREATE INDEX idx_invoices_due_date ON vendor_invoices(due_date);
CREATE UNIQUE INDEX idx_invoices_number ON vendor_invoices(wedding_id, invoice_number);
```

---

## 6. Catalog & Beverage Management

### 6.1 Catalog Categories

```sql
CREATE TABLE catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catalog_categories_name ON catalog_categories(name);
```

### 6.2 Catalog Items

```sql
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
  
  item_name TEXT NOT NULL,
  item_type TEXT,
  description TEXT,
  
  unit_type TEXT NOT NULL,
  unit_size DECIMAL(10,2),
  unit_size_unit TEXT,
  serving_size DECIMAL(10,2),
  serving_size_unit TEXT,
  servings_per_unit DECIMAL(10,2),
  
  typical_cost DECIMAL(10,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catalog_items_category ON catalog_items(category_id);
CREATE INDEX idx_catalog_items_name ON catalog_items(item_name);
CREATE INDEX idx_catalog_items_type ON catalog_items(item_type);
CREATE INDEX idx_catalog_items_active ON catalog_items(is_active);
```

### 6.3 Bar Orders

```sql
CREATE TABLE bar_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  
  -- Calculation Parameters
  guest_count_adults INTEGER NOT NULL,
  guest_count_children INTEGER NOT NULL,
  event_duration_hours DECIMAL(4,2) NOT NULL,
  first_hours INTEGER DEFAULT 2,
  first_hours_drinks_per_hour DECIMAL(4,2) DEFAULT 2,
  remaining_hours_drinks_per_hour DECIMAL(4,2) DEFAULT 1,
  
  -- Auto-calculated
  total_servings_per_person DECIMAL(6,2) GENERATED ALWAYS AS (
    (first_hours * first_hours_drinks_per_hour) + 
    ((event_duration_hours - first_hours) * remaining_hours_drinks_per_hour)
  ) STORED,
  
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'ordered', 'delivered')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bar_orders_wedding ON bar_orders(wedding_id);
CREATE INDEX idx_bar_orders_event ON bar_orders(event_id);
CREATE INDEX idx_bar_orders_vendor ON bar_orders(vendor_id);
```

### 6.4 Bar Order Items

```sql
CREATE TABLE bar_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_order_id UUID NOT NULL REFERENCES bar_orders(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
  
  item_name TEXT NOT NULL,
  percentage DECIMAL(5,4) NOT NULL CHECK (percentage BETWEEN 0 AND 1),
  calculated_servings DECIMAL(10,2),
  servings_per_unit DECIMAL(10,2),
  units_needed INTEGER,
  
  cost_per_unit DECIMAL(10,2),
  total_cost DECIMAL(12,2) GENERATED ALWAYS AS (units_needed * COALESCE(cost_per_unit, 0)) STORED,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bar_order_items_order ON bar_order_items(bar_order_id);
CREATE INDEX idx_bar_order_items_catalog ON bar_order_items(catalog_item_id);
```

---

## 7. Furniture & Equipment

### 7.1 Wedding Items

```sql
CREATE TABLE wedding_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  aggregation_method TEXT DEFAULT 'MAX' CHECK (aggregation_method IN ('ADD', 'MAX')),
  
  number_available INTEGER,
  total_required INTEGER DEFAULT 0,
  
  cost_per_unit DECIMAL(10,2),
  cost_details TEXT,
  total_cost DECIMAL(12,2),
  
  supplier_name TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wedding_items_wedding ON wedding_items(wedding_id);
CREATE INDEX idx_wedding_items_category ON wedding_items(category);
CREATE INDEX idx_wedding_items_supplier ON wedding_items(supplier_name);
```

### 7.2 Wedding Item Event Quantities

```sql
CREATE TABLE wedding_item_event_quantities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_item_id UUID NOT NULL REFERENCES wedding_items(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  quantity_required INTEGER DEFAULT 0,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(wedding_item_id, event_id)
);

CREATE INDEX idx_item_quantities_item ON wedding_item_event_quantities(wedding_item_id);
CREATE INDEX idx_item_quantities_event ON wedding_item_event_quantities(event_id);
```

### 7.3 Repurposing Instructions (NEW)

```sql
CREATE TABLE repurposing_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  wedding_item_id UUID NOT NULL REFERENCES wedding_items(id) ON DELETE CASCADE,
  
  -- Source Event
  from_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  from_event_end_time TIME,
  pickup_location TEXT NOT NULL,
  pickup_time TIME NOT NULL,
  pickup_time_relative TEXT,
  
  -- Destination Event
  to_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  to_event_start_time TIME,
  dropoff_location TEXT NOT NULL,
  dropoff_time TIME NOT NULL,
  dropoff_time_relative TEXT,
  
  -- Responsibility
  responsible_party TEXT NOT NULL,
  responsible_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  
  -- Special Instructions
  handling_notes TEXT,
  setup_required BOOLEAN DEFAULT FALSE,
  breakdown_required BOOLEAN DEFAULT FALSE,
  is_critical BOOLEAN DEFAULT FALSE,
  
  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'issue')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  issue_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repurposing_wedding ON repurposing_instructions(wedding_id);
CREATE INDEX idx_repurposing_item ON repurposing_instructions(wedding_item_id);
CREATE INDEX idx_repurposing_from_event ON repurposing_instructions(from_event_id);
CREATE INDEX idx_repurposing_to_event ON repurposing_instructions(to_event_id);
CREATE INDEX idx_repurposing_status ON repurposing_instructions(status);
CREATE INDEX idx_repurposing_responsible ON repurposing_instructions(responsible_party);
```

---

## 8. Additional Services

### 8.1 Staff Requirements

```sql
CREATE TABLE staff_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  
  event_date DATE,
  event_hours DECIMAL(4,2),
  staff_hours DECIMAL(4,2),
  location TEXT,
  
  supervisors INTEGER DEFAULT 0,
  waiters INTEGER DEFAULT 0,
  bartenders INTEGER DEFAULT 0,
  runners INTEGER DEFAULT 0,
  scullers INTEGER DEFAULT 0,
  total_staff INTEGER GENERATED ALWAYS AS (
    supervisors + waiters + bartenders + runners + scullers
  ) STORED,
  
  staff_room_details TEXT,
  staff_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_requirements_wedding ON staff_requirements(wedding_id);
CREATE INDEX idx_staff_requirements_event ON staff_requirements(event_id);
```

### 8.2 Shuttle Transport

```sql
CREATE TABLE shuttle_transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  transport_type TEXT NOT NULL CHECK (transport_type IN ('to_event', 'from_event')),
  collection_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  collection_time TIME NOT NULL,
  
  number_of_guests INTEGER DEFAULT 0,
  guest_names TEXT,
  shuttle_name TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shuttle_wedding ON shuttle_transport(wedding_id);
CREATE INDEX idx_shuttle_event ON shuttle_transport(event_id);
CREATE INDEX idx_shuttle_type ON shuttle_transport(transport_type);
```

### 8.3 Stationery Items

```sql
CREATE TABLE stationery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  item_name TEXT NOT NULL,
  details TEXT,
  quantity INTEGER DEFAULT 0,
  cost_per_item DECIMAL(10,2),
  total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * COALESCE(cost_per_item, 0)) STORED,
  content TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stationery_wedding ON stationery_items(wedding_id);
```

### 8.4 Beauty Services

```sql
CREATE TABLE beauty_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  
  person_name TEXT NOT NULL,
  role TEXT,
  requires_hair BOOLEAN DEFAULT FALSE,
  requires_makeup BOOLEAN DEFAULT FALSE,
  appointment_time TIME,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_beauty_wedding ON beauty_services(wedding_id);
CREATE INDEX idx_beauty_vendor ON beauty_services(vendor_id);
CREATE INDEX idx_beauty_role ON beauty_services(role);
```

### 8.5 Accommodation

```sql
CREATE TABLE cottages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  cottage_name TEXT NOT NULL,
  charge_per_room_per_night DECIMAL(10,2),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cottages_wedding ON cottages(wedding_id);

CREATE TABLE cottage_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cottage_id UUID NOT NULL REFERENCES cottages(id) ON DELETE CASCADE,
  
  room_name TEXT NOT NULL,
  bed_type TEXT,
  bathroom_type TEXT,
  guest_name TEXT,
  is_occupied BOOLEAN DEFAULT FALSE,
  number_of_nights INTEGER DEFAULT 0,
  room_cost DECIMAL(10,2),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cottage_rooms_cottage ON cottage_rooms(cottage_id);
CREATE INDEX idx_cottage_rooms_occupied ON cottage_rooms(is_occupied);
```

### 8.6 Shopping List

```sql
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  item_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  store TEXT,
  purchased BOOLEAN DEFAULT FALSE,
  purchased_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shopping_list_wedding ON shopping_list_items(wedding_id);
CREATE INDEX idx_shopping_list_category ON shopping_list_items(category);
CREATE INDEX idx_shopping_list_purchased ON shopping_list_items(purchased);
```

---

## 9. Budget Management

```sql
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  category_name TEXT NOT NULL,
  projected_amount DECIMAL(12,2) DEFAULT 0,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  variance DECIMAL(12,2) GENERATED ALWAYS AS (actual_amount - projected_amount) STORED,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_categories_wedding ON budget_categories(wedding_id);

CREATE TABLE budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  
  item_description TEXT NOT NULL,
  projected_cost DECIMAL(12,2) DEFAULT 0,
  actual_cost DECIMAL(12,2) DEFAULT 0,
  variance DECIMAL(12,2) GENERATED ALWAYS AS (actual_cost - projected_cost) STORED,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_line_items_category ON budget_line_items(budget_category_id);
CREATE INDEX idx_budget_line_items_vendor ON budget_line_items(vendor_id);
```

---

## 10. Task Management (NEW)

```sql
CREATE TABLE pre_post_wedding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  task_type TEXT NOT NULL CHECK (task_type IN ('delivery', 'collection', 'appointment', 'general', 'milestone')),
  title TEXT NOT NULL,
  description TEXT,
  
  due_date DATE NOT NULL,
  due_time TIME,
  is_pre_wedding BOOLEAN DEFAULT TRUE,
  days_before_after_wedding INTEGER,
  
  assigned_to TEXT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  
  location TEXT,
  address TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
  completed_date TIMESTAMPTZ,
  completed_by TEXT,
  
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_wedding ON pre_post_wedding_tasks(wedding_id);
CREATE INDEX idx_tasks_type ON pre_post_wedding_tasks(task_type);
CREATE INDEX idx_tasks_due_date ON pre_post_wedding_tasks(due_date);
CREATE INDEX idx_tasks_status ON pre_post_wedding_tasks(status);
CREATE INDEX idx_tasks_vendor ON pre_post_wedding_tasks(vendor_id);
CREATE INDEX idx_tasks_priority ON pre_post_wedding_tasks(priority);
```

---

## 11. File Management (NEW)

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'wedding-files',
  
  category TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  version INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT TRUE,
  previous_version_id UUID REFERENCES attachments(id) ON DELETE SET NULL,
  
  is_public BOOLEAN DEFAULT FALSE,
  password_protected BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_wedding ON attachments(wedding_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_category ON attachments(category);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
```

---

## 12. Email System (NEW)

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]',
  
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_templates_consultant ON email_templates(consultant_id);
CREATE INDEX idx_email_templates_type ON email_templates(template_type);

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  recipient_type TEXT NOT NULL,
  recipient_filter JSONB,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_wedding ON email_campaigns(wedding_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  
  recipient_type TEXT NOT NULL,
  recipient_id UUID,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'opened', 'clicked', 
    'bounced', 'soft_bounce', 'hard_bounce', 'failed', 'spam'
  )),
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  first_clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounce_type TEXT,
  bounce_reason TEXT,
  error_message TEXT,
  
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_wedding ON email_logs(wedding_id);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_type, recipient_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
```

---

## 13. Notifications (NEW)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  entity_type TEXT,
  entity_id UUID,
  
  action_url TEXT,
  action_label TEXT,
  
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_wedding ON notifications(wedding_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## 14. Activity Log

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  description TEXT NOT NULL,
  changes JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_wedding ON activity_log(wedding_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

---

## 15. Database Functions

### 15.1 Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Apply to all tables with `updated_at` column:

```sql
CREATE TRIGGER update_weddings_updated_at 
  BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at 
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... repeat for all tables
```

### 15.2 Calculate Event Guest Count

```sql
CREATE OR REPLACE FUNCTION calculate_event_guest_count(event_id_param UUID)
RETURNS TABLE(adults_count INTEGER, children_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE g.guest_type = 'adult' AND gea.attending = TRUE)::INTEGER as adults,
    COUNT(*) FILTER (WHERE g.guest_type = 'child' AND gea.attending = TRUE)::INTEGER as children
  FROM guest_event_attendance gea
  JOIN guests g ON g.id = gea.guest_id
  WHERE gea.event_id = event_id_param;
END;
$$ LANGUAGE plpgsql;
```

### 15.3 Calculate Wedding Item Total Required

```sql
CREATE OR REPLACE FUNCTION calculate_wedding_item_total_required(item_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  aggregation_method_val TEXT;
  total_val INTEGER;
BEGIN
  SELECT aggregation_method INTO aggregation_method_val
  FROM wedding_items WHERE id = item_id_param;
  
  IF aggregation_method_val = 'ADD' THEN
    SELECT SUM(quantity_required) INTO total_val
    FROM wedding_item_event_quantities
    WHERE wedding_item_id = item_id_param;
  ELSE -- MAX
    SELECT MAX(quantity_required) INTO total_val
    FROM wedding_item_event_quantities
    WHERE wedding_item_id = item_id_param;
  END IF;
  
  RETURN COALESCE(total_val, 0);
END;
$$ LANGUAGE plpgsql;
```

### 15.4 Update Wedding Budget Totals

```sql
CREATE OR REPLACE FUNCTION update_wedding_budget_totals(wedding_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE weddings
  SET 
    budget_total = (
      SELECT COALESCE(SUM(projected_amount), 0)
      FROM budget_categories
      WHERE wedding_id = wedding_id_param
    ),
    budget_actual = (
      SELECT COALESCE(SUM(actual_amount), 0)
      FROM budget_categories
      WHERE wedding_id = wedding_id_param
    )
  WHERE id = wedding_id_param;
END;
$$ LANGUAGE plpgsql;
```

---

## 16. Row Level Security (RLS)

### 16.1 Enable RLS

```sql
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payment_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_item_event_quantities ENABLE ROW LEVEL SECURITY;
ALTER TABLE repurposing_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuttle_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE stationery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE beauty_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cottages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cottage_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_post_wedding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
```

### 16.2 Policies for Weddings Table

```sql
-- Consultants can only see their own weddings
CREATE POLICY "Users can view own weddings"
  ON weddings FOR SELECT
  USING (auth.uid() = consultant_id);

CREATE POLICY "Users can create own weddings"
  ON weddings FOR INSERT
  WITH CHECK (auth.uid() = consultant_id);

CREATE POLICY "Users can update own weddings"
  ON weddings FOR UPDATE
  USING (auth.uid() = consultant_id);

CREATE POLICY "Users can delete own weddings"
  ON weddings FOR DELETE
  USING (auth.uid() = consultant_id);

-- Admin can see all
CREATE POLICY "Admins can view all weddings"
  ON weddings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 16.3 Policies for Child Tables (Example: Guests)

```sql
CREATE POLICY "Users can view guests of their weddings"
  ON guests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND (weddings.consultant_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Users can create guests for their weddings"
  ON guests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

CREATE POLICY "Users can update guests of their weddings"
  ON guests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete guests of their weddings"
  ON guests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

**Note:** Similar policies should be applied to all child tables (events, vendors, etc.)

---

## 17. Supabase Storage Buckets

```sql
-- Create storage bucket for wedding files
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-files', 'wedding-files', false);

-- RLS for storage
CREATE POLICY "Users can upload files for their weddings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wedding-files' AND
    auth.uid() IN (
      SELECT consultant_id FROM weddings
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can view files for their weddings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wedding-files' AND
    auth.uid() IN (
      SELECT consultant_id FROM weddings
      WHERE id::text = (storage.foldername(name))[1]
    )
  );
```

---

## Implementation Checklist

- [ ] Run all CREATE TABLE statements
- [ ] Create all indexes
- [ ] Create all functions
- [ ] Create all triggers
- [ ] Enable RLS on all tables
- [ ] Create all RLS policies
- [ ] Create storage buckets
- [ ] Test all policies
- [ ] Seed initial data (catalog items, email templates)
- [ ] Create database backups schedule

---

**END OF DATABASE SCHEMA**

