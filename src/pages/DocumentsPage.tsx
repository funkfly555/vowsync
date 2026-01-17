/**
 * DocumentsPage - Document Generation page
 * @feature 017-document-generation
 *
 * Opens the Generate Function Sheet modal automatically.
 * When modal is closed, navigates back to dashboard.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { GenerateFunctionSheetModal } from '@/components/documents';

export function DocumentsPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  // Handle modal close - navigate back to dashboard
  const handleModalChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      navigate(`/weddings/${weddingId}`);
    }
  };

  // Ensure modal opens on mount (in case of direct navigation)
  useEffect(() => {
    setModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FileText className="h-16 w-16 text-gray-300 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Document Generation</h1>
      <p className="text-gray-500 mb-6">
        Generate Function Sheets and Vendor Briefs for your wedding.
      </p>
      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-[#D4A5A5] hover:bg-[#C49494] text-white rounded-lg transition-colors"
      >
        Open Document Generator
      </button>

      <GenerateFunctionSheetModal
        open={modalOpen}
        onOpenChange={handleModalChange}
        weddingId={weddingId || ''}
      />
    </div>
  );
}
