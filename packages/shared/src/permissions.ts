import type { Role, Module } from './constants';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';

export type Resource =
  | 'production_order'
  | 'work_center'
  | 'production_log'
  | 'quality_defect'
  | 'asset'
  | 'maintenance_order'
  | 'spare_part'
  | 'pm_schedule'
  | 'incident'
  | 'risk_assessment'
  | 'capa'
  | 'ptw'
  | 'hazardous_item'
  | 'safety_training'
  | 'employee'
  | 'attendance'
  | 'skill_matrix'
  | 'training_record'
  | 'document'
  | 'audit'
  | 'ncr'
  | 'customer_complaint'
  | 'calibration_record';

interface PermissionRule {
  actions: Action[];
  resources: Resource[];
}

const ALL_ACTIONS: Action[] = ['create', 'read', 'update', 'delete', 'approve', 'export'];
const READ_EXPORT: Action[] = ['read', 'export'];
const CRUD_EXPORT: Action[] = ['create', 'read', 'update', 'delete', 'export'];

const ALL_RESOURCES: Resource[] = [
  'production_order', 'work_center', 'production_log', 'quality_defect',
  'asset', 'maintenance_order', 'spare_part', 'pm_schedule',
  'incident', 'risk_assessment', 'capa', 'ptw', 'hazardous_item', 'safety_training',
  'employee', 'attendance', 'skill_matrix', 'training_record',
  'document', 'audit', 'ncr', 'customer_complaint', 'calibration_record',
];

const MODULE_RESOURCE_MAP: Record<Module, Resource[]> = {
  MES: ['production_order', 'work_center', 'production_log', 'quality_defect'],
  CMMS: ['asset', 'maintenance_order', 'spare_part', 'pm_schedule'],
  HSE: ['incident', 'risk_assessment', 'capa', 'ptw', 'hazardous_item', 'safety_training'],
  HRM: ['employee', 'attendance', 'skill_matrix', 'training_record'],
  ISO: ['document', 'audit', 'ncr', 'customer_complaint', 'calibration_record'],
};

const PERMISSION_MATRIX: Record<Role, PermissionRule[]> = {
  SUPER_ADMIN: [
    { actions: ALL_ACTIONS, resources: ALL_RESOURCES },
  ],
  PLANT_MANAGER: [
    { actions: ALL_ACTIONS, resources: ALL_RESOURCES },
  ],
  MODULE_MANAGER: [
    { actions: CRUD_EXPORT, resources: ALL_RESOURCES },
    { actions: ['approve'], resources: ALL_RESOURCES },
  ],
  SUPERVISOR: [
    { actions: CRUD_EXPORT, resources: ALL_RESOURCES },
  ],
  OPERATOR: [
    { actions: ['create', 'read', 'update'], resources: [
      'production_log', 'quality_defect', 'incident', 'attendance',
    ]},
    { actions: READ_EXPORT, resources: ALL_RESOURCES },
  ],
  VIEWER: [
    { actions: READ_EXPORT, resources: ALL_RESOURCES },
  ],
};

/**
 * Check if a role has permission to perform an action on a resource.
 */
export function hasPermission(role: Role, action: Action, resource: Resource): boolean {
  const rules = PERMISSION_MATRIX[role];
  if (!rules) return false;

  return rules.some(
    (rule) => rule.actions.includes(action) && rule.resources.includes(resource)
  );
}

/**
 * Get all allowed actions for a role on a resource.
 */
export function getAllowedActions(role: Role, resource: Resource): Action[] {
  const rules = PERMISSION_MATRIX[role];
  if (!rules) return [];

  const actions = new Set<Action>();
  for (const rule of rules) {
    if (rule.resources.includes(resource)) {
      for (const action of rule.actions) {
        actions.add(action);
      }
    }
  }
  return Array.from(actions);
}

/**
 * Get all resources a role can access for a given module.
 */
export function getModuleResources(module: Module): Resource[] {
  return MODULE_RESOURCE_MAP[module] ?? [];
}

/**
 * Check if a role can access any resource in a module.
 */
export function canAccessModule(role: Role, module: Module): boolean {
  const resources = getModuleResources(module);
  return resources.some((resource) => hasPermission(role, 'read', resource));
}

/**
 * Assert permission — throws if unauthorized.
 */
export function requirePermission(role: Role, action: Action, resource: Resource): void {
  if (!hasPermission(role, action, resource)) {
    throw new PermissionDeniedError(role, action, resource);
  }
}

export class PermissionDeniedError extends Error {
  constructor(
    public readonly role: Role,
    public readonly action: Action,
    public readonly resource: Resource
  ) {
    super(`Permission denied: role '${role}' cannot '${action}' on '${resource}'`);
    this.name = 'PermissionDeniedError';
  }
}
