import type { TrendDirection } from './constants';

// --------------- MES KPIs ---------------

export interface OEEInput {
  plannedProductionTime: number;
  actualRunTime: number;
  totalPieces: number;
  idealCycleTime: number;
  goodPieces: number;
}

export interface OEEResult {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

/**
 * Calculate OEE (Overall Equipment Effectiveness).
 * All values returned as percentages (0-100).
 */
export function calculateOEE(input: OEEInput): OEEResult {
  const { plannedProductionTime, actualRunTime, totalPieces, idealCycleTime, goodPieces } = input;

  if (plannedProductionTime <= 0) {
    return { availability: 0, performance: 0, quality: 0, oee: 0 };
  }

  const availability = actualRunTime / plannedProductionTime;
  const performance = actualRunTime > 0
    ? (totalPieces * idealCycleTime) / actualRunTime
    : 0;
  const quality = totalPieces > 0 ? goodPieces / totalPieces : 0;
  const oee = availability * performance * quality;

  return {
    availability: clampPercent(availability * 100),
    performance: clampPercent(performance * 100),
    quality: clampPercent(quality * 100),
    oee: clampPercent(oee * 100),
  };
}

/**
 * Calculate scrap rate as a percentage.
 */
export function calculateScrapRate(defectQuantity: number, totalQuantity: number): number {
  if (totalQuantity <= 0) return 0;
  return clampPercent((defectQuantity / totalQuantity) * 100);
}

/**
 * Calculate production vs plan percentage.
 */
export function calculateProductionVsPlan(actualQuantity: number, plannedQuantity: number): number {
  if (plannedQuantity <= 0) return 0;
  return round((actualQuantity / plannedQuantity) * 100, 2);
}

// --------------- CMMS KPIs ---------------

/**
 * Calculate MTBF (Mean Time Between Failures) in hours.
 * totalOperatingTime: total operating hours in period
 * numberOfFailures: number of breakdowns in period
 */
export function calculateMTBF(totalOperatingTime: number, numberOfFailures: number): number {
  if (numberOfFailures <= 0) return totalOperatingTime > 0 ? totalOperatingTime : 0;
  return round(totalOperatingTime / numberOfFailures, 2);
}

/**
 * Calculate MTTR (Mean Time To Repair) in hours.
 * totalRepairTime: sum of all repair durations in hours
 * numberOfRepairs: count of repairs completed
 */
export function calculateMTTR(totalRepairTime: number, numberOfRepairs: number): number {
  if (numberOfRepairs <= 0) return 0;
  return round(totalRepairTime / numberOfRepairs, 2);
}

/**
 * Calculate PM (Preventive Maintenance) Compliance percentage.
 * completedPMs: number of PM tasks completed on schedule
 * scheduledPMs: total PM tasks scheduled in period
 */
export function calculatePMCompliance(completedPMs: number, scheduledPMs: number): number {
  if (scheduledPMs <= 0) return 0;
  return clampPercent((completedPMs / scheduledPMs) * 100);
}

/**
 * Calculate spare parts availability percentage.
 * availableParts: parts with stock above reorder point
 * totalParts: total tracked parts
 */
export function calculateSparePartsAvailability(availableParts: number, totalParts: number): number {
  if (totalParts <= 0) return 0;
  return clampPercent((availableParts / totalParts) * 100);
}

// --------------- HSE KPIs ---------------

/**
 * Calculate LTIFR (Lost Time Injury Frequency Rate).
 * lostTimeInjuries: number of lost-time injuries in period
 * totalHoursWorked: total man-hours worked in period
 * multiplier: normalization factor (default 1,000,000)
 */
export function calculateLTIFR(
  lostTimeInjuries: number,
  totalHoursWorked: number,
  multiplier: number = 1_000_000
): number {
  if (totalHoursWorked <= 0) return 0;
  return round((lostTimeInjuries / totalHoursWorked) * multiplier, 2);
}

/**
 * Calculate near-miss reporting rate.
 * nearMisses: number of near-misses reported
 * totalHoursWorked: total man-hours worked
 * multiplier: normalization factor (default 200,000 per OSHA standard)
 */
export function calculateNearMissRate(
  nearMisses: number,
  totalHoursWorked: number,
  multiplier: number = 200_000
): number {
  if (totalHoursWorked <= 0) return 0;
  return round((nearMisses / totalHoursWorked) * multiplier, 2);
}

/**
 * Calculate CAPA closure rate percentage.
 * closedCAPAs: number of CAPAs closed
 * totalCAPAs: total CAPAs in period
 */
export function calculateCAPAClosureRate(closedCAPAs: number, totalCAPAs: number): number {
  if (totalCAPAs <= 0) return 0;
  return clampPercent((closedCAPAs / totalCAPAs) * 100);
}

/**
 * Calculate CAPA on-time closure rate percentage.
 * onTimeCAPAs: CAPAs closed on or before planned date
 * totalClosedCAPAs: total CAPAs closed
 */
export function calculateCAPAOnTimeRate(onTimeCAPAs: number, totalClosedCAPAs: number): number {
  if (totalClosedCAPAs <= 0) return 0;
  return clampPercent((onTimeCAPAs / totalClosedCAPAs) * 100);
}

/**
 * Calculate risk score from likelihood and severity (5x5 matrix).
 * Both values should be 1-5.
 */
export function calculateRiskScore(likelihood: number, severity: number): number {
  const clampedLikelihood = Math.max(1, Math.min(5, Math.round(likelihood)));
  const clampedSeverity = Math.max(1, Math.min(5, Math.round(severity)));
  return clampedLikelihood * clampedSeverity;
}

/**
 * Get risk level label from a risk score (1-25).
 */
export function getRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (riskScore <= 4) return 'LOW';
  if (riskScore <= 9) return 'MEDIUM';
  if (riskScore <= 16) return 'HIGH';
  return 'EXTREME';
}

