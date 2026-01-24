/**
 * CategoryTypeSelector - Dropdown for selecting budget category types
 * @feature 029-budget-vendor-integration
 * @task T030: Create category type selector component
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBudgetCategoryTypes } from '@/hooks/useBudgetCategoryTypes';
import { Loader2 } from 'lucide-react';

interface CategoryTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CategoryTypeSelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a category type',
}: CategoryTypeSelectorProps) {
  const { categoryTypes, isLoading } = useBudgetCategoryTypes();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-gray-50">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading categories...</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categoryTypes.map((type) => (
          <SelectItem key={type.id} value={type.id}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
