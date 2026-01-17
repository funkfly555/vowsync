/**
 * Bar Orders Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Bar Orders section to PDF
 */
export function renderBarOrdersPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.barOrders || data.barOrders.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);
  let y = startY;

  for (const order of data.barOrders) {
    // Event header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.text(order.event_name, 20, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Guests: ${order.guest_count_adults} adults, ${order.guest_count_children} children | Duration: ${order.event_duration_hours}h`, 20, y);
    y += 6;

    if (order.items.length > 0) {
      const tableData = order.items.map((item) => [
        item.item_name,
        `${item.percentage}%`,
        item.calculated_servings.toString(),
        item.units_needed.toString(),
        `$${item.cost_per_unit.toFixed(2)}`,
        `$${item.total_cost.toFixed(2)}`,
      ]);

      // Add total row
      const totalCost = order.items.reduce((sum, item) => sum + item.total_cost, 0);
      tableData.push(['', '', '', '', 'Total:', `$${totalCost.toFixed(2)}`]);

      doc.autoTable({
        startY: y,
        head: [['Item', '%', 'Servings', 'Units', 'Unit Cost', 'Total']],
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
          0: { cellWidth: 50 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'right' },
        },
      });

      y = doc.lastAutoTable.finalY + 8;
    }
  }

  return y;
}

/**
 * Renders Bar Orders section to DOCX
 */
export async function renderBarOrdersDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, HeadingLevel } = await import('docx');

  if (!data.barOrders || data.barOrders.length === 0) return [];

  const elements: (Paragraph | Table)[] = [];
  const headerColor = branding.primaryColor.replace('#', '');

  for (const order of data.barOrders) {
    elements.push(
      new Paragraph({
        children: [new TextRun({ text: order.event_name, bold: true, size: 22, color: headerColor })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 50 },
      })
    );

    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Guests: ${order.guest_count_adults} adults, ${order.guest_count_children} children | Duration: ${order.event_duration_hours}h`,
            size: 18,
            color: '666666',
          }),
        ],
        spacing: { after: 100 },
      })
    );

    if (order.items.length > 0) {
      const headerRow = new TableRow({
        children: ['Item', '%', 'Servings', 'Units', 'Unit Cost', 'Total'].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })] })],
              shading: { fill: headerColor },
            })
        ),
      });

      const dataRows = order.items.map(
        (item) =>
          new TableRow({
            children: [
              item.item_name,
              `${item.percentage}%`,
              item.calculated_servings.toString(),
              item.units_needed.toString(),
              `$${item.cost_per_unit.toFixed(2)}`,
              `$${item.total_cost.toFixed(2)}`,
            ].map(
              (text) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, size: 16 })] })],
                })
            ),
          })
      );

      const totalCost = order.items.reduce((sum, item) => sum + item.total_cost, 0);
      const totalRow = new TableRow({
        children: ['', '', '', '', 'Total:', `$${totalCost.toFixed(2)}`].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16 })] })],
            })
        ),
      });

      elements.push(
        new Table({
          rows: [headerRow, ...dataRows, totalRow],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }
  }

  return elements;
}