// --------------- HRM KPIs ---------------

/**
 * Calculate training hours per employee.
 * totalTrainingHours: sum of all training hours in period
 * totalEmployees: number of employees
 */
export function calculateTrainingHoursPerEmployee(
  totalTrainingHours: number,
  totalEmployees: number
): number {
  if (totalEmployees <= 0) return 0;
  return round(totalTrainingHours / totalEmployees, 2);
}

/**
 * Calculate skills coverage percentage.
 * certifiedSkills: number of skill-role combinations that meet minimum level
 * totalRequiredSkills: total skill-role combinations required
 */
export function calculateSkillsCoverage(
  certifiedSkills: number,
  totalRequiredSkills: number
): number {
  if (totalRequiredSkills <= 0) return 0;
  return clampPercent((certifiedSkills / totalRequiredSkills) * 100);
}

/**
 * Calculate absenteeism rate percentage.
 * absentDays: total days absent in period
 * totalWorkDays: total scheduled work days (employees × working days)
 */
export function calculateAbsenteeismRate(absentDays: number, totalWorkDays: number): number {
  if (totalWorkDays <= 0) return 0;
  return clampPercent((absentDays / totalWorkDays) * 100);
}

// --------------- ISO KPIs ---------------

/**
 * Calculate audit findings closure rate percentage.
 * closedFindings: number of findings closed
 * totalFindings: total findings in period
 */
export function calculateAuditFindingsClosureRate(
  closedFindings: number,
  totalFindings: number
): number {
  if (totalFindings <= 0) return 0;
  return clampPercent((closedFindings / totalFindings) * 100);
}

/**
 * Calculate average NCR resolution time in days.
 * resolutionDays: array of resolution times in days for each closed NCR
 */
export function calculateNCRResolutionTime(resolutionDays: number[]): number {
  if (resolutionDays.length === 0) return 0;
  const sum = resolutionDays.reduce((a, b) => a + b, 0);
  return round(sum / resolutionDays.length, 1);
}

/**
 * Calculate document revision on-time rate percentage.
 * onTimeRevisions: revisions completed on schedule
 * totalRevisions: total revisions in period
 */
export function calculateDocumentRevisionOnTimeRate(
  onTimeRevisions: number,
  totalRevisions: number
): number {
  if (totalRevisions <= 0) return 0;
  return clampPercent((onTimeRevisions / totalRevisions) * 100);
}

// --------------- Utility ---------------

/**
 * Determine trend direction comparing current to previous value.
 * A tolerance band avoids FLAT when values are essentially equal.
 */
export function determineTrend(
  current: number,
  previous: number,
  tolerance: number = 0.001
): TrendDirection {
  const diff = current - previous;
  if (Math.abs(diff) <= tolerance) return 'FLAT';
  return diff > 0 ? 'UP' : 'DOWN';
}

/** Clamp a percentage value between 0 and 100. */
function clampPercent(value: number): number {
  return round(Math.max(0, Math.min(100, value)), 2);
}

/** Round to specified decimal places. */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
