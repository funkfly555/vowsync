# Tasks: Document Generation - Function Sheets & Vendor Briefs

**Input**: Design documents from `/specs/017-document-generation/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/document-api.md, quickstart.md

**Tests**: Manual testing with Playwright MCP only (per VowSync constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create type definitions

- [ ] T001 Install document generation dependencies: `npm install jspdf jspdf-autotable docx`
- [ ] T002 [P] Create jsPDF type augmentation in `src/types/jspdf-autotable.d.ts`
- [ ] T003 [P] Create document types in `src/types/document.ts` (DocumentSection, DocumentBranding, FunctionSheetOptions, etc.)
- [ ] T004 [P] Create Zod validation schemas in `src/schemas/documentSchema.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and data aggregation that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create file download utility in `src/lib/fileDownload.ts` (downloadFile, sanitizeFilename functions)
- [ ] T006 Create document data aggregation module in `src/lib/documents/documentData.ts` (aggregateDocumentData, getSectionCounts functions)
- [ ] T007 [P] Create PDF generator scaffold in `src/lib/documents/pdfGenerator.ts` (generatePDF function with lazy loading)
- [ ] T008 [P] Create DOCX generator scaffold in `src/lib/documents/docxGenerator.ts` (generateDOCX function with lazy loading)
- [ ] T009 Create useDocumentGeneration hook in `src/hooks/useDocumentGeneration.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate Function Sheet with Section Selection (Priority: P1) 🎯 MVP

**Goal**: Wedding consultants can generate a comprehensive Function Sheet PDF with selected sections

**Independent Test**: Click "Generate Docs" on dashboard → select sections → generate PDF → verify document downloads with correct data

### Section Renderers for User Story 1

> These renderers are needed for the core Function Sheet functionality

- [ ] T010 [P] [US1] Create Wedding Overview renderer in `src/lib/documents/sectionRenderers/weddingOverview.ts`
- [ ] T011 [P] [US1] Create Event Summary renderer in `src/lib/documents/sectionRenderers/eventSummary.ts`
- [ ] T012 [P] [US1] Create Guest List renderer in `src/lib/documents/sectionRenderers/guestList.ts`
- [ ] T013 [P] [US1] Create Attendance Matrix renderer in `src/lib/documents/sectionRenderers/attendanceMatrix.ts`
- [ ] T014 [P] [US1] Create Meal Selections renderer in `src/lib/documents/sectionRenderers/mealSelections.ts`
- [ ] T015 [P] [US1] Create Bar Orders renderer in `src/lib/documents/sectionRenderers/barOrders.ts`
- [ ] T016 [P] [US1] Create Furniture & Equipment renderer in `src/lib/documents/sectionRenderers/furnitureEquipment.ts`
- [ ] T017 [P] [US1] Create Repurposing Instructions renderer in `src/lib/documents/sectionRenderers/repurposing.ts`
- [ ] T018 [P] [US1] Create Staff Requirements renderer in `src/lib/documents/sectionRenderers/staffRequirements.ts`
- [ ] T019 [P] [US1] Create Transportation renderer in `src/lib/documents/sectionRenderers/transportation.ts`
- [ ] T020 [P] [US1] Create Stationery renderer in `src/lib/documents/sectionRenderers/stationery.ts`
- [ ] T021 [P] [US1] Create Beauty Services renderer in `src/lib/documents/sectionRenderers/beautyServices.ts`
- [ ] T022 [P] [US1] Create Accommodation renderer in `src/lib/documents/sectionRenderers/accommodation.ts`
- [ ] T023 [P] [US1] Create Shopping List renderer in `src/lib/documents/sectionRenderers/shoppingList.ts`
- [ ] T024 [P] [US1] Create Budget Summary renderer in `src/lib/documents/sectionRenderers/budgetSummary.ts`
- [ ] T025 [P] [US1] Create Vendor Contacts renderer in `src/lib/documents/sectionRenderers/vendorContacts.ts`
- [ ] T026 [P] [US1] Create Timeline renderer in `src/lib/documents/sectionRenderers/timeline.ts`
- [ ] T027 [US1] Create section renderer index in `src/lib/documents/sectionRenderers/index.ts` (exports all renderers)

### UI Components for User Story 1

- [ ] T028 [P] [US1] Create SectionCheckboxes component in `src/components/documents/SectionCheckboxes.tsx`
- [ ] T029 [P] [US1] Create DocumentPreview component in `src/components/documents/DocumentPreview.tsx`
- [ ] T030 [US1] Create GenerateFunctionSheetModal component in `src/components/documents/GenerateFunctionSheetModal.tsx`
- [ ] T031 [US1] Update DashboardQuickActions to open GenerateFunctionSheetModal in `src/components/dashboard/DashboardQuickActions.tsx`

### Integration for User Story 1

- [ ] T032 [US1] Complete PDF generator with all section renderers in `src/lib/documents/pdfGenerator.ts`
- [ ] T033 [US1] Wire up useDocumentGeneration hook with generateFunctionSheet function

**Checkpoint**: At this point, User Story 1 should be fully functional - users can generate PDF Function Sheets with section selection

---

## Phase 4: User Story 2 - Bulk Section Selection Controls (Priority: P2)

**Goal**: Quick select/deselect all sections for efficient document configuration

**Independent Test**: Click "Select All" → verify all 17 checkboxes checked → click "Deselect All" → verify all unchecked

### Implementation for User Story 2

- [ ] T034 [US2] Add "Select All" button functionality to SectionCheckboxes in `src/components/documents/SectionCheckboxes.tsx`
- [ ] T035 [US2] Add "Deselect All" button functionality to SectionCheckboxes in `src/components/documents/SectionCheckboxes.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Branding Customization (Priority: P2)

