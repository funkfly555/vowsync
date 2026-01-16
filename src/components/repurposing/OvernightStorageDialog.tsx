/**
 * OvernightStorageDialog Component
 * @feature 014-repurposing-timeline
 * @task T011
 *
 * Modal dialog that appears when from_event.event_date !== to_event.event_date
 * Prompts for storage location, appends to handling_notes
 */

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Moon } from 'lucide-react';

interface OvernightStorageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromEventName: string;
  fromEventDate: string;
  toEventName: string;
  toEventDate: string;
  onConfirm: (storageLocation: string) => void;
  onCancel: () => void;
}

export function OvernightStorageDialog({
  open,
  onOpenChange,
  fromEventName,
  fromEventDate,
  toEventName,
  toEventDate,
  onConfirm,
  onCancel,
}: OvernightStorageDialogProps) {
  const [storageLocation, setStorageLocation] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!storageLocation.trim()) {
      setError('Please enter a storage location');
      return;
    }
    setError('');
    onConfirm(storageLocation.trim());
    setStorageLocation('');
  };

  const handleCancel = () => {
    setStorageLocation('');
    setError('');
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-blue-500" />
            Overnight Storage Required
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This item will be moved between events on different dates:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>
                <strong>From:</strong> {fromEventName} ({fromEventDate})
              </li>
              <li>
                <strong>To:</strong> {toEventName} ({toEventDate})
              </li>
            </ul>
            <p className="pt-2">
              Please specify where the item will be stored overnight.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="storage-location">Storage Location *</Label>
          <Input
            id="storage-location"
            value={storageLocation}
            onChange={(e) => {
              setStorageLocation(e.target.value);
              setError('');
            }}
            placeholder="e.g., Venue storage room, Hotel loading dock"
            className="mt-2 min-h-[44px]"
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} className="min-h-[44px]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="min-h-[44px]">
            Confirm Storage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
