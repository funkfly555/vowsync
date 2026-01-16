/**
 * TasksPageContent Component
 * @feature 015-task-management-kanban
 * @task T012, T019
 *
 * Main page content with header and Kanban view
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskModal } from './TaskModal';
import { TaskKanbanView } from './TaskKanbanView';
import { TaskWithVendor } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';

interface TasksPageContentProps {
  weddingId: string;
  weddingDate?: string;
}

export function TasksPageContent({ weddingId, weddingDate }: TasksPageContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithVendor | null>(null);

  const { tasks, isLoading } = useTasks({ weddingId });

  const handleAddTask = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task: TaskWithVendor) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = (task: TaskWithVendor) => {
    // Will be implemented in Phase 7 with DeleteTaskDialog
    console.log('Delete task:', task.id);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage pre and post-wedding tasks
          </p>
        </div>
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban View */}
      {isLoading ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          <p className="mb-4">No tasks yet. Create your first task to get started.</p>
          <Button variant="outline" onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Task
          </Button>
        </div>
      ) : (
        <TaskKanbanView
          tasks={tasks}
          weddingId={weddingId}
          weddingDate={weddingDate}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        weddingId={weddingId}
        weddingDate={weddingDate}
      />
    </div>
  );
}
