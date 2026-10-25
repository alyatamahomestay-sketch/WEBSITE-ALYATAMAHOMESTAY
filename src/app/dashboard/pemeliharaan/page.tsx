'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { MaintenanceTicket } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

export default function PemeliharaanPage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await PmsService.getMaintenanceTickets();
        setTickets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Tiket Pemeliharaan & Perbaikan Kamar
        </h2>
        <p className="text-xs text-stone-500">
          Pencatatan kendala teknis AC, plumbing, kelistrikan, dan pemblokiran kamar yang sedang dalam masa perbaikan.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Tiket</th>
                <th className="py-3 px-4 font-semibold">Lokasi / Kamar</th>
                <th className="py-3 px-4 font-semibold">Jenis Kendala</th>
                <th className="py-3 px-4 font-semibold">Deskripsi</th>
                <th className="py-3 px-4 font-semibold text-center">Prioritas</th>
                <th className="py-3 px-4 font-semibold text-center">Blok Ketersediaan</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Biaya Aktual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                    {t.ticket_number}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    {t.room?.name || 'Fasilitas Umum'}
                  </td>
                  <td className="py-3.5 px-4 text-stone-800 font-medium">
                    {t.issue_type}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                    {t.description}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      t.priority === 'darurat' || t.priority === 'tinggi'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {t.affects_room_availability ? (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-medium">Kamar Ditutup</span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Tidak Memblok</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-stone-100 text-stone-700">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-stone-900">
                    {t.actual_cost ? formatRupiah(t.actual_cost) : '-'}
                  </td>
                </tr>
              ))}

              {tickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-stone-400">
                    Tidak ada tiket pemeliharaan aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
