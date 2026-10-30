'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Database, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { StaffShift } from '@/lib/types';

interface PanelHeaderProps {
  currentRole: 'admin' | 'staff';
  title?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function PanelHeader({ 
  currentRole, 
  title = 'ALYATAMA HOMESTAY — Operations PMS',
  isSidebarOpen = true,
  onToggleSidebar
}: PanelHeaderProps) {
  const router = useRouter();
  const dbConnected = isSupabaseConfigured();
  const [activeShift, setActiveShift] = useState<StaffShift | null>(null);
  const [staffName, setStaffName] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('alyatama_staff_session');
      if (sessionStr) {
        try {
          const sess = JSON.parse(sessionStr);
          setStaffName(sess.full_name || sess.username || 'Staf');
        } catch (e) {}
      }

      const shiftStr = localStorage.getItem('alyatama_active_shift');
      if (shiftStr) {
        try {
          setActiveShift(JSON.parse(shiftStr));
        } catch (e) {}
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alyatama_staff_session');
      localStorage.removeItem('alyatama_active_shift');
    }
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition-colors flex items-center gap-2 text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
            title={isSidebarOpen ? "Tutup Sidebar Menu" : "Buka Sidebar Menu"}
            aria-label={isSidebarOpen ? "Tutup Sidebar Menu" : "Buka Sidebar Menu"}
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-[#806044]" />
                <span className="hidden md:inline text-stone-700 font-medium">Tutup Menu</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-[#806044]" />
                <span className="text-stone-800 font-bold">Buka Menu</span>
              </>
            )}
          </button>
        )}

        <h1 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Active Shift Indicator Pill */}
        {currentRole === 'staff' && activeShift && (
          <div className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Shift Aktif: {activeShift.staff_name_snapshot}</span>
          </div>
        )}

        {/* Database Status Pill */}
        <Link
          href="/panel/pengaturan"
          className={`hidden md:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
            dbConnected
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
          title="Status database Supabase"
        >
          <Database className="w-3 h-3" />
          <span>{dbConnected ? 'Supabase DB Live' : 'Mode Pratinjau Interaktif'}</span>
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-700">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[140px]">
              {staffName || (currentRole === 'admin' ? 'Administrator' : 'Staf Bertugas')}
            </div>
            <div className="text-[10px] text-stone-500 uppercase font-mono tracking-wider">
              {currentRole}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          title="Keluar Sesi (/login)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
