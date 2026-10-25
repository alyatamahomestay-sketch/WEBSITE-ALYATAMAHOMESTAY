'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Phone, Mail, FileText, Star, Eye } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Reservation, Guest } from '@/lib/types';
import { formatPhoneDisplay } from '@/lib/phone';
import { formatDateIndo } from '@/lib/formatters';

export default function TamuCRMPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await PmsService.getReservations();
        setReservations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Aggregate unique guests from reservations
  const guestMap = new Map<string, { guest: Guest; totalStays: number; lastStay: string; resIds: string[] }>();

  reservations.forEach((r) => {
    if (r.guest) {
      const key = r.guest.normalized_phone || r.guest.phone;
      const existing = guestMap.get(key);
      if (existing) {
        existing.totalStays += 1;
        existing.resIds.push(r.id);
        if (r.checkin_date > existing.lastStay) {
          existing.lastStay = r.checkin_date;
        }
      } else {
        guestMap.set(key, {
          guest: r.guest,
          totalStays: 1,
          lastStay: r.checkin_date,
          resIds: [r.id],
        });
      }
    }
  });

  const guestsList = Array.from(guestMap.values());

  const filtered = guestsList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.guest.full_name.toLowerCase().includes(q) ||
      item.guest.phone.includes(q) ||
      (item.guest.email && item.guest.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Manajemen Tamu & Riwayat Kunjungan (CRM)
        </h2>
        <p className="text-xs text-stone-500">
          Database tamu ALYATAMA HOMESTAY dengan nomor kontak terverifikasi, riwayat menginap, dan catatan preferensi pelayanan.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama tamu atau nomor WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <span className="text-xs text-stone-500 font-medium hidden sm:inline">
          Total Tamu Terdata: <strong>{guestsList.length}</strong>
        </span>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Tamu</th>
                <th className="py-3 px-4 font-semibold">Nomor WhatsApp</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold text-center">Kategori</th>
                <th className="py-3 px-4 font-semibold text-center">Total Kunjungan</th>
                <th className="py-3 px-4 font-semibold">Kunjungan Terakhir</th>
                <th className="py-3 px-4 font-semibold">Catatan Pelayanan</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-900">
                    {item.guest.full_name}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 font-mono">
                    {formatPhoneDisplay(item.guest.phone)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {item.guest.email || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      item.guest.category === 'vip' ? 'bg-purple-100 text-purple-800' :
                      item.guest.category === 'corporate' ? 'bg-blue-100 text-blue-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {item.guest.category || 'regular'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-stone-900">
                    {item.totalStays}x
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {formatDateIndo(item.lastStay)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                    {item.guest.notes || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dashboard/reservasi/${item.resIds[0]}`}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 inline-flex items-center gap-1"
                      title="Lihat Reservasi Terakhir"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-stone-400">
                    Tidak ditemukan data tamu.
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
