// app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Shield, Key, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      redirectToRoleDashboard(user.role);
    }
  }, [user]);

  const redirectToRoleDashboard = (role: string) => {
    if (role === 'STAFF') {
      router.replace('/portal');
    } else if (role === 'HR') {
      router.replace('/hr/employees');
    } else if (role === 'PAYROLL_OFFICER') {
      router.replace('/payroll/runs');
    } else {
      router.replace('/admin/users');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    const success = await login(email);
    if (!success) {
      setError('Email not registered. Use one of the quick access accounts below.');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError('');
    await login(demoEmail);
  };

  return (
    <div className="w-full bg-white border border-slate-100/50 rounded-3xl p-8 shadow-[0_20px_50px_rgba(99,102,241,0.06)] relative overflow-hidden">
      
      {/* Soft color highlights inside the card */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl"></div>

      <div className="flex flex-col items-center text-center mb-8 relative z-10">
        <div className="p-3 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl shadow-md shadow-indigo-500/10 mb-4">
          <Shield className="h-6.5 w-6.5 text-white stroke-[2]" />
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          HR-SYSTEM
        </h1>
        <p className="text-slate-400 text-[11px] font-semibold mt-1">
          Secure enterprise workforce & payroll gateway
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 relative z-10">
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            Work Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 transition-all font-semibold"
          />
        </div>

        {error && (
          <div className="flex items-start space-x-2 text-rose-500 text-[11px] bg-rose-50 border border-rose-100 rounded-xl p-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-500/10 active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Verifying SecurKey...' : 'Authenticate'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="relative flex items-center justify-center my-6 z-10">
        <div className="border-t border-slate-100 w-full"></div>
        <span className="bg-white px-3 text-[9px] font-bold text-slate-450 uppercase tracking-widest absolute text-slate-400">
          Quick Demo Access
        </span>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <button
          onClick={() => handleQuickLogin('admin@hr.com')}
          className="flex flex-col items-start p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-500/30 rounded-xl text-left transition-all group cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-indigo-600">Administrator</span>
          <span className="text-[9px] text-slate-400 mt-0.5 truncate w-full font-mono">admin@hr.com</span>
        </button>

        <button
          onClick={() => handleQuickLogin('hr@hr.com')}
          className="flex flex-col items-start p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-500/30 rounded-xl text-left transition-all group cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-indigo-600">HR Manager</span>
          <span className="text-[9px] text-slate-400 mt-0.5 truncate w-full font-mono">hr@hr.com</span>
        </button>

        <button
          onClick={() => handleQuickLogin('payroll@hr.com')}
          className="flex flex-col items-start p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-500/30 rounded-xl text-left transition-all group cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-indigo-600">Payroll Officer</span>
          <span className="text-[9px] text-slate-400 mt-0.5 truncate w-full font-mono">payroll@hr.com</span>
        </button>

        <button
          onClick={() => handleQuickLogin('jane@hr.com')}
          className="flex flex-col items-start p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-500/30 rounded-xl text-left transition-all group cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-indigo-600">Staff Employee</span>
          <span className="text-[9px] text-slate-400 mt-0.5 truncate w-full font-mono">jane@hr.com</span>
        </button>
      </div>

      <p className="text-center text-[9px] font-semibold text-slate-400 mt-6 flex items-center justify-center space-x-1 relative z-10">
        <Key className="h-3 w-3 text-slate-350" />
        <span>AES-256 Hashed Session Simulation Active</span>
      </p>
    </div>
  );
}
