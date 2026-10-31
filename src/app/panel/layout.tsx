'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PanelSidebar from '@/components/panel/PanelSidebar';
import PanelHeader from '@/components/panel/PanelHeader';

function PanelGatekeeper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

  const [role, setRole] = useState<'admin' | 'staff'>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // If we are directly on /panel/login or /login, bypass sidebar & gatekeeper
  const isLoginPage = pathname === '/panel/login' || pathname === '/login';

  useEffect(() => {
    // Restore sidebar state from localStorage or default responsive state
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alyatama_sidebar_open');
      if (saved !== null) {
        setIsSidebarOpen(saved === 'true');
      } else if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('alyatama_sidebar_open', String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    // Check authentication from localStorage session
    if (typeof window !== 'undefined') {
      const sessStr = localStorage.getItem('alyatama_staff_session');
      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          if (sess && (sess.role === 'admin' || sess.role === 'staff')) {
            setRole(sess.role);
            setIsAuthenticated(true);
            return;
          }
        } catch (e) {
          console.error('Session parse error:', e);
        }
      }

      // No active session found -> redirect to /login
      setIsAuthenticated(false);
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, isLoginPage, router]);

  const handleRoleChange = (newRole: 'admin' | 'staff') => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      const sessStr = localStorage.getItem('alyatama_staff_session');
      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          sess.role = newRole;
          localStorage.setItem('alyatama_staff_session', JSON.stringify(sess));
        } catch (e) {}
      }
      const url = new URL(window.location.href);
      url.searchParams.set('role', newRole);
      window.location.href = url.toString();
    }
  };

  // 1. On Login Page: render cleanly without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 2. Checking authentication: show polite loading screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#30291F] flex flex-col items-center justify-center p-6 text-stone-200">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[#C6A47B]">Memeriksa Hak Akses Portal Operasional...</p>
        <span className="text-xs text-stone-400 mt-1">Mengalihkan ke sistem autentikasi aman</span>
      </div>
    );
  }

  // 3. Unauthenticated: prevent flashing protected content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#30291F] flex flex-col items-center justify-center p-6 text-stone-200">
        <p className="text-sm font-medium text-[#C6A47B]">Mengalihkan ke halaman login...</p>
      </div>
    );
  }

  // 4. Authenticated: render full management panel with collapsible sidebar & header
  return (
    <div className="min-h-screen bg-[#F7F4ED] print:bg-white print:min-h-0 flex flex-col font-sans">
      <PanelSidebar 
        currentRole={role} 
        onRoleChange={handleRoleChange} 
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
      />

      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} print:pl-0 print:m-0`}>
        <PanelHeader 
          currentRole={role} 
          title="ALYATAMA HOMESTAY — Operations PMS" 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#30291F] flex items-center justify-center text-xs text-stone-300">
        Memuat Portal Manajemen ALYATAMA...
      </div>
    }>
      <PanelGatekeeper>{children}</PanelGatekeeper>
    </Suspense>
  );
}
