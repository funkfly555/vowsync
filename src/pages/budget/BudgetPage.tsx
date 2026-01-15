/**
 * BudgetPage Component
 * @feature 011-budget-tracking
 * T007: Main budget overview page with routing
 *
 * Displays budget overview with stat cards, progress bar, categories table,
 * and pie chart visualization for a wedding.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudgetCategories } from '@/hooks/useBudgetCategories';
import { calculateBudgetOverview } from '@/lib/budgetStatus';
import type { BudgetCategory } from '@/types/budget';
import { BudgetStatCards } from '@/components/budget/BudgetStatCards';
import { BudgetProgressBar } from '@/components/budget/BudgetProgressBar';
import { BudgetEmptyState } from '@/components/budget/BudgetEmptyState';
import { BudgetCategoriesTable } from '@/components/budget/BudgetCategoriesTable';
import { BudgetCategoryModal } from '@/components/budget/BudgetCategoryModal';
import { DeleteBudgetCategoryDialog } from '@/components/budget/DeleteBudgetCategoryDialog';
import { BudgetPieChart } from '@/components/budget/BudgetPieChart';

export function BudgetPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { categories, isLoading, isError, error, refetch } = useBudgetCategories(weddingId);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<BudgetCategory | null>(null);

  // Calculate overview stats
  const overview = calculateBudgetOverview(categories);

  // Event handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: BudgetCategory) => {
    setDeletingCategory(category);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    refetch();
  };

  const handleDeleteClose = () => {
    setDeletingCategory(null);
  };

  const handleDeleteSuccess = () => {
    setDeletingCategory(null);
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
            <p className="text-sm text-gray-500 mt-1">Loading budget data...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Wallet className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading budget
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  const isEmpty = categories.length === 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your wedding budget and expenses
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isEmpty ? (
        <BudgetEmptyState onAddCategory={handleAddCategory} />
      ) : (
        <>
          {/* Stat cards */}
          <BudgetStatCards overview={overview} />

          {/* Progress bar */}
          <BudgetProgressBar
            percentSpent={overview.percentSpent}
            totalBudget={overview.totalBudget}
            totalSpent={overview.totalSpent}
          />

          {/* Main content: Table and Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories table - takes 2 columns */}
            <div className="lg:col-span-2">
              <BudgetCategoriesTable
                categories={categories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            </div>

            {/* Pie chart - takes 1 column */}
            <div className="lg:col-span-1">
              <BudgetPieChart categories={categories} totalBudget={overview.totalBudget} />
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <BudgetCategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        category={editingCategory}
        weddingId={weddingId || ''}
        onSuccess={handleModalSuccess}
        onClose={handleModalClose}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteBudgetCategoryDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && handleDeleteClose()}
        category={deletingCategory}
        weddingId={weddingId || ''}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
