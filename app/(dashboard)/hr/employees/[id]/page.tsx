// app/(dashboard)/hr/employees/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { mockDb, EmployeeProfile, EmploymentStatus, EmploymentType } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  Trash2, 
  ShieldAlert, 
  Briefcase, 
  CreditCard, 
  User, 
  Eye, 
  EyeOff,
  CheckCircle,
  X
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { logAction } = useAuth();
  
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'financial'>('personal');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<EmployeeProfile, 'id' | 'employeeId'>>({
    firstName: '',
    lastName: '',
    middleName: '',
    personalEmail: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Other',
    address: '',
    jobTitle: '',
    department: '',
    dateHired: '',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: 0,
    taxIdNumber: '',
    socialSecurityNo: '',
    healthInsuranceNo: '',
    housingFundNo: '',
    bankName: '',
    bankAccountNumber: ''
  });

  useEffect(() => {
    const emp = mockDb.getEmployee(id);
    if (emp) {
      setEmployee(emp);
      setFormData({
        firstName: emp.firstName,
        lastName: emp.lastName,
        middleName: emp.middleName || '',
        personalEmail: emp.personalEmail,
        phone: emp.phone,
        dateOfBirth: emp.dateOfBirth,
        gender: emp.gender,
        address: emp.address,
        jobTitle: emp.jobTitle,
        department: emp.department,
        dateHired: emp.dateHired,
        employmentStatus: emp.employmentStatus,
        employmentType: emp.employmentType,
        baseSalary: emp.baseSalary,
        taxIdNumber: emp.taxIdNumber || '',
        socialSecurityNo: emp.socialSecurityNo || '',
        healthInsuranceNo: emp.healthInsuranceNo || '',
        housingFundNo: emp.housingFundNo || '',
        bankName: emp.bankName || '',
        bankAccountNumber: emp.bankAccountNumber || ''
      });
      logAction('VIEW_EMPLOYEE_PROFILE', 'EmployeeProfile', `Viewed profile details of ${emp.firstName} ${emp.lastName} (${emp.employeeId}).`);
    } else {
      router.push('/hr/employees');
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'baseSalary' ? Number(value) : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    const updated = mockDb.saveEmployee({
      ...formData,
      id: employee.id,
      employeeId: employee.employeeId,
      userId: employee.userId
    });

    setEmployee(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    logAction('UPDATE_EMPLOYEE_PROFILE', 'EmployeeProfile', `Updated employee records for ${employee.firstName} ${employee.lastName} (${employee.employeeId}).`);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleDelete = () => {
    if (!employee) return;
    mockDb.deleteEmployee(employee.id);
    logAction('DELETE_EMPLOYEE_PROFILE', 'EmployeeProfile', `Deleted employee record for ${employee.firstName} ${employee.lastName} (${employee.employeeId}).`);
    router.replace('/hr/employees');
  };

  const toggleSalaryVisibility = () => {
    if (!showSalary && employee) {
      logAction('ACCESS_CONFIDENTIAL_SALARY', 'EmployeeProfile', `Accessed confidential salary information for ${employee.firstName} ${employee.lastName}.`);
    }
    setShowSalary(!showSalary);
  };

  if (!employee) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/hr/employees"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Employee Records</span>
        </Link>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {saveSuccess && (
            <span className="flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold shadow-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Records Updated!</span>
            </span>
          )}

          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-55 text-slate-450 border border-slate-200 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        {/* Profile Card Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-slate-100 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-xl text-white shadow-inner shrink-0 border-2 border-white">
            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-slate-800">{employee.firstName} {employee.lastName}</h2>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 py-1 px-2.5 rounded-lg border border-slate-200/50">
                {employee.employeeId}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-1">{employee.jobTitle} • {employee.department}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-slate-100 mb-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`
              flex items-center space-x-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
              ${activeTab === 'personal'
                ? 'border-indigo-550 text-indigo-600 bg-indigo-50/20'
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }
            `}
          >
            <User className="h-4 w-4" />
            <span>Personal Info</span>
          </button>
          <button
            onClick={() => setActiveTab('employment')}
            className={`
              flex items-center space-x-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
              ${activeTab === 'employment'
                ? 'border-indigo-550 text-indigo-600 bg-indigo-50/20'
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }
            `}
          >
            <Briefcase className="h-4 w-4" />
            <span>Employment</span>
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`
              flex items-center space-x-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
              ${activeTab === 'financial'
                ? 'border-indigo-550 text-indigo-600 bg-indigo-50/20'
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }
            `}
          >
            <CreditCard className="h-4 w-4" />
            <span>Salary & Banking</span>
          </button>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSave} className="space-y-6 text-xs font-bold text-slate-700">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
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
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
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
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 cursor-pointer transition-all"
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
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
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
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
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
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Residential Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 resize-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
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
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
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
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-55/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 cursor-pointer transition-all"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="PROBATIONARY">Probationary</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Employment Status</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-55/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 cursor-pointer transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Confidential Salary Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 border-l border-b border-indigo-100 rounded-bl-xl uppercase tracking-wider">
                  <ShieldAlert className="h-3 w-3" />
                  <span>Confidential Data</span>
                </div>

                <div className="max-w-md">
                  <label className="block text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Base Monthly Salary (USD)</label>
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-1">
                      <input
                        type={showSalary ? "number" : "password"}
                        name="baseSalary"
                        value={formData.baseSalary}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-white border border-slate-200 disabled:opacity-60 disabled:bg-slate-100/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 pr-12 font-mono font-bold"
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleSalaryVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showSalary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                    Salary modifications and views are recorded automatically to security logs. Only authorized HR and Payroll Officers can view base pay parameters.
                  </p>
                </div>
              </div>

              {/* Bank Details & Gov IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Tax Identification Number (TIN)</label>
                  <input
                    type="text"
                    name="taxIdNumber"
                    value={formData.taxIdNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Social Security Number (SSS)</label>
                  <input
                    type="text"
                    name="socialSecurityNo"
                    value={formData.socialSecurityNo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Health Insurance Number (PhilHealth)</label>
                  <input
                    type="text"
                    name="healthInsuranceNo"
                    value={formData.healthInsuranceNo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Housing Mutual Fund Number (Pag-IBIG)</label>
                  <input
                    type="text"
                    name="housingFundNo"
                    value={formData.housingFundNo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:bg-slate-50/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-500 shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>

              <h3 className="text-base font-black text-slate-800 mb-2">Confirm Delete Action</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-6">
                Are you sure you want to permanently delete the profile of <span className="font-bold text-slate-700">{employee.firstName} {employee.lastName}</span> ({employee.employeeId})? This action will clean up leave requests and salary configurations and is irreversible.
              </p>

              <div className="flex gap-3 w-full text-xs font-bold">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-md shadow-rose-500/10"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
