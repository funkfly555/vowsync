/**
 * Staff Requirements Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Staff Requirements section to PDF
 */
export function renderStaffRequirementsPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.staffRequirements || data.staffRequirements.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.staffRequirements.map((s) => [
    s.event_name,
    s.vendor_name || '-',
    s.supervisors.toString(),
    s.waiters.toString(),
    s.bartenders.toString(),
    s.runners.toString(),
    s.scullers.toString(),
    s.total_staff.toString(),
  ]);

  doc.autoTable({
    startY,
    head: [['Event', 'Vendor', 'Sup', 'Wait', 'Bar', 'Run', 'Scul', 'Total']],
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
      0: { cellWidth: 40 },
      1: { cellWidth: 35 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Staff Requirements section to DOCX
 */
export async function renderStaffRequirementsDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.staffRequirements || data.staffRequirements.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['Event', 'Vendor', 'Sup', 'Wait', 'Bar', 'Run', 'Scul', 'Total'].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })] })],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.staffRequirements.map(
    (s) =>
      new TableRow({
        children: [
          s.event_name,
          s.vendor_name || '-',
          s.supervisors.toString(),
          s.waiters.toString(),
          s.bartenders.toString(),
          s.runners.toString(),
          s.scullers.toString(),
          s.total_staff.toString(),
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
