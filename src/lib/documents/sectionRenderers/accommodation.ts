/**
 * Accommodation Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Accommodation section to PDF
 */
export function renderAccommodationPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.accommodation || data.accommodation.cottages.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);
  let y = startY;

  for (const cottage of data.accommodation.cottages) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.text(`${cottage.cottage_name} ($${cottage.charge_per_room_per_night}/room/night)`, 20, y);
    y += 6;

    if (cottage.rooms.length > 0) {
      const tableData = cottage.rooms.map((room) => [
        room.room_name,
        room.bed_type,
        room.bathroom_type,
        room.guest_name || '-',
        room.number_of_nights.toString(),
        `$${room.room_cost.toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: y,
        head: [['Room', 'Bed', 'Bath', 'Guest', 'Nights', 'Cost']],
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
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 25, halign: 'right' },
        },
      });

      y = doc.lastAutoTable.finalY + 8;
    }
  }

  return y;
}

/**
 * Renders Accommodation section to DOCX
 */
export async function renderAccommodationDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, HeadingLevel } = await import('docx');

  if (!data.accommodation || data.accommodation.cottages.length === 0) return [];

  const elements: (Paragraph | Table)[] = [];
  const headerColor = branding.primaryColor.replace('#', '');

  for (const cottage of data.accommodation.cottages) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${cottage.cottage_name} ($${cottage.charge_per_room_per_night}/room/night)`,
            bold: true,
            size: 22,
            color: headerColor,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    if (cottage.rooms.length > 0) {
      const headerRow = new TableRow({
        children: ['Room', 'Bed', 'Bath', 'Guest', 'Nights', 'Cost'].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })] })],
              shading: { fill: headerColor },
            })
        ),
      });

      const dataRows = cottage.rooms.map(
        (room) =>
          new TableRow({
            children: [
              room.room_name,
              room.bed_type,
              room.bathroom_type,
              room.guest_name || '-',
              room.number_of_nights.toString(),
              `$${room.room_cost.toFixed(2)}`,
            ].map(
              (text) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, size: 16 })] })],
                })
            ),
          })
      );

      elements.push(
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }
  }

  return elements;
}
