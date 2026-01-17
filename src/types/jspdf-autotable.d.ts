import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: {
    fillColor?: string | number[];
    textColor?: string | number[];
    fontStyle?: string;
    fontSize?: number;
  };
  bodyStyles?: {
    fontSize?: number;
    textColor?: string | number[];
  };
  alternateRowStyles?: {
    fillColor?: string | number[];
  };
  columnStyles?: Record<number, { cellWidth?: number | 'auto'; halign?: 'left' | 'center' | 'right' }>;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  tableWidth?: 'auto' | 'wrap' | number;
  styles?: {
    fontSize?: number;
    cellPadding?: number;
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
  };
  didDrawPage?: (data: { pageNumber: number; pageCount: number }) => void;
}
