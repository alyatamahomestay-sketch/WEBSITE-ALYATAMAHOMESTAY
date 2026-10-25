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
  ChevronDown, 
  Menu, 
  X
} from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
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
      title: 'Kamar & Tarif (H/B/T)',
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
          className="p-2 rounded-xl bg-[#392B21] text-[#F6F0E7] shadow-md border border-[#4d3b2e]"
          aria-label="Toggle navigation sidebar"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#392B21] border-r border-[#4d3b2e] text-[#E7D8C5] flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#4d3b2e]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <AlyatamaLogo className="w-8 h-8" />
            <div>
              <span className="font-serif font-bold text-sm text-[#F6F0E7] tracking-wide block leading-none">
                ALYATAMA
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#C9A84C] block mt-0.5 font-medium">
                HOMESTAY PMS
              </span>
            </div>
          </Link>
        </div>

        {/* Role Indicator & Quick Switcher */}
        <div className="px-4 py-3 bg-[#2a1f17] border-b border-[#4d3b2e]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
              Hak Akses Aktif:
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#806044] text-white border border-[#C9A84C]/40">
              {activeRole}
            </span>
          </div>

          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="w-full bg-[#392B21] border border-[#4d3b2e] text-[#F6F0E7] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#806044]"
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#806044] text-white shadow-sm font-semibold'
                      : 'text-[#E7D8C5] hover:bg-[#4d3b2e] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}

          {/* Settings Submenu (Owner & Admin only) */}
          {canAccess(['owner', 'admin']) && (
            <div className="pt-2 border-t border-[#4d3b2e]">
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#E7D8C5] hover:bg-[#4d3b2e] transition-colors"
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
                    className="block py-1.5 text-xs text-stone-300 hover:text-white"
                  >
                    Profil Homestay Bangkinang
                  </Link>
                  <Link
                    href={`/dashboard/pengaturan/pembayaran${activeRole ? `?role=${activeRole}` : ''}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-stone-300 hover:text-white"
                  >
                    Metode & Gambar QRIS
                  </Link>
                  <Link
                    href={`/dashboard/pengaturan/audit${activeRole ? `?role=${activeRole}` : ''}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-stone-300 hover:text-white"
                  >
                    Audit Log Keamanan
                  </Link>
                  <Link
                    href="/auth/setup"
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-[#C9A84C] hover:text-[#e4cf8d]"
                  >
                    Status DB Supabase
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer info & Website Return */}
        <div className="p-4 border-t border-[#4d3b2e] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full block text-center py-2 px-3 rounded-xl bg-[#2a1f17] hover:bg-[#4d3b2e] text-[#E7D8C5] text-xs font-semibold transition-colors border border-[#4d3b2e]"
          >
            Buka Website Calon Tamu &rarr;
          </Link>
          <div className="text-[10px] text-stone-400 text-center">
            ALYATAMA HOMESTAY PMS v2.0
          </div>
        </div>
      </aside>
    </>
  );
}
