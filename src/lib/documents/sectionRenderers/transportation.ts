/**
 * Transportation Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Transportation section to PDF
 */
export function renderTransportationPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.transportation || data.transportation.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.transportation.map((t) => [
    t.event_name,
    t.shuttle_name || t.transport_type,
    t.collection_time,
    t.collection_location,
    t.dropoff_location,
    t.number_of_guests.toString(),
  ]);

  doc.autoTable({
    startY,
    head: [['Event', 'Shuttle', 'Time', 'From', 'To', 'Guests']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [primaryRGB.r, primaryRGB.g, primaryRGB.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [44, 44, 44],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
      5: { cellWidth: 15, halign: 'center' },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Transportation section to DOCX
 */
export async function renderTransportationDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.transportation || data.transportation.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['Event', 'Shuttle', 'Time', 'From', 'To', 'Guests'].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })] })],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.transportation.map(
    (t) =>
      new TableRow({
        children: [
          t.event_name,
          t.shuttle_name || t.transport_type,
          t.collection_time,
          t.collection_location,
          t.dropoff_location,
          t.number_of_guests.toString(),
        ].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, size: 16 })] })],
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
