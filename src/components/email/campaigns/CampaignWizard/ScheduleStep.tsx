/**
 * ScheduleStep - Fourth step in campaign wizard for scheduling
 * @feature 016-email-campaigns
 * @task T028
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, addHours, startOfHour, isBefore } from 'date-fns';
import { ArrowLeft, ArrowRight, Send, Clock, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScheduleType = 'now' | 'later';

interface ScheduleStepProps {
  scheduledAt: string | null;
  onScheduledAtChange: (date: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Schedule step for campaign wizard
 * Allows sending immediately or scheduling for later
 */
export function ScheduleStep({
  scheduledAt,
  onScheduledAtChange,
  onBack,
  onNext,
}: ScheduleStepProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    scheduledAt ? 'later' : 'now'
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    scheduledAt ? new Date(scheduledAt) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    scheduledAt ? format(new Date(scheduledAt), 'HH:mm') : '09:00'
  );

  // Generate time options (hourly)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: format(new Date(2000, 0, 1, i), 'h:mm a') };
  });

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    if (type === 'now') {
      onScheduledAtChange(null);
    } else {
      // Default to tomorrow at 9am
      const tomorrow = addHours(startOfHour(new Date()), 24);
      tomorrow.setHours(9, 0, 0, 0);
      setSelectedDate(tomorrow);
      setSelectedTime('09:00');
      onScheduledAtChange(tomorrow.toISOString());
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      onScheduledAtChange(date.toISOString());
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      onScheduledAtChange(newDate.toISOString());
    }
  };

  // Validate scheduled time is in the future
  const isValidSchedule =
    scheduleType === 'now' ||
    (selectedDate && !isBefore(new Date(scheduledAt!), new Date()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Schedule Delivery</h2>
        <p className="text-sm text-gray-500 mt-1">
          Send now or schedule for later
        </p>
      </div>

      {/* Schedule type selection */}
      <RadioGroup
        value={scheduleType}
        onValueChange={(v) => handleScheduleTypeChange(v as ScheduleType)}
        className="space-y-4"
      >
        {/* Send now option */}
        <Label
          htmlFor="now"
          className={cn(
            'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
            scheduleType === 'now'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <RadioGroupItem value="now" id="now" />
          <Send className="h-5 w-5 text-gray-500" />
          <div>
            <span className="font-medium">Send Immediately</span>
            <p className="text-sm text-gray-500">
              Emails will be sent right after you confirm
            </p>
          </div>
        </Label>

        {/* Schedule for later option */}
        <Label
          htmlFor="later"
          className={cn(
            'flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
            scheduleType === 'later'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <RadioGroupItem value="later" id="later" className="mt-1" />
          <Clock className="h-5 w-5 text-gray-500 mt-1" />
          <div className="flex-1">
            <span className="font-medium">Schedule for Later</span>
            <p className="text-sm text-gray-500 mb-4">
              Choose when to send your campaign
            </p>

            {/* Date and time pickers */}
            {scheduleType === 'later' && (
              <div className="flex flex-wrap gap-4" onClick={(e) => e.preventDefault()}>
                {/* Date picker */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[180px] justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        disabled={(date) => isBefore(date, new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time picker */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Time</Label>
                  <Select value={selectedTime} onValueChange={handleTimeChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </Label>
      </RadioGroup>

      {/* Scheduled time display */}
      {scheduleType === 'later' && scheduledAt && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <Clock className="h-4 w-4 inline mr-2" />
            Campaign will be sent on{' '}
            <strong>{format(new Date(scheduledAt), 'PPP')}</strong> at{' '}
            <strong>{format(new Date(scheduledAt), 'p')}</strong>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValidSchedule}>
          Next: Review
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
