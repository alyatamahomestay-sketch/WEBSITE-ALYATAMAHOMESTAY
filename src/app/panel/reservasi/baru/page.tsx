'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  User, 
  Calendar, 
  BedDouble, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Phone, 
  Sparkles,
  ShieldCheck,
  Printer,
  Clock,
  UserCheck
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Room, StaffShift, Reservation } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { showAdminToast } from '@/components/common/AdminToast';

export default function WalkInReservationPage() {
  const router = useRouter();

  // Active Session & Shift
  const [staffUser, setStaffUser] = useState<{ id: string; full_name: string; role: 'admin' | 'staff' } | null>(null);
  const [activeShift, setActiveShift] = useState<StaffShift | null>(null);

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  const [rentalType, setRentalType] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [checkinDate, setCheckinDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkoutDate, setCheckoutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Tunai / Kasir');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successReservation, setSuccessReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    // Read session
    if (typeof window !== 'undefined') {
      const sessStr = localStorage.getItem('alyatama_staff_session');
      if (sessStr) {
        try {
          const sess = JSON.parse(sessStr);
          setStaffUser(sess);
        } catch (e) {}
      }

      const shiftStr = localStorage.getItem('alyatama_active_shift');
      if (shiftStr) {
        try {
          setActiveShift(JSON.parse(shiftStr));
        } catch (e) {}
      }
    }
  }, []);

  // Check available rooms when dates change
  useEffect(() => {
    async function fetchRooms() {
      try {
        const rooms = await PmsService.getRooms(true);
        // Filter available rooms
        const avail: Room[] = [];
        for (const r of rooms) {
          const isAvail = await PmsService.checkRoomAvailability(r.id, checkinDate, checkoutDate);
          if (isAvail) avail.push(r);
        }
        setAvailableRooms(avail);
        if (avail.length > 0 && !selectedRoomId) {
          setSelectedRoomId(avail[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (checkinDate && checkoutDate) {
      fetchRooms();
    }
  }, [checkinDate, checkoutDate]);

  // Calculate pricing based on selected room & rental type
  const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId);
  const diffDays = Math.max(1, Math.round((new Date(checkoutDate).getTime() - new Date(checkinDate).getTime()) / (1000 * 3600 * 24)));
  
  let calculatedTotal = 0;
  if (selectedRoom) {
    if (rentalType === 'daily') {
      calculatedTotal = selectedRoom.base_rate * diffDays;
    } else if (rentalType === 'monthly') {
      calculatedTotal = selectedRoom.monthly_rate || 2500000;
    } else if (rentalType === 'yearly') {
      calculatedTotal = selectedRoom.yearly_rate || 24000000;
    }
  }

  // Update default payment amount to total
  useEffect(() => {
    if (calculatedTotal > 0 && paymentAmount === 0) {
      setPaymentAmount(calculatedTotal);
    }
  }, [calculatedTotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim() || !selectedRoomId) {
      alert('Mohon lengkapi Nama Tamu, Nomor Telepon, dan pilih Kamar.');
      return;
    }

    if (new Date(checkoutDate) <= new Date(checkinDate)) {
      alert('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    setLoading(true);
    try {
      const res = await PmsService.createWalkInReservation({
        guest: {
          full_name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim() || undefined,
        },
        roomId: selectedRoomId,
        checkinDate,
        checkoutDate,
        rentalType,
        adults,
        children,
        baseSubtotal: calculatedTotal,
        totalAmount: calculatedTotal,
        paymentAmount: Number(paymentAmount),
        paymentMethod,
        staffUserId: staffUser?.id || 'staff-direct',
        staffRole: staffUser?.role || 'staff',
        staffShiftId: activeShift?.id || null,
        staffNameSnapshot: activeShift?.staff_name_snapshot || staffUser?.full_name || 'Petugas Bertugas',
        notes: notes.trim() || undefined,
      });

      setSuccessReservation(res);
      showAdminToast('add', `Reservasi baru untuk tamu "${guestName}" berhasil ditambahkan ke sistem.`);
      setLoading(false);
    } catch (err: any) {
      alert(`Gagal membuat reservasi walk-in: ${err?.message || err}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/panel/reservasi"
            className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 mb-1 font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Reservasi</span>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Pendaftaran Tamu Walk-in Langsung
          </h1>
        </div>

        {/* Staff Attribution Badge */}
        <div className="bg-white border border-[#E5DCD0] px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <UserCheck className="w-4 h-4 text-[#355C46]" />
          <div>
            <span className="text-[10px] text-stone-400 block leading-tight">Petugas Penerima:</span>
            <strong className="text-stone-900">{activeShift?.staff_name_snapshot || staffUser?.full_name || 'Administrator'}</strong>
          </div>
        </div>
      </div>

      {successReservation ? (
        /* SUCCESS RECEIPT VIEW */
        <div className="bg-white rounded-2xl border border-emerald-300 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900">
              Reservasi Walk-in Berhasil Terdaftar!
            </h2>
            <p className="text-xs text-stone-500">
              No. Booking: <strong className="font-mono text-[#355C46] text-sm">{successReservation.reservation_number}</strong>
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-xl border border-stone-200 text-xs text-left max-w-lg mx-auto space-y-2">
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-500">Nama Tamu:</span>
              <strong className="text-stone-900">{successReservation.guest?.full_name}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-500">Kamar:</span>
              <strong className="text-stone-900">Kamar {successReservation.rooms?.[0]?.room_number} ({successReservation.rooms?.[0]?.name})</strong>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-500">Periode:</span>
              <span>{successReservation.checkin_date} s/d {successReservation.checkout_date}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-1.5">
              <span className="text-stone-500">Petugas Bertugas:</span>
              <strong className="text-[#355C46]">{successReservation.staff_name_snapshot}</strong>
            </div>
            <div className="flex justify-between pt-1 font-semibold text-sm">
              <span className="text-stone-700">Total Dibayar:</span>
              <span className="text-[#355C46]">{formatRupiah(successReservation.price_snapshot?.total_paid || 0)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/slip/${successReservation.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-[#806044] hover:bg-[#684d36] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Bukti Reservasi / Invoice</span>
            </Link>

            <button
              onClick={() => {
                setSuccessReservation(null);
                setGuestName('');
                setGuestPhone('');
                setGuestEmail('');
                setPaymentAmount(0);
              }}
              className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-700 transition"
            >
              Input Tamu Walk-in Lainnya
            </button>
          </div>
        </div>
      ) : (
        /* WALK-IN FORM */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E5DCD0] shadow-xs p-6 sm:p-8 space-y-6 text-xs">
          {/* Section 1: Guest Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#355C46] pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>1. Identitas Tamu Walk-in</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap Tamu *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Misal: Bapak H. Abdullah"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nomor WhatsApp / HP *</label>
                <input
                  type="text"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Tamu (Opsional)</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="tamu@email.com"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
              />
            </div>
          </div>

          {/* Section 2: Stay Period & Model */}
          <div className="space-y-4 pt-3 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#355C46] pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>2. Model Sewa & Tanggal Menginap</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {(['daily', 'monthly', 'yearly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRentalType(mode)}
                  className={`p-3 rounded-xl border text-center transition font-semibold capitalize ${
                    rentalType === mode
                      ? 'bg-[#355C46] text-white border-[#355C46] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Sewa {mode === 'daily' ? 'Harian' : mode === 'monthly' ? 'Bulanan' : 'Tahunan'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tanggal Check-in *</label>
                <input
                  type="date"
                  required
                  value={checkinDate}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tanggal Check-out *</label>
                <input
                  type="date"
                  required
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Jumlah Dewasa</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Jumlah Anak</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Room Selection */}
          <div className="space-y-4 pt-3 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#355C46] pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <BedDouble className="w-4 h-4" />
              <span>3. Pilih Kamar Tersedia ({availableRooms.length} Unit)</span>
            </h3>

            {availableRooms.length === 0 ? (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                Tidak ada kamar yang tersedia pada rentang tanggal terpilih. Silakan ubah tanggal check-in/out.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableRooms.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  const rate = rentalType === 'daily' 
                    ? formatRupiah(room.base_rate) + '/malam'
                    : rentalType === 'monthly'
                    ? formatRupiah(room.monthly_rate || 2500000) + '/bln'
                    : formatRupiah(room.yearly_rate || 24000000) + '/thn';

                  return (
                    <button
                      type="button"
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-[#355C46] bg-[#355C46]/5 ring-2 ring-[#355C46]'
                          : 'border-stone-200 bg-stone-50 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs bg-[#30291F] text-white px-2 py-0.5 rounded">
                            No. {room.room_number}
                          </span>
                          <span className="text-[11px] font-semibold text-[#806044]">
                            {room.room_type}
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-900 mt-1">{room.name}</h4>
                        <p className="text-[11px] text-stone-500 line-clamp-1">{room.amenities.slice(0, 3).join(', ')}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <strong className="text-xs text-[#355C46] font-bold block">{rate}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Payment & Total */}
          <div className="space-y-4 pt-3 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#355C46] pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>4. Rincian Tagihan & Pembayaran Kasir</span>
            </h3>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-stone-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-600">Total Biaya Sewa ({rentalType}):</span>
                <strong className="text-stone-900 text-sm">{formatRupiah(calculatedTotal)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nominal Diterima Kasir (IDR) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                >
                  <option value="Tunai / Kasir">Tunai (Cash di Tempat)</option>
                  <option value="QRIS Statis ALYATAMA">QRIS Statis Properti</option>
                  <option value="Transfer Bank BSI">Transfer Bank Syariah (BSI)</option>
                  <option value="Kartu Debit">Kartu Debit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Tamu datang larut malam, titip bagasi, atau keperluan dinas kantor..."
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-stone-500 text-[11px]">
              Otomatis mengunci unit kamar & mencatat staf penerima.
            </span>
            <button
              type="submit"
              disabled={loading || availableRooms.length === 0}
              className="bg-[#355C46] hover:bg-[#284635] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
            >
              {loading ? (
                <span>Memproses Data Walk-in...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Konfirmasi & Simpan Reservasi Walk-in</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
