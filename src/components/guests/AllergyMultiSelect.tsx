/**
 * AllergyMultiSelect - Multi-select dropdown for allergies
 * Uses Popover + Checkbox + Badge pattern
 * @feature 033-guest-page-tweaks
 */

import { useState } from 'react';
import { X, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ALLERGY_OPTIONS } from '@/types/guest';

interface AllergyMultiSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Parse the comma-separated allergy string into structured data
 * Handles "Other: custom text" format
 */
function parseAllergyValue(value: string): { selected: string[]; otherText: string } {
  if (!value) return { selected: [], otherText: '' };

  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
  const selected: string[] = [];
  let otherText = '';

  for (const part of parts) {
    if (part.startsWith('Other:')) {
      selected.push('Other');
      otherText = part.replace('Other:', '').trim();
    } else if (ALLERGY_OPTIONS.includes(part as (typeof ALLERGY_OPTIONS)[number])) {
      selected.push(part);
    }
  }

  return { selected, otherText };
}

/**
 * Serialize selected allergies back to a comma-separated string
 */
function serializeAllergyValue(selected: string[], otherText: string): string {
  const parts = selected.filter((s) => s !== 'Other');
  if (selected.includes('Other')) {
    parts.push(otherText ? `Other: ${otherText}` : 'Other');
  }
  return parts.join(', ');
}

export function AllergyMultiSelect({ value, onChange, disabled }: AllergyMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const { selected, otherText } = parseAllergyValue(value);
  const [localOtherText, setLocalOtherText] = useState(otherText);

  const handleToggle = (option: string) => {
    let newSelected: string[];

    if (option === 'No known allergies') {
      // Selecting "No known allergies" clears everything else
      newSelected = selected.includes(option) ? [] : ['No known allergies'];
      onChange(serializeAllergyValue(newSelected, ''));
      setLocalOtherText('');
      return;
    }

    // Selecting any other option removes "No known allergies"
    const filtered = selected.filter((s) => s !== 'No known allergies');

    if (filtered.includes(option)) {
      newSelected = filtered.filter((s) => s !== option);
      if (option === 'Other') {
        setLocalOtherText('');
        onChange(serializeAllergyValue(newSelected, ''));
        return;
      }
    } else {
      newSelected = [...filtered, option];
    }

    onChange(serializeAllergyValue(newSelected, option === 'Other' ? localOtherText : localOtherText));
  };

  const handleOtherTextChange = (text: string) => {
    setLocalOtherText(text);
    onChange(serializeAllergyValue(selected, text));
  };

  const handleRemove = (option: string) => {
    const newSelected = selected.filter((s) => s !== option);
    if (option === 'Other') {
      setLocalOtherText('');
      onChange(serializeAllergyValue(newSelected, ''));
    } else {
      onChange(serializeAllergyValue(newSelected, localOtherText));
    }
  };

  const displayCount = selected.length;
  const displayLabel = displayCount === 0
    ? 'Select allergies...'
    : `${displayCount} allerg${displayCount === 1 ? 'y' : 'ies'} selected`;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
            type="button"
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="max-h-[250px] overflow-y-auto p-2 space-y-1">
            {ALLERGY_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          {/* Other text input */}
          {selected.includes('Other') && (
            <div className="border-t p-2">
              <Input
                placeholder="Specify other allergy..."
                value={localOtherText}
                onChange={(e) => handleOtherTextChange(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <Badge
              key={option}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {option === 'Other' && localOtherText
                ? `Other: ${localOtherText}`
                : option}
              {!disabled && (
                <button
                  type="button"
                  className="ml-0.5 rounded-full hover:bg-gray-300 p-0.5"
                  onClick={() => handleRemove(option)}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
