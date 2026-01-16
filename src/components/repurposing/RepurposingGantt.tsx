/**
 * RepurposingGantt Component
 * @feature 014-repurposing-timeline
 * @task T023
 *
 * Gantt chart visualization for repurposing instructions
 * Shows timeline of item movements between events
 */

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  RepurposingInstructionWithRelations,
  GanttBarData,
} from '@/types/repurposing';
import { STATUS_HEX_COLORS } from '@/types/repurposing';

interface RepurposingGanttProps {
  instructions: RepurposingInstructionWithRelations[];
  isLoading: boolean;
  onBarClick?: (instruction: RepurposingInstructionWithRelations) => void;
}

/**
 * Calculate time position as percentage of day (0-100)
 */
function timeToPercent(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes / (24 * 60)) * 100;
}

/**
 * Group instructions by date for row organization
 */
function groupByDate(
  instructions: RepurposingInstructionWithRelations[]
): Map<string, RepurposingInstructionWithRelations[]> {
  const groups = new Map<string, RepurposingInstructionWithRelations[]>();

  instructions.forEach((inst) => {
    // Use from_event date as the primary date
    const date = inst.from_event.event_date;
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(inst);
  });

  // Sort by date
  return new Map(
    [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
  );
}

/**
 * Convert instruction to Gantt bar data
 */
function instructionToBarData(
  instruction: RepurposingInstructionWithRelations
): GanttBarData {
  const startPercent = timeToPercent(instruction.pickup_time);
  const endPercent = timeToPercent(instruction.dropoff_time);

  return {
    id: instruction.id,
    label: instruction.wedding_items.description,
    startTime: instruction.pickup_time,
    endTime: instruction.dropoff_time,
    startPercent,
    widthPercent: Math.max(endPercent - startPercent, 2), // Min 2% width for visibility
    color: STATUS_HEX_COLORS[instruction.status],
    status: instruction.status,
    fromEvent: instruction.from_event.event_name,
    toEvent: instruction.to_event.event_name,
    isCritical: instruction.is_critical,
  };
}

/**
 * Time axis labels (every 2 hours)
 */
const TIME_LABELS = [
  '12am',
  '2am',
  '4am',
  '6am',
  '8am',
  '10am',
  '12pm',
  '2pm',
  '4pm',
  '6pm',
  '8pm',
  '10pm',
];

export function RepurposingGantt({
  instructions,
  isLoading,
  onBarClick,
}: RepurposingGanttProps) {
  // Group instructions by date
  const groupedInstructions = useMemo(
    () => groupByDate(instructions),
    [instructions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (instructions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No repurposing instructions to display in the timeline.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <GanttLegend />

      {/* Chart */}
      <div className="border rounded-lg overflow-hidden">
        {/* Time axis header */}
        <div className="flex border-b bg-muted/30">
          <div className="w-48 shrink-0 p-2 font-medium text-sm border-r">
            Date / Item
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {TIME_LABELS.map((label) => (
                <div
                  key={label}
                  className="flex-1 text-xs text-muted-foreground p-1 text-center border-l first:border-l-0"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows grouped by date */}
        {[...groupedInstructions.entries()].map(([date, items]) => (
          <div key={date} className="border-b last:border-b-0">
            {/* Date header */}
            <div className="flex bg-muted/10">
              <div className="w-48 shrink-0 p-2 font-medium text-sm border-r">
                {format(parseISO(date), 'EEE, MMM d')}
              </div>
              <div className="flex-1" />
            </div>

            {/* Instruction bars */}
            {items.map((instruction) => {
              const bar = instructionToBarData(instruction);
              return (
                <div
                  key={instruction.id}
                  className="flex border-t hover:bg-muted/5"
                >
                  {/* Item label */}
                  <div className="w-48 shrink-0 p-2 text-sm border-r truncate">
                    <span
                      className={cn(
                        instruction.is_critical && 'text-red-600 font-medium'
                      )}
                    >
                      {instruction.wedding_items.description}
                    </span>
                  </div>

                  {/* Timeline area */}
                  <div className="flex-1 relative h-10">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {TIME_LABELS.map((label) => (
                        <div
                          key={label}
                          className="flex-1 border-l first:border-l-0 border-dashed border-muted"
                        />
                      ))}
                    </div>

                    {/* Bar */}
                    <button
                      onClick={() => onBarClick?.(instruction)}
                      className={cn(
                        'absolute top-1 h-8 rounded px-2 text-xs text-white font-medium',
                        'flex items-center gap-1 overflow-hidden',
                        'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1',
                        'transition-opacity cursor-pointer',
                        instruction.is_critical && 'ring-2 ring-red-400'
                      )}
                      style={{
                        left: `${bar.startPercent}%`,
                        width: `${bar.widthPercent}%`,
                        backgroundColor: bar.color,
                        minWidth: '60px',
                      }}
                      title={`${bar.label}: ${bar.startTime} - ${bar.endTime}\n${bar.fromEvent} → ${bar.toEvent}`}
                    >
                      <span className="truncate">
                        {bar.startTime.slice(0, 5)} → {bar.endTime.slice(0, 5)}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Legend component showing status colors
 */
function GanttLegend() {
  const items = [
    { status: 'pending', label: 'Pending', color: STATUS_HEX_COLORS.pending },
    {
      status: 'in_progress',
      label: 'In Progress',
      color: STATUS_HEX_COLORS.in_progress,
    },
    {
      status: 'completed',
      label: 'Completed',
      color: STATUS_HEX_COLORS.completed,
    },
    { status: 'issue', label: 'Issue', color: STATUS_HEX_COLORS.issue },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm">
      {items.map((item) => (
        <div key={item.status} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 ml-4">
        <div className="w-4 h-4 rounded border-2 border-red-400 bg-gray-200" />
        <span>Critical Item</span>
      </div>
    </div>
  );
}
