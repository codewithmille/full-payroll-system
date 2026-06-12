// app/(dashboard)/portal/leaves/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, LeaveBalance, LeaveRequest, LeaveType } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Calendar, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  Info
} from 'lucide-react';

const HOLIDAYS: Record<string, { name: string; type: 'Regular' | 'Special' }> = {
  '2026-01-01': { name: 'New Year\'s Day', type: 'Regular' },
  '2026-04-02': { name: 'Maundy Thursday', type: 'Regular' },
  '2026-04-03': { name: 'Good Friday', type: 'Regular' },
  '2026-04-09': { name: 'Araw ng Kagitingan', type: 'Regular' },
  '2026-05-01': { name: 'Labor Day', type: 'Regular' },
  '2026-06-12': { name: 'Independence Day', type: 'Regular' },
  '2026-08-31': { name: 'National Heroes Day', type: 'Regular' },
  '2026-11-30': { name: 'Bonifacio Day', type: 'Regular' },
  '2026-12-25': { name: 'Christmas Day', type: 'Regular' },
  '2026-12-30': { name: 'Rizal Day', type: 'Regular' },
  '2026-02-17': { name: 'Chinese New Year', type: 'Special' },
  '2026-02-25': { name: 'EDSA Revolution Anniversary', type: 'Special' },
  '2026-08-21': { name: 'Ninoy Aquino Day', type: 'Special' },
  '2026-11-01': { name: 'All Saints\' Day', type: 'Special' },
  '2026-11-02': { name: 'All Souls\' Day', type: 'Special' },
  '2026-12-08': { name: 'Feast of the Immaculate Conception', type: 'Special' },
  '2026-12-31': { name: 'Last Day of the Year', type: 'Special' },
};

