// lib/mockDb.ts

export type Role = 'ADMIN' | 'HR' | 'PAYROLL_OFFICER' | 'STAFF';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'PROBATIONARY';
export type LeaveType = 'VACATION' | 'SICK' | 'EMERGENCY' | 'PARENTHOOD' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PayrollStatus = 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
export type PayslipStatus = 'DRAFT' | 'ISSUED' | 'PAID';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface EmployeeProfile {
  id: string;
  userId?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  personalEmail: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  jobTitle: string;
  department: string;
  dateHired: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  baseSalary: number; // Monthly rate
  taxIdNumber: string; // TIN
  socialSecurityNo: string; // SSS
  healthInsuranceNo: string; // PhilHealth
  housingFundNo: string; // Pag-IBIG
  bankName: string;
  bankAccountNumber: string;
  fingerprintId?: number; // Add optional mapping for IoT biometric sensor
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  allocated: number;
  used: number;
  pending: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedById?: string;
  approvedByName?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface PayrollRun {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  paymentDate: string;
  status: PayrollStatus;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  createdAt: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeIdCode: string; // EMP-XXXX
  jobTitle: string;
  department: string;
  baseSalary: number;
  overtimePay: number;
  allowances: { name: string; amount: number }[];
  grossPay: number;
  taxWithheld: number;
  statutoryDeductions: { name: string; amount: number }[];
  otherDeductions: { name: string; amount: number }[];
  totalDeductions: number;
  netPay: number;
  status: PayslipStatus;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: Role;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'HALFDAY';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeIdCode: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM AM/PM
  clockOut?: string; // HH:MM AM/PM
  status: AttendanceStatus;
  overtimeMinutes?: number;
  ipAddress?: string;
  notes?: string;
}

// Seed Data
const INITIAL_USERS: User[] = [
  { id: 'u-1', email: 'admin@hr.com', role: 'ADMIN', name: 'Alexander Wright' },
  { id: 'u-2', email: 'hr@hr.com', role: 'HR', name: 'Eleanor Vance' },
  { id: 'u-3', email: 'payroll@hr.com', role: 'PAYROLL_OFFICER', name: 'Marcus Sterling' },
  { id: 'u-4', email: 'jane@hr.com', role: 'STAFF', name: 'Jane Doe' },
  { id: 'u-5', email: 'john@hr.com', role: 'STAFF', name: 'John Smith' },
  { id: 'u-6', email: 'christina@hr.com', role: 'STAFF', name: 'Christina Mercado' },
  { id: 'u-7', email: 'dominic@hr.com', role: 'STAFF', name: 'Dominic Alvarez' },
  { id: 'u-8', email: 'sofia@hr.com', role: 'STAFF', name: 'Sofia Rodriguez' },
];

const INITIAL_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'emp-1',
    userId: 'u-4',
    employeeId: 'EMP-2026-0001',
    firstName: 'Jane',
    lastName: 'Doe',
    middleName: 'Marie',
    personalEmail: 'jane@hr.com',
    phone: '+63 917 123 4567',
    dateOfBirth: '1992-04-15',
    gender: 'Female',
    address: 'Makati City, Metro Manila',
    jobTitle: 'Senior UX Designer',
    department: 'Product & Design',
    dateHired: '2022-03-01',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 78000,
    taxIdNumber: 'TIN-342-901-223',
    socialSecurityNo: 'SSS-90-234293-2',
    healthInsuranceNo: 'PH-4491-0021-3',
    housingFundNo: 'PI-9021-9988-2',
    bankName: 'Apex Security Bank',
    bankAccountNumber: '9920192341'
  },
  {
    id: 'emp-2',
    userId: 'u-5',
    employeeId: 'EMP-2026-0002',
    firstName: 'John',
    lastName: 'Smith',
    middleName: 'David',
    personalEmail: 'john@hr.com',
    phone: '+63 918 234 5678',
    dateOfBirth: '1989-11-23',
    gender: 'Male',
    address: 'Quezon City, Metro Manila',
    jobTitle: 'Lead Software Engineer',
    department: 'Engineering',
    dateHired: '2021-06-15',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 95000,
    taxIdNumber: 'TIN-109-887-212',
    socialSecurityNo: 'SSS-88-112233-4',
    healthInsuranceNo: 'PH-1122-3344-5',
    housingFundNo: 'PI-8877-6655-4',
    bankName: 'Global Trust Finance',
    bankAccountNumber: '1102938472'
  },
  {
    id: 'emp-3',
    employeeId: 'EMP-2026-0003',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    middleName: 'Ann',
    personalEmail: 'sarah.j@external.com',
    phone: '+63 919 345 6789',
    dateOfBirth: '1995-08-05',
    gender: 'Female',
    address: 'Pasig City, Metro Manila',
    jobTitle: 'Content Specialist',
    department: 'Marketing',
    dateHired: '2024-01-10',
    employmentStatus: 'ACTIVE',
    employmentType: 'CONTRACTOR',
    baseSalary: 48000,
    taxIdNumber: 'TIN-987-654-321',
    socialSecurityNo: 'SSS-55-667788-9',
    healthInsuranceNo: 'PH-5566-7788-9',
    housingFundNo: 'PI-5544-3322-1',
    bankName: 'Pioneer Savings Bank',
    bankAccountNumber: '8877665544'
  },
  {
    id: 'emp-4',
    userId: 'u-1',
    employeeId: 'EMP-2026-0004',
    firstName: 'Alexander',
    lastName: 'Wright',
    middleName: 'James',
    personalEmail: 'admin@hr.com',
    phone: '+63 917 999 8888',
    dateOfBirth: '1985-02-10',
    gender: 'Male',
    address: 'BGC, Taguig City',
    jobTitle: 'System Administrator',
    department: 'IT & Security',
    dateHired: '2020-01-15',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 120000,
    taxIdNumber: 'TIN-445-123-998',
    socialSecurityNo: 'SSS-11-222333-4',
    healthInsuranceNo: 'PH-3333-4444-5',
    housingFundNo: 'PI-1111-2222-3',
    bankName: 'Apex Security Bank',
    bankAccountNumber: '1234567890'
  },
  {
    id: 'emp-5',
    userId: 'u-2',
    employeeId: 'EMP-2026-0005',
    firstName: 'Eleanor',
    lastName: 'Vance',
    middleName: 'Grace',
    personalEmail: 'hr@hr.com',
    phone: '+63 917 555 4444',
    dateOfBirth: '1987-07-19',
    gender: 'Female',
    address: 'Alabang, Muntinlupa City',
    jobTitle: 'HR Director',
    department: 'Human Resources',
    dateHired: '2021-08-01',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 85000,
    taxIdNumber: 'TIN-554-998-332',
    socialSecurityNo: 'SSS-22-333444-5',
    healthInsuranceNo: 'PH-5555-6666-7',
    housingFundNo: 'PI-2222-3333-4',
    bankName: 'Apex Security Bank',
    bankAccountNumber: '0987654321'
  },
  {
    id: 'emp-6',
    userId: 'u-3',
    employeeId: 'EMP-2026-0006',
    firstName: 'Marcus',
    lastName: 'Sterling',
    middleName: 'Thomas',
    personalEmail: 'payroll@hr.com',
    phone: '+63 918 777 6666',
    dateOfBirth: '1990-10-05',
    gender: 'Male',
    address: 'Mandaluyong City, Metro Manila',
    jobTitle: 'Payroll Supervisor',
    department: 'Finance',
    dateHired: '2023-04-10',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 80000,
    taxIdNumber: 'TIN-776-889-112',
    socialSecurityNo: 'SSS-33-444555-6',
    healthInsuranceNo: 'PH-7777-8888-9',
    housingFundNo: 'PI-3333-4444-5',
    bankName: 'Global Trust Finance',
    bankAccountNumber: '5566778899'
  },
  {
    id: 'emp-7',
    userId: 'u-6',
    employeeId: 'EMP-2026-0007',
    firstName: 'Christina',
    lastName: 'Mercado',
    middleName: 'Santos',
    personalEmail: 'christina@hr.com',
    phone: '+63 919 444 3333',
    dateOfBirth: '1993-06-25',
    gender: 'Female',
    address: 'Ortigas, Pasig City',
    jobTitle: 'Senior Marketing Manager',
    department: 'Marketing',
    dateHired: '2023-01-15',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 85000,
    taxIdNumber: 'TIN-221-445-889',
    socialSecurityNo: 'SSS-44-555666-7',
    healthInsuranceNo: 'PH-4444-5555-6',
    housingFundNo: 'PI-4444-5555-6',
    bankName: 'Global Trust Finance',
    bankAccountNumber: '2233445566'
  },
  {
    id: 'emp-8',
    userId: 'u-7',
    employeeId: 'EMP-2026-0008',
    firstName: 'Dominic',
    lastName: 'Alvarez',
    middleName: 'Reyes',
    personalEmail: 'dominic@hr.com',
    phone: '+63 916 222 1111',
    dateOfBirth: '1991-09-12',
    gender: 'Male',
    address: 'Paranaque City, Metro Manila',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    dateHired: '2024-05-20',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 90000,
    taxIdNumber: 'TIN-332-556-990',
    socialSecurityNo: 'SSS-55-666777-8',
    healthInsuranceNo: 'PH-6666-7777-8',
    housingFundNo: 'PI-5555-6666-7',
    bankName: 'Apex Security Bank',
    bankAccountNumber: '7788990011'
  },
  {
    id: 'emp-9',
    userId: 'u-8',
    employeeId: 'EMP-2026-0009',
    firstName: 'Sofia',
    lastName: 'Rodriguez',
    middleName: 'Cruz',
    personalEmail: 'sofia@hr.com',
    phone: '+63 915 888 7777',
    dateOfBirth: '1996-03-01',
    gender: 'Female',
    address: 'Manila City, Metro Manila',
    jobTitle: 'HR Specialist',
    department: 'Human Resources',
    dateHired: '2025-03-01',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 55000,
    taxIdNumber: 'TIN-112-334-556',
    socialSecurityNo: 'SSS-66-777888-9',
    healthInsuranceNo: 'PH-8888-9999-0',
    housingFundNo: 'PI-6666-7777-8',
    bankName: 'Pioneer Savings Bank',
    bankAccountNumber: '3344556677'
  }
];

