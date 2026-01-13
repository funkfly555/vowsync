<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                         SYNC IMPACT REPORT                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Version Change: 0.0.0 → 1.0.0 (MAJOR - Initial constitution creation)        ║
║                                                                               ║
║ Modified Principles: N/A (Initial creation)                                   ║
║                                                                               ║
║ Added Sections (15):                                                          ║
║   1. Technical Stack (Non-Negotiable)                                         ║
║   2. Design System (Exact Specifications)                                     ║
║   3. Database Principles                                                      ║
║   4. Code Quality Standards                                                   ║
║   5. Accessibility (WCAG 2.1 AA)                                              ║
║   6. Business Logic Accuracy                                                  ║
║   7. Security (Non-Negotiable)                                                ║
║   8. Testing Strategy                                                         ║
║   9. Error Handling                                                           ║
║   10. Performance Requirements                                                ║
║   11. API Response Handling                                                   ║
║   12. Git Workflow                                                            ║
║   13. Documentation Requirements                                              ║
║   14. Environment Variables                                                   ║
║   15. Prohibited Practices                                                    ║
║                                                                               ║
║ Removed Sections: N/A (Initial creation)                                      ║
║                                                                               ║
║ Templates Requiring Updates:                                                  ║
║   - .specify/templates/plan-template.md ✅ Compatible                         ║
║   - .specify/templates/spec-template.md ✅ Compatible                         ║
║   - .specify/templates/tasks-template.md ✅ Compatible (tests optional)       ║
║                                                                               ║
║ Follow-up TODOs: None                                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

# VowSync Constitution

**Version:** 1.0.0
**Status:** IMMUTABLE - Changes require explicit amendment
**Purpose:** Non-negotiable rules governing ALL development

---

## Core Principles

### I. Technical Stack (NON-NEGOTIABLE)

All development MUST use the following technologies without exception.

#### Frontend Framework
- React 18+ with TypeScript (strict mode enabled)
- Vite as build tool
- React Router v6 for routing
- **PROHIBITED:** Next.js, Create React App

#### Styling & Design
- Tailwind CSS v3+ (utility-first approach)
- Shadcn/ui component library (copy/paste components)
- **PROHIBITED:** Custom CSS files, Material-UI, Bootstrap, Chakra UI

#### State Management
- Zustand OR Redux Toolkit (choose one, maintain consistency)
- React Query (TanStack Query v5) for server state
- **PROHIBITED:** Context API for global state, MobX

#### Forms & Validation
- React Hook Form for ALL forms
- Zod for ALL validation schemas
- **PROHIBITED:** Formik, Yup

#### Backend & Database
- Supabase (PostgreSQL) for ALL data storage
- Supabase Auth for authentication
- Supabase Storage for file uploads
- **PROHIBITED:** Firebase, MongoDB, custom backend server

#### Required Libraries
- TanStack Table v8 for data tables
- date-fns for date manipulation
- react-pdf for PDF generation
- docx library for DOCX generation
- Papaparse for CSV parsing
- Lucide React for icons

**Rationale:** Standardized stack ensures maintainability, developer onboarding efficiency, and consistent patterns across all features.

---

### II. Design System (Exact Specifications)

All UI components MUST conform to these exact specifications.

#### Color Palette

```css
/* Primary Colors */
--brand-primary: #D4A5A5;       /* Dusty Rose */
--brand-secondary: #A8B8A6;     /* Sage Green */
--accent-gold: #C9A961;         /* Accent Gold */

/* Neutrals */
--background-light: #FAFAFA;
--background-white: #FFFFFF;
--surface: #F5F5F5;
--border-light: #E8E8E8;

/* Text */
--text-primary: #2C2C2C;
--text-secondary: #6B6B6B;
--text-disabled: #A0A0A0;
--text-inverse: #FFFFFF;

/* Semantic */
--success: #4CAF50;
--warning: #FF9800;
--error: #F44336;
--info: #2196F3;

/* Event Colors (7 events) */
--event-1: #E8B4B8;
--event-2: #F5E6D3;
--event-3: #C9D4C5;
--event-4: #E5D4EF;
--event-5: #FFE5CC;
--event-6: #D4E5F7;
--event-7: #F7D4E5;
```

