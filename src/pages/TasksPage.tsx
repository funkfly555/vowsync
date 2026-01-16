/**
 * TasksPage - Route wrapper for task management
 * @feature 015-task-management-kanban
 * @task T013
 */

import { useParams } from 'react-router-dom';
import { useWedding } from '@/hooks/useWeddings';
import { TasksPageContent } from '@/components/tasks/TasksPageContent';

export function TasksPage() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const { data: wedding, isLoading: isWeddingLoading } = useWedding(weddingId || '');

  // Handle invalid wedding ID
  if (!weddingId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Wedding not found</p>
      </div>
    );
  }

  // Show loading state while fetching wedding
  if (isWeddingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <TasksPageContent
      weddingId={weddingId}
      weddingDate={wedding?.wedding_date}
    />
  );
}