// Assign fingerprintId to seed employees (Jane Doe = 1, John Smith = 2, etc.)
INITIAL_EMPLOYEES.forEach((emp, index) => {
  emp.fingerprintId = index + 1;
});

const INITIAL_LEAVE_BALANCES: LeaveBalance[] = [
  { id: 'lb-1', employeeId: 'emp-1', leaveType: 'VACATION', allocated: 15, used: 3, pending: 1 },
  { id: 'lb-2', employeeId: 'emp-1', leaveType: 'SICK', allocated: 10, used: 2, pending: 0 },
  { id: 'lb-3', employeeId: 'emp-1', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 },
  
  { id: 'lb-4', employeeId: 'emp-2', leaveType: 'VACATION', allocated: 15, used: 5, pending: 0 },
  { id: 'lb-5', employeeId: 'emp-2', leaveType: 'SICK', allocated: 10, used: 1, pending: 2 },
  { id: 'lb-6', employeeId: 'emp-2', leaveType: 'EMERGENCY', allocated: 5, used: 1, pending: 0 },

  { id: 'lb-7', employeeId: 'emp-3', leaveType: 'VACATION', allocated: 10, used: 0, pending: 0 },
  { id: 'lb-8', employeeId: 'emp-3', leaveType: 'SICK', allocated: 5, used: 0, pending: 0 },
  { id: 'lb-9', employeeId: 'emp-3', leaveType: 'EMERGENCY', allocated: 2, used: 0, pending: 0 },

  { id: 'lb-10', employeeId: 'emp-4', leaveType: 'VACATION', allocated: 20, used: 2, pending: 0 },
  { id: 'lb-11', employeeId: 'emp-4', leaveType: 'SICK', allocated: 10, used: 1, pending: 0 },
  { id: 'lb-12', employeeId: 'emp-4', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 },

  { id: 'lb-13', employeeId: 'emp-5', leaveType: 'VACATION', allocated: 15, used: 4, pending: 1 },
  { id: 'lb-14', employeeId: 'emp-5', leaveType: 'SICK', allocated: 10, used: 0, pending: 0 },
  { id: 'lb-15', employeeId: 'emp-5', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 },

  { id: 'lb-16', employeeId: 'emp-6', leaveType: 'VACATION', allocated: 15, used: 1, pending: 0 },
  { id: 'lb-17', employeeId: 'emp-6', leaveType: 'SICK', allocated: 10, used: 2, pending: 0 },
  { id: 'lb-18', employeeId: 'emp-6', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 },

  { id: 'lb-19', employeeId: 'emp-7', leaveType: 'VACATION', allocated: 15, used: 2, pending: 0 },
  { id: 'lb-20', employeeId: 'emp-7', leaveType: 'SICK', allocated: 10, used: 1, pending: 0 },
  { id: 'lb-21', employeeId: 'emp-7', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 },

  { id: 'lb-22', employeeId: 'emp-8', leaveType: 'VACATION', allocated: 15, used: 0, pending: 0 },
  { id: 'lb-23', employeeId: 'emp-8', leaveType: 'SICK', allocated: 10, used: 0, pending: 0 },
  { id: 'lb-24', employeeId: 'emp-8', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 },

  { id: 'lb-25', employeeId: 'emp-9', leaveType: 'VACATION', allocated: 15, used: 1, pending: 0 },
  { id: 'lb-26', employeeId: 'emp-9', leaveType: 'SICK', allocated: 10, used: 0, pending: 0 },
  { id: 'lb-27', employeeId: 'emp-9', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 }
];

