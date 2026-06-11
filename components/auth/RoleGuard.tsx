// components/auth/RoleGuard.tsx
'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldAlert, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'HR' | 'PAYROLL_OFFICER' | 'STAFF')[];
  moduleName: string;
}

export default function RoleGuard({ children, allowedRoles, moduleName }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-zinc-900/40 border border-red-500/20 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Decorative glowing background elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl -z-10"></div>

          <div className="flex flex-col items-center text-center">
            {/* Pulsing Lock/Shield Alert Icon */}
            <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
              Security Clearance Error
            </h1>
            <p className="text-sm text-red-400 font-semibold mb-4 capitalize">
              Restricted {moduleName} Module
            </p>

            <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 mb-6 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Attempted Identity:</span>
                <span className="font-semibold text-zinc-300">{user.name} ({user.email})</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Current Role:</span>
                <span className="font-semibold text-red-400 capitalize">{user.role.toLowerCase().replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-500">Required Clearance:</span>
                <span className="font-semibold text-emerald-400">
                  {allowedRoles.map(r => r.replace('_', ' ')).join(', ')}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 leading-normal text-center pt-2">
                ⚠️ This unauthorized access attempt has been logged. Security logs are audited in compliance with internal confidentiality policies.
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Use the <span className="font-semibold text-indigo-400">Role Simulator</span> widget in the sidebar navigation to switch your security profile if you are evaluating different perspectives of this payroll system.
            </p>

            <div className="flex gap-4 w-full">
              <Link
                href="/portal"
                className="flex-1 flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-sm font-semibold py-3 px-4 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>My Staff Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
