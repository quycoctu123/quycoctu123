import { describe, it, expect } from 'vitest';
import {
  calculateOEE,
  calculateScrapRate,
  calculateProductionVsPlan,
  calculateMTBF,
  calculateMTTR,
  calculatePMCompliance,
  calculateSparePartsAvailability,
  calculateLTIFR,
  calculateNearMissRate,
  calculateCAPAClosureRate,
  calculateCAPAOnTimeRate,
  calculateRiskScore,
  getRiskLevel,
  calculateTrainingHoursPerEmployee,
  calculateSkillsCoverage,
  calculateAbsenteeismRate,
  calculateAuditFindingsClosureRate,
  calculateNCRResolutionTime,
  calculateDocumentRevisionOnTimeRate,
  determineTrend,
} from '../src/kpi-formulas';

describe('KPI Formulas', () => {
  // ==================== MES KPIs ====================

  describe('calculateOEE', () => {
    it('should calculate perfect OEE (100%)', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        actualRunTime: 480,
        totalPieces: 480,
        idealCycleTime: 1,
        goodPieces: 480,
      });
      expect(result.availability).toBe(100);
      expect(result.performance).toBe(100);
      expect(result.quality).toBe(100);
      expect(result.oee).toBe(100);
    });

    it('should calculate OEE with downtime', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        actualRunTime: 400,
        totalPieces: 380,
        idealCycleTime: 1,
        goodPieces: 360,
      });
      expect(result.availability).toBeCloseTo(83.33, 1);
      expect(result.performance).toBeCloseTo(95, 0);
      expect(result.quality).toBeCloseTo(94.74, 1);
      expect(result.oee).toBeCloseTo(75, 0);
    });

    it('should return zeros when planned time is 0', () => {
      const result = calculateOEE({
        plannedProductionTime: 0,
        actualRunTime: 100,
        totalPieces: 100,
        idealCycleTime: 1,
        goodPieces: 100,
      });
      expect(result.oee).toBe(0);
      expect(result.availability).toBe(0);
    });

    it('should return 0 performance when run time is 0', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        actualRunTime: 0,
        totalPieces: 0,
        idealCycleTime: 1,
        goodPieces: 0,
      });
      expect(result.availability).toBe(0);
      expect(result.performance).toBe(0);
    });

    it('should return 0 quality when total pieces is 0', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        actualRunTime: 480,
        totalPieces: 0,
        idealCycleTime: 1,
        goodPieces: 0,
      });
      expect(result.quality).toBe(0);
    });

    it('should cap values at 100%', () => {
      const result = calculateOEE({
        plannedProductionTime: 100,
        actualRunTime: 200,
        totalPieces: 300,
        idealCycleTime: 1,
        goodPieces: 300,
      });
      expect(result.availability).toBeLessThanOrEqual(100);
      expect(result.performance).toBeLessThanOrEqual(100);
      expect(result.quality).toBeLessThanOrEqual(100);
      expect(result.oee).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateScrapRate', () => {
    it('should calculate scrap rate percentage', () => {
      expect(calculateScrapRate(10, 100)).toBe(10);
    });

    it('should return 0 when total is 0', () => {
      expect(calculateScrapRate(10, 0)).toBe(0);
    });

    it('should handle 0 defects', () => {
      expect(calculateScrapRate(0, 500)).toBe(0);
    });

    it('should cap at 100%', () => {
      expect(calculateScrapRate(150, 100)).toBe(100);
    });
  });

  describe('calculateProductionVsPlan', () => {
    it('should calculate production vs plan on target', () => {
      expect(calculateProductionVsPlan(100, 100)).toBe(100);
    });

    it('should calculate over-production', () => {
      expect(calculateProductionVsPlan(120, 100)).toBe(120);
    });

    it('should calculate under-production', () => {
      expect(calculateProductionVsPlan(80, 100)).toBe(80);
    });

    it('should return 0 when planned is 0', () => {
      expect(calculateProductionVsPlan(100, 0)).toBe(0);
    });
  });

  // ==================== CMMS KPIs ====================

  describe('calculateMTBF', () => {
    it('should calculate MTBF correctly', () => {
      expect(calculateMTBF(1000, 5)).toBe(200);
    });

    it('should return total time when no failures', () => {
      expect(calculateMTBF(1000, 0)).toBe(1000);
    });

    it('should return 0 when both are 0', () => {
      expect(calculateMTBF(0, 0)).toBe(0);
    });

    it('should handle single failure', () => {
      expect(calculateMTBF(720, 1)).toBe(720);
    });
  });

  describe('calculateMTTR', () => {
    it('should calculate MTTR correctly', () => {
      expect(calculateMTTR(50, 10)).toBe(5);
    });

    it('should return 0 when no repairs', () => {
      expect(calculateMTTR(50, 0)).toBe(0);
    });

    it('should handle fractional hours', () => {
      expect(calculateMTTR(7.5, 3)).toBe(2.5);
    });
  });

  describe('calculatePMCompliance', () => {
    it('should calculate 100% compliance', () => {
      expect(calculatePMCompliance(20, 20)).toBe(100);
    });

    it('should calculate partial compliance', () => {
      expect(calculatePMCompliance(15, 20)).toBe(75);
    });

    it('should return 0 when none scheduled', () => {
      expect(calculatePMCompliance(5, 0)).toBe(0);
    });

    it('should cap at 100%', () => {
      expect(calculatePMCompliance(25, 20)).toBe(100);
    });
  });

  describe('calculateSparePartsAvailability', () => {
    it('should calculate availability percentage', () => {
      expect(calculateSparePartsAvailability(80, 100)).toBe(80);
    });

    it('should return 0 when no parts tracked', () => {
      expect(calculateSparePartsAvailability(10, 0)).toBe(0);
    });
  });

  // ==================== HSE KPIs ====================

  describe('calculateLTIFR', () => {
    it('should calculate LTIFR with default multiplier', () => {
      expect(calculateLTIFR(2, 500000)).toBe(4);
    });

    it('should return 0 when no hours worked', () => {
      expect(calculateLTIFR(5, 0)).toBe(0);
    });

    it('should return 0 when no injuries', () => {
      expect(calculateLTIFR(0, 1000000)).toBe(0);
    });

    it('should use custom multiplier', () => {
      expect(calculateLTIFR(3, 100000, 200000)).toBe(6);
    });
  });

  describe('calculateNearMissRate', () => {
    it('should calculate near-miss rate with default multiplier', () => {
      expect(calculateNearMissRate(10, 200000)).toBe(10);
    });

    it('should return 0 when no hours worked', () => {
      expect(calculateNearMissRate(5, 0)).toBe(0);
    });
  });

  describe('calculateCAPAClosureRate', () => {
    it('should calculate closure rate', () => {
      expect(calculateCAPAClosureRate(8, 10)).toBe(80);
    });

    it('should return 0 when no CAPAs', () => {
      expect(calculateCAPAClosureRate(3, 0)).toBe(0);
    });

    it('should handle 100% closure', () => {
      expect(calculateCAPAClosureRate(15, 15)).toBe(100);
    });
  });

  describe('calculateCAPAOnTimeRate', () => {
    it('should calculate on-time closure rate', () => {
      expect(calculateCAPAOnTimeRate(7, 10)).toBe(70);
    });

    it('should return 0 when no closed CAPAs', () => {
      expect(calculateCAPAOnTimeRate(5, 0)).toBe(0);
    });
  });

  describe('calculateRiskScore', () => {
    it('should multiply likelihood by severity', () => {
      expect(calculateRiskScore(3, 4)).toBe(12);
    });

    it('should calculate minimum risk (1x1)', () => {
      expect(calculateRiskScore(1, 1)).toBe(1);
    });

    it('should calculate maximum risk (5x5)', () => {
      expect(calculateRiskScore(5, 5)).toBe(25);
    });

    it('should clamp values below 1 to 1', () => {
      expect(calculateRiskScore(0, 3)).toBe(3);
    });

    it('should clamp values above 5 to 5', () => {
      expect(calculateRiskScore(7, 3)).toBe(15);
    });

    it('should round fractional values', () => {
      expect(calculateRiskScore(2.4, 3.6)).toBe(8); // round(2.4)=2, round(3.6)=4
    });
  });

  describe('getRiskLevel', () => {
    it('should return LOW for scores 1-4', () => {
      expect(getRiskLevel(1)).toBe('LOW');
      expect(getRiskLevel(4)).toBe('LOW');
    });

    it('should return MEDIUM for scores 5-9', () => {
      expect(getRiskLevel(5)).toBe('MEDIUM');
      expect(getRiskLevel(9)).toBe('MEDIUM');
    });

    it('should return HIGH for scores 10-16', () => {
      expect(getRiskLevel(10)).toBe('HIGH');
      expect(getRiskLevel(16)).toBe('HIGH');
    });

    it('should return EXTREME for scores 17-25', () => {
      expect(getRiskLevel(17)).toBe('EXTREME');
      expect(getRiskLevel(25)).toBe('EXTREME');
    });
  });

  // ==================== HRM KPIs ====================

  describe('calculateTrainingHoursPerEmployee', () => {
    it('should calculate average training hours', () => {
      expect(calculateTrainingHoursPerEmployee(500, 50)).toBe(10);
    });

    it('should return 0 when no employees', () => {
      expect(calculateTrainingHoursPerEmployee(100, 0)).toBe(0);
    });

    it('should handle fractional hours', () => {
      expect(calculateTrainingHoursPerEmployee(100, 3)).toBeCloseTo(33.33, 1);
    });
  });

  describe('calculateSkillsCoverage', () => {
    it('should calculate coverage percentage', () => {
      expect(calculateSkillsCoverage(45, 50)).toBe(90);
    });

    it('should return 0 when no required skills', () => {
      expect(calculateSkillsCoverage(10, 0)).toBe(0);
    });

    it('should handle 100% coverage', () => {
      expect(calculateSkillsCoverage(50, 50)).toBe(100);
    });
  });

  describe('calculateAbsenteeismRate', () => {
    it('should calculate absenteeism rate', () => {
      expect(calculateAbsenteeismRate(20, 1000)).toBe(2);
    });

    it('should return 0 when no work days', () => {
      expect(calculateAbsenteeismRate(5, 0)).toBe(0);
    });
  });

  // ==================== ISO KPIs ====================

  describe('calculateAuditFindingsClosureRate', () => {
    it('should calculate closure rate', () => {
      expect(calculateAuditFindingsClosureRate(18, 20)).toBe(90);
    });

    it('should return 0 when no findings', () => {
      expect(calculateAuditFindingsClosureRate(5, 0)).toBe(0);
    });
  });

  describe('calculateNCRResolutionTime', () => {
    it('should calculate average resolution time', () => {
      expect(calculateNCRResolutionTime([5, 10, 15])).toBe(10);
    });

    it('should return 0 for empty array', () => {
      expect(calculateNCRResolutionTime([])).toBe(0);
    });

    it('should handle single NCR', () => {
      expect(calculateNCRResolutionTime([7])).toBe(7);
    });

    it('should round to 1 decimal', () => {
      expect(calculateNCRResolutionTime([3, 5, 7])).toBe(5);
      expect(calculateNCRResolutionTime([1, 2])).toBe(1.5);
    });
  });

  describe('calculateDocumentRevisionOnTimeRate', () => {
    it('should calculate on-time rate', () => {
      expect(calculateDocumentRevisionOnTimeRate(9, 10)).toBe(90);
    });

    it('should return 0 when no revisions', () => {
      expect(calculateDocumentRevisionOnTimeRate(5, 0)).toBe(0);
    });
  });

  // ==================== Utility ====================

  describe('determineTrend', () => {
    it('should return UP when current > previous', () => {
      expect(determineTrend(85, 80)).toBe('UP');
    });

    it('should return DOWN when current < previous', () => {
      expect(determineTrend(75, 80)).toBe('DOWN');
    });

    it('should return FLAT when values are within tolerance', () => {
      expect(determineTrend(80, 80)).toBe('FLAT');
      expect(determineTrend(80.0005, 80)).toBe('FLAT');
    });

    it('should use custom tolerance', () => {
      expect(determineTrend(80.5, 80, 1)).toBe('FLAT');
      expect(determineTrend(82, 80, 1)).toBe('UP');
    });

    it('should handle negative values', () => {
      expect(determineTrend(-5, -10)).toBe('UP');
      expect(determineTrend(-10, -5)).toBe('DOWN');
    });
  });
});
