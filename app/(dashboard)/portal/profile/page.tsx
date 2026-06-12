// app/(dashboard)/portal/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, EmployeeProfile } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  User, 
  Briefcase, 
  CreditCard, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  FileDown,
  X,
  AlertTriangle,
  CalendarRange,
  ArrowDownToLine,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface EmployeeDocument {
  id: string;
  name: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'doc';
  expiryDate: string; // YYYY-MM-DD
  hasExpiry: boolean;
  uploadedAt: string; // YYYY-MM-DD
}

const DEFAULT_DOCUMENTS: Record<string, EmployeeDocument[]> = {
  'emp-4': [
    {
      id: 'doc-1',
      name: 'NBI Clearance',
      fileName: 'nbi_clearance_alexander.pdf',
      fileType: 'pdf',
      expiryDate: '2027-05-20',
      hasExpiry: true,
      uploadedAt: '2026-05-20'
    },
    {
      id: 'doc-2',
      name: 'Police Clearance',
      fileName: 'police_clearance_2026.png',
      fileType: 'image',
      expiryDate: '2027-03-12',
      hasExpiry: true,
      uploadedAt: '2026-03-12'
    },
    {
      id: 'doc-3',
      name: 'Barangay Clearance',
      fileName: 'barangay_clearance.pdf',
      fileType: 'pdf',
      expiryDate: '2026-05-10', // EXPIRED!
      hasExpiry: true,
      uploadedAt: '2025-05-10'
    }
  ]
};

