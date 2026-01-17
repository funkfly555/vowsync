/**
 * DocumentPreview Component
 * Feature: 017-document-generation
 *
 * Shows a preview of what sections will be included in the generated document.
 */

import { FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SECTION_METADATA } from '@/lib/documents/sectionRenderers';
import type { DocumentSection, SectionCounts } from '@/types/document';

interface DocumentPreviewProps {
  selectedSections: DocumentSection[];
  sectionCounts?: SectionCounts;
  format: 'pdf' | 'docx';
  documentTitle?: string;
}

export function DocumentPreview({
  selectedSections,
  sectionCounts,
  format,
  documentTitle = 'Function Sheet',
}: DocumentPreviewProps) {
  const emptySections = selectedSections.filter((section) => {
    if (!sectionCounts) return false;
    const countKey = section as keyof SectionCounts;
    return sectionCounts[countKey] === 0;
  });

  const getCountForSection = (section: DocumentSection): number | undefined => {
    if (!sectionCounts) return undefined;
    const countKey = section as keyof SectionCounts;
    return sectionCounts[countKey];
  };

  return (
    <div className="space-y-4">
      {/* Document Header Preview */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">{documentTitle}</h4>
            <p className="text-sm text-muted-foreground">
              {format.toUpperCase()} • {selectedSections.length} sections
            </p>
          </div>
        </div>

        {/* Section List */}
        {selectedSections.length > 0 ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Included Sections
            </p>
            <ol className="space-y-1.5">
              {selectedSections.map((section, index) => {
                const metadata = SECTION_METADATA[section];
                const count = getCountForSection(section);
                const isEmpty = count === 0;

                return (
                  <li
                    key={section}
                    className={`flex items-center gap-2 text-sm ${isEmpty ? 'text-muted-foreground' : ''}`}
                  >
                    <span className="w-5 text-muted-foreground text-xs">{index + 1}.</span>
                    <span className={isEmpty ? 'line-through' : ''}>
                      {metadata?.label || section}
                    </span>
                    {count !== undefined && (
                      <Badge
                        variant={isEmpty ? 'outline' : 'secondary'}
                        className="text-xs ml-auto"
                      >
                        {count} {count === 1 ? 'item' : 'items'}
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No sections selected</p>
        )}
      </div>

      {/* Empty Sections Warning */}
      {emptySections.length > 0 && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">
              {emptySections.length} section{emptySections.length > 1 ? 's have' : ' has'} no data
            </p>
            <p className="text-sm text-muted-foreground">
              The following sections will show as empty:{' '}
              {emptySections.map((s) => SECTION_METADATA[s]?.label || s).join(', ')}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* No Sections Warning */}
      {selectedSections.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select at least one section to include in the document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
