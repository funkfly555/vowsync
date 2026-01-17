# Feature Specification: Document Generation - Function Sheets & Vendor Briefs

**Feature Branch**: `017-document-generation`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Generate professional Function Sheets and Vendor Briefs in PDF/DOCX format for wedding consultants"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Function Sheet with Section Selection (Priority: P1)

As a wedding consultant, I need to generate a comprehensive Function Sheet document that includes selected sections from the wedding data, so I can provide venues and staff with all relevant details for executing the event.

**Why this priority**: The Function Sheet is the core deliverable that consolidates all wedding information into a single professional document. Without this, the feature has no value.

**Independent Test**: Can be fully tested by selecting sections and generating a PDF document containing wedding overview, events, and guest list data. Delivers immediate value for venue coordination.

**Acceptance Scenarios**:

1. **Given** I am on the wedding dashboard, **When** I click "Generate Function Sheet" quick action, **Then** a modal opens with section selection options and branding customization
2. **Given** the Function Sheet modal is open, **When** I select specific sections via checkboxes, **Then** I see a preview of section counts (e.g., "5 events, 150 guests")
3. **Given** I have selected sections, **When** I click "Generate Document" with PDF format, **Then** a professionally formatted PDF downloads with meaningful filename
4. **Given** sections are being generated, **When** generation is in progress, **Then** I see a loading indicator
5. **Given** generation completes successfully, **When** the document is ready, **Then** I receive a success toast notification and the document downloads automatically

---

### User Story 2 - Bulk Section Selection Controls (Priority: P2)

As a wedding consultant, I need convenient controls to quickly select or deselect all available sections, so I can efficiently customize document contents without clicking each checkbox individually.

**Why this priority**: Efficiency enhancement that improves user experience when generating comprehensive documents or when starting from a blank slate.

**Independent Test**: Can be tested by clicking "Select All" button and verifying all 17 section checkboxes become checked, then clicking "Deselect All" and verifying all become unchecked.

**Acceptance Scenarios**:

1. **Given** I am in the Function Sheet modal, **When** I click "Select All", **Then** all 17 available section checkboxes are checked
2. **Given** all sections are selected, **When** I click "Deselect All", **Then** all section checkboxes are unchecked
3. **Given** some sections are selected, **When** I click "Select All", **Then** all sections become selected

---

### User Story 3 - Branding Customization (Priority: P2)

As a wedding consultant, I need to customize the document branding with my logo and brand colors, so the generated documents reflect my professional identity.

**Why this priority**: Professional presentation is important for client-facing documents but is an enhancement over basic document generation.

**Independent Test**: Can be tested by uploading a logo, selecting a brand color, and generating a document to verify the logo appears in header and colors are applied.

**Acceptance Scenarios**:

1. **Given** I am in the Function Sheet modal, **When** I upload a logo image, **Then** the logo preview appears in the branding section
2. **Given** the branding section is visible, **When** I select a color using the color picker, **Then** the hex value displays and the color is applied to generated documents
3. **Given** no logo is uploaded, **When** I generate a document, **Then** the document generates successfully without a logo in the header

---

### User Story 4 - Multiple Output Formats (Priority: P2)

As a wedding consultant, I need to choose between PDF, DOCX, or both output formats, so I can provide documents in formats suitable for different recipients.

**Why this priority**: Format flexibility is important for practical use cases (print vs. editable documents) but PDF alone provides MVP value.

**Independent Test**: Can be tested by selecting DOCX format and generating to verify a .docx file downloads, then selecting "both" to verify both files download.

**Acceptance Scenarios**:

1. **Given** I am configuring document generation, **When** I select PDF format, **Then** only a PDF file is generated
2. **Given** I am configuring document generation, **When** I select DOCX format, **Then** only a DOCX file is generated
3. **Given** I am configuring document generation, **When** I select "both" option, **Then** both PDF and DOCX files are generated and downloaded

---

### User Story 5 - Generate Vendor Brief (Priority: P3)

As a wedding consultant, I need to generate a focused Vendor Brief document from a vendor's detail page, so I can provide specific vendors with their relevant contract, payment, and event information.

**Why this priority**: Vendor Briefs serve a different audience than Function Sheets and require vendor-specific context, making this a logical extension after core Function Sheet functionality.

**Independent Test**: Can be tested by navigating to a vendor detail page, clicking generate brief, and verifying the downloaded document contains vendor details, payment schedule, and associated event information.

**Acceptance Scenarios**:

1. **Given** I am on a vendor detail page, **When** I click "Generate Vendor Brief", **Then** a document generation modal or action is triggered
2. **Given** I generate a Vendor Brief, **When** generation completes, **Then** the document includes vendor details, contract information, payment schedule, and relevant event details
3. **Given** a vendor has special instructions, **When** I generate their brief, **Then** the special instructions are included in the document

---

### User Story 6 - Empty Section Handling (Priority: P3)

As a wedding consultant, I need empty sections to be automatically excluded from generated documents, so the output is clean and doesn't include placeholder content for missing data.

**Why this priority**: Quality-of-life improvement that ensures professional document output without manual section deselection.

**Independent Test**: Can be tested by selecting the "Bar Orders" section for a wedding with no bar orders, generating the document, and verifying that section is omitted from output.

**Acceptance Scenarios**:

1. **Given** I select a section that has no data, **When** the document generates, **Then** that section is excluded from the final document
2. **Given** all selected sections have data, **When** the document generates, **Then** all sections appear in the document
3. **Given** some sections are empty, **When** I view section counts before generating, **Then** the counts accurately reflect available data (showing 0 for empty sections)

---

### Edge Cases

- What happens when the wedding has no guests entered? Document should generate with empty guest sections omitted
- How does the system handle extremely large weddings (500+ guests)? Generation should complete within acceptable time with progress indication
- What happens if logo upload fails or file is invalid format? Show validation error, allow retry
- How does system handle special characters in bride/groom names for filename? Sanitize filename to remove invalid characters
- What happens during generation if network connection is lost? Show error message, allow retry
- What happens if user closes modal during generation? Cancel generation, no partial files

## Requirements *(mandatory)*

### Functional Requirements

**Document Generation Core**
- **FR-001**: System MUST provide a "Generate Function Sheet" action accessible from the wedding dashboard
- **FR-002**: System MUST display a modal with section selection checkboxes when Function Sheet generation is initiated
- **FR-003**: System MUST support 17 selectable sections: Wedding Overview, Event Summary, Guest List, Attendance Matrix, Meal Selections, Bar Orders, Furniture & Equipment, Repurposing Instructions, Staff Requirements, Transportation, Vendor Contacts, Budget Summary, Timeline, Stationery, Beauty Services, Accommodations, Shopping List
- **FR-004**: System MUST provide "Select All" and "Deselect All" buttons for section checkboxes
- **FR-005**: System MUST display preview counts for selected sections before generation (e.g., "5 events, 150 guests")

**Format and Output**
- **FR-006**: System MUST support PDF output format
- **FR-007**: System MUST support DOCX output format
- **FR-008**: System MUST support generating both PDF and DOCX simultaneously
- **FR-009**: System MUST generate meaningful filenames following pattern: "{BrideName}-{GroomName}-Function-Sheet-{Date}.{ext}"
- **FR-010**: System MUST trigger automatic browser download when document is ready

**Branding Customization**
- **FR-011**: System MUST allow users to upload a logo image for document header
- **FR-012**: System MUST provide a color picker with default brand color (#D4A5A5)
- **FR-013**: System MUST display the selected hex color value alongside the picker
- **FR-014**: System MUST apply uploaded logo and selected color to generated documents

**User Feedback**
- **FR-015**: System MUST display a loading indicator during document generation
- **FR-016**: System MUST display a success toast notification when document generation completes
- **FR-017**: System MUST close the modal after successful document generation

**Content Handling**
- **FR-018**: System MUST automatically exclude sections with no data from generated documents
- **FR-019**: System MUST aggregate and format data from existing database tables for each section
- **FR-020**: System MUST format documents with professional headers, tables, and typography

**Vendor Briefs**
- **FR-021**: System MUST provide a "Generate Vendor Brief" action from vendor detail pages
- **FR-022**: Vendor Brief MUST include vendor details, contract information, payment schedule, event details, and special instructions

### Key Entities *(include if feature involves data)*

**No new database tables required** - This feature reads from existing tables:

- **Wedding**: Core wedding details (couple names, date, venue information) from `weddings` table
- **Event**: Event schedule and details from `events` table
- **Guest**: Guest list with meal choices from `guests` table
- **Attendance**: Guest-event attendance matrix from `guest_event_attendance` table
- **Vendor**: Vendor contacts and contracts from `vendors` and `vendor_payment_schedule` tables
- **Bar Order**: Beverage calculations from `bar_orders` and `bar_order_items` tables
- **Wedding Item**: Furniture/equipment from `wedding_items` and `wedding_item_event_quantities` tables
- **Repurposing**: Item movement instructions from `repurposing_instructions` table
- **Staff**: Staffing requirements from `staff_requirements` table
- **Transport**: Shuttle schedules from `shuttle_transport` table
- **Stationery**: Print materials from `stationery_items` table
- **Beauty**: Appointments from `beauty_services` table
- **Accommodation**: Room bookings from `cottages` and `cottage_rooms` tables
- **Shopping**: Items to purchase from `shopping_list_items` table
- **Budget**: Financial summary from `budget_categories` and `budget_line_items` tables
- **Tasks**: Pre/post wedding tasks from `pre_post_wedding_tasks` table

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a Function Sheet document in under 5 seconds for a typical wedding (200 guests, 5 events)
- **SC-002**: Generated documents include all selected sections with accurate data from the wedding record
- **SC-003**: 95% of document generation attempts complete successfully without errors
- **SC-004**: Users can complete the full document generation workflow (open modal, select sections, generate) in under 60 seconds
- **SC-005**: Generated documents are professionally formatted and ready for client/vendor distribution without manual editing
- **SC-006**: Branding customization (logo and colors) correctly appears in generated documents when configured
- **SC-007**: Empty sections are successfully excluded from 100% of generated documents

## Assumptions

- All referenced database tables exist and are populated with data from previous feature phases
- User has an active wedding context when accessing document generation features
- Browser supports modern file download APIs
- Logo uploads are limited to common image formats (PNG, JPG, JPEG) and reasonable file sizes
- Generated documents are for download only (no server-side storage of generated files in this phase)
- Print-ready formatting assumes standard paper sizes (Letter/A4)
