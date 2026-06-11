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
  Plus
} from 'lucide-react';

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Leave History */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Clock className="h-4.5 w-4.5 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">My Leave Applications</h2>
          </div>

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
        </div>
      </div>
    </div>
  );
}
