/**
 * Budget Summary Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Budget Summary section to PDF
 */
export function renderBudgetSummaryPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.budget) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);
  let y = startY;

  // Overall totals
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
  doc.text('Budget Summary', 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(44, 44, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(`Projected Total: $${data.budget.totals.projected.toLocaleString()}`, 20, y);
  y += 5;
  doc.text(`Actual Total: $${data.budget.totals.actual.toLocaleString()}`, 20, y);
  y += 5;
  const varianceColor = data.budget.totals.variance >= 0 ? [220, 53, 69] : [40, 167, 69]; // Red if over, green if under
  doc.setTextColor(varianceColor[0], varianceColor[1], varianceColor[2]);
  doc.text(`Variance: $${Math.abs(data.budget.totals.variance).toLocaleString()} ${data.budget.totals.variance >= 0 ? 'over' : 'under'}`, 20, y);
  y += 10;

  // Category breakdown
  const tableData = data.budget.categories.map((cat) => [
    cat.category_name,
    `$${cat.projected_amount.toLocaleString()}`,
    `$${cat.actual_amount.toLocaleString()}`,
    `$${Math.abs(cat.variance).toLocaleString()} ${cat.variance >= 0 ? '↑' : '↓'}`,
  ]);

  doc.autoTable({
    startY: y,
    head: [['Category', 'Projected', 'Actual', 'Variance']],
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
      0: { cellWidth: 60 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/**
 * Renders Budget Summary section to DOCX
 */
export async function renderBudgetSummaryDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, HeadingLevel } = await import('docx');

  if (!data.budget) return [];

  const elements: (Paragraph | Table)[] = [];
  const headerColor = branding.primaryColor.replace('#', '');

  // Overall totals
  elements.push(
    new Paragraph({
      children: [new TextRun({ text: 'Budget Summary', bold: true, size: 22, color: headerColor })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  elements.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Projected Total: $${data.budget.totals.projected.toLocaleString()}`, size: 20 }),
      ],
      spacing: { after: 50 },
    })
  );

  elements.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Actual Total: $${data.budget.totals.actual.toLocaleString()}`, size: 20 }),
      ],
      spacing: { after: 50 },
    })
  );

  const varianceColor = data.budget.totals.variance >= 0 ? 'DC3545' : '28A745';
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Variance: $${Math.abs(data.budget.totals.variance).toLocaleString()} ${data.budget.totals.variance >= 0 ? 'over' : 'under'}`,
          size: 20,
          color: varianceColor,
          bold: true,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Category breakdown table
  const headerRow = new TableRow({
    children: ['Category', 'Projected', 'Actual', 'Variance'].map(
      (text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })] })],
          shading: { fill: headerColor },
        })
    ),
  });

  const dataRows = data.budget.categories.map(
    (cat) =>
      new TableRow({
        children: [
          cat.category_name,
          `$${cat.projected_amount.toLocaleString()}`,
          `$${cat.actual_amount.toLocaleString()}`,
          `$${Math.abs(cat.variance).toLocaleString()} ${cat.variance >= 0 ? '↑' : '↓'}`,
        ].map(
          (text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
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

  return elements;
}
