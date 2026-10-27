import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const photo = room.photos?.[0] || '/images/alyatama-flyer.jpg';

  return (
    <div className="bg-white rounded-2xl border border-[#E5DCD0] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      {/* Photo Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={photo}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Top Badges Container - Flex layout prevents any overlapping */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="bg-[#392B21]/90 backdrop-blur text-[#F6F0E7] text-xs px-2.5 py-1 rounded-md font-medium shrink-0 shadow-xs">
            No. {room.room_number}
          </span>
          <span className="bg-white/95 backdrop-blur text-[#392B21] text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs border border-[#E5DCD0] truncate max-w-[65%]">
            {room.room_type}
          </span>
        </div>

        {/* Bottom Badge */}
        <div className="absolute bottom-3 left-3 bg-emerald-950/85 backdrop-blur text-emerald-100 text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs border border-emerald-800/40">
          <Sparkles className="w-3 h-3 text-[#C9A84C] shrink-0" />
          <span>Syariah Bersih & Tenang</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-serif font-semibold text-lg text-[#392B21] group-hover:text-[#806044] transition-colors">
              {room.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-stone-500 bg-[#F6F0E7] px-2 py-1 rounded-md">
              <Users className="w-3.5 h-3.5 text-[#806044]" />
              <span>{room.capacity_adults} Dewasa{room.capacity_children > 0 ? `, ${room.capacity_children} Anak` : ''}</span>
            </div>
          </div>

          <p className="text-xs text-[#756A5F] line-clamp-2 mb-4 leading-relaxed">
            {room.description}
          </p>

          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-block bg-[#F6F0E7] text-[#392B21] text-[11px] px-2.5 py-1 rounded-md font-medium border border-[#E5DCD0]/60"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="inline-block text-[#756A5F] text-[11px] px-1.5 py-1 font-medium">
                +{room.amenities.length - 4} lainnya
              </span>
            )}
          </div>

          {/* Pricing Options Grid (Harian, Bulanan, Tahunan) */}
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DCD0] space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#806044]" />
                Sewa Harian:
              </span>
              <span className="font-semibold text-[#392B21]">
                {formatRupiah(room.base_rate)} <span className="font-normal text-[11px] text-stone-500">/malam</span>
              </span>
            </div>

            {room.monthly_rate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#806044]" />
                  Sewa Bulanan:
                </span>
                <span className="font-semibold text-[#806044]">
                  {formatRupiah(room.monthly_rate)} <span className="font-normal text-[11px] text-stone-500">/bln</span>
                </span>
              </div>
            )}

            {room.yearly_rate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#806044]" />
                  Sewa Tahunan:
                </span>
                <span className="font-semibold text-[#65715A]">
                  {formatRupiah(room.yearly_rate)} <span className="font-normal text-[11px] text-stone-500">/thn</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E5DCD0] flex items-center justify-between gap-2">
          <Link
            href={`/kamar/${room.id}`}
            className="text-xs text-[#30231A] hover:text-emerald-800 font-medium px-3 py-2 rounded-lg border border-[#DECFC0] hover:border-emerald-600/40 transition-colors"
          >
            Rincian & Foto
          </Link>
          <Link
            href={`/booking?room_id=${room.id}`}
            className="inline-flex items-center gap-1.5 bg-[#24523B] hover:bg-[#1D4330] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm border border-emerald-600/30"
          >
            Pesan Sekarang
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
