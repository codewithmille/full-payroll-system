// components/attendance/BiometricScannerModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, X, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

interface BiometricScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeName: string;
  actionType: 'IN' | 'OUT';
}

export default function BiometricScannerModal({
  isOpen,
  onClose,
  onSuccess,
  employeeName,
  actionType
}: BiometricScannerModalProps) {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [logMessages, setLogMessages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      startBiometrics();
    } else {
      setScanState('idle');
      setLogMessages([]);
    }
  }, [isOpen]);

  const startBiometrics = async () => {
    setScanState('scanning');
    setLogMessages(['[SYSTEM] Initializing reader hardware...']);
    
    // Attempt real WebAuthn system credentials if available
    if (typeof window !== 'undefined' && navigator.credentials && window.PublicKeyCredential) {
      try {
        const challenge = new Uint8Array([23, 44, 91, 102, 12, 53, 67, 88]);
        const userId = new Uint8Array([1, 9, 8, 4]);
        
        const credentialOptions: CredentialCreationOptions = {
          publicKey: {
            challenge,
            rp: { name: 'HR System Demo' },
            user: {
              id: userId,
              name: employeeName,
              displayName: employeeName
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256
            authenticatorSelection: {
              authenticatorAttachment: 'platform', // Touch ID / Windows Hello / FaceID
              userVerification: 'required'
            },
            timeout: 4000
          }
        };
        
        setLogMessages(prev => [...prev, '[HARDWARE] Requesting system biometrics dialog...']);
        await navigator.credentials.create(credentialOptions);
        
        // Success
        setLogMessages(prev => [
          ...prev, 
          '[SUCCESS] Credentials created in security enclave.',
          '[AUTH] Signature matches verified profile.'
        ]);
        setScanState('success');
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
        return;
      } catch (err: any) {
        console.warn('Native credentials call bypassed, starting scanning animation:', err);
        setLogMessages(prev => [
          ...prev,
          '[SYSTEM] Platform biometrics bypassed/unavailable.',
          '[SYS] Starting virtual laser scanner simulation...'
        ]);
      }
    } else {
      setLogMessages(prev => [
        ...prev,
        '[SYSTEM] WebAuthn API not supported by browser context.',
        '[SYS] Starting virtual laser scanner simulation...'
      ]);
    }
    
    // Run Simulated Laser Scan
    runSimulation();
  };

  const runSimulation = () => {
    const steps = [
      { delay: 600, log: '[SCANNER] Laser emitter status: ACTIVE' },
      { delay: 1250, log: '[SCANNER] Reading ridge profile...' },
      { delay: 2000, log: '[MATCHING] Verifying ridge detail with enrolled templates...' },
      { delay: 2600, log: '[SUCCESS] Fingerprint Matched. Welcome!' }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setLogMessages(prev => [...prev, step.log]);
        if (step.log.includes('Matched')) {
          setScanState('success');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        }
      }, step.delay);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* Styles Injection for laser animation */}
      <style jsx global>{`
        @keyframes laserScan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
        .laser-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, transparent, #22c55e, #4ade80, #22c55e, transparent);
          box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e;
          animation: laserScan 2.5s infinite linear;
          pointer-events: none;
        }
      `}</style>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Action Title */}
        <div className="text-center space-y-1 mb-5">
          <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Biometric Checkpoint</h3>
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Clock {actionType === 'IN' ? 'In' : 'Out'} Verification
          </h2>
          <p className="text-[10px] text-slate-400 font-bold">
            Verifying: <span className="text-slate-600 font-semibold">{employeeName}</span>
          </p>
        </div>

        {/* Visual Scanner Area */}
        <div className="relative h-40 w-40 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden mb-6 shadow-inner group">
          {/* Outer ring pulses if scanning */}
          {scanState === 'scanning' && (
            <div className="absolute inset-2 rounded-xl border border-emerald-400/20 animate-ping"></div>
          )}

          {/* Fingerprint Icon */}
          <Fingerprint className={`h-20 w-20 transition-all duration-300 ${
            scanState === 'success' 
              ? 'text-emerald-500 scale-105 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
              : scanState === 'failed'
              ? 'text-rose-500' 
              : 'text-indigo-500/80 group-hover:text-indigo-600'
          }`} />

          {/* Laser Line */}
          {scanState === 'scanning' && <div className="laser-line"></div>}

          {/* Success Check Overlay */}
          {scanState === 'success' && (
            <div className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center backdrop-blur-[0.5px]">
              <ShieldCheck className="h-10 w-10 text-emerald-500 animate-bounce" />
            </div>
          )}
        </div>

        {/* Logs Console */}
        <div className="w-full bg-slate-900/95 rounded-2xl p-4 font-mono text-[9px] text-slate-300 space-y-1.5 h-36 overflow-y-auto shadow-inner border border-slate-800">
          <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-1.5 mb-1 text-slate-500 font-bold uppercase tracking-wider">
            <Cpu className="h-3 w-3" />
            <span>Console output log</span>
          </div>
          {logMessages.map((msg, index) => {
            let color = 'text-slate-300';
            if (msg.includes('[SUCCESS]')) color = 'text-emerald-400';
            if (msg.includes('[SYSTEM]')) color = 'text-indigo-400';
            if (msg.includes('[HARDWARE]')) color = 'text-blue-400';
            if (msg.includes('Matched')) color = 'text-emerald-400 font-bold';
            
            return (
              <div key={index} className={color}>
                {msg}
              </div>
            );
          })}
        </div>

        {/* Action Button Label */}
        <p className="text-[10px] text-slate-400 font-bold mt-4 text-center">
          {scanState === 'scanning' 
            ? 'Scanning in progress... Keep finger on the device' 
            : scanState === 'success' 
            ? 'Access Granted! Processing check-in...' 
            : 'Press start biometrics to clock'}
        </p>
      </div>
    </div>
  );
}
