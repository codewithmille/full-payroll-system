// components/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, mockDb } from '@/lib/mockDb';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
  logAction: (action: string, resource: string, details: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with a default user (e.g., ADMIN for ease of demoing)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hr_system_session');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse session', e);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    // Find user by email in our mockDb
    const foundUser = mockDb.getUserByEmail(email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('hr_system_session', JSON.stringify(foundUser));
      mockDb.addAuditLog(foundUser, 'USER_LOGIN', 'Auth', `User logged in successfully via mock email authentication.`);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    if (user) {
      mockDb.addAuditLog(user, 'USER_LOGOUT', 'Auth', `User logged out of session.`);
    }
    setUser(null);
    localStorage.removeItem('hr_system_session');
  };

  const switchRole = (role: User['role']) => {
    const list = mockDb.getUsers();
    const matched = list.find(u => u.role === role);
    if (matched) {
      setUser(matched);
      localStorage.setItem('hr_system_session', JSON.stringify(matched));
      mockDb.addAuditLog(matched, 'ROLE_SWITCHED_SIMULATION', 'Simulation', `User session switched to role: ${role} for review.`);
    }
  };

  const logAction = (action: string, resource: string, details: string) => {
    if (user) {
      mockDb.addAuditLog(user, action, resource, details);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole, logAction }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
