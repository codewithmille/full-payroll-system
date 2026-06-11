// app/(dashboard)/portal/layout.tsx
'use client';

import RoleGuard from "@/components/auth/RoleGuard";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR', 'PAYROLL_OFFICER', 'STAFF']} moduleName="Staff Portal">
      {children}
    </RoleGuard>
  );
}
