// app/(dashboard)/admin/layout.tsx
'use client';

import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']} moduleName="Administration">
      {children}
    </RoleGuard>
  );
}
