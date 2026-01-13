import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WeddingForm } from '@/components/weddings/WeddingForm';
import { useCreateWedding } from '@/hooks/useWeddings';
import type { WeddingFormValues } from '@/schemas/wedding';

export function CreateWeddingPage() {
  const navigate = useNavigate();
  const createMutation = useCreateWedding();

  const handleSubmit = async (data: WeddingFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Wedding created successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create wedding. Please try again.');
      throw error; // Re-throw to keep form data preserved
    }
  };

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
          <h1 className="font-display text-3xl font-bold text-foreground">
            Create New Wedding
          </h1>
          <p className="mt-1 text-muted-foreground">
            Add a new wedding to your portfolio
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg border bg-card p-6">
          <WeddingForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