#### Typography

```css
/* Font Stack */
--font-primary: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Playfair Display', Georgia, serif;

/* Font Sizes (16px MINIMUM for body text) */
--text-display-lg: 48px / 700;
--text-display-md: 36px / 700;
--text-h1: 32px / 600;
--text-h2: 24px / 600;
--text-h3: 20px / 600;
--text-body: 16px / 400;
--text-button: 16px / 500;

/* Line Heights */
--line-height-heading: 1.2;
--line-height-body: 1.6;
```

#### Spacing System (8px Grid)

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

#### Component Specifications

| Component | Property | Value |
|-----------|----------|-------|
| Cards | border-radius | 8px |
| Cards | box-shadow | 0 2px 8px rgba(0,0,0,0.08) |
| Cards | padding | 24px |
| Cards | border | 1px solid #E8E8E8 |
| Buttons | height | 40px |
| Buttons | border-radius | 6px |
| Buttons | padding | 12px 24px |
| Form Inputs | height | 40px |
| Form Inputs | border-radius | 6px |
| Form Inputs | font-size | 16px (prevents iOS zoom) |
| Form Inputs | focus | 2px solid brand-primary |
| Modals | max-width | 600px |
| Modals | border-radius | 12px |
| Modals | padding | 32px |

#### Responsive Breakpoints

| Breakpoint | Range |
|------------|-------|
| Mobile | 320px - 767px |
| Tablet | 768px - 1023px |
| Desktop | 1024px - 1439px |
| Desktop Large | 1440px+ |

**Rationale:** Consistent design language ensures professional appearance and brand coherence across all features.

---

### III. Database Principles

All database tables MUST follow these structural requirements.

#### Required on ALL Tables
- UUID primary keys using `gen_random_uuid()`
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Update trigger for `updated_at` column

#### Row Level Security (RLS) - CRITICAL

RLS MUST be enabled on ALL tables without exception.

**Parent Table Pattern (weddings):**
```sql
CREATE POLICY "Users can view own weddings"
  ON weddings FOR SELECT
  USING (auth.uid() = consultant_id);
```

**Child Table Pattern (guests, vendors, etc.):**
```sql
CREATE POLICY "Users can view guests of their weddings"
  ON guests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND weddings.consultant_id = auth.uid()
    )
  );
```

#### Relationships
- Foreign keys with ON DELETE CASCADE for child records
- Foreign keys with ON DELETE SET NULL for optional references
- All many-to-many via junction tables

#### Constraints
- Check constraints for enums (e.g., `status IN ('pending', 'paid')`)
- NOT NULL on required fields
- UNIQUE constraints where appropriate
- Generated columns for calculated values

**Rationale:** RLS ensures data isolation between consultants; standardized structure enables predictable query patterns.

---

### IV. Code Quality Standards

All code MUST meet these quality requirements.

#### TypeScript Rules
- Strict mode MUST be enabled in tsconfig.json
- **PROHIBITED:** 'any' types (use 'unknown' if necessary)
- Interfaces MUST be used for data models
- Enums MUST be used for status types
- All function parameters and returns MUST be typed

#### React Component Rules
- Functional components ONLY
- **PROHIBITED:** Class components
- Custom hooks MUST be used for business logic
- Props interfaces MUST exist for ALL components
- Error boundaries MUST wrap major sections
- Memo MUST be used for expensive components

#### File Organization

