# Quickstart: Document Generation

**Feature Branch**: `017-document-generation`
**Date**: 2026-01-17

## Prerequisites

1. VowSync application running locally
2. Supabase project configured with existing tables
3. Test wedding with populated data (events, guests, vendors, etc.)

## Setup

### 1. Install Dependencies

```bash
npm install jspdf jspdf-autotable docx
```

### 2. TypeScript Types

Add jsPDF type augmentation for autotable:

```typescript
// src/types/jspdf-autotable.d.ts
import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: {
    fillColor?: string | number[];
    textColor?: string | number[];
    fontStyle?: string;
  };
  columnStyles?: Record<number, { cellWidth?: number | 'auto' }>;
}
```

## Quick Implementation Guide

### Step 1: Create Types

Create `src/types/document.ts` with all TypeScript interfaces from `data-model.md`.

### Step 2: Create Zod Schemas

Create `src/schemas/documentSchema.ts` with validation schemas.

### Step 3: Implement Data Aggregation

```typescript
// src/lib/documents/documentData.ts

import { supabase } from '@/lib/supabase';
import type { DocumentSection, FunctionSheetData, SectionCounts } from '@/types/document';

export async function aggregateDocumentData(
  weddingId: string,
  sections: DocumentSection[]
): Promise<FunctionSheetData> {
  // Always fetch wedding
  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', weddingId)
    .single();

  if (weddingError) throw weddingError;

  const data: FunctionSheetData = { wedding };

  // Parallel fetch for selected sections
  const promises: Promise<void>[] = [];

  if (sections.includes('event_summary') || sections.includes('timeline')) {
    promises.push(
      supabase
        .from('events')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('event_order')
        .then(({ data: events }) => {
          data.events = events ?? [];
        })
    );
  }

  if (sections.includes('guest_list') || sections.includes('meal_selections')) {
    promises.push(
      supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('name')
        .then(({ data: guests }) => {
          data.guests = guests ?? [];
        })
    );
  }

  // ... add more sections

  await Promise.all(promises);

  return data;
}

export async function getSectionCounts(weddingId: string): Promise<SectionCounts> {
  const [
    { count: events },
    { count: guests },
    { count: vendors },
    // ... more counts
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    // ... more count queries
  ]);

  return {
    events: events ?? 0,
    guests: guests ?? 0,
    vendors: vendors ?? 0,
    // ... more counts
  };
}
```

### Step 4: Implement PDF Generator

```typescript
// src/lib/documents/pdfGenerator.ts

import type { FunctionSheetData, DocumentBranding, DocumentSection } from '@/types/document';
import { format } from 'date-fns';

export async function generatePDF(
  data: FunctionSheetData,
  branding: DocumentBranding,
  sections: DocumentSection[]
): Promise<Blob> {
  // Lazy load jsPDF
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(branding.primaryColor);
  doc.text('Function Sheet', 20, 20);

  doc.setFontSize(16);
  doc.setTextColor('#2C2C2C');
  doc.text(`${data.wedding.bride_name} & ${data.wedding.groom_name}`, 20, 30);
  doc.text(format(new Date(data.wedding.wedding_date), 'MMMM d, yyyy'), 20, 38);

  let yPosition = 50;

  // Add logo if provided
  if (branding.logo) {
    doc.addImage(branding.logo, 'PNG', 150, 10, 40, 20);
  }

  // Render each section
  for (const section of sections) {
    yPosition = await renderSection(doc, section, data, branding, yPosition);

    // Add page if needed
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  }

  return doc.output('blob');
}

async function renderSection(
  doc: jsPDF,
  section: DocumentSection,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): Promise<number> {
  // Section-specific rendering logic
  // Returns new Y position
  // ...
}
```

### Step 5: Implement File Download

```typescript
// src/lib/fileDownload.ts

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFilename(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

### Step 6: Create Generation Hook

```typescript
// src/hooks/useDocumentGeneration.ts

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { FunctionSheetOptions, VendorBriefOptions, SectionCounts } from '@/types/document';
import { aggregateDocumentData, getSectionCounts as fetchSectionCounts } from '@/lib/documents/documentData';
import { generatePDF } from '@/lib/documents/pdfGenerator';
import { generateDOCX } from '@/lib/documents/docxGenerator';
import { downloadFile, sanitizeFilename } from '@/lib/fileDownload';
import { format } from 'date-fns';

