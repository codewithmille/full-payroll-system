// app/(dashboard)/portal/payslips/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { mockDb, Payslip, EmployeeProfile, PayrollRun } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Printer, 
  ShieldAlert, 
  Calendar, 
  User, 
  Briefcase, 
  CreditCard,
  Shield
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PayslipDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, logAction } = useAuth();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [run, setRun] = useState<PayrollRun | null>(null);

  useEffect(() => {
    const ps = mockDb.getPayslips().find(item => item.id === id);
    if (ps) {
      // Security: ensure the logged-in staff can only view their OWN payslip
      // (Unless they are ADMIN or PAYROLL_OFFICER, who can view details)
      const emp = mockDb.getEmployeeByUserId(user?.id || '');
      if (user?.role !== 'ADMIN' && user?.role !== 'PAYROLL_OFFICER' && emp?.id !== ps.employeeId) {
        // Unauthorized
        router.replace('/portal/payslips');
        return;
      }

      setPayslip(ps);
      const pr = mockDb.getPayrollRuns().find(item => item.id === ps.payrollRunId);
      if (pr) setRun(pr);

      logAction('ACCESS_PAYSLIP_RECEIPT', 'Payslip', `Downloaded/Viewed detailed payslip statement ref ${ps.id.substring(0, 8).toUpperCase()} for ${ps.employeeName}.`);
    } else {
      router.push('/portal/payslips');
    }
  }, [id, user]);

  const handlePrint = () => {
    if (payslip) {
      logAction('PRINT_PAYSLIP_STATEMENT', 'Payslip', `Sent payslip statement ref ${payslip.id.substring(0, 8).toUpperCase()} to print device.`);
    }
    window.print();
  };

  if (!payslip) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  const allowancesSum = payslip.allowances.reduce((acc, a) => acc + a.amount, 0);
  const statutorySum = payslip.statutoryDeductions.reduce((acc, s) => acc + s.amount, 0);
  const otherDeductionsSum = payslip.otherDeductions.reduce((acc, o) => acc + o.amount, 0);
  const grossPay = Number(payslip.baseSalary) + Number(payslip.overtimePay) + allowancesSum;

  return (
    <div className="space-y-6">
      {/* Header Controls (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <Link
          href="/portal/payslips"
          className="group inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-bold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to My Payslips</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-2.5 px-5 rounded-2xl text-xs tracking-wider transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-650/20 cursor-pointer self-start sm:self-auto transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Printer className="h-4.5 w-4.5 stroke-[2.5]" />
          <span>Print Statement / PDF</span>
        </button>
      </div>

      {/* Payslip Document (Optimized for print) */}
      <div className="w-full bg-white border border-slate-100 rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-100/30 relative overflow-hidden print:bg-white print:text-slate-900 print:shadow-none print:border-none print:p-0">
        
        {/* Top Accent Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 print:hidden"></div>

        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 print:border-zinc-300 pb-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-55/70 rounded-2xl text-indigo-600 print:hidden">
              <Shield className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-slate-800 print:text-zinc-900 uppercase">
                DIGITAL AGENCY INC.
              </h1>
              <p className="text-[11px] text-slate-500 print:text-zinc-500 mt-0.5">100 Innovation Way, Suite 400, Tech Valley</p>
              <p className="text-[9px] text-slate-400 print:text-zinc-500 font-mono mt-0.5">PAYSLIP ID: {payslip.id.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right self-stretch sm:self-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Official Statement</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100/80 print:border-zinc-300 print:text-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse print:hidden"></span>
              {payslip.status}
            </span>
          </div>
        </div>

        {/* Employee & Cycle details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 border border-slate-100 print:bg-zinc-50 print:border-zinc-200 rounded-2xl p-6 mb-8 text-xs text-slate-600 print:text-zinc-700">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 shrink-0 print:hidden">
                <User className="h-3.5 w-3.5" />
              </div>
              <span>Employee Name: <strong className="text-slate-800 print:text-zinc-900 font-black">{payslip.employeeName}</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 shrink-0 print:hidden">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              <span>Job Title: <strong className="text-slate-700 font-bold">{payslip.jobTitle}</strong> <span className="text-slate-500">({payslip.department})</span></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 shrink-0 print:hidden">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <span>Employee Ref: <strong className="font-mono text-slate-750 font-bold">{payslip.employeeIdCode}</strong></span>
            </div>
          </div>
          <div className="space-y-3 md:border-l md:border-slate-200/60 print:border-zinc-200 md:pl-6">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 shrink-0 print:hidden">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>Accounting Period: <strong className="text-slate-750 font-bold">{run?.startDate || 'N/A'} to {run?.endDate || 'N/A'}</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 shrink-0 print:hidden">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>Disbursement Date: <strong className="text-slate-750 font-bold">{run?.paymentDate || 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        {/* Breakdown Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Earnings */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 print:text-indigo-755 border-b border-slate-100 print:border-zinc-200 pb-2 flex items-center justify-between">
              <span>Earnings & Allowances</span>
              <span className="text-[9px] text-slate-400 font-medium normal-case print:hidden">Gross Credits</span>
            </h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-2 border-b border-slate-100/70 print:border-zinc-100">
                <span className="text-slate-600 print:text-zinc-600">Basic Monthly Rate</span>
                <span className="font-mono text-slate-800 print:text-zinc-900">₱{Number(payslip.baseSalary).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100/70 print:border-zinc-100">
                <span className="text-slate-600 print:text-zinc-600">Overtime Payout</span>
                <span className="font-mono text-slate-800 print:text-zinc-900">₱{Number(payslip.overtimePay).toLocaleString()}</span>
              </div>
              
              {/* Allowances list */}
              {payslip.allowances.map((al, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-slate-100/70 print:border-zinc-100">
                  <span className="text-slate-600 print:text-zinc-600">{al.name}</span>
                  <span className="font-mono text-emerald-700 print:text-emerald-700 font-bold">+₱{al.amount.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between py-3 border-t border-slate-200 print:border-zinc-200 font-black text-xs text-slate-800 uppercase tracking-wider">
                <span>Total Gross Income</span>
                <span className="font-mono text-slate-900 print:text-zinc-900 text-sm">₱{grossPay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-600 print:text-red-755 border-b border-slate-100 print:border-zinc-200 pb-2 flex items-center justify-between">
              <span>Deductions & Taxes</span>
              <span className="text-[9px] text-slate-400 font-medium normal-case print:hidden">Withholdings</span>
            </h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-2 border-b border-slate-100/70 print:border-zinc-100">
                <span className="text-slate-600 print:text-zinc-600">Withholding Income Tax</span>
                <span className="font-mono text-slate-800 print:text-zinc-900">-₱{Number(payslip.taxWithheld).toLocaleString()}</span>
              </div>

              {/* Statutory list */}
              {payslip.statutoryDeductions.map((sd, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-slate-100/70 print:border-zinc-100">
                  <span className="text-slate-600 print:text-zinc-600">{sd.name}</span>
                  <span className="font-mono text-rose-600 print:text-red-700 font-bold">-₱{sd.amount.toLocaleString()}</span>
                </div>
              ))}

              {/* Other deductions list */}
              {payslip.otherDeductions.map((od, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-slate-100/70 print:border-zinc-100">
                  <span className="text-slate-600 print:text-zinc-600">{od.name}</span>
                  <span className="font-mono text-rose-600 print:text-red-700 font-bold">-₱{od.amount.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between py-3 border-t border-slate-200 print:border-zinc-200 font-black text-xs text-slate-800 uppercase tracking-wider">
                <span>Total Deductions</span>
                <span className="font-mono text-rose-600 print:text-red-750 text-sm">-₱{Number(payslip.totalDeductions).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Net Payout Banner */}
        <div className="bg-emerald-500/[0.04] print:bg-zinc-150 border border-emerald-500/10 print:border-zinc-300 rounded-2xl p-6 flex justify-between items-center shadow-sm relative overflow-hidden">
          {/* Decorative glowing background badge */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-xl -z-10"></div>
          <div>
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">Net Payout Amount</span>
            <span className="text-xs text-slate-500 mt-1 block">Deposited to employee bank coordinates</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-600 print:text-emerald-700 font-mono tracking-tight">
            ${Number(payslip.netPay).toLocaleString()}
          </h2>
        </div>

        {/* Verification stamp/details */}
        <div className="border-t border-slate-100 print:border-zinc-200 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-400 space-y-2 sm:space-y-0">
          <span>This receipt is generated electronically. No signature is required.</span>
          <span className="font-mono">Security SHA256 Reference: {payslip.id.toUpperCase().substring(0, 16)}...</span>
        </div>

      </div>
    </div>
  );
}
