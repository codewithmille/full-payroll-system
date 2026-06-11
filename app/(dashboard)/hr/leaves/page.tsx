// app/(dashboard)/hr/leaves/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, LeaveRequest } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function HRLeavesPage() {
  const { user, logAction } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setRequests(mockDb.getLeaveRequests());
    logAction('VIEW_LEAVE_APPLICATIONS_QUEUE', 'LeaveRequest', 'HR loaded the company leave requests queue.');
  }, []);

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !approveId) return;
    
    mockDb.saveLeaveRequest({
      id: approveId,
      status: 'APPROVED',
      approvedById: user.id,
      approvedByName: user.name,
      approvalNote: approvalNote.trim() || undefined
    });

    logAction('APPROVE_LEAVE_REQUEST', 'LeaveRequest', `Approved leave request ID ${approveId}. Note: ${approvalNote || 'None'}`);
    setRequests(mockDb.getLeaveRequests());
    
    setApproveId(null);
    setApprovalNote('');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rejectId || !rejectionReason.trim()) return;

    mockDb.saveLeaveRequest({
      id: rejectId,
      status: 'REJECTED',
      approvedById: user.id,
      approvedByName: user.name,
      rejectionReason
    });

    logAction('REJECT_LEAVE_REQUEST', 'LeaveRequest', `Rejected leave request ID ${rejectId}. Reason: ${rejectionReason}`);
    setRequests(mockDb.getLeaveRequests());
    
    // Reset modal state
    setRejectId(null);
    setRejectionReason('');
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e.getTime() - s.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(days) ? 0 : days;
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const historicalRequests = requests.filter(r => r.status !== 'PENDING');
  const activeApproveReq = requests.find(r => r.id === approveId);
  const activeRejectReq = requests.find(r => r.id === rejectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Leave Management</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Review and process company-wide employee leave requests</p>
      </div>

      {/* Grid: Pending Queue & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Approval Queue</h2>
            </div>
            <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-100/50">
              {pendingRequests.length} Pending
            </span>
          </div>

          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => {
                const days = calculateDays(req.startDate, req.endDate);
                return (
                  <div 
                    key={req.id} 
                    className="p-4 bg-slate-50 border border-slate-200/50 hover:border-slate-200 rounded-xl space-y-3 transition-all"
                  >
                    <div className="flex justify-between items-start text-xs font-bold">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{req.employeeName}</h4>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">
                          {req.leaveType} • {days} Day(s)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setApproveId(req.id);
                            setApprovalNote('');
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-100 rounded-lg transition-all cursor-pointer shadow-sm"
                          title="Approve"
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => {
                            setRejectId(req.id);
                            setRejectionReason('');
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-100 rounded-lg transition-all cursor-pointer shadow-sm"
                          title="Reject"
                        >
                          <X className="h-4 w-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-xs text-slate-500 space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{req.startDate} to {req.endDate}</span>
                      </div>
                      <div className="flex items-start space-x-1.5 leading-relaxed font-semibold">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="italic">"{req.reason}"</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs space-y-2 font-bold">
                <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto" />
                <p>All leave applications processed! No pending requests.</p>
              </div>
            )}
          </div>
        </div>

        {/* History Log */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">History Log</h2>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {historicalRequests.length > 0 ? (
              historicalRequests.map((req) => {
                const days = calculateDays(req.startDate, req.endDate);
                return (
                  <div 
                    key={req.id} 
                    className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl space-y-2 text-xs font-bold"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-800">{req.employeeName}</h5>
                        <p className="text-[9px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5">
                          {req.leaveType} • {days} Day(s)
                        </p>
                      </div>
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border
                        ${req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                        }
                      `}>
                        {req.status}
                      </span>
                    </div>
                    
                    {req.status === 'REJECTED' && req.rejectionReason && (
                      <p className="text-[10px] text-rose-600/80 leading-normal border-t border-slate-100 pt-2 mt-1 font-semibold">
                        <strong>Reason:</strong> {req.rejectionReason}
                      </p>
                    )}
                    
                    {req.status === 'APPROVED' && (
                      <div className="border-t border-slate-100 pt-2 mt-1 space-y-1">
                        <p className="text-[9px] text-slate-400 font-semibold">
                          Processed by {req.approvedByName}
                        </p>
                        {req.approvalNote && (
                          <p className="text-[10px] text-emerald-600/80 leading-normal font-semibold">
                            <strong>Note:</strong> {req.approvalNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-400 text-xs py-8 font-bold">No processed leaves logged yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Approve Modal */}
      {approveId && activeApproveReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <button
              onClick={() => setApproveId(null)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs font-bold text-slate-750">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold border-b border-slate-100 pb-3">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="text-sm uppercase tracking-wider">Approve Leave Request</h3>
              </div>

              {/* Request Details Preview */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-[11px] space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Employee:</span>
                  <span className="text-slate-800 font-extrabold">{activeApproveReq.employeeName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Leave Type:</span>
                  <span className="text-indigo-600 font-extrabold uppercase tracking-widest text-[9px]">{activeApproveReq.leaveType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-slate-800 font-extrabold">{calculateDays(activeApproveReq.startDate, activeApproveReq.endDate)} Day(s)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Dates:</span>
                  <span className="text-slate-700 font-mono font-bold">{activeApproveReq.startDate} to {activeApproveReq.endDate}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block">Reason:</span>
                  <p className="text-slate-600 font-semibold italic text-[10px] leading-relaxed">
                    "{activeApproveReq.reason}"
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Approval Note / Comment</label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={3}
                  placeholder="Optional note for the employee (e.g. 'Enjoy your time off!', 'Approved.')"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 resize-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setApproveId(null)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  Approve Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && activeRejectReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
            <button
              onClick={() => setRejectId(null)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs font-bold text-slate-750">
              <div className="flex items-center space-x-2 text-rose-600 font-bold border-b border-slate-100 pb-3">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-sm uppercase tracking-wider">Reject Leave Request</h3>
              </div>

              {/* Request Details Preview */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-[11px] space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Employee:</span>
                  <span className="text-slate-800 font-extrabold">{activeRejectReq.employeeName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Leave Type:</span>
                  <span className="text-rose-600 font-extrabold uppercase tracking-widest text-[9px]">{activeRejectReq.leaveType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-slate-800 font-extrabold">{calculateDays(activeRejectReq.startDate, activeRejectReq.endDate)} Day(s)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Dates:</span>
                  <span className="text-slate-700 font-mono font-bold">{activeRejectReq.startDate} to {activeRejectReq.endDate}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block">Reason:</span>
                  <p className="text-slate-600 font-semibold italic text-[10px] leading-relaxed">
                    "{activeRejectReq.reason}"
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider">Reason for Rejection</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Provide an explanation for the rejection..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white rounded-xl py-2.5 px-4 text-xs focus:outline-none text-slate-800 resize-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-md shadow-rose-500/10"
                >
                  Reject Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
