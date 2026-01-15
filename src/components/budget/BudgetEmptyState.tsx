/**
 * BudgetEmptyState Component
 * @feature 011-budget-tracking
 * T011: Empty state for when no budget categories exist
 *
 * FR-011: Show empty state message when no categories exist
 */

import { Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BudgetEmptyStateProps {
  onAddCategory: () => void;
}

export function BudgetEmptyState({ onAddCategory }: BudgetEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Wallet className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No budget categories yet
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          Start tracking your wedding budget by adding categories like Venue,
          Catering, Photography, and more. You can set projected amounts and
          track actual spending for each category.
        </p>
        <Button onClick={onAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Category
        </Button>
      </CardContent>
    </Card>
  );
}
