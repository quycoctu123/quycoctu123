import { describe, it, expect } from 'vitest';
import {
  formatDateVN,
  formatDateOnlyVN,
  canOperateMachine,
  hasEnoughApprovers,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  generateId,
  daysBetween,
  isOverdue,
  workingHoursBetween,
  slugify,
  truncate,
  safeParseNumber,
  groupBy,
  sumBy,
  averageBy,
} from '../src/utils';

describe('Utils', () => {
  describe('formatDateVN', () => {
    it('should format a date in Vietnam timezone', () => {
      const date = new Date('2024-06-15T08:30:00Z');
      const formatted = formatDateVN(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should accept custom format options', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const formatted = formatDateVN(date, { weekday: 'long' });
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatDateOnlyVN', () => {
    it('should format a date without time', () => {
      const date = new Date('2024-06-15T08:30:00Z');
      const formatted = formatDateOnlyVN(date);
      expect(formatted).toBeTruthy();
      expect(formatted).not.toContain(':'); // no time component
    });
  });

  describe('canOperateMachine', () => {
    it('should return false for skill level 0', () => {
      expect(canOperateMachine(0)).toBe(false);
    });

    it('should return false for skill level 1', () => {
      expect(canOperateMachine(1)).toBe(false);
    });

    it('should return true for skill level 2', () => {
      expect(canOperateMachine(2)).toBe(true);
    });

    it('should return true for skill level 3', () => {
      expect(canOperateMachine(3)).toBe(true);
    });

    it('should return true for skill level 4', () => {
      expect(canOperateMachine(4)).toBe(true);
    });
  });

  describe('hasEnoughApprovers', () => {
    it('should return false for 0 approvers', () => {
      expect(hasEnoughApprovers(0)).toBe(false);
    });

    it('should return false for 1 approver', () => {
      expect(hasEnoughApprovers(1)).toBe(false);
    });

    it('should return true for 2 approvers', () => {
      expect(hasEnoughApprovers(2)).toBe(true);
    });

    it('should return true for more than 2 approvers', () => {
      expect(hasEnoughApprovers(5)).toBe(true);
    });
  });

  describe('createSuccessResponse', () => {
    it('should create a success response', () => {
      const response = createSuccessResponse({ id: '123' });
      expect(response.data).toEqual({ id: '123' });
      expect(response.error).toBeNull();
    });

    it('should include meta if provided', () => {
      const response = createSuccessResponse(
        [1, 2, 3],
        { page: 1, pageSize: 10, total: 3, totalPages: 1 }
      );
      expect(response.meta).toEqual({ page: 1, pageSize: 10, total: 3, totalPages: 1 });
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response', () => {
      const response = createErrorResponse('Something went wrong');
      expect(response.data).toBeNull();
      expect(response.error).toBe('Something went wrong');
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create a paginated response', () => {
      const data = [1, 2, 3];
      const response = createPaginatedResponse(data, 1, 10, 25);
      expect(response.data).toEqual(data);
      expect(response.error).toBeNull();
      expect(response.meta).toEqual({
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should handle exact page divisions', () => {
      const response = createPaginatedResponse([], 1, 10, 30);
      expect(response.meta?.totalPages).toBe(3);
    });

    it('should handle single page', () => {
      const response = createPaginatedResponse([], 1, 50, 5);
      expect(response.meta?.totalPages).toBe(1);
    });

    it('should handle empty results', () => {
      const response = createPaginatedResponse([], 1, 10, 0);
      expect(response.meta?.totalPages).toBe(0);
    });
  });

  describe('generateId', () => {
    it('should return a valid UUID string', () => {
      const id = generateId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-11');
      expect(daysBetween(start, end)).toBe(10);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2024-06-15');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should handle reverse order (absolute value)', () => {
      const start = new Date('2024-01-11');
      const end = new Date('2024-01-01');
      expect(daysBetween(start, end)).toBe(10);
    });
  });

  describe('isOverdue', () => {
    it('should return true when due date is in the past', () => {
      const pastDate = new Date('2020-01-01');
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('should return false when due date is in the future', () => {
      const futureDate = new Date('2099-12-31');
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('should use custom now parameter', () => {
      const dueDate = new Date('2024-06-15');
      const beforeDue = new Date('2024-06-14');
      const afterDue = new Date('2024-06-16');
      expect(isOverdue(dueDate, beforeDue)).toBe(false);
      expect(isOverdue(dueDate, afterDue)).toBe(true);
    });
  });

  describe('workingHoursBetween', () => {
    it('should return 0 when end is before start', () => {
      const start = new Date('2024-06-15T10:00:00Z');
      const end = new Date('2024-06-15T08:00:00Z');
      expect(workingHoursBetween(start, end)).toBe(0);
    });

    it('should return 0 when start equals end', () => {
      const date = new Date('2024-06-15T10:00:00Z');
      expect(workingHoursBetween(date, date)).toBe(0);
    });

    it('should count hours on weekdays', () => {
      // Monday 2024-06-17 08:00 to Monday 2024-06-17 16:00 = 8 hours
      const start = new Date('2024-06-17T08:00:00Z');
      const end = new Date('2024-06-17T16:00:00Z');
      const hours = workingHoursBetween(start, end);
      expect(hours).toBe(8);
    });

    it('should skip weekends', () => {
      // Saturday 2024-06-15 08:00 to Saturday 2024-06-15 16:00 = 0 hours
      const start = new Date('2024-06-15T08:00:00Z');
      const end = new Date('2024-06-15T16:00:00Z');
      const hours = workingHoursBetween(start, end);
      expect(hours).toBe(0);
    });

    it('should handle multi-day spans including weekends', () => {
      // Friday 2024-06-14 08:00 to Monday 2024-06-17 08:00
      // Friday: full day counted, Sat+Sun: skipped
      const start = new Date('2024-06-14T08:00:00Z');
      const end = new Date('2024-06-17T08:00:00Z');
      const hours = workingHoursBetween(start, end);
      // Only Friday hours should count (24 hours on Friday)
      expect(hours).toBeGreaterThan(0);
    });
  });

  describe('slugify', () => {
    it('should slugify basic text', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello, World! (2024)')).toBe('hello-world-2024');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('too   many   spaces')).toBe('too-many-spaces');
    });

    it('should handle underscores', () => {
      expect(slugify('hello_world_test')).toBe('hello-world-test');
    });

    it('should trim whitespace', () => {
      expect(slugify('  hello  ')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(slugify('--hello--')).toBe('hello');
    });
  });

  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings with ellipsis', () => {
      expect(truncate('hello world this is long', 10)).toBe('hello w...');
    });

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
  });

  describe('safeParseNumber', () => {
    it('should return number as-is', () => {
      expect(safeParseNumber(42)).toBe(42);
    });

    it('should parse string to number', () => {
      expect(safeParseNumber('3.14')).toBe(3.14);
    });

    it('should return default for invalid string', () => {
      expect(safeParseNumber('abc')).toBe(0);
    });

    it('should return default for NaN', () => {
      expect(safeParseNumber(NaN)).toBe(0);
    });

    it('should use custom default value', () => {
      expect(safeParseNumber(null, -1)).toBe(-1);
    });

    it('should return default for undefined', () => {
      expect(safeParseNumber(undefined, 99)).toBe(99);
    });

    it('should return default for object', () => {
      expect(safeParseNumber({}, 5)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(safeParseNumber(-42)).toBe(-42);
      expect(safeParseNumber('-42')).toBe(-42);
    });

    it('should handle zero', () => {
      expect(safeParseNumber(0)).toBe(0);
      expect(safeParseNumber('0')).toBe(0);
    });
  });

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 },
      ];
      const grouped = groupBy(items, (i) => i.type);
      expect(grouped['A']).toHaveLength(2);
      expect(grouped['B']).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const grouped = groupBy([], (i: string) => i);
      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it('should group by numeric key', () => {
      const items = [1, 2, 3, 4, 5];
      const grouped = groupBy(items, (n) => (n % 2 === 0 ? 0 : 1));
      expect(grouped[0]).toEqual([2, 4]);
      expect(grouped[1]).toEqual([1, 3, 5]);
    });
  });

  describe('sumBy', () => {
    it('should sum values', () => {
      const items = [{ v: 10 }, { v: 20 }, { v: 30 }];
      expect(sumBy(items, (i) => i.v)).toBe(60);
    });

    it('should return 0 for empty array', () => {
      expect(sumBy([], () => 1)).toBe(0);
    });

    it('should handle negative values', () => {
      const items = [{ v: 10 }, { v: -5 }, { v: 3 }];
      expect(sumBy(items, (i) => i.v)).toBe(8);
    });
  });

  describe('averageBy', () => {
    it('should calculate average', () => {
      const items = [{ v: 10 }, { v: 20 }, { v: 30 }];
      expect(averageBy(items, (i) => i.v)).toBe(20);
    });

    it('should return 0 for empty array', () => {
      expect(averageBy([], () => 1)).toBe(0);
    });

    it('should handle single item', () => {
      expect(averageBy([{ v: 42 }], (i) => i.v)).toBe(42);
    });
  });
});
