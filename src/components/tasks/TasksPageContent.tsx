/**
 * TasksPageContent Component
 * @feature 015-task-management-kanban
 * @task T012
 *
 * Main page content with header and task views
 * Phase 3: Minimal version with header and modal trigger
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskModal } from './TaskModal';
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

      {/* Task List Placeholder - will be replaced with Kanban in Phase 4 */}
      <div className="border rounded-lg p-8 text-center text-gray-500">
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div>
            <p className="mb-4">No tasks yet. Create your first task to get started.</p>
            <Button variant="outline" onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Task
            </Button>
          </div>
        ) : (
          <div className="text-left">
            <p className="mb-4 text-center text-gray-500">
              {tasks.length} task{tasks.length === 1 ? '' : 's'} found. Kanban view coming in Phase 4.
            </p>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEditTask(task)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{task.title}</span>
                    <span className="text-sm text-gray-500">{task.due_date}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {task.task_type} • {task.priority} • {task.status}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
