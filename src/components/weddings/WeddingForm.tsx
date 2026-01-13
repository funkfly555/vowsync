import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from './form/FormField';
import { weddingFormSchema, weddingEditSchema } from '@/schemas/wedding';
import { WEDDING_STATUS_OPTIONS, EVENTS_OPTIONS } from '@/lib/constants';
import type { WeddingFormValues, WeddingEditValues } from '@/schemas/wedding';
import type { Wedding } from '@/types/wedding';

type FormMode = 'create' | 'edit';

interface WeddingFormProps {
  mode: FormMode;
  defaultValues?: Wedding;
  onSubmit: (data: WeddingFormValues | WeddingEditValues) => Promise<void>;
  isSubmitting: boolean;
}

export function WeddingForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
}: WeddingFormProps) {
  const schema = mode === 'create' ? weddingFormSchema : weddingEditSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WeddingFormValues | WeddingEditValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          bride_name: defaultValues.bride_name,
          groom_name: defaultValues.groom_name,
          wedding_date: new Date(defaultValues.wedding_date),
          venue_name: defaultValues.venue_name,
          venue_address: defaultValues.venue_address || '',
          venue_contact_name: defaultValues.venue_contact_name || '',
          venue_contact_phone: defaultValues.venue_contact_phone || '',
          venue_contact_email: defaultValues.venue_contact_email || '',
          number_of_events: defaultValues.number_of_events,
          status: defaultValues.status,
          notes: defaultValues.notes || '',
        }
      : {
          bride_name: '',
          groom_name: '',
          wedding_date: undefined,
          venue_name: '',
          venue_address: '',
          venue_contact_name: '',
          venue_contact_phone: '',
          venue_contact_email: '',
          number_of_events: 1,
          status: 'planning',
          notes: '',
        },
  });

  const status = watch('status');
  const numberOfEvents = watch('number_of_events');

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Couple Information */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Couple Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Bride Name"
            htmlFor="bride_name"
            error={errors.bride_name?.message}
            required
          >
            <Input
              id="bride_name"
              {...register('bride_name')}
              placeholder="Enter bride's name"
              aria-invalid={!!errors.bride_name}
            />
          </FormField>

          <FormField
            label="Groom Name"
            htmlFor="groom_name"
            error={errors.groom_name?.message}
            required
          >
            <Input
              id="groom_name"
              {...register('groom_name')}
              placeholder="Enter groom's name"
              aria-invalid={!!errors.groom_name}
            />
          </FormField>
        </div>
      </div>

      {/* Wedding Details */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Wedding Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Wedding Date"
            htmlFor="wedding_date"
            error={errors.wedding_date?.message}
            required
          >
            <Input
              id="wedding_date"
              type="date"
              {...register('wedding_date', {
                setValueAs: (v) => (v ? new Date(v) : undefined),
              })}
              defaultValue={
                defaultValues
                  ? defaultValues.wedding_date
                  : undefined
              }
              aria-invalid={!!errors.wedding_date}
            />
          </FormField>

          <FormField
            label="Number of Events"
            htmlFor="number_of_events"
            error={errors.number_of_events?.message}
            required
          >
            <Select
              value={numberOfEvents?.toString()}
              onValueChange={(value) =>
                setValue('number_of_events', parseInt(value, 10))
              }
            >
              <SelectTrigger id="number_of_events" aria-invalid={!!errors.number_of_events}>
                <SelectValue placeholder="Select number of events" />
              </SelectTrigger>
              <SelectContent>
                {EVENTS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Status"
            htmlFor="status"
            error={errors.status?.message}
            required
          >
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as typeof status)}
            >
              <SelectTrigger id="status" aria-invalid={!!errors.status}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {WEDDING_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Venue Information */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Venue Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Venue Name"
            htmlFor="venue_name"
            error={errors.venue_name?.message}
            required
            className="sm:col-span-2"
          >
            <Input
              id="venue_name"
              {...register('venue_name')}
              placeholder="Enter venue name"
              aria-invalid={!!errors.venue_name}
            />
          </FormField>

          <FormField
            label="Venue Address"
            htmlFor="venue_address"
            error={errors.venue_address?.message}
            className="sm:col-span-2"
          >
            <Textarea
              id="venue_address"
              {...register('venue_address')}
              placeholder="Enter venue address"
              rows={2}
            />
          </FormField>

          <FormField
            label="Contact Name"
            htmlFor="venue_contact_name"
            error={errors.venue_contact_name?.message}
          >
            <Input
              id="venue_contact_name"
              {...register('venue_contact_name')}
              placeholder="Enter contact name"
            />
          </FormField>

          <FormField
            label="Contact Phone"
            htmlFor="venue_contact_phone"
            error={errors.venue_contact_phone?.message}
          >
            <Input
              id="venue_contact_phone"
              type="tel"
              {...register('venue_contact_phone')}
              placeholder="Enter phone number"
            />
          </FormField>

          <FormField
            label="Contact Email"
            htmlFor="venue_contact_email"
            error={errors.venue_contact_email?.message}
            className="sm:col-span-2"
          >
            <Input
              id="venue_contact_email"
              type="email"
              {...register('venue_contact_email')}
              placeholder="Enter email address"
            />
          </FormField>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Notes</h2>
        <FormField
          label="Notes"
          htmlFor="notes"
          error={errors.notes?.message}
        >
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Add any additional notes about this wedding..."
            rows={4}
          />
        </FormField>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link to="/">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
            ? 'Create Wedding'
            : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
