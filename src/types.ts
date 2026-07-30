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
  estimatedCost: number; // in RM
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
