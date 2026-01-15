/**
 * BarOrderEmptyState - Empty state component for bar orders list
 * @feature 012-bar-order-management
 * @task T013
 */

import { Wine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarOrderEmptyStateProps {
  onCreateClick: () => void;
}

/**
 * Empty state component displayed when no bar orders exist
 * Shows helpful message and create button
 */
export function BarOrderEmptyState({ onCreateClick }: BarOrderEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <Wine className="h-12 w-12 text-primary" />
      </div>

      {/* Heading */}
      <h3 className="text-xl font-semibold mb-2">No bar orders yet</h3>

      {/* Description */}
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first bar order to start planning beverages for your events.
        Our calculator helps you determine the right quantities based on guest
        count, event duration, and your custom consumption model.
      </p>

      {/* Features list */}
      <ul className="text-sm text-muted-foreground mb-6 space-y-1 text-left">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Auto-calculate servings based on event duration
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Track beverage percentages and unit costs
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Manage order status from draft to delivered
        </li>
      </ul>

      {/* Create Button */}
      <Button onClick={onCreateClick} size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Create Bar Order
      </Button>
    </div>
  );
}
