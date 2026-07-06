import { TIMEZONE, MIN_SKILL_LEVEL_FOR_OPERATION, MIN_DOCUMENT_APPROVERS } from './constants';
import type { SkillLevel, ApiResponse } from './constants';

/**
 * Format a Date to Vietnam timezone string.
 */
export function formatDateVN(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  };
  return date.toLocaleString('vi-VN', { ...defaultOptions, ...options });
}

/**
 * Format a Date to date-only string in Vietnam timezone.
 */
export function formatDateOnlyVN(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIMEZONE,
  });
}

/**
 * Check if an employee skill level qualifies them to operate a machine.
 */
export function canOperateMachine(skillLevel: SkillLevel): boolean {
  return skillLevel >= MIN_SKILL_LEVEL_FOR_OPERATION;
}

/**
 * Check if a document has enough approvers.
 */
export function hasEnoughApprovers(approverCount: number): boolean {
  return approverCount >= MIN_DOCUMENT_APPROVERS;
}

/**
 * Create a success API response.
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return { data, error: null, meta };
}

/**
 * Create an error API response.
 */
export function createErrorResponse<T = never>(error: string): ApiResponse<T> {
  return { data: null, error };
}

/**
 * Create a paginated API response.
 */
export function createPaginatedResponse<T>(
  data: T,
  page: number,
  pageSize: number,
  total: number
): ApiResponse<T> {
  return {
    data,
    error: null,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Generate a UUID v4 string.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Calculate the number of days between two dates.
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Check if a date is in the past.
 */
export function isOverdue(dueDate: Date, now: Date = new Date()): boolean {
  return dueDate.getTime() < now.getTime();
}

/**
 * Calculate the number of working hours between two dates.
 * Assumes 8-hour work days, excludes weekends.
 */
export function workingHoursBetween(start: Date, end: Date): number {
  if (end <= start) return 0;

  let hours = 0;
  const current = new Date(start);
  const msPerHour = 60 * 60 * 1000;

  while (current < end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dayEnd = new Date(current);
      dayEnd.setHours(current.getHours() + 1);
      if (dayEnd <= end) {
        hours += 1;
      } else {
        hours += (end.getTime() - current.getTime()) / msPerHour;
      }
    }
    current.setTime(current.getTime() + msPerHour);
  }

  return Math.round(hours * 100) / 100;
}

/**
 * Slugify a string for use in URLs or codes.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Truncate a string to a maximum length, adding ellipsis if needed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Parse a numeric value safely, returning a default if invalid.
 */
export function safeParseNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

/**
 * Group an array of items by a key extractor function.
 */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

/**
 * Sum an array of numbers extracted from items.
 */
export function sumBy<T>(items: T[], valueFn: (item: T) => number): number {
  return items.reduce((sum, item) => sum + valueFn(item), 0);
}

/**
 * Calculate the average of an array of numbers extracted from items.
 */
export function averageBy<T>(items: T[], valueFn: (item: T) => number): number {
  if (items.length === 0) return 0;
  return sumBy(items, valueFn) / items.length;
}
