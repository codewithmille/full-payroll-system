// app/(dashboard)/admin/security/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSecurity, SecurityEvent, INITIAL_LOGS } from '@/components/providers/SecurityProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Trash2, 
  Ban, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Plus, 
  X, 
  Globe, 
  Cpu, 
  AlertCircle, 
  ArrowUpRight, 
  Info,
  ShieldX,
  History
} from 'lucide-react';

export default function AdminSecurityPage() {
  const { logAction } = useAuth();
  const {
    antiBotMode,
    setAntiBotMode,
    rateLimit,
    setRateLimit,
    wafStrictness,
    setWafStrictness,
    blockedIps,
    blockIp,
    unblockIp,
    clearAllBlockedIps,
    securityLogs,
    clearSecurityLogs,
    simulateThreat
  } = useSecurity();

  // Component UI States
  const [manualIp, setManualIp] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showSimulateToast, setShowSimulateToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Log audit view action when page mounts
  useEffect(() => {
    logAction('VIEW_SECURITY_CONTROL_CENTER', 'SecuritySettings', 'Admin accessed the WAF, Anti-Bot and Intrusion Detection dashboard.');
  }, []);

  // Handler to add IP block manually
  const handleManualBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp) return;
    
    // Quick regex validation for IP address
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipPattern.test(manualIp)) {
      alert('Please enter a valid IPv4 address (e.g. 192.168.1.100)');
      return;
    }

    const reason = manualReason || 'Manual Administrator Enforced Block';
    blockIp(manualIp, reason);
    
    // Add security log
    logAction('MANUAL_IP_BLOCKED', 'SecuritySettings', `Admin manually blocked IP address: ${manualIp}. Reason: ${reason}`);

    setManualIp('');
    setManualReason('');
    triggerToast(`Enforced manual block on IP: ${manualIp}`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSimulateToast(true);
    setTimeout(() => {
      setShowSimulateToast(false);
    }, 3500);
  };

  const handleSimulate = (type: 'CRAWL' | 'BRUTE' | 'SQLI' | 'XSS' | 'SELF_BLOCK') => {
    simulateThreat(type);
    let label = '';
    switch (type) {
      case 'CRAWL': label = 'Crawler Bot scrape attempt'; break;
      case 'BRUTE': label = 'Credential Brute Force attack'; break;
      case 'SQLI': label = 'SQL Injection payload block'; break;
      case 'XSS': label = 'Cross-Site Scripting script injection'; break;
      case 'SELF_BLOCK': label = 'Client self-blocking demonstration'; break;
    }
    triggerToast(`Simulated: ${label} registered successfully.`);
  };

  // Filtered Incident Logs
  const filteredLogs = securityLogs.filter(log => {
    if (filterType === 'ALL') return true;
    return log.type === filterType;
  });

  // Calculate stats dynamically from recent logs
  const totalAttacksBlocked = securityLogs.filter(l => l.status === 'BLOCKED').length;
  const totalChallengesEnforced = securityLogs.filter(l => l.status === 'CHALLENGED').length;
  
  // Threat Level indicator
  const recentCriticals = securityLogs.filter(l => 
    l.severity === 'CRITICAL' && 
    (Date.now() - new Date(l.timestamp).getTime()) < 300000 // last 5 minutes
  ).length;

  let threatLevel = 'SAFE';
  let threatColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  
  if (recentCriticals > 2 || securityLogs.length > 20) {
    threatLevel = 'SEVERE THREAT WARNING';
    threatColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse';
  } else if (recentCriticals > 0 || securityLogs.length > 8) {
    threatLevel = 'ELEVATED ACTIVITY';
    threatColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  // ─── SVG CUSTOM RESPONSIVE CHART LOGIC ──────────────────────────────
  // Mock last 7 hours request distribution
  const chartHours = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const baseRequests = [140, 160, 290, 195, 250, 480, 310];
  const baseAttacks = [2, 0, 12, 4, 1, 38, 15];

  // Adjust chart based on current state logs to reflect simulation in visual curve
  const currentAttacksCount = securityLogs.length;
  const dynamicRequests = [...baseRequests];
  const dynamicAttacks = [...baseAttacks];
  if (currentAttacksCount > INITIAL_LOGS.length) {
    const diff = currentAttacksCount - INITIAL_LOGS.length;
    // Add simulation impact to the latest hour (18:00 / index 6)
    dynamicRequests[6] += diff * 15;
    dynamicAttacks[6] += diff;
  }

  const maxRequests = 600;
  const maxAttacks = 60;

  const getSvgCoordinates = (dataList: number[], maxVal: number) => {
    const width = 600;
    const height = 140;
    const paddingX = 40;
    const paddingY = 15;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const points = dataList.map((val, i) => {
      const x = paddingX + (i / (dataList.length - 1)) * chartWidth;
      const ratio = val / maxVal;
      const y = height - paddingY - (ratio * chartHeight);
      return { x, y };
    });

    return points;
  };

  const reqPoints = getSvgCoordinates(dynamicRequests, maxRequests);
  const attPoints = getSvgCoordinates(dynamicAttacks, maxAttacks);

  const reqPath = `M ${reqPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const attPath = `M ${attPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // Area paths (close path to bottom)
  const reqAreaPath = `${reqPath} L ${reqPoints[reqPoints.length - 1].x},125 L ${reqPoints[0].x},125 Z`;
  const attAreaPath = `${attPath} L ${attPoints[attPoints.length - 1].x},125 L ${attPoints[0].x},125 Z`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7 text-indigo-600 shrink-0" />
            Security & Anti-Bot Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Configure Web Application Firewall rules, Anti-Bot captchas, rate limiters, and monitor live hack alerts.
          </p>
        </div>

        {/* Global Threat Status */}
        <div className={`inline-flex items-center px-4 py-2 rounded-2xl border text-xs font-black tracking-wide ${threatColor}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-current mr-2 shrink-0 animate-ping"></div>
          STATUS: {threatLevel}
        </div>
      </div>

      {/* Simulator Active Toast */}
      {showSimulateToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold animate-slide-in">
          <Zap className="h-4.5 w-4.5 text-yellow-400 shrink-0 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Attacks Blocked</span>
            <span className="text-2xl font-black text-slate-800 font-mono">
              {totalAttacksBlocked + blockedIps.length}
            </span>
            <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
              <span className="text-emerald-500 font-bold flex items-center">
                <ArrowUpRight className="h-3 w-3 inline" /> +12%
              </span>
              from last cycle
            </span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Captcha challenged</span>
            <span className="text-2xl font-black text-slate-800 font-mono">
              {totalChallengesEnforced}
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Pass Rate: <span className="text-indigo-600 font-extrabold">87.5%</span> (Standard)
            </span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-purple-500">
            <Cpu className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Blocked IPs</span>
            <span className="text-2xl font-black text-slate-800 font-mono">
              {blockedIps.length}
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Active blocklist rules
            </span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500">
            <Ban className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rate Limit Protection</span>
            <span className="text-2xl font-black text-slate-800 font-mono">
              {rateLimit > 0 ? `${rateLimit}/m` : 'OFF'}
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              DDoS shield response
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-500">
            <Zap className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Graph + Configuration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart Column (Span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
            <div>
              <h2 className="text-sm font-black text-slate-800">Security Threat Activity Monitor</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Real-time analysis of API requests vs. blocked attacks</p>
            </div>
            <div className="flex gap-4 text-[9px] font-extrabold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Total Requests (max: {maxRequests})
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Blocked Attacks (max: {maxAttacks})
              </span>
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="relative w-full h-[150px] overflow-hidden my-2">
            <svg 
              viewBox="0 0 600 140" 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="reqGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="attGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="15" x2="560" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="70" x2="560" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="125" x2="560" y2="125" stroke="#e2e8f0" strokeWidth="1" />

              {/* Area Under Lines */}
              <path d={reqAreaPath} fill="url(#reqGlow)" />
              <path d={attAreaPath} fill="url(#attGlow)" />

              {/* Data Lines */}
              <path d={reqPath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={attPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots on points */}
              {reqPoints.map((p, idx) => (
                <g key={`req-dot-${idx}`}>
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-125 transition-transform" />
                  <title>Requests: {dynamicRequests[idx]}</title>
                </g>
              ))}

              {attPoints.map((p, idx) => (
                <g key={`att-dot-${idx}`}>
                  {dynamicAttacks[idx] > 0 && (
                    <circle cx={p.x} cy={p.y} r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                  <title>Attacks Blocked: {dynamicAttacks[idx]}</title>
                </g>
              ))}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-10 text-[9px] font-black text-slate-400 font-mono tracking-widest pt-2 border-t border-slate-50">
            {chartHours.map((hour, i) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>

        {/* Configuration Console (Span 1) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5 mb-1">
              <Cpu className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
              Security Shield Console
            </h2>
            <p className="text-[10px] text-slate-400 font-bold">Adjust protection thresholds and filter settings</p>
          </div>

          <div className="space-y-4">
            
            {/* Setting 1: Anti-bot Toggle */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Anti-Bot Slider Challenge</span>
                <span className="text-[9px] text-slate-400 font-semibold leading-relaxed">Require JS challenge verification for suspicious scrapers.</span>
              </div>
              <button
                onClick={() => setAntiBotMode(!antiBotMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${antiBotMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-250 shadow-sm ${antiBotMode ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
            </div>

            {/* Setting 2: WAF Strictness drop */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block">WAF Signature Strictness</span>
                <span className="text-[9px] text-slate-400 font-semibold leading-relaxed">Standard WAF filters vs. Strict payload sanitation rules.</span>
              </div>
              <select
                value={wafStrictness}
                onChange={(e) => setWafStrictness(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-[10px] py-1.5 px-2 text-slate-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="STANDARD">Standard</option>
                <option value="STRICT">Strict WAF</option>
              </select>
            </div>

            {/* Setting 3: Rate Limiting */}
            <div className="space-y-1.5 pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Rate Limiting (DDoS Shield)</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Max allowed mouse-clicks/actions per minute.</span>
                </div>
                <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {rateLimit === 0 ? 'Unlimited' : `${rateLimit}/min`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="30"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono px-1">
                <span>OFF</span>
                <span>30/m</span>
                <span>60/m</span>
                <span>90/m</span>
                <span>120/m</span>
                <span>150/m</span>
                <span>180/m</span>
              </div>
            </div>

          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 text-[10px] text-slate-400 font-semibold leading-normal flex items-start gap-2 shadow-inner">
            <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>Settings apply globally across all sub-portals. Local rate limits will log warning markers.</span>
          </div>
        </div>

      </div>

      {/* Simulator + Blocklist manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Threat Simulator Control Box */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5 mb-1">
              <Zap className="h-4.5 w-4.5 text-yellow-400 shrink-0" />
              Intrusion & Threat Simulator
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mb-4">Trigger mock attacks to verify auto-blocking defense</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            
            <button
              onClick={() => handleSimulate('CRAWL')}
              className="group text-left border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-indigo-50/30 p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[90px] outline-none"
            >
              <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-700 block">Bot Crawl Scrape</span>
                <span className="text-[8px] text-slate-400 font-semibold block leading-tight">Crawler scan payroll files</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulate('BRUTE')}
              className="group text-left border border-slate-100 hover:border-amber-100 bg-slate-50/50 hover:bg-amber-50/30 p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[90px] outline-none"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-2">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-700 block">Brute Force Auth</span>
                <span className="text-[8px] text-slate-400 font-semibold block leading-tight">Simulate login failure storm</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulate('SQLI')}
              className="group text-left border border-slate-100 hover:border-rose-100 bg-slate-50/50 hover:bg-rose-50/30 p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[90px] outline-none"
            >
              <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-2">
                <ShieldX className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-700 block">SQL Injection</span>
                <span className="text-[8px] text-slate-400 font-semibold block leading-tight">Inject UNION SELECT queries</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulate('XSS')}
              className="group text-left border border-slate-100 hover:border-purple-100 bg-slate-50/50 hover:bg-purple-50/30 p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[90px] outline-none"
            >
              <div className="w-7 h-7 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 mb-2">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-700 block">XSS Exploit Payload</span>
                <span className="text-[8px] text-slate-400 font-semibold block leading-tight">Simulate script tags inject</span>
              </div>
            </button>

          </div>

          <button
            onClick={() => handleSimulate('SELF_BLOCK')}
            className="w-full inline-flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition-all cursor-pointer shadow-md shadow-rose-500/10 active:scale-[0.98] outline-none"
          >
            <Ban className="h-4 w-4 animate-pulse" />
            <span>Simulate Self IP-Block (Test CAPTCHA)</span>
          </button>
        </div>

        {/* IP Blocklist Manager Box (Span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Ban className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                  Active Firewall Blocklist
                </h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Enforce blocklists on offending addresses or clear limits</p>
              </div>

              {blockedIps.length > 0 && (
                <button
                  onClick={clearAllBlockedIps}
                  className="inline-flex items-center justify-center text-[10px] font-black text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl py-1.5 px-3 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear All Blocklist
                </button>
              )}
            </div>

            {/* Blocklist Table */}
            <div className="max-h-[140px] overflow-y-auto pr-1">
              {blockedIps.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black text-[9px] uppercase tracking-widest">
                      <th className="py-2 px-3">IP Address</th>
                      <th className="py-2 px-3">Enforcement Type</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                    {blockedIps.map(ip => (
                      <tr key={ip} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-[10px]">{ip}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-red-50 text-red-600 border-red-100">
                            IP_FIREWALL_BLOCK
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => unblockIp(ip)}
                            className="inline-flex items-center text-[9px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            Unblock / Whitelist
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
                  <span className="text-[10px] font-bold">Firewall Clear. No active IP blocks found.</span>
                </div>
              )}
            </div>
          </div>

          {/* Add IP manually form */}
          <form onSubmit={handleManualBlock} className="flex flex-col sm:flex-row gap-3 border-t border-slate-50 pt-4 mt-4">
            <input
              type="text"
              placeholder="IP Address (e.g. 45.18.232.1)"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-bold placeholder-slate-400"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Block Rule</span>
            </button>
          </form>
        </div>

      </div>

      {/* Security Incident Logs Monitor Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
              Intrusion Detection Log Monitor
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Filterable history log of potential hacking vectors and bots</p>
          </div>

          <div className="flex gap-2 text-xs font-bold self-start sm:self-auto overflow-x-auto max-w-full pb-1">
            {['ALL', 'SQL_INJECTION', 'XSS_ATTEMPT', 'BOT_CRAWLER', 'BRUTE_FORCE', 'RATE_LIMIT_EXCEEDED'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl border text-[9px] font-black tracking-wide shrink-0 transition-all cursor-pointer ${
                  filterType === type 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {type === 'ALL' ? '⭐ SHOW ALL' : type.replace(/_/g, ' ')}
              </button>
            ))}
            
            {securityLogs.length > 0 && (
              <button
                onClick={clearSecurityLogs}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 text-[9px] font-bold cursor-pointer transition-colors"
                title="Clear Logs"
              >
                Clear Log List
              </button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-black text-[9px] uppercase tracking-widest">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Origin / IP</th>
                <th className="py-3 px-4">Threat Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident Log Details</th>
                <th className="py-3 px-4 text-right">Firewall Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/30">
                    <td className="py-3 px-4 font-mono text-[9px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 leading-normal">
                      <div className="font-bold font-mono text-slate-800">{log.ipAddress}</div>
                      <div className="text-[8px] text-slate-400 max-w-[140px] truncate" title={log.userAgent}>
                        {log.userAgent}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[9px] font-extrabold tracking-wider bg-slate-100 border border-slate-250 text-slate-600 px-2 py-0.5 rounded-md">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border
                        ${log.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : log.severity === 'HIGH'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }
                      `}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[320px] truncate text-slate-600 text-[11px] leading-relaxed" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase
                        ${log.status === 'BLOCKED'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : log.status === 'CHALLENGED'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-slate-100 text-slate-500'
                        }
                      `}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-bold text-[10px]">
                    No threats detected matching criteria.
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
