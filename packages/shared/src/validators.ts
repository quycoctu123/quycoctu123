import {
  ROLES,
  ROOT_CAUSE_CATEGORIES,
  PRODUCTION_ORDER_STATUSES,
  MAINTENANCE_PRIORITIES,
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
  RISK_MATRIX_SIZE,
  MIN_DOCUMENT_APPROVERS,
  type Role,
  type RootCauseCategory,
  type ProductionOrderStatus,
  type MaintenancePriority,
  type IncidentSeverity,
  type IncidentType,
  type CAPAStatus,
  type PTWStatus,
  type DocumentStatus,
  type NCRStatus,
  type AttendanceStatus,
  type SkillLevel,
  type ShiftType,
  type Module,
} from './constants';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function success(): ValidationResult {
  return { valid: true, errors: [] };
}

function failure(...errors: string[]): ValidationResult {
  return { valid: false, errors };
}

/**
 * Validate that a value is one of the allowed enum values.
 */
export function isValidEnum<T>(value: unknown, allowed: readonly T[]): value is T {
  return (allowed as readonly unknown[]).includes(value);
}

export function isValidRole(value: unknown): value is Role {
  return isValidEnum(value, ROLES);
}

export function isValidRootCauseCategory(value: unknown): value is RootCauseCategory {
  return isValidEnum(value, ROOT_CAUSE_CATEGORIES);
}

export function isValidProductionOrderStatus(value: unknown): value is ProductionOrderStatus {
  return isValidEnum(value, PRODUCTION_ORDER_STATUSES);
}

export function isValidMaintenancePriority(value: unknown): value is MaintenancePriority {
  return isValidEnum(value, MAINTENANCE_PRIORITIES);
}

export function isValidIncidentSeverity(value: unknown): value is IncidentSeverity {
  return isValidEnum(value, INCIDENT_SEVERITIES);
}

export function isValidIncidentType(value: unknown): value is IncidentType {
  return isValidEnum(value, INCIDENT_TYPES);
}

export function isValidCAPAStatus(value: unknown): value is CAPAStatus {
  return isValidEnum(value, CAPA_STATUSES);
}

export function isValidPTWStatus(value: unknown): value is PTWStatus {
  return isValidEnum(value, PTW_STATUSES);
}

export function isValidDocumentStatus(value: unknown): value is DocumentStatus {
  return isValidEnum(value, DOCUMENT_STATUSES);
}

export function isValidNCRStatus(value: unknown): value is NCRStatus {
  return isValidEnum(value, NCR_STATUSES);
}

export function isValidAttendanceStatus(value: unknown): value is AttendanceStatus {
  return isValidEnum(value, ATTENDANCE_STATUSES);
}

export function isValidSkillLevel(value: unknown): value is SkillLevel {
  return isValidEnum(value, SKILL_LEVELS);
}

export function isValidShiftType(value: unknown): value is ShiftType {
  return isValidEnum(value, SHIFTS);
}

export function isValidModule(value: unknown): value is Module {
  return isValidEnum(value, MODULES);
}

/**
 * Validate risk assessment likelihood and severity values (1-5).
 */
export function validateRiskValues(likelihood: number, severity: number): ValidationResult {
  const errors: string[] = [];
  if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > RISK_MATRIX_SIZE) {
    errors.push(`Likelihood must be an integer between 1 and ${RISK_MATRIX_SIZE}`);
  }
  if (!Number.isInteger(severity) || severity < 1 || severity > RISK_MATRIX_SIZE) {
    errors.push(`Severity must be an integer between 1 and ${RISK_MATRIX_SIZE}`);
  }
  return errors.length > 0 ? failure(...errors) : success();
}

/**
 * Validate a production order can be closed.
 * A production order cannot be closed if it has open quality defects.
 */
export function validateProductionOrderClose(hasOpenDefects: boolean): ValidationResult {
  if (hasOpenDefects) {
    return failure('Production order cannot be closed with open quality defects');
  }
  return success();
}

/**
 * Validate that a document has enough approvers.
 */
export function validateDocumentApprovers(approverCount: number): ValidationResult {
  if (approverCount < MIN_DOCUMENT_APPROVERS) {
    return failure(
      `Document requires at least ${MIN_DOCUMENT_APPROVERS} approvers, got ${approverCount}`
    );
  }
  return success();
}

/**
 * Validate that a maintenance order on a critical asset blocks production.
 */
export function validateProductionStart(
  hasCriticalMaintenanceOrder: boolean
): ValidationResult {
  if (hasCriticalMaintenanceOrder) {
    return failure('Production cannot start: critical asset has open maintenance order');
  }
  return success();
}

/**
 * Validate that a PTW is approved before work starts.
 */
export function validatePTWForWork(ptwStatus: PTWStatus | null): ValidationResult {
  if (!ptwStatus) {
    return failure('A Permit to Work (PTW) is required for this operation');
  }
  if (ptwStatus !== 'APPROVED' && ptwStatus !== 'ACTIVE') {
    return failure(`PTW must be approved or active before work can begin, current status: ${ptwStatus}`);
  }
  return success();
}

/**
 * Validate employee skill level for machine operation.
 */
export function validateOperatorSkill(skillLevel: SkillLevel | null): ValidationResult {
  if (skillLevel === null || skillLevel === undefined) {
    return failure('Employee has no skill record for this machine');
  }
  if (skillLevel < 2) {
    return failure(
      `Employee skill level ${skillLevel} is below minimum required level 2`
    );
  }
  return success();
}

/**
 * Validate a date range (start before end).
 */
export function validateDateRange(start: Date, end: Date): ValidationResult {
  if (start >= end) {
    return failure('Start date must be before end date');
  }
  return success();
}

/**
 * Validate a non-negative number.
 */
export function validateNonNegative(value: number, fieldName: string): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return failure(`${fieldName} must be a valid number`);
  }
  if (value < 0) {
    return failure(`${fieldName} must not be negative`);
  }
  return success();
}

/**
 * Validate a non-empty string.
 */
export function validateNonEmpty(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return failure(`${fieldName} must not be empty`);
  }
  return success();
}

/**
 * Validate an email address format.
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return failure('Invalid email address format');
  }
  return success();
}
