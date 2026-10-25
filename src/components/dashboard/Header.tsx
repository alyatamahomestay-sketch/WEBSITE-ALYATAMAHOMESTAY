'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  User, 
  LogOut, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  PlusCircle
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/check-env';
import { UserRole } from '@/lib/types';

interface HeaderProps {
  currentRole: UserRole;
  title: string;
}

export default function DashboardHeader({ currentRole, title }: HeaderProps) {
  const router = useRouter();
  const dbConnected = isSupabaseConfigured();

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <h1 className="text-base sm:text-lg font-semibold text-stone-900 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Database Status Pill */}
        <Link
          href="/auth/setup"
          className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
            dbConnected
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
          title="Klik untuk membuka panduan setup database Supabase"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{dbConnected ? 'Supabase Live' : 'Mode Pratinjau (Setup DB)'}</span>
        </Link>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-700">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-stone-900 leading-tight">
              Staf ALYATAMA
            </div>
            <div className="text-[10px] text-stone-500 uppercase font-mono">
              {currentRole}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
          title="Keluar (Logout)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
