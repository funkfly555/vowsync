/**
 * Event Summary Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { format } from 'date-fns';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Event Summary section to PDF
 */
export function renderEventSummaryPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.events || data.events.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.events.map((event) => [
    event.event_order.toString(),
    event.event_name,
    format(new Date(event.event_date), 'MMM d'),
    `${event.event_start_time} - ${event.event_end_time}`,
    event.event_location || '-',
    `${event.expected_guests_adults + event.expected_guests_children}`,
  ]);

  doc.autoTable({
    startY,
    head: [['#', 'Event', 'Date', 'Time', 'Location', 'Guests']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [primaryRGB.r, primaryRGB.g, primaryRGB.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [44, 44, 44],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 20 },
      3: { cellWidth: 35 },
      4: { cellWidth: 50 },
      5: { cellWidth: 15, halign: 'center' },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Event Summary section to DOCX
 */
export async function renderEventSummaryDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.events || data.events.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['#', 'Event', 'Date', 'Time', 'Location', 'Guests'].map(
      (text) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })],
            }),
          ],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.events.map(
    (event) =>
      new TableRow({
        children: [
          event.event_order.toString(),
          event.event_name,
          format(new Date(event.event_date), 'MMM d'),
          `${event.event_start_time} - ${event.event_end_time}`,
          event.event_location || '-',
          `${event.expected_guests_adults + event.expected_guests_children}`,
        ].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text, size: 18 })],
                }),
              ],
            })
        ),
      })
  );

  return [
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  ];
}
