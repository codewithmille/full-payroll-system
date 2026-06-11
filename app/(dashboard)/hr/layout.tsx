// app/(dashboard)/hr/layout.tsx
'use client';

import RoleGuard from "@/components/auth/RoleGuard";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR']} moduleName="Human Resources">
      {children}
    </RoleGuard>
  );
}
