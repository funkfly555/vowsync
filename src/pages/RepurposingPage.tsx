/**
 * RepurposingPage Component
 * @feature 014-repurposing-timeline
 * @task T020
 *
 * Main page component for repurposing timeline management
 * Route: /weddings/:weddingId/repurposing
 */

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, List, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RepurposingList,
  RepurposingModal,
  RepurposingGantt,
  DeleteRepurposingDialog,
} from '@/components/repurposing';
import { CompleteInstructionDialog } from '@/components/repurposing/CompleteInstructionDialog';
import { ReportIssueDialog } from '@/components/repurposing/ReportIssueDialog';
import {
  useRepurposingInstructions,
  useEventsForDropdown,
  useWeddingItemsForDropdown,
} from '@/hooks/useRepurposingInstructions';
import {
  useStartInstruction,
  useCompleteInstruction,
  useReportIssue,
  useResumeInstruction,
  useDeleteRepurposingInstruction,
} from '@/hooks/useRepurposingMutations';
import type { RepurposingInstructionWithRelations } from '@/types/repurposing';

type ViewMode = 'list' | 'gantt';

export function RepurposingPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedInstruction, setSelectedInstruction] =
    useState<RepurposingInstructionWithRelations | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instructionToDelete, setInstructionToDelete] =
    useState<RepurposingInstructionWithRelations | null>(null);

  // Complete dialog state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [instructionToComplete, setInstructionToComplete] =
    useState<RepurposingInstructionWithRelations | null>(null);

  // Issue dialog state
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [instructionForIssue, setInstructionForIssue] =
    useState<RepurposingInstructionWithRelations | null>(null);

  // Status announcement for screen readers
  const [statusAnnouncement, setStatusAnnouncement] = useState('');
  const announceStatus = useCallback((message: string) => {
    setStatusAnnouncement(message);
    // Clear after announcement
    setTimeout(() => setStatusAnnouncement(''), 1000);
  }, []);

  // Fetch data
  const {
    instructions,
    isLoading,
    isError,
    error,
  } = useRepurposingInstructions({ weddingId: weddingId! });

  const { data: events = [] } = useEventsForDropdown(weddingId!);
  const { data: items = [] } = useWeddingItemsForDropdown(weddingId!);

  // Mutations
  const startMutation = useStartInstruction(weddingId!);
  const completeMutation = useCompleteInstruction(weddingId!);
  const reportIssueMutation = useReportIssue(weddingId!);
  const resumeMutation = useResumeInstruction(weddingId!);
  const deleteMutation = useDeleteRepurposingInstruction(weddingId!);

  // Handlers
  const handleAddInstruction = () => {
    setModalMode('create');
    setSelectedInstruction(null);
    setIsModalOpen(true);
  };

  const handleEditInstruction = (instruction: RepurposingInstructionWithRelations) => {
    setModalMode('edit');
    setSelectedInstruction(instruction);
    setIsModalOpen(true);
  };

  const handleDeleteInstruction = (instruction: RepurposingInstructionWithRelations) => {
    setInstructionToDelete(instruction);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (instructionToDelete) {
      await deleteMutation.mutateAsync(instructionToDelete.id);
      setDeleteDialogOpen(false);
      setInstructionToDelete(null);
    }
  };

  const handleStartInstruction = (instructionId: string) => {
    startMutation.mutate(instructionId, {
      onSuccess: () => announceStatus('Instruction started'),
    });
  };

  const handleCompleteInstruction = (instruction: RepurposingInstructionWithRelations) => {
    setInstructionToComplete(instruction);
    setCompleteDialogOpen(true);
  };

  const handleConfirmComplete = async (completedBy: string) => {
    if (instructionToComplete) {
      await completeMutation.mutateAsync({
        instructionId: instructionToComplete.id,
        completedBy,
      });
      announceStatus('Instruction marked as complete');
      setCompleteDialogOpen(false);
      setInstructionToComplete(null);
    }
  };

  const handleReportIssue = (instruction: RepurposingInstructionWithRelations) => {
    setInstructionForIssue(instruction);
    setIssueDialogOpen(true);
  };

  const handleConfirmIssue = async (issueDescription: string) => {
    if (instructionForIssue) {
      await reportIssueMutation.mutateAsync({
        instructionId: instructionForIssue.id,
        issueDescription,
      });
      announceStatus('Issue reported');
      setIssueDialogOpen(false);
      setInstructionForIssue(null);
    }
  };

  const handleResumeInstruction = (instructionId: string) => {
    resumeMutation.mutate(instructionId, {
      onSuccess: () => announceStatus('Instruction resumed'),
    });
  };

  const handleGanttBarClick = (instruction: RepurposingInstructionWithRelations) => {
    handleEditInstruction(instruction);
  };

  if (!weddingId) {
    return <div>Wedding ID is required</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ARIA live region for status announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusAnnouncement}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repurposing Timeline</h1>
          <p className="text-muted-foreground">
            Track item movements between events
          </p>
        </div>
        <Button onClick={handleAddInstruction} className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Add Instruction
        </Button>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="list" className="min-h-[44px]">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="gantt" className="min-h-[44px]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Gantt Chart
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {viewMode === 'list' ? (
        <RepurposingList
          instructions={instructions}
          events={events}
          items={items}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onAddInstruction={handleAddInstruction}
          onEditInstruction={handleEditInstruction}
          onDeleteInstruction={handleDeleteInstruction}
          onStartInstruction={handleStartInstruction}
          onCompleteInstruction={handleCompleteInstruction}
          onReportIssue={handleReportIssue}
          onResumeInstruction={handleResumeInstruction}
        />
      ) : (
        <RepurposingGantt
          instructions={instructions}
          isLoading={isLoading}
          onBarClick={handleGanttBarClick}
        />
      )}

      {/* Create/Edit Modal */}
      <RepurposingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        weddingId={weddingId}
        mode={modalMode}
        instruction={selectedInstruction}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteRepurposingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        instruction={instructionToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* Complete Instruction Dialog */}
      <CompleteInstructionDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        instruction={instructionToComplete}
        onConfirm={handleConfirmComplete}
        isLoading={completeMutation.isPending}
      />

      {/* Report Issue Dialog */}
      <ReportIssueDialog
        open={issueDialogOpen}
        onOpenChange={setIssueDialogOpen}
        instruction={instructionForIssue}
        onConfirm={handleConfirmIssue}
        isLoading={reportIssueMutation.isPending}
      />
    </div>
  );
}
