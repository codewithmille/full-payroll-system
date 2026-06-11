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

// Seed Data
const INITIAL_USERS: User[] = [
  { id: 'u-1', email: 'admin@hr.com', role: 'ADMIN', name: 'Alexander Wright' },
  { id: 'u-2', email: 'hr@hr.com', role: 'HR', name: 'Eleanor Vance' },
  { id: 'u-3', email: 'payroll@hr.com', role: 'PAYROLL_OFFICER', name: 'Marcus Sterling' },
  { id: 'u-4', email: 'jane@hr.com', role: 'STAFF', name: 'Jane Doe' },
  { id: 'u-5', email: 'john@hr.com', role: 'STAFF', name: 'John Smith' },
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
    phone: '+1 (555) 019-2834',
    dateOfBirth: '1992-04-15',
    gender: 'Female',
    address: '742 Evergreen Terrace, Springfield',
    jobTitle: 'Senior UX Designer',
    department: 'Product & Design',
    dateHired: '2022-03-01',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 78000,
    taxIdNumber: 'TIN-342-901-223',
    socialSecurityNo: 'SS-90-234293-2',
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
    phone: '+1 (555) 014-9981',
    dateOfBirth: '1989-11-23',
    gender: 'Male',
    address: '123 Baker Street, London',
    jobTitle: 'Lead Software Engineer',
    department: 'Engineering',
    dateHired: '2021-06-15',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 95000,
    taxIdNumber: 'TIN-109-887-212',
    socialSecurityNo: 'SS-88-112233-4',
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
    phone: '+1 (555) 022-1133',
    dateOfBirth: '1995-08-05',
    gender: 'Female',
    address: '456 Oak Lane, Pineville',
    jobTitle: 'Content Specialist',
    department: 'Marketing',
    dateHired: '2024-01-10',
    employmentStatus: 'ACTIVE',
    employmentType: 'CONTRACTOR',
    baseSalary: 48000,
    taxIdNumber: 'TIN-987-654-321',
    socialSecurityNo: 'SS-55-667788-9',
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
    phone: '+1 (555) 011-2233',
    dateOfBirth: '1985-02-10',
    gender: 'Male',
    address: '55 Wall Street, New York',
    jobTitle: 'System Administrator',
    department: 'IT & Security',
    dateHired: '2020-01-15',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 120000,
    taxIdNumber: 'TIN-445-123-998',
    socialSecurityNo: 'SS-11-222333-4',
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
    phone: '+1 (555) 015-4455',
    dateOfBirth: '1987-07-19',
    gender: 'Female',
    address: '456 Primrose Path, Boston',
    jobTitle: 'HR Director',
    department: 'Human Resources',
    dateHired: '2021-08-01',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 85000,
    taxIdNumber: 'TIN-554-998-332',
    socialSecurityNo: 'SS-22-333444-5',
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
    phone: '+1 (555) 018-7788',
    dateOfBirth: '1990-10-05',
    gender: 'Male',
    address: '789 Silver Linings, Chicago',
    jobTitle: 'Payroll Supervisor',
    department: 'Finance',
    dateHired: '2023-04-10',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 80000,
    taxIdNumber: 'TIN-776-889-112',
    socialSecurityNo: 'SS-33-444555-6',
    healthInsuranceNo: 'PH-7777-8888-9',
    housingFundNo: 'PI-3333-4444-5',
    bankName: 'Global Trust Finance',
    bankAccountNumber: '5566778899'
  }
];

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
  { id: 'lb-18', employeeId: 'emp-6', leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 }
];

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
    approvedById: 'emp-2',
    approvedByName: 'John Smith',
    createdAt: '2026-05-02T10:00:00Z'
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
    totalGrossPay: 221000,
    totalNetPay: 181250,
    totalDeductions: 39750,
    createdAt: '2026-05-25T08:00:00Z'
  }
];

