/**
 * TaskKanbanView Component
 * @feature 015-task-management-kanban
 * @task T018
 *
 * Full Kanban board with drag-and-drop
 */

import { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { TaskWithVendor, TaskStatus, TaskDisplayStatus } from '@/types/task';
import { KANBAN_COLUMNS, groupTasksByStatus, isValidStatusTransition } from '@/lib/taskUtils';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface TaskKanbanViewProps {
  tasks: TaskWithVendor[];
  weddingId: string;
  weddingDate?: string;
  onEditTask?: (task: TaskWithVendor) => void;
  onDeleteTask?: (task: TaskWithVendor) => void;
}

export function TaskKanbanView({
  tasks,
  weddingId,
  weddingDate,
  onEditTask,
  onDeleteTask,
}: TaskKanbanViewProps) {
  const [activeTask, setActiveTask] = useState<TaskWithVendor | null>(null);
  const { updateTaskStatus } = useTaskMutations({ weddingId, weddingDate });

  // Configure sensors for mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Group tasks by display status
  const tasksByStatus = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newDisplayStatus = over.id as TaskDisplayStatus;

    // Find the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Don't update if dropped in same column or overdue column
    if (task.display_status === newDisplayStatus || newDisplayStatus === 'overdue') return;

    // Cast to TaskStatus since we've excluded 'overdue'
    const newStatus = newDisplayStatus as TaskStatus;

    // Validate transition
    if (!isValidStatusTransition(task.status, newStatus)) return;

    // Update task status
    updateTaskStatus.mutate({
      id: taskId,
      status: newStatus,
    });
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasksByStatus[column.id]}
            allowDrop={column.allowDrop}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      {/* Drag Overlay - shows the dragged card */}
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