export function useDocumentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateFunctionSheet = useCallback(async (options: FunctionSheetOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await aggregateDocumentData(options.weddingId, options.sections);
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const baseName = sanitizeFilename(
        `${data.wedding.bride_name}-${data.wedding.groom_name}-Function-Sheet-${dateStr}`
      );

      if (options.format === 'pdf' || options.format === 'both') {
        const pdfBlob = await generatePDF(data, options.branding, options.sections);
        downloadFile(pdfBlob, `${baseName}.pdf`);
      }

      if (options.format === 'docx' || options.format === 'both') {
        const docxBlob = await generateDOCX(data, options.branding, options.sections);
        downloadFile(docxBlob, `${baseName}.docx`);
      }

      toast.success('Function Sheet generated successfully!');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error('Failed to generate document. Please try again.');
      console.error('Document generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getSectionCounts = useCallback(async (weddingId: string): Promise<SectionCounts> => {
    return fetchSectionCounts(weddingId);
  }, []);

  return {
    generateFunctionSheet,
    generateVendorBrief: async (_options: VendorBriefOptions) => { /* TODO */ },
    getSectionCounts,
    isGenerating,
    error,
    clearError: () => setError(null),
  };
}
```

### Step 7: Create Modal Component

```typescript
// src/components/documents/GenerateFunctionSheetModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useDocumentGeneration } from '@/hooks/useDocumentGeneration';
import {
  ALL_DOCUMENT_SECTIONS,
  SECTION_LABELS,
  type DocumentSection,
  type DocumentFormat,
} from '@/types/document';

interface GenerateFunctionSheetModalProps {
  weddingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateFunctionSheetModal({
  weddingId,
  open,
  onOpenChange,
}: GenerateFunctionSheetModalProps) {
  const [selectedSections, setSelectedSections] = useState<DocumentSection[]>(
    ALL_DOCUMENT_SECTIONS
  );
  const [format, setFormat] = useState<DocumentFormat>('pdf');
  const [brandingColor, setBrandingColor] = useState('#D4A5A5');
  const [logoFile, setLogoFile] = useState<string | undefined>();

  const { generateFunctionSheet, isGenerating } = useDocumentGeneration();

  const handleGenerate = async () => {
    await generateFunctionSheet({
      weddingId,
      sections: selectedSections,
      format,
      branding: {
        primaryColor: brandingColor,
        logo: logoFile,
      },
    });
    onOpenChange(false);
  };

  const toggleSection = (section: DocumentSection) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Function Sheet</DialogTitle>
        </DialogHeader>

        {/* Section Checkboxes */}
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
          {ALL_DOCUMENT_SECTIONS.map((section) => (
            <div key={section} className="flex items-center space-x-2">
              <Checkbox
                id={section}
                checked={selectedSections.includes(section)}
                onCheckedChange={() => toggleSection(section)}
              />
              <Label htmlFor={section} className="text-sm">
                {SECTION_LABELS[section]}
              </Label>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedSections(ALL_DOCUMENT_SECTIONS)}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedSections([])}
          >
            Deselect All
          </Button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Output Format</Label>
          <div className="flex gap-4">
            {(['pdf', 'docx', 'both'] as const).map((f) => (
              <label key={f} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                />
                <span className="text-sm uppercase">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="flex gap-4">
          <div className="space-y-2">
            <Label>Brand Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={brandingColor}
                onChange={(e) => setBrandingColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <span className="text-sm text-gray-500">{brandingColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo (optional)</Label>
            <Input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setLogoFile(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedSections.length === 0}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Generate Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 8: Update Quick Actions

Update `src/components/dashboard/DashboardQuickActions.tsx`:

```typescript
// Change the generate-docs action onClick handler
{
  id: 'generate-docs',
  label: 'Generate Docs',
  icon: FileText,
  onClick: () => setShowGenerateModal(true), // Instead of showComingSoon
}

// Add state and modal
const [showGenerateModal, setShowGenerateModal] = useState(false);

// Add modal at end of component
<GenerateFunctionSheetModal
  weddingId={weddingId}
  open={showGenerateModal}
  onOpenChange={setShowGenerateModal}
/>
```

## Testing

### Manual Testing Checklist

1. **Open Modal**
   - Click "Generate Docs" quick action
   - Modal opens with all sections selected

2. **Section Selection**
   - Toggle individual sections
   - "Select All" checks all 17 sections
   - "Deselect All" unchecks all

3. **Format Selection**
   - Select PDF, DOCX, or Both

4. **Branding**
   - Change color with color picker
   - Upload logo (PNG/JPG < 2MB)

5. **Generation**
   - Click "Generate Document"
   - Loading spinner appears
   - File downloads automatically
   - Success toast shown
   - Modal closes

6. **Error Handling**
   - Test with invalid wedding ID
   - Test network disconnection
   - Error toast should appear

## Common Issues

### jsPDF Types Not Found

Install types: `npm install --save-dev @types/jspdf`

Or add declaration file as shown in Setup step 2.

### DOCX Tables Not Rendering

Ensure docx library is version 8.x or higher.

### Large Files Slow to Generate

- Enable lazy loading for PDF/DOCX libraries
- Consider pagination for very large guest lists
- Add progress indicator

## Next Steps

1. Run `/speckit.tasks` to generate implementation task list
2. Implement section renderers for all 17 sections
3. Add Vendor Brief generation
4. Add E2E tests with Playwright
