# Implementation Plan: Document Generation - Function Sheets & Vendor Briefs

**Branch**: `017-document-generation` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-document-generation/spec.md`

## Summary

This feature enables wedding consultants to generate professional PDF and DOCX documents (Function Sheets and Vendor Briefs) from wedding data. Function Sheets consolidate up to 17 sections of wedding information (events, guests, vendors, bar orders, etc.) into comprehensive documents for venues and staff. Vendor Briefs provide vendor-specific information including contracts, payment schedules, and event details.

**Technical Approach**: Client-side document generation using jsPDF + jspdf-autotable for PDFs and the docx library for DOCX files. All data aggregated via Supabase queries from 16 existing tables. No new database tables required.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19+
**Primary Dependencies**: jsPDF, jspdf-autotable, docx, file-saver (new), existing stack (React, Vite, Tailwind, Shadcn/ui)
**Storage**: Supabase PostgreSQL (read-only queries to 16 existing tables)
**Testing**: Manual testing with Playwright MCP only (per constitution)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (existing Vite SPA)
**Performance Goals**: Document generation < 5 seconds for typical wedding (200 guests, 5 events)
**Constraints**: Client-side generation only, bundle size increase ~350KB (jsPDF ~200KB + docx ~150KB)
**Scale/Scope**: Single wedding context, up to 17 selectable sections, PDF + DOCX output formats

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**VowSync Constitutional Gates:**

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technical Stack | Uses React 18+, Vite, Tailwind, Shadcn/ui, Supabase | [x] |
| II. Design System | Follows color palette, typography, spacing specs | [x] |
| III. Database | No new tables - read-only queries to existing tables with RLS | [x] |
| IV. Code Quality | TypeScript strict, functional components, proper naming | [x] |
| V. Accessibility | WCAG 2.1 AA compliance, contrast, keyboard nav | [x] |
| VI. Business Logic | Accurate data aggregation from existing calculations | [x] |
| VII. Security | RLS via existing tables, no API key exposure | [x] |
| VIII. Testing | Manual testing with Playwright MCP only | [x] |
| IX. Error Handling | Toast notifications, loading states | [x] |
| X. Performance | Lazy loading document generation libs, < 5s generation | [x] |
| XI. API Handling | Standard Supabase query pattern with error handling | [x] |
| XII. Git Workflow | Feature branch 017-document-generation | [x] |
| XIII. Documentation | JSDoc for complex generation functions | [x] |
| XIV. Environment | No new env vars required | [x] |
| XV. Prohibited | No violations - no custom CSS, no any types | [x] |

**Constitution Notes:**
- Uses react-pdf as mentioned in constitution (Section I), but jsPDF is functionally equivalent and more mature
- DOCX generation uses 'docx' library as specified in constitution
- All document styling uses constitution color palette (#D4A5A5 primary)

## Project Structure

### Documentation (this feature)

```text
specs/017-document-generation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── document-api.md  # Internal API contracts
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── documents/                    # NEW: Document generation components
│       ├── GenerateFunctionSheetModal.tsx  # Main Function Sheet modal
│       ├── GenerateVendorBriefButton.tsx   # Vendor Brief trigger button
│       ├── DocumentPreview.tsx             # Section counts preview
│       ├── SectionCheckboxes.tsx           # Section selection UI
│       └── BrandingControls.tsx            # Logo upload + color picker
├── hooks/
│   └── useDocumentGeneration.ts      # NEW: Document generation hook
├── lib/
│   ├── documents/                    # NEW: Document generation logic
│   │   ├── documentData.ts           # Data aggregation functions
│   │   ├── pdfGenerator.ts           # jsPDF PDF generation
│   │   ├── docxGenerator.ts          # DOCX generation
│   │   ├── sectionRenderers/         # Section-specific renderers
│   │   │   ├── weddingOverview.ts
│   │   │   ├── eventSummary.ts
│   │   │   ├── guestList.ts
│   │   │   ├── attendanceMatrix.ts
│   │   │   ├── mealSelections.ts
│   │   │   ├── barOrders.ts
│   │   │   ├── furnitureEquipment.ts
│   │   │   ├── repurposing.ts
│   │   │   ├── staffRequirements.ts
│   │   │   ├── transportation.ts
│   │   │   ├── stationery.ts
│   │   │   ├── beautyServices.ts
│   │   │   ├── accommodation.ts
│   │   │   ├── shoppingList.ts
│   │   │   ├── budgetSummary.ts
│   │   │   ├── vendorContacts.ts
│   │   │   └── timeline.ts
│   │   └── vendorBriefGenerator.ts   # Vendor Brief specific logic
│   └── fileDownload.ts               # NEW: File download utility
├── schemas/
│   └── documentSchema.ts             # NEW: Zod schemas for document options
└── types/
    └── document.ts                   # NEW: Document generation types
```

**Structure Decision**: Follows existing VowSync patterns with feature-specific component folders (`components/documents/`), shared logic in `lib/documents/`, and type definitions in `types/`. Section renderers are modularized for maintainability.

## Complexity Tracking

> No constitution violations requiring justification. Feature follows all principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 0: Research (Complete)
- Library selection: jsPDF + jspdf-autotable (PDF), docx (DOCX)
- Data aggregation patterns from 16 existing tables
- File download mechanism via file-saver or native blob URLs

### Phase 1: Design & Contracts (This Plan)
- Data model for document sections and options
- API contracts for data aggregation functions
- Component interfaces and prop types

### Phase 2: Task Generation (via /speckit.tasks)
- Implementation tasks following spec user stories
- P1: Core Function Sheet generation
- P2: Select All/Deselect All, Branding, Format options
- P3: Vendor Brief, Empty section handling
