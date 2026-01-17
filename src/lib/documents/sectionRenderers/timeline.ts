/**
 * Timeline Section Renderer
 * Feature: 017-document-generation
 */

import type { jsPDF } from 'jspdf';
import type { Paragraph, Table } from 'docx';
import type { FunctionSheetData, DocumentBranding } from '@/types/document';
import { format } from 'date-fns';
import { hexToRgb } from '../pdfGenerator';

/**
 * Renders Timeline section to PDF
 */
export function renderTimelinePDF(
  doc: jsPDF,
  data: FunctionSheetData,
  branding: DocumentBranding,
  startY: number
): number {
  const primaryRGB = hexToRgb(branding.primaryColor);
  let y = startY;

  // Events timeline
  if (data.events && data.events.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.text('Events', 20, y);
    y += 6;

    const eventData = data.events.map((e) => [
      format(new Date(e.event_date), 'MMM d'),
      `${e.event_start_time} - ${e.event_end_time}`,
      e.event_name,
      e.event_location || '-',
    ]);

    doc.autoTable({
      startY: y,
      head: [['Date', 'Time', 'Event', 'Location']],
      body: eventData,
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
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 50 },
        3: { cellWidth: 60 },
      },
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // Pre/Post wedding tasks
  if (data.tasks && data.tasks.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.text('Pre/Post Wedding Tasks', 20, y);
    y += 6;

    const taskData = data.tasks.map((t) => [
      format(new Date(t.due_date), 'MMM d'),
      t.due_time || '-',
      t.title,
      t.assigned_to || '-',
      t.status,
    ]);

    doc.autoTable({
      startY: y,
      head: [['Date', 'Time', 'Task', 'Assigned', 'Status']],
      body: taskData,
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
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 60 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
      },
    });

    y = doc.lastAutoTable.finalY + 5;
  }

  return y;
}

/**
 * Renders Timeline section to DOCX
 */
export async function renderTimelineDOCX(
  data: FunctionSheetData,
  branding: DocumentBranding
): Promise<(Paragraph | Table)[]> {
  const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, HeadingLevel } = await import('docx');

  const elements: (Paragraph | Table)[] = [];
  const headerColor = branding.primaryColor.replace('#', '');

  // Events timeline
  if (data.events && data.events.length > 0) {
    elements.push(
      new Paragraph({
        children: [new TextRun({ text: 'Events', bold: true, size: 22, color: headerColor })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    const eventHeaderRow = new TableRow({
      children: ['Date', 'Time', 'Event', 'Location'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })] })],
            shading: { fill: headerColor },
          })
      ),
    });

    const eventRows = data.events.map(
      (e) =>
        new TableRow({
          children: [
            format(new Date(e.event_date), 'MMM d'),
            `${e.event_start_time} - ${e.event_end_time}`,
            e.event_name,
            e.event_location || '-',
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
        rows: [eventHeaderRow, ...eventRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  // Pre/Post wedding tasks
  if (data.tasks && data.tasks.length > 0) {
    elements.push(
      new Paragraph({
        children: [new TextRun({ text: 'Pre/Post Wedding Tasks', bold: true, size: 22, color: headerColor })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );

    const taskHeaderRow = new TableRow({
      children: ['Date', 'Time', 'Task', 'Assigned', 'Status'].map(
        (text) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })] })],
            shading: { fill: headerColor },
          })
      ),
    });

    const taskRows = data.tasks.map(
      (t) =>
        new TableRow({
          children: [
            format(new Date(t.due_date), 'MMM d'),
            t.due_time || '-',
            t.title,
            t.assigned_to || '-',
            t.status,
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
        rows: [taskHeaderRow, ...taskRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  return elements;
}
