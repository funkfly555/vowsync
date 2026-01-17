/**
 * Vendor Contacts Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Vendor Contacts section to PDF
 */
export function renderVendorContactsPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.vendors || data.vendors.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.vendors.map((v) => [
    v.vendor_type,
    v.company_name,
    v.contact_name || '-',
    v.contact_phone || '-',
    v.contact_email || '-',
    v.contract_value ? `$${v.contract_value.toLocaleString()}` : '-',
  ]);

  doc.autoTable({
    startY,
    head: [['Type', 'Company', 'Contact', 'Phone', 'Email', 'Contract']],
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
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 40 },
      5: { cellWidth: 20, halign: 'right' },
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 2,
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Vendor Contacts section to DOCX
 */
export async function renderVendorContactsDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.vendors || data.vendors.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['Type', 'Company', 'Contact', 'Phone', 'Email', 'Contract'].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })] })],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.vendors.map(
    (v) =>
      new TableRow({
        children: [
          v.vendor_type,
          v.company_name,
          v.contact_name || '-',
          v.contact_phone || '-',
          v.contact_email || '-',
          v.contract_value ? `$${v.contract_value.toLocaleString()}` : '-',
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
