/**
 * Beauty Services Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Beauty Services section to PDF
 */
export function renderBeautyServicesPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.beautyServices || data.beautyServices.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.beautyServices.map((b) => [
    b.person_name,
    b.role,
    b.requires_hair ? '✓' : '-',
    b.requires_makeup ? '✓' : '-',
    b.appointment_time || '-',
    b.vendor_name || '-',
  ]);

  doc.autoTable({
    startY,
    head: [['Person', 'Role', 'Hair', 'Makeup', 'Time', 'Vendor']],
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
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30 },
      5: { cellWidth: 40 },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Beauty Services section to DOCX
 */
export async function renderBeautyServicesDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.beautyServices || data.beautyServices.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['Person', 'Role', 'Hair', 'Makeup', 'Time', 'Vendor'].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })] })],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.beautyServices.map(
    (b) =>
      new TableRow({
        children: [
          b.person_name,
          b.role,
          b.requires_hair ? '✓' : '-',
          b.requires_makeup ? '✓' : '-',
          b.appointment_time || '-',
          b.vendor_name || '-',
        ].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
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