// Helper variables for generating 800 mock users/employees
const FIRST_NAMES = ['Juan', 'Jose', 'Maria', 'Ana', 'Pedro', 'Manuel', 'Francis', 'Mark', 'Paul', 'Ramon', 'Christina', 'Sofia', 'Dominic', 'Patricia', 'Angela', 'Gabriel', 'Michael', 'David', 'Joseph', 'Teresa'];
const LAST_NAMES = ['Cruz', 'Santos', 'Reyes', 'Mercado', 'Alvarez', 'Rodriguez', 'De Leon', 'Garcia', 'Bautista', 'Del Rosario', 'Villanueva', 'Ramos', 'Aquino', 'Castro', 'Gonzales', 'Torres', 'Pascual', 'Soriano', 'Santiago', 'Corpuz'];
const DEPARTMENTS = ['Engineering', 'Product & Design', 'Marketing', 'Finance', 'Human Resources', 'IT & Security'];
const ROLES: Record<string, string[]> = {
  'Engineering': ['Software Engineer', 'QA Engineer', 'DevOps Engineer', 'Lead Engineer', 'Frontend Developer', 'Backend Developer'],
  'Product & Design': ['UX Designer', 'UI Designer', 'Product Manager', 'UX Researcher'],
  'Marketing': ['Content Specialist', 'Marketing Associate', 'SEO Specialist', 'Creative Lead'],
  'Finance': ['Accountant', 'Finance Associate', 'Payroll Analyst'],
  'Human Resources': ['HR Generalist', 'HR Specialist', 'Recruiting Associate'],
  'IT & Security': ['IT Support', 'Security Analyst', 'Network Administrator']
};
const BANKS = ['Apex Security Bank', 'Global Trust Finance', 'Pioneer Savings Bank'];
const CITIES = ['Makati City', 'Quezon City', 'Pasig City', 'Taguig City', 'Manila City', 'Pasay City', 'Mandaluyong City'];

