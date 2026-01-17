/**
 * Repurposing Instructions Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Repurposing Instructions section to PDF
 */
export function renderRepurposingPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.repurposing || data.repurposing.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.repurposing.map((r) => [
    r.item_description,
    `${r.from_event_name} → ${r.to_event_name}`,
    `${r.pickup_time}\n${r.pickup_location}`,
    `${r.dropoff_time}\n${r.dropoff_location}`,
    r.responsible_party || '-',
    r.status,
  ]);

  doc.autoTable({
    startY,
    head: [['Item', 'Movement', 'Pickup', 'Dropoff', 'Responsible', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [primaryRGB.r, primaryRGB.g, primaryRGB.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [44, 44, 44],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20, halign: 'center' },
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 2,
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Repurposing Instructions section to DOCX
 */
export async function renderRepurposingDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.repurposing || data.repurposing.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['Item', 'Movement', 'Pickup', 'Dropoff', 'Responsible', 'Status'].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })] })],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.repurposing.map(
    (r) =>
      new TableRow({
        children: [
          r.item_description,
          `${r.from_event_name} → ${r.to_event_name}`,
          `${r.pickup_time} @ ${r.pickup_location}`,
          `${r.dropoff_time} @ ${r.dropoff_location}`,
          r.responsible_party || '-',
          r.status,
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
