'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  BedDouble, 
  Layers,
  Filter,
  Calendar,
  Check
} from 'lucide-react';
import { Room, Reservation } from '@/lib/types';
import RoomCard from '@/components/public/RoomCard';

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

  // Sync rooms in realtime from server
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/panel/rooms', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.rooms) && json.rooms.length > 0) {
            setRoomList(json.rooms);
          }
        }
      } catch (e) {}
    };

    fetchRooms();

    const onSync = () => fetchRooms();
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    window.addEventListener('rooms-updated', onSync);

    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
      window.removeEventListener('rooms-updated', onSync);
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

  return (
    <div className="space-y-8">
      {/* FILTER TABS BAR: ELEGAN, WARM SYARIAH, & CLEAR */}
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

        {/* Informational Sub-Banner based on Active Filter */}
        <div className="mt-4 pt-3.5 border-t border-[#E5DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#756A5F]">
            <span className="font-semibold text-[#392B21]">Status Tampilan:</span>
            {activeFilter === 'reguler' && (
              <span className="inline-flex items-center gap-1 font-bold text-[#806044]">
                Hanya Menampilkan 4 Unit Kamar Tipe REGULER (No. 101, 102, 103, 104)
              </span>
            )}
            {activeFilter === 'vip' && (
              <span className="inline-flex items-center gap-1 font-bold text-[#806044]">
                Hanya Menampilkan 4 Unit Kamar Tipe VIP (No. 201, 202, 203, 204)
              </span>
            )}
            {activeFilter === 'all' && (
              <span className="inline-flex items-center gap-1 font-medium text-[#756A5F]">
                Menampilkan seluruh {activeRooms.length} unit kamar (4 Reguler &amp; 4 VIP)
              </span>
            )}
          </div>

          <div className="text-[11px] text-[#756A5F]">
            Menampilkan <strong className="text-[#392B21] font-bold">{displayedRooms.length}</strong> dari {activeRooms.length} unit
          </div>
        </div>
      </div>

      {/* ROOMS GRID: Clean, Responsive, High Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedRooms.map((room) => (
          <RoomCard key={room.id} room={room} reservations={reservations} />
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
