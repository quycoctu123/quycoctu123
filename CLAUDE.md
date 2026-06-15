# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

This is an **integrated factory management platform** for an electrical cable manufacturing plant, built to **WCM (World Class Manufacturing)** standards. The system owner is a non-technical operations manager; all technical decisions must be made by the AI assistant based on best practices.

**Business goal:** Replace manual/paper-based factory operations with a unified digital platform covering production, maintenance, safety, HR, and quality — operated at world-class level.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| Backend API | Next.js API Routes (or tRPC for type-safety) |
| Database | PostgreSQL via Prisma ORM |
| Authentication | NextAuth.js (role-based) |
| Charts/Dashboards | Recharts or Chart.js |
| Deployment | Docker + docker-compose |
| Package Manager | pnpm |

**Key principle:** All modules share a single monorepo. Never duplicate business logic — shared types, utilities, and DB schemas live in `packages/shared`.

---

## Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run all tests
pnpm test

# Run a single test file
pnpm test -- <path-to-test>

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Database migrations
pnpm db:migrate
pnpm db:seed

# Build for production
pnpm build
```

---

## Monorepo Structure

```
/
├── apps/
│   └── web/                  # Main Next.js application
│       ├── app/              # App Router pages & layouts
│       │   ├── (auth)/       # Login, permissions
│       │   ├── dashboard/    # Executive overview
│       │   ├── mes/          # MES module
│       │   ├── cmms/         # CMMS module
│       │   ├── hse/          # HSE module
│       │   ├── hrm/          # HRM module
│       │   ├── iso/          # ISO/Quality module
│       │   └── api/          # API routes
│       └── components/       # App-specific components
├── packages/
│   ├── shared/               # Shared types, constants, utils
│   ├── db/                   # Prisma schema + migrations
│   └── ui/                   # Shared UI components
└── docker/                   # Docker configs for production
```

---

## Modules & WCM Alignment

Each module maps to a WCM pillar. Always keep WCM KPIs visible and actionable.

### 1. MES — Manufacturing Execution System
**WCM Pillars:** Cost Deployment, Focused Improvement, Quality Control

Core features:
- Production order tracking (work orders from plan → execution → completion)
- Real-time OEE dashboard (Availability × Performance × Quality)
- Shift production reports with variance analysis
- Product genealogy / traceability (batch → cable reel → raw material)
- Scrap and rework recording with root cause categorization (Pareto-ready)
- Line balancing and cycle time tracking

Key data model entities: `ProductionOrder`, `WorkCenter`, `Shift`, `ProductionLog`, `QualityDefect`

KPIs to always display: OEE (%), Scrap Rate (%), Production vs. Plan (%)

### 2. CMMS — Computerized Maintenance Management System
**WCM Pillars:** Professional Maintenance, Autonomous Activities, Early Equipment Management

Core features:
- Asset registry with hierarchy (Plant → Area → Machine → Component)
- Preventive Maintenance (PM) scheduling by calendar or meter-based triggers
- Corrective work order management with priority levels (Critical / High / Medium / Low)
- Spare parts inventory with reorder point alerts
- Maintenance history and cost tracking per asset
- MTBF / MTTR calculation per machine
- Autonomous Maintenance (AM) checklist — operator daily/weekly inspections

Key data model entities: `Asset`, `MaintenanceOrder`, `SparePart`, `PMSchedule`, `MaintenanceLog`

KPIs: MTBF (hrs), MTTR (hrs), PM Compliance (%), Spare Parts Availability (%)

### 3. HSE — Health, Safety & Environment
**WCM Pillars:** Safety, Environment

Core features:
- Incident & near-miss reporting (with photo upload)
- Risk assessment matrix (5×5 severity × likelihood)
- Corrective & Preventive Action (CAPA) tracking
- Safety observation tours (digitized walk-around checklists)
- Chemical/hazardous material register (SDS linked)
- Environmental monitoring log (wastewater, emissions)
- Safety training records and certification expiry alerts
- Permit to Work (PTW) digital workflow

Key data model entities: `Incident`, `RiskAssessment`, `CAPA`, `HazardousItem`, `PTW`, `SafetyTraining`

KPIs: Lost Time Injury Frequency Rate (LTIFR), Near-Miss Rate, CAPA Closure Rate (%), PPE Compliance (%)

### 4. HRM — Human Resource Management
**WCM Pillars:** People Development

Core features:
- Employee master data (linked to WCM skill levels)
- Attendance & shift scheduling (3-shift rotating support)
- Skills matrix — competency levels per role per machine
- Training plan and training effectiveness tracking
- WCM pillar team membership and activity log
- Overtime management and labor cost analysis

Key data model entities: `Employee`, `Shift`, `Attendance`, `SkillMatrix`, `TrainingRecord`

KPIs: Training Hours per Employee, Skills Coverage (%), Absenteeism Rate (%)

### 5. ISO / Quality Management
**WCM Pillars:** Quality Control

Core features:
- Document control system (ISO 9001 / 14001 / 45001 compliant)
  - Document versioning with approval workflow
  - Document access by role
- Internal audit scheduling and checklist management
- Non-conformance Report (NCR) → CAPA workflow
- Customer complaint tracking
- Calibration management for measuring instruments
- Management review meeting minutes and action tracking

Key data model entities: `Document`, `DocumentRevision`, `Audit`, `NCR`, `CustomerComplaint`, `CalibrationRecord`

KPIs: Audit Findings Closed (%), NCR Resolution Time (days), Document Revision On-Time (%)

---

## Architecture Conventions

### Database
- All tables have: `id` (UUID), `createdAt`, `updatedAt`, `createdBy`, `isDeleted` (soft delete)
- Foreign keys always reference the module they belong to — no cross-module direct FK constraints; use IDs and resolve in application layer
- Enum values are stored as strings, defined in `packages/shared/constants.ts`

### API Design
- All API routes follow REST: `GET /api/[module]/[resource]`, `POST`, `PATCH`, `DELETE`
- Responses always use shape: `{ data, error, meta }` where `meta` includes pagination info
- Validation with Zod on all inputs — schemas live alongside the route in a `schema.ts` file
- Never expose internal DB IDs to the client without authorization checks

### Role-Based Access Control (RBAC)
Roles: `SUPER_ADMIN` | `PLANT_MANAGER` | `MODULE_MANAGER` | `SUPERVISOR` | `OPERATOR` | `VIEWER`

Each module route must check permissions using a shared `requirePermission(role, action, resource)` middleware. Permission matrix is defined in `packages/shared/permissions.ts`.

### UI/UX Rules
- Every module must have a **KPI summary card row** at the top of its main page
- All data tables must support: search, filter by date range, export to Excel
- Forms must show inline validation errors (never alert dialogs)
- Critical actions (delete, approve, close work order) require a confirmation dialog
- All timestamps display in Vietnam timezone (`Asia/Ho_Chi_Minh`)
- Language: Vietnamese UI labels, English code identifiers

### WCM-Specific Rules
- Every defect, incident, or non-conformance record must have a mandatory `rootCauseCategory` field using the **4M classification**: Man, Machine, Material, Method
- All KPI dashboards must show trend direction (▲▼) vs. prior period
- CAPA records must track `plannedDate` vs. `actualClosureDate` to compute On-Time Closure Rate

---

## Data Flow Between Modules

```
HRM (employee/shift data)
    ↓
MES (who ran which machine, which shift)
    ↓ quality defects → ISO/NCR
    ↓ machine breakdown → CMMS work order
    ↓ safety incident → HSE incident report
CMMS (PM schedule) → HRM (maintenance technician skills required)
HSE (PTW required) → CMMS (work order cannot start without active PTW)
ISO (documents) → all modules (SOPs linked to work orders, checklists, risk assessments)
```

---

## Development Priorities

When building features, follow this order:
1. Database schema + seed data first
2. API routes with validation
3. UI page with KPI cards
4. Data table with filters
5. Create/Edit forms
6. Export functionality last

Always build the **happy path end-to-end** before adding edge cases or error states.

---

## Key Business Rules

- A production order cannot be closed if it has open quality defects
- A maintenance work order on a **Critical** asset blocks production start on that work center
- A PTW must be approved by HSE Manager before any hot work or confined space entry
- Employee cannot be scheduled on a machine they have not been certified for (Skill Level ≥ 2)
- Documents in ISO module require minimum 2 approvers before becoming `ACTIVE`
- All KPI calculations must match the WCM formula definitions in `packages/shared/kpi-formulas.ts`
