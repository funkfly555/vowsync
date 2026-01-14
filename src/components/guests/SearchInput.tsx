/**
 * SearchInput - Search input for filtering guests by name
 * @feature 006-guest-list
 * @task T017
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search guests by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
}
