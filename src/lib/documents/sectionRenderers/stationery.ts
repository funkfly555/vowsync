/**
 * Stationery Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Stationery section to PDF
 */
export function renderStationeryPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.stationery || data.stationery.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.stationery.map((s) => [
    s.item_name,
    s.details || '-',
    s.quantity.toString(),
    `$${s.cost_per_item.toFixed(2)}`,
    `$${s.total_cost.toFixed(2)}`,
  ]);

  // Add total row
  const totalCost = data.stationery.reduce((sum, s) => sum + s.total_cost, 0);
  tableData.push(['', '', '', 'Total:', `$${totalCost.toFixed(2)}`]);

  doc.autoTable({
    startY,
    head: [['Item', 'Details', 'Qty', 'Unit Cost', 'Total']],
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
      0: { cellWidth: 40 },
      1: { cellWidth: 60 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Stationery section to DOCX
 */
export async function renderStationeryDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.stationery || data.stationery.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['Item', 'Details', 'Qty', 'Unit Cost', 'Total'].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })] })],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.stationery.map(
    (s) =>
      new TableRow({
        children: [
          s.item_name,
          s.details || '-',
          s.quantity.toString(),
          `$${s.cost_per_item.toFixed(2)}`,
          `$${s.total_cost.toFixed(2)}`,
        ].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
            })
        ),
      })
  );

  const totalCost = data.stationery.reduce((sum, s) => sum + s.total_cost, 0);
  const totalRow = new TableRow({
    children: ['', '', '', 'Total:', `$${totalCost.toFixed(2)}`].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })] })],
        })
    ),
  });

  return [
    new Table({
      rows: [headerRow, ...dataRows, totalRow],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  ];
}
