/**
 * Meal Selections Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Meal Selections section to PDF
 */
export function renderMealSelectionsPDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  if (!data.mealSelections) return startY;

  const primaryRGB = hexToRgb(branding.primaryColor);
  let y = startY;

  // Helper to render a meal category
  const renderCategory = (title: string, selections: Record<string, number>) => {
    const entries = Object.entries(selections);
    if (entries.length === 0) return;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.text(title, 20, y);
    y += 6;

    const tableData = entries.map(([choice, count]) => [choice, count.toString()]);
    tableData.push(['Total', entries.reduce((sum, [, count]) => sum + count, 0).toString()]);

    doc.autoTable({
      startY: y,
      head: [['Choice', 'Count']],
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
        0: { cellWidth: 100 },
        1: { cellWidth: 30, halign: 'center' },
      },
      margin: { left: 20, right: 20 },
      tableWidth: 130,
    });

    y = doc.lastAutoTable.finalY + 8;
  };

  renderCategory('Starters', data.mealSelections.starters);
  renderCategory('Mains', data.mealSelections.mains);
  renderCategory('Desserts', data.mealSelections.desserts);

  if (Object.keys(data.mealSelections.dietaryRestrictions).length > 0) {
    renderCategory('Dietary Restrictions', data.mealSelections.dietaryRestrictions);
  }

  return y;
}

/**
 * Renders Meal Selections section to DOCX
 */
export async function renderMealSelectionsDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, HeadingLevel } = await import('docx');

  if (!data.mealSelections) return [];

  const elements: (Paragraph | Table)[] = [];
  const headerColor = branding.primaryColor.replace('#', '');

  const renderCategory = (title: string, selections: Record<string, number>) => {
    const entries = Object.entries(selections);
    if (entries.length === 0) return;

    elements.push(
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 22, color: headerColor })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    const headerRow = new TableRow({
      children: ['Choice', 'Count'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })] })],
            shading: { fill: headerColor },
          })
      ),
    });

    const dataRows = entries.map(
      ([choice, count]) =>
        new TableRow({
          children: [choice, count.toString()].map(
            (text) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, size: 18 })] })],
              })
          ),
        })
    );

    // Total row
    const totalRow = new TableRow({
      children: ['Total', entries.reduce((sum, [, count]) => sum + count, 0).toString()].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })] })],
          })
      ),
    });

    elements.push(
      new Table({
        rows: [headerRow, ...dataRows, totalRow],
        width: { size: 50, type: WidthType.PERCENTAGE },
      })
    );
  };

  renderCategory('Starters', data.mealSelections.starters);
  renderCategory('Mains', data.mealSelections.mains);
  renderCategory('Desserts', data.mealSelections.desserts);

  if (Object.keys(data.mealSelections.dietaryRestrictions).length > 0) {
    renderCategory('Dietary Restrictions', data.mealSelections.dietaryRestrictions);
  }

  return elements;
}
