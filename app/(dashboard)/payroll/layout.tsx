// app/(dashboard)/payroll/layout.tsx
'use client';

import RoleGuard from "@/components/auth/RoleGuard";

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'PAYROLL_OFFICER']} moduleName="Payroll & Computations">
      {children}
    </RoleGuard>
  );
}
