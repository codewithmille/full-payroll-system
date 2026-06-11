// app/(dashboard)/payroll/runs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, PayrollRun } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { 
  Plus, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

export default function PayrollRunsPage() {
  const { logAction } = useAuth();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  
  // Wizard Form State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  useEffect(() => {
    setRuns(mockDb.getPayrollRuns());
    logAction('VIEW_PAYROLL_RUNS_LIST', 'PayrollRun', 'User viewed the payroll run cycles overview.');
  }, []);

  const handleStartRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !paymentDate) return;

    const newRun = mockDb.createPayrollRun({
      name,
      startDate,
      endDate,
      paymentDate
    });

    logAction('CREATE_PAYROLL_RUN', 'PayrollRun', `Created draft payroll run cycle: "${name}" (${startDate} to ${endDate}).`);
    setRuns(mockDb.getPayrollRuns());
    setShowWizard(false);

    // Reset fields
    setName('');
    setStartDate('');
    setEndDate('');
    setPaymentDate('');
  };

  // Calculations for summary stats
  const totalExpenses = runs.filter(r => r.status === 'PAID').reduce((acc, r) => acc + Number(r.totalGrossPay), 0);
  const activeDraftCycles = runs.filter(r => r.status === 'DRAFT' || r.status === 'APPROVED').length;
  const completedCyclesCount = runs.filter(r => r.status === 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Payroll Runs</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Generate, compute, and authorize salary disbursements</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
          <span className="text-sm">Start New Cycle</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Paid (YTD)</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">₱{totalExpenses.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <CreditCard className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Cycles</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">{activeDraftCycles} Draft</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Paid Cycles</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">{completedCyclesCount} Cycles</h3>
          </div>
        </div>
      </div>

      {/* Cycles History Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Cycle Name</th>
                <th className="py-4 px-6">Payment Period</th>
                <th className="py-4 px-6">Payment Date</th>
                <th className="py-4 px-6">Gross Disbursement</th>
                <th className="py-4 px-6">Net Payout</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-slate-700 font-semibold">
              {runs.map((run) => (
                <tr 
                  key={run.id}
                  className="hover:bg-slate-50/45 transition-colors"
                >
                  <td className="py-4.5 px-6 font-bold text-slate-850 text-xs">{run.name}</td>
                  <td className="py-4.5 px-6 text-slate-500 font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{run.startDate} to {run.endDate}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-slate-500 font-semibold">{run.paymentDate}</td>
                  <td className="py-4.5 px-6 font-mono font-bold">₱{Number(run.totalGrossPay).toLocaleString()}</td>
                  <td className="py-4.5 px-6 font-mono font-bold text-emerald-600">₱{Number(run.totalNetPay).toLocaleString()}</td>
                  <td className="py-4.5 px-6">
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border
                      ${run.status === 'PAID' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : run.status === 'APPROVED'
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        : run.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                      }
                    `}>
                      {run.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    <Link
                      href={`/payroll/runs/${run.id}`}
                      className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg py-1.5 px-3 cursor-pointer shadow-sm"
                    >
                      <span>{run.status === 'DRAFT' ? 'Compute' : 'Details'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Cycle Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowWizard(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleStartRun} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold border-b border-slate-100 pb-3 mb-2">
                <CreditCard className="h-5 w-5" />
                <h3 className="text-sm uppercase tracking-wider">New Payroll Cycle</h3>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Cycle Identifier / Name</label>
                <input
                  type="text"
                  placeholder="e.g. June 2026 First Half"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Target Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                  required
                />
              </div>

              <div className="text-[10px] text-slate-400 leading-normal bg-slate-50 p-3 border border-slate-100 rounded-xl font-semibold">
                ⚠️ <strong>Note:</strong> Starting a new cycle will automatically pull all currently active employee profiles and prepare temporary drafts of their payslips based on their base salary.
              </div>

              <div className="flex gap-3 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  Generate Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