// Generate 791 more employees to reach 800 total staff members
for (let i = 10; i <= 800; i++) {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(i + 3) % LAST_NAMES.length];
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const titles = ROLES[dept];
  const title = titles[i % titles.length];
  
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@hr.com`;
  const empId = `emp-${i}`;
  const userId = `u-${i}`;
  const employeeIdCode = `EMP-2026-${String(i).padStart(4, '0')}`;
  
  INITIAL_USERS.push({
    id: userId,
    email,
    role: 'STAFF',
    name: `${firstName} ${lastName}`
  });
  
  const baseSalary = 25000 + (i % 25) * 5000; // range ₱25k to ₱145k
  
  INITIAL_EMPLOYEES.push({
    id: empId,
    userId,
    employeeId: employeeIdCode,
    firstName,
    lastName,
    middleName: 'M',
    personalEmail: email,
    phone: `+63 917 ${String(1000000 + i).substring(1)}`,
    dateOfBirth: `19${80 + (i % 22)}-05-15`,
    gender: i % 2 === 0 ? 'Female' : 'Male',
    address: `${CITIES[i % CITIES.length]}, Metro Manila`,
    jobTitle: title,
    department: dept,
    dateHired: `202${0 + (i % 6)}-03-01`,
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary,
    taxIdNumber: `TIN-100-200-${String(i).padStart(3, '0')}`,
    socialSecurityNo: `SSS-22-333444-${i % 10}`,
    healthInsuranceNo: `PH-5555-6666-${i % 10}`,
    housingFundNo: `PI-2222-3333-${i % 10}`,
    bankName: BANKS[i % BANKS.length],
    bankAccountNumber: `1000000000${i}`.substring(String(i).length)
  });
  
  INITIAL_LEAVE_BALANCES.push(
    { id: `lb-${i}-1`, employeeId: empId, leaveType: 'VACATION', allocated: 15, used: i % 5, pending: 0 },
    { id: `lb-${i}-2`, employeeId: empId, leaveType: 'SICK', allocated: 10, used: i % 3, pending: 0 },
    { id: `lb-${i}-3`, employeeId: empId, leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 }
  );
}

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr-1',
    employeeId: 'emp-1',
    employeeName: 'Jane Doe',
    leaveType: 'VACATION',
    startDate: '2026-06-22',
    endDate: '2026-06-25',
    reason: 'Family summer vacation trip',
    status: 'PENDING',
    createdAt: '2026-06-10T09:30:00Z'
  },
  {
    id: 'lr-2',
    employeeId: 'emp-2',
    employeeName: 'John Smith',
    leaveType: 'SICK',
    startDate: '2026-06-12',
    endDate: '2026-06-13',
    reason: 'Dental surgery and recovery',
    status: 'PENDING',
    createdAt: '2026-06-11T14:15:00Z'
  },
  {
    id: 'lr-3',
    employeeId: 'emp-1',
    employeeName: 'Jane Doe',
    leaveType: 'VACATION',
    startDate: '2026-05-10',
    endDate: '2026-05-12',
    reason: 'Long weekend out of town',
    status: 'APPROVED',
    approvedById: 'emp-5',
    approvedByName: 'Eleanor Vance',
    createdAt: '2026-05-02T10:00:00Z'
  },
  {
    id: 'lr-4',
    employeeId: 'emp-5',
    employeeName: 'Eleanor Vance',
    leaveType: 'VACATION',
    startDate: '2026-06-18',
    endDate: '2026-06-19',
    reason: 'Personal errands and rest',
    status: 'PENDING',
    createdAt: '2026-06-11T10:00:00Z'
  },
  {
    id: 'lr-5',
    employeeId: 'emp-6',
    employeeName: 'Marcus Sterling',
    leaveType: 'SICK',
    startDate: '2026-04-12',
    endDate: '2026-04-14',
    reason: 'High fever and flu recovery',
    status: 'APPROVED',
    approvedById: 'emp-5',
    approvedByName: 'Eleanor Vance',
    createdAt: '2026-04-11T08:30:00Z'
  },
  {
    id: 'lr-6',
    employeeId: 'emp-7',
    employeeName: 'Christina Mercado',
    leaveType: 'VACATION',
    startDate: '2026-03-15',
    endDate: '2026-03-20',
    reason: 'Out of country vacation',
    status: 'APPROVED',
    approvedById: 'emp-5',
    approvedByName: 'Eleanor Vance',
    createdAt: '2026-03-01T09:00:00Z'
  },
  {
    id: 'lr-7',
    employeeId: 'emp-3',
    employeeName: 'Sarah Jenkins',
    leaveType: 'VACATION',
    startDate: '2026-05-01',
    endDate: '2026-05-05',
    reason: 'Family reunion',
    status: 'REJECTED',
    approvedById: 'emp-5',
    approvedByName: 'Eleanor Vance',
    rejectionReason: 'Peak marketing campaign week. Please reschedule.',
    createdAt: '2026-04-15T10:00:00Z'
  }
];

const INITIAL_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'pr-1',
    name: 'May 2026 Monthly Payroll',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    paymentDate: '2026-05-30',
    status: 'PAID',
    totalGrossPay: 0,
    totalNetPay: 0,
    totalDeductions: 0,
    createdAt: '2026-05-25T08:00:00Z'
  },
  {
    id: 'pr-2',
    name: 'April 2026 Monthly Payroll',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    paymentDate: '2026-04-30',
    status: 'PAID',
    totalGrossPay: 0,
    totalNetPay: 0,
    totalDeductions: 0,
    createdAt: '2026-04-25T08:00:00Z'
  },
  {
    id: 'pr-3',
    name: 'March 2026 Monthly Payroll',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    paymentDate: '2026-03-30',
    status: 'PAID',
    totalGrossPay: 0,
    totalNetPay: 0,
    totalDeductions: 0,
    createdAt: '2026-03-25T08:00:00Z'
  },
  {
    id: 'pr-4',
    name: 'February 2026 Monthly Payroll',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    paymentDate: '2026-02-27',
    status: 'PAID',
    totalGrossPay: 0,
    totalNetPay: 0,
    totalDeductions: 0,
    createdAt: '2026-02-22T08:00:00Z'
  },
  {
    id: 'pr-5',
    name: 'January 2026 Monthly Payroll',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    paymentDate: '2026-01-30',
    status: 'PAID',
    totalGrossPay: 0,
    totalNetPay: 0,
    totalDeductions: 0,
    createdAt: '2026-01-25T08:00:00Z'
  }
];

// Generate payslips dynamically across all 5 historical cycles
const INITIAL_PAYSLIPS: Payslip[] = [];

INITIAL_PAYROLL_RUNS.forEach((run) => {
  let runGross = 0;
  let runDeductions = 0;
  let runNet = 0;

  INITIAL_EMPLOYEES.forEach((emp) => {
    // Generate historical payslips for the main employees (headcount <= 9) for all 5 months.
    // For other mock employees (emp-10 to emp-800), only generate a payslip for May (pr-1).
    // This scales the current payroll, while preventing LocalStorage bloat and keeping it ultra-fast.
    const isMainEmployee = parseInt(emp.id.replace('emp-', '')) <= 9;
    if (run.id !== 'pr-1' && !isMainEmployee) {
      return;
    }

    const base = emp.baseSalary;
    
    // Add small random overtime to some employees to make data look real
    const ot = (parseInt(emp.id.replace('emp-', '')) + run.id.charCodeAt(3)) % 3 === 0 
      ? (base > 80000 ? 3500 : 2000) 
      : 0;

    const allowances = [
      { name: 'Rice & Meal', amount: 1500 },
      { name: 'Communication', amount: 1000 }
    ];
    const allowanceSum = allowances.reduce((acc, a) => acc + a.amount, 0);
    const gross = base + ot + allowanceSum;

    // Progressive tax withheld
    let taxRate = 0.10;
    if (gross > 90000) taxRate = 0.22;
    else if (gross > 70000) taxRate = 0.18;
    else if (gross > 40000) taxRate = 0.12;
    const tax = Math.round(gross * taxRate);

    // Statutory deductions
    const sss = Math.round(base * 0.045);
    const philhealth = Math.round(base * 0.02);
    const pagibig = 200;
    const statutory = [
      { name: 'SSS Contribution', amount: sss },
      { name: 'PhilHealth Contribution', amount: philhealth },
      { name: 'Pag-IBIG Contribution', amount: pagibig }
    ];
    const statutorySum = sss + philhealth + pagibig;
    
    const other: { name: string; amount: number }[] = [];
    if (emp.id === 'emp-2') {
      other.push({ name: 'Gym Membership Co-pay', amount: 150 });
    }
    const otherSum = other.reduce((acc, o) => acc + o.amount, 0);

    const totalDeductions = tax + statutorySum + otherSum;
    const net = gross - totalDeductions;

    INITIAL_PAYSLIPS.push({
      id: `ps-${run.id.replace('pr-', '')}-${emp.id}`,
      payrollRunId: run.id,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeIdCode: emp.employeeId,
      jobTitle: emp.jobTitle,
      department: emp.department,
      baseSalary: base,
      overtimePay: ot,
      allowances,
      grossPay: gross,
      taxWithheld: tax,
      statutoryDeductions: statutory,
      otherDeductions: other,
      totalDeductions,
      netPay: net,
      status: 'PAID'
    });

    runGross += gross;
    runDeductions += totalDeductions;
    runNet += net;
  });

  run.totalGrossPay = runGross;
  run.totalDeductions = runDeductions;
  run.totalNetPay = runNet;
});

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'u-1',
    userName: 'Alexander Wright',
    userEmail: 'admin@hr.com',
    role: 'ADMIN',
    action: 'SYSTEM_INITIALIZATION',
    resource: 'System',
    details: 'Secure HR-SYSTEM initialized with seed profiles, leave matrices, and role parameters.',
    ipAddress: '192.168.1.1',
    createdAt: '2026-06-11T12:00:00Z'
  },
  {
    id: 'log-2',
    userId: 'u-3',
    userName: 'Marcus Sterling',
    userEmail: 'payroll@hr.com',
    role: 'PAYROLL_OFFICER',
    action: 'RUN_PAYROLL',
    resource: 'PayrollRun/pr-1',
    details: 'Approved and finalized May 2026 Monthly Payroll cycle for 800 active staff members.',
    ipAddress: '192.168.1.15',
    createdAt: '2026-05-30T17:00:00Z'
  },
  {
    id: 'log-3',
    userId: 'u-2',
    userName: 'Eleanor Vance',
    userEmail: 'hr@hr.com',
    role: 'HR',
    action: 'ONBOARD_NEW_EMPLOYEE',
    resource: 'EmployeeProfile/emp-9',
    details: 'Onboarded Sofia Rodriguez (EMP-2026-0009) as HR Specialist in Human Resources.',
    ipAddress: '192.168.1.12',
    createdAt: '2026-05-02T09:30:00Z'
  },
  {
    id: 'log-4',
    userId: 'u-2',
    userName: 'Eleanor Vance',
    userEmail: 'hr@hr.com',
    role: 'HR',
    action: 'APPROVE_LEAVE_REQUEST',
    resource: 'LeaveRequest/lr-3',
    details: 'Approved Vacation leave application for Jane Doe from 2026-05-10 to 2026-05-12.',
    ipAddress: '192.168.1.12',
    createdAt: '2026-05-02T10:00:00Z'
  },
  {
    id: 'log-5',
    userId: 'u-3',
    userName: 'Marcus Sterling',
    userEmail: 'payroll@hr.com',
    role: 'PAYROLL_OFFICER',
    action: 'RUN_PAYROLL',
    resource: 'PayrollRun/pr-2',
    details: 'Approved and finalized April 2026 Monthly Payroll cycle.',
    ipAddress: '192.168.1.15',
    createdAt: '2026-04-30T17:30:00Z'
  },
  {
    id: 'log-6',
    userId: 'u-2',
    userName: 'Eleanor Vance',
    userEmail: 'hr@hr.com',
    role: 'HR',
    action: 'APPROVE_LEAVE_REQUEST',
    resource: 'LeaveRequest/lr-5',
    details: 'Approved Sick leave application for Marcus Sterling from 2026-04-12 to 2026-04-14.',
    ipAddress: '192.168.1.12',
    createdAt: '2026-04-11T09:00:00Z'
  },
  {
    id: 'log-7',
    userId: 'u-3',
    userName: 'Marcus Sterling',
    userEmail: 'payroll@hr.com',
    role: 'PAYROLL_OFFICER',
    action: 'RUN_PAYROLL',
    resource: 'PayrollRun/pr-3',
    details: 'Approved and finalized March 2026 Monthly Payroll cycle.',
    ipAddress: '192.168.1.15',
    createdAt: '2026-03-30T18:00:00Z'
  }
];

const seedAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const daysToSeed = 7;
  const today = new Date();
  
  for (let d = 1; d <= daysToSeed; d++) {
    const logDate = new Date();
    logDate.setDate(today.getDate() - d);
    const dateStr = logDate.toISOString().split('T')[0];
    const dayOfWeek = logDate.getDay();
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    INITIAL_EMPLOYEES.forEach((emp) => {
      const empNum = parseInt(emp.id.replace('emp-', ''));
      if (empNum > 9) return; // Only seed the 9 core profiles to prevent local storage bloat
      
      const seedVal = (empNum + d) % 15;
      
      let clockIn = '08:45 AM';
      let clockOut = '06:00 PM';
      let status: AttendanceStatus = 'PRESENT';
      let ot = 0;
      let notes = '';
      
      if (seedVal === 0) {
        status = 'ABSENT';
        clockIn = '';
        clockOut = '';
        notes = 'No show';
      } else if (seedVal === 3 || seedVal === 7) {
        clockIn = '09:25 AM';
        status = 'LATE';
      } else if (seedVal === 11) {
        clockIn = '08:50 AM';
        clockOut = '01:00 PM';
        status = 'HALFDAY';
        notes = 'Half day morning shift';
      } else {
        if (seedVal % 4 === 0) {
          ot = 60; // 1 hour overtime
          clockOut = '07:00 PM';
        }
      }
      
      records.push({
        id: `att-${dateStr}-${emp.id}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeIdCode: emp.employeeId,
        department: emp.department,
        date: dateStr,
        clockIn,
        clockOut: clockOut || undefined,
        status,
        overtimeMinutes: ot || undefined,
        ipAddress: `192.168.1.${100 + empNum}`,
        notes: notes || undefined
      });
    });
  }
  return records;
};

