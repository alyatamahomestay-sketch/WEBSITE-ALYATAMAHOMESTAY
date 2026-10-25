import React from 'react';
import Link from 'next/link';
import { Users, Wifi, Wind, Bath, ArrowRight } from 'lucide-react';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const photo = room.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
      {/* Photo Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={photo}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur text-stone-100 text-xs px-2.5 py-1 rounded-md font-medium">
          No. {room.room_number}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
          {room.room_type}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-serif font-semibold text-lg text-stone-900 group-hover:text-brand-700 transition-colors">
              {room.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <Users className="w-3.5 h-3.5" />
              <span>{room.capacity_adults} Dws{room.capacity_children > 0 ? `, ${room.capacity_children} Anak` : ''}</span>
            </div>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
            {room.description}
          </p>

          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-block bg-stone-100 text-stone-700 text-[11px] px-2 py-0.5 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="inline-block text-stone-400 text-[11px] px-1 py-0.5">
                +{room.amenities.length - 4} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 block">Mulai dari</span>
            <div className="text-stone-900 font-semibold text-base sm:text-lg">
              {formatRupiah(room.base_rate)}
              <span className="text-xs text-stone-500 font-normal"> / malam</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/kamar/${room.id}`}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors"
            >
              Rincian
            </Link>
            <Link
              href={`/booking?room_id=${room.id}`}
              className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Pesan
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
