// components/layout/DashboardLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  ShieldAlert, 
  LogOut, 
  User, 
  Settings, 
  Menu, 
  X, 
  LayoutDashboard,
  Shield,
  ArrowRight,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  // Sidebar Links config based on role
  const getNavLinks = () => {
    const role = user.role;
    const links = [];

    links.push({
      name: 'SUMMARY',
      icon: LayoutDashboard,
      path: '/portal',
      roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'STAFF']
    });

    links.push({
      name: 'PROFILE',
      icon: User,
      path: '/portal/profile',
      roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'STAFF']
    });

    links.push({
      name: 'MY LEAVES',
      icon: Calendar,
      path: '/portal/leaves',
      roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'STAFF']
    });

    links.push({
      name: 'PAYSLIPS',
      icon: CreditCard,
      path: '/portal/payslips',
      roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'STAFF']
    });

    links.push({
      name: 'MY ATTENDANCE',
      icon: Clock,
      path: '/portal/attendance',
      roles: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'STAFF']
    });

    links.push({
      name: 'EMPLOYEES',
      icon: Users,
      path: '/hr/employees',
      roles: ['ADMIN', 'HR']
    });

    links.push({
      name: 'LEAVE QUEUE',
      icon: Calendar,
      path: '/hr/leaves',
      roles: ['ADMIN', 'HR']
    });

    links.push({
      name: 'ATTENDANCE',
      icon: Clock,
      path: '/hr/attendance',
      roles: ['ADMIN', 'HR']
    });

    links.push({
      name: 'PAYROLL CYCLES',
      icon: CreditCard,
      path: '/payroll/runs',
      roles: ['ADMIN', 'PAYROLL_OFFICER']
    });

    links.push({
      name: 'PAYROLL CONFIG',
      icon: Settings,
      path: '/payroll/settings',
      roles: ['ADMIN', 'PAYROLL_OFFICER']
    });

    links.push({
      name: 'ACCOUNTS',
      icon: Shield,
      path: '/admin/users',
      roles: ['ADMIN']
    });

    links.push({
      name: 'AUDIT TRAIL',
      icon: ShieldAlert,
      path: '/admin/audit-logs',
      roles: ['ADMIN']
    });

    return links.filter(link => link.roles.includes(role));
  };

  const navLinks = getNavLinks();

  const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenRole = e.target.value as any;
    switchRole(chosenRole);
    if (chosenRole === 'STAFF') {
      router.push('/portal');
    } else if (chosenRole === 'HR') {
      router.push('/hr/employees');
    } else if (chosenRole === 'PAYROLL_OFFICER') {
      router.push('/payroll/runs');
    } else {
      router.push('/admin/users');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row relative overflow-hidden print:bg-white">
      
      {/* Mobile Header (Hidden on Print) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 print:hidden shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-slate-800 text-base tracking-wide">
            HR-SYSTEM
          </span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500 hover:text-indigo-600"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation (Hidden on Print) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white p-6 flex flex-col justify-between border-r border-slate-100/80 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen print:hidden shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6">
          {/* Branding Logo */}
          <div className="hidden md:flex items-center space-x-3 px-2 py-1">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl shadow-md shadow-indigo-550/10">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-lg text-slate-800 tracking-wider">
              HR-SYSTEM
            </span>
          </div>

          {/* Role Switcher Widget */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />
              <span>Simulate Role</span>
            </div>
            <select
              value={user.role}
              onChange={handleRoleSwitch}
              className="w-full bg-white border border-slate-200 rounded-xl text-xs py-2 px-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold cursor-pointer shadow-sm"
            >
              <option value="ADMIN">Administrator</option>
              <option value="HR">HR Manager</option>
              <option value="PAYROLL_OFFICER">Payroll Officer</option>
              <option value="STAFF">Staff Employee</option>
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5 overflow-y-auto max-h-[50vh] pr-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.path === '/portal' 
                ? pathname === '/portal' 
                : pathname === link.path || pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-[11px] font-extrabold tracking-wider transition-all duration-200 group
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm border-l-4 border-indigo-500' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-xs text-white shadow-inner mb-2 border-2 border-white">
              {user.name.charAt(0)}
            </div>
            <h4 className="text-xs font-bold text-slate-800 truncate w-full">{user.name}</h4>
            <span className="text-[8px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1 border border-indigo-100/30">
              {user.role === 'ADMIN' ? 'ADMINISTRATOR' : user.role.replace('_', ' ')}
            </span>
            
            <button 
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="mt-3 text-[9px] font-bold text-red-500 hover:text-red-650 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>SIGN OUT</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#f8fafc] p-6 lg:p-8 print:p-0 print:bg-white">
        <div className="w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
