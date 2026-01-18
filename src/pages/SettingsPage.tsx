/**
 * Settings page for user preferences
 * @feature 020-dashboard-settings-fix
 */

import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { CURRENCIES, TIMEZONES } from '@/lib/currency';
import type { CurrencyCode } from '@/types/settings';

const settingsSchema = z.object({
  currency: z.enum(['ZAR', 'USD', 'EUR', 'GBP'] as const),
  timezone: z.string().min(1, 'Timezone is required'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const navigate = useNavigate();
  const { preferences, isLoading, updatePreferences } = useUserPreferences();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: {
      currency: preferences.currency || 'ZAR',
      timezone: preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updatePreferences.mutateAsync(data);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Settings save error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="settings-page">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-xl text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h2 className="font-medium text-lg text-gray-900">Display Preferences</h2>

            {/* Currency Selection */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={form.watch('currency')}
                onValueChange={(value: CurrencyCode) => form.setValue('currency', value, { shouldDirty: true })}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, config]) => (
                    <SelectItem key={code} value={code}>
                      {config.symbol} {config.name} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                This will be used to display all monetary values across the app.
              </p>
            </div>

            {/* Timezone Selection */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={form.watch('timezone')}
                onValueChange={(value: string) => form.setValue('timezone', value, { shouldDirty: true })}
              >
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                This will be used to display all dates and times across the app.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updatePreferences.isPending || !form.formState.isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              {updatePreferences.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
