import { describe, it, expect } from 'vitest';
import {
  isValidEnum,
  isValidRole,
  isValidRootCauseCategory,
  isValidProductionOrderStatus,
  isValidMaintenancePriority,
  isValidIncidentSeverity,
  isValidIncidentType,
  isValidCAPAStatus,
  isValidPTWStatus,
  isValidDocumentStatus,
  isValidNCRStatus,
  isValidAttendanceStatus,
  isValidSkillLevel,
  isValidShiftType,
  isValidModule,
  validateRiskValues,
  validateProductionOrderClose,
  validateDocumentApprovers,
  validateProductionStart,
  validatePTWForWork,
  validateOperatorSkill,
  validateDateRange,
  validateNonNegative,
  validateNonEmpty,
  validateEmail,
} from '../src/validators';

describe('Validators', () => {
  describe('isValidEnum', () => {
    it('should return true for valid enum values', () => {
      expect(isValidEnum('A', ['A', 'B', 'C'])).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isValidEnum('D', ['A', 'B', 'C'])).toBe(false);
    });

    it('should handle numeric enums', () => {
      expect(isValidEnum(1, [0, 1, 2])).toBe(true);
      expect(isValidEnum(5, [0, 1, 2])).toBe(false);
    });
  });

  describe('Role validators', () => {
    it('should validate roles', () => {
      expect(isValidRole('SUPER_ADMIN')).toBe(true);
      expect(isValidRole('OPERATOR')).toBe(true);
      expect(isValidRole('INVALID')).toBe(false);
    });
  });

  describe('Root cause category validators', () => {
    it('should validate 4M categories', () => {
      expect(isValidRootCauseCategory('Man')).toBe(true);
      expect(isValidRootCauseCategory('Machine')).toBe(true);
      expect(isValidRootCauseCategory('Material')).toBe(true);
      expect(isValidRootCauseCategory('Method')).toBe(true);
      expect(isValidRootCauseCategory('Money')).toBe(false);
    });
  });

  describe('Status validators', () => {
    it('should validate production order statuses', () => {
      expect(isValidProductionOrderStatus('PLANNED')).toBe(true);
      expect(isValidProductionOrderStatus('INVALID')).toBe(false);
    });

    it('should validate maintenance priorities', () => {
      expect(isValidMaintenancePriority('CRITICAL')).toBe(true);
      expect(isValidMaintenancePriority('URGENT')).toBe(false);
    });

    it('should validate incident severities', () => {
      expect(isValidIncidentSeverity('FATAL')).toBe(true);
      expect(isValidIncidentSeverity('EXTREME')).toBe(false);
    });

    it('should validate incident types', () => {
      expect(isValidIncidentType('NEAR_MISS')).toBe(true);
      expect(isValidIncidentType('EXPLOSION')).toBe(false);
    });

    it('should validate CAPA statuses', () => {
      expect(isValidCAPAStatus('OVERDUE')).toBe(true);
      expect(isValidCAPAStatus('CANCELLED')).toBe(false);
    });

    it('should validate PTW statuses', () => {
      expect(isValidPTWStatus('APPROVED')).toBe(true);
      expect(isValidPTWStatus('EXPIRED')).toBe(false);
    });

    it('should validate document statuses', () => {
      expect(isValidDocumentStatus('ACTIVE')).toBe(true);
      expect(isValidDocumentStatus('ARCHIVED')).toBe(false);
    });

    it('should validate NCR statuses', () => {
      expect(isValidNCRStatus('INVESTIGATION')).toBe(true);
      expect(isValidNCRStatus('PENDING')).toBe(false);
    });

    it('should validate attendance statuses', () => {
      expect(isValidAttendanceStatus('PRESENT')).toBe(true);
      expect(isValidAttendanceStatus('SICK')).toBe(false);
    });

    it('should validate skill levels', () => {
      expect(isValidSkillLevel(0)).toBe(true);
      expect(isValidSkillLevel(4)).toBe(true);
      expect(isValidSkillLevel(5)).toBe(false);
      expect(isValidSkillLevel(-1)).toBe(false);
    });

    it('should validate shift types', () => {
      expect(isValidShiftType('MORNING')).toBe(true);
      expect(isValidShiftType('GRAVEYARD')).toBe(false);
    });

    it('should validate modules', () => {
      expect(isValidModule('MES')).toBe(true);
      expect(isValidModule('ERP')).toBe(false);
    });
  });

  describe('validateRiskValues', () => {
    it('should pass for valid values', () => {
      const result = validateRiskValues(3, 4);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for likelihood out of range', () => {
      const result = validateRiskValues(0, 3);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should fail for severity out of range', () => {
      const result = validateRiskValues(3, 6);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should fail for both out of range', () => {
      const result = validateRiskValues(0, 6);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it('should fail for non-integer values', () => {
      const result = validateRiskValues(2.5, 3);
      expect(result.valid).toBe(false);
    });

    it('should accept boundary values', () => {
      expect(validateRiskValues(1, 1).valid).toBe(true);
      expect(validateRiskValues(5, 5).valid).toBe(true);
    });
  });

  describe('validateProductionOrderClose', () => {
    it('should pass when no open defects', () => {
      const result = validateProductionOrderClose(false);
      expect(result.valid).toBe(true);
    });

    it('should fail when open defects exist', () => {
      const result = validateProductionOrderClose(true);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('quality defects');
    });
  });

  describe('validateDocumentApprovers', () => {
    it('should pass with 2 or more approvers', () => {
      expect(validateDocumentApprovers(2).valid).toBe(true);
      expect(validateDocumentApprovers(5).valid).toBe(true);
    });

    it('should fail with less than 2 approvers', () => {
      expect(validateDocumentApprovers(0).valid).toBe(false);
      expect(validateDocumentApprovers(1).valid).toBe(false);
    });

    it('should include counts in error message', () => {
      const result = validateDocumentApprovers(1);
      expect(result.errors[0]).toContain('2');
      expect(result.errors[0]).toContain('1');
    });
  });

  describe('validateProductionStart', () => {
    it('should pass when no critical maintenance order', () => {
      const result = validateProductionStart(false);
      expect(result.valid).toBe(true);
    });

    it('should fail when critical maintenance order exists', () => {
      const result = validateProductionStart(true);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('critical');
    });
  });

  describe('validatePTWForWork', () => {
    it('should pass for APPROVED status', () => {
      expect(validatePTWForWork('APPROVED').valid).toBe(true);
    });

    it('should pass for ACTIVE status', () => {
      expect(validatePTWForWork('ACTIVE').valid).toBe(true);
    });

    it('should fail for DRAFT status', () => {
      const result = validatePTWForWork('DRAFT');
      expect(result.valid).toBe(false);
    });

    it('should fail for PENDING_APPROVAL status', () => {
      const result = validatePTWForWork('PENDING_APPROVAL');
      expect(result.valid).toBe(false);
    });

    it('should fail for REJECTED status', () => {
      const result = validatePTWForWork('REJECTED');
      expect(result.valid).toBe(false);
    });

    it('should fail when no PTW exists', () => {
      const result = validatePTWForWork(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('required');
    });
  });

  describe('validateOperatorSkill', () => {
    it('should pass for skill level 2 or higher', () => {
      expect(validateOperatorSkill(2).valid).toBe(true);
      expect(validateOperatorSkill(3).valid).toBe(true);
      expect(validateOperatorSkill(4).valid).toBe(true);
    });

    it('should fail for skill level below 2', () => {
      expect(validateOperatorSkill(0).valid).toBe(false);
      expect(validateOperatorSkill(1).valid).toBe(false);
    });

    it('should fail for null skill level', () => {
      const result = validateOperatorSkill(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('no skill record');
    });
  });

  describe('validateDateRange', () => {
    it('should pass when start is before end', () => {
      const result = validateDateRange(
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
      expect(result.valid).toBe(true);
    });

    it('should fail when start equals end', () => {
      const date = new Date('2024-06-15');
      const result = validateDateRange(date, date);
      expect(result.valid).toBe(false);
    });

    it('should fail when start is after end', () => {
      const result = validateDateRange(
        new Date('2024-12-31'),
        new Date('2024-01-01')
      );
      expect(result.valid).toBe(false);
    });
  });

  describe('validateNonNegative', () => {
    it('should pass for zero', () => {
      expect(validateNonNegative(0, 'quantity').valid).toBe(true);
    });

    it('should pass for positive values', () => {
      expect(validateNonNegative(42, 'quantity').valid).toBe(true);
    });

    it('should fail for negative values', () => {
      const result = validateNonNegative(-1, 'quantity');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('quantity');
    });

    it('should fail for NaN', () => {
      const result = validateNonNegative(NaN, 'cost');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('cost');
    });
  });

  describe('validateNonEmpty', () => {
    it('should pass for non-empty string', () => {
      expect(validateNonEmpty('hello', 'name').valid).toBe(true);
    });

    it('should fail for empty string', () => {
      const result = validateNonEmpty('', 'title');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('title');
    });

    it('should fail for whitespace-only string', () => {
      const result = validateNonEmpty('   ', 'description');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should pass for valid emails', () => {
      expect(validateEmail('user@example.com').valid).toBe(true);
      expect(validateEmail('test.name@company.org').valid).toBe(true);
    });

    it('should fail for invalid emails', () => {
      expect(validateEmail('invalid').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
      expect(validateEmail('user@').valid).toBe(false);
      expect(validateEmail('user @example.com').valid).toBe(false);
    });
  });
});
