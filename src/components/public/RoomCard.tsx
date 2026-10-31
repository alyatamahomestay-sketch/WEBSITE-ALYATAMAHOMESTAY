import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Calendar, Info } from 'lucide-react';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const photo = room.photos?.[0] || '/images/alyatama-flyer.jpg';

  return (
    <div className="bg-white rounded-2xl border border-[#E5DCD0] overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col group">
      {/* Photo Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF7F2]">
        <img
          src={photo}
          alt={`Kamar ${room.name} ALYATAMA HOMESTAY`}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        
        {/* Top Badges: Room Number & Type (Clean Flex, No Overlap) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="bg-[#392B21] text-[#F6F0E7] text-xs px-2.5 py-1 rounded-md font-medium shrink-0">
            No. {room.room_number}
          </span>
          <span className="bg-white text-[#392B21] text-xs font-semibold px-2.5 py-1 rounded-md border border-[#E5DCD0] truncate max-w-[65%]">
            {room.room_type}
          </span>
        </div>

        {/* Honest Representation Disclaimer Tag (Tahap 3 & 5) */}
        <div className="absolute bottom-2.5 left-3 bg-[#392B21]/80 text-[#F6F0E7] text-[10px] px-2 py-0.5 rounded flex items-center gap-1 pointer-events-none">
          <Info className="w-3 h-3 text-[#C9A84C] shrink-0" />
          <span>Foto representasi tata ruang</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-serif font-semibold text-lg text-[#392B21] group-hover:text-[#806044] transition-colors">
              {room.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[#756A5F] bg-[#FAF7F2] px-2 py-1 rounded-md border border-[#E5DCD0]/60">
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
                className="inline-block bg-[#FAF7F2] text-[#392B21] text-[11px] px-2 py-0.5 rounded font-normal border border-[#E5DCD0]"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="inline-block text-[#756A5F] text-[11px] px-1 py-0.5 font-normal">
                +{room.amenities.length - 4} lainnya
              </span>
            )}
          </div>

          {/* Pricing Options Grid (Harian, Bulanan, Tahunan) */}
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E5DCD0] space-y-1.5 mb-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#756A5F] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#806044]" />
                Sewa Harian:
              </span>
              <span className="font-semibold text-[#392B21]">
                {formatRupiah(room.base_rate)} <span className="font-normal text-[11px] text-[#756A5F]">/malam</span>
              </span>
            </div>

            {room.monthly_rate && (
              <div className="flex items-center justify-between">
                <span className="text-[#756A5F] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#65715A]" />
                  Sewa Bulanan:
                </span>
                <span className="font-semibold text-[#65715A]">
                  {formatRupiah(room.monthly_rate)} <span className="font-normal text-[11px] text-[#756A5F]">/bulan</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E5DCD0] flex items-center justify-between gap-2">
          <Link
            href={`/kamar/${room.id}`}
            className="text-xs text-[#392B21] hover:text-[#806044] font-medium px-3 py-2 rounded-lg border border-[#E5DCD0] hover:border-[#806044] transition-colors"
          >
            Rincian Kamar
          </Link>
          <Link
            href={`/booking?room_id=${room.id}`}
            className="inline-flex items-center gap-1.5 bg-[#806044] hover:bg-[#684D36] text-[#F6F0E7] text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            Pesan Kamar
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
