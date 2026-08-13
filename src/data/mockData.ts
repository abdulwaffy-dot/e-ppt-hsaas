import { ProcurementApplication, LoginRecord } from '../types';

export const INITIAL_APPLICATIONS: ProcurementApplication[] = [];

export const INITIAL_LOGIN_LOGS: LoginRecord[] = [
  {
    id: 'log-001',
    name: 'Abdul Waffy',
    email: 'abdulwaffy@upm.edu.my',
    department: 'Information Technology Department',
    loginTimestamp: '2026-07-28T23:17:50Z',
    ipAddress: '10.221.113.18',
    deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: 'log-002',
    name: 'Dr. Farhan Azman',
    email: 'farhan.azman@upm.edu.my',
    department: 'Radiology Department',
    loginTimestamp: '2026-07-28T14:32:00Z',
    ipAddress: '10.221.100.42',
    deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: 'log-003',
    name: 'Perolehan_hsaas',
    email: 'perolehan_hsaas@upm.edu.my',
    department: 'Finance Department',
    loginTimestamp: '2026-07-28T10:15:00Z',
    ipAddress: '10.221.10.5',
    deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
];

export const INITIAL_ANNUAL_BUDGETS: Record<number, number> = {
  2024: 1800000,
  2025: 2200000,
  2026: 2500000,
  2027: 3000000,
  2028: 3500000,
  2029: 4000000,
  2030: 5000000,
};
