# Document Generation API Contracts

**Feature Branch**: `017-document-generation`
**Date**: 2026-01-17

## Overview

This document defines the internal API contracts for document generation. These are TypeScript function signatures and component interfaces that form the contract between different parts of the feature.

## Hook API

### useDocumentGeneration

```typescript
/**
 * Hook for generating Function Sheet and Vendor Brief documents
 */
interface UseDocumentGenerationReturn {
  /** Generate a Function Sheet document */
  generateFunctionSheet: (options: FunctionSheetOptions) => Promise<void>;

  /** Generate a Vendor Brief document */
  generateVendorBrief: (options: VendorBriefOptions) => Promise<void>;

  /** Get section counts for preview display */
  getSectionCounts: (weddingId: string) => Promise<SectionCounts>;

  /** Current generation state */
  isGenerating: boolean;

  /** Current error (if any) */
  error: Error | null;

  /** Reset error state */
  clearError: () => void;
}

/**
 * Usage:
 * const { generateFunctionSheet, isGenerating, error } = useDocumentGeneration();
 */
export function useDocumentGeneration(): UseDocumentGenerationReturn;
```

## Data Aggregation API

### aggregateDocumentData

```typescript
/**
 * Aggregates wedding data for selected sections
 *
 * @param weddingId - UUID of the wedding
 * @param sections - Array of selected section identifiers
 * @returns Promise resolving to FunctionSheetData object
 * @throws Error if wedding not found or query fails
 *
 * Performance: Should complete in <2 seconds for typical wedding
 * Only fetches data for selected sections (optimization)
 */
export async function aggregateDocumentData(
  weddingId: string,
  sections: DocumentSection[]
): Promise<FunctionSheetData>;
```

### aggregateVendorBriefData

```typescript
/**
 * Aggregates vendor data for Vendor Brief generation
 *
 * @param vendorId - UUID of the vendor
 * @param weddingId - UUID of the wedding
 * @returns Promise resolving to VendorBriefData object
 * @throws Error if vendor or wedding not found
 */
export async function aggregateVendorBriefData(
  vendorId: string,
  weddingId: string
): Promise<VendorBriefData>;
```

### getSectionCounts

```typescript
/**
 * Gets counts for all sections (for preview display)
 *
 * @param weddingId - UUID of the wedding
 * @returns Promise resolving to SectionCounts object
 *
 * Performance: Should complete in <500ms (parallel count queries)
 * Used for UI preview before generation
 */
export async function getSectionCounts(
  weddingId: string
): Promise<SectionCounts>;
```

## Document Generation API

### generatePDF

```typescript
/**
 * Generates PDF document from aggregated data
 *
 * @param data - Aggregated FunctionSheetData or VendorBriefData
 * @param branding - Logo and color configuration
 * @param sections - Selected sections (determines render order)
 * @returns Promise resolving to PDF Blob
 *
 * Uses: jsPDF + jspdf-autotable (lazy loaded)
 * Performance: <3 seconds for typical wedding
 */
export async function generatePDF(
  data: FunctionSheetData | VendorBriefData,
  branding: DocumentBranding,
  sections: DocumentSection[]
): Promise<Blob>;
```

### generateDOCX

```typescript
/**
 * Generates DOCX document from aggregated data
 *
 * @param data - Aggregated FunctionSheetData or VendorBriefData
 * @param branding - Logo and color configuration
 * @param sections - Selected sections (determines render order)
 * @returns Promise resolving to DOCX Blob
 *
 * Uses: docx library (lazy loaded)
 * Performance: <3 seconds for typical wedding
 */
export async function generateDOCX(
  data: FunctionSheetData | VendorBriefData,
  branding: DocumentBranding,
  sections: DocumentSection[]
): Promise<Blob>;
```

## Utility API

### downloadFile

```typescript
/**
 * Triggers browser download of a file blob
 *
 * @param blob - File content as Blob
 * @param filename - Download filename (will be sanitized)
 *
 * Creates temporary URL, triggers download via anchor click, cleans up
 */
export function downloadFile(blob: Blob, filename: string): void;
```

### sanitizeFilename

```typescript
/**
 * Sanitizes a string for use as filename
 *
 * @param name - Raw filename string
 * @returns Sanitized filename safe for all platforms
 *
 * Removes: < > : " / \ | ? *
 * Replaces spaces with hyphens
 * Collapses multiple hyphens
 */
export function sanitizeFilename(name: string): string;
```

### processLogoFile

```typescript
/**
 * Processes uploaded logo file for document embedding
 *
 * @param file - Uploaded File object
 * @returns Promise resolving to base64 data URL
 * @throws Error if file is invalid type or too large
 *
 * Validates: PNG/JPG only, max 2MB
 */
export async function processLogoFile(file: File): Promise<string>;
```

## Component API

### GenerateFunctionSheetModal

