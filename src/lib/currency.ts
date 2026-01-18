/**
 * Currency Configuration and Formatting Utilities
 * @feature 020-dashboard-settings-fix
 */

import type { CurrencyCode } from '@/types/settings';

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

/**
 * Supported currencies with their configuration
 */
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  ZAR: { code: 'ZAR', symbol: 'R', locale: 'en-ZA', name: 'South African Rand' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
} as const;

/**
 * Currency options for Select component
 */
export const CURRENCY_OPTIONS = Object.entries(CURRENCIES).map(([code, config]) => ({
  value: code as CurrencyCode,
  label: `${config.symbol} - ${config.name}`,
}));

/**
 * Timezone option for Select component
 */
export interface TimezoneOption {
  value: string;
  label: string;
}

/**
 * Curated list of common timezones
 */
export const TIMEZONES: TimezoneOption[] = [
  { value: 'Africa/Johannesburg', label: 'South Africa (SAST)' },
  { value: 'Europe/London', label: 'United Kingdom (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET/CEST)' },
  { value: 'America/New_York', label: 'Eastern US (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Pacific US (PST/PDT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
] as const;

/**
 * Format a number as currency using the specified currency code
 * @param amount - The amount to format
 * @param currencyCode - The currency code (defaults to ZAR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'ZAR'): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.ZAR;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get the currency symbol for a currency code
 * @param currencyCode - The currency code
 * @returns The currency symbol
 */
export function getCurrencySymbol(currencyCode: CurrencyCode = 'ZAR'): string {
  return CURRENCIES[currencyCode]?.symbol ?? CURRENCIES.ZAR.symbol;
}
