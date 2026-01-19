/**
 * TableFilter - Dropdown filter for table number
 * @feature 021-guest-page-redesign
 * @task T059
 */

import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TABLE_NUMBERS } from '@/types/guest';

interface TableFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TableFilter({ value, onChange }: TableFilterProps) {
  const getDisplayText = () => {
    if (value === 'all') return 'All Tables';
    if (value === 'none') return 'No Table';
    return `Table ${value}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-4 border-[#E8E8E8] bg-white rounded-md"
        >
          {getDisplayText()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
        <DropdownMenuItem onClick={() => onChange('all')}>
          {value === 'all' && <Check className="mr-2 h-4 w-4" />}
          <span className={value !== 'all' ? 'ml-6' : ''}>All Tables</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('none')}>
          {value === 'none' && <Check className="mr-2 h-4 w-4" />}
          <span className={value !== 'none' ? 'ml-6' : ''}>No Table Assigned</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {TABLE_NUMBERS.map((tableNum) => (
          <DropdownMenuItem key={tableNum} onClick={() => onChange(tableNum)}>
            {value === tableNum && <Check className="mr-2 h-4 w-4" />}
            <span className={value !== tableNum ? 'ml-6' : ''}>Table {tableNum}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
