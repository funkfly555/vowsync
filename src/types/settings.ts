/**
 * User Settings Types
 * @feature 020-dashboard-settings-fix
 */

/**
 * Supported currency codes
 */
export type CurrencyCode = 'ZAR' | 'USD' | 'EUR' | 'GBP';

/**
 * User preferences stored in users.preferences JSONB column
 */
export interface UserPreferences {
  currency?: CurrencyCode;
  timezone?: string; // IANA timezone string
}

/**
 * User settings including preferences
 */
export interface UserSettings {
  id: string;
  email: string;
  preferences: UserPreferences;
}

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES: Required<UserPreferences> = {
  currency: 'ZAR',
  timezone: typeof window !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'Africa/Johannesburg',
};
