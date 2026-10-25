'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Home, 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  LogIn, 
  BedDouble, 
  Tag, 
  Users, 
  CreditCard, 
  DollarSign, 
  Sparkles, 
  Package, 
  Wrench, 
  FileSpreadsheet, 
  Settings, 
  ShieldAlert, 
  ChevronDown, 
  Menu, 
  X,
  QrCode
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export default function DashboardSidebar({ currentRole, onRoleChange }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const activeRole = (roleParam as UserRole) || currentRole;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // RBAC Access Matrix
  const canAccess = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(activeRole);
  };

  const navItems = [
    {
      title: 'Ikhtisar Operasional',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['owner', 'admin', 'reception', 'finance', 'housekeeping'] as UserRole[],
    },
    {
      title: 'Kalender Okupansi',
      href: '/dashboard/kalender',
      icon: Calendar,
      roles: ['owner', 'admin', 'reception'] as UserRole[],
    },
    {
      title: 'Data Reservasi',
      href: '/dashboard/reservasi',
      icon: BookOpen,
      roles: ['owner', 'admin', 'reception', 'finance'] as UserRole[],
    },
    {
      title: 'Check-in & Check-out',
      href: '/dashboard/check-in-out',
      icon: LogIn,
      roles: ['owner', 'admin', 'reception'] as UserRole[],
    },
    {
      title: 'Kamar & Tarif',
      href: '/dashboard/kamar',
      icon: BedDouble,
      roles: ['owner', 'admin'] as UserRole[],
    },
    {
      title: 'Promo & Diskon',
      href: '/dashboard/promo',
      icon: Tag,
      roles: ['owner', 'admin'] as UserRole[],
    },
    {
      title: 'Manajemen Tamu (CRM)',
      href: '/dashboard/tamu',
      icon: Users,
      roles: ['owner', 'admin', 'reception'] as UserRole[],
    },
    {
      title: 'Pembayaran & Deposit',
      href: '/dashboard/pembayaran',
      icon: CreditCard,
      roles: ['owner', 'admin', 'reception', 'finance'] as UserRole[],
    },
    {
      title: 'Keuangan & Laba',
      href: '/dashboard/keuangan',
      icon: DollarSign,
      roles: ['owner', 'admin', 'finance'] as UserRole[],
    },
    {
      title: 'Kebersihan (Housekeeping)',
      href: '/dashboard/housekeeping',
      icon: Sparkles,
      roles: ['owner', 'admin', 'reception', 'housekeeping'] as UserRole[],
    },
    {
      title: 'Inventaris Stok',
      href: '/dashboard/inventaris',
      icon: Package,
      roles: ['owner', 'admin', 'reception', 'housekeeping'] as UserRole[],
    },
    {
      title: 'Pemeliharaan & Kerusakan',
      href: '/dashboard/pemeliharaan',
      icon: Wrench,
      roles: ['owner', 'admin', 'reception', 'housekeeping'] as UserRole[],
    },
    {
      title: 'Laporan & Ekspor',
      href: '/dashboard/laporan',
      icon: FileSpreadsheet,
      roles: ['owner', 'admin', 'finance'] as UserRole[],
    },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-stone-900 text-stone-100 shadow-md border border-stone-800"
          aria-label="Toggle navigation sidebar"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 border-r border-stone-800 text-stone-300 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Home className="w-4 h-4 text-brand-300" />
            </div>
            <div>
              <span className="font-serif font-semibold text-sm text-stone-100 tracking-wide block leading-none">
                ALYATAMA
              </span>
              <span className="text-[9px] uppercase tracking-widest text-stone-400 block mt-0.5">
                PROPERTY PMS
              </span>
            </div>
          </Link>
        </div>

        {/* Role Indicator & Quick Switcher */}
        <div className="px-4 py-3 bg-stone-950/60 border-b border-stone-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
              Hak Akses Aktif:
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-900/60 text-brand-300 border border-brand-700/50">
              {activeRole}
            </span>
          </div>

          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="owner">Peran: Owner (Akses Penuh)</option>
            <option value="admin">Peran: Admin Operasional</option>
            <option value="reception">Peran: Reception</option>
            <option value="finance">Peran: Finance / Kasir</option>
            <option value="housekeeping">Peran: Housekeeping</option>
          </select>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems
            .filter((item) => canAccess(item.roles))
            .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={`${item.href}${activeRole ? `?role=${activeRole}` : ''}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}

          {/* Settings Submenu (Owner & Admin only) */}
          {canAccess(['owner', 'admin']) && (
            <div className="pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-stone-400" />
                  <span>Pengaturan Sistem</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>

              {settingsOpen && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  <Link
                    href={`/dashboard/pengaturan${activeRole ? `?role=${activeRole}` : ''}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-stone-400 hover:text-stone-100"
                  >
                    Profil Homestay
                  </Link>
                  <Link
                    href={`/dashboard/pengaturan/pembayaran${activeRole ? `?role=${activeRole}` : ''}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-stone-400 hover:text-stone-100"
                  >
                    Metode & Gambar QRIS
                  </Link>
                  <Link
                    href={`/dashboard/pengaturan/audit${activeRole ? `?role=${activeRole}` : ''}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-stone-400 hover:text-stone-100"
                  >
                    Audit Log Keamanan
                  </Link>
                  <Link
                    href="/auth/setup"
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-brand-400 hover:text-brand-300"
                  >
                    Status DB Supabase
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer info & Website Return */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full block text-center py-2 px-3 rounded-lg bg-stone-800/80 hover:bg-stone-800 text-stone-300 text-xs font-medium transition-colors"
          >
            Buka Website Calon Tamu &rarr;
          </Link>
          <div className="text-[10px] text-stone-500 text-center">
            ALYATAMA HOMESTAY v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
