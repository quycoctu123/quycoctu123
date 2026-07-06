import type {
  Role,
  RootCauseCategory,
  ProductionOrderStatus,
  MaintenancePriority,
  MaintenanceOrderStatus,
  AssetCriticality,
  IncidentSeverity,
  IncidentType,
  CAPAStatus,
  PTWStatus,
  DocumentStatus,
  NCRStatus,
  AttendanceStatus,
  SkillLevel,
  ShiftType,
  TrendDirection,
} from './constants';

/** Base entity fields shared by all DB tables */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isDeleted: boolean;
}

// --------------- MES ---------------

export interface ProductionOrder extends BaseEntity {
  orderNumber: string;
  productName: string;
  workCenterId: string;
  plannedQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  status: ProductionOrderStatus;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  shiftId: string;
}

export interface WorkCenter extends BaseEntity {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface Shift extends BaseEntity {
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
}

export interface ProductionLog extends BaseEntity {
  productionOrderId: string;
  workCenterId: string;
  shiftId: string;
  operatorId: string;
  quantityProduced: number;
  defectQuantity: number;
  startTime: Date;
  endTime: Date;
  downtime: number;
  notes: string | null;
}

export interface QualityDefect extends BaseEntity {
  productionOrderId: string;
  defectType: string;
  quantity: number;
  rootCauseCategory: RootCauseCategory;
  description: string;
  isResolved: boolean;
}

// --------------- CMMS ---------------

export interface Asset extends BaseEntity {
  name: string;
  code: string;
  parentAssetId: string | null;
  criticality: AssetCriticality;
  location: string;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  installDate: Date | null;
  isActive: boolean;
}

export interface MaintenanceOrder extends BaseEntity {
  assetId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceOrderStatus;
  assignedTo: string | null;
  scheduledDate: Date;
  completedDate: Date | null;
  estimatedDuration: number;
  actualDuration: number | null;
  cost: number;
  isPreventive: boolean;
}

export interface SparePart extends BaseEntity {
  name: string;
  code: string;
  quantity: number;
  reorderPoint: number;
  unitCost: number;
  location: string;
}

export interface PMSchedule extends BaseEntity {
  assetId: string;
  name: string;
  description: string;
  intervalDays: number | null;
  meterThreshold: number | null;
  lastExecutedDate: Date | null;
  nextDueDate: Date;
  isActive: boolean;
}

export interface MaintenanceLog extends BaseEntity {
  maintenanceOrderId: string;
  assetId: string;
  failureStartTime: Date;
  failureEndTime: Date | null;
  repairStartTime: Date | null;
  repairEndTime: Date | null;
  rootCauseCategory: RootCauseCategory | null;
  description: string;
}

// --------------- HSE ---------------

export interface Incident extends BaseEntity {
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location: string;
  occurredAt: Date;
  reportedBy: string;
  rootCauseCategory: RootCauseCategory | null;
  isLostTime: boolean;
  lostTimeDays: number;
  photoUrls: string[];
}

export interface RiskAssessment extends BaseEntity {
  title: string;
  area: string;
  hazardDescription: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  controlMeasures: string;
  residualLikelihood: number | null;
  residualSeverity: number | null;
  residualRiskScore: number | null;
  assessedBy: string;
}

export interface CAPA extends BaseEntity {
  title: string;
  description: string;
  sourceType: 'INCIDENT' | 'NCR' | 'AUDIT' | 'COMPLAINT';
  sourceId: string;
  status: CAPAStatus;
  assignedTo: string;
  rootCauseCategory: RootCauseCategory;
  plannedDate: Date;
  actualClosureDate: Date | null;
}

export interface HazardousItem extends BaseEntity {
  name: string;
  unNumber: string | null;
  sdsUrl: string | null;
  location: string;
  quantity: number;
  unit: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PTW extends BaseEntity {
  title: string;
  workType: string;
  location: string;
  status: PTWStatus;
  requestedBy: string;
  approvedBy: string | null;
  validFrom: Date;
  validTo: Date;
  maintenanceOrderId: string | null;
}

export interface SafetyTraining extends BaseEntity {
  employeeId: string;
  trainingName: string;
  certificationName: string | null;
  completedDate: Date;
  expiryDate: Date | null;
  isValid: boolean;
}

// --------------- HRM ---------------

export interface Employee extends BaseEntity {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  hireDate: Date;
  isActive: boolean;
}

export interface Attendance extends BaseEntity {
  employeeId: string;
  date: Date;
  shiftId: string;
  status: AttendanceStatus;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  overtimeHours: number;
}

export interface SkillMatrix extends BaseEntity {
  employeeId: string;
  machineName: string;
  workCenterId: string;
  skillLevel: SkillLevel;
  certifiedDate: Date | null;
  expiryDate: Date | null;
}

export interface TrainingRecord extends BaseEntity {
  employeeId: string;
  trainingName: string;
  scheduledDate: Date;
  completedDate: Date | null;
  hoursSpent: number;
  isEffective: boolean | null;
  notes: string | null;
}

// --------------- ISO ---------------

export interface Document extends BaseEntity {
  title: string;
  documentNumber: string;
  category: string;
  status: DocumentStatus;
  currentRevision: number;
  approverIds: string[];
  approvalCount: number;
}

export interface DocumentRevision extends BaseEntity {
  documentId: string;
  revisionNumber: number;
  changeDescription: string;
  approvedBy: string[];
  approvedAt: Date | null;
  fileUrl: string;
}

export interface Audit extends BaseEntity {
  title: string;
  auditType: 'INTERNAL' | 'EXTERNAL' | 'SURVEILLANCE';
  scheduledDate: Date;
  completedDate: Date | null;
  auditorName: string;
  findings: number;
  closedFindings: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface NCR extends BaseEntity {
  title: string;
  description: string;
  status: NCRStatus;
  sourceType: 'PRODUCTION' | 'AUDIT' | 'CUSTOMER_COMPLAINT' | 'INSPECTION';
  sourceId: string | null;
  rootCauseCategory: RootCauseCategory;
  assignedTo: string;
  resolvedDate: Date | null;
}

export interface CustomerComplaint extends BaseEntity {
  customerName: string;
  productName: string;
  description: string;
  receivedDate: Date;
  resolvedDate: Date | null;
  rootCauseCategory: RootCauseCategory | null;
  capaId: string | null;
  isResolved: boolean;
}

export interface CalibrationRecord extends BaseEntity {
  instrumentName: string;
  instrumentCode: string;
  calibratedDate: Date;
  nextCalibrationDate: Date;
  calibratedBy: string;
  result: 'PASS' | 'FAIL' | 'ADJUSTED';
  certificateUrl: string | null;
}

// --------------- KPI Types ---------------

export interface KPIValue {
  value: number;
  unit: string;
  trend: TrendDirection;
  previousValue: number | null;
  period: string;
}