```
src/
├── components/
│   ├── ui/              # Shadcn components
│   ├── guests/          # Feature-specific components
│   ├── vendors/
│   ├── events/
│   └── layout/          # App shell, header, sidebar
├── hooks/               # Custom hooks
├── lib/
│   ├── supabase.ts      # Supabase client setup
│   ├── utils.ts         # Helper functions
│   └── types.ts         # Global TypeScript types
├── pages/               # Route components
├── schemas/             # Zod validation schemas
└── styles/              # Tailwind config only
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | GuestList.tsx |
| Hooks | camelCase with 'use' prefix | useGuests.ts |
| Utils | camelCase | formatDate.ts |
| Constants | SCREAMING_SNAKE_CASE | MAX_GUESTS |
| Database tables | snake_case | wedding_events |
| Database columns | snake_case | first_name |

**Rationale:** Consistent code structure reduces cognitive load and enables efficient codebase navigation.

---

### V. Accessibility (WCAG 2.1 AA)

All features MUST meet WCAG 2.1 AA compliance.

#### Critical Requirements
- Color contrast MUST be minimum 4.5:1 for text
- Color contrast MUST be minimum 3:1 for large text (18px+)
- Touch targets MUST be minimum 44px × 44px
- Keyboard navigation MUST work for ALL interactive elements
- Focus indicators MUST exist on ALL focusable elements
- Semantic HTML MUST be used (nav, main, section, article)
- Alt text MUST exist on ALL images
- Labels MUST exist on ALL form inputs
- ARIA labels MUST be added where needed

#### Focus Indicator Standard

```css
:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

**Rationale:** Accessibility is a legal requirement and ensures the platform is usable by all wedding consultants.

---

### VI. Business Logic Accuracy

All calculations and validations MUST be accurate.

#### Calculation Formulas
- **Bar orders:** `ROUNDUP(servings / servings_per_unit)`
- **Equipment totals:** IF aggregation_method = 'ADD' THEN SUM, IF 'MAX' THEN MAX
- **Budget variance:** `actual_amount - projected_amount`
- **Event duration:** Auto-calculated from `start_time` and `end_time`

#### Validation Rules
- **RSVP warnings:** 7 days before, on deadline, overdue
- **Payment reminders:** 7 days before, on deadline, overdue
- **Bar order percentages:** MUST total 90-110%
- **Repurposing times:** Pickup time < Dropoff time
- **Contract expiry:** Warning at 30 days, error if expired
- **Insurance expiry:** Warning at 30 days, auto-invalidate if expired

**Rationale:** Wedding planning requires precise calculations; errors can result in costly mistakes for clients.

---

### VII. Security (NON-NEGOTIABLE)

All features MUST implement these security measures.

#### API Security
- ALL Supabase calls MUST use authenticated client
- **PROHIBITED:** Exposing API keys in frontend
- Rate limiting: 100 requests/10 seconds (Supabase default)
- Input validation MUST exist on BOTH client (Zod) and server (PostgreSQL constraints)

#### Data Protection
- **PROHIBITED:** Storing passwords in plain text (Supabase Auth handles this)
- **PROHIBITED:** Storing credit card information
- PII MUST be encrypted at rest (Supabase default)
- GDPR compliance: data export and deletion capabilities MUST exist

#### File Uploads
- Max file size: 10MB
- Allowed types: PDF, JPG, PNG, DOCX, XLSX
- Storage: Private Supabase buckets with RLS

**Rationale:** Wedding data is highly sensitive; security breaches would be catastrophic for business reputation.

---

### VIII. Testing Strategy

Testing follows a manual-first approach.

#### NO Automated Testing Required
- **PROHIBITED:** Jest/Vitest unit tests in codebase
- **PROHIBITED:** React Testing Library
- **PROHIBITED:** E2E test suites in codebase
- **ALLOWED:** Manual testing with Playwright MCP ONLY

#### Manual Testing Requirements
- Test on Chrome, Firefox, Safari
- Test on mobile (iOS Safari, Android Chrome)
- Test keyboard navigation
- Test screen reader compatibility (VoiceOver, NVDA)

**Rationale:** Manual testing with Playwright MCP provides sufficient coverage; automated test maintenance overhead is avoided.

