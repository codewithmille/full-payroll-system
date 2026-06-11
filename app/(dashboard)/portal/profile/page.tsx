// app/(dashboard)/portal/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, EmployeeProfile } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  User, 
  Briefcase, 
  CreditCard, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Calendar,
  Building2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function StaffProfilePage() {
  const { user, logAction } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [showSalary, setShowSalary] = useState(false);

  useEffect(() => {
    if (user) {
      const emp = mockDb.getEmployeeByUserId(user.id);
      if (emp) {
        setProfile(emp);
        logAction('VIEW_MY_PROFILE', 'EmployeeProfile', 'User viewed their personal profile record details.');
      }
    }
  }, [user]);

  const toggleSalary = () => {
    if (!showSalary && profile) {
      logAction('ACCESS_OWN_CONFIDENTIAL_SALARY', 'EmployeeProfile', 'User toggled visibility to inspect their base salary parameter.');
    }
    setShowSalary(!showSalary);
  };

  if (!user) return null;

  if (!profile) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-slate-800">Profile Loading Error</h3>
        <p className="text-xs text-slate-500">
          This system account is a global role with no linked employee profile. Switch to a Staff Employee profile in the simulator to view personal details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Employee Profile</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Verify your employment details, tax registrations, and bank coordinates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-3xl text-white shadow-inner border-2 border-white">
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-850 text-slate-800">{profile.firstName} {profile.lastName}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">{profile.jobTitle}</p>
            <span className="inline-flex mt-3 text-[10px] font-mono bg-slate-50 text-slate-500 font-bold py-0.5 px-2.5 rounded-lg border border-slate-205/50">
              {profile.employeeId}
            </span>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 space-y-3.5 text-left text-xs text-slate-500 font-semibold">
            <div className="flex items-center space-x-2.5">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{profile.personalEmail}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-start space-x-2.5 leading-relaxed">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{profile.address}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Work details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Briefcase className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Employment Metadata</h4>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Department</span>
                <p className="text-sm font-black text-slate-800">{profile.department}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Employment Type</span>
                <p className="text-sm font-black text-slate-800 capitalize">{profile.employmentType.toLowerCase().replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Hire Date</span>
                <p className="text-sm font-black text-slate-800">{profile.dateHired}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Status</span>
                <div>
                  <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {profile.employmentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary & Finance details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Compensation & Banking</h4>
            </div>

            {/* Base Pay */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md shadow-sm">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Confidential Monthly Rate (USD)</span>
              <div className="flex items-center space-x-3">
                <div className="font-mono text-base font-black text-slate-800 tracking-wider flex-1">
                  {showSalary ? `$${profile.baseSalary.toLocaleString()}` : '••••••••'}
                </div>
                <button
                  type="button"
                  onClick={toggleSalary}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {showSalary ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-bold text-slate-700 pt-2">
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Bank Name</span>
                <p className="text-sm font-black text-slate-800">{profile.bankName || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Bank Account Number</span>
                <p className="text-sm font-black text-slate-800 font-mono">{profile.bankAccountNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Tax Identification Number</span>
                <p className="text-sm font-black text-slate-800 font-mono">{profile.taxIdNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Social Security Number</span>
                <p className="text-sm font-black text-slate-800 font-mono">{profile.socialSecurityNo || 'N/A'}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
