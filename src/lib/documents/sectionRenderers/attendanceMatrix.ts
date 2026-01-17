/**
 * Attendance Matrix Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Attendance Matrix section to PDF
 */
export function renderAttendanceMatrixPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.attendance || data.attendance.length === 0) return startY;
  if (!data.events || data.events.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  // Group attendance by guest
  const guestAttendance = new Map<string, { name: string; type: string; events: Map<string, boolean> }>();

  for (const att of data.attendance) {
    if (!guestAttendance.has(att.guest_id)) {
      guestAttendance.set(att.guest_id, {
        name: att.guest_name,
        type: att.guest_type,
        events: new Map(),
      });
    }
    guestAttendance.get(att.guest_id)!.events.set(att.event_id, att.attending);
  }

  // Build header row with event names
  const eventHeaders = data.events.map((e) => e.event_name.substring(0, 10));
  const headers = ['Guest', ...eventHeaders];

  // Build data rows
  const tableData = Array.from(guestAttendance.values()).map((guest) => {
    const row = [guest.name];
    for (const event of data.events!) {
      const attending = guest.events.get(event.id);
      row.push(attending ? '✓' : '-');
    }
    return row;
  });

  doc.autoTable({
    startY,
    head: [headers],
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
      0: { cellWidth: 40 },
    },
    styles: {
      cellPadding: 2,
      overflow: 'linebreak',
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Attendance Matrix section to DOCX
 */
export async function renderAttendanceMatrixDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType } = await import('docx');

  if (!data.attendance || data.attendance.length === 0) return [];
  if (!data.events || data.events.length === 0) return [];

  const headerColor = branding.primaryColor.replace('#', '');

  // Group attendance by guest
  const guestAttendance = new Map<string, { name: string; events: Map<string, boolean> }>();

  for (const att of data.attendance) {
    if (!guestAttendance.has(att.guest_id)) {
      guestAttendance.set(att.guest_id, {
        name: att.guest_name,
        events: new Map(),
      });
    }
    guestAttendance.get(att.guest_id)!.events.set(att.event_id, att.attending);
  }

  // Header row
  const headerTexts = ['Guest', ...data.events.map((e) => e.event_name.substring(0, 10))];
  const headerRow = new TableRow({
    children: headerTexts.map(
      (text) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })],
            }),
          ],
          shading: { fill: headerColor },
        })
    ),
  });

  // Data rows
  const dataRows = Array.from(guestAttendance.values()).map((guest) => {
    const cells = [guest.name];
    for (const event of data.events!) {
      const attending = guest.events.get(event.id);
      cells.push(attending ? '✓' : '-');
    }
    return new TableRow({
      children: cells.map(
        (text) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text, size: 16 })],
              }),
            ],
          })
      ),
    });
  });

  return [
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  ];
}
