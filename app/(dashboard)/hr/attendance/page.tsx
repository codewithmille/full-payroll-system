// app/(dashboard)/hr/attendance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, EmployeeProfile, AttendanceRecord, AttendanceStatus } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle,
  Filter,
  CheckCircle,
  UserCheck,
  UserMinus,
  AlertTriangle,
  Cpu,
  Wifi,
  Fingerprint
} from 'lucide-react';

export default function HRAttendancePage() {
  const { user, logAction } = useAuth();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  
  // Date and filters
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-11'); // Default to seed date today
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // IoT Simulator states
  const [iotEmpId, setIotEmpId] = useState<string>('');
  const [iotAlert, setIotAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ZKTeco states
  const [zkSyncing, setZkSyncing] = useState(false);
  const [zkAlert, setZkAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize first employee for selector
  useEffect(() => {
    if (employees.length > 0) {
      setIotEmpId(employees[0].id);
    }
  }, [employees]);

  const handleZkSync = () => {
    setZkSyncing(true);
    setZkAlert(null);
    
    setTimeout(() => {
      const randEmps = ['emp-1', 'emp-2', 'emp-4', 'emp-5', 'emp-7', 'emp-8'];
      const chosenId1 = randEmps[Math.floor(Math.random() * randEmps.length)];
      let chosenId2 = randEmps[Math.floor(Math.random() * randEmps.length)];
      while (chosenId1 === chosenId2) {
        chosenId2 = randEmps[Math.floor(Math.random() * randEmps.length)];
      }
      
      const emp1 = employees.find(e => e.id === chosenId1);
      const emp2 = employees.find(e => e.id === chosenId2);
      
      if (emp1 && emp2) {
        mockDb.clockByFingerprintId(emp1.fingerprintId!);
        mockDb.clockByFingerprintId(emp2.fingerprintId!);
        
        setZkAlert({
          message: `Successfully pulled ZKTeco WL20 logs! Checked ${emp1.firstName} & ${emp2.firstName} over local Wi-Fi.`,
          type: 'success'
        });
        setLogs(mockDb.getAttendanceRecords());
        logAction(
          'ZKTECO_WIFI_PULL_SIMULATED',
          'AttendanceRecord',
          `Pulled biometric register from ZKTeco WL20 device (IP: 192.168.1.150)`
        );
      }
      setZkSyncing(false);
      setTimeout(() => setZkAlert(null), 5000);
    }, 1500);
  };

  const handleZkCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setZkAlert({ message: 'Parsing ZKTeco USB CSV logs file...', type: 'success' });
    
    setTimeout(() => {
      const empIds = ['emp-5', 'emp-8', 'emp-9'];
      empIds.forEach(id => {
        const emp = employees.find(e => e.id === id);
        if (emp) {
          mockDb.clockByFingerprintId(emp.fingerprintId!);
        }
      });
      
      setZkAlert({
        message: 'Successfully imported 3 punches from USB CSV file! Updated Eleanor Vance, Dominic Alvarez, Sofia Rodriguez.',
        type: 'success'
      });
      setLogs(mockDb.getAttendanceRecords());
      logAction(
        'ZKTECO_USB_IMPORT_SIMULATED',
        'AttendanceRecord',
        `Imported clock register from USB CSV flashdrive`
      );
      setTimeout(() => setZkAlert(null), 5000);
    }, 1200);
  };

  const handleSimulateIot = () => {
    const emp = employees.find(e => e.id === iotEmpId);
    if (!emp) return;
    
    if (emp.fingerprintId === undefined) {
      setIotAlert({ message: 'Selected employee has no Fingerprint ID assigned.', type: 'error' });
      return;
    }

    try {
      const record = mockDb.clockByFingerprintId(emp.fingerprintId);
      setIotAlert({
        message: `[ESP32 Webhook] ${record.employeeName} ${
          record.clockOut ? 'Clocked Out' : 'Clocked In'
        } successfully! Registered Fingerprint ID #${emp.fingerprintId}`,
        type: 'success'
      });
      setLogs(mockDb.getAttendanceRecords());
      logAction(
        'IOT_FINGERPRINT_WEBHOOK_SIMULATED', 
        'AttendanceRecord', 
        `Simulated IoT scan for ${record.employeeName} (Finger ID: ${emp.fingerprintId})`
      );
      setTimeout(() => setIotAlert(null), 4000);
    } catch (err: any) {
      setIotAlert({ message: `Scan error: ${err.message}`, type: 'error' });
      setTimeout(() => setIotAlert(null), 4000);
    }
  };

  // Modal edit states
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  // Form fields
  const [formEmployeeId, setFormEmployeeId] = useState<string>('');
  const [formClockIn, setFormClockIn] = useState<string>('08:30 AM');
  const [formClockOut, setFormClockOut] = useState<string>('06:00 PM');
  const [formStatus, setFormStatus] = useState<AttendanceStatus>('PRESENT');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formOvertime, setFormOvertime] = useState<number>(0);

  const loadData = () => {
    setEmployees(mockDb.getEmployees());
    setLogs(mockDb.getAttendanceRecords());
  };

  useEffect(() => {
    loadData();
    logAction('VIEW_COMPANY_ATTENDANCE_BOARD', 'AttendanceRecord', 'HR loaded company timekeeping logs.');
  }, []);

  // Calculate stats for today
  const dailyLogs = logs.filter(l => l.date === selectedDate);
  const activeEmployeesCount = 9; // Core seed employees active for stats calculations
  
  const presentCount = dailyLogs.filter(l => l.status === 'PRESENT').length;
  const lateCount = dailyLogs.filter(l => l.status === 'LATE').length;
  const halfdayCount = dailyLogs.filter(l => l.status === 'HALFDAY').length;
  const absentCount = dailyLogs.filter(l => l.status === 'ABSENT').length;
  const totalClockedIn = presentCount + lateCount + halfdayCount;
  
  // Estimate absent by looking at core employees (id <= 9) who didn't clock in
  const totalCoreCount = 9;
  const coreClockedIn = dailyLogs.filter(l => {
    const num = parseInt(l.employeeId.replace('emp-', ''));
    return num <= 9 && l.status !== 'ABSENT';
  }).length;
  const coreAbsenceCount = Math.max(0, totalCoreCount - coreClockedIn);

  // Filter logs for selected date
  const filteredLogs = logs.filter((log) => {
    // Date filter
    if (log.date !== selectedDate) return false;
    
    // Search filter (name or ID code)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const nameMatch = log.employeeName.toLowerCase().includes(term);
      const codeMatch = log.employeeIdCode.toLowerCase().includes(term);
      if (!nameMatch && !codeMatch) return false;
    }
    
    // Department filter
    if (deptFilter !== 'ALL' && log.department !== deptFilter) return false;
    
    // Status filter
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    
    return true;
  });

  // Open edit log modal
  const handleEditOpen = (record: AttendanceRecord) => {
    setIsAddMode(false);
    setEditingRecord(record);
    setFormEmployeeId(record.employeeId);
    setFormClockIn(record.clockIn || '');
    setFormClockOut(record.clockOut || '');
    setFormStatus(record.status);
    setFormNotes(record.notes || '');
    setFormOvertime(record.overtimeMinutes || 0);
    setIsModalOpen(true);
  };

  // Open add log modal
  const handleAddOpen = () => {
    setIsAddMode(true);
    setEditingRecord(null);
    setFormEmployeeId(employees[0]?.id || '');
    setFormClockIn('08:30 AM');
    setFormClockOut('06:00 PM');
    setFormStatus('PRESENT');
    setFormNotes('');
    setFormOvertime(0);
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId) return;

    const emp = employees.find(e => e.id === formEmployeeId);
    if (!emp) return;

    const recordId = isAddMode 
      ? `att-${selectedDate}-${formEmployeeId}` 
      : editingRecord!.id;

    const updatedRecord: AttendanceRecord = {
      id: recordId,
      employeeId: formEmployeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeIdCode: emp.employeeId,
      department: emp.department,
      date: selectedDate,
      clockIn: formClockIn,
      clockOut: formClockOut || undefined,
      status: formStatus,
      overtimeMinutes: formOvertime > 0 ? Number(formOvertime) : undefined,
      notes: formNotes || undefined,
      ipAddress: isAddMode ? '192.168.1.99' : editingRecord?.ipAddress
    };

    mockDb.saveAttendanceRecord(updatedRecord);
    logAction(
      isAddMode ? 'ADMIN_ADD_ATTENDANCE_LOG' : 'ADMIN_UPDATE_ATTENDANCE_LOG',
      'AttendanceRecord',
      `Manual attendance override for ${updatedRecord.employeeName} on ${selectedDate}. Status: ${formStatus}`
    );
    
    loadData();
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  // Handle Delete
  const handleDeleteLog = (id: string) => {
    if (confirm('Are you sure you want to delete this attendance log?')) {
      mockDb.deleteAttendanceRecord(id);
      logAction('ADMIN_DELETE_ATTENDANCE_LOG', 'AttendanceRecord', `Deleted attendance record ID ${id}`);
      loadData();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Clock In', 'Clock Out', 'Status', 'Overtime (Mins)', 'Notes'];
    const rows = filteredLogs.map(log => [
      log.date,
      log.employeeIdCode,
      log.employeeName,
      log.department,
      log.clockIn || '',
      log.clockOut || '',
      log.status,
      log.overtimeMinutes || '0',
      log.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','), 
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Register_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction('EXPORT_ATTENDANCE_CSV', 'AttendanceRecord', `Exported CSV register for ${selectedDate}`);
  };

  const departments = ['Engineering', 'Product & Design', 'Marketing', 'Finance', 'Human Resources', 'IT & Security'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Timekeeping Management</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Monitor company-wide logs, perform manual overrides, and check timesheet entries</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-150 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-slate-500"
          >
            <Download className="h-4 w-4" />
            <span>Export Register</span>
          </button>
          
          <button
            onClick={handleAddOpen}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-tr from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Attendance Log</span>
          </button>
        </div>
      </div>

      {/* Date Select Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 font-bold text-slate-700 text-xs">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>Viewing Register For Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 shadow-sm"
          />
        </div>
        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-150/20">
          Selected: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Headcount */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-extrabold uppercase tracking-wider">Clocked In</span>
            <UserCheck className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 font-mono">{totalClockedIn} Staff</h2>
          <p className="text-[9px] text-slate-400 font-bold">Present at the workplace</p>
        </div>

        {/* On Time */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-extrabold uppercase tracking-wider">On Time</span>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 font-mono">{presentCount} Staff</h2>
          <p className="text-[9px] text-emerald-600 font-bold">Checked in before 9:00 AM</p>
        </div>

        {/* Late */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-extrabold uppercase tracking-wider">Late</span>
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 font-mono">{lateCount} Staff</h2>
          <p className="text-[9px] text-amber-600 font-bold">Checked in after 9:00 AM</p>
        </div>

        {/* Absent */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[9px] font-extrabold uppercase tracking-wider">Core Absentees</span>
            <UserMinus className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 font-mono">{coreAbsenceCount} Staff</h2>
          <p className="text-[9px] text-rose-500 font-bold">Estimated no-shows today</p>
        </div>
      </div>

      {/* Grid: Attendance Logs & IoT Simulation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Attendance Register Table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          
          {/* Filters Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Attendance Register</h3>
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search staff name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 w-[180px] shadow-sm font-semibold"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Department */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-705 shadow-sm cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-705 shadow-sm cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="HALFDAY">Halfday</option>
                <option value="ABSENT">Absent</option>
              </select>

              {/* Clear filters */}
              {(searchTerm || deptFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDeptFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="py-1.5 px-3 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 cursor-pointer transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-50 pb-2">
                  <th className="pb-2.5">Staff Name</th>
                  <th className="pb-2.5">ID Code</th>
                  <th className="pb-2.5">Department</th>
                  <th className="pb-2.5">Clock In</th>
                  <th className="pb-2.5">Clock Out</th>
                  <th className="pb-2.5 text-center">Overtime</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">IP Address</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const otHours = log.overtimeMinutes 
                      ? `${Math.floor(log.overtimeMinutes / 60)}h ${log.overtimeMinutes % 60}m`
                      : '-';
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-800">
                          {log.employeeName}
                        </td>
                        <td className="py-3.5 font-mono">{log.employeeIdCode}</td>
                        <td className="py-3.5">{log.department}</td>
                        <td className="py-3.5 font-mono">{log.clockIn || '-'}</td>
                        <td className="py-3.5 font-mono">{log.clockOut || '-'}</td>
                        <td className="py-3.5 text-center font-mono">{otHours}</td>
                        <td className="py-3.5">
                          <span className={`
                            px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border inline-flex items-center space-x-1
                            ${log.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : log.status === 'LATE'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : log.status === 'HALFDAY'
                              ? 'bg-purple-50 text-purple-600 border-purple-100'
                              : 'bg-rose-50 text-rose-600 border-rose-100'
                            }
                          `}>
                            <span>{log.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-400">{log.ipAddress || '-'}</td>
                        <td className="py-3.5 text-right flex items-center justify-end space-x-2.5">
                          <button
                            onClick={() => handleEditOpen(log)}
                            className="p-1 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Override"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete Log"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 font-bold space-y-2">
                      <AlertCircle className="h-8 w-8 text-slate-200 mx-auto" />
                      <p>No active attendance logs matching the filters for this date.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Side: ZKTeco Device Manager */}
        <div className="lg:col-span-1 space-y-6">

          {/* ZKTeco WL20 WiFi Sync & USB CSV Importer Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">ZKTeco WL20 Manager</h3>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-semibold space-y-2 leading-relaxed">
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Device Model:</span>
                <strong className="text-slate-600">WL20 (Wi-Fi Terminal)</strong>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>IP Address:</span>
                <strong className="text-slate-650 font-mono">192.168.1.150:4370</strong>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Connection Status:</span>
                <strong className="text-emerald-500 uppercase">Online</strong>
              </div>
            </div>

            {/* Alert banner */}
            {zkAlert && (
              <div className={`p-3 rounded-xl border text-[10px] font-bold leading-normal flex items-start gap-1.5 ${
                zkAlert.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{zkAlert.message}</span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                onClick={handleZkSync}
                disabled={zkSyncing}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-200 disabled:to-slate-300 text-white text-xs font-black tracking-wider shadow-md shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {zkSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white"></div>
                    <span>SYNCING DEVICE...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    <span>SYNC TERMINAL OVER WI-FI</span>
                  </>
                )}
              </button>

              <div className="relative">
                <input
                  type="file"
                  id="zk-csv-file"
                  accept=".csv,.txt"
                  onChange={handleZkCsvUpload}
                  className="hidden"
                />
                <label
                  htmlFor="zk-csv-file"
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 text-slate-500 text-xs font-black tracking-wider text-center transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4 transform rotate-180" />
                  <span>IMPORT USB CSV LOGS</span>
                </label>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Manual Override Form Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold border-b border-slate-100 pb-3">
                <Clock className="h-5 w-5" />
                <h3 className="text-sm uppercase tracking-wider">
                  {isAddMode ? 'Add Manual Attendance Record' : 'Edit Attendance Record Override'}
                </h3>
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Select Employee</label>
                {isAddMode ? (
                  <select
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 cursor-pointer transition-all"
                    required
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold font-sans">
                    {editingRecord?.employeeName} ({editingRecord?.employeeIdCode})
                  </div>
                )}
              </div>

              {/* Inputs row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Clock In */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Clock In Time</label>
                  <input
                    type="text"
                    value={formClockIn}
                    onChange={(e) => setFormClockIn(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 transition-all"
                    required
                  />
                </div>

                {/* Clock Out */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Clock Out Time</label>
                  <input
                    type="text"
                    value={formClockOut}
                    onChange={(e) => setFormClockOut(e.target.value)}
                    placeholder="e.g. 06:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Status Override</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AttendanceStatus)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 cursor-pointer transition-all"
                    required
                  >
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="HALFDAY">Halfday</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>

                {/* Overtime minutes */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Overtime Worked (Minutes)</label>
                  <input
                    type="number"
                    value={formOvertime}
                    onChange={(e) => setFormOvertime(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Reason/Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Manual correction, Official Business (OB), Sick leave offset..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-800 resize-none transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
