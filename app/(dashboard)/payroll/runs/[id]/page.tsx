// app/(dashboard)/payroll/runs/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { mockDb, PayrollRun, Payslip } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CreditCard, 
  Settings, 
  AlertCircle,
  CheckCircle2, 
  Calendar, 
  DollarSign,
  Plus,
  Trash2,
  Save,
  X,
  Edit3
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PayrollRunDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, logAction } = useAuth();

  const [run, setRun] = useState<PayrollRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Allowance & Deduction editor states (for selected payslip adjustment)
  const [editOvertime, setEditOvertime] = useState(0);
  const [editAllowances, setEditAllowances] = useState<{ name: string; amount: number }[]>([]);
  const [editStatutory, setEditStatutory] = useState<{ name: string; amount: number }[]>([]);
  const [editOther, setEditOther] = useState<{ name: string; amount: number }[]>([]);
  const [editTax, setEditTax] = useState(0);

  // Temp addition states
  const [newAllowanceName, setNewAllowanceName] = useState('');
  const [newAllowanceAmount, setNewAllowanceAmount] = useState('');
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const r = mockDb.getPayrollRuns().find(item => item.id === id);
    if (r) {
      setRun(r);
      setPayslips(mockDb.getPayslipsByRun(id));
      logAction('VIEW_PAYROLL_CYCLE_DETAILS', 'PayrollRun', `Viewed payroll cycle computation detail for "${r.name}".`);
    } else {
      router.push('/payroll/runs');
    }
  };

  const handleOpenAdjustment = (ps: Payslip) => {
    setSelectedPayslip(ps);
    setEditOvertime(ps.overtimePay);
    setEditAllowances([...ps.allowances]);
    setEditStatutory([...ps.statutoryDeductions]);
    setEditOther([...ps.otherDeductions]);
    setEditTax(ps.taxWithheld);
    
    // Reset temp inputs
    setNewAllowanceName('');
    setNewAllowanceAmount('');
    setNewDeductionName('');
    setNewDeductionAmount('');
  };

  const handleAddAllowance = () => {
    if (!newAllowanceName || !newAllowanceAmount) return;
    setEditAllowances(prev => [...prev, { name: newAllowanceName, amount: Number(newAllowanceAmount) }]);
    setNewAllowanceName('');
    setNewAllowanceAmount('');
  };

  const handleRemoveAllowance = (index: number) => {
    setEditAllowances(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDeduction = () => {
    if (!newDeductionName || !newDeductionAmount) return;
    setEditOther(prev => [...prev, { name: newDeductionName, amount: Number(newDeductionAmount) }]);
    setNewDeductionName('');
    setNewDeductionAmount('');
  };

  const handleRemoveDeduction = (index: number) => {
    setEditOther(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAdjustments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayslip || !run) return;

    const updatedPayslip: Payslip = {
      ...selectedPayslip,
      overtimePay: Number(editOvertime),
      taxWithheld: Number(editTax),
      allowances: editAllowances,
      statutoryDeductions: editStatutory,
      otherDeductions: editOther,
    };

    mockDb.updatePayslip(updatedPayslip);
    logAction('ADJUST_PAYSLIP_COMPUTATION', 'Payslip', `Adjusted payroll parameters for employee ${selectedPayslip.employeeName} in cycle "${run.name}".`);
    
    // Reload state
    loadData();
    setSelectedPayslip(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleStatusChange = (newStatus: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED') => {
    if (!run) return;
    mockDb.updatePayrollRunStatus(run.id, newStatus);
    
    let actionLog = 'APPROVE_PAYROLL_COMPUTATIONS';
    let details = `Approved all salary calculations for cycle "${run.name}". Ready for payment disbursement.`;
    if (newStatus === 'PAID') {
      actionLog = 'RELEASE_PAYROLL_RUN_PAYMENTS';
      details = `Released disbursements and paid salaries for cycle "${run.name}". Payslips issued to staff portals.`;
    } else if (newStatus === 'CANCELLED') {
      actionLog = 'CANCEL_PAYROLL_RUN';
      details = `Cancelled payroll computation cycle "${run.name}".`;
    }

    logAction(actionLog, 'PayrollRun', details);
    loadData();
  };

  if (!run) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Back & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/payroll/runs"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-450 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Payroll Runs</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{run.name}</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Status: <span className="uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/30 text-[10px] tracking-wider ml-1.5">{run.status}</span></p>
        </div>

        {/* Action Controls depending on Status */}
        <div className="flex items-center space-x-3 self-end sm:self-auto text-xs font-bold">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold shadow-sm">
              Recalculated & Saved!
            </span>
          )}

          {run.status === 'DRAFT' && (
            <>
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                className="bg-white hover:bg-slate-50 text-slate-550 border border-slate-200 py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Cancel Cycle
              </button>
              <button
                onClick={() => handleStatusChange('APPROVED')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                Approve Computations
              </button>
            </>
          )}

          {run.status === 'APPROVED' && (
            <>
              <button
                onClick={() => handleStatusChange('DRAFT')}
                className="bg-white hover:bg-slate-50 text-slate-550 border border-slate-200 py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Revert to Draft
              </button>
              <button
                onClick={() => handleStatusChange('PAID')}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-2 px-4 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Disburse Payments
              </button>
            </>
          )}

          {run.status === 'PAID' && (
            <span className="flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl font-bold shadow-sm">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>Payments Disbursed</span>
            </span>
          )}
        </div>
      </div>

      {/* Cycle Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gross Payroll</p>
          <h3 className="text-lg font-black text-slate-800 mt-1 font-mono">${Number(run.totalGrossPay).toLocaleString()}</h3>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Deductions</p>
          <h3 className="text-lg font-black text-rose-500 mt-1 font-mono">${Number(run.totalDeductions).toLocaleString()}</h3>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Net Payout</p>
          <h3 className="text-lg font-black text-emerald-600 mt-1 font-mono">${Number(run.totalNetPay).toLocaleString()}</h3>
        </div>
      </div>

      {/* Details Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-slate-500 shadow-sm font-semibold">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4.5 w-4.5 text-slate-400" />
          <span>Accounting Period: <strong className="text-slate-700">{run.startDate}</strong> to <strong className="text-slate-700">{run.endDate}</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4.5 w-4.5 text-slate-400" />
          <span>Disbursement Date: <strong className="text-slate-700">{run.paymentDate}</strong></span>
        </div>
      </div>

      {/* Employee Payslips Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Staff Member</th>
                <th className="py-4 px-6">Job & Dept</th>
                <th className="py-4 px-6">Base Salary</th>
                <th className="py-4 px-6">Overtime</th>
                <th className="py-4 px-6">Allowances</th>
                <th className="py-4 px-6">Deductions</th>
                <th className="py-4 px-6">Net Pay</th>
                {run.status === 'DRAFT' && <th className="py-4 px-6 text-right">Adjustments</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-slate-655 font-semibold">
              {payslips.map((ps) => {
                const totalAllowances = ps.allowances.reduce((acc, a) => acc + a.amount, 0);
                return (
                  <tr key={ps.id} className="hover:bg-slate-50/45 transition-colors">
                    <td className="py-4.5 px-6 font-bold text-slate-800 text-xs">{ps.employeeName}</td>
                    <td className="py-4.5 px-6 text-slate-500 leading-normal">
                      <div>{ps.jobTitle}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{ps.department}</div>
                    </td>
                    <td className="py-4.5 px-6 font-mono font-bold">${Number(ps.baseSalary).toLocaleString()}</td>
                    <td className="py-4.5 px-6 font-mono text-slate-400">${Number(ps.overtimePay).toLocaleString()}</td>
                    <td className="py-4.5 px-6 font-mono text-emerald-600">${totalAllowances.toLocaleString()}</td>
                    <td className="py-4.5 px-6 font-mono text-rose-500">${Number(ps.totalDeductions).toLocaleString()}</td>
                    <td className="py-4.5 px-6 font-mono font-bold text-slate-800">${Number(ps.netPay).toLocaleString()}</td>
                    {run.status === 'DRAFT' && (
                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={() => handleOpenAdjustment(ps)}
                          className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-lg py-1.5 px-2.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Encode</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustments Encoding Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleSaveAdjustments} className="space-y-6 text-xs font-bold text-slate-700">
              {/* Header */}
              <div className="border-b border-slate-105 pb-3">
                <h3 className="text-base font-black text-slate-800">Adjust Computations</h3>
                <p className="text-slate-405 text-[10px] text-slate-400 font-semibold mt-0.5">Encoding parameters for {selectedPayslip.employeeName} ({selectedPayslip.employeeIdCode})</p>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Income / Earnings */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 border-b border-slate-100 pb-1.5">Earnings & Additions</h4>
                  
                  {/* Overtime */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Overtime Payout (USD)</label>
                    <input
                      type="number"
                      value={editOvertime}
                      onChange={(e) => setEditOvertime(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 font-mono transition-all"
                      min="0"
                    />
                  </div>

                  {/* Allowances List */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">Custom Allowances</label>
                    
                    {/* Add Allowance Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Allowance Name"
                        value={newAllowanceName}
                        onChange={(e) => setNewAllowanceName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newAllowanceAmount}
                        onChange={(e) => setNewAllowanceAmount(e.target.value)}
                        className="w-24 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddAllowance}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all cursor-pointer shadow-sm hover:border-indigo-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Allowances Display */}
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {editAllowances.map((al, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                          <span className="text-slate-600">{al.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-emerald-600 font-bold">+${al.amount}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAllowance(idx)}
                              className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-600 border-b border-slate-100 pb-1.5">Deductions & Taxes</h4>

                  {/* Withholding Tax */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Withholding Income Tax (USD)</label>
                    <input
                      type="number"
                      value={editTax}
                      onChange={(e) => setEditTax(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 font-mono transition-all"
                      min="0"
                    />
                  </div>

                  {/* Other Deductions List */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider">Other / Custom Deductions</label>

                    {/* Add Deduction Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Deduction Name"
                        value={newDeductionName}
                        onChange={(e) => setNewDeductionName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newDeductionAmount}
                        onChange={(e) => setNewDeductionAmount(e.target.value)}
                        className="w-24 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-800 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddDeduction}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all cursor-pointer shadow-sm hover:border-rose-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Deductions Display */}
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {editOther.map((ded, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-55 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                          <span className="text-slate-600">{ded.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-rose-600 font-bold">-${ded.amount}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeduction(idx)}
                              className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedPayslip(null)}
                  className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Computations</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
