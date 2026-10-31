import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Calendar, Info, CheckCircle2, XCircle } from 'lucide-react';
import { Room, Reservation } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { evaluateRoomAvailability } from '@/lib/room-availability';

interface RoomCardProps {
  room: Room;
  reservations?: Reservation[];
}

export default function RoomCard({ room, reservations = [] }: RoomCardProps) {
  const photo = room.photos?.[0] || '/images/alyatama-flyer.jpg';
  const availability = evaluateRoomAvailability(room, reservations);
  const isAvail = availability.isAvailable;

  return (
    <div className={`bg-white rounded-2xl border ${isAvail ? 'border-[#E5DCD0]' : 'border-rose-200'} overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group relative`}>
      {/* Photo Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF7F2]">
        <img
          src={photo}
          alt={`Kamar ${room.name} ALYATAMA HOMESTAY`}
          className={`w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ${!isAvail ? 'opacity-90 grayscale-[25%]' : ''}`}
        />
        
        {/* Top Badges: Room Number & Type (Clean Flex, No Overlap) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="bg-[#392B21] text-[#F6F0E7] text-xs px-2.5 py-1 rounded-md font-medium shrink-0 shadow-xs">
            No. {room.room_number}
          </span>
          <span className="bg-white/95 text-[#392B21] text-xs font-semibold px-2.5 py-1 rounded-md border border-[#E5DCD0] truncate max-w-[65%] shadow-xs">
            {room.room_type}
          </span>
        </div>

        {/* Status Ketersediaan Badge (Tersedia Hijau / Tidak Tersedia Merah) */}
        <div className="absolute top-12 left-3 pointer-events-none">
          {isAvail ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Tersedia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border-2 border-rose-500 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              Tidak Tersedia
            </span>
          )}
        </div>

        {/* Honest Representation Disclaimer Tag (Tahap 3 & 5) */}
        <div className="absolute bottom-2.5 left-3 bg-[#392B21]/80 text-[#F6F0E7] text-[10px] px-2 py-0.5 rounded flex items-center gap-1 pointer-events-none backdrop-blur-xs">
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

          {/* Pricing Options Grid (Harian & Bulanan) */}
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

        {/* Action Buttons & Notice */}
        <div className="pt-3 border-t border-[#E5DCD0] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/kamar/${room.id}`}
              className="text-xs text-[#392B21] hover:text-[#806044] font-medium px-3 py-2 rounded-lg border border-[#E5DCD0] hover:border-[#806044] transition-colors"
            >
              Rincian Kamar
            </Link>

            {isAvail ? (
              <Link
                href={`/booking?room_id=${room.id}`}
                className="inline-flex items-center gap-1.5 bg-[#806044] hover:bg-[#684D36] text-[#F6F0E7] text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                Pesan Kamar
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Kamar ini sedang ditempati atau dipesan tamu sampai jadwal check-out"
                className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-bold px-3.5 py-2 rounded-lg cursor-not-allowed border border-rose-300 opacity-90 select-none shadow-2xs"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Tidak Tersedia
              </button>
            )}
          </div>

          {!isAvail && (
            <div className="p-2 bg-rose-50/80 border border-rose-200/80 rounded-lg text-[10px] text-rose-700 font-medium text-center">
              {availability.reason || 'Kamar sedang ditempati sampai jadwal check-out.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
