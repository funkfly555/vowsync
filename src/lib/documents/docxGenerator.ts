/**
 * DOCX Document Generator
 * Feature: 017-document-generation
 *
 * Generates DOCX documents using the docx library.
 * Library is lazy loaded to reduce initial bundle size.
 */

import type {
  DocumentSection,
  DocumentBranding,
  FunctionSheetData,
} from '@/types/document';
import { SECTION_LABELS } from '@/types/document';
import { format } from 'date-fns';
import { shouldIncludeSection } from './documentData';

// Section renderer imports
import { renderWeddingOverviewDOCX } from './sectionRenderers/weddingOverview';
import { renderEventSummaryDOCX } from './sectionRenderers/eventSummary';
import { renderGuestListDOCX } from './sectionRenderers/guestList';
import { renderAttendanceMatrixDOCX } from './sectionRenderers/attendanceMatrix';
import { renderMealSelectionsDOCX } from './sectionRenderers/mealSelections';
import { renderBarOrdersDOCX } from './sectionRenderers/barOrders';
import { renderFurnitureEquipmentDOCX } from './sectionRenderers/furnitureEquipment';
import { renderRepurposingDOCX } from './sectionRenderers/repurposing';
import { renderStaffRequirementsDOCX } from './sectionRenderers/staffRequirements';
import { renderTransportationDOCX } from './sectionRenderers/transportation';
import { renderStationeryDOCX } from './sectionRenderers/stationery';
import { renderBeautyServicesDOCX } from './sectionRenderers/beautyServices';
import { renderAccommodationDOCX } from './sectionRenderers/accommodation';
import { renderShoppingListDOCX } from './sectionRenderers/shoppingList';
import { renderBudgetSummaryDOCX } from './sectionRenderers/budgetSummary';
import { renderVendorContactsDOCX } from './sectionRenderers/vendorContacts';
import { renderTimelineDOCX } from './sectionRenderers/timeline';

import type { Paragraph, Table } from 'docx';

/**
 * Section renderer type for DOCX generation (async due to dynamic imports)
 */
type DOCXSectionRenderer = (
  data: FunctionSheetData,
  branding: DocumentBranding
) => Promise<(Paragraph | Table)[]>;

/**
 * Map of section identifiers to their DOCX renderers
 */
const sectionRenderers: Record<DocumentSection, DOCXSectionRenderer> = {
  wedding_overview: renderWeddingOverviewDOCX,
  event_summary: renderEventSummaryDOCX,
  guest_list: renderGuestListDOCX,
  attendance_matrix: renderAttendanceMatrixDOCX,
  meal_selections: renderMealSelectionsDOCX,
  bar_orders: renderBarOrdersDOCX,
  furniture_equipment: renderFurnitureEquipmentDOCX,
  repurposing: renderRepurposingDOCX,
  staff_requirements: renderStaffRequirementsDOCX,
  transportation: renderTransportationDOCX,
  stationery: renderStationeryDOCX,
  beauty_services: renderBeautyServicesDOCX,
  accommodation: renderAccommodationDOCX,
  shopping_list: renderShoppingListDOCX,
  budget_summary: renderBudgetSummaryDOCX,
  vendor_contacts: renderVendorContactsDOCX,
  timeline: renderTimelineDOCX,
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
 * Generates DOCX document from aggregated data
 *
 * @param data - Aggregated FunctionSheetData
 * @param branding - Logo and color configuration
 * @param sections - Selected sections (determines render order)
 * @returns Promise resolving to DOCX Blob
 *
 * Uses: docx library (lazy loaded)
 * Performance: <3 seconds for typical wedding
 */
export async function generateDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding,
  sections: DocumentSection[]
): Promise<Blob> {
  // Lazy load docx library
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
  } = await import('docx');

  const children: (Paragraph | Table)[] = [];

  // =====================
  // DOCUMENT HEADER
  // =====================

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Function Sheet',
          bold: true,
          size: 48, // 24pt
          color: branding.primaryColor.replace('#', ''),
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
    })
  );

  // Wedding names
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${data.wedding.bride_name} & ${data.wedding.groom_name}`,
          bold: true,
          size: 32, // 16pt
        }),
      ],
      spacing: { after: 100 },
    })
  );

  // Wedding date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: format(new Date(data.wedding.wedding_date), 'MMMM d, yyyy'),
          size: 24, // 12pt
        }),
      ],
      spacing: { after: 100 },
    })
  );

  // Venue
  if (data.wedding.venue_name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.wedding.venue_name,
            size: 20, // 10pt
            color: '666666',
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  // Generation date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${format(new Date(), 'PPp')}`,
          size: 16, // 8pt
          color: '999999',
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // =====================
  // RENDER EACH SECTION
  // =====================

  for (const section of sections) {
    // Skip empty sections
    const sectionData = getSectionData(section, data);
    if (!shouldIncludeSection(sectionData as unknown[] | Record<string, unknown> | undefined)) {
      continue;
    }

    // Add section header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: SECTION_LABELS[section],
            bold: true,
            size: 28, // 14pt
            color: branding.primaryColor.replace('#', ''),
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: branding.primaryColor.replace('#', ''),
            space: 1,
            style: 'single',
            size: 6,
          },
        },
      })
    );

    // Render section content (async)
    const renderer = sectionRenderers[section];
    const sectionContent = await renderer(data, branding);
    children.push(...sectionContent);

    // Add spacing after section
    children.push(
      new Paragraph({
        children: [],
        spacing: { after: 200 },
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Converts hex color to DOCX-compatible format (without #)
 */
export function formatColor(hex: string): string {
  return hex.replace('#', '');
}
