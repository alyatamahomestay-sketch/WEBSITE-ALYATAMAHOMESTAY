'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  BedDouble, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { PmsService } from '@/lib/services/pms-service';
import { Room, Reservation } from '@/lib/types';

export default function KalenderOkupansiPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Show 14 days window for comfortable planning
  const daysWindow = 14;
  const daysArray = Array.from({ length: daysWindow }, (_, i) => addDays(currentStartDate, i));

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const rData = await PmsService.getRooms();
        const resData = await PmsService.getReservations();
        setRooms(rData);
        setReservations(resData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePrev = () => {
    setCurrentStartDate(subDays(currentStartDate, 7));
  };

  const handleNext = () => {
    setCurrentStartDate(addDays(currentStartDate, 7));
  };

  const handleToday = () => {
    setCurrentStartDate(new Date());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Kalender & Okupansi Kamar
          </h2>
          <p className="text-xs text-stone-500">
            Matriks ketersediaan unit kamar per tanggal menginap (Check-in s/d Check-out).
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
            title="7 Hari Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Hari Ini
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
            title="7 Hari Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Legends */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-wrap items-center gap-4 text-[11px] text-stone-600">
        <span className="font-semibold text-stone-900">Keterangan:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
          <span>Terkonfirmasi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-teal-500 inline-block" />
          <span>In-House (Check-in)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
          <span>Menunggu Persetujuan / Pembayaran</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
          <span>Perawatan / Blok</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-stone-100 border border-stone-300 inline-block" />
          <span>Tersedia Kosong</span>
        </div>
      </div>

      {/* Timeline Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="py-3 px-4 font-semibold text-stone-700 text-left sticky left-0 bg-stone-50 z-20 w-48 border-r border-stone-200 shadow-sm">
                  Unit Kamar
                </th>
                {daysArray.map((d, idx) => {
                  const isToday = isSameDay(d, new Date());
                  return (
                    <th
                      key={idx}
                      className={`py-2 px-2 text-center min-w-[72px] border-r border-stone-200 ${
                        isToday ? 'bg-brand-50 text-brand-900 font-bold' : 'text-stone-600'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-semibold">
                        {format(d, 'EEE', { locale: id })}
                      </div>
                      <div className="text-xs">
                        {format(d, 'dd/MM')}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rooms.map((room) => {
                return (
                  <tr key={room.id} className="hover:bg-stone-50/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-stone-900 sticky left-0 bg-white z-10 border-r border-stone-200 shadow-sm">
                      <div className="font-semibold">{room.name}</div>
                      <div className="text-[10px] text-stone-500">No. {room.room_number} • {room.room_type}</div>
                    </td>

                    {daysArray.map((dateObj, dIdx) => {
                      const dateStr = format(dateObj, 'yyyy-MM-dd');

                      // Find if this room has an active reservation covering this night:
                      // checkin <= dateStr AND checkout > dateStr (stay night convention)
                      const matchingRes = reservations.find((res) => {
                        const hasRoom = res.rooms?.some((r) => r.id === room.id);
                        if (!hasRoom) return false;
                        if (res.status === 'cancelled' || res.status === 'rejected') return false;
                        return res.checkin_date <= dateStr && res.checkout_date > dateStr;
                      });

                      const isMaintenance = room.operational_status === 'dalam_perawatan';

                      let cellColor = 'bg-stone-50/50 hover:bg-stone-100';
                      let cellText = '';
                      let cellTooltip = 'Tersedia';

                      if (isMaintenance) {
                        cellColor = 'bg-rose-100 text-rose-800';
                        cellText = 'Perawatan';
                        cellTooltip = 'Kamar dalam perbaikan';
                      } else if (matchingRes) {
                        if (matchingRes.status === 'checked_in') {
                          cellColor = 'bg-teal-500 text-white font-medium';
                          cellText = 'In-House';
                        } else if (matchingRes.status === 'confirmed') {
                          cellColor = 'bg-emerald-500 text-white font-medium';
                          cellText = 'Confirm';
                        } else {
                          cellColor = 'bg-amber-400 text-stone-950 font-medium';
                          cellText = 'Pending';
                        }
                        cellTooltip = `${matchingRes.reservation_number} - ${matchingRes.guest?.full_name}`;
                      }

                      return (
                        <td
                          key={dIdx}
                          title={cellTooltip}
                          className={`p-1 text-center border-r border-stone-100 text-[10px] transition-colors`}
                        >
                          {matchingRes ? (
                            <Link
                              href={`/dashboard/reservasi/${matchingRes.id}`}
                              className={`block w-full py-2 px-1 rounded shadow-xs truncate ${cellColor}`}
                            >
                              {cellText}
                            </Link>
                          ) : (
                            <div className={`w-full py-2 text-stone-300 rounded ${cellColor}`}>
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
