/**
 * ExportRow - Results count display row
 * @feature 006-guest-list
 * @task T022, T026
 *
 * Layout per PRD (05-PAGE-LAYOUTS.md):
 * - "Showing X-Y of Total" text aligned to the right
 */

interface ExportRowProps {
  startItem: number;
  endItem: number;
  total: number;
}

export function ExportRow({ startItem, endItem, total }: ExportRowProps) {
  return (
    <div className="flex justify-end">
      <span className="text-sm text-gray-500">
        {total > 0
          ? `Showing ${startItem}-${endItem} of ${total}`
          : 'Showing 0 of 0'}
      </span>
    </div>
  );
}
