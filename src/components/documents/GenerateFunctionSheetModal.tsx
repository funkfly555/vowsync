/**
 * GenerateFunctionSheetModal Component
 * Feature: 017-document-generation
 *
 * Modal dialog for generating Function Sheet documents with section selection,
 * branding options, and format selection.
 */

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Palette } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionCheckboxes } from './SectionCheckboxes';
import { DocumentPreview } from './DocumentPreview';
import { useDocumentGeneration } from '@/hooks/useDocumentGeneration';
import { DEFAULT_FUNCTION_SHEET_SECTIONS } from '@/lib/documents/sectionRenderers';
import type { DocumentSection, DocumentBranding, SectionCounts } from '@/types/document';

interface GenerateFunctionSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  weddingTitle?: string;
}

const DEFAULT_BRANDING: DocumentBranding = {
  primaryColor: '#4F46E5',
  companyName: 'VowSync',
};

export function GenerateFunctionSheetModal({
  open,
  onOpenChange,
  weddingId,
  weddingTitle = 'Wedding',
}: GenerateFunctionSheetModalProps) {
  const [selectedSections, setSelectedSections] = useState<DocumentSection[]>([
    ...DEFAULT_FUNCTION_SHEET_SECTIONS,
  ]);
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
  const [branding, setBranding] = useState<DocumentBranding>(DEFAULT_BRANDING);
  const [sectionCounts, setSectionCounts] = useState<SectionCounts | null>(null);
  const [activeTab, setActiveTab] = useState('sections');

  const { generateFunctionSheet, getSectionCounts, isGenerating, error, clearError } =
    useDocumentGeneration();

  // Fetch section counts when modal opens
  useEffect(() => {
    if (open && weddingId) {
      getSectionCounts(weddingId).then(setSectionCounts).catch(console.error);
    }
  }, [open, weddingId, getSectionCounts]);

  // Clear error when modal closes
  useEffect(() => {
    if (!open) {
      clearError();
    }
  }, [open, clearError]);

  const handleGenerate = async () => {
    if (selectedSections.length === 0) return;

    try {
      await generateFunctionSheet({
        weddingId,
        sections: selectedSections,
        format,
        branding,
      });
      onOpenChange(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleBrandingChange = (field: keyof DocumentBranding, value: string | undefined) => {
    setBranding((prev) => ({ ...prev, [field]: value || undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Function Sheet
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive Function Sheet for {weddingTitle}. Select which sections to
            include and customize the document format.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[50vh]">
            <TabsContent value="sections" className="mt-0 space-y-4">
              <SectionCheckboxes
                selectedSections={selectedSections}
                onSectionChange={setSelectedSections}
                sectionCounts={sectionCounts || undefined}
                disabled={isGenerating}
              />
            </TabsContent>

            <TabsContent value="branding" className="mt-0 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={branding.companyName || ''}
                    onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                    placeholder="Your Company Name"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Displayed in the document header
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                      disabled={isGenerating}
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      placeholder="#4F46E5"
                      className="flex-1"
                      disabled={isGenerating}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for headers and accent elements
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Input
                    id="tagline"
                    value={branding.tagline || ''}
                    onChange={(e) => handleBrandingChange('tagline', e.target.value)}
                    placeholder="Your wedding planning partner"
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={branding.contactEmail || ''}
                    onChange={(e) => handleBrandingChange('contactEmail', e.target.value)}
                    placeholder="contact@example.com"
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={branding.contactPhone || ''}
                    onChange={(e) => handleBrandingChange('contactPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={branding.website || ''}
                    onChange={(e) => handleBrandingChange('website', e.target.value)}
                    placeholder="https://example.com"
                    disabled={isGenerating}
                  />
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4" />
                  Color Preview
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-10 rounded-md border"
                    style={{ backgroundColor: branding.primaryColor }}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium" style={{ color: branding.primaryColor }}>
                      Section Header
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Headers and table headers will use this color
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <DocumentPreview
                selectedSections={selectedSections}
                sectionCounts={sectionCounts || undefined}
                format={format}
                documentTitle={`${weddingTitle} - Function Sheet`}
              />
            </TabsContent>
          </div>
        </Tabs>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error.message}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex items-center gap-2 mr-auto">
            <Label htmlFor="format" className="text-sm">
              Format:
            </Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as 'pdf' | 'docx')}
              disabled={isGenerating}
            >
              <SelectTrigger id="format" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedSections.length === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