```typescript
interface GenerateFunctionSheetModalProps {
  /** Wedding UUID to generate document for */
  weddingId: string;

  /** Modal open state */
  open: boolean;

  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal for configuring and generating Function Sheet documents
 *
 * Features:
 * - 17 section checkboxes with Select All/Deselect All
 * - Format selection (PDF/DOCX/Both)
 * - Logo upload
 * - Color picker (default #D4A5A5)
 * - Section counts preview
 * - Loading state during generation
 * - Success/error toast notifications
 *
 * Design:
 * - Modal max-width: 600px
 * - Padding: 32px
 * - Uses Shadcn/ui Dialog component
 */
export function GenerateFunctionSheetModal(
  props: GenerateFunctionSheetModalProps
): JSX.Element;
```

### GenerateVendorBriefButton

```typescript
interface GenerateVendorBriefButtonProps {
  /** Vendor UUID */
  vendorId: string;

  /** Wedding UUID (from context) */
  weddingId: string;
}

/**
 * Button component that triggers Vendor Brief generation
 *
 * When clicked:
 * - Opens simple modal or dropdown for format selection
 * - Generates document on confirmation
 * - Shows loading state
 * - Downloads file automatically
 *
 * Design:
 * - Uses Shadcn/ui Button component
 * - FileText icon from Lucide React
 */
export function GenerateVendorBriefButton(
  props: GenerateVendorBriefButtonProps
): JSX.Element;
```

### DocumentPreview

```typescript
interface DocumentPreviewProps {
  /** Section counts to display */
  counts: SectionCounts;

  /** Currently selected sections */
  selectedSections: DocumentSection[];

  /** Loading state for counts */
  isLoading: boolean;
}

/**
 * Displays preview of section counts before generation
 *
 * Shows for each selected section:
 * - Checkmark icon if data exists
 * - Warning icon if no data (will be excluded)
 * - Count of items (e.g., "150 guests", "5 events")
 *
 * Design:
 * - Vertical list of section counts
 * - Color-coded status indicators
 * - Skeleton loading state
 */
export function DocumentPreview(
  props: DocumentPreviewProps
): JSX.Element;
```

### SectionCheckboxes

```typescript
interface SectionCheckboxesProps {
  /** Currently selected sections */
  selectedSections: DocumentSection[];

  /** Callback when selection changes */
  onSelectionChange: (sections: DocumentSection[]) => void;
}

/**
 * Section selection checkboxes with bulk actions
 *
 * Features:
 * - 17 checkboxes organized by category
 * - "Select All" button
 * - "Deselect All" button
 * - Section labels with descriptions
 *
 * Design:
 * - Uses Shadcn/ui Checkbox component
 * - Grouped by logical categories
 * - 2-column grid on desktop
 */
export function SectionCheckboxes(
  props: SectionCheckboxesProps
): JSX.Element;
```

### BrandingControls

```typescript
interface BrandingControlsProps {
  /** Current branding configuration */
  branding: DocumentBranding;

  /** Callback when branding changes */
  onBrandingChange: (branding: DocumentBranding) => void;
}

/**
 * Logo upload and color picker controls
 *
 * Features:
 * - File input for logo upload
 * - Logo preview thumbnail
 * - Remove logo button
 * - Color picker with hex display
 * - Default color: #D4A5A5
 *
 * Design:
 * - Horizontal layout: logo | color picker
 * - Uses native HTML color input
 * - Logo preview: 80x80px max
 */
export function BrandingControls(
  props: BrandingControlsProps
): JSX.Element;
```

## Section Renderer API

Each section has a renderer function for both PDF and DOCX:

```typescript
/**
 * Section renderer interface for PDF generation
 */
interface PDFSectionRenderer {
  /**
   * Renders section to jsPDF document
   *
   * @param doc - jsPDF document instance
   * @param data - Section-specific data
   * @param branding - Document branding config
   * @param startY - Y position to start rendering
   * @returns Y position after rendering (for next section)
   */
  renderToPDF(
    doc: jsPDF,
    data: unknown,
    branding: DocumentBranding,
    startY: number
  ): number;
}

/**
 * Section renderer interface for DOCX generation
 */
interface DOCXSectionRenderer {
  /**
   * Generates DOCX elements for section
   *
   * @param data - Section-specific data
   * @param branding - Document branding config
   * @returns Array of DOCX elements (Paragraphs, Tables, etc.)
   */
  renderToDOCX(
    data: unknown,
    branding: DocumentBranding
  ): Array<Paragraph | Table>;
}

/**
 * Available section renderers
 */
export const sectionRenderers: Record<
  DocumentSection,
  PDFSectionRenderer & DOCXSectionRenderer
>;
```

## Error Handling

All API functions follow this error pattern:

```typescript
try {
  // Operation
} catch (error) {
  console.error('Context-specific error message:', error);
  throw new DocumentGenerationError(
    'User-friendly error message',
    { cause: error }
  );
}
```

Toast notifications are shown at the hook level, not in individual functions.

## Performance Requirements

| Operation | Target Time | Notes |
|-----------|-------------|-------|
| getSectionCounts | < 500ms | Parallel count queries |
| aggregateDocumentData | < 2s | Section-conditional fetching |
| generatePDF | < 3s | For typical wedding (200 guests) |
| generateDOCX | < 3s | For typical wedding (200 guests) |
| Total workflow | < 5s | Including all operations |