export default function StaffProfilePage() {
  const { user, logAction } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [showSalary, setShowSalary] = useState(false);
  
  // Documents States
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);
  
  // Upload Form States
  const [docType, setDocType] = useState('NBI Clearance');
  const [customName, setCustomName] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-06-12');
  const [hasExpiry, setHasExpiry] = useState(true);
  const [mockFileName, setMockFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(-1);

  useEffect(() => {
    if (user) {
      const emp = mockDb.getEmployeeByUserId(user.id);
      if (emp) {
        setProfile(emp);
        logAction('VIEW_MY_PROFILE', 'EmployeeProfile', 'User viewed their personal profile record details.');
        
        // Load documents from LocalStorage
        const savedDocs = localStorage.getItem(`hr_system_documents_${emp.id}`);
        if (savedDocs) {
          try {
            setDocuments(JSON.parse(savedDocs));
          } catch (e) {
            console.error(e);
          }
        } else {
          // Seed defaults or blank
          const defaults = DEFAULT_DOCUMENTS[emp.id] || [
            {
              id: 'doc-seed-1',
              name: 'NBI Clearance',
              fileName: `nbi_${emp.firstName.toLowerCase()}_2026.pdf`,
              fileType: 'pdf',
              expiryDate: '2027-04-18',
              hasExpiry: true,
              uploadedAt: '2026-04-18'
            },
            {
              id: 'doc-seed-2',
              name: 'Police Clearance',
              fileName: `police_clearance_${emp.firstName.toLowerCase()}.png`,
              fileType: 'image',
              expiryDate: '2026-05-15', // EXPIRED
              hasExpiry: true,
              uploadedAt: '2025-05-15'
            }
          ];
          setDocuments(defaults);
          localStorage.setItem(`hr_system_documents_${emp.id}`, JSON.stringify(defaults));
        }
      }
    }
  }, [user]);

  const toggleSalary = () => {
    if (!showSalary && profile) {
      logAction('ACCESS_OWN_CONFIDENTIAL_SALARY', 'EmployeeProfile', 'User toggled visibility to inspect their base salary parameter.');
    }
    setShowSalary(!showSalary);
  };

  // Document Expiration Status Checker
  const getDocStatus = (expiryDateStr: string, hasExp: boolean) => {
    if (!hasExp) return { label: 'PERMANENT', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };

    const expiry = new Date(expiryDateStr);
    const now = new Date(); // local date is 2026-06-12
    expiry.setHours(0,0,0,0);
    now.setHours(0,0,0,0);

    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'EXPIRED', color: 'bg-rose-50 text-rose-600 border-rose-100' };
    } else if (diffDays <= 30) {
      return { label: `EXPIRING SOON (${diffDays}d)`, color: 'bg-amber-50 text-amber-600 border-amber-100' };
    } else {
      return { label: 'ACTIVE', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    }
  };

  // Simulated File Chooser
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMockFileName(e.target.files[0].name);
    } else {
      // Create mock file name
      const ext = docType.includes('Clearance') ? 'pdf' : 'png';
      setMockFileName(`${docType.toLowerCase().replace(/ /g, '_')}_scan.${ext}`);
    }
  };

  // Upload Form Submit Handler with micro-animation
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const finalFileName = mockFileName || `${docType.toLowerCase().replace(/ /g, '_')}_scan.pdf`;
    const finalDocName = docType === 'Other' ? (customName || 'General Document') : docType;
    
    // Start progress bar animation
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Complete upload
          const newDoc: EmployeeDocument = {
            id: `doc-${Date.now()}`,
            name: finalDocName,
            fileName: finalFileName,
            fileType: finalFileName.endsWith('.png') || finalFileName.endsWith('.jpg') ? 'image' : 'pdf',
            expiryDate: hasExpiry ? expiryDate : '',
            hasExpiry,
            uploadedAt: new Date().toISOString().split('T')[0]
          };

          const updatedDocs = [...documents, newDoc];
          setDocuments(updatedDocs);
          localStorage.setItem(`hr_system_documents_${profile.id}`, JSON.stringify(updatedDocs));

          logAction('UPLOAD_EMPLOYEE_DOCUMENT', 'EmployeeProfile', `Uploaded document: ${finalDocName} for employee profile verification.`);

          // Reset forms
          setCustomName('');
          setMockFileName('');
          setUploadProgress(-1);
          setIsUploadOpen(false);

          return -1;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Delete Document Handler
  const handleDeleteDoc = (id: string, name: string) => {
    if (!profile) return;
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const updatedDocs = documents.filter(doc => doc.id !== id);
      setDocuments(updatedDocs);
      localStorage.setItem(`hr_system_documents_${profile.id}`, JSON.stringify(updatedDocs));
      logAction('DELETE_EMPLOYEE_DOCUMENT', 'EmployeeProfile', `Deleted document ID: ${id} (${name}) from profile clearances.`);
    }
  };

  if (!user) return null;

  if (!profile) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-slate-800">Profile Loading Error</h3>
        <p className="text-xs text-slate-500">
          This system account is a global role with no linked employee profile. Switch to a Staff Employee profile in the simulator to view personal details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Employee Profile</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Verify your employment details, clearances, and bank coordinates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4 h-fit">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-3xl text-white shadow-inner border-2 border-white">
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">{profile.firstName} {profile.lastName}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">{profile.jobTitle}</p>
            <span className="inline-flex mt-3 text-[10px] font-mono bg-slate-50 text-slate-500 font-bold py-0.5 px-2.5 rounded-lg border border-slate-200">
              {profile.employeeId}
            </span>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 space-y-3.5 text-left text-xs text-slate-500 font-semibold">
            <div className="flex items-center space-x-2.5">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{profile.personalEmail}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-start space-x-2.5 leading-relaxed">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{profile.address}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Details & Documents Gallery */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Work details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Briefcase className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Employment Metadata</h4>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Department</span>
                <p className="text-sm font-black text-slate-800">{profile.department}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Employment Type</span>
                <p className="text-sm font-black text-slate-800 capitalize">{profile.employmentType.toLowerCase().replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Hire Date</span>
                <p className="text-sm font-black text-slate-800">{profile.dateHired}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Status</span>
                <div>
                  <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {profile.employmentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary & Finance details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Compensation & Banking</h4>
            </div>

            {/* Base Pay */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md shadow-sm">
              <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Confidential Monthly Rate (USD)</span>
              <div className="flex items-center space-x-3">
                <div className="font-mono text-base font-black text-slate-800 tracking-wider flex-1">
                  {showSalary ? `$${profile.baseSalary.toLocaleString()}` : '••••••••'}
                </div>
                <button
                  type="button"
                  onClick={toggleSalary}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm animate-pulse"
                >
                  {showSalary ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs font-bold text-slate-700 pt-2">
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Bank Name</span>
                <p className="text-sm font-black text-slate-800">{profile.bankName || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Bank Account Number</span>
                <p className="text-sm font-black text-slate-800 font-mono">{profile.bankAccountNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Tax Identification Number</span>
                <p className="text-sm font-black text-slate-800 font-mono">{profile.taxIdNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-extrabold uppercase text-[9px]">Social Security Number</span>
                <p className="text-sm font-black text-slate-800 font-mono">{profile.socialSecurityNo || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* 📁 NEW: Documents & Clearances Gallery */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarRange className="h-4.5 w-4.5 text-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Documents & Clearances</h4>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-md">
                  {documents.length}
                </span>
              </div>
              
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center space-x-1.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-1.5 px-3 rounded-xl text-[10px] transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Clearance</span>
              </button>
            </div>

            {/* Gallery Grid */}
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => {
                  const status = getDocStatus(doc.expiryDate, doc.hasExpiry);
                  
                  return (
                    <div 
                      key={doc.id}
                      className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group"
                    >
                      {/* Top Action Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-indigo-50 text-indigo-500 border border-indigo-100 rounded-xl">
                            {doc.fileType === 'image' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="font-extrabold text-[11px] text-slate-800 block truncate max-w-[120px]" title={doc.name}>
                              {doc.name}
                            </span>
                            <span className="text-[8px] text-slate-450 text-slate-400 block truncate max-w-[120px]" title={doc.fileName}>
                              {doc.fileName}
                            </span>
                          </div>
                        </div>

                        {/* Delete button (Visible on hover) */}
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.name)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer md:opacity-0 group-hover:opacity-100"
                          title="Delete document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Expiration Details */}
                      <div className="space-y-1.5 border-t border-slate-100 pt-2.5 text-[10px] font-bold">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">EXPIRATION:</span>
                          <span className="text-slate-600">{doc.hasExpiry ? doc.expiryDate : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">STATUS:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="flex-1 inline-flex items-center justify-center space-x-1 border border-slate-200 hover:bg-slate-100 text-slate-600 font-extrabold py-1.5 px-2.5 rounded-lg text-[9px] transition-colors cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Scan</span>
                        </button>
                        
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Simulated file download for "${doc.fileName}"`);
                          }}
                          className="p-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="Download document scan"
                        >
                          <ArrowDownToLine className="h-3 w-3" />
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                <FileText className="h-8 w-8 text-slate-350" />
                <span className="text-[10px] font-bold">No documents uploaded. Click upload above to add NBI or Police Clearances.</span>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ─── MODAL: Upload Clearance Document ──────────────────────────── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Upload New Clearance</h3>
              </div>
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {uploadProgress >= 0 ? (
              // Progress Loading Screen
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mx-auto animate-bounce">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">Uploading File scan...</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{mockFileName}</p>
                </div>
                
                {/* Progress bar container */}
                <div className="max-w-xs mx-auto h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 block">{uploadProgress}%</span>
              </div>
            ) : (
              // Upload Form
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold cursor-pointer"
                  >
                    <option value="NBI Clearance">NBI Clearance</option>
                    <option value="Police Clearance">Police Clearance</option>
                    <option value="Barangay Clearance">Barangay Clearance</option>
                    <option value="Philippine Passport">Philippine Passport</option>
                    <option value="SSS Unified Multi-Purpose ID (UMID)">SSS / UMID ID</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="Health Certificate">Health Certificate</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                {/* Custom Name (If Other is selected) */}
                {docType === 'Other' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Document Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SSS Form, BIR 2316"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold placeholder-slate-400"
                      required
                    />
                  </div>
                )}

                {/* Expiry Settings */}
                <div className="space-y-2 border-y border-slate-50 py-3 my-1">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasExpiry}
                      onChange={(e) => setHasExpiry(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-700">This document has an expiration date</span>
                  </label>

                  {hasExpiry && (
                    <div className="space-y-1 pt-1.5">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase block">Expiration Date</label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold cursor-pointer"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* File picker simulation */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Upload File Scan</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <FileDown className="h-6 w-6 text-slate-450 text-indigo-500 mx-auto mb-1 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 block">
                      {mockFileName ? `Selected: ${mockFileName}` : 'Choose PDF or image scan (Max 5MB)'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer text-center"
                  >
                    Start Upload
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ─── MODAL: Document Scan Viewer Mock ──────────────────────────── */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{viewingDoc.name}</h3>
                  <span className="text-[9px] font-mono text-slate-400">{viewingDoc.fileName}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingDoc(null)}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Document Scan Simulation Container */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center justify-center min-h-[260px] relative overflow-hidden select-none">
              
              {/* Greenish Official stamp look for NBI Clearance */}
              {viewingDoc.name.includes('NBI') ? (
                <div className="w-full max-w-md bg-[#eefaf4] border border-[#a2e0c1] rounded-xl p-5 shadow-sm space-y-4 font-serif text-[9px] text-[#1e6b41] relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-4 border-dashed border-[#1e6b41]/15 rounded-full flex items-center justify-center rotate-12 pointer-events-none select-none text-[8px] font-bold text-center">
                    REPUBLIC OF THE PHILIPPINES<br/>NBI APPROVED
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-[#a2e0c1]/40 pb-2">
                    <span className="font-bold text-[10px] tracking-wide text-[#14532d]">NATIONAL BUREAU OF INVESTIGATION</span>
                    <span className="font-mono text-[#14532d] font-bold">NBI-ID-{profile.employeeId}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 border border-[#a2e0c1]/60 bg-white/70 h-20 rounded-md flex flex-col items-center justify-center text-slate-400">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 font-sans font-bold text-xs uppercase">
                        {profile.firstName[0]}
                      </div>
                      <span className="text-[6px] font-sans text-slate-500 mt-1 uppercase">{profile.lastName}</span>
                    </div>

                    <div className="col-span-2 space-y-1 font-sans text-[7px] text-slate-600 font-bold">
                      <div><span className="text-[#1e6b41] font-bold font-serif">NAME:</span> {profile.lastName.toUpperCase()}, {profile.firstName.toUpperCase()}</div>
                      <div><span className="text-[#1e6b41] font-bold font-serif">ADDRESS:</span> {profile.address.toUpperCase()}</div>
                      <div><span className="text-[#1e6b41] font-bold font-serif">JOB TITLE:</span> {profile.jobTitle.toUpperCase()}</div>
                      <div><span className="text-[#1e6b41] font-bold font-serif">ISSUED:</span> {viewingDoc.uploadedAt}</div>
                      <div><span className="text-[#1e6b41] font-bold font-serif">EXPIRES:</span> <span className="text-red-600 font-black">{viewingDoc.expiryDate}</span></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-[#a2e0c1]/40 pt-2 text-[6px] text-slate-500 font-sans">
                    <span>SECURITY QR SCAN SIMULATED</span>
                    <div className="w-6 h-6 bg-slate-900 rounded border border-slate-800 flex items-center justify-center text-[5px] text-white">QR</div>
                  </div>
                </div>
              ) : viewingDoc.name.includes('Police') ? (
                // Blueish Police Clearance Mock
                <div className="w-full max-w-md bg-[#edf5fd] border border-[#a4c9f1] rounded-xl p-5 shadow-sm space-y-4 font-sans text-[9px] text-[#1d4f8a] relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-4 border-dashed border-[#1d4f8a]/10 rounded-full flex items-center justify-center rotate-[-12deg] pointer-events-none select-none text-[8px] font-bold text-center">
                    PHILIPPINES NATIONAL POLICE<br/>VERIFIED SECURE
                  </div>

                  <div className="flex items-center justify-between border-b border-[#a4c9f1]/40 pb-2">
                    <span className="font-bold text-[10px] tracking-wide text-[#103d75]">PHILIPPINE NATIONAL POLICE CLEARANCE</span>
                    <span className="font-mono text-[#103d75] font-bold">PNP-REF-{Math.floor(Math.random()*900000+100000)}</span>
                  </div>

                  <div className="flex space-x-3.5">
                    <div className="w-16 h-20 bg-white border border-[#a4c9f1]/50 rounded flex items-center justify-center text-slate-400 shrink-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-500 font-extrabold text-[15px]">
                        {profile.firstName[0]}
                      </div>
                    </div>
                    <div className="space-y-1 font-bold text-[7.5px] text-slate-600">
                      <div><span className="text-[#1d4f8a]">FULL NAME:</span> {profile.firstName} {profile.lastName}</div>
                      <div><span className="text-[#1d4f8a]">DEPARTMENT:</span> {profile.department}</div>
                      <div><span className="text-[#1d4f8a]">HIRED DATE:</span> {profile.dateHired}</div>
                      <div><span className="text-[#1d4f8a]">DOC STATUS:</span> <span className="text-emerald-600 font-extrabold">VERIFIED ACTIVE</span></div>
                      <div><span className="text-[#1d4f8a]">VALID UNTIL:</span> <span className="text-red-500 font-black">{viewingDoc.expiryDate}</span></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#a4c9f1]/40 pt-2 text-[6px] text-slate-500">
                    <span>POLICE CLEARANCE SYSTEM SNAPSHOT</span>
                    <span>ORIGINAL SCAN FILE VERIFIED</span>
                  </div>
                </div>
              ) : (
                // General document layout
                <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-left font-sans text-xs">
                  <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                    <FileText className="h-7 w-7 text-indigo-500" />
                    <div>
                      <span className="font-extrabold text-slate-800 block text-[13px]">{viewingDoc.name}</span>
                      <span className="text-[10px] text-slate-400 block">{viewingDoc.fileName}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[10px] text-slate-600 font-semibold leading-relaxed">
                    <p>This is a simulated secure preview of the file scan submitted to the HR database.</p>
                    <p>Document type is verified as: <span className="text-slate-800 font-extrabold">{viewingDoc.name}</span>.</p>
                    <p>Uploaded at: <span className="text-slate-800 font-extrabold">{viewingDoc.uploadedAt}</span></p>
                    {viewingDoc.hasExpiry && (
                      <p>
                        Expiration Status: 
                        <span className={`inline-flex ml-1.5 px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${getDocStatus(viewingDoc.expiryDate, viewingDoc.hasExpiry).color}`}>
                          {getDocStatus(viewingDoc.expiryDate, viewingDoc.hasExpiry).label}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3 text-[9px] text-slate-400 text-center font-mono">
                    REF-ID: {viewingDoc.id.toUpperCase()}
                  </div>
                </div>
              )}

            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Simulating document export. File: ${viewingDoc.fileName}`);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-sm text-center"
              >
                Download Scan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
