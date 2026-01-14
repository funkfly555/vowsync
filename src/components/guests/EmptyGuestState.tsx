/**
 * EmptyGuestState - Empty state when no guests exist
 * @feature 006-guest-list
 * @task T041, T042
 */

import { Users } from 'lucide-react';

export function EmptyGuestState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No guests yet</h3>
      <p className="text-gray-500 text-center max-w-sm">
        Click '+ Add Guest' to get started building your guest list.
      </p>
    </div>
  );
}
