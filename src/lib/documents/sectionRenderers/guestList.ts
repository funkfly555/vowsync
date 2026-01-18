/**
 * Guest List Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Guest List section to PDF
 */
export function renderGuestListPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.guests || data.guests.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  const tableData = data.guests.map((guest) => [
    guest.name,
    guest.guest_type === 'adult' ? 'Adult' : 'Child',
    guest.invitation_status.charAt(0).toUpperCase() + guest.invitation_status.slice(1),
    guest.table_number || '-',
    guest.dietary_restrictions || '-',
  ]);

  doc.autoTable({
    startY,
    head: [['Name', 'Type', 'Status', 'Table', 'Dietary']],
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
      0: { cellWidth: 50 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 60 },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Guest List section to DOCX
 */
export async function renderGuestListDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.guests || data.guests.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  const headerRow = new TableRow({
    children: ['Name', 'Type', 'Status', 'Table', 'Dietary'].map(
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

  const dataRows = data.guests.map(
    (guest) =>
      new TableRow({
        children: [
          guest.name,
          guest.guest_type === 'adult' ? 'Adult' : 'Child',
          guest.invitation_status.charAt(0).toUpperCase() + guest.invitation_status.slice(1),
          guest.table_number || '-',
          guest.dietary_restrictions || '-',
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