**Goal**: Customize documents with logo and brand colors

**Independent Test**: Upload logo → select color → generate document → verify logo in header and colors applied

### Implementation for User Story 3

- [ ] T036 [P] [US3] Create processLogoFile utility in `src/lib/documents/logoProcessor.ts`
- [ ] T037 [P] [US3] Create BrandingControls component in `src/components/documents/BrandingControls.tsx`
- [ ] T038 [US3] Integrate BrandingControls into GenerateFunctionSheetModal
- [ ] T039 [US3] Update PDF generator to apply branding (logo, colors) in `src/lib/documents/pdfGenerator.ts`

**Checkpoint**: At this point, User Stories 1, 2, and 3 should all work independently

---

## Phase 6: User Story 4 - Multiple Output Formats (Priority: P2)

**Goal**: Generate documents in PDF, DOCX, or both formats

**Independent Test**: Select DOCX → generate → verify .docx downloads → select "both" → verify both files download

### DOCX Section Renderers for User Story 4

- [ ] T040 [P] [US4] Extend Wedding Overview renderer with DOCX output in `src/lib/documents/sectionRenderers/weddingOverview.ts`
- [ ] T041 [P] [US4] Extend Event Summary renderer with DOCX output in `src/lib/documents/sectionRenderers/eventSummary.ts`
- [ ] T042 [P] [US4] Extend Guest List renderer with DOCX output in `src/lib/documents/sectionRenderers/guestList.ts`
- [ ] T043 [P] [US4] Extend Attendance Matrix renderer with DOCX output in `src/lib/documents/sectionRenderers/attendanceMatrix.ts`
- [ ] T044 [P] [US4] Extend Meal Selections renderer with DOCX output in `src/lib/documents/sectionRenderers/mealSelections.ts`
- [ ] T045 [P] [US4] Extend Bar Orders renderer with DOCX output in `src/lib/documents/sectionRenderers/barOrders.ts`
- [ ] T046 [P] [US4] Extend Furniture & Equipment renderer with DOCX output in `src/lib/documents/sectionRenderers/furnitureEquipment.ts`
- [ ] T047 [P] [US4] Extend Repurposing Instructions renderer with DOCX output in `src/lib/documents/sectionRenderers/repurposing.ts`
- [ ] T048 [P] [US4] Extend Staff Requirements renderer with DOCX output in `src/lib/documents/sectionRenderers/staffRequirements.ts`
- [ ] T049 [P] [US4] Extend Transportation renderer with DOCX output in `src/lib/documents/sectionRenderers/transportation.ts`
- [ ] T050 [P] [US4] Extend Stationery renderer with DOCX output in `src/lib/documents/sectionRenderers/stationery.ts`
- [ ] T051 [P] [US4] Extend Beauty Services renderer with DOCX output in `src/lib/documents/sectionRenderers/beautyServices.ts`
- [ ] T052 [P] [US4] Extend Accommodation renderer with DOCX output in `src/lib/documents/sectionRenderers/accommodation.ts`
- [ ] T053 [P] [US4] Extend Shopping List renderer with DOCX output in `src/lib/documents/sectionRenderers/shoppingList.ts`
- [ ] T054 [P] [US4] Extend Budget Summary renderer with DOCX output in `src/lib/documents/sectionRenderers/budgetSummary.ts`
- [ ] T055 [P] [US4] Extend Vendor Contacts renderer with DOCX output in `src/lib/documents/sectionRenderers/vendorContacts.ts`
- [ ] T056 [P] [US4] Extend Timeline renderer with DOCX output in `src/lib/documents/sectionRenderers/timeline.ts`

