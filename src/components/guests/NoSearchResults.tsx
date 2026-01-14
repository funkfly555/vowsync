/**
 * NoSearchResults - Empty state when filters return no results
 * @feature 006-guest-list
 * @task T043
 */

import { Search } from 'lucide-react';

interface NoSearchResultsProps {
  searchTerm?: string;
}

export function NoSearchResults({ searchTerm }: NoSearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
      <p className="text-gray-500 text-center max-w-sm">
        {searchTerm
          ? `No guests match "${searchTerm}". Try adjusting your search or filters.`
          : 'No guests match your current filters. Try adjusting your search criteria.'}
      </p>
    </div>
  );
}
