/**
 * Document Generation Hook
 * Feature: 017-document-generation
 *
 * Hook for generating Function Sheet and Vendor Brief documents.
 * Manages generation state and coordinates data aggregation with document creation.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type {
  FunctionSheetOptions,
  VendorBriefOptions,
  SectionCounts,
} from '@/types/document';
import {
  aggregateDocumentData,
  getSectionCounts as fetchSectionCounts,
  aggregateVendorBriefData,
} from '@/lib/documents/documentData';
import { generatePDF } from '@/lib/documents/pdfGenerator';
import { generateDOCX } from '@/lib/documents/docxGenerator';
import { downloadFile, sanitizeFilename } from '@/lib/fileDownload';

/**
 * Return type for useDocumentGeneration hook
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
 * Hook for generating Function Sheet and Vendor Brief documents
 *
 * @returns Object with generation functions, state, and utilities
 *
 * @example
 * ```tsx
 * const { generateFunctionSheet, isGenerating, error } = useDocumentGeneration();
 *
 * const handleGenerate = async () => {
 *   await generateFunctionSheet({
 *     weddingId: 'uuid',
 *     sections: ['wedding_overview', 'event_summary'],
 *     format: 'pdf',
 *     branding: { primaryColor: '#D4A5A5' }
 *   });
 * };
 * ```
 */
export function useDocumentGeneration(): UseDocumentGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Generate a Function Sheet document
   */
  const generateFunctionSheet = useCallback(async (options: FunctionSheetOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Aggregate data for selected sections
      const data = await aggregateDocumentData(options.weddingId, options.sections);

      // Generate filename base
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const baseName = sanitizeFilename(
        `${data.wedding.bride_name}-${data.wedding.groom_name}-Function-Sheet-${dateStr}`
      );

      // Generate PDF if requested
      if (options.format === 'pdf' || options.format === 'both') {
        const pdfBlob = await generatePDF(data, options.branding, options.sections);
        downloadFile(pdfBlob, `${baseName}.pdf`);
      }

      // Generate DOCX if requested
      if (options.format === 'docx' || options.format === 'both') {
        const docxBlob = await generateDOCX(data, options.branding, options.sections);
        downloadFile(docxBlob, `${baseName}.docx`);
      }

      toast.success('Function Sheet generated successfully!');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      toast.error('Failed to generate document. Please try again.');
      console.error('Document generation error:', errorObj);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Generate a Vendor Brief document
   */
  const generateVendorBrief = useCallback(async (options: VendorBriefOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Aggregate vendor data
      const data = await aggregateVendorBriefData(options.vendorId, options.weddingId);

      // Generate filename base
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const baseName = sanitizeFilename(
        `${data.vendor.company_name}-Vendor-Brief-${dateStr}`
      );

      // Generate PDF if requested
      if (options.format === 'pdf' || options.format === 'both') {
        // For now, use a simplified PDF generation for vendor brief
        // This will be enhanced in Phase 7 (User Story 5)
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Simple vendor brief content
        doc.setFontSize(24);
        doc.setTextColor(options.branding.primaryColor);
        doc.text('Vendor Brief', 20, 20);

        doc.setFontSize(16);
        doc.setTextColor(44, 44, 44);
        doc.text(data.vendor.company_name, 20, 35);

        doc.setFontSize(12);
        doc.text(`Wedding: ${data.wedding.bride_name} & ${data.wedding.groom_name}`, 20, 45);
        doc.text(format(new Date(data.wedding.wedding_date), 'MMMM d, yyyy'), 20, 52);

        doc.setFontSize(10);
        let y = 70;

        // Vendor details
        doc.text('Contact Information', 20, y);
        y += 8;
        if (data.vendor.contact_name) {
          doc.text(`Contact: ${data.vendor.contact_name}`, 25, y);
          y += 6;
        }
        if (data.vendor.contact_email) {
          doc.text(`Email: ${data.vendor.contact_email}`, 25, y);
          y += 6;
        }
        if (data.vendor.contact_phone) {
          doc.text(`Phone: ${data.vendor.contact_phone}`, 25, y);
          y += 6;
        }

        y += 10;
        doc.text('Contract Details', 20, y);
        y += 8;
        doc.text(`Contract Value: $${data.vendor.contract_value?.toLocaleString() ?? 'N/A'}`, 25, y);
        y += 6;
        doc.text(`Contract Signed: ${data.vendor.contract_signed ? 'Yes' : 'No'}`, 25, y);

        const pdfBlob = doc.output('blob');
        downloadFile(pdfBlob, `${baseName}.pdf`);
      }

      // Generate DOCX if requested
      if (options.format === 'docx' || options.format === 'both') {
        const { Document, Packer, Paragraph, TextRun } = await import('docx');

        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Vendor Brief',
                      bold: true,
                      size: 48,
                      color: options.branding.primaryColor.replace('#', ''),
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.vendor.company_name,
                      bold: true,
                      size: 32,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Wedding: ${data.wedding.bride_name} & ${data.wedding.groom_name}`,
                      size: 24,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: format(new Date(data.wedding.wedding_date), 'MMMM d, yyyy'),
                      size: 24,
                    }),
                  ],
                }),
              ],
            },
          ],
        });

        const docxBlob = await Packer.toBlob(doc);
        downloadFile(docxBlob, `${baseName}.docx`);
      }

      toast.success('Vendor Brief generated successfully!');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      toast.error('Failed to generate vendor brief. Please try again.');
      console.error('Vendor brief generation error:', errorObj);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Get section counts for preview display
   */
  const getSectionCounts = useCallback(async (weddingId: string): Promise<SectionCounts> => {
    return fetchSectionCounts(weddingId);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateFunctionSheet,
    generateVendorBrief,
    getSectionCounts,
    isGenerating,
    error,
    clearError,
  };
}
