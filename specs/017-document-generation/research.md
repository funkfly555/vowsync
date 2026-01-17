# Research: Document Generation - Function Sheets & Vendor Briefs

**Feature Branch**: `017-document-generation`
**Date**: 2026-01-17
**Status**: Complete

## Research Questions

### 1. PDF Generation Library Selection

**Decision**: jsPDF + jspdf-autotable

**Rationale**:
- Mature library with extensive documentation
- Excellent table support via jspdf-autotable plugin
- Smaller bundle size (~200KB) compared to @react-pdf/renderer
- Simpler API for programmatic document generation
- Wide browser compatibility
- Active maintenance and community support

**Alternatives Considered**:

| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| jsPDF + jspdf-autotable | Simple API, good tables, mature | Less flexible styling | **Selected** |
| @react-pdf/renderer | React-native, very flexible | Steeper learning curve, larger bundle (~400KB) | Rejected - overkill for this use case |
| pdfmake | Declarative, good tables | Less common, different paradigm | Rejected - team familiarity |
| html2pdf.js | HTML to PDF | Poor table handling, inconsistent | Rejected - quality concerns |

### 2. DOCX Generation Library Selection

**Decision**: docx (npm package)

**Rationale**:
- Only mature option for client-side DOCX generation
- Comprehensive API for paragraphs, tables, styles
- TypeScript support
- Constitution already specifies this library
- ~150KB bundle size

**Alternatives Considered**:

| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| docx | Full-featured, TypeScript | Learning curve | **Selected** |
| officegen | Alternative option | Less maintained, no types | Rejected |
| Server-side generation | More control | Requires backend changes | Future enhancement |

### 3. File Download Mechanism

**Decision**: Native Blob URLs with `URL.createObjectURL()` and anchor click

**Rationale**:
- No additional dependency required
- Works in all modern browsers
- Clean, simple implementation
- Supports both PDF and DOCX blobs

**Implementation Pattern**:
```typescript
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

**Alternative**: file-saver library - adds ~3KB but provides better cross-browser handling. Can be added later if issues arise.

### 4. Data Aggregation Strategy

**Decision**: Parallel Supabase queries with section-conditional fetching

**Rationale**:
- Only fetch data for selected sections (performance)
- Use Promise.all for parallel execution
- Leverage existing RLS policies for security
- Return typed FunctionSheetData object

**Query Strategy**:

| Section | Primary Table | Joins | Estimated Rows |
|---------|---------------|-------|----------------|
| wedding_overview | weddings | - | 1 |
| event_summary | events | - | 1-10 |
| guest_list | guests | - | 50-500 |
| attendance_matrix | guest_event_attendance | guests, events | 50-5000 |
| meal_selections | guests | - | 50-500 |
| bar_orders | bar_orders + bar_order_items | events, vendors | 5-50 |
| furniture_equipment | wedding_items + wedding_item_event_quantities | events | 10-100 |
| repurposing | repurposing_instructions | wedding_items, events | 5-50 |
| staff_requirements | staff_requirements | events, vendors | 5-30 |
| transportation | shuttle_transport | events | 5-20 |
| stationery | stationery_items | - | 5-20 |
| beauty_services | beauty_services | vendors | 5-30 |
| accommodation | cottages + cottage_rooms | - | 5-30 |
| shopping_list | shopping_list_items | - | 10-100 |
| budget_summary | budget_categories + budget_line_items | vendors | 10-50 |
| vendor_contacts | vendors | vendor_payment_schedule | 5-30 |
| timeline | events + pre_post_wedding_tasks | vendors | 10-100 |

### 5. Logo Handling

**Decision**: Client-side image processing with FileReader

**Rationale**:
- No server upload needed (documents are client-side)
- Convert to base64 for embedding in PDF/DOCX
- Validate file type (PNG, JPG, JPEG) and size (< 2MB)
- Store temporarily in component state

**Implementation**:
```typescript
async function processLogo(file: File): Promise<string> {
  // Validate file
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    throw new Error('Invalid file type. Please upload PNG or JPG.');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 2MB.');
  }

  // Convert to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
```

### 6. Color Picker Implementation

**Decision**: Native HTML color input with hex display

**Rationale**:
- Simplest implementation
- No additional dependency
- Consistent with browser capabilities
- Accessible by default

**Alternative considered**: react-colorful - provides better UX but adds ~5KB. Can be upgraded later if needed.

### 7. Performance Optimization

**Decision**: Lazy load document generation libraries

**Rationale**:
- jsPDF + docx add ~350KB to bundle
- Most users won't use document generation on every page load
- Dynamic import reduces initial page load

**Implementation**:
```typescript
// Lazy load when user opens modal
const generatePDF = async () => {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');
  // Generate document...
};

const generateDOCX = async () => {
  const { Document, Packer, Paragraph, Table } = await import('docx');
  // Generate document...
};
```

### 8. Filename Sanitization

**Decision**: Replace invalid characters with hyphens

**Rationale**:
- Handle special characters in bride/groom names
- Ensure cross-platform compatibility
- Maintain readability

**Implementation**:
```typescript
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')  // Replace invalid chars
    .replace(/\s+/g, '-')           // Replace spaces
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '');         // Trim leading/trailing hyphens
}

// Example: "O'Brien" → "O-Brien", "Smith & Jones" → "Smith-Jones"
```

### 9. Document Styling Approach

**Decision**: Constitution-compliant color scheme with professional typography

**PDF Styling**:
- Headers: Brand primary (#D4A5A5) as accent color
- Tables: Grid theme with brand-colored headers
- Body text: 10pt, dark gray (#2C2C2C)
- Section headers: 14pt bold
- Title: 24pt

**DOCX Styling**:
- Use built-in heading styles (Heading1, Heading2)
- Brand color applied to headings
- Tables with grid borders
- Standard paragraph spacing

### 10. Empty Section Detection

**Decision**: Check data array length after fetching

**Rationale**:
- Simple boolean check: `data.length === 0`
- Exclude section from document if empty
- Show "0" in preview counts for transparency

**Implementation**:
```typescript
function shouldIncludeSection(sectionData: unknown[] | undefined): boolean {
  return Array.isArray(sectionData) && sectionData.length > 0;
}
```

## Dependencies to Add

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "docx": "^8.5.0"
  }
}
```

**Note**: file-saver not required initially - native Blob URL download is sufficient.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large wedding (500+ guests) causes slow generation | Medium | Pagination in preview, progress indicator |
| Browser memory issues with large PDFs | Low | Lazy loading, streaming if needed |
| DOCX tables don't render well in all Word versions | Low | Test in Word 2016+, Google Docs, LibreOffice |
| Logo image too large causes PDF bloat | Low | Resize/compress before embedding |
| Special characters in names cause issues | Low | Sanitize filenames, escape content |

## Conclusions

All technical decisions align with VowSync constitution and project patterns. The selected libraries (jsPDF, docx) provide mature, well-supported solutions for client-side document generation. Implementation can proceed to Phase 1 design.