const SEEDED_ATTENDANCE = seedAttendance();

// Seed a few entries for today (June 11, 2026) to simulate active clock logs
const todayStr = '2026-06-11';
SEEDED_ATTENDANCE.push(
  {
    id: `att-${todayStr}-emp-1`,
    employeeId: 'emp-1',
    employeeName: 'Jane Doe',
    employeeIdCode: 'EMP-2026-0001',
    department: 'Product & Design',
    date: todayStr,
    clockIn: '08:30 AM',
    status: 'PRESENT',
    ipAddress: '192.168.1.101'
  },
  {
    id: `att-${todayStr}-emp-2`,
    employeeId: 'emp-2',
    employeeName: 'John Smith',
    employeeIdCode: 'EMP-2026-0002',
    department: 'Engineering',
    date: todayStr,
    clockIn: '08:45 AM',
    status: 'PRESENT',
    ipAddress: '192.168.1.102'
  },
  {
    id: `att-${todayStr}-emp-4`,
    employeeId: 'emp-4',
    employeeName: 'Alexander Wright',
    employeeIdCode: 'EMP-2026-0004',
    department: 'IT & Security',
    date: todayStr,
    clockIn: '08:15 AM',
    status: 'PRESENT',
    ipAddress: '192.168.1.104'
  },
  {
    id: `att-${todayStr}-emp-5`,
    employeeId: 'emp-5',
    employeeName: 'Eleanor Vance',
    employeeIdCode: 'EMP-2026-0005',
    department: 'Human Resources',
    date: todayStr,
    clockIn: '09:15 AM',
    status: 'LATE',
    ipAddress: '192.168.1.105'
  },
  {
    id: `att-${todayStr}-emp-6`,
    employeeId: 'emp-6',
    employeeName: 'Marcus Sterling',
    employeeIdCode: 'EMP-2026-0006',
    department: 'Finance',
    date: todayStr,
    clockIn: '08:55 AM',
    clockOut: '06:00 PM',
    status: 'PRESENT',
    ipAddress: '192.168.1.106'
  }
);

