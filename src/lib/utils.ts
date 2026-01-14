import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, differenceInDays, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, formatStr: string = 'MMMM d, yyyy'): string {
  return format(parseISO(dateString), formatStr)
}

/**
 * Get the color for an event based on its order number
 * @param order Event order (1-10)
 * @returns Hex color code
 */
export function getEventColor(order: number): string {
  const colors = [
    '#E8B4B8', '#F5E6D3', '#C9D4C5', '#E5D4EF',
    '#FFE5CC', '#D4E5F7', '#F7D4E5',
  ];
  return colors[(order - 1) % colors.length];
}

/**
 * Calculate duration in hours from start and end time strings
 * @param startTime Start time in HH:mm format
 * @param endTime End time in HH:mm format
 * @returns Duration in hours (decimal)
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return (endMinutes - startMinutes) / 60;
}

/**
 * Format duration hours for display
 * @param hours Duration in hours (can be decimal)
 * @returns Formatted string like "3h 30m" or "2h"
 */
export function formatDuration(hours: number | null): string {
  if (hours === null || hours <= 0) return '0h';

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  if (wholeHours === 0) {
    return `${minutes}m`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format time string for display
 * @param time Time in HH:mm format
 * @returns Formatted time like "2:00 PM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get total guest count for an event
 * @param event Event object with guest counts
 * @returns Combined adult + children count
 */
export function getEventGuestCount(event: {
  expected_guests_adults: number;
  expected_guests_children: number;
}): number {
  return (event.expected_guests_adults || 0) + (event.expected_guests_children || 0);
}

// Dashboard utility functions

/**
 * Calculate days until a given date from today
 * @param dateString ISO date string (YYYY-MM-DD)
 * @returns Number of days until the date (negative if past)
 */
export function calculateDaysUntil(dateString: string): number {
  const targetDate = parseISO(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(targetDate, today);
}

/**
 * Format budget percentage for display
 * @param spent Amount spent
 * @param total Total budget
 * @returns Formatted percentage string or "Not set" if total is 0
 */
export function formatBudgetPercentage(spent: number, total: number): string {
  if (total <= 0) return 'Not set';
  const percentage = Math.round((spent / total) * 100);
  return `${percentage}%`;
}

/**
 * Get relative time string for activity timestamps
 * @param dateString ISO timestamp string
 * @returns Human-readable relative time (e.g., "2 hours ago")
 */
export function getRelativeTimeString(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}
