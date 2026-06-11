// app/(dashboard)/payroll/settings/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Settings, ShieldAlert, Percent, DollarSign, Scale, Award } from 'lucide-react';

export default function PayrollSettingsPage() {
  const { logAction } = useAuth();
  
  useEffect(() => {
    logAction('VIEW_PAYROLL_CONFIG_SETTINGS', 'SystemConfig', 'User viewed the global tax and payroll settings.');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Payroll Configuration</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Configure global contribution thresholds, tax brackets, and overtime parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Parameters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Statutory Contributions Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Percent className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Statutory Deductions (Mock Tables)</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-xs space-y-1 font-bold">
                  <span className="text-slate-400 font-extrabold uppercase text-[9px]">Social Security Rate</span>
                  <p className="text-sm font-black text-slate-805 text-slate-800 font-mono">4.50%</p>
                  <p className="text-[9px] text-slate-400 font-semibold">Applied on Monthly Basic</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-xs space-y-1 font-bold">
                  <span className="text-slate-400 font-extrabold uppercase text-[9px]">Health Insurance Rate</span>
                  <p className="text-sm font-black text-slate-805 text-slate-800 font-mono">2.00%</p>
                  <p className="text-[9px] text-slate-400 font-semibold">Capped at $600 per month</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-xs space-y-1 font-bold">
                  <span className="text-slate-400 font-extrabold uppercase text-[9px]">Housing Mutual Fund</span>
                  <p className="text-sm font-black text-slate-805 text-slate-800 font-mono">$200.00</p>
                  <p className="text-[9px] text-slate-400 font-semibold">Flat rate contribution</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Brackets Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Scale className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Income Tax Bracket Thresholds</h3>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[9px] tracking-widest pb-2">
                    <th className="pb-2">Monthly Income Range</th>
                    <th className="pb-2">Base Tax Rate</th>
                    <th className="pb-2 text-right">Adjustment / Fixed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 text-slate-600 font-semibold">
                  <tr>
                    <td className="py-2.5">Up to $40,000</td>
                    <td className="py-2.5">10%</td>
                    <td className="py-2.5 text-right font-mono font-bold">$0</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">$40,001 to $70,000</td>
                    <td className="py-2.5">12%</td>
                    <td className="py-2.5 text-right font-mono font-bold">$2,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">$70,001 to $90,000</td>
                    <td className="py-2.5">18%</td>
                    <td className="py-2.5 text-right font-mono font-bold">$5,600</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">Above $90,000</td>
                    <td className="py-2.5">22%</td>
                    <td className="py-2.5 text-right font-mono font-bold">$9,200</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Overtime Rates */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <DollarSign className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Overtime Multipliers</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200/50 rounded-xl p-3.5">
                <span className="text-slate-500">Standard Overtime (Ordinary Days)</span>
                <span className="font-mono text-indigo-600 font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-lg">125% (1.25x)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200/50 rounded-xl p-3.5">
                <span className="text-slate-500">Rest Day / Holiday Overtime</span>
                <span className="font-mono text-indigo-600 font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-lg">200% (2.00x)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Security Audit & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Award className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">System Parameters</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              These values represent company global parameters and are referenced during payroll runs when creating draft cycles. 
            </p>

            <div className="bg-indigo-50 border border-indigo-100/50 rounded-xl p-4 flex items-start space-x-2.5 text-xs text-indigo-950 font-semibold leading-relaxed shadow-sm">
              <ShieldAlert className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong>Auditing Policy:</strong> System settings configuration changes require Admin approval and will publish audit records.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
