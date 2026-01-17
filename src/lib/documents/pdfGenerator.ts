/**
 * PDF Document Generator
 * Feature: 017-document-generation
 *
 * Generates PDF documents using jsPDF with jspdf-autotable for tables.
 * Libraries are lazy loaded to reduce initial bundle size.
 */

import type { jsPDF } from 'jspdf';
import type {
  DocumentSection,
  DocumentBranding,
  FunctionSheetData,
} from '@/types/document';
import { SECTION_LABELS } from '@/types/document';
import { format } from 'date-fns';
import { shouldIncludeSection } from './documentData';

// Section renderer imports will be added as they're created
import { renderWeddingOverviewPDF } from './sectionRenderers/weddingOverview';
import { renderEventSummaryPDF } from './sectionRenderers/eventSummary';
import { renderGuestListPDF } from './sectionRenderers/guestList';
import { renderAttendanceMatrixPDF } from './sectionRenderers/attendanceMatrix';
import { renderMealSelectionsPDF } from './sectionRenderers/mealSelections';
import { renderBarOrdersPDF } from './sectionRenderers/barOrders';
import { renderFurnitureEquipmentPDF } from './sectionRenderers/furnitureEquipment';
import { renderRepurposingPDF } from './sectionRenderers/repurposing';
import { renderStaffRequirementsPDF } from './sectionRenderers/staffRequirements';
import { renderTransportationPDF } from './sectionRenderers/transportation';
import { renderStationeryPDF } from './sectionRenderers/stationery';
import { renderBeautyServicesPDF } from './sectionRenderers/beautyServices';
import { renderAccommodationPDF } from './sectionRenderers/accommodation';
import { renderShoppingListPDF } from './sectionRenderers/shoppingList';
import { renderBudgetSummaryPDF } from './sectionRenderers/budgetSummary';
import { renderVendorContactsPDF } from './sectionRenderers/vendorContacts';
import { renderTimelinePDF } from './sectionRenderers/timeline';

/**
 * Section renderer type for PDF generation
 */
type PDFSectionRenderer = (
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
) => number;

/**
 * Map of section identifiers to their PDF renderers
 */
const sectionRenderers: Record<DocumentSection, PDFSectionRenderer> = {
  wedding_overview: renderWeddingOverviewPDF,
  event_summary: renderEventSummaryPDF,
  guest_list: renderGuestListPDF,
  attendance_matrix: renderAttendanceMatrixPDF,
  meal_selections: renderMealSelectionsPDF,
  bar_orders: renderBarOrdersPDF,
  furniture_equipment: renderFurnitureEquipmentPDF,
  repurposing: renderRepurposingPDF,
  staff_requirements: renderStaffRequirementsPDF,
  transportation: renderTransportationPDF,
  stationery: renderStationeryPDF,
  beauty_services: renderBeautyServicesPDF,
  accommodation: renderAccommodationPDF,
  shopping_list: renderShoppingListPDF,
  budget_summary: renderBudgetSummaryPDF,
  vendor_contacts: renderVendorContactsPDF,
  timeline: renderTimelinePDF,
};

/**
 * Gets section data for a given section identifier
 */
function getSectionData(section: DocumentSection, data: FunctionSheetData): unknown[] | Record<string, unknown> | undefined {
  const mapping: Record<DocumentSection, unknown> = {
    wedding_overview: data.wedding ? [data.wedding] : undefined,
    event_summary: data.events,
    guest_list: data.guests,
    attendance_matrix: data.attendance,
    meal_selections: data.mealSelections ? [data.mealSelections] : undefined,
    bar_orders: data.barOrders,
    furniture_equipment: data.weddingItems,
    repurposing: data.repurposing,
    staff_requirements: data.staffRequirements,
    transportation: data.transportation,
    stationery: data.stationery,
    beauty_services: data.beautyServices,
    accommodation: data.accommodation,
    shopping_list: data.shoppingList,
    budget_summary: data.budget ? [data.budget] : undefined,
    vendor_contacts: data.vendors,
    timeline: data.tasks,
  };
  return mapping[section] as unknown[] | Record<string, unknown> | undefined;
}

/**
 * Generates PDF document from aggregated data
 *
 * @param data - Aggregated FunctionSheetData
 * @param branding - Logo and color configuration
 * @param sections - Selected sections (determines render order)
 * @returns Promise resolving to PDF Blob
 *
 * Uses: jsPDF + jspdf-autotable (lazy loaded)
 * Performance: <3 seconds for typical wedding
 */
export async function generatePDF(
  data: FunctionSheetData,
  branding: DocumentBranding,
  sections: DocumentSection[]
): Promise<Blob> {
  // Lazy load jsPDF and autotable
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Parse hex color to RGB for jsPDF
  const primaryRGB = hexToRgb(branding.primaryColor);

  // =====================
  // DOCUMENT HEADER
  // =====================

  // Add logo if provided
  if (branding.logo) {
    try {
      doc.addImage(branding.logo, 'PNG', pageWidth - 50, 10, 40, 20);
    } catch {
      // Logo failed to load, continue without it
      console.warn('Failed to add logo to PDF');
    }
  }

  // Title
  doc.setFontSize(24);
  doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
  doc.text('Function Sheet', 20, 20);

  // Wedding names and date
  doc.setFontSize(16);
  doc.setTextColor(44, 44, 44); // #2C2C2C
  doc.text(`${data.wedding.bride_name} & ${data.wedding.groom_name}`, 20, 30);

  doc.setFontSize(12);
  doc.text(format(new Date(data.wedding.wedding_date), 'MMMM d, yyyy'), 20, 38);

  // Venue if available
  if (data.wedding.venue_name) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(data.wedding.venue_name, 20, 45);
  }

  // Generation date
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${format(new Date(), 'PPp')}`, 20, 52);

  let yPosition = 60;

  // =====================
  // RENDER EACH SECTION
  // =====================

  for (const section of sections) {
    // Skip empty sections
    const sectionData = getSectionData(section, data);
    if (!shouldIncludeSection(sectionData as unknown[] | Record<string, unknown> | undefined)) {
      continue;
    }

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Add section header
    yPosition = addSectionHeader(doc, SECTION_LABELS[section], branding, yPosition);

    // Render section content
    const renderer = sectionRenderers[section];
    yPosition = renderer(doc, data, branding, yPosition);

    // Add spacing between sections
    yPosition += 10;
  }

  // =====================
  // PAGE NUMBERS
  // =====================

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * Adds a section header to the PDF
 */
function addSectionHeader(
  doc: jsPDF,
  title: string,
  branding: DocumentBranding,
  startY: number
): number {
  const primaryRGB = hexToRgb(branding.primaryColor);

  // Draw colored line
  doc.setDrawColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
  doc.setLineWidth(0.5);
  doc.line(20, startY, 190, startY);

  // Section title
  doc.setFontSize(14);
  doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
  doc.text(title, 20, startY + 8);

  return startY + 15;
}

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 212, g: 165, b: 165 }; // Default to #D4A5A5
}

/**
 * Helper to check if content would overflow page and add new page if needed
 */
export function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  requiredHeight: number = 50
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredHeight > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return currentY;
}
