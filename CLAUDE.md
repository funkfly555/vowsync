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
- 009-vendor-payments-invoices: Added TypeScript 5.x with React 18+ + React Hook Form, Zod, TanStack Query v5, Shadcn/ui, date-fns, Lucide React
- 008-vendor-management: Added TypeScript 5.x with React 18+ (strict mode) + React Router v6, TanStack Query v5, React Hook Form, Zod, Shadcn/ui, Tailwind CSS v3, date-fns, Lucide React
- 008-vendor-management: Added [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
