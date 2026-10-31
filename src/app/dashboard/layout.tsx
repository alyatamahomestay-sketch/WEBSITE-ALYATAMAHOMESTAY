'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';
import { UserRole } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import AdminToast from '@/components/common/AdminToast';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') as UserRole;
  const [role, setRole] = useState<UserRole>(roleParam || 'owner');
  const dbConfigured = isSupabaseConfigured();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const url = new URL(window.location.href);
    url.searchParams.set('role', newRole);
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <AdminToast />
      <DashboardSidebar currentRole={role} onRoleChange={handleRoleChange} />

      <div className="lg:pl-64 flex flex-col flex-1">
        <DashboardHeader currentRole={role} title="ALYATAMA HOMESTAY — Operations PMS" />

        {!dbConfigured && (
          <div className="bg-amber-500 text-stone-950 px-4 sm:px-8 py-2 text-xs font-medium flex items-center justify-between gap-4 border-b border-amber-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-stone-950" />
              <span>
                <strong>Mode Pratinjau Interaktif:</strong> Kredensial Supabase di <code>.env.local</code> belum dihubungkan. Data tersimpan di memory preview.
              </span>
            </div>
            <Link
              href="/auth/setup"
              className="underline font-semibold hover:text-black whitespace-nowrap inline-flex items-center gap-1"
            >
              Lihat Panduan Setup Supabase
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Memuat antarmuka PMS ALYATAMA...</div>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
