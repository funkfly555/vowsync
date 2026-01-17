/**
 * SectionCheckboxes Component
 * Feature: 017-document-generation
 *
 * Checkbox group for selecting document sections with category grouping.
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SECTION_METADATA, ALL_SECTIONS } from '@/lib/documents/sectionRenderers';
import type { DocumentSection, SectionCounts } from '@/types/document';

interface SectionCheckboxesProps {
  selectedSections: DocumentSection[];
  onSectionChange: (sections: DocumentSection[]) => void;
  sectionCounts?: SectionCounts;
  disabled?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  overview: 'Overview',
  guests: 'Guest Information',
  logistics: 'Logistics & Services',
  vendors: 'Vendors',
  finance: 'Financial',
};

const CATEGORY_ORDER = ['overview', 'guests', 'logistics', 'vendors', 'finance'];

export function SectionCheckboxes({
  selectedSections,
  onSectionChange,
  sectionCounts,
  disabled = false,
}: SectionCheckboxesProps) {
  const handleSectionToggle = (section: DocumentSection) => {
    if (selectedSections.includes(section)) {
      onSectionChange(selectedSections.filter((s) => s !== section));
    } else {
      onSectionChange([...selectedSections, section]);
    }
  };

  const handleSelectAll = () => {
    onSectionChange([...ALL_SECTIONS]);
  };

  const handleClearAll = () => {
    onSectionChange([]);
  };

  const handleSelectCategory = (category: string) => {
    const categorySections = ALL_SECTIONS.filter(
      (section) => SECTION_METADATA[section]?.category === category
    );
    const allSelected = categorySections.every((s) => selectedSections.includes(s));

    if (allSelected) {
      onSectionChange(selectedSections.filter((s) => !categorySections.includes(s)));
    } else {
      const newSections = new Set([...selectedSections, ...categorySections]);
      onSectionChange([...newSections] as DocumentSection[]);
    }
  };

  // Group sections by category
  const sectionsByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    sections: ALL_SECTIONS.filter((section) => SECTION_METADATA[section]?.category === category),
  }));

  const getCountForSection = (section: DocumentSection): number | undefined => {
    if (!sectionCounts) return undefined;
    const countKey = section as keyof SectionCounts;
    return sectionCounts[countKey];
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          Select All
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          type="button"
          onClick={handleClearAll}
          disabled={disabled}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          Clear All
        </button>
        <span className="ml-auto text-sm text-muted-foreground">
          {selectedSections.length} of {ALL_SECTIONS.length} selected
        </span>
      </div>

      {/* Sections by Category */}
      <div className="space-y-6">
        {sectionsByCategory.map(({ category, label, sections }) => {
          const categorySelected = sections.filter((s) => selectedSections.includes(s)).length;
          const allCategorySelected = categorySelected === sections.length;

          return (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={allCategorySelected}
                  onCheckedChange={() => handleSelectCategory(category)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {label}
                </Label>
                <Badge variant="secondary" className="ml-auto">
                  {categorySelected}/{sections.length}
                </Badge>
              </div>

              {/* Section Checkboxes */}
              <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sections.map((section) => {
                  const metadata = SECTION_METADATA[section];
                  const count = getCountForSection(section);
                  const isEmpty = count === 0;

                  return (
                    <div
                      key={section}
                      className={`flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 ${
                        isEmpty ? 'opacity-60' : ''
                      }`}
                    >
                      <Checkbox
                        id={`section-${section}`}
                        checked={selectedSections.includes(section)}
                        onCheckedChange={() => handleSectionToggle(section)}
                        disabled={disabled}
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`section-${section}`}
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          {metadata?.label || section}
                          {count !== undefined && (
                            <Badge
                              variant={isEmpty ? 'outline' : 'secondary'}
                              className="text-xs"
                            >
                              {count}
                            </Badge>
                          )}
                        </Label>
                        {metadata?.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {metadata.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