### Integration for User Story 4

- [ ] T057 [US4] Complete DOCX generator with all section renderers in `src/lib/documents/docxGenerator.ts`
- [ ] T058 [US4] Add format selection UI (PDF/DOCX/Both) to GenerateFunctionSheetModal
- [ ] T059 [US4] Update useDocumentGeneration hook to handle multiple formats

**Checkpoint**: At this point, all P1 and P2 user stories should be functional

---

## Phase 7: User Story 5 - Generate Vendor Brief (Priority: P3)

**Goal**: Generate vendor-specific brief documents from vendor detail page

**Independent Test**: Navigate to vendor page → click "Generate Vendor Brief" → verify document includes vendor details, payment schedule, event info

### Implementation for User Story 5

- [ ] T060 [P] [US5] Create VendorBriefData type in `src/types/document.ts`
- [ ] T061 [P] [US5] Create aggregateVendorBriefData function in `src/lib/documents/documentData.ts`
- [ ] T062 [US5] Create Vendor Brief PDF renderer in `src/lib/documents/vendorBriefGenerator.ts`
- [ ] T063 [US5] Create GenerateVendorBriefButton component in `src/components/documents/GenerateVendorBriefButton.tsx`
- [ ] T064 [US5] Add generateVendorBrief function to useDocumentGeneration hook
- [ ] T065 [US5] Integrate GenerateVendorBriefButton into vendor detail page

**Checkpoint**: At this point, Vendor Briefs can be generated from vendor pages

---

## Phase 8: User Story 6 - Empty Section Handling (Priority: P3)

**Goal**: Automatically exclude empty sections from generated documents

**Independent Test**: Select "Bar Orders" for wedding with no bar orders → generate → verify section omitted from document

### Implementation for User Story 6

- [ ] T066 [US6] Add shouldIncludeSection utility to check for empty data in `src/lib/documents/documentData.ts`
- [ ] T067 [US6] Update PDF generator to skip empty sections in `src/lib/documents/pdfGenerator.ts`
- [ ] T068 [US6] Update DOCX generator to skip empty sections in `src/lib/documents/docxGenerator.ts`
- [ ] T069 [US6] Update DocumentPreview to show warning icon for empty sections
- [ ] T070 [US6] Display accurate counts (including 0) in section counts preview

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Final Validation

**Purpose**: Final improvements and validation

- [ ] T071 [P] Add error handling for failed generations with user-friendly messages
- [ ] T072 [P] Add filename sanitization for special characters in bride/groom names
- [ ] T073 Add generation cancellation on modal close
- [ ] T074 Performance validation: Test generation time with 200 guests, 5 events (target: < 5 seconds)
- [ ] T075 Run quickstart.md validation checklist
- [ ] T076 Manual Playwright testing of full workflow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P2 → P3)
  - P2 stories (US2, US3, US4) can run in parallel after US1 foundation components exist
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on SectionCheckboxes from US1
- **User Story 3 (P2)**: Depends on GenerateFunctionSheetModal from US1
- **User Story 4 (P2)**: Depends on section renderers from US1
- **User Story 5 (P3)**: Depends on useDocumentGeneration hook from US1
- **User Story 6 (P3)**: Depends on generators and preview from US1

### Within Each User Story

- Section renderers can be developed in parallel (marked [P])
- UI components depend on renderers being available
- Integration tasks depend on all component pieces

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All section renderers within a story (T010-T026) can run in parallel
- DOCX extensions (T040-T056) can run in parallel
- Different user stories can be worked on by different team members once US1 foundation is in place

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Generate a PDF Function Sheet with all sections
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test PDF generation → Deploy/Demo (MVP!)
3. Add User Stories 2-4 → Test format options and branding → Deploy/Demo
4. Add User Stories 5-6 → Test Vendor Briefs and empty handling → Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing only (per VowSync constitution) - use Playwright MCP for validation
- Document libraries (jsPDF, docx) are lazy loaded to reduce initial bundle size
