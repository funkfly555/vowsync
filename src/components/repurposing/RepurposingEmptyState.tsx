/**
 * RepurposingEmptyState Component
 * @feature 014-repurposing-timeline
 * @task T009
 *
 * Empty state display with add instruction CTA
 */

import { ArrowRightLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepurposingEmptyStateProps {
  onAddInstruction: () => void;
}

export function RepurposingEmptyState({ onAddInstruction }: RepurposingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No repurposing instructions</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create repurposing instructions to track how items move between events during
        the wedding. Track pickup and dropoff times, locations, and responsible parties.
      </p>
      <Button onClick={onAddInstruction} className="min-h-[44px]">
        <Plus className="h-4 w-4 mr-2" />
        Add Repurposing Instruction
      </Button>
    </div>
  );
}
