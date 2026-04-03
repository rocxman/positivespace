'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { SidebarSkeleton } from '@/components/ui/skeleton';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <SidebarSkeleton />
        <div className="flex-1 ml-64">
          <TopBar />
          <main className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-slate-800 rounded" />
              <div className="h-64 w-full bg-slate-800/50 rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
