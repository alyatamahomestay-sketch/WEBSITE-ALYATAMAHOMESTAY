'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
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
  X,
  Megaphone,
  LogOut,
  UserCheck,
  ShieldCheck,
  PlusCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import AlyatamaLogo from '@/components/common/AlyatamaLogo';
import { PmsService } from '@/lib/services/pms-service';
import { StaffShift } from '@/lib/types';

interface PanelSidebarProps {
  currentRole: 'admin' | 'staff';
  onRoleChange?: (newRole: 'admin' | 'staff') => void;
}

export default function PanelSidebar({ currentRole }: PanelSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const handleEndShift = async () => {
    if (!activeShift) return;
    if (!confirm(`Akhiri shift kerja untuk ${activeShift.staff_name_snapshot}?`)) return;

    try {
      await PmsService.endShift(activeShift.id);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('alyatama_active_shift');
      }
      setActiveShift(null);
      alert('Shift kerja telah berhasil diakhiri.');
      router.push('/panel/login');
    } catch (err: any) {
      alert(`Gagal mengakhiri shift: ${err?.message || err}`);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alyatama_staff_session');
      localStorage.removeItem('alyatama_active_shift');
    }
    router.push('/panel/login');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[#30291F] text-[#F7F4ED] shadow-md border border-[#44382c]"
          aria-label="Toggle navigasi panel"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#30291F] border-r border-[#44382c] text-[#F7F4ED] flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#44382c]">
          <Link href="/panel" className="flex items-center gap-2">
            <AlyatamaLogo variant="white" size="sm" />
            <span className="text-[9px] uppercase tracking-widest text-[#C6A47B] font-bold bg-[#241e17] px-1.5 py-0.5 rounded border border-[#44382c]">
              PANEL
            </span>
          </Link>
        </div>

        {/* Role & Active Shift Banner */}
        <div className="p-3 bg-[#241e17] border-b border-[#44382c] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
              Akun Bertugas:
            </span>
            <span
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                currentRole === 'admin'
                  ? 'bg-[#355C46] text-white border border-emerald-400/40'
                  : 'bg-[#806044] text-white border border-[#C6A47B]/40'
              }`}
            >
              {currentRole === 'admin' ? 'ADMINISTRATOR' : 'STAFF OPERASIONAL'}
            </span>
          </div>

          <div className="text-xs font-semibold text-white truncate">
            {staffName || (currentRole === 'admin' ? 'Administrator Utama' : 'Petugas Front Office')}
          </div>

          {/* Active Shift Indicator for STAFF */}
          {currentRole === 'staff' && (
            <div className="pt-1.5 border-t border-[#3a3024] flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">Shift Aktif</span>
              </div>
              {activeShift && (
                <button
                  type="button"
                  onClick={handleEndShift}
                  className="text-[9px] bg-red-950/60 hover:bg-red-900 text-red-300 px-2 py-0.5 rounded border border-red-800 transition"
                >
                  Akhiri Shift
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
          {/* Quick Action Walk-in (Both Admin & Staff) */}
          <Link
            href="/panel/reservasi/baru"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition shadow-xs ${
              pathname === '/panel/reservasi/baru'
                ? 'bg-[#355C46] text-white'
                : 'bg-[#355C46]/20 text-emerald-300 hover:bg-[#355C46]/30 border border-[#355C46]/40'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>+ Reservasi Walk-in Baru</span>
          </Link>

          {/* Core Navigation */}
          <Link
            href="/panel"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
              pathname === '/panel'
                ? 'bg-[#806044] text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Ikhtisar Kerja</span>
          </Link>

          <Link
            href="/panel/reservasi"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
              pathname === '/panel/reservasi'
                ? 'bg-[#806044] text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Data Reservasi</span>
          </Link>

          <Link
            href="/panel/check-in-out"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
              pathname === '/panel/check-in-out'
                ? 'bg-[#806044] text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>Check-in & Check-out</span>
          </Link>

          <Link
            href="/panel/kalender"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
              pathname === '/panel/kalender'
                ? 'bg-[#806044] text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Kalender Okupansi</span>
          </Link>

          <Link
            href="/panel/pembayaran"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
              pathname === '/panel/pembayaran'
                ? 'bg-[#806044] text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Pembayaran & Kas</span>
          </Link>

          <Link
            href="/panel/tamu"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
              pathname === '/panel/tamu'
                ? 'bg-[#806044] text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Data Tamu (CRM)</span>
          </Link>

          {/* ADMIN EXCLUSIVE MODULES */}
          {currentRole === 'admin' && (
            <>
              <div className="pt-3 pb-1 border-t border-[#44382c]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C6A47B] px-3 block">
                  Modul Administrator
                </span>
              </div>

              <Link
                href="/panel/staff"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  pathname === '/panel/staff'
                    ? 'bg-[#355C46] text-white font-semibold shadow-xs'
                    : 'text-emerald-300/90 hover:bg-[#44382c] hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kelola Akun Staf & Shift</span>
              </Link>

              <Link
                href="/panel/kamar"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  pathname === '/panel/kamar'
                    ? 'bg-[#806044] text-white font-semibold shadow-xs'
                    : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
                }`}
              >
                <BedDouble className="w-4 h-4 shrink-0" />
                <span>Kamar & Tarif (H/B/T)</span>
              </Link>

              <Link
                href="/panel/promo"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  pathname === '/panel/promo'
                    ? 'bg-[#806044] text-white font-semibold shadow-xs'
                    : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span>Promo & Diskon</span>
              </Link>

              <Link
                href="/panel/keuangan"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  pathname === '/panel/keuangan'
                    ? 'bg-[#806044] text-white font-semibold shadow-xs'
                    : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4 shrink-0" />
                <span>Keuangan & Laba Bersih</span>
              </Link>

              <Link
                href="/panel/laporan"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  pathname === '/panel/laporan'
                    ? 'bg-[#806044] text-white font-semibold shadow-xs'
                    : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Laporan & Ekspor CSV</span>
              </Link>

              <Link
                href="/panel/iklan"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  pathname === '/panel/iklan'
                    ? 'bg-[#806044] text-white font-semibold shadow-xs'
                    : 'text-stone-300 hover:bg-[#44382c] hover:text-white'
                }`}
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                <span>Foto Iklan & Galeri</span>
              </Link>

              {/* Settings Submenu */}
              <div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-stone-300 hover:bg-[#44382c] hover:text-white transition"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan Sistem</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {settingsOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-stone-400">
                    <Link
                      href="/panel/pengaturan/tampilan"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1 text-xs hover:text-[#C6A47B]"
                    >
                      Setup Tampilan Website
                    </Link>
                    <Link
                      href="/panel/pengaturan"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1 text-xs hover:text-white"
                    >
                      Profil Homestay Bangkinang
                    </Link>
                    <Link
                      href="/panel/pengaturan/audit"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1 text-xs hover:text-white"
                    >
                      Audit Log Keamanan
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Footer Area */}
        <div className="p-3 border-t border-[#44382c] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#241e17] hover:bg-[#44382c] text-stone-300 text-xs font-semibold transition border border-[#44382c]"
          >
            <span>Website Tamu</span>
            <ExternalLink className="w-3 h-3 text-[#C6A47B]" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-stone-400 hover:text-red-300 hover:bg-red-950/30 text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi (/panel)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
