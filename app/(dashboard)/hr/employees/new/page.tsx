// app/(dashboard)/hr/employees/new/page.tsx
'use client';

import React, { useState } from 'react';
import { mockDb, EmployeeProfile } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Briefcase, CreditCard, User, ShieldAlert } from 'lucide-react';

export default function NewEmployeePage() {
  const router = useRouter();
  const { logAction } = useAuth();

  // Form State
  const [formData, setFormData] = useState<Omit<EmployeeProfile, 'id' | 'employeeId'>>({
    firstName: '',
    lastName: '',
    middleName: '',
    personalEmail: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Female',
    address: '',
    jobTitle: '',
    department: '',
    dateHired: new Date().toISOString().split('T')[0],
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 45000,
    taxIdNumber: '',
    socialSecurityNo: '',
    healthInsuranceNo: '',
    housingFundNo: '',
    bankName: '',
    bankAccountNumber: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'baseSalary' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate employee ID
    const year = new Date().getFullYear();
    const count = mockDb.getEmployees().length + 1;
    const paddedCount = String(count).padStart(4, '0');
    const employeeIdCode = `EMP-₱{year}-₱{paddedCount}`;

    const created = mockDb.saveEmployee({
      ...formData,
      employeeId: employeeIdCode
    });

    logAction('ONBOARD_NEW_EMPLOYEE', 'EmployeeProfile', `Onboarded new staff member ${created.firstName} ${created.lastName} with ID ${created.employeeId}.`);
    router.push('/hr/employees');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/hr/employees"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Employee Records</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Onboard New Employee</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Register a new staff member and configure work profiles</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs font-bold text-slate-700">
        {/* Section 1: Personal Details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User className="h-4.5 w-4.5 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-slate-450 text-slate-400 mb-1.5 uppercase tracking-wider">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="Jane"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="Doe"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Middle Name (Optional)</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="Marie"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 cursor-pointer transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Personal Email</label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="jane.doe@company.com"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Residential Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 resize-none transition-all"
                placeholder="Street address, City, Province, Zip code"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Employment Details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase className="h-4.5 w-4.5 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Employment Metadata</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="Software Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="Engineering"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Date Hired</label>
              <input
                type="date"
                name="dateHired"
                value={formData.dateHired}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 cursor-pointer transition-all"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="PROBATIONARY">Probationary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Financial & Government Identifiers */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Financials & Security IDs</h2>
          </div>

          <div className="bg-indigo-50 border border-indigo-100/50 rounded-xl p-4 flex items-start space-x-3 text-xs text-indigo-950 font-semibold leading-relaxed mb-4 shadow-sm">
            <ShieldAlert className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong>Security Policy Note:</strong> Personal salary, bank coordinates, and tax values are treated as highly confidential. These details are stored securely. Only authorized accounts will be able to retrieve financial details.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Base Monthly Salary (USD)</label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-850 font-mono font-bold transition-all"
                placeholder="45000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 transition-all"
                placeholder="e.g. Apex Security Bank"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Bank Account Number</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 font-mono transition-all"
                placeholder="9900201384"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Tax ID Number (TIN)</label>
              <input
                type="text"
                name="taxIdNumber"
                value={formData.taxIdNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-855 font-mono transition-all"
                placeholder="TIN-000-000-000"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Social Security (SSS)</label>
              <input
                type="text"
                name="socialSecurityNo"
                value={formData.socialSecurityNo}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-855 font-mono transition-all"
                placeholder="SS-00-0000000-0"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Health Insurance (PhilHealth)</label>
              <input
                type="text"
                name="healthInsuranceNo"
                value={formData.healthInsuranceNo}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-855 font-mono transition-all"
                placeholder="PH-0000-0000-0"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 font-bold text-xs">
          <Link
            href="/hr/employees"
            className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 py-3 px-6 rounded-xl text-sm transition-all shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-6 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Save className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Complete Onboarding</span>
          </button>
        </div>
      </form>
    </div>
  );
}
