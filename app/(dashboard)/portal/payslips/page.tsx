// app/(dashboard)/portal/payslips/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, Payslip, EmployeeProfile } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function StaffPayslipsPage() {
  const { user, logAction } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  useEffect(() => {
    if (user) {
      const emp = mockDb.getEmployeeByUserId(user.id);
      if (emp) {
        setProfile(emp);
        
        // Find issued and paid payslips (do not show raw drafts to employees)
        const slips = mockDb.getPayslipsByEmployee(emp.id).filter(s => s.status === 'PAID' || s.status === 'ISSUED');
        setPayslips(slips);
        
        logAction('VIEW_MY_PAYSLIPS_LIST', 'Payslip', 'User loaded their personal payslips checklist.');
      }
    }
  }, [user]);

  if (!user) return null;

  if (!profile) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-slate-800">Payslips Loading Error</h3>
        <p className="text-xs text-slate-500">
          This system account is a global role with no linked employee profile. Switch to a Staff Employee profile in the simulator to inspect payslips.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Payslips</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Review your salary statement histories and download receipts</p>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-100/50 rounded-2xl p-4 flex items-start space-x-3 text-xs text-indigo-950 font-semibold leading-relaxed shadow-sm">
        <AlertCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong>Payslip Availability:</strong> Statements are generated automatically at the end of each payroll run cycle and are made available instantly upon HR payment authorization. 
        </div>
      </div>

      {/* Payslips table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Payment Period</th>
                <th className="py-4 px-6">Earnings Breakdown</th>
                <th className="py-4 px-6">Tax Withheld</th>
                <th className="py-4 px-6">Total Deductions</th>
                <th className="py-4 px-6">Net Take-Home</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-slate-700 font-semibold">
              {payslips.length > 0 ? (
                payslips.map((ps) => {
                  const allowancesSum = ps.allowances.reduce((acc, a) => acc + a.amount, 0);
                  return (
                    <tr 
                      key={ps.id}
                      className="hover:bg-slate-50/45 transition-colors"
                    >
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs">Monthly Compensation</span>
                          <span className="text-[9px] text-slate-400 flex items-center space-x-1 mt-0.5 font-bold">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-350" />
                            <span>Statement Ref: {ps.id.substring(0, 8).toUpperCase()}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 font-mono text-slate-500">
                        <div className="flex flex-col leading-normal font-bold">
                          <span>Base: ₱{Number(ps.baseSalary).toLocaleString()}</span>
                          {allowancesSum > 0 && <span className="text-[10px] text-emerald-600 font-extrabold">+Allowances: ₱{allowancesSum.toLocaleString()}</span>}
                        </div>
                      </td>
                      <td className="py-4.5 px-6 font-mono font-bold text-slate-500">₱{Number(ps.taxWithheld).toLocaleString()}</td>
                      <td className="py-4.5 px-6 font-mono font-bold text-rose-500">-₱{Number(ps.totalDeductions).toLocaleString()}</td>
                      <td className="py-4.5 px-6 font-mono font-bold text-emerald-600">₱{Number(ps.netPay).toLocaleString()}</td>
                      <td className="py-4.5 px-6">
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border
                          ${ps.status === 'PAID' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }
                        `}>
                          {ps.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <Link
                          href={`/portal/payslips/${ps.id}`}
                          className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg py-1.5 px-3 cursor-pointer shadow-sm"
                        >
                          <span>Inspect Payslip</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-450">
                    No issued payslips found in your records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
