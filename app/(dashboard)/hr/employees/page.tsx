// app/(dashboard)/hr/employees/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, EmployeeProfile } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  UserCheck, 
  Building2, 
  Briefcase, 
  ArrowUpRight,
  Users
} from 'lucide-react';

export default function EmployeeDirectoryPage() {
  const { logAction } = useAuth();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    setEmployees(mockDb.getEmployees());
    logAction('VIEW_EMPLOYEE_DIRECTORY', 'EmployeeProfile', 'User loaded the employee directory list.');
  }, []);

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.personalEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const deptMatch = selectedDept === 'All' || emp.department === selectedDept;
    const statusMatch = selectedStatus === 'All' || emp.employmentStatus === selectedStatus;

    return searchMatch && deptMatch && statusMatch;
  });

  // Unique departments for filter dropdown
  const departments = ['All', ...Array.from(new Set(employees.map(e => e.department)))];

  // Headcount metrics
  const totalCount = employees.length;
  const activeCount = employees.filter(e => e.employmentStatus === 'ACTIVE').length;
  const fullTimeCount = employees.filter(e => e.employmentType === 'FULL_TIME').length;

  return (
    <div className="space-y-6">
      {/* Page Sub-header: action button only */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-semibold">Manage and onboard staff information and work details</p>
        <Link
          href="/hr/employees/new"
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
          <span className="text-sm">Onboard Employee</span>
        </Link>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Headcount</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <UserCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Employees</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <Briefcase className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Full-Time Staff</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">{fullTimeCount}</h3>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 font-semibold transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-auto shadow-sm">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer w-full py-1 pr-6"
            >
              {departments.map(dept => (
                <option key={dept} value={dept} className="bg-white text-slate-700">{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-auto shadow-sm">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer w-full py-1 pr-6"
            >
              <option value="All" className="bg-white text-slate-700">All Statuses</option>
              <option value="ACTIVE" className="bg-white text-slate-700">Active</option>
              <option value="INACTIVE" className="bg-white text-slate-700">Inactive</option>
              <option value="SUSPENDED" className="bg-white text-slate-700">Suspended</option>
              <option value="TERMINATED" className="bg-white text-slate-700">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Employee ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Job Title</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-slate-700 font-semibold">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id}
                    className="hover:bg-slate-50/45 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-slate-500 font-bold">{emp.employeeId}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{emp.firstName} {emp.lastName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.personalEmail}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">{emp.department}</td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">{emp.jobTitle}</td>
                    <td className="py-4 px-6">
                      <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        {emp.employmentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border
                        ${emp.employmentStatus === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : emp.employmentStatus === 'SUSPENDED'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                        }
                      `}>
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/hr/employees/${emp.id}`}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg py-1.5 px-3 cursor-pointer shadow-sm"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-450">
                    No employee records match the filters or search term.
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
