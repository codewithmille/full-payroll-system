// app/(dashboard)/admin/audit-logs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, AuditLog } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldAlert, Download, Filter, Clock, Globe, Key } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { logAction } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState('All');

  useEffect(() => {
    setLogs(mockDb.getAuditLogs());
    logAction('VIEW_SECURITY_AUDIT_TRAIL', 'AuditLog', 'Admin reviewed the system activity and data access audit trail.');
  }, []);

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User Name', 'Email', 'Role', 'Action Triggered', 'Impacted Resource', 'Action Details', 'IP Address'];
    const rows = logs.map(l => [
      l.id,
      l.createdAt,
      l.userName,
      l.userEmail,
      l.role,
      l.action,
      l.resource,
      l.details,
      l.ipAddress
    ]);

    const csvRows = [headers.join(','), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'security_audit_trail_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredLogs = logs.filter(l => {
    if (filterAction === 'All') return true;
    if (filterAction === 'SENSITIVE_DATA') {
      return l.action.includes('SALARY') || l.action.includes('FINANCIAL') || l.action.includes('EMPLOYEE');
    }
    return l.action === filterAction;
  });

  const uniqueActions = ['All', 'SENSITIVE_DATA', ...Array.from(new Set(logs.map(l => l.action)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Security Audit Trail</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Read-only logging of user logins, role switches, and confidential salary views</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-850 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Security Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer w-full py-1 pr-6"
          >
            {uniqueActions.map(action => (
              <option key={action} value={action} className="bg-white text-slate-700">
                {action === 'SENSITIVE_DATA' ? '⭐ Sensitive Data Access' : action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[10px] text-slate-400 font-bold flex items-center space-x-1.5 hidden md:flex">
          <Globe className="h-3.5 w-3.5" />
          <span>UTC Timezone Sync Enabled</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Identity</th>
                <th className="py-4 px-6">Action Triggered</th>
                <th className="py-4 px-6">Impacted Object</th>
                <th className="py-4 px-6">Details</th>
                <th className="py-4 px-6 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 text-slate-700 font-semibold">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr 
                    key={`${log.id}-${idx}`} 
                    className="hover:bg-slate-50/45 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-400 font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 leading-normal">
                      <div className="font-bold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.role.toLowerCase().replace('_', ' ')}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border
                        ${log.action.includes('ACCESS_CONFIDENTIAL') || log.action.includes('DELETE')
                          ? 'bg-rose-50 text-rose-600 border-rose-100' 
                          : log.action.includes('UPDATE') || log.action.includes('ONBOARD')
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                        }
                      `}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[10px]">{log.resource}</td>
                    <td className="py-4 px-6 text-slate-600 leading-relaxed max-w-[280px] truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-400 text-[10px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-450">
                    No activity logs recorded.
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
