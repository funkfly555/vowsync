/**
 * BudgetCategoriesTable Component
 * @feature 011-budget-tracking
 * T015, T023: Categories data table with sortable columns
 *
 * FR-004: Display categories in sortable table with columns:
 * Category Name, Projected Amount, Actual Amount, Variance, Status
 */

import { useState } from 'react';
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BudgetCategory } from '@/types/budget';
import { formatCurrency, formatVariance, getVarianceColor } from '@/lib/budgetStatus';
import { BudgetStatusBadge } from './BudgetStatusBadge';

interface BudgetCategoriesTableProps {
  categories: BudgetCategory[];
  onEdit: (category: BudgetCategory) => void;
  onDelete: (category: BudgetCategory) => void;
}

type SortField = 'category_name' | 'projected_amount' | 'actual_amount' | 'variance';
type SortDirection = 'asc' | 'desc';

// Moved outside component to avoid recreating during render
interface SortButtonProps {
  field: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
}

function SortButton({ field, children, onSort }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function BudgetCategoriesTable({
  categories,
  onEdit,
  onDelete,
}: BudgetCategoriesTableProps) {
  const [sortField, setSortField] = useState<SortField>('category_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort categories
  const sortedCategories = [...categories].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const aNum = aValue as number;
    const bNum = bValue as number;
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Budget Categories</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <SortButton field="category_name" onSort={handleSort}>Category</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="projected_amount" onSort={handleSort}>Projected</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="actual_amount" onSort={handleSort}>Actual</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="variance" onSort={handleSort}>Variance</SortButton>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.category_name}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(category.projected_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(category.actual_amount)}
                  </TableCell>
                  <TableCell className={`text-right ${getVarianceColor(category.variance)}`}>
                    {formatVariance(category.variance)}
                  </TableCell>
                  <TableCell className="text-center">
                    <BudgetStatusBadge
                      projectedAmount={category.projected_amount}
                      actualAmount={category.actual_amount}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(category)}
                        aria-label={`Edit ${category.category_name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(category)}
                        aria-label={`Delete ${category.category_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
