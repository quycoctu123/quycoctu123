/** Roles used across the platform for RBAC */
export const ROLES = [
  'SUPER_ADMIN',
  'PLANT_MANAGER',
  'MODULE_MANAGER',
  'SUPERVISOR',
  'OPERATOR',
  'VIEWER',
] as const;

export type Role = (typeof ROLES)[number];

/** 4M root-cause classification (WCM standard) */
export const ROOT_CAUSE_CATEGORIES = [
  'Man',
  'Machine',
  'Material',
  'Method',
] as const;

export type RootCauseCategory = (typeof ROOT_CAUSE_CATEGORIES)[number];

/** Production order statuses */
export const PRODUCTION_ORDER_STATUSES = [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CLOSED',
  'CANCELLED',
] as const;

export type ProductionOrderStatus = (typeof PRODUCTION_ORDER_STATUSES)[number];

/** Maintenance order priorities */
export const MAINTENANCE_PRIORITIES = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const;

export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

/** Maintenance order statuses */
export const MAINTENANCE_ORDER_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'COMPLETED',
  'CLOSED',
] as const;

export type MaintenanceOrderStatus = (typeof MAINTENANCE_ORDER_STATUSES)[number];

/** Asset criticality levels */
export const ASSET_CRITICALITIES = ['A', 'B', 'C'] as const;

export type AssetCriticality = (typeof ASSET_CRITICALITIES)[number];

/** Incident severity levels */
export const INCIDENT_SEVERITIES = [
  'MINOR',
  'MODERATE',
  'MAJOR',
  'CRITICAL',
  'FATAL',
] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

/** Incident types */
export const INCIDENT_TYPES = [
  'INJURY',
  'NEAR_MISS',
  'PROPERTY_DAMAGE',
  'ENVIRONMENTAL',
  'FIRE',
  'OTHER',
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];

/** CAPA statuses */
export const CAPA_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'VERIFICATION',
  'CLOSED',
  'OVERDUE',
] as const;

export type CAPAStatus = (typeof CAPA_STATUSES)[number];

/** PTW (Permit to Work) statuses */
export const PTW_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'CLOSED',
  'REJECTED',
] as const;

export type PTWStatus = (typeof PTW_STATUSES)[number];

/** Document statuses for ISO module */
export const DOCUMENT_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'PENDING_APPROVAL',
  'ACTIVE',
  'OBSOLETE',
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

/** NCR (Non-Conformance Report) statuses */
export const NCR_STATUSES = [
  'OPEN',
  'INVESTIGATION',
  'CORRECTIVE_ACTION',
  'VERIFICATION',
  'CLOSED',
] as const;

export type NCRStatus = (typeof NCR_STATUSES)[number];

/** Employee attendance statuses */
export const ATTENDANCE_STATUSES = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'HALF_DAY',
  'ON_LEAVE',
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

/** Skill levels for HRM skill matrix */
export const SKILL_LEVELS = [0, 1, 2, 3, 4] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];

/** Minimum skill level required to operate a machine */
export const MIN_SKILL_LEVEL_FOR_OPERATION: SkillLevel = 2;

/** Minimum number of approvers for ISO documents */
export const MIN_DOCUMENT_APPROVERS = 2;

/** Risk assessment matrix dimensions */
export const RISK_MATRIX_SIZE = 5;

/** Shift definitions */
export const SHIFTS = ['MORNING', 'AFTERNOON', 'NIGHT'] as const;

export type ShiftType = (typeof SHIFTS)[number];

/** Vietnam timezone */
export const TIMEZONE = 'Asia/Ho_Chi_Minh';

/** Standard API response shape */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

/** Modules in the system */
export const MODULES = ['MES', 'CMMS', 'HSE', 'HRM', 'ISO'] as const;

export type Module = (typeof MODULES)[number];

/** Trend direction for KPI dashboards */
export type TrendDirection = 'UP' | 'DOWN' | 'FLAT';