export default function StaffLeavesPage() {
  const { user, logAction } = useAuth();
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  
  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('VACATION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar and View Mode state
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 5, 1)); // Default to June 2026 to showcase seed data

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const days = [];

    // Padding days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ day: dayNum, dateStr, isCurrentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr, isCurrentMonth: true });
    }

    // Padding days from next month to make complete rows (multiples of 7)
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const paddingNeeded = totalSlots - days.length;

    for (let i = 1; i <= paddingNeeded; i++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr, isCurrentMonth: false });
    }

    return days;
  };

  const getLeaveForDate = (dateStr: string) => {
    return requests.find(r => dateStr >= r.startDate && dateStr <= r.endDate);
  };

  const handleCalendarDayClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
      setSuccess(false);
      setError('');
    } else {
      if (dateStr < startDate) {
        setStartDate(dateStr);
        setEndDate('');
      } else {
        setEndDate(dateStr);
      }
    }
  };

  useEffect(() => {
    if (user) {
      const emp = mockDb.getEmployeeByUserId(user.id);
      if (emp) {
        setEmployeeProfile(emp);
        setBalances(mockDb.getLeaveBalances(emp.id));
        setRequests(mockDb.getLeaveRequests().filter(r => r.employeeId === emp.id));
        logAction('VIEW_MY_LEAVES', 'LeaveRequest', 'User viewed their personal leave credits and request history.');
      } else {
        setEmployeeProfile(null);
      }
    }
  }, [user]);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e.getTime() - s.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(days) ? 0 : days;
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!employeeProfile) return;
    if (!startDate || !endDate || !reason) {
      setError('Please fill in all details.');
      return;
    }

    const requestedDays = calculateDays(startDate, endDate);
    if (requestedDays <= 0) {
      setError('Invalid date range selected.');
      return;
    }

    // Check balance
    const balance = balances.find(b => b.leaveType === leaveType);
    if (balance) {
      const available = Number(balance.allocated) - Number(balance.used);
      if (requestedDays > available) {
        setError(`Insufficient leave balance. You requested ${requestedDays} days but only have ${available} days left.`);
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Save leave request
      mockDb.saveLeaveRequest({
        employeeId: employeeProfile.id,
        employeeName: `${employeeProfile.firstName} ${employeeProfile.lastName}`,
        leaveType,
        startDate,
        endDate,
        reason
      });

      // Reload
      setBalances(mockDb.getLeaveBalances(employeeProfile.id));
      setRequests(mockDb.getLeaveRequests().filter(r => r.employeeId === employeeProfile.id));
      
      // Reset Form
      setStartDate('');
      setEndDate('');
      setReason('');
      setSuccess(true);
      setIsSubmitting(false);

      logAction('SUBMIT_LEAVE_REQUEST', 'LeaveRequest', `Submitted a new ${leaveType} leave request for ${requestedDays} days.`);
      
      setTimeout(() => setSuccess(false), 4000);
    }, 800);
  };

  if (!user) return null;

  if (!employeeProfile) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm mt-10">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
        <h2 className="text-lg font-bold text-slate-800">System Profile Notice</h2>
        <p className="text-xs text-slate-500">
          Your current simulator user account is a system-level role. Switch to a Staff Employee profile in the simulator to view personal leaves, submit requests, and inspect payslips.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Leaves Portal</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Check your remaining leave credits and submit requests</p>
      </div>

      {/* Leave Credit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map((bal) => (
          <div key={bal.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-extrabold text-slate-400 bg-slate-50 border-l border-b border-slate-100 rounded-bl-xl uppercase tracking-widest">
              {bal.leaveType}
            </div>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Remaining Credits</p>
            <h2 className="text-3xl font-black text-slate-800 font-mono mt-1.5">
              {Number(bal.allocated) - Number(bal.used)}
            </h2>
            <div className="flex justify-between items-center text-[9px] text-slate-450 font-bold border-t border-slate-100 pt-2.5 mt-2.5">
              <span>Allocated: {Number(bal.allocated)}</span>
              <span>Pending: {Number(bal.pending)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit lg:col-span-1">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
            <Plus className="h-4.5 w-4.5 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">New Leave Request</h2>
          </div>

          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs font-bold text-slate-750">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Leave Category</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 cursor-pointer transition-all"
              >
                <option value="VACATION">Vacation Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EMERGENCY">Emergency Leave</option>
                <option value="PARENTHOOD">Parenthood Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Reason / Description</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="State the purpose of your leave request..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-850 resize-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="flex items-start space-x-2 text-rose-500 text-[11px] bg-rose-50 border border-rose-100 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start space-x-2 text-emerald-600 text-[11px] bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold">Leave application submitted successfully! Pending HR approval.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </form>
        </div>

        {/* Leave History / Calendar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4.5 w-4.5 text-indigo-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">My Leave Applications</h2>
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === 'LIST'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CALENDAR')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === 'CALENDAR'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Calendar</span>
              </button>
            </div>
          </div>

          {viewMode === 'LIST' ? (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                    <th className="py-2.5 px-3">Date Range</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Days</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70 text-slate-600 font-semibold">
                  {requests.length > 0 ? (
                    requests.map((req) => {
                      const days = calculateDays(req.startDate, req.endDate);
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/45 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {req.startDate} to {req.endDate}
                          </td>
                          <td className="py-3 px-3 text-slate-550 font-bold">{req.leaveType}</td>
                          <td className="py-3 px-3 font-mono font-bold">{days} day(s)</td>
                          <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">{req.reason}</td>
                          <td className="py-3 px-3">
                            <span className={`
                              inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border
                              ${req.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                              }
                            `}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400 italic text-[10px] font-medium">
                            {req.status === 'APPROVED' && `Approved by ${req.approvedByName}`}
                            {req.status === 'REJECTED' && `Rejected: ${req.rejectionReason}`}
                            {req.status === 'PENDING' && 'Pending review'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-450">
                        No leave applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar controls */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-indigo-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 font-mono">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-indigo-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                {/* Days of week */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[9px] font-extrabold uppercase tracking-wider text-slate-400 py-1.5">
                    {d}
                  </div>
                ))}

                {/* Day cells */}
                {generateCalendarDays().map((cell, idx) => {
                  const leave = getLeaveForDate(cell.dateStr);
                  const holiday = HOLIDAYS[cell.dateStr];
                  const isSelectedStart = cell.dateStr === startDate;
                  const isSelectedEnd = cell.dateStr === endDate;
                  const isWithinRange = startDate && endDate && cell.dateStr > startDate && cell.dateStr < endDate;
                  
                  // Styling states
                  let cellBg = cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/10 text-slate-350';
                  let cellText = cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400';
                  let cellBorder = 'border border-slate-100/50';

                  if (isWithinRange) {
                    cellBg = 'bg-indigo-50/60';
                    cellText = 'text-indigo-600 font-bold';
                    cellBorder = 'border-y border-indigo-100';
                  }
                  if (isSelectedStart || isSelectedEnd) {
                    cellBg = 'bg-indigo-600';
                    cellText = 'text-white font-extrabold';
                    cellBorder = 'border border-indigo-600';
                  }

                  // Hover styling
                  const hoverStyle = cell.isCurrentMonth ? 'hover:border-indigo-300 hover:bg-slate-50/50' : '';

                  return (
                    <div
                      key={idx}
                      onClick={() => cell.isCurrentMonth && handleCalendarDayClick(cell.dateStr)}
                      className={`relative min-h-[64px] p-1.5 rounded-xl cursor-pointer flex flex-col justify-between transition-all select-none ${cellBg} ${cellText} ${cellBorder} ${hoverStyle}`}
                    >
                      {/* Day number */}
                      <span className="text-[10px] font-bold font-mono self-start">
                        {cell.day}
                      </span>

                      {/* Holiday Badge */}
                      {holiday && cell.isCurrentMonth && (
                        <div 
                          className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"
                          title={`${holiday.name} (${holiday.type} Holiday)`}
                        />
                      )}

                      {/* Content block: leave info */}
                      {leave && cell.isCurrentMonth && !isSelectedStart && !isSelectedEnd && (
                        <div 
                          className={`w-full text-[8px] py-0.5 px-1 rounded-md font-bold uppercase tracking-wider text-center truncate ${
                            leave.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                              : leave.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-600 border-rose-100/50'
                              : 'bg-amber-50 text-amber-600 border-amber-100/50'
                          }`}
                          title={`${leave.leaveType} Leave (${leave.status})`}
                        >
                          {leave.leaveType.substring(0, 3)}
                        </div>
                      )}

                      {/* Selection label */}
                      {isSelectedStart && (
                        <span className="text-[7px] font-black uppercase tracking-widest text-indigo-200">Start</span>
                      )}
                      {isSelectedEnd && (
                        <span className="text-[7px] font-black uppercase tracking-widest text-indigo-200">End</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend/Info Banner */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-slate-500 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Approved</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Holiday</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-sm bg-indigo-650 bg-indigo-600" />
                    <span>Selected Range</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 font-semibold">
                  <Info className="h-3.5 w-3.5 text-slate-350 shrink-0" />
                  <span>Tip: Click days to select a date range.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
