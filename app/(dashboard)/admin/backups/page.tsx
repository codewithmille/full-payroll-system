// app/(dashboard)/admin/backups/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mockDb } from '@/lib/mockDb';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Database, 
  Download, 
  UploadCloud, 
  Trash2, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ShieldCheck,
  Server,
  FolderOpen,
  Info,
  Layers,
  FileJson
} from 'lucide-react';

interface ServerBackup {
  filename: string;
  size: number;
  createdAt: string;
  type: string;
}

export default function AdminBackupsPage() {
  const { user, logAction } = useAuth();
  const [dbStats, setDbStats] = useState({
    users: 0,
    employees: 0,
    leaves: 0,
    runs: 0,
    payslips: 0,
    logs: 0,
    attendance: 0
  });

  // Backup configurations
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [frequency, setFrequency] = useState(300); // default 5 minutes (300s)
  const [destination, setDestination] = useState<'server' | 'local' | 'gdrive' | 'all'>('server');
  
  // Backups lists
  const [serverBackups, setServerBackups] = useState<ServerBackup[]>([]);
  const [localBackups, setLocalBackups] = useState<any[]>([]);
  const [gdriveBackups, setGdriveBackups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'server' | 'local' | 'gdrive'>('server');

  // GDrive Settings (Mocked for UI)
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gdriveFolderId, setGdriveFolderId] = useState('');
  const [isConnectingGDrive, setIsConnectingGDrive] = useState(false);

  // UI state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Timer state
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load database statistics and existing backups on mount
  useEffect(() => {
    loadStats();
    loadBackupHistory();
    loadAutomationSettings();
  }, []);

  // Set up timer for automation countdown
  useEffect(() => {
    if (!autoEnabled) {
      setCountdown(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Initialize countdown based on last run time
    const initCountdown = () => {
      const lastRunStr = localStorage.getItem('hr_system_backup_last_run');
      const lastRun = lastRunStr ? parseInt(lastRunStr) : Date.now();
      const nextRunTime = lastRun + frequency * 1000;
      const remaining = Math.max(0, Math.ceil((nextRunTime - Date.now()) / 1000));
      
      setCountdown(remaining);
    };

    initCountdown();

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Trigger automated backup
          triggerAutomatedBackup();
          return frequency;
        }
        return prev - 1;
      });
    }, 1000);

    // Watch for system storage updates (to sync lists when background saves occur)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hr_system_backup_last_run' || e.key === 'hr_system_local_backups') {
        loadBackupHistory();
        initCountdown();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [autoEnabled, frequency]);

  const loadStats = () => {
    try {
      const allUsers = mockDb.getUsers().length;
      const allEmployees = mockDb.getEmployees().length;
      const allLeaves = mockDb.getLeaveRequests().length;
      const allRuns = mockDb.getPayrollRuns().length;
      const allPayslips = mockDb.getPayslips().length;
      const allLogs = mockDb.getAuditLogs().length;
      const allAttendance = mockDb.getAttendanceRecords().length;

      setDbStats({
        users: allUsers,
        employees: allEmployees,
        leaves: allLeaves,
        runs: allRuns,
        payslips: allPayslips,
        logs: allLogs,
        attendance: allAttendance
      });
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const loadAutomationSettings = () => {
    if (typeof window !== 'undefined') {
      const enabled = localStorage.getItem('hr_system_backup_auto_enabled') === 'true';
      const freq = localStorage.getItem('hr_system_backup_auto_interval');
      const dest = localStorage.getItem('hr_system_backup_auto_dest');
      const folderId = localStorage.getItem('hr_system_backup_gdrive_folder_id') || '';
      const conn = localStorage.getItem('hr_system_backup_gdrive_connected') === 'true';

      setAutoEnabled(enabled);
      if (freq) setFrequency(parseInt(freq));
      if (dest) setDestination(dest as any);
      setGdriveFolderId(folderId);
      setGdriveConnected(conn);
    }
  };

  const saveAutomationSettings = (enabled: boolean, freq: number, dest: 'server' | 'local' | 'gdrive' | 'all') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hr_system_backup_auto_enabled', String(enabled));
      localStorage.setItem('hr_system_backup_auto_interval', String(freq));
      localStorage.setItem('hr_system_backup_auto_dest', dest);
      
      // Initialize last run if never set
      if (!localStorage.getItem('hr_system_backup_last_run')) {
        localStorage.setItem('hr_system_backup_last_run', String(Date.now()));
      }

      setAutoEnabled(enabled);
      setFrequency(freq);
      setDestination(dest);

      logAction('UPDATE_BACKUP_SETTINGS', 'SystemSettings', 
        `Automation config updated: Enabled=${enabled}, Frequency=${freq}s, Destination=${dest}`
      );

      showStatus('success', 'Backup settings saved successfully!');
    }
  };

  const handleToggleGDriveConnect = () => {
    if (gdriveConnected) {
      localStorage.setItem('hr_system_backup_gdrive_connected', 'false');
      setGdriveConnected(false);
      logAction('DISCONNECT_GDRIVE', 'Database', 'Disconnected Google Drive service account integration.');
      showStatus('success', 'Google Drive integration disconnected.');
    } else {
      setIsConnectingGDrive(true);
      showStatus('info', 'Connecting to Google Drive API...');
      setTimeout(() => {
        setIsConnectingGDrive(false);
        localStorage.setItem('hr_system_backup_gdrive_connected', 'true');
        setGdriveConnected(true);
        logAction('CONNECT_GDRIVE', 'Database', 'Successfully authorized Google Service Account for Google Drive upload.');
        showStatus('success', 'Connected! Service account client authorized.');
      }, 1200);
    }
  };

  const handleGdriveFolderIdChange = (val: string) => {
    setGdriveFolderId(val);
    localStorage.setItem('hr_system_backup_gdrive_folder_id', val);
  };

  const loadBackupHistory = async () => {
    setLoadingHistory(true);
    try {
      // 1. Load Server Backups
      const res = await fetch('/api/admin/backups');
      const serverData = await res.json();
      if (serverData.success) {
        setServerBackups(serverData.backups);
      }

      // 2. Load Local Backups (from localStorage list)
      const localStored = localStorage.getItem('hr_system_local_backups');
      if (localStored) {
        setLocalBackups(JSON.parse(localStored));
      } else {
        setLocalBackups([]);
      }

      // 3. Load GDrive Backups (from localStorage list)
      const gdriveStored = localStorage.getItem('hr_system_gdrive_backups');
      if (gdriveStored) {
        setGdriveBackups(JSON.parse(gdriveStored));
      } else {
        setGdriveBackups([]);
      }
    } catch (e) {
      console.error('Failed to load backups history', e);
      showStatus('error', 'Failed to retrieve backup files list.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Create manual backup
  const handleCreateBackup = async (labelInput?: string) => {
    setIsBackingUp(true);
    showStatus('info', 'Compiling database tables...');
    
    try {
      const dataToBackup = mockDb.exportAllData();
      const backupLabel = labelInput || 'manual';

      // Validation for Google Drive
      if ((destination === 'gdrive' || destination === 'all') && !gdriveConnected) {
        throw new Error('Google Drive destination is selected but no Google Service Account is connected. Please connect one first!');
      }

      // 1. Save on Server
      if (destination === 'server' || destination === 'all') {
        const res = await fetch('/api/admin/backups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tables: dataToBackup,
            isAutomated: false,
            label: backupLabel
          })
        });
        
        const serverResult = await res.json();
        if (!serverResult.success) {
          throw new Error(serverResult.error || 'Failed to save to server');
        }
      }

      // 2. Save to Local Browser Storage
      if (destination === 'local' || destination === 'all') {
        const timestamp = Date.now();
        const localFilename = `backup_${timestamp}_manual_${backupLabel}.json`;
        const sizeEstimate = JSON.stringify(dataToBackup).length;
        
        const newLocalBackup = {
          filename: localFilename,
          size: sizeEstimate,
          createdAt: new Date().toISOString(),
          type: 'manual',
          tables: dataToBackup
        };

        const existingLocal = localStorage.getItem('hr_system_local_backups');
        const list = existingLocal ? JSON.parse(existingLocal) : [];
        list.unshift(newLocalBackup);
        localStorage.setItem('hr_system_local_backups', JSON.stringify(list));
      }

      // 3. Save to Google Drive (Mocked for UI display)
      if (destination === 'gdrive' || destination === 'all') {
        showStatus('info', 'Uploading snapshot to Google Drive folder...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate GDrive upload latency
        
        const timestamp = Date.now();
        const gdriveFilename = `gdrive_backup_${timestamp}_manual_${backupLabel}.json`;
        const sizeEstimate = JSON.stringify(dataToBackup).length;
        
        const newGdriveBackup = {
          filename: gdriveFilename,
          size: sizeEstimate,
          createdAt: new Date().toISOString(),
          type: 'manual',
          tables: dataToBackup,
          folderId: gdriveFolderId || 'My Drive Root'
        };

        const existingGdrive = localStorage.getItem('hr_system_gdrive_backups');
        const list = existingGdrive ? JSON.parse(existingGdrive) : [];
        list.unshift(newGdriveBackup);
        localStorage.setItem('hr_system_gdrive_backups', JSON.stringify(list));
        
        logAction('UPLOAD_DATABASE_BACKUP_GDRIVE', 'Database', `Uploaded backup to Google Drive folder: ${gdriveFolderId || 'Root'}`);
      }

      // Download file to browser automatically
      downloadJsonFile(dataToBackup, `hr_backup_${Date.now()}_${backupLabel}.json`);

      logAction('CREATE_DATABASE_BACKUP', 'Database', `Manual backup created. Destination: ${destination}`);
      showStatus('success', 'Database backup completed and saved successfully!');
      loadBackupHistory();
    } catch (error: any) {
      console.error('Backup creation failed', error);
      showStatus('error', error.message || 'Backup failed. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Helper to trigger file download
  const downloadJsonFile = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Triggered when scheduler interval fires
  const triggerAutomatedBackup = async () => {
    console.log('[AUTOBACKUP TRIGGERED] Saving automated system snapshot...');
    try {
      const dataToBackup = mockDb.exportAllData();

      // Check Google Drive auth if selected
      if ((destination === 'gdrive' || destination === 'all') && !gdriveConnected) {
        console.warn('[AUTOBACKUP WARNING] Google Drive destination selected but not authorized.');
        return;
      }

      // 1. Save on Server
      if (destination === 'server' || destination === 'all') {
        await fetch('/api/admin/backups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tables: dataToBackup,
            isAutomated: true,
            label: 'system'
          })
        });
      }

      // 2. Save in local storage
      if (destination === 'local' || destination === 'all') {
        const timestamp = Date.now();
        const localFilename = `backup_${timestamp}_auto_system.json`;
        const sizeEstimate = JSON.stringify(dataToBackup).length;
        
        const newLocalBackup = {
          filename: localFilename,
          size: sizeEstimate,
          createdAt: new Date().toISOString(),
          type: 'auto',
          tables: dataToBackup
        };

        const existingLocal = localStorage.getItem('hr_system_local_backups');
        const list = existingLocal ? JSON.parse(existingLocal) : [];
        list.unshift(newLocalBackup);
        localStorage.setItem('hr_system_local_backups', JSON.stringify(list));
      }

      // 3. Save to Google Drive (Mocked)
      if (destination === 'gdrive' || destination === 'all') {
        const timestamp = Date.now();
        const gdriveFilename = `gdrive_backup_${timestamp}_auto_system.json`;
        const sizeEstimate = JSON.stringify(dataToBackup).length;
        
        const newGdriveBackup = {
          filename: gdriveFilename,
          size: sizeEstimate,
          createdAt: new Date().toISOString(),
          type: 'auto',
          tables: dataToBackup,
          folderId: gdriveFolderId || 'My Drive Root'
        };

        const existingGdrive = localStorage.getItem('hr_system_gdrive_backups');
        const list = existingGdrive ? JSON.parse(existingGdrive) : [];
        list.unshift(newGdriveBackup);
        localStorage.setItem('hr_system_gdrive_backups', JSON.stringify(list));
      }

      localStorage.setItem('hr_system_backup_last_run', String(Date.now()));
      loadBackupHistory();
      logAction('AUTOMATED_DATABASE_BACKUP', 'Database', 'Automated database snapshot completed by system scheduler.');
    } catch (e) {
      console.error('Automated backup failed', e);
    }
  };

  // Delete a backup
  const handleDeleteBackup = async (filename: string, source: 'server' | 'local' | 'gdrive') => {
    if (!confirm(`Are you sure you want to permanently delete backup "${filename}"?`)) return;

    try {
      if (source === 'local') {
        const list = localBackups.filter(b => b.filename !== filename);
        localStorage.setItem('hr_system_local_backups', JSON.stringify(list));
        setLocalBackups(list);
        showStatus('success', 'Local backup deleted successfully.');
      } else if (source === 'gdrive') {
        const list = gdriveBackups.filter(b => b.filename !== filename);
        localStorage.setItem('hr_system_gdrive_backups', JSON.stringify(list));
        setGdriveBackups(list);
        showStatus('success', 'Google Drive backup file deleted successfully.');
      } else {
        const res = await fetch(`/api/admin/backups?filename=${encodeURIComponent(filename)}`, {
          method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
          showStatus('success', 'Server backup deleted successfully.');
          loadBackupHistory();
        } else {
          throw new Error(result.error || 'Failed to delete server file');
        }
      }
      logAction('DELETE_BACKUP_FILE', 'Database', `Deleted backup file: ${filename} from ${source}`);
    } catch (e: any) {
      showStatus('error', e.message || 'Failed to delete backup file.');
    }
  };

  // Download a server backup to local device
  const handleDownloadServerBackup = async (filename: string) => {
    try {
      showStatus('info', 'Downloading backup file from server...');
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (data.success) {
        downloadJsonFile(data.tables, filename);
        showStatus('success', `Backup downloaded successfully: ${filename}`);
      } else {
        throw new Error(data.error || 'Failed to fetch file');
      }
    } catch (e: any) {
      showStatus('error', e.message || 'Download failed.');
    }
  };

  // Restore database state from a backup
  const handleRestoreBackup = async (filename: string, source: 'server' | 'local' | 'gdrive', localData?: any) => {
    const warningText = "WARNING: Restoring will overwrite all current system data (Employees, Payroll, Leaves, Attendance, etc.). The application will reload. Proceed?";
    if (!confirm(warningText)) return;

    setIsRestoring(true);
    showStatus('info', 'Loading backup dataset...');
    
    try {
      let tablesToRestore = localData;

      // If server file, fetch its data first
      if (source === 'server') {
        const res = await fetch('/api/admin/backups/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filename })
        });
        const data = await res.json();
        if (data.success) {
          tablesToRestore = data.tables;
        } else {
          throw new Error(data.error || 'Failed to fetch server backup content');
        }
      }

      if (!tablesToRestore || typeof tablesToRestore !== 'object') {
        throw new Error('Invalid or corrupted backup data');
      }

      // Check if data has mandatory tables
      if (!tablesToRestore.users || !tablesToRestore.employees) {
        throw new Error('Backup invalid: missing core system tables (users/employees)');
      }

      // Run import
      const success = mockDb.importAllData(tablesToRestore);
      if (success) {
        logAction('RESTORE_DATABASE_STATE', 'Database', `Restored database to snapshot: ${filename} (source: ${source})`);
        showStatus('success', 'System restored successfully! Reloading...');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('MockDB import operation failed.');
      }
    } catch (e: any) {
      setIsRestoring(false);
      showStatus('error', e.message || 'Restoration failed. Ensure backup JSON is valid.');
    }
  };

  // File Upload drag/drop handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      showStatus('error', 'Only .json database backup files are accepted.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        await handleRestoreBackup(file.name, 'local', parsed);
      } catch (e) {
        showStatus('error', 'File parsing failed. The file is not a valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Convert size to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Convert time countdown to display string (m:ss)
  const formatCountdown = (seconds: number | null) => {
    if (seconds === null) return 'Suspended';
    if (seconds <= 0) return 'Executing...';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database className="h-6 w-6" />
            </span>
            Database Backup & Automation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Secure, compile, export, and automate the backup snapshots of all HR system records.
          </p>
        </div>
        <button 
          onClick={loadBackupHistory}
          disabled={loadingHistory}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          Refresh Lists
        </button>
      </div>

      {/* ─── Alert Toast ─── */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border shadow-sm transition-all duration-300 animate-slide-in ${
          statusMessage.type === 'success' ? 'bg-emerald-50/80 border-emerald-100 text-emerald-800' :
          statusMessage.type === 'error' ? 'bg-rose-50/80 border-rose-100 text-rose-800' :
          'bg-indigo-50/80 border-indigo-100 text-indigo-800'
        }`}>
          {statusMessage.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />}
          {statusMessage.type === 'error' && <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />}
          {statusMessage.type === 'info' && <Info className="h-5 w-5 shrink-0 text-indigo-600" />}
          <div className="text-xs sm:text-sm font-semibold">{statusMessage.text}</div>
        </div>
      )}

      {/* ─── Main Grid Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Controls & Stats */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: DB Health / Stats */}
          <div className="backdrop-blur-md bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-slate-400" />
              Database Health & Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-2xl font-black text-slate-800">{dbStats.employees}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Staff Members</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-2xl font-black text-slate-800">{dbStats.users}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Security Accounts</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-2xl font-black text-slate-800">{dbStats.runs}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Payroll Cycles</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-2xl font-black text-slate-800">{dbStats.attendance}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Attendance logs</div>
              </div>
            </div>
            <div className="mt-4 p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
              <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                Database engine running on **MockDB LocalStorage Layer**. All configurations are locally persistent.
              </p>
            </div>
          </div>

          {/* Card: Automation Scheduler */}
          <div className="backdrop-blur-md bg-white border border-slate-100 rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
            
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-slate-400" />
              Automated Backups Scheduler
            </h2>

            <div className="space-y-4">
              {/* Enable Switch */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <label htmlFor="auto-backup-toggle" className="text-xs sm:text-sm font-bold text-slate-700 block">
                    Enable Auto-Backups
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Automatically backup data in background
                  </span>
                </div>
                <button
                  id="auto-backup-toggle"
                  onClick={() => saveAutomationSettings(!autoEnabled, frequency, destination)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    autoEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  aria-checked={autoEnabled}
                  role="switch"
                >
                  <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    autoEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Frequency Select */}
              <div>
                <label htmlFor="frequency-select" className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                  Backup Frequency
                </label>
                <select
                  id="frequency-select"
                  value={frequency}
                  onChange={(e) => saveAutomationSettings(autoEnabled, parseInt(e.target.value), destination)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value={60}>Every 1 Minute (For Demo)</option>
                  <option value={300}>Every 5 Minutes</option>
                  <option value={3600}>Hourly</option>
                  <option value={86400}>Daily</option>
                  <option value={604800}>Weekly</option>
                </select>
              </div>

              {/* Destination Select */}
              <div>
                <label htmlFor="destination-select" className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                  Storage Destination
                </label>
                <select
                  id="destination-select"
                  value={destination}
                  onChange={(e) => saveAutomationSettings(autoEnabled, frequency, e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="server">Server Disk Storage</option>
                  <option value="local">Local Browser Storage</option>
                  <option value="gdrive">Google Drive Cloud Storage (Mocked)</option>
                  <option value="all">All Destinations (Server, Local & Drive)</option>
                </select>
              </div>

              {/* Google Drive Integration Panel */}
              {(destination === 'gdrive' || destination === 'all') && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-2 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 inline-block" />
                      Google Drive Link
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      gdriveConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {gdriveConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="folder-id-input" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Target Folder ID</label>
                      <input
                        id="folder-id-input"
                        type="text"
                        value={gdriveFolderId}
                        onChange={(e) => handleGdriveFolderIdChange(e.target.value)}
                        placeholder="e.g. 1A_2B_3C_xyz789..."
                        className="w-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 mt-0.5 outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <button
                      onClick={handleToggleGDriveConnect}
                      disabled={isConnectingGDrive}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        gdriveConnected 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {isConnectingGDrive && <RefreshCw className="h-3 w-3 animate-spin" />}
                      {gdriveConnected ? 'Disconnect Service Account' : 'Connect Service Account'}
                    </button>
                    
                    {gdriveConnected && (
                      <div className="text-[10px] text-slate-500 font-medium leading-normal bg-white p-2 border border-slate-100 rounded-lg">
                        <span className="font-bold block text-slate-600">Active Service Client:</span>
                        hr-backup-service@system-1290.iam.gserviceaccount.com
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Live Status countdown */}
              <div className="pt-2">
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${autoEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-[11px] font-bold text-slate-600 uppercase">Scheduler Status</span>
                  </div>
                  <div className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                    autoEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {formatCountdown(countdown)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Manual Backup Trigger */}
          <div className="backdrop-blur-md bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Play className="h-4 w-4 text-slate-400 fill-slate-400" />
              Manual Backup & Download
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => handleCreateBackup('quick')}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isBackingUp ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Compile & Download JSON Backup
              </button>
              <p className="text-[10px] text-slate-500 font-semibold text-center mt-1">
                Generates a clean backup file of the entire database and saves it based on current storage destination.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column - Restore & History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Drag-Drop Restore Area */}
          <div className="backdrop-blur-md bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <UploadCloud className="h-4 w-4 text-slate-400" />
              Restore System Database
            </h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
              }`}
              onClick={() => document.getElementById('restore-file-input')?.click()}
            >
              <input
                id="restore-file-input"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileInput}
              />
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-700">Drag & Drop Backup File</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
                or click to browse from computer (JSON database file)
              </p>
            </div>
            
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[10px] sm:text-xs text-amber-900 font-medium leading-relaxed">
                **Restoring is a destructive operation** that completely overwrites all current system records. Ensure your backup file was created by this system.
              </div>
            </div>
          </div>

          {/* Card: History list */}
          <div className="backdrop-blur-md bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            
            {/* Tabs & Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-slate-400" />
                Backup Log History
              </h2>
              
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl flex-wrap">
                <button
                  onClick={() => setActiveTab('server')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'server' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Server className="h-3 w-3" />
                  Server Files ({serverBackups.length})
                </button>
                <button
                  onClick={() => setActiveTab('local')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'local' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileJson className="h-3 w-3" />
                  Local ({localBackups.length})
                </button>
                <button
                  onClick={() => setActiveTab('gdrive')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'gdrive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 inline-block" />
                  Google Drive ({gdriveBackups.length})
                </button>
              </div>
            </div>

            {/* List */}
            <div className="mt-4 overflow-x-auto min-h-[250px]">
              
              {loadingHistory ? (
                <div className="flex flex-col justify-center items-center py-12 gap-3">
                  <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                  <p className="text-xs text-slate-500 font-semibold">Fetching backup index files...</p>
                </div>
              ) : (activeTab === 'server' ? serverBackups : activeTab === 'local' ? localBackups : gdriveBackups).length === 0 ? (
                <div className="flex flex-col justify-center items-center py-12 text-slate-400 text-center gap-2">
                  <Database className="h-10 w-10 text-slate-200" />
                  <p className="text-xs font-bold text-slate-500">No backups found in this storage partition</p>
                  <p className="text-[10px] text-slate-400 max-w-[240px]">
                    Create a manual backup or enable the scheduler to store backup snapshots.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Backup File</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Size</th>
                      <th className="pb-3">Created</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'server' ? serverBackups : activeTab === 'local' ? localBackups : gdriveBackups).map((backup) => (
                      <tr 
                        key={backup.filename}
                        className="border-b border-slate-50 text-slate-700 hover:bg-slate-50/50 transition-all"
                      >
                        <td className="py-3 pr-2 max-w-[180px] truncate">
                          <span className="text-xs font-bold block text-slate-700" title={backup.filename}>
                            {backup.filename}
                          </span>
                          {activeTab === 'gdrive' && backup.folderId && (
                            <span className="text-[9px] text-slate-400 font-bold block">
                              Folder ID: {backup.folderId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                            backup.type === 'auto' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-xs font-semibold text-slate-500">
                          {formatBytes(backup.size)}
                        </td>
                        <td className="py-3 pr-2 text-xs font-medium text-slate-500">
                          {new Date(backup.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Restore Button */}
                            <button
                              onClick={() => handleRestoreBackup(backup.filename, activeTab, backup.tables)}
                              disabled={isRestoring}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] transition-colors"
                              title="Restore to this point"
                            >
                              Restore
                            </button>
                            
                            {/* Download Button (Only for Server backups) */}
                            {activeTab === 'server' && (
                              <button
                                onClick={() => handleDownloadServerBackup(backup.filename)}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                title="Download JSON file"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteBackup(backup.filename, activeTab)}
                              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              title="Delete backup"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
