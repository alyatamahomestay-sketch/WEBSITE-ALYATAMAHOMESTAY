'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PanelSidebar from '@/components/panel/PanelSidebar';
import PanelHeader from '@/components/panel/PanelHeader';

function PanelContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<'admin' | 'staff'>('admin');

  useEffect(() => {
    // 1. Read from URL query param if present
    if (roleParam === 'admin' || roleParam === 'staff') {
      setRole(roleParam);
      return;
    }

    // 2. Read from localStorage session if available
    if (typeof window !== 'undefined') {
      const sessStr = localStorage.getItem('alyatama_staff_session');
      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          if (sess.role === 'admin' || sess.role === 'staff') {
            setRole(sess.role);
            return;
          }
        } catch (e) {}
      }
    }
  }, [roleParam]);

  const handleRoleChange = (newRole: 'admin' | 'staff') => {
    setRole(newRole);
    const url = new URL(window.location.href);
    url.searchParams.set('role', newRole);
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] flex flex-col font-sans">
      <PanelSidebar currentRole={role} onRoleChange={handleRoleChange} />

      <div className="lg:pl-64 flex flex-col flex-1">
        <PanelHeader currentRole={role} title="ALYATAMA HOMESTAY — Operations PMS (/panel)" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Memuat Portal Manajemen ALYATAMA...</div>}>
      <PanelContent>{children}</PanelContent>
    </Suspense>
  );
}
