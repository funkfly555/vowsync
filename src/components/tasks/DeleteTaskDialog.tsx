/**
 * DeleteTaskDialog Component
 * @feature 015-task-management-kanban
 * @task T026
 *
 * Confirmation dialog for task deletion
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TaskWithVendor } from '@/types/task';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface DeleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: TaskWithVendor | null;
  weddingId: string;
  weddingDate?: string;
}

export function DeleteTaskDialog({
  open,
  onClose,
  task,
  weddingId,
  weddingDate,
}: DeleteTaskDialogProps) {
  const { deleteTask } = useTaskMutations({ weddingId, weddingDate });

  const handleDelete = () => {
    if (task) {
      deleteTask.mutate(task.id, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  if (!task) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{task.title}"? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTask.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteTask.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
