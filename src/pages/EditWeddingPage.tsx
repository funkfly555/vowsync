import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WeddingForm } from '@/components/weddings/WeddingForm';
import { DeleteWeddingDialog } from '@/components/weddings/DeleteWeddingDialog';
import { useWedding, useUpdateWedding, useDeleteWedding } from '@/hooks/useWeddings';
import { useState, useEffect } from 'react';
import type { WeddingEditValues } from '@/schemas/wedding';

export function EditWeddingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: wedding, isLoading, isError } = useWedding(id || '');
  const updateMutation = useUpdateWedding();
  const deleteMutation = useDeleteWedding();

  // Handle 404 - wedding not found
  useEffect(() => {
    if (isError) {
      toast.error('Wedding not found');
      navigate('/');
    }
  }, [isError, navigate]);

  const handleSubmit = async (data: WeddingEditValues) => {
    if (!id) return;

    try {
      await updateMutation.mutateAsync({ id, data });
      toast.success('Wedding updated successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to update wedding. Please try again.');
      throw error; // Re-throw to keep form data preserved
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Wedding deleted successfully');
      navigate('/');
    } catch {
      toast.error('Failed to delete wedding. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Weddings
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // Error state (handled by useEffect redirect, but show nothing while redirecting)
  if (isError || !wedding) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Weddings
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Edit Wedding
              </h1>
              <p className="mt-1 text-muted-foreground">
                {wedding.bride_name} & {wedding.groom_name}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Wedding
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border bg-card p-6">
          <WeddingForm
            mode="edit"
            defaultValues={wedding}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
          />
        </div>

        {/* Delete Dialog */}
        <DeleteWeddingDialog
          wedding={wedding}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
