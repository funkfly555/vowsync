/**
 * Wedding Overview Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { format } from 'date-fns';

/**
 * Renders Wedding Overview section to PDF
 */
export function renderWeddingOverviewPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  _branding: DocumentBranding,
  startY: number
): number {
  const wedding = data.wedding;
  let y = startY;

  doc.setFontSize(10);
  doc.setTextColor(44, 44, 44);

  // Basic info
  const details = [
    ['Couple', `${wedding.bride_name} & ${wedding.groom_name}`],
    ['Date', format(new Date(wedding.wedding_date), 'EEEE, MMMM d, yyyy')],
    ['Status', wedding.status],
    ['Total Guests', `${wedding.guest_count_adults + wedding.guest_count_children} (${wedding.guest_count_adults} adults, ${wedding.guest_count_children} children)`],
  ];

  if (wedding.venue_name) {
    details.push(['Venue', wedding.venue_name]);
  }
  if (wedding.venue_address) {
    details.push(['Address', wedding.venue_address]);
  }
  if (wedding.venue_contact_name) {
    details.push(['Venue Contact', wedding.venue_contact_name]);
  }
  if (wedding.venue_contact_phone) {
    details.push(['Venue Phone', wedding.venue_contact_phone]);
  }
  if (wedding.venue_contact_email) {
    details.push(['Venue Email', wedding.venue_contact_email]);
  }

  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, y);
    y += 6;
  }

  if (wedding.notes) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(wedding.notes, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5;
  }

  return y + 5;
}

/**
 * Renders Wedding Overview section to DOCX
 */
export async function renderWeddingOverviewDOCX(
  data: FunctionSheetData,
  _branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Paragraph, TextRun } = await import('docx');
  const wedding = data.wedding;
  const elements: Paragraph[] = [];

  const details = [
    ['Couple', `${wedding.bride_name} & ${wedding.groom_name}`],
    ['Date', format(new Date(wedding.wedding_date), 'EEEE, MMMM d, yyyy')],
    ['Status', wedding.status],
    ['Total Guests', `${wedding.guest_count_adults + wedding.guest_count_children} (${wedding.guest_count_adults} adults, ${wedding.guest_count_children} children)`],
  ];

  if (wedding.venue_name) details.push(['Venue', wedding.venue_name]);
  if (wedding.venue_address) details.push(['Address', wedding.venue_address]);
  if (wedding.venue_contact_name) details.push(['Venue Contact', wedding.venue_contact_name]);
  if (wedding.venue_contact_phone) details.push(['Venue Phone', wedding.venue_contact_phone]);
  if (wedding.venue_contact_email) details.push(['Venue Email', wedding.venue_contact_email]);

  for (const [label, value] of details) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 20 }),
          new TextRun({ text: value, size: 20 }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  if (wedding.notes) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Notes: ', bold: true, size: 20 }),
          new TextRun({ text: wedding.notes, size: 20 }),
        ],
        spacing: { before: 100, after: 100 },
      })
    );
  }

  return elements;
}
