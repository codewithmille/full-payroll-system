// app/(dashboard)/portal/attendance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, EmployeeProfile, AttendanceRecord, AttendanceStatus } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Clock, 
  Calendar, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import BiometricScannerModal from '@/components/attendance/BiometricScannerModal';

export default function MyAttendancePage() {
  const { user, logAction } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Biometrics & Timer states
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = () => {
    if (user) {
      const emp = mockDb.getEmployeeByUserId(user.id);
      if (emp) {
        setProfile(emp);
        const records = mockDb.getAttendanceRecordsByEmployee(emp.id);
        setLogs(records);
        
        const todayRec = mockDb.getTodayAttendanceRecord(emp.id);
        setTodayRecord(todayRec || null);
      }
    }
  };

  useEffect(() => {
    loadData();
    logAction('VIEW_MY_ATTENDANCE_LOGS', 'AttendanceRecord', 'Employee loaded personal attendance logs.');
  }, [user]);

  const handleClockIn = () => {
    if (!profile) return;
    mockDb.clockIn(profile.id);
    logAction('EMPLOYEE_CLOCK_IN', 'AttendanceRecord', 'Employee clocked in via attendance page.');
    loadData();
  };

  const handleClockOut = () => {
    if (!profile) return;
    mockDb.clockOut(profile.id);
    logAction('EMPLOYEE_CLOCK_OUT', 'AttendanceRecord', 'Employee clocked out via attendance page.');
    loadData();
  };

  // Calculations for stats cards
  const totalDays = logs.length;
  const daysPresent = logs.filter(l => l.status === 'PRESENT').length;
  const daysLate = logs.filter(l => l.status === 'LATE').length;
  const daysHalf = logs.filter(l => l.status === 'HALFDAY').length;
  const daysAbsent = logs.filter(l => l.status === 'ABSENT').length;
  
  const attendanceRate = totalDays > 0 
    ? Math.round(((daysPresent + daysLate + daysHalf * 0.5) / totalDays) * 100) 
    : 100;
    
  const totalOtMins = logs.reduce((acc, l) => acc + (l.overtimeMinutes || 0), 0);
  const otHoursStr = `${Math.floor(totalOtMins / 60)}h ${totalOtMins % 60}m`;

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    // Status Filter
    if (statusFilter !== 'ALL' && log.status !== statusFilter) {
      return false;
    }
    // Date Filters
    if (startDate && log.date < startDate) {
      return false;
    }
    if (endDate && log.date > endDate) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Time & Attendance</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Track your daily shift logs, overtime hours, and attendance statistics</p>
        </div>
        <Link 
          href="/portal"
          className="w-fit inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-150 text-slate-500 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Grid: Clocking Widget & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clocking Card */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
          
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-indigo-500 tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/30 uppercase">
              Shift Clock
            </span>
            <h2 className="text-2xl font-black text-slate-800 font-mono pt-3">
              {currentTime ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00 AM'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {currentTime ? currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : ''}
            </p>
          </div>

          {/* Clocking status visual */}
          <div className="space-y-2">
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center border-4 ${
              !todayRecord 
                ? 'bg-slate-50 border-slate-100 text-slate-400' 
                : todayRecord.clockOut 
                ? 'bg-slate-100 border-slate-200 text-slate-500' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 animate-pulse'
            }`}>
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700">
                {!todayRecord 
                  ? 'Not Clocked In' 
                  : todayRecord.clockOut 
                  ? 'Shift Completed' 
                  : 'Clocked In'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                {!todayRecord 
                  ? 'Shift hours: 9:00 AM - 6:00 PM' 
                  : todayRecord.clockOut 
                  ? `Logged: ${todayRecord.clockIn} - ${todayRecord.clockOut}` 
                  : `Active since: ${todayRecord.clockIn}`}
              </p>
            </div>
          </div>

          {/* Clock actions */}
          <div className="w-full space-y-2.5">
            {!todayRecord ? (
              <div className="flex gap-2">
                <button
                  onClick={handleClockIn}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white text-xs font-black tracking-wider shadow-md shadow-indigo-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  CLOCK IN
                </button>
                <button
                  onClick={() => setIsBioModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 cursor-pointer flex items-center justify-center shrink-0 transition-all"
                  title="Biometric Clock In"
                >
                  <Fingerprint className="h-5 w-5" />
                </button>
              </div>
            ) : !todayRecord.clockOut ? (
              <div className="flex gap-2">
                <button
                  onClick={handleClockOut}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black tracking-wider shadow-md shadow-rose-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  CLOCK OUT
                </button>
                <button
                  onClick={() => setIsBioModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-500 cursor-pointer flex items-center justify-center shrink-0 transition-all"
                  title="Biometric Clock Out"
                >
                  <Fingerprint className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-black tracking-wider cursor-not-allowed"
              >
                SHIFT COMPLETED
              </button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          
          {/* Stat 1: Present */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Days Present</span>
              <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100/50">
                ACTIVE
              </span>
            </div>
            <div className="space-y-1 mt-2">
              <h2 className="text-2xl font-black text-slate-800 font-mono">{daysPresent + daysLate + daysHalf} Days</h2>
              <div className="text-[9px] text-slate-400 font-bold flex gap-2">
                <span className="text-slate-600 font-semibold">{daysPresent} On Time</span>
                <span className="text-amber-500 font-semibold">{daysLate} Late</span>
                <span className="text-violet-500 font-semibold">{daysHalf} Half</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Attendance Rate */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <Award className="h-4.5 w-4.5 text-indigo-500" />
            </div>
            <div className="space-y-1 mt-2">
              <h2 className="text-2xl font-black text-slate-800 font-mono">{attendanceRate}%</h2>
              <p className="text-[9px] text-slate-400 font-bold">
                Perfect attendance is 100%
              </p>
            </div>
          </div>

          {/* Stat 3: Overtime Hours */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Overtime Worked</span>
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
            </div>
            <div className="space-y-1 mt-2">
              <h2 className="text-2xl font-black text-slate-800 font-mono">{otHoursStr}</h2>
              <p className="text-[9px] text-slate-400 font-bold">
                Accrued this period (past 6:00 PM)
              </p>
            </div>
          </div>

          {/* Stat 4: Absences */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Unexcused Absences</span>
              <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
            </div>
            <div className="space-y-1 mt-2">
              <h2 className="text-2xl font-black text-slate-800 font-mono">{daysAbsent} Day(s)</h2>
              <p className="text-[9px] text-slate-400 font-bold">
                Does not include approved leaves
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* History Log Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Attendance Register</h3>
          
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="HALFDAY">Halfday</option>
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center space-x-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 shadow-sm"
              />
              <span className="text-slate-450 font-normal">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 shadow-sm"
              />
            </div>
            
            {/* Clear button */}
            {(statusFilter !== 'ALL' || startDate || endDate) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
                className="py-1.5 px-3 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 cursor-pointer transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 font-bold border-b border-slate-50 pb-2">
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Clock In</th>
                <th className="pb-2.5">Clock Out</th>
                <th className="pb-2.5 text-center">Work Overtime</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Notes</th>
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
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 font-mono">{log.clockIn || '-'}</td>
                      <td className="py-3.5 font-mono">{log.clockOut || '-'}</td>
                      <td className="py-3.5 text-center font-mono">{otHours}</td>
                      <td className="py-3.5">
                        <span className={`
                          px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border inline-flex items-center space-x-1
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
                      <td className="py-3.5 text-slate-400 italic font-semibold max-w-[200px] truncate" title={log.notes}>
                        {log.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto" />
                    <p>No attendance logs found matching these filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {profile && (
        <BiometricScannerModal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
          onSuccess={!todayRecord ? handleClockIn : handleClockOut}
          employeeName={`${profile.firstName} ${profile.lastName}`}
          actionType={!todayRecord ? 'IN' : 'OUT'}
        />
      )}
    </div>
  );
}
