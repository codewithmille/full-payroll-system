// components/layout/TopHeader.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Bell,
  Search,
  ChevronRight,
  LogOut,
  User,
  Settings,
  X,
  ShieldAlert,
} from 'lucide-react';

// ─── Route → { title, breadcrumb } map ─────────────────────────────────────
const ROUTE_META: Record<string, { title: string; crumbs: string[] }> = {
  '/portal':            { title: 'Portal Dashboard',  crumbs: ['Portal', 'Summary'] },
  '/portal/profile':   { title: 'My Profile',         crumbs: ['Portal', 'Profile'] },
  '/portal/leaves':    { title: 'My Leaves',          crumbs: ['Portal', 'My Leaves'] },
  '/portal/payslips':  { title: 'Payslips',           crumbs: ['Portal', 'Payslips'] },
  '/portal/attendance':{ title: 'My Attendance',      crumbs: ['Portal', 'My Attendance'] },
  '/hr/employees':     { title: 'Employees',          crumbs: ['HR', 'Employees'] },
  '/hr/leaves':        { title: 'Leave Queue',        crumbs: ['HR', 'Leave Queue'] },
  '/hr/attendance':    { title: 'Attendance',         crumbs: ['HR', 'Attendance'] },
  '/payroll/runs':     { title: 'Payroll Cycles',     crumbs: ['Payroll', 'Cycles'] },
  '/payroll/settings': { title: 'Payroll Config',     crumbs: ['Payroll', 'Config'] },
  '/admin/users':      { title: 'Accounts',           crumbs: ['Admin', 'Accounts'] },
  '/admin/audit-logs': { title: 'Audit Trail',        crumbs: ['Admin', 'Audit Trail'] },
  '/admin/security':   { title: 'Security Control',   crumbs: ['Admin', 'Security'] },
  '/admin/backups':    { title: 'Backups Console',    crumbs: ['Admin', 'Backups'] },
};

// Dummy notifications
const NOTIFICATIONS = [
  { id: 1, type: 'leave',    text: 'Juan dela Cruz filed a leave request',   time: '2m ago',  unread: true  },
  { id: 2, type: 'payroll',  text: 'Payroll cycle for June has been closed',  time: '1h ago',  unread: true  },
  { id: 3, type: 'system',   text: 'System backup completed successfully',    time: '3h ago',  unread: false },
  { id: 4, type: 'leave',    text: 'Maria Santos\' leave was approved',       time: 'Yesterday',unread: false },
];

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrator', description: 'Full access. Manage audit trails, WAF security, and backups.' },
  { value: 'HR', label: 'HR Manager', description: 'Onboard employees, review leave requests, and track attendance logs.' },
  { value: 'PAYROLL_OFFICER', label: 'Payroll Officer', description: 'Process payslips, allowances, and monthly payroll cycles.' },
  { value: 'STAFF', label: 'Staff Employee', description: 'View personal profile, leaves history, payslips, and log clock logs.' }
];

const ROLE_THEMES: Record<string, {
  buttonBg: string;
  buttonBorder: string;
  buttonText: string;
  buttonHover: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  pulseColor: string;
}> = {
  ADMIN: {
    buttonBg: 'bg-violet-50',
    buttonBorder: 'border-violet-100',
    buttonText: 'text-violet-750 text-violet-700',
    buttonHover: 'hover:bg-violet-100/60 hover:text-violet-850 hover:border-violet-200',
    iconColor: 'text-violet-500',
    badgeBg: 'bg-violet-100/80',
    badgeText: 'text-violet-900',
    dotColor: 'bg-violet-600',
    pulseColor: 'bg-violet-600',
  },
  HR: {
    buttonBg: 'bg-emerald-50',
    buttonBorder: 'border-emerald-100',
    buttonText: 'text-emerald-700',
    buttonHover: 'hover:bg-emerald-100/60 hover:text-emerald-850 hover:border-emerald-200',
    iconColor: 'text-emerald-500',
    badgeBg: 'bg-emerald-100/80',
    badgeText: 'text-emerald-900',
    dotColor: 'bg-emerald-600',
    pulseColor: 'bg-emerald-600',
  },
  PAYROLL_OFFICER: {
    buttonBg: 'bg-amber-50',
    buttonBorder: 'border-amber-100',
    buttonText: 'text-amber-700',
    buttonHover: 'hover:bg-amber-100/60 hover:text-amber-850 hover:border-amber-200',
    iconColor: 'text-amber-500',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-900',
    dotColor: 'bg-amber-600',
    pulseColor: 'bg-amber-600',
  },
  STAFF: {
    buttonBg: 'bg-sky-50',
    buttonBorder: 'border-sky-100',
    buttonText: 'text-sky-700',
    buttonHover: 'hover:bg-sky-100/60 hover:text-sky-850 hover:border-sky-200',
    iconColor: 'text-sky-500',
    badgeBg: 'bg-sky-100/80',
    badgeText: 'text-sky-900',
    dotColor: 'bg-sky-650 bg-sky-600',
    pulseColor: 'bg-sky-600',
  },
};

function useCurrentTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function TopHeader() {
  const { user, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const time = useCurrentTime();

  const currentRole = user?.role || 'STAFF';
  const roleTheme = ROLE_THEMES[currentRole] || ROLE_THEMES.STAFF;

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const notifsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const meta = ROUTE_META[pathname] ?? { title: 'Dashboard', crumbs: ['Dashboard'] };
  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) setShowRoleSwitcher(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  const handleRoleSwitch = (chosenRole: any) => {
    switchRole(chosenRole);
    setShowRoleSwitcher(false);
    router.push('/portal');
  };

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return '';
    if (role === 'PAYROLL_OFFICER') return 'Payroll Officer';
    if (role === 'HR') return 'HR Manager';
    if (role === 'ADMIN') return 'Administrator';
    return 'Staff Employee';
  };

  const notifColor: Record<string, string> = {
    leave:   'bg-indigo-500',
    payroll: 'bg-emerald-500',
    system:  'bg-slate-400',
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 lg:px-8 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 print:hidden shrink-0">

      {/* ── Left: Breadcrumb + Title ─────────────────────────────────── */}
      <div className="flex flex-col justify-center min-w-0">
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
          {meta.crumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />}
              <span className={i === meta.crumbs.length - 1 ? 'text-indigo-500' : ''}>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
        {/* Page Title */}
        <h1 className="text-base font-black text-slate-800 tracking-tight truncate leading-tight">
          {meta.title}
        </h1>
      </div>

      {/* ── Right: Actions ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 tabular-nums tracking-wide">{time}</span>
        </div>

        {/* 🛠️ Simulate Role Sandbox Dropdown */}
        <div className="relative" ref={roleSwitcherRef}>
          <button
            onClick={() => { setShowRoleSwitcher(s => !s); setShowNotifs(false); setShowUserMenu(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${roleTheme.buttonBg} ${roleTheme.buttonHover} border ${roleTheme.buttonBorder} ${roleTheme.buttonText} transition-all duration-200 cursor-pointer shadow-sm`}
          >
            <ShieldAlert className={`h-4 w-4 shrink-0 ${roleTheme.iconColor} ${showRoleSwitcher ? 'scale-110' : 'animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
              Simulate: <span className="font-extrabold text-slate-900">{getRoleLabel(user?.role)}</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider inline sm:hidden">
              {user?.role === 'PAYROLL_OFFICER' ? 'PAYROLL' : user?.role}
            </span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-1.5 space-y-1">
              <div className="px-3 py-2 border-b border-slate-50 bg-slate-50/50 rounded-xl mb-1 text-left flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block font-sans">DEVELOPER SANDBOX</span>
                  <span className="text-[10px] font-extrabold text-slate-700 block">Switch simulated profile role</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" title="Sandbox mode active" />
              </div>
              
              {ROLE_OPTIONS.map(opt => {
                const isActive = user?.role === opt.value;
                const optTheme = ROLE_THEMES[opt.value] || ROLE_THEMES.STAFF;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleRoleSwitch(opt.value)}
                    className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isActive 
                        ? `${optTheme.buttonBg} ${optTheme.buttonText} font-extrabold shadow-sm` 
                        : `text-slate-500 hover:${optTheme.buttonBg} hover:${optTheme.buttonText} font-bold`
                    }`}
                  >
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? `${optTheme.dotColor} animate-ping` : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight">{opt.label}</p>
                      <p className="text-[8.5px] text-slate-400 font-semibold leading-normal mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <div
            className="flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out bg-slate-50 border border-slate-100 rounded-xl"
            style={{ width: showSearch ? '180px' : '36px', height: '36px' }}
          >
            <button
              onClick={() => { setShowSearch(s => !s); if (showSearch) setSearchQuery(''); }}
              className="shrink-0 w-9 h-full flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 text-xs text-slate-700 bg-transparent outline-none placeholder:text-slate-350 pr-2"
              style={{ opacity: showSearch ? 1 : 0, pointerEvents: showSearch ? 'auto' : 'none' }}
            />
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifsRef}>
          <button
            onClick={() => { setShowNotifs(s => !s); setShowUserMenu(false); setShowRoleSwitcher(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-200 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {/* List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${n.unread ? 'bg-indigo-50/40 hover:bg-indigo-50' : 'hover:bg-slate-50'}`}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                  >
                    <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notifColor[n.type] ?? 'bg-slate-400'} ${n.unread ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${n.unread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-100 mx-1" />

        {/* User Avatar + Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(s => !s); setShowNotifs(false); setShowRoleSwitcher(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-xs text-white border-2 border-white shadow-sm shrink-0">
              {user?.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-bold text-slate-700 leading-tight">{user?.name.split(' ')[0]}</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
                {user?.role === 'ADMIN' ? 'Administrator' : user?.role?.replace('_', ' ')}
              </span>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-extrabold text-slate-800">{user?.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user?.role === 'ADMIN' ? 'Administrator' : user?.role?.replace('_', ' ')}</p>
              </div>
              {/* Menu items */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <button
                  onClick={() => { router.push('/portal/profile'); setShowUserMenu(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-650 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  My Profile
                </button>
                <button
                  onClick={() => { router.push('/payroll/settings'); setShowUserMenu(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-650 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
              </div>
              {/* Sign out */}
              <div className="p-1.5 border-t border-slate-100">
                <button
                  onClick={() => { logout(); router.push('/login'); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
