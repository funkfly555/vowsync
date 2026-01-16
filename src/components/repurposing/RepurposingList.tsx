/**
 * RepurposingList Component
 * @feature 014-repurposing-timeline
 * @task T019
 *
 * List container for repurposing instructions
 */

import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RepurposingCard } from './RepurposingCard';
import { RepurposingFilters, filterInstructions } from './RepurposingFilters';
import { RepurposingEmptyState } from './RepurposingEmptyState';
import type {
  RepurposingInstructionWithRelations,
  RepurposingFilters as Filters,
} from '@/types/repurposing';
import { DEFAULT_REPURPOSING_FILTERS } from '@/types/repurposing';

interface EventOption {
  id: string;
  event_name: string;
}

interface ItemOption {
  id: string;
  description: string;
}

interface RepurposingListProps {
  instructions: RepurposingInstructionWithRelations[];
  events: EventOption[];
  items: ItemOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onAddInstruction: () => void;
  onEditInstruction: (instruction: RepurposingInstructionWithRelations) => void;
  onDeleteInstruction: (instruction: RepurposingInstructionWithRelations) => void;
  onStartInstruction: (instructionId: string) => void;
  onCompleteInstruction: (instruction: RepurposingInstructionWithRelations) => void;
  onReportIssue: (instruction: RepurposingInstructionWithRelations) => void;
  onResumeInstruction: (instructionId: string) => void;
}

export function RepurposingList({
  instructions,
  events,
  items,
  isLoading,
  isError,
  error,
  onAddInstruction,
  onEditInstruction,
  onDeleteInstruction,
  onStartInstruction,
  onCompleteInstruction,
  onReportIssue,
  onResumeInstruction,
}: RepurposingListProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_REPURPOSING_FILTERS);

  // Apply filters
  const filteredInstructions = useMemo(
    () => filterInstructions(instructions, filters),
    [instructions, filters]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading repurposing instructions</AlertTitle>
        <AlertDescription>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state (no instructions at all)
  if (instructions.length === 0) {
    return <RepurposingEmptyState onAddInstruction={onAddInstruction} />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <RepurposingFilters
        filters={filters}
        onFilterChange={setFilters}
        instructions={instructions}
        events={events}
        items={items}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredInstructions.length} of {instructions.length} instructions
      </div>

      {/* Instructions list */}
      {filteredInstructions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No instructions match the current filters.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInstructions.map((instruction) => (
            <RepurposingCard
              key={instruction.id}
              instruction={instruction}
              onEdit={() => onEditInstruction(instruction)}
              onDelete={() => onDeleteInstruction(instruction)}
              onStart={() => onStartInstruction(instruction.id)}
              onComplete={() => onCompleteInstruction(instruction)}
              onReportIssue={() => onReportIssue(instruction)}
              onResume={() => onResumeInstruction(instruction.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
