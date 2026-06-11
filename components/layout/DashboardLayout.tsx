// components/layout/DashboardLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  ShieldAlert, 
  User, 
  Settings, 
  Menu, 
  X, 
  LayoutDashboard,
  Shield,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import TopHeader from '@/components/layout/TopHeader';

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 72;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !user) {
      router.replace('/login');
    }
  }, [isClient, user, router]);

  if (!isClient || !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const getNavLinks = () => {
    const role = user.role;
    const links = [];

    links.push({ name: 'SUMMARY',      icon: LayoutDashboard, path: '/portal',            group: 'MY WORKSPACE', roles: ['ADMIN','HR','PAYROLL_OFFICER','STAFF'] });
    links.push({ name: 'PROFILE',      icon: User,            path: '/portal/profile',    group: 'MY WORKSPACE', roles: ['ADMIN','HR','PAYROLL_OFFICER','STAFF'] });
    links.push({ name: 'MY LEAVES',    icon: Calendar,        path: '/portal/leaves',     group: 'MY WORKSPACE', roles: ['ADMIN','HR','PAYROLL_OFFICER','STAFF'] });
    links.push({ name: 'PAYSLIPS',     icon: CreditCard,      path: '/portal/payslips',   group: 'MY WORKSPACE', roles: ['ADMIN','HR','PAYROLL_OFFICER','STAFF'] });
    links.push({ name: 'MY ATTENDANCE',icon: Clock,           path: '/portal/attendance', group: 'MY WORKSPACE', roles: ['ADMIN','HR','PAYROLL_OFFICER','STAFF'] });
    links.push({ name: 'EMPLOYEES',    icon: Users,           path: '/hr/employees',      group: 'HR MANAGEMENT',roles: ['ADMIN','HR'] });
    links.push({ name: 'LEAVE QUEUE',  icon: Calendar,        path: '/hr/leaves',         group: 'HR MANAGEMENT',roles: ['ADMIN','HR'] });
    links.push({ name: 'ATTENDANCE',   icon: Clock,           path: '/hr/attendance',     group: 'HR MANAGEMENT',roles: ['ADMIN','HR'] });
    links.push({ name: 'PAYROLL CYCLES',icon: CreditCard,     path: '/payroll/runs',      group: 'PAYROLL',      roles: ['ADMIN','PAYROLL_OFFICER'] });
    links.push({ name: 'PAYROLL CONFIG',icon: Settings,       path: '/payroll/settings',  group: 'PAYROLL',      roles: ['ADMIN','PAYROLL_OFFICER'] });
    links.push({ name: 'ACCOUNTS',     icon: Shield,          path: '/admin/users',        group: 'ADMIN',        roles: ['ADMIN'] });
    links.push({ name: 'AUDIT TRAIL',  icon: ShieldAlert,     path: '/admin/audit-logs',   group: 'ADMIN',        roles: ['ADMIN'] });

    return links.filter(link => link.roles.includes(role));
  };

  const navLinks = getNavLinks();

  const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenRole = e.target.value as any;
    switchRole(chosenRole);
    router.push('/portal');
  };

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row relative overflow-hidden print:bg-white">

      {/* ─── Mobile Header ─────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 print:hidden shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-slate-800 text-base tracking-wide">HR-SYSTEM</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-500 hover:text-indigo-600"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* ─── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
        }}
        className={`
          fixed inset-y-0 left-0 z-50 bg-white flex flex-col justify-between
          border-r border-slate-100/80
          transform transition-[transform,width,min-width] duration-300 ease-in-out
          md:translate-x-0 md:static md:h-screen
          print:hidden shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Top section ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 p-4 overflow-hidden">

          {/* Branding + collapse toggle */}
          <div className="hidden md:flex items-center min-h-[44px]" style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}>
            {/* Logo — hidden when collapsed */}
            <div
              className="flex items-center gap-3 overflow-hidden"
              style={{
                maxWidth: isCollapsed ? '0px' : '200px',
                opacity: isCollapsed ? 0 : 1,
                pointerEvents: isCollapsed ? 'none' : 'auto',
                transition: 'max-width 300ms ease-in-out, opacity 200ms ease-in-out',
              }}
            >
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl shadow-md shadow-indigo-500/20 shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-lg text-slate-800 tracking-wider whitespace-nowrap">
                HR-SYSTEM
              </span>
            </div>

            {/* Rotate toggle — always visible, centered when collapsed */}
            <button
              onClick={() => setIsCollapsed(prev => !prev)}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={{
                transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 300ms ease-in-out',
              }}
              className="shrink-0 p-1.5 hover:bg-slate-50 border border-slate-100 rounded-xl cursor-pointer text-slate-400 hover:text-indigo-600 active:scale-95 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Role Switcher Widget */}
          <div
            className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 transition-all duration-300"
            style={{ padding: isCollapsed ? '8px' : '14px' }}
          >
            {/* Collapsed: icon-only with invisible select overlay */}
            <div
              className="flex justify-center"
              style={{
                maxHeight: isCollapsed ? '40px' : '0px',
                opacity: isCollapsed ? 1 : 0,
                overflow: 'hidden',
                pointerEvents: isCollapsed ? 'auto' : 'none',
                transition: 'max-height 300ms ease-in-out, opacity 200ms ease-in-out',
              }}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center" title="Simulate Role">
                  <ShieldAlert className="h-4 w-4 text-indigo-500" />
                </div>
                <select
                  value={user.role}
                  onChange={handleRoleSwitch}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="HR">HR Manager</option>
                  <option value="PAYROLL_OFFICER">Payroll Officer</option>
                  <option value="STAFF">Staff Employee</option>
                </select>
              </div>
            </div>

            {/* Expanded: full widget */}
            <div
              style={{
                maxHeight: isCollapsed ? '0px' : '96px',
                opacity: isCollapsed ? 0 : 1,
                overflow: 'hidden',
                pointerEvents: isCollapsed ? 'none' : 'auto',
                transition: 'max-height 300ms ease-in-out, opacity 200ms ease-in-out',
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                <ShieldAlert className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
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
          </div>

          {/* Navigation Links with Group Labels */}
          <nav className="flex flex-col gap-0.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
            {(() => {
              let lastGroup = '';
              return navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.path === '/portal'
                  ? pathname === '/portal'
                  : pathname === link.path || pathname.startsWith(link.path + '/');
                const showGroupLabel = link.group !== lastGroup;
                if (showGroupLabel) lastGroup = link.group;

                return (
                  <React.Fragment key={link.path}>
                    {/* Group Label */}
                    {showGroupLabel && (
                      <div
                        className="overflow-hidden"
                        style={{
                          maxHeight: isCollapsed ? '0px' : '32px',
                          opacity: isCollapsed ? 0 : 1,
                          marginTop: lastGroup !== link.group ? '0' : '8px',
                          transition: 'max-height 300ms ease-in-out, opacity 200ms ease-in-out',
                        }}
                      >
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] px-3 pt-3 pb-1">
                          {link.group}
                        </span>
                      </div>
                    )}

                    <Link
                      href={link.path}
                      onClick={() => setIsSidebarOpen(false)}
                      title={isCollapsed ? link.name : undefined}
                      className={`
                        flex items-center rounded-xl
                        transition-colors duration-200
                        ${isCollapsed ? 'justify-center w-full px-0 py-2.5' : 'px-3 py-2 w-full'}
                        ${isActive
                          ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }
                      `}
                    >
                      {/* Left accent bar */}
                      <span
                        className="shrink-0 rounded-full bg-indigo-500 mr-2"
                        style={{
                          width: '3px',
                          height: isActive && !isCollapsed ? '18px' : '0px',
                          opacity: isActive && !isCollapsed ? 1 : 0,
                          transition: 'height 250ms ease-in-out, opacity 200ms ease-in-out',
                        }}
                      />
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                      <span
                        className="text-[11px] font-bold tracking-wide whitespace-nowrap"
                        style={{
                          maxWidth: isCollapsed ? '0px' : '180px',
                          opacity: isCollapsed ? 0 : 1,
                          overflow: 'hidden',
                          marginLeft: isCollapsed ? '0px' : '9px',
                          transition: 'max-width 300ms ease-in-out, opacity 200ms ease-in-out, margin-left 300ms ease-in-out',
                        }}
                      >
                        {link.name}
                      </span>
                    </Link>
                  </React.Fragment>
                );
              });
            })()}
          </nav>
        </div>

        {/* ── Sidebar Footer: version pill ─────────────────────────────── */}
        <div
          className="px-4 pb-4 overflow-hidden"
          style={{
            maxHeight: isCollapsed ? '0px' : '40px',
            opacity: isCollapsed ? 0 : 1,
            transition: 'max-height 300ms ease-in-out, opacity 200ms ease-in-out',
          }}
        >
          <div className="flex items-center justify-center gap-1.5 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">HR-SYSTEM</span>
            <span className="text-[9px] font-black text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">v1.0</span>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#f8fafc] print:bg-white">
        <TopHeader />
        <div className="flex-1 p-6 lg:p-8 print:p-0">
          {children}
        </div>
      </main>

    </div>
  );
}
