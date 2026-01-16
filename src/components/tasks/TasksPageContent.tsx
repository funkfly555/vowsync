/**
 * TasksPageContent Component
 * @feature 015-task-management-kanban
 * @task T012, T019, T022
 *
 * Main page content with header, filters, and Kanban/List views
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { TaskModal } from './TaskModal';
import { TaskKanbanView } from './TaskKanbanView';
import { TaskListView } from './TaskListView';
import { TaskFilters } from './TaskFilters';
import { TaskWithVendor, TaskFilters as TaskFiltersType } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';

interface TasksPageContentProps {
  weddingId: string;
  weddingDate?: string;
}

type ViewMode = 'kanban' | 'list';

export function TasksPageContent({ weddingId, weddingDate }: TasksPageContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithVendor | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filters, setFilters] = useState<TaskFiltersType>({
    search: '',
    status: undefined,
    priority: undefined,
    task_type: undefined,
    assigned_to: undefined,
  });

  const { tasks, isLoading } = useTasks({ weddingId });

  // Get unique assignees for filter dropdown
  const assignees = useMemo(() => {
    return tasks
      .map((t) => t.assigned_to)
      .filter((a): a is string => Boolean(a));
  }, [tasks]);

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

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          assignees={assignees}
        />

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
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
      ) : viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={tasks}
          weddingId={weddingId}
          weddingDate={weddingDate}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      ) : (
        <TaskListView
          tasks={tasks}
          filters={filters}
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
