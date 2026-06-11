// app/(dashboard)/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function DashboardIndexPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        // Redirect to appropriate role space
        switch (user.role) {
          case 'STAFF':
            router.replace('/portal');
            break;
          case 'HR':
            router.replace('/hr/employees');
            break;
          case 'PAYROLL_OFFICER':
            router.replace('/payroll/runs');
            break;
          case 'ADMIN':
            router.replace('/admin/users');
            break;
          default:
            router.replace('/login');
        }
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
    </div>
  );
}
