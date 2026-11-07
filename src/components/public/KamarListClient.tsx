'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  BedDouble, 
  Layers,
  Filter,
  Calendar,
  Check,
  Search,
  ArrowRight,
  FileText,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Room, Reservation } from '@/lib/types';
import RoomCard from '@/components/public/RoomCard';
import { formatRupiah, formatDateIndo, getReservationStatusMeta, getPaymentStatusMeta } from '@/lib/formatters';

interface KamarListClientProps {
  rooms: Room[];
  reservations: Reservation[];
  initialType?: string;
}

export default function KamarListClient({
  rooms,
  reservations,
  initialType = 'all'
}: KamarListClientProps) {
  const searchParams = useSearchParams();
  const urlType = searchParams?.get('type')?.toLowerCase();

  const [roomList, setRoomList] = useState<Room[]>(rooms);
  const [reservationList, setReservationList] = useState<Reservation[]>(reservations);

  // Cek Status Reservasi State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Reservation | null>(null);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Sync rooms and reservations in realtime from server
  useEffect(() => {
    const fetchRoomsAndReservations = async () => {
      try {
        const [roomsRes, resRes] = await Promise.all([
          fetch('/api/panel/rooms', { cache: 'no-store' }),
          fetch('/api/panel/reservations', { cache: 'no-store' }),
        ]);

        if (roomsRes.ok) {
          const json = await roomsRes.json();
          if (json.success && Array.isArray(json.rooms) && json.rooms.length > 0) {
            setRoomList(json.rooms);
          }
        }

        if (resRes.ok) {
          const resJson = await resRes.json();
          if (resJson.success && Array.isArray(resJson.reservations)) {
            setReservationList(resJson.reservations);
          }
        }
      } catch (e) {}
    };

    fetchRoomsAndReservations();

    const onSync = () => fetchRoomsAndReservations();
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    window.addEventListener('rooms-updated', onSync);
    window.addEventListener('reservations-updated', onSync);

    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
      window.removeEventListener('rooms-updated', onSync);
      window.removeEventListener('reservations-updated', onSync);
    };
  }, []);

  // Determine active filter from URL or props
  const [activeFilter, setActiveFilter] = useState<'all' | 'reguler' | 'vip'>(() => {
    const t = urlType || initialType;
    if (t === 'reguler') return 'reguler';
    if (t === 'vip') return 'vip';
    return 'all';
  });

  // Sync state if URL changes externally
  useEffect(() => {
    if (urlType === 'reguler') {
      setActiveFilter('reguler');
    } else if (urlType === 'vip') {
      setActiveFilter('vip');
    }
  }, [urlType]);

  // Clean partitioning between VIP and REGULER (Exactly 4 and 4)
  const isVipRoom = (r: Room) => {
    const type = (r.room_type || '').toUpperCase().trim();
    const name = (r.name || '').toUpperCase().trim();
    return (
      type === 'VIP' ||
      type.includes('VIP') ||
      name.includes('VIP') ||
      type.includes('EKSEKUTIF') ||
      name.includes('EKSEKUTIF') ||
      type.includes('PAVILIUN') ||
      name.includes('PAVILIUN')
    );
  };

  const activeRooms = useMemo(() => roomList.filter((r) => !r.is_archived), [roomList]);
  const regulerRooms = useMemo(() => activeRooms.filter((r) => !isVipRoom(r)), [activeRooms]);
  const vipRooms = useMemo(() => activeRooms.filter(isVipRoom), [activeRooms]);

  // Filtered rooms to display
  const displayedRooms = useMemo(() => {
    if (activeFilter === 'reguler') return regulerRooms;
    if (activeFilter === 'vip') return vipRooms;
    return activeRooms;
  }, [activeFilter, regulerRooms, vipRooms, activeRooms]);

  const handleFilterChange = (filter: 'all' | 'reguler' | 'vip') => {
    setActiveFilter(filter);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (filter === 'all') {
        url.searchParams.delete('type');
      } else {
        url.searchParams.set('type', filter);
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  const handleSearchReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Silakan masukkan nomor reservasi atau nomor WhatsApp Anda.');
      setSearchResult(null);
      setHasSearched(true);
      return;
    }

    setSearching(true);
    setSearchError('');
    setHasSearched(true);

    const cleanQuery = query.toUpperCase();
    const cleanPhone = query.replace(/\D/g, '');

    try {
      // 1. Cari di reservationList lokal
      const matchedLocal = reservationList.find((r) => {
        const numMatch = r.reservation_number?.toUpperCase() === cleanQuery || r.id?.toUpperCase() === cleanQuery;
        const phoneMatch = cleanPhone && cleanPhone.length >= 8 && r.guest?.phone?.replace(/\D/g, '').includes(cleanPhone);
        return numMatch || phoneMatch;
      });

      if (matchedLocal) {
        setSearchResult(matchedLocal);
        setSearching(false);
        return;
      }

      // 2. Cari ke API server
      const res = await fetch(`/api/panel/reservations?id=${encodeURIComponent(query)}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reservation) {
          setSearchResult(json.reservation);
          setSearching(false);
          return;
        }
      }

      // 3. Cari dari localStorage (reservasi terakhir di browser ini)
      if (typeof window !== 'undefined') {
        const lastSub = localStorage.getItem('last_submitted_reservation');
        if (lastSub) {
          try {
            const parsed = JSON.parse(lastSub);
            if (
              parsed &&
              (parsed.reservation_number?.toUpperCase() === cleanQuery ||
                parsed.id?.toUpperCase() === cleanQuery ||
                (cleanPhone && parsed.guest?.phone?.replace(/\D/g, '').includes(cleanPhone)))
            ) {
              setSearchResult(parsed);
              setSearching(false);
              return;
            }
          } catch (e) {}
        }
      }

      setSearchResult(null);
      setSearchError(
        `Nomor reservasi "${query}" tidak ditemukan. Pastikan format nomor reservasi tepat (contoh: ALY-20261107-001) atau gunakan nomor WhatsApp yang terdaftar.`
      );
    } catch (err) {
      setSearchResult(null);
      setSearchError('Terjadi kesalahan saat memeriksa status reservasi. Silakan periksa koneksi Anda.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearchResult = () => {
    setSearchResult(null);
    setSearchError('');
    setHasSearched(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* ===================================================================== */}
      {/* 1. KOLOM FITUR CEK STATUS RESERVASI LANGSUNG DI HALAMAN PILIHAN KAMAR */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border-2 border-[#806044]/30 p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#806044]/10 text-[#806044] border border-[#806044]/20 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#806044] block">
                  Cek Status Reservasi Anda
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Layanan Mandiri Tamu
                </span>
              </div>
              <p className="text-xs text-[#756A5F] mt-0.5">
                Sudah melakukan reservasi? Masukkan Nomor Reservasi atau No. WhatsApp Anda untuk memantau status persetujuan &amp; pembayaran secara langsung:
              </p>
            </div>
          </div>

          <Link
            href="/status-reservasi"
            className="text-xs font-bold text-[#806044] hover:text-[#5a422d] hover:underline inline-flex items-center gap-1 self-start md:self-center shrink-0"
          >
            <span>Buka Halaman Bukti Resmi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Form Pencarian Cek Status */}
        <form onSubmit={handleSearchReservation} className="mt-4 flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik Nomor Reservasi (Contoh: ALY-20261107-001) atau No. WhatsApp..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D4C3AD] bg-[#FAF7F2] text-xs font-semibold text-[#392B21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#806044]/30"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 rounded-2xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {searching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Cek Status Reservasi</span>
              </>
            )}
          </button>
        </form>

        {/* Not Found Alert */}
        {hasSearched && searchError && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>{searchError}</span>
            </div>
            <Link
              href="/status-reservasi"
              className="text-xs font-bold text-[#806044] hover:underline shrink-0"
            >
              Halaman Pencarian Detail &rarr;
            </Link>
          </div>
        )}

        {/* Result Card */}
        {searchResult && (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-white to-[#FAF7F2] border-2 border-emerald-300 text-xs shadow-xs space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5DCD0]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#756A5F] block">Nomor Reservasi Ditemukan</span>
                  <span className="text-sm font-bold font-mono text-[#392B21]">{searchResult.reservation_number}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const statusMeta = getReservationStatusMeta(searchResult.status);
                  const payMeta = getPaymentStatusMeta(searchResult.payment_status);
                  return (
                    <>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.badgeClass}`}>
                        Status: {statusMeta.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${payMeta.badgeClass}`}>
                        {payMeta.label}
                      </span>
                    </>
                  );
                })()}
                <button
                  type="button"
                  onClick={clearSearchResult}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                  title="Tutup Hasil"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <div className="bg-white p-2.5 rounded-xl border border-[#E5DCD0]">
                <span className="text-[#756A5F] block">Nama Tamu</span>
                <strong className="text-[#392B21] text-xs">
                  {searchResult.guest?.full_name || (searchResult.guest as any)?.name || 'Tamu'}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5DCD0]">
                <span className="text-[#756A5F] block">Kamar Pilihan</span>
                <strong className="text-[#392B21] text-xs">
                  {searchResult.rooms?.[0]
                    ? `${searchResult.rooms[0].name} (${searchResult.rooms[0].room_type})`
                    : (searchResult as any).room
                    ? `${(searchResult as any).room.name} (${(searchResult as any).room.room_type})`
                    : 'Unit Terpilih'}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5DCD0]">
                <span className="text-[#756A5F] block">Jadwal Menginap</span>
                <strong className="text-[#392B21] text-xs">
                  {formatDateIndo(searchResult.checkin_date)} s/d {formatDateIndo(searchResult.checkout_date)}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E5DCD0]">
                <span className="text-[#756A5F] block">Total Pembayaran</span>
                <strong className="text-[#806044] text-xs font-mono font-bold">
                  {formatRupiah(searchResult.price_snapshot?.total_amount || (searchResult as any).total_amount || 0)}
                </strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-stone-500">
                * Pembayaran penuh dilakukan secara Cash atau Transfer di homestay sebelum serah terima kunci.
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/status-reservasi?res_num=${searchResult.reservation_number}`}
                  className="px-4 py-2 rounded-xl bg-[#806044] hover:bg-[#684D36] text-white text-xs font-bold transition shadow-2xs inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Bukti Resmi &amp; Slip Pembayaran</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. FILTER TABS BAR: PILIHAN KATEGORI KAMAR */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-[#D4C3AD] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#806044] block">
              Pilihan Kategori Kamar
            </span>
            <p className="text-xs text-[#756A5F]">
              Pilih kategori kamar untuk menyaring unit kamar yang ingin Anda lihat:
            </p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab: Semua Kamar */}
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-2xs ${
                activeFilter === 'all'
                  ? 'bg-[#392B21] text-white ring-2 ring-[#806044]/40 shadow-xs'
                  : 'bg-[#FAF7F2] text-[#756A5F] hover:bg-[#E5DCD0]/60 hover:text-[#392B21] border border-[#E5DCD0]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Semua Kamar</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#E5DCD0] text-[#392B21]'
              }`}>
                {activeRooms.length}
              </span>
            </button>

            {/* Tab: Tipe REGULER */}
            <button
              type="button"
              onClick={() => handleFilterChange('reguler')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-2xs ${
                activeFilter === 'reguler'
                  ? 'bg-[#806044] text-white ring-2 ring-[#806044]/60 shadow-xs'
                  : 'bg-[#FAF7F2] text-[#756A5F] hover:bg-[#E5DCD0]/60 hover:text-[#392B21] border border-[#E5DCD0]'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5 shrink-0" />
              <span>Tipe REGULER</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeFilter === 'reguler' ? 'bg-white/20 text-white' : 'bg-[#E5DCD0] text-[#392B21]'
              }`}>
                {regulerRooms.length} Unit
              </span>
              {activeFilter === 'reguler' && <Check className="w-3 h-3 text-[#C9A84C]" />}
            </button>

            {/* Tab: Tipe VIP */}
            <button
              type="button"
              onClick={() => handleFilterChange('vip')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-2xs ${
                activeFilter === 'vip'
                  ? 'bg-[#806044] text-white ring-2 ring-[#806044]/60 shadow-xs'
                  : 'bg-[#FAF7F2] text-[#756A5F] hover:bg-[#E5DCD0]/60 hover:text-[#392B21] border border-[#E5DCD0]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
              <span>Tipe VIP</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeFilter === 'vip' ? 'bg-white/20 text-white' : 'bg-[#E5DCD0] text-[#392B21]'
              }`}>
                {vipRooms.length} Unit
              </span>
              {activeFilter === 'vip' && <Check className="w-3 h-3 text-[#C9A84C]" />}
            </button>
          </div>
        </div>
      </div>

      {/* ROOMS GRID: Clean, Responsive, High Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedRooms.map((room) => (
          <RoomCard key={room.id} room={room} reservations={reservationList} />
        ))}
      </div>

      {/* Empty State Fallback */}
      {displayedRooms.length === 0 && (
        <div className="bg-white rounded-3xl border border-[#E5DCD0] p-12 text-center max-w-md mx-auto">
          <p className="text-sm text-[#756A5F] mb-4">Tidak ada kamar pada kategori yang dipilih.</p>
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className="text-xs bg-[#806044] hover:bg-[#684D36] text-white px-4 py-2 rounded-xl font-bold"
          >
            Tampilkan Semua Kamar
          </button>
        </div>
      )}
    </div>
  );
}
