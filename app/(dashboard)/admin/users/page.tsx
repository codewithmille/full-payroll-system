// app/(dashboard)/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, User, EmployeeProfile, PayrollRun, LeaveBalance } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Shield, 
  FileSpreadsheet, 
  Printer, 
  Users, 
  Download, 
  CheckCircle,
  Database,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser, logAction } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(mockDb.getUsers());
    setEmployees(mockDb.getEmployees());
    setPayrollRuns(mockDb.getPayrollRuns());
    setLeaveBalances(mockDb.getLeaveBalancesAll());
    logAction('VIEW_ADMIN_CONTROL_CENTER', 'SystemUser', 'Admin loaded the user management and reporting dashboard.');
  };

  const handleRoleChange = (userId: string, newRole: any) => {
    const list = mockDb.getUsers();
    const index = list.findIndex(u => u.id === userId);
    if (index !== -1) {
      const u = { ...list[index], role: newRole };
      list[index] = u;
      
      // Update in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hr_system_users', JSON.stringify(list));
      }
      
      logAction('MODIFY_USER_SECURITY_ROLE', 'SystemUser', `Changed security role of user ${u.name} (${u.email}) to ${newRole}.`);
      setUsers(list);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // --- CSV Export Logic ---
  const exportToCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvRows = [headers.join(','), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logAction('EXPORT_REPORT_CSV', 'Reports', `Exported report "${filename}" as CSV spreadsheet.`);
  };

  const handleExportCensusCSV = () => {
    const headers = ['Employee ID', 'Full Name', 'Department', 'Job Title', 'Type', 'Status', 'Date Hired', 'Base Monthly Salary'];
    const rows = employees.map(emp => [
      emp.employeeId,
      `${emp.firstName} ${emp.lastName}`,
      emp.department,
      emp.jobTitle,
      emp.employmentType,
      emp.employmentStatus,
      emp.dateHired,
      emp.baseSalary.toString()
    ]);
    exportToCSV('workforce_census_report', headers, rows);
  };

  const handleExportPayrollCSV = () => {
    const headers = ['Cycle Name', 'Period Start', 'Period End', 'Payment Date', 'Status', 'Gross Expenses', 'Total Deductions', 'Net Payout'];
    const rows = payrollRuns.map(run => [
      run.name,
      run.startDate,
      run.endDate,
      run.paymentDate,
      run.status,
      run.totalGrossPay.toString(),
      run.totalDeductions.toString(),
      run.totalNetPay.toString()
    ]);
    exportToCSV('payroll_cycle_expenses_report', headers, rows);
  };

  const handleExportLeavesCSV = () => {
    const headers = ['Employee ID', 'Name', 'Leave Category', 'Allocated Credits', 'Used Credits', 'Pending Approvals'];
    const rows = leaveBalances.map(bal => {
      const emp = employees.find(e => e.id === bal.employeeId);
      return [
        emp?.employeeId || 'N/A',
        emp ? `${emp.firstName} ${emp.lastName}` : 'N/A',
        bal.leaveType,
        bal.allocated.toString(),
        bal.used.toString(),
        bal.pending.toString()
      ];
    });
    exportToCSV('staff_leave_balances_report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Administration Center</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure system security clearances and generate analytical reports</p>
        </div>

        {saveSuccess && (
          <span className="flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold shadow-sm animate-pulse">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Role Permissions Updated</span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('users')}
          className={`
            flex items-center space-x-2 px-5 py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
            ${activeTab === 'users'
              ? 'border-indigo-500 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-700'
            }
          `}
        >
          <Shield className="h-4 w-4" />
          <span>Security Accounts</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`
            flex items-center space-x-2 px-5 py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
            ${activeTab === 'reports'
              ? 'border-indigo-500 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-700'
            }
          `}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Reporting Center</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                  <th className="py-4.5 px-6">User Account</th>
                  <th className="py-4.5 px-6">System Email</th>
                  <th className="py-4.5 px-6">Security Clearance</th>
                  <th className="py-4.5 px-6 text-right">Modify Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-slate-700 font-semibold">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/45 transition-colors">
                    <td className="py-4.5 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-slate-500 font-mono font-medium">{u.email}</td>
                    <td className="py-4.5 px-6">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase border
                        ${u.role === 'ADMIN' 
                          ? 'bg-rose-50 text-rose-600 border-rose-100' 
                          : u.role === 'HR'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : u.role === 'PAYROLL_OFFICER'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                        }
                      `}>
                        {u.role === 'PAYROLL_OFFICER' ? 'PAYROLL OFFICER' : u.role}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      {u.id === currentUser?.id ? (
                        <span className="text-[10px] text-slate-400 font-bold italic">Active Session</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
                        >
                          <option value="ADMIN">Administrator</option>
                          <option value="HR">HR Manager</option>
                          <option value="PAYROLL_OFFICER">Payroll Officer</option>
                          <option value="STAFF">Staff Employee</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Reports Center layout */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Census */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Workforce Census Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates a directory summary containing demographics, hire dates, job hierarchies, and current base salary metrics.
              </p>
            </div>

            <div className="pt-2 flex gap-3 w-full border-t border-slate-50 pt-4">
              <button
                onClick={handleExportCensusCSV}
                className="flex-1 flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Excel CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>PDF Print</span>
              </button>
            </div>
          </div>

          {/* Card 2: Payroll */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Payroll Expenses Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Retrieves chronological payroll cycles displaying total gross outlays, statutory deductions, tax withholdings, and net payouts.
              </p>
            </div>

            <div className="pt-2 flex gap-3 w-full border-t border-slate-50 pt-4">
              <button
                onClick={handleExportPayrollCSV}
                className="flex-1 flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Excel CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>PDF Print</span>
              </button>
            </div>
          </div>

          {/* Card 3: Leaves */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-2">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Staff Leave Credits Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Summarizes employees remaining vacation, sick, and emergency credits alongside pending approval requests.
              </p>
            </div>

            <div className="pt-2 flex gap-3 w-full border-t border-slate-50 pt-4">
              <button
                onClick={handleExportLeavesCSV}
                className="flex-1 flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Excel CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>PDF Print</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