// Helper to interact with LocalStorage (handles Server Side Rendering gracefully)
class MockDBStore {
  private isBrowser = typeof window !== 'undefined';

  private get<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    const data = localStorage.getItem(`hr_system_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    localStorage.setItem(`hr_system_${key}`, JSON.stringify(value));
  }

  constructor() {
    if (this.isBrowser) {
      if (!localStorage.getItem('hr_system_initialized_v6')) {
        this.set('users', INITIAL_USERS);
        this.set('employees', INITIAL_EMPLOYEES);
        this.set('leave_balances', INITIAL_LEAVE_BALANCES);
        this.set('leave_requests', INITIAL_LEAVE_REQUESTS);
        this.set('payroll_runs', INITIAL_PAYROLL_RUNS);
        this.set('payslips', INITIAL_PAYSLIPS);
        this.set('audit_logs', INITIAL_AUDIT_LOGS);
        this.set('attendance', SEEDED_ATTENDANCE);
        localStorage.setItem('hr_system_initialized_v6', 'true');
      }
    }
  }

  // Users
  getUsers(): User[] {
    return this.get('users', INITIAL_USERS);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Employees
  getEmployees(): EmployeeProfile[] {
    return this.get('employees', INITIAL_EMPLOYEES);
  }

  getEmployee(id: string): EmployeeProfile | undefined {
    return this.getEmployees().find(emp => emp.id === id);
  }

  getEmployeeByUserId(userId: string): EmployeeProfile | undefined {
    return this.getEmployees().find(emp => emp.userId === userId);
  }

  saveEmployee(profile: Omit<EmployeeProfile, 'id'> & { id?: string }): EmployeeProfile {
    const list = this.getEmployees();
    let updated: EmployeeProfile;
    if (profile.id) {
      updated = profile as EmployeeProfile;
      const index = list.findIndex(emp => emp.id === profile.id);
      if (index !== -1) list[index] = updated;
    } else {
      updated = {
        ...profile,
        id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
      list.push(updated);

      // Create initial leave balances for new employee
      const leaveBalances = this.getLeaveBalancesAll();
      const randSuffix = Math.random().toString(36).substring(2, 9);
      const defaultBalances: LeaveBalance[] = [
        { id: `lb-${Date.now()}-${randSuffix}-1`, employeeId: updated.id, leaveType: 'VACATION', allocated: 15, used: 0, pending: 0 },
        { id: `lb-${Date.now()}-${randSuffix}-2`, employeeId: updated.id, leaveType: 'SICK', allocated: 10, used: 0, pending: 0 },
        { id: `lb-${Date.now()}-${randSuffix}-3`, employeeId: updated.id, leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 }
      ];
      this.set('leave_balances', [...leaveBalances, ...defaultBalances]);
    }
    this.set('employees', list);
    return updated;
  }

  deleteEmployee(id: string): void {
    const list = this.getEmployees().filter(emp => emp.id !== id);
    this.set('employees', list);
    
    // Clean up leaves
    const leaves = this.getLeaveRequests().filter(l => l.employeeId !== id);
    this.set('leave_requests', leaves);
    
    // Clean up balances
    const balances = this.getLeaveBalancesAll().filter(b => b.employeeId !== id);
    this.set('leave_balances', balances);
  }

  // Leave Balances
  getLeaveBalancesAll(): LeaveBalance[] {
    return this.get('leave_balances', INITIAL_LEAVE_BALANCES);
  }

  getLeaveBalances(employeeId: string): LeaveBalance[] {
    return this.getLeaveBalancesAll().filter(b => b.employeeId === employeeId);
  }

  // Leave Requests
  getLeaveRequests(): LeaveRequest[] {
    return this.get('leave_requests', INITIAL_LEAVE_REQUESTS);
  }

  saveLeaveRequest(request: {
    id?: string;
    employeeId?: string;
    employeeName?: string;
    leaveType?: LeaveType;
    startDate?: string;
    endDate?: string;
    reason?: string;
    status?: LeaveStatus;
    approvedById?: string;
    approvedByName?: string;
    rejectionReason?: string;
  }): LeaveRequest {
    const list = this.getLeaveRequests();
    let updated: LeaveRequest;
    if (request.id) {
      const index = list.findIndex(r => r.id === request.id);
      if (index !== -1) {
        const existing = list[index];
        updated = {
          ...existing,
          status: request.status || existing.status,
          rejectionReason: request.rejectionReason ?? existing.rejectionReason,
          approvedById: request.approvedById ?? existing.approvedById,
          approvedByName: request.approvedByName ?? existing.approvedByName,
        };
        list[index] = updated;

        // Adjust leave balance if approved
        if (request.status === 'APPROVED') {
          const days = this.calculateDays(updated.startDate, updated.endDate);
          this.adjustLeaveBalance(updated.employeeId, updated.leaveType, 'APPROVE', days);
        } else if (request.status === 'REJECTED') {
          const days = this.calculateDays(updated.startDate, updated.endDate);
          this.adjustLeaveBalance(updated.employeeId, updated.leaveType, 'REJECT', days);
        }
      } else {
        throw new Error('Leave request not found');
      }
    } else {
      updated = {
        employeeId: request.employeeId || '',
        employeeName: request.employeeName || '',
        leaveType: request.leaveType || 'VACATION',
        startDate: request.startDate || '',
        endDate: request.endDate || '',
        reason: request.reason || '',
        id: `lr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      } as LeaveRequest;
      list.push(updated);

