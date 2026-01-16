/**
 * KanbanColumn Component
 * @feature 015-task-management-kanban
 * @task T017
 *
 * Droppable column for Kanban board
 */

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { TaskDisplayStatus, TaskWithVendor } from '@/types/task';
import { STATUS_COLORS } from '@/lib/taskUtils';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: TaskDisplayStatus;
  title: string;
  tasks: TaskWithVendor[];
  allowDrop: boolean;
  weddingId?: string;
  weddingDate?: string;
  onEditTask?: (task: TaskWithVendor) => void;
  onDeleteTask?: (task: TaskWithVendor) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  allowDrop,
  weddingId,
  weddingDate,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !allowDrop,
  });

  const config = STATUS_COLORS[id];
  const count = tasks.length;

  return (
    <div
      className={cn(
        'flex flex-col min-h-[500px] rounded-lg',
        'bg-gray-50 border',
        isOver && allowDrop && 'ring-2 ring-blue-400 ring-offset-2',
        id === 'overdue' && 'bg-red-50/50 border-red-200'
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-t-lg border-b',
          id === 'overdue' ? 'bg-red-100 border-red-200' : 'bg-gray-100'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              config.bg.replace('bg-', 'bg-').replace('-100', '-500')
            )}
          />
          <h3 className="font-medium text-sm text-gray-700">{title}</h3>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full',
            id === 'overdue' ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-600'
          )}
        >
          {count}
        </span>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 overflow-y-auto',
          'min-h-[100px]'
        )}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-sm text-gray-400">
            {allowDrop ? 'Drop tasks here' : 'No tasks'}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              weddingId={weddingId}
              weddingDate={weddingDate}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
