# vowsync Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-13

## Active Technologies
- TypeScript 5.x with React 18+ + React Router v6, Tailwind CSS v3, Shadcn/ui, React Hook Form, Zod, TanStack Query v5, Zustand, date-fns, Lucide React (002-wedding-crud)
- Supabase PostgreSQL (weddings table exists from Phase 1) (002-wedding-crud)
- TypeScript 5.x with React 18+ + React Router v6, Tailwind CSS v3, Shadcn/ui, React Hook Form, Zod, TanStack Query v5, date-fns, Lucide React (003-events-crud)
- Supabase PostgreSQL (`events` table exists from Phase 1) (003-events-crud)
- TypeScript 5.x with React 18+ + React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React, Zod (004-wedding-dashboard)
- Supabase PostgreSQL (existing tables: weddings, events, guests, activity_log, budget_categories) (004-wedding-dashboard)
- TypeScript 5.x with React 18+ + React Router v6, Tailwind CSS v3, Shadcn/ui, Lucide React, Zustand (drawer state) (005-navigation-shell)
- N/A (no new database tables) (005-navigation-shell)
- TypeScript 5.x with React 18+ + React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, Lucide React, date-fns, Zod (006-guest-list)
- Supabase PostgreSQL (`guests` and `guest_event_attendance` tables exist) (006-guest-list)
- TypeScript 5.x with React 18+ + React Hook Form, Zod, TanStack Query v5, Shadcn/ui, date-fns, Lucide React (007-guest-crud-attendance)
- Supabase PostgreSQL (guests, guest_event_attendance tables exist) (007-guest-crud-attendance)
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (008-vendor-management)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (008-vendor-management)
- TypeScript 5.x with React 18+ (strict mode) + React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React (008-vendor-management)
- Supabase PostgreSQL (vendors table exists with RLS enabled) (008-vendor-management)
- Supabase PostgreSQL (tables exist: `vendor_payment_schedule`, `vendor_invoices`, `vendor_contacts`) (009-vendor-payments-invoices)
- Supabase PostgreSQL (existing tables: `vendor_invoices`, `vendor_payment_schedule`) (010-invoice-payment-integration)
- TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React (012-bar-order-management)
- Supabase PostgreSQL (`bar_orders`, `bar_order_items` tables exist with RLS enabled) (012-bar-order-management)
- Supabase PostgreSQL (`wedding_items`, `wedding_item_event_quantities` tables exist with RLS enabled) (013-wedding-items)
- Supabase PostgreSQL (`repurposing_instructions` table exists with RLS enabled) (014-repurposing-timeline)
- TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, @dnd-kit/core, @dnd-kit/sortable, Tailwind CSS v3, date-fns, Lucide React (015-task-management-kanban)
- Supabase PostgreSQL (`pre_post_wedding_tasks` table exists) (015-task-management-kanban)
- TypeScript 5.x with React 19+ + jsPDF, jspdf-autotable, docx, file-saver (new), existing stack (React, Vite, Tailwind, Shadcn/ui) (017-document-generation)
- Supabase PostgreSQL (read-only queries to 16 existing tables) (017-document-generation)
- TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, Lucide React, date-fns (018-notifications)
- Supabase PostgreSQL (`notifications` table already exists from Phase 1) (018-notifications)
- Supabase PostgreSQL (existing `events` and `weddings` tables) (019-final-polish-integration)
- Supabase PostgreSQL (existing tables: guests, vendors, vendor_payment_schedule, pre_post_wedding_tasks, users) (020-dashboard-settings-fix)
- TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React (022-dashboard-visual-metrics)
- Supabase PostgreSQL (existing tables: weddings, events, guests, vendor_invoices, wedding_items, bar_orders) (022-dashboard-visual-metrics)
- TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, Shadcn/ui, Tailwind CSS v3, Recharts, date-fns, Lucide React (023-dashboard-bug-fixes)
- Supabase PostgreSQL (no schema changes required) (023-dashboard-bug-fixes)
- Supabase PostgreSQL (`meal_options`, `guests`, `guest_event_attendance` tables) (024-guest-menu-management)
- Supabase PostgreSQL (guests, meal_options tables) (025-guest-page-fixes)

- SQL (PostgreSQL 15+ via Supabase) + Supabase (PostgreSQL, Auth, Storage) (001-database-schema-foundation)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for SQL (PostgreSQL 15+ via Supabase)

## Code Style

SQL (PostgreSQL 15+ via Supabase): Follow standard conventions

## Recent Changes
- 025-guest-page-fixes: Added TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
- 025-guest-page-fixes: Added TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
- 024-guest-menu-management: Added TypeScript 5.x with React 18+ (strict mode enabled) + React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