const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: 'ps-1',
    payrollRunId: 'pr-1',
    employeeId: 'emp-1',
    employeeName: 'Jane Doe',
    employeeIdCode: 'EMP-2026-0001',
    jobTitle: 'Senior UX Designer',
    department: 'Product & Design',
    baseSalary: 78000,
    overtimePay: 2400,
    allowances: [{ name: 'Rice & Meal', amount: 1500 }, { name: 'Communication', amount: 1000 }],
    grossPay: 82900,
    taxWithheld: 9500,
    statutoryDeductions: [{ name: 'SSS', amount: 800 }, { name: 'PhilHealth', amount: 450 }, { name: 'Pag-IBIG', amount: 200 }],
    otherDeductions: [],
    totalDeductions: 10950,
    netPay: 71950,
    status: 'PAID'
  },
  {
    id: 'ps-2',
    payrollRunId: 'pr-1',
    employeeId: 'emp-2',
    employeeName: 'John Smith',
    employeeIdCode: 'EMP-2026-0002',
    jobTitle: 'Lead Software Engineer',
    department: 'Engineering',
    baseSalary: 95000,
    overtimePay: 0,
    allowances: [{ name: 'Communication', amount: 1500 }, { name: 'Health Wellness', amount: 2000 }],
    grossPay: 98500,
    taxWithheld: 14200,
    statutoryDeductions: [{ name: 'SSS', amount: 1000 }, { name: 'PhilHealth', amount: 550 }, { name: 'Pag-IBIG', amount: 200 }],
    otherDeductions: [{ name: 'Gym Membership Co-pay', amount: 150 }],
    totalDeductions: 16100,
    netPay: 82400,
    status: 'PAID'
  },
  {
    id: 'ps-3',
    payrollRunId: 'pr-1',
    employeeId: 'emp-3',
    employeeName: 'Sarah Jenkins',
    employeeIdCode: 'EMP-2026-0003',
    jobTitle: 'Content Specialist',
    department: 'Marketing',
    baseSalary: 40000, // base salary computed for part period
    overtimePay: 0,
    allowances: [],
    grossPay: 40000,
    taxWithheld: 4200,
    statutoryDeductions: [{ name: 'SSS', amount: 400 }, { name: 'PhilHealth', amount: 250 }, { name: 'Pag-IBIG', amount: 100 }],
    otherDeductions: [],
    totalDeductions: 4950,
    netPay: 35050,
    status: 'PAID'
  },
  {
    id: 'ps-4',
    payrollRunId: 'pr-1',
    employeeId: 'emp-4',
    employeeName: 'Alexander Wright',
    employeeIdCode: 'EMP-2026-0004',
    jobTitle: 'System Administrator',
    department: 'IT & Security',
    baseSalary: 120000,
    overtimePay: 0,
    allowances: [{ name: 'Rice & Meal', amount: 1500 }, { name: 'Communication', amount: 1500 }],
    grossPay: 123000,
    taxWithheld: 27000,
    statutoryDeductions: [{ name: 'SSS', amount: 1200 }, { name: 'PhilHealth', amount: 600 }, { name: 'Pag-IBIG', amount: 200 }],
    otherDeductions: [],
    totalDeductions: 29000,
    netPay: 94000,
    status: 'PAID'
  },
  {
    id: 'ps-5',
    payrollRunId: 'pr-1',
    employeeId: 'emp-5',
    employeeName: 'Eleanor Vance',
    employeeIdCode: 'EMP-2026-0005',
    jobTitle: 'HR Director',
    department: 'Human Resources',
    baseSalary: 85000,
    overtimePay: 0,
    allowances: [{ name: 'Rice & Meal', amount: 1500 }, { name: 'Communication', amount: 1000 }],
    grossPay: 87500,
    taxWithheld: 15750,
    statutoryDeductions: [{ name: 'SSS', amount: 900 }, { name: 'PhilHealth', amount: 500 }, { name: 'Pag-IBIG', amount: 200 }],
    otherDeductions: [],
    totalDeductions: 17350,
    netPay: 70150,
    status: 'PAID'
  },
  {
    id: 'ps-6',
    payrollRunId: 'pr-1',
    employeeId: 'emp-6',
    employeeName: 'Marcus Sterling',
    employeeIdCode: 'EMP-2026-0006',
    jobTitle: 'Payroll Supervisor',
    department: 'Finance',
    baseSalary: 80000,
    overtimePay: 0,
    allowances: [{ name: 'Rice & Meal', amount: 1500 }, { name: 'Communication', amount: 1000 }],
    grossPay: 82500,
    taxWithheld: 14850,
    statutoryDeductions: [{ name: 'SSS', amount: 850 }, { name: 'PhilHealth', amount: 450 }, { name: 'Pag-IBIG', amount: 200 }],
    otherDeductions: [],
    totalDeductions: 16350,
    netPay: 66150,
    status: 'PAID'
  }
];

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
  }
];

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
      if (!localStorage.getItem('hr_system_initialized_v3')) {
        this.set('users', INITIAL_USERS);
        this.set('employees', INITIAL_EMPLOYEES);
        this.set('leave_balances', INITIAL_LEAVE_BALANCES);
        this.set('leave_requests', INITIAL_LEAVE_REQUESTS);
        this.set('payroll_runs', INITIAL_PAYROLL_RUNS);
        this.set('payslips', INITIAL_PAYSLIPS);
        this.set('audit_logs', INITIAL_AUDIT_LOGS);
        localStorage.setItem('hr_system_initialized_v3', 'true');
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
        id: `emp-${Date.now()}`
      };
      list.push(updated);

      // Create initial leave balances for new employee
      const leaveBalances = this.getLeaveBalancesAll();
      const defaultBalances: LeaveBalance[] = [
        { id: `lb-${Date.now()}-1`, employeeId: updated.id, leaveType: 'VACATION', allocated: 15, used: 0, pending: 0 },
        { id: `lb-${Date.now()}-2`, employeeId: updated.id, leaveType: 'SICK', allocated: 10, used: 0, pending: 0 },
        { id: `lb-${Date.now()}-3`, employeeId: updated.id, leaveType: 'EMERGENCY', allocated: 5, used: 0, pending: 0 }
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
        id: `lr-${Date.now()}`,
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
      id: `pr-${Date.now()}`,
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
        id: `ps-${Date.now()}-${emp.id}`,
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
      id: `log-${Date.now()}`,
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
}

export const mockDb = new MockDBStore();
