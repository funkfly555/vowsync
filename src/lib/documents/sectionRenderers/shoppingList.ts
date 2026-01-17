/**
 * Shopping List Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Shopping List section to PDF
 */
export function renderShoppingListPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.shoppingList || data.shoppingList.length === 0) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);

  // Group by category
  const categories = new Map<string, typeof data.shoppingList>();
  for (const item of data.shoppingList) {
    if (!categories.has(item.category)) {
      categories.set(item.category, []);
    }
    categories.get(item.category)!.push(item);
  }

  let y = startY;

  for (const [category, items] of categories) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.text(category, 20, y);
    y += 6;

    const tableData = items.map((item) => [
      item.item_name,
      `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`,
      item.store || '-',
      item.purchased ? '✓' : '-',
      `$${item.estimated_cost.toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: y,
      head: [['Item', 'Qty', 'Store', 'Bought', 'Est. Cost']],
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
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
      },
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  return y;
}

/**
 * Renders Shopping List section to DOCX
 */
export async function renderShoppingListDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, HeadingLevel } = await import('docx');

  if (!data.shoppingList || data.shoppingList.length === 0) return [];

  const elements: (Paragraph | Table)[] = [];
  const headerColor = branding.primaryColor.replace('#', '');

  // Group by category
  const categories = new Map<string, typeof data.shoppingList>();
  for (const item of data.shoppingList) {
    if (!categories.has(item.category)) {
      categories.set(item.category, []);
    }
    categories.get(item.category)!.push(item);
  }

  for (const [category, items] of categories) {
    elements.push(
      new Paragraph({
        children: [new TextRun({ text: category, bold: true, size: 22, color: headerColor })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    const headerRow = new TableRow({
      children: ['Item', 'Qty', 'Store', 'Bought', 'Est. Cost'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 16, color: 'FFFFFF' })] })],
            shading: { fill: headerColor },
          })
      ),
    });

    const dataRows = items.map(
      (item) =>
        new TableRow({
          children: [
            item.item_name,
            `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`,
            item.store || '-',
            item.purchased ? '✓' : '-',
            `$${item.estimated_cost.toFixed(2)}`,
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

  return elements;
}
