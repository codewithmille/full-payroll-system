// app/(dashboard)/portal/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, EmployeeProfile, Payslip, LeaveBalance, LeaveRequest } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { 
  CreditCard, 
  Calendar, 
  Search, 
  Bell, 
  Plus, 
  FileText, 
  Check, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Shield
} from 'lucide-react';

export default function StaffPortalHomePage() {
  const { user, logAction } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [lastPayslip, setLastPayslip] = useState<Payslip | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [recentSlips, setRecentSlips] = useState<Payslip[]>([]);
  const [ytdCompensation, setYtdCompensation] = useState<number>(0);

  useEffect(() => {
    if (user) {
      const emp = mockDb.getEmployeeByUserId(user.id);
      if (emp) {
        setProfile(emp);
        const slips = mockDb.getPayslipsByEmployee(emp.id).filter(s => s.status === 'PAID' || s.status === 'ISSUED');
        setRecentSlips(slips.slice(0, 5));
        if (slips.length > 0) {
          setLastPayslip(slips[0]);
        }
        setBalances(mockDb.getLeaveBalances(emp.id));
        setRequests(mockDb.getLeaveRequests().filter(r => r.employeeId === emp.id).slice(0, 5));
        
        // Calculate YTD compensation dynamically
        const totalYtd = slips.reduce((acc, s) => acc + s.netPay, 0);
        setYtdCompensation(totalYtd);
        
        logAction('VIEW_PORTAL_DASHBOARD', 'EmployeeProfile', 'User loaded portal home styled in mockup aesthetic.');
      }
    }
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm mt-10">
        <Shield className="h-10 w-10 text-indigo-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Portal Notice</h3>
        <p className="text-xs text-slate-500">
          This simulated administrator role does not have an employee profile. Use the role selector to switch to "Staff Employee" (Jane Doe) to evaluate the staff self-service workspace.
        </p>
      </div>
    );
  }

  // Calculate totals
  const vacationRemaining = balances.find(b => b.leaveType === 'VACATION')?.allocated || 15;
  const sickRemaining = balances.find(b => b.leaveType === 'SICK')?.allocated || 10;
  const totalRemainingLeaves = balances.reduce((acc, b) => acc + (Number(b.allocated) - Number(b.used)), 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* LEFT & CENTER PORTIONS (col-span-2) */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Portal Dashboard</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Welcome back, {profile.firstName}!</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="h-9 w-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all shadow-sm cursor-pointer">
              <Search className="h-4.5 w-4.5" />
            </button>
            <button className="h-9 w-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all shadow-sm relative cursor-pointer">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Cobalt Gradient Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(99,102,241,0.12)] relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">BASE MONTHLY PAY</p>
            <h3 className="text-xl font-black font-mono tracking-tight">₱{profile.baseSalary.toLocaleString()}</h3>
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
              <CreditCard className="h-24 w-24" />
            </div>
          </div>

          <div className="bg-gradient-to-tr from-blue-500 via-indigo-600 to-indigo-600 text-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(79,70,229,0.12)] relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">LEAVE CREDIT UNITS</p>
            <h3 className="text-xl font-black font-mono tracking-tight">{totalRemainingLeaves} Days</h3>
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
              <Calendar className="h-24 w-24" />
            </div>
          </div>

          <div className="bg-gradient-to-tr from-violet-500 via-purple-600 to-indigo-600 text-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(124,58,237,0.12)] relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">YTD COMPENSATION</p>
            <h3 className="text-xl font-black font-mono tracking-tight">
              ₱{ytdCompensation > 0 ? ytdCompensation.toLocaleString() : 'N/A'}
            </h3>
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
              <TrendingUp className="h-24 w-24" />
            </div>
          </div>

        </div>

        {/* Middle row widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Leaves status details card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex justify-between items-center relative overflow-hidden">
            <div className="space-y-2 max-w-[70%]">
              <span className="text-[9px] font-extrabold text-indigo-500 tracking-wider uppercase">Active Coverage</span>
              <h4 className="text-sm font-black text-slate-800">Leaves Request Summary</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track pending approvals or submit new sick and vacation applications.
              </p>
            </div>
            
            {/* Circular dial widget from image mockup */}
            <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-slate-100 fill-none" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" className="stroke-indigo-500 fill-none" strokeWidth="4" strokeDasharray="175" strokeDashoffset="40" />
              </svg>
              <span className="absolute text-[9px] font-extrabold text-indigo-600">START</span>
            </div>
          </div>

          {/* Secure clearances details card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[130px]">
            <div className="absolute top-0 right-0 p-2 text-[9px] font-bold text-slate-400 bg-slate-50 border-l border-b border-slate-100 rounded-bl-xl uppercase tracking-wider">
              CLEARANCE SECURE
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital ID Details</h4>
              <p className="text-base font-extrabold text-slate-800 font-mono mt-1">{profile.employeeId}</p>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Tax Registration Number:</span>
              <strong className="font-mono text-slate-600">{profile.taxIdNumber || 'N/A'}</strong>
            </div>
          </div>

        </div>

        {/* Bottom portion: Recent Payslips (styled exactly like Recent Orders table) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Recent Payslips</h3>
            <Link href="/portal/payslips" className="text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 tracking-wider">SEE ALL</Link>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-55 pb-2">
                  <th className="pb-2">Period ID</th>
                  <th className="pb-2">Base Salary</th>
                  <th className="pb-2">Tax Withheld</th>
                  <th className="pb-2">Net Payout</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
                {recentSlips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-bold text-slate-800">#{ps.id.substring(0, 8).toUpperCase()}</td>
                    <td className="py-3 font-mono">₱{ps.baseSalary.toLocaleString()}</td>
                    <td className="py-3 font-mono text-slate-400">₱{ps.taxWithheld.toLocaleString()}</td>
                    <td className="py-3 font-mono text-slate-800">₱{ps.netPay.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`
                        px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border
                        ${ps.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }
                      `}>
                        {ps.status === 'PAID' ? 'Delivered' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE SUMMARY PANEL (col-span-1) */}
      <div className="xl:col-span-1 space-y-6 xl:border-l xl:border-slate-200/50 xl:pl-8">
        
        {/* Title */}
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Summary</h2>
        </div>

        {/* Your Balance card from mockup */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 relative">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
            <span>Remaining Sick Leaves</span>
            <span className="cursor-pointer text-slate-350 hover:text-slate-500">•••</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 font-mono">{sickRemaining} Day(s)</h2>
            <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-bold pt-1">
              <span className="text-emerald-500">▲ Allocated: 10</span>
              <span className="text-rose-500">▼ Pending: 0</span>
            </div>
          </div>

          {/* Red Plus floating action key */}
          <Link
            href="/portal/leaves"
            className="absolute right-5 top-1/2 -translate-y-1/2 h-10 w-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
            title="Apply Leave"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Recent Leaves Activity Log */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800">Activity</span>
            <Link href="/portal/leaves" className="text-indigo-500 hover:text-indigo-600 text-[10px] tracking-wider">SEE ALL</Link>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-xs">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center
                    ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}
                  `}>
                    {req.status === 'APPROVED' ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{req.leaveType} Leave</h5>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{req.startDate}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-500">{req.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top categories pastel cards */}
        <div className="space-y-4 pt-2">
          <div className="text-xs font-bold text-slate-800">
            <span>Corporate Benefit Coverage</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Pastel yellow */}
            <div className="p-4 bg-amber-50 border border-amber-100/30 rounded-2xl space-y-3">
              <div className="h-8 w-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800">Vacation</h5>
                <p className="text-[10px] text-amber-600 font-extrabold mt-0.5">{vacationRemaining} Credits</p>
              </div>
            </div>

            {/* Pastel green */}
            <div className="p-4 bg-emerald-50 border border-emerald-100/30 rounded-2xl space-y-3">
              <div className="h-8 w-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800">Medical Ins</h5>
                <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">100% Covered</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
