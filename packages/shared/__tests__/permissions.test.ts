import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  getAllowedActions,
  getModuleResources,
  canAccessModule,
  requirePermission,
  PermissionDeniedError,
} from '../src/permissions';
import type { Role } from '../src/constants';

describe('Permissions', () => {
  describe('hasPermission', () => {
    describe('SUPER_ADMIN', () => {
      it('should have all permissions on all resources', () => {
        expect(hasPermission('SUPER_ADMIN', 'create', 'production_order')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'delete', 'employee')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'approve', 'document')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'export', 'incident')).toBe(true);
      });
    });

    describe('PLANT_MANAGER', () => {
      it('should have all permissions on all resources', () => {
        expect(hasPermission('PLANT_MANAGER', 'create', 'maintenance_order')).toBe(true);
        expect(hasPermission('PLANT_MANAGER', 'approve', 'ptw')).toBe(true);
        expect(hasPermission('PLANT_MANAGER', 'delete', 'asset')).toBe(true);
      });
    });

    describe('MODULE_MANAGER', () => {
      it('should have CRUD + export + approve on all resources', () => {
        expect(hasPermission('MODULE_MANAGER', 'create', 'production_order')).toBe(true);
        expect(hasPermission('MODULE_MANAGER', 'read', 'asset')).toBe(true);
        expect(hasPermission('MODULE_MANAGER', 'update', 'incident')).toBe(true);
        expect(hasPermission('MODULE_MANAGER', 'delete', 'spare_part')).toBe(true);
        expect(hasPermission('MODULE_MANAGER', 'export', 'employee')).toBe(true);
        expect(hasPermission('MODULE_MANAGER', 'approve', 'document')).toBe(true);
      });
    });

    describe('SUPERVISOR', () => {
      it('should have CRUD + export on all resources', () => {
        expect(hasPermission('SUPERVISOR', 'create', 'production_order')).toBe(true);
        expect(hasPermission('SUPERVISOR', 'export', 'ncr')).toBe(true);
      });

      it('should NOT have approve permission', () => {
        expect(hasPermission('SUPERVISOR', 'approve', 'document')).toBe(false);
        expect(hasPermission('SUPERVISOR', 'approve', 'ptw')).toBe(false);
      });
    });

    describe('OPERATOR', () => {
      it('should be able to create/read/update specific resources', () => {
        expect(hasPermission('OPERATOR', 'create', 'production_log')).toBe(true);
        expect(hasPermission('OPERATOR', 'create', 'quality_defect')).toBe(true);
        expect(hasPermission('OPERATOR', 'create', 'incident')).toBe(true);
        expect(hasPermission('OPERATOR', 'create', 'attendance')).toBe(true);
        expect(hasPermission('OPERATOR', 'update', 'production_log')).toBe(true);
      });

      it('should be able to read and export all resources', () => {
        expect(hasPermission('OPERATOR', 'read', 'production_order')).toBe(true);
        expect(hasPermission('OPERATOR', 'read', 'asset')).toBe(true);
        expect(hasPermission('OPERATOR', 'export', 'document')).toBe(true);
      });

      it('should NOT be able to delete any resource', () => {
        expect(hasPermission('OPERATOR', 'delete', 'production_log')).toBe(false);
        expect(hasPermission('OPERATOR', 'delete', 'asset')).toBe(false);
      });

      it('should NOT be able to approve', () => {
        expect(hasPermission('OPERATOR', 'approve', 'document')).toBe(false);
      });
    });

    describe('VIEWER', () => {
      it('should only have read and export permissions', () => {
        expect(hasPermission('VIEWER', 'read', 'production_order')).toBe(true);
        expect(hasPermission('VIEWER', 'export', 'employee')).toBe(true);
      });

      it('should NOT have create, update, delete, or approve', () => {
        expect(hasPermission('VIEWER', 'create', 'incident')).toBe(false);
        expect(hasPermission('VIEWER', 'update', 'asset')).toBe(false);
        expect(hasPermission('VIEWER', 'delete', 'document')).toBe(false);
        expect(hasPermission('VIEWER', 'approve', 'ptw')).toBe(false);
      });
    });
  });

  describe('getAllowedActions', () => {
    it('should return all actions for SUPER_ADMIN', () => {
      const actions = getAllowedActions('SUPER_ADMIN', 'production_order');
      expect(actions).toContain('create');
      expect(actions).toContain('read');
      expect(actions).toContain('update');
      expect(actions).toContain('delete');
      expect(actions).toContain('approve');
      expect(actions).toContain('export');
    });

    it('should return only read/export for VIEWER', () => {
      const actions = getAllowedActions('VIEWER', 'asset');
      expect(actions).toEqual(expect.arrayContaining(['read', 'export']));
      expect(actions).toHaveLength(2);
    });

    it('should return correct actions for OPERATOR on production_log', () => {
      const actions = getAllowedActions('OPERATOR', 'production_log');
      expect(actions).toContain('create');
      expect(actions).toContain('read');
      expect(actions).toContain('update');
      expect(actions).toContain('export');
      expect(actions).not.toContain('delete');
      expect(actions).not.toContain('approve');
    });
  });

  describe('getModuleResources', () => {
    it('should return MES resources', () => {
      const resources = getModuleResources('MES');
      expect(resources).toEqual([
        'production_order', 'work_center', 'production_log', 'quality_defect',
      ]);
    });

    it('should return CMMS resources', () => {
      const resources = getModuleResources('CMMS');
      expect(resources).toEqual([
        'asset', 'maintenance_order', 'spare_part', 'pm_schedule',
      ]);
    });

    it('should return HSE resources', () => {
      const resources = getModuleResources('HSE');
      expect(resources).toContain('incident');
      expect(resources).toContain('ptw');
      expect(resources).toContain('safety_training');
    });

    it('should return HRM resources', () => {
      const resources = getModuleResources('HRM');
      expect(resources).toContain('employee');
      expect(resources).toContain('skill_matrix');
    });

    it('should return ISO resources', () => {
      const resources = getModuleResources('ISO');
      expect(resources).toContain('document');
      expect(resources).toContain('audit');
      expect(resources).toContain('ncr');
      expect(resources).toContain('calibration_record');
    });
  });

  describe('canAccessModule', () => {
    it('should return true for any role on any module (all have at least read)', () => {
      const roles: Role[] = ['SUPER_ADMIN', 'PLANT_MANAGER', 'MODULE_MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'];
      for (const role of roles) {
        expect(canAccessModule(role, 'MES')).toBe(true);
        expect(canAccessModule(role, 'CMMS')).toBe(true);
        expect(canAccessModule(role, 'HSE')).toBe(true);
        expect(canAccessModule(role, 'HRM')).toBe(true);
        expect(canAccessModule(role, 'ISO')).toBe(true);
      }
    });
  });

  describe('requirePermission', () => {
    it('should not throw for valid permissions', () => {
      expect(() => requirePermission('SUPER_ADMIN', 'delete', 'asset')).not.toThrow();
    });

    it('should throw PermissionDeniedError for invalid permissions', () => {
      expect(() => requirePermission('VIEWER', 'create', 'incident')).toThrow(
        PermissionDeniedError
      );
    });

    it('should include role, action, and resource in error', () => {
      try {
        requirePermission('VIEWER', 'delete', 'employee');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(PermissionDeniedError);
        const pErr = err as PermissionDeniedError;
        expect(pErr.role).toBe('VIEWER');
        expect(pErr.action).toBe('delete');
        expect(pErr.resource).toBe('employee');
        expect(pErr.message).toContain('VIEWER');
        expect(pErr.message).toContain('delete');
        expect(pErr.message).toContain('employee');
      }
    });
  });
});
