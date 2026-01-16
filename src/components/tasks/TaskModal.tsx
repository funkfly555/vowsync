/**
 * TaskModal Component
 * @feature 015-task-management-kanban
 * @task T011
 *
 * Dialog wrapper for creating and editing tasks
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import {
  TaskFormData,
  TaskWithVendor,
  DEFAULT_TASK_FORM,
} from '@/types/task';
import { taskFormSchema, taskDbSchema } from '@/schemas/task';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useVendorsForDropdown } from '@/hooks/useTasks';
import { TaskForm } from './TaskForm';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task: TaskWithVendor | null;
  weddingId: string;
  weddingDate?: string;
}

/**
 * Transform TaskWithVendor to form data for editing
 */
function taskToFormData(task: TaskWithVendor): TaskFormData {
  return {
    task_type: task.task_type,
    title: task.title,
    description: task.description || '',
    due_date: task.due_date,
    due_time: task.due_time || '',
    priority: task.priority,
    assigned_to: task.assigned_to || '',
    vendor_id: task.vendor_id || '',
    location: task.location || '',
    address: task.address || '',
    contact_person: task.contact_person || '',
    contact_phone: task.contact_phone || '',
    contact_email: task.contact_email || '',
    notes: task.notes || '',
    reminder_date: task.reminder_date || '',
  };
}

export function TaskModal({
  open,
  onClose,
  task,
  weddingId,
  weddingDate,
}: TaskModalProps) {
  const isEditMode = !!task;
  const { createTask, updateTask } = useTaskMutations({ weddingId, weddingDate });
  const { vendors } = useVendorsForDropdown(weddingId);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: DEFAULT_TASK_FORM,
  });

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset(taskToFormData(task));
      } else {
        form.reset(DEFAULT_TASK_FORM);
      }
    }
  }, [open, task, form]);

  const handleSubmit = async (data: TaskFormData) => {
    // Transform form data to database format
    const dbData = taskDbSchema.parse(data);

    if (isEditMode && task) {
      await updateTask.mutateAsync({ id: task.id, ...dbData });
    } else {
      await createTask.mutateAsync(dbData);
    }
    onClose();
  };

  const isSubmitting = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Task' : 'Add Task'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <TaskForm
              form={form}
              vendors={vendors}
              weddingDate={weddingDate}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