      // Add pending to leave balance
      const days = this.calculateDays(updated.startDate, updated.endDate);
      this.adjustLeaveBalance(updated.employeeId, updated.leaveType, 'SUBMIT', days);
    }
    this.set('leave_requests', list);
    return updated;
  }

  private calculateDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e.getTime() - s.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(days) ? 1 : days;
  }

  private adjustLeaveBalance(employeeId: string, type: LeaveType, action: 'SUBMIT' | 'APPROVE' | 'REJECT', days: number): void {
    const balances = this.getLeaveBalancesAll();
    const index = balances.findIndex(b => b.employeeId === employeeId && b.leaveType === type);
    if (index !== -1) {
      const balance = { ...balances[index] };
      if (action === 'SUBMIT') {
        balance.pending = Number(balance.pending) + days;
      } else if (action === 'APPROVE') {
        balance.pending = Math.max(0, Number(balance.pending) - days);
        balance.used = Number(balance.used) + days;
      } else if (action === 'REJECT') {
        balance.pending = Math.max(0, Number(balance.pending) - days);
      }
      balances[index] = balance;
      this.set('leave_balances', balances);
    }
  }

  // Payroll Runs
  getPayrollRuns(): PayrollRun[] {
    return this.get('payroll_runs', INITIAL_PAYROLL_RUNS);
  }

  getPayslips(): Payslip[] {
    return this.get('payslips', INITIAL_PAYSLIPS);
  }

  getPayslipsByRun(runId: string): Payslip[] {
    return this.getPayslips().filter(ps => ps.payrollRunId === runId);
  }

  getPayslipsByEmployee(employeeId: string): Payslip[] {
    return this.getPayslips().filter(ps => ps.employeeId === employeeId);
  }

  createPayrollRun(run: Omit<PayrollRun, 'id' | 'createdAt' | 'status' | 'totalGrossPay' | 'totalNetPay' | 'totalDeductions'>): PayrollRun {
    const newRun: PayrollRun = {
      ...run,
      id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'DRAFT',
      totalGrossPay: 0,
      totalNetPay: 0,
      totalDeductions: 0,
      createdAt: new Date().toISOString()
    };

    // Auto-generate draft payslips for all ACTIVE employees
    const employees = this.getEmployees().filter(emp => emp.employmentStatus === 'ACTIVE');
    const payslips: Payslip[] = employees.map(emp => {
      const monthlyBase = emp.baseSalary;
      const overtimePay = 0;
      
      // Default standard allowances
      const allowances = [
        { name: 'Meal & Rice Allowance', amount: 1500 },
        { name: 'Communication Allowance', amount: 1000 }
      ];
      
      // Calculate Gross Pay
      const allowanceSum = allowances.reduce((acc, a) => acc + a.amount, 0);
      const grossPay = monthlyBase + overtimePay + allowanceSum;
      
      // Tax deduction calculation (simplified progressive scale for mock)
      let taxRate = 0.10;
      if (grossPay > 90000) taxRate = 0.22;
      else if (grossPay > 70000) taxRate = 0.18;
      else if (grossPay > 40000) taxRate = 0.12;
      const taxWithheld = Math.round(grossPay * taxRate);

      // Statutory deductions (mock rules)
      const sss = Math.round(monthlyBase * 0.045);
      const philhealth = Math.round(monthlyBase * 0.02);
      const pagibig = 200;
      const statutory = [
        { name: 'Social Security System (SSS)', amount: sss },
        { name: 'Health Insurance (PhilHealth)', amount: philhealth },
        { name: 'Housing Mutual Fund (Pag-IBIG)', amount: pagibig }
      ];

      const statutorySum = sss + philhealth + pagibig;
      const totalDeductions = taxWithheld + statutorySum;
      const netPay = grossPay - totalDeductions;

      return {
        id: `ps-${Date.now()}-${emp.id}-${Math.random().toString(36).substring(2, 9)}`,
        payrollRunId: newRun.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeIdCode: emp.employeeId,
        jobTitle: emp.jobTitle,
        department: emp.department,
        baseSalary: monthlyBase,
        overtimePay,
        allowances,
        grossPay,
        taxWithheld,
        statutoryDeductions: statutory,
        otherDeductions: [],
        totalDeductions,
        netPay,
        status: 'DRAFT'
      };
    });

    // Update payroll run totals
    newRun.totalGrossPay = payslips.reduce((acc, ps) => acc + ps.grossPay, 0);
    newRun.totalDeductions = payslips.reduce((acc, ps) => acc + ps.totalDeductions, 0);
    newRun.totalNetPay = payslips.reduce((acc, ps) => acc + ps.netPay, 0);

    const runsList = this.getPayrollRuns();
    runsList.unshift(newRun);
    this.set('payroll_runs', runsList);

    const payslipsList = this.getPayslips();
    this.set('payslips', [...payslipsList, ...payslips]);

    return newRun;
  }

  updatePayslip(payslip: Payslip): Payslip {
    const list = this.getPayslips();
    const index = list.findIndex(ps => ps.id === payslip.id);
    if (index !== -1) {
      // Re-calculate totals based on adjustments
      const allowanceSum = payslip.allowances.reduce((acc, a) => acc + a.amount, 0);
      const statutorySum = payslip.statutoryDeductions.reduce((acc, d) => acc + d.amount, 0);
      const otherSum = payslip.otherDeductions.reduce((acc, d) => acc + d.amount, 0);

      payslip.grossPay = payslip.baseSalary + payslip.overtimePay + allowanceSum;
      payslip.totalDeductions = payslip.taxWithheld + statutorySum + otherSum;
      payslip.netPay = payslip.grossPay - payslip.totalDeductions;

      list[index] = payslip;
      this.set('payslips', list);

      // Re-calculate payroll run totals
      this.recalculatePayrollRunTotals(payslip.payrollRunId);
    }
    return payslip;
  }

  private recalculatePayrollRunTotals(runId: string): void {
    const runPayslips = this.getPayslipsByRun(runId);
    const runsList = this.getPayrollRuns();
    const index = runsList.findIndex(r => r.id === runId);
    if (index !== -1) {
      const run = { ...runsList[index] };
      run.totalGrossPay = runPayslips.reduce((acc, ps) => acc + ps.grossPay, 0);
      run.totalDeductions = runPayslips.reduce((acc, ps) => acc + ps.totalDeductions, 0);
      run.totalNetPay = runPayslips.reduce((acc, ps) => acc + ps.netPay, 0);
      runsList[index] = run;
      this.set('payroll_runs', runsList);
    }
  }

  updatePayrollRunStatus(runId: string, status: PayrollStatus): void {
    const runsList = this.getPayrollRuns();
    const index = runsList.findIndex(r => r.id === runId);
    if (index !== -1) {
      runsList[index].status = status;
      this.set('payroll_runs', runsList);

      // Update associated payslips status
      const psList = this.getPayslips();
      const payslipsUpdated = psList.map(ps => {
        if (ps.payrollRunId === runId) {
          return {
            ...ps,
            status: (status === 'PAID' ? 'PAID' : status === 'APPROVED' ? 'ISSUED' : 'DRAFT') as PayslipStatus
          };
        }
        return ps;
      });
      this.set('payslips', payslipsUpdated);
    }
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.get('audit_logs', INITIAL_AUDIT_LOGS);
  }

  addAuditLog(user: User, action: string, resource: string, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action,
      resource,
      details,
      ipAddress: '192.168.1.10',
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.set('audit_logs', logs);
  }

  // Attendance
  getAttendanceRecords(): AttendanceRecord[] {
    return this.get('attendance', SEEDED_ATTENDANCE);
  }

  getAttendanceRecordsByEmployee(employeeId: string): AttendanceRecord[] {
    return this.getAttendanceRecords().filter(att => att.employeeId === employeeId);
  }

  getTodayAttendanceRecord(employeeId: string): AttendanceRecord | undefined {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.getAttendanceRecords().find(att => att.employeeId === employeeId && att.date === todayStr);
  }

  clockIn(employeeId: string, timeStr?: string): AttendanceRecord {
    const list = this.getAttendanceRecords();
    const todayStr = new Date().toISOString().split('T')[0];
    
    const existingIndex = list.findIndex(att => att.employeeId === employeeId && att.date === todayStr);
    if (existingIndex !== -1) {
      return list[existingIndex];
    }
    
    const emp = this.getEmployee(employeeId);
    if (!emp) throw new Error('Employee not found');
    
    const now = new Date();
    const defaultTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const clockInTime = timeStr || defaultTimeStr;
    
    let isLate = false;
    if (!timeStr) {
      const hours = now.getHours();
      const minutes = now.getMinutes();
      if (hours > 9 || (hours === 9 && minutes > 0)) {
        isLate = true;
      }
    } else {
      const match = clockInTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hrs = parseInt(match[1]);
        const mins = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        
        if (hrs > 9 || (hrs === 9 && mins > 0)) {
          isLate = true;
        }
      }
    }
    
    const newRecord: AttendanceRecord = {
      id: `att-${todayStr}-${employeeId}`,
      employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeIdCode: emp.employeeId,
      department: emp.department,
      date: todayStr,
      clockIn: clockInTime,
      status: isLate ? 'LATE' : 'PRESENT',
      ipAddress: '192.168.1.50'
    };
    
    list.unshift(newRecord);
    this.set('attendance', list);
    return newRecord;
  }

  clockOut(employeeId: string, timeStr?: string): AttendanceRecord | undefined {
    const list = this.getAttendanceRecords();
    const todayStr = new Date().toISOString().split('T')[0];
    
    const index = list.findIndex(att => att.employeeId === employeeId && att.date === todayStr);
    if (index === -1) return undefined;
    
    const record = { ...list[index] };
    const now = new Date();
    const defaultTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const clockOutTime = timeStr || defaultTimeStr;
    
    record.clockOut = clockOutTime;
    
    let otMins = 0;
    let outHrs = 0;
    let outMins = 0;
    
    const match = clockOutTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      outHrs = parseInt(match[1]);
      outMins = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && outHrs < 12) outHrs += 12;
      if (ampm === 'AM' && outHrs === 12) outHrs = 0;
      
      const outTotalMins = outHrs * 60 + outMins;
      const shiftEndMins = 18 * 60; // 6:00 PM
      if (outTotalMins > shiftEndMins) {
        otMins = outTotalMins - shiftEndMins;
      }
    }
    
    if (otMins > 0) {
      record.overtimeMinutes = otMins;
    }
    
    list[index] = record;
    this.set('attendance', list);
    return record;
  }

  saveAttendanceRecord(record: AttendanceRecord): AttendanceRecord {
    const list = this.getAttendanceRecords();
    const index = list.findIndex(att => att.id === record.id);
    
    if (index !== -1) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    
    this.set('attendance', list);
    return record;
  }

  deleteAttendanceRecord(id: string): void {
    const list = this.getAttendanceRecords().filter(att => att.id !== id);
    this.set('attendance', list);
  }

  clockByFingerprintId(fingerprintId: number, timeStr?: string): AttendanceRecord {
    const employees = this.getEmployees();
    const emp = employees.find(e => e.fingerprintId === fingerprintId);
    if (!emp) throw new Error(`Fingerprint ID ${fingerprintId} not enrolled`);

    const todayRec = this.getTodayAttendanceRecord(emp.id);
    if (!todayRec) {
      // Clock In
      return this.clockIn(emp.id, timeStr);
    } else if (!todayRec.clockOut) {
      // Clock Out
      const updated = this.clockOut(emp.id, timeStr);
      if (!updated) throw new Error('Failed to clock out');
      return updated;
    } else {
      // Already shift completed, return the record
      return todayRec;
    }
  }
}

export const mockDb = new MockDBStore();
