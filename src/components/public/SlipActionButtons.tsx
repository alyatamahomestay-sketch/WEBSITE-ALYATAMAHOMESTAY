'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, MessageSquare, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Reservation, PropertySettings, PaymentMethod } from '@/lib/types';
import { downloadReservationSlipJpg, getGuestToAdminWhatsAppUrl } from '@/lib/services/slip-image-generator';

interface SlipActionButtonsProps {
  reservation: Reservation;
  propertySettings?: PropertySettings | null;
  paymentMethods?: PaymentMethod[];
}

export default function SlipActionButtons({
  reservation,
  propertySettings,
  paymentMethods = [],
}: SlipActionButtonsProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const adminWaUrl = getGuestToAdminWhatsAppUrl({
    reservation,
    propertySettings,
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadReservationSlipJpg(reservation, propertySettings, paymentMethods);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: any) {
      alert(`Gagal mengunduh bukti reservasi: ${err?.message || err}`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="no-print mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <Link
          href={`/status-reservasi?res_num=${reservation.reservation_number}`}
          className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1.5 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Status Reservasi</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download JPG Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-[#392B21] hover:bg-[#281e17] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>{downloading ? 'Memproses JPG...' : 'Download Bukti (.JPG)'}</span>
          </button>

          {/* WhatsApp Admin Button */}
          <a
            href={adminWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs inline-flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kirim via WhatsApp Admin</span>
          </a>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium px-3.5 py-2.5 rounded-xl transition inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Gambar bukti reservasi (.JPG) berhasil diunduh! Klik <strong>Kirim via WhatsApp Admin</strong> untuk mengirimkannya ke pengelola.</span>
          </div>
        </div>
      )}
    </div>
  );
}