---

### IX. Error Handling

All errors MUST be handled gracefully.

#### User-Facing Errors
- Toast notifications MUST be used for ALL errors (Shadcn Toast)
- Error messages MUST be user-friendly
- **PROHIBITED:** Stack traces shown to users
- Retry buttons MUST exist for failed operations
- Fallback UI MUST exist for component errors (Error Boundaries)
- Loading states MUST exist for async operations

#### Console Errors
- Errors MAY be logged to console in development
- **PROHIBITED:** console.log in production
- Logging service (Sentry) is optional

**Rationale:** Professional error handling improves user experience and reduces support burden.

---

### X. Performance Requirements

All features MUST meet these performance targets.

#### Page Load Targets
- First Contentful Paint: < 1.2s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s

#### Optimization Strategies (MUST implement)
- Lazy load routes with `React.lazy()`
- Optimize images (WebP format, responsive sizes)
- Code splitting for large features
- Virtual scrolling for lists > 100 items (TanStack Virtual)
- Memoize expensive calculations
- Debounce search inputs

**Rationale:** Wedding consultants often work in various network conditions; performance is critical for productivity.

---

### XI. API Response Handling

All API interactions MUST follow this pattern.

#### Standard Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

#### Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId);

  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error fetching guests:', error);
  toast.error('Failed to load guests. Please try again.');
  throw error;
}
```

**Rationale:** Consistent API patterns enable predictable error handling and debugging.

---

### XII. Git Workflow

All development MUST follow this workflow.

#### Branch Naming
- Feature branches: `feature/wedding-crud`
- Bug fixes: `fix/rsvp-deadline-calculation`
- Hotfixes: `hotfix/security-patch`

#### Commits
- Commit messages MUST be descriptive
- Spec files SHOULD be referenced in commits
- Commits MUST be squashed before merging to main

**Rationale:** Clean git history enables efficient code review and debugging.

---

### XIII. Documentation Requirements

All code MUST meet documentation standards.

#### Code Comments
- JSDoc MUST exist for complex functions
- Inline comments MUST exist for non-obvious business logic
- **PROHIBITED:** Comments for self-explanatory code

#### README Requirements
- Setup instructions MUST exist
- Environment variables MUST be listed
- Database setup steps MUST exist
- Deployment instructions MUST exist

**Rationale:** Documentation ensures maintainability and enables efficient onboarding.

---

### XIV. Environment Variables

All configuration MUST use environment variables.

#### Required Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### Security Rules
- **PROHIBITED:** .env files in git
- .env.example MUST be used as template
- Secrets MUST be managed in deployment platform

**Rationale:** Environment-based configuration enables secure deployment across environments.

---

### XV. Prohibited Practices

The following practices are NEVER allowed.

- Bypass RLS policies
- Store sensitive data in localStorage
- Use inline styles (use Tailwind classes)
- Create custom CSS files (use Tailwind)
- Use 'any' type in TypeScript
- Skip form validation
- Hardcode configuration values
- Commit API keys or secrets
- Use class components
- Use Context API for global state

**Rationale:** These practices introduce security vulnerabilities, maintenance burden, or inconsistency.

---

## Governance

### Amendment Process
1. Any deviation from this constitution MUST receive explicit approval
2. Constitution amendments MUST be made via `/speckit.constitution` command
3. All downstream specs MUST be updated following amendments

### Compliance Review
- All PRs MUST verify compliance with these principles
- Non-compliant code MUST be refactored
- Features violating principles MAY be rejected
- Specs MUST be revised if constitutional violations are identified

### Versioning Policy
- **MAJOR:** Backward incompatible principle removals or redefinitions
- **MINOR:** New principle/section added or materially expanded guidance
- **PATCH:** Clarifications, wording, typo fixes, non-semantic refinements

---

**Version**: 1.0.0 | **Ratified**: 2025-01-13 | **Last Amended**: 2025-01-13
