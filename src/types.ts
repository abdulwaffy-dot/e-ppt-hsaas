/**
 * HSAAS Procurement Management System (Sistem e-PPT HSAAS)
 * Type Definitions & Constants
 */

export interface UserProfile {
  name: string;
  email: string;
  department: string;
  loginDate: string; // ISO date string or formatted date
  updateDate: string; // Last updated timestamp
  role: 'applicant' | 'hq';
  staffId?: string;
}

export interface LoginRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  loginTimestamp: string;
  ipAddress: string;
  deviceInfo: string;
}

export type DeletionReasonCategory =
  | 'unnecessary'
  | 'invalid'
  | 'duplicate'
  | 'cancelled'
  | 'other';

export type AuditActionType =
  | 'DELETE_PPT_RECORD'
  | 'BATCH_DELETE_PPT_RECORDS'
  | 'ADJUST_REQUESTED_AMOUNT';

export interface AmountAdjustment {
  id: string;
  originalAmount: number;
  adjustedAmount: number;
  differenceAmount: number; // adjustedAmount - originalAmount
  percentageChange: number; // percentage change relative to original
  direction: 'increased' | 'reduced' | 'unchanged';
  adjustmentDate: string; // ISO format
  dateFormatted: string; // e.g. "16 Oct 2026"
  timeFormatted: string; // e.g. "11:30:00 AM"
  adjustedBy: string; // HQ user name
  adjustedByEmail: string; // HQ user email
  adjustedByRole?: string;
  justification: string;
}

export interface DeletionAuditLog {
  id: string;
  action: AuditActionType;
  actionLabel: string;
  timestamp: string; // ISO format
  dateFormatted: string; // e.g. "10 Sep 2026"
  timeFormatted: string; // e.g. "08:45:12 AM"
  hqUser: {
    name: string;
    email: string;
    department: string;
    role: string;
    staffId?: string;
  };
  applicationRef: {
    id: string;
    referenceNo: string;
    title: string;
    department: string;
    estimatedCost: number;
    originalCost?: number;
    adjustedCost?: number;
    differenceCost?: number;
    year: number;
    serviceType?: string;
    status: string;
    applicantName?: string;
    applicantEmail?: string;
  };
  reasonCategory?: DeletionReasonCategory;
  reason: string;
  ipAddress?: string;
  deviceInfo?: string;
  adjustmentDetail?: {
    originalAmount: number;
    adjustedAmount: number;
    differenceAmount: number;
    percentageChange: number;
    direction: 'increased' | 'reduced' | 'unchanged';
  };
}

export type AllocationType = 'Operating 14005';

export type ProcurementMethod = 'SH' | 'T' | 'PT';

export interface ProcurementMethodInfo {
  code: ProcurementMethod;
  name: string;
  description: string;
}

export const PROCUREMENT_METHODS: Record<ProcurementMethod, ProcurementMethodInfo> = {
  SH: { code: 'SH', name: 'Quotation (SH)', description: 'Sebut Harga / Quotation' },
  T: { code: 'T', name: 'Tender (T)', description: 'Tender Awam / Public Tender' },
  PT: { code: 'PT', name: 'Direct Purchase (PT)', description: 'Pembelian Terus / Direct Purchase' },
};

export type ServiceType = 'Service' | 'Bekalan' | 'Kerja' | 'Aset' | 'Supply' | 'Work' | 'Asset';

export interface ExpenditureCategory {
  code: string;
  name: string;
  label: string;
}

export const EXPENDITURE_CATEGORIES: ExpenditureCategory[] = [
  { code: '10000', name: 'Emoluments', label: '10000: Emoluments' },
  { code: '21000', name: 'Travel & Living Expenses', label: '21000: Travel & Living Expenses' },
  { code: '22000', name: 'Transportation of Goods', label: '22000: Transportation of Goods' },
  { code: '23000', name: 'Communication & Utilities', label: '23000: Communication & Utilities' },
  { code: '24000', name: 'Rental', label: '24000: Rental' },
  { code: '25000', name: 'Food & Beverages', label: '25000: Food & Beverages' },
  { code: '26000', name: 'Raw Materials & Spare Parts', label: '26000: Raw Materials & Spare Parts' },
  { code: '27000', name: 'Other Supplies & Materials', label: '27000: Other Supplies & Materials' },
  { code: '28000', name: 'Minor Maintenance & Repairs', label: '28000: Minor Maintenance & Repairs' },
  { code: '29000', name: 'Services', label: '29000: Services' },
  { code: '50000', name: 'Other Expenses', label: '50000: Other Expenses' },
  { code: '300000', name: 'Assets', label: '300000: Assets' },
];

export const UPM_DEPARTMENTS: string[] = [
  'Finance Department : Procurement',
  'Finance Department',
  'Human Resource Department',
  'Information Technology Department',
  'Engineering and Facilities Department',
  'Governance, Security and Quality Department',
  'Social and Community Services Department',
  'Nursing Management Department',
  'Family Medicine Department',
  'Medical Department',
  'Emergency Medicine Department',
  'Surgery Department',
  'Obstetrics and Gynecology Department',
  'Pediatrics Department',
  'Radiology Department',
  'Orthopedic Department',
  'Rehabilitation Medicine Department',
  'Psychiatry Department',
  'Neurology Department',
  'Otorhinolaryngology, Head and Neck Surgery (ENT) Department',
  'Ophthalmology Department',
  'Urology Department',
  'Anesthesiology and Intensive Care Department',
  'Pharmacy Department',
  'Pathology Department',
  'Dietetics Department',
  'Medical Microbiology Department',
  'Community Health Department',
];

export type ApplicationStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export type AnnualBudgets = Record<number, number>;

export interface HQDecision {
  status: 'Approved' | 'Rejected';
  justification: string;
  decidedBy: string;
  decidedByEmail: string;
  decisionDate: string;
}

export interface ProcurementApplication {
  id: string;
  referenceNo: string; // e.g. PPT-2026-IT-001
  title: string;
  year: number; // e.g. 2026
  allocationType: AllocationType;
  procurementMethod: ProcurementMethod;
  serviceType: ServiceType;
  expenditureCategoryCode: string;
  expenditureCategoryName: string;
  expectedInvitationMonth: string; // e.g., "October"
  expectedInvitationYear: number; // e.g., 2026
  estimatedCost: number; // in RM (effective / current amount used for budgets and allocations)
  originalEstimatedCost?: number; // Original requested amount submitted by applicant (in RM)
  isAmountAdjusted?: boolean; // True if amount has been modified by HQ Review
  adjustedAmount?: number; // Current revised / adjusted amount set by HQ Review
  adjustmentDifference?: number; // adjustedAmount - originalEstimatedCost
  adjustmentPercentage?: number; // percentage change relative to original requested amount
  adjustmentDirection?: 'increased' | 'reduced' | 'unchanged';
  lastAdjustedAt?: string; // ISO date string of last adjustment
  lastAdjustedBy?: string; // Name of HQ reviewer
  amountAdjustments?: AmountAdjustment[]; // Complete immutable audit trail of adjustments
  remarksJustification: string;
  
  // Department & Applicant Metadata
  department: string;
  applicantName: string;
  applicantEmail: string;
  createdAt: string;
  updatedAt: string;

  // Status & HQ Review
  status: ApplicationStatus;
  hqDecision?: HQDecision;
}
