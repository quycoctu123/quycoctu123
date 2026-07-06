import { describe, it, expect } from 'vitest';
import {
  ROLES,
  ROOT_CAUSE_CATEGORIES,
  PRODUCTION_ORDER_STATUSES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_ORDER_STATUSES,
  ASSET_CRITICALITIES,
  INCIDENT_SEVERITIES,
  INCIDENT_TYPES,
  CAPA_STATUSES,
  PTW_STATUSES,
  DOCUMENT_STATUSES,
  NCR_STATUSES,
  ATTENDANCE_STATUSES,
  SKILL_LEVELS,
  SHIFTS,
  MODULES,
  MIN_SKILL_LEVEL_FOR_OPERATION,
  MIN_DOCUMENT_APPROVERS,
  RISK_MATRIX_SIZE,
  TIMEZONE,
} from '../src/constants';

describe('Constants', () => {
  describe('ROLES', () => {
    it('should contain all 6 roles', () => {
      expect(ROLES).toHaveLength(6);
    });

    it('should include all required roles', () => {
      expect(ROLES).toContain('SUPER_ADMIN');
      expect(ROLES).toContain('PLANT_MANAGER');
      expect(ROLES).toContain('MODULE_MANAGER');
      expect(ROLES).toContain('SUPERVISOR');
      expect(ROLES).toContain('OPERATOR');
      expect(ROLES).toContain('VIEWER');
    });

    it('should be a typed tuple (as const)', () => {
      // `as const` makes it readonly at the type level
      const roles: readonly string[] = ROLES;
      expect(Array.isArray(roles)).toBe(true);
    });
  });

  describe('ROOT_CAUSE_CATEGORIES (4M)', () => {
    it('should contain exactly 4 categories', () => {
      expect(ROOT_CAUSE_CATEGORIES).toHaveLength(4);
    });

    it('should follow 4M classification', () => {
      expect(ROOT_CAUSE_CATEGORIES).toEqual(['Man', 'Machine', 'Material', 'Method']);
    });
  });

  describe('PRODUCTION_ORDER_STATUSES', () => {
    it('should have correct lifecycle statuses', () => {
      expect(PRODUCTION_ORDER_STATUSES).toEqual([
        'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED',
      ]);
    });
  });

  describe('MAINTENANCE_PRIORITIES', () => {
    it('should have 4 priority levels in order', () => {
      expect(MAINTENANCE_PRIORITIES).toEqual(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
    });
  });

  describe('MAINTENANCE_ORDER_STATUSES', () => {
    it('should include WAITING_PARTS status', () => {
      expect(MAINTENANCE_ORDER_STATUSES).toContain('WAITING_PARTS');
    });
  });

  describe('ASSET_CRITICALITIES', () => {
    it('should have A/B/C levels', () => {
      expect(ASSET_CRITICALITIES).toEqual(['A', 'B', 'C']);
    });
  });

  describe('INCIDENT_SEVERITIES', () => {
    it('should have 5 severity levels', () => {
      expect(INCIDENT_SEVERITIES).toHaveLength(5);
      expect(INCIDENT_SEVERITIES).toContain('FATAL');
    });
  });

  describe('INCIDENT_TYPES', () => {
    it('should include NEAR_MISS', () => {
      expect(INCIDENT_TYPES).toContain('NEAR_MISS');
    });
  });

  describe('CAPA_STATUSES', () => {
    it('should include OVERDUE status', () => {
      expect(CAPA_STATUSES).toContain('OVERDUE');
    });
  });

  describe('PTW_STATUSES', () => {
    it('should have proper approval workflow statuses', () => {
      expect(PTW_STATUSES).toContain('PENDING_APPROVAL');
      expect(PTW_STATUSES).toContain('APPROVED');
      expect(PTW_STATUSES).toContain('REJECTED');
    });
  });

  describe('DOCUMENT_STATUSES', () => {
    it('should have review and approval statuses', () => {
      expect(DOCUMENT_STATUSES).toContain('PENDING_REVIEW');
      expect(DOCUMENT_STATUSES).toContain('PENDING_APPROVAL');
      expect(DOCUMENT_STATUSES).toContain('OBSOLETE');
    });
  });

  describe('NCR_STATUSES', () => {
    it('should have investigation workflow', () => {
      expect(NCR_STATUSES).toContain('INVESTIGATION');
      expect(NCR_STATUSES).toContain('CORRECTIVE_ACTION');
    });
  });

  describe('ATTENDANCE_STATUSES', () => {
    it('should cover all attendance types', () => {
      expect(ATTENDANCE_STATUSES).toEqual([
        'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE',
      ]);
    });
  });

  describe('SKILL_LEVELS', () => {
    it('should have 5 levels (0-4)', () => {
      expect(SKILL_LEVELS).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('SHIFTS', () => {
    it('should have 3 shifts for rotating schedule', () => {
      expect(SHIFTS).toEqual(['MORNING', 'AFTERNOON', 'NIGHT']);
    });
  });

  describe('MODULES', () => {
    it('should have all 5 modules', () => {
      expect(MODULES).toEqual(['MES', 'CMMS', 'HSE', 'HRM', 'ISO']);
    });
  });

  describe('Business rule constants', () => {
    it('MIN_SKILL_LEVEL_FOR_OPERATION should be 2', () => {
      expect(MIN_SKILL_LEVEL_FOR_OPERATION).toBe(2);
    });

    it('MIN_DOCUMENT_APPROVERS should be 2', () => {
      expect(MIN_DOCUMENT_APPROVERS).toBe(2);
    });

    it('RISK_MATRIX_SIZE should be 5', () => {
      expect(RISK_MATRIX_SIZE).toBe(5);
    });

    it('TIMEZONE should be Vietnam', () => {
      expect(TIMEZONE).toBe('Asia/Ho_Chi_Minh');
    });
  });
});
