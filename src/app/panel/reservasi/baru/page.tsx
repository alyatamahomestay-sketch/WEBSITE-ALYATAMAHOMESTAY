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
import { Room, StaffShift, Reservation, PaymentMethod } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { evaluateRoomAvailability } from '@/lib/room-availability';
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
  
  const [rentalType, setRentalType] = useState<'daily' | 'monthly'>('daily');
  const [checkinDate, setCheckinDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkoutDate, setCheckoutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Ekstra Bed State
  const [extraBedQty, setExtraBedQty] = useState<number>(0);
  const [extraBedRate, setExtraBedRate] = useState<number>(50000);

  // Rooms & Reservations
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Payment & QRIS verification
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Tunai / Kasir');
  const [qrisVerified, setQrisVerified] = useState(false);
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

  // Fetch all rooms, reservations, and payment methods
  useEffect(() => {
    async function loadData() {
      try {
        const [rooms, reservations, methods, prop] = await Promise.all([
          PmsService.getRooms(true),
          PmsService.getReservations(),
          PmsService.getPaymentMethods(),
          PmsService.getPropertySettings(),
        ]);
        setAllRooms(rooms.filter(r => !r.is_archived));
        setAllReservations(reservations);
        setPaymentMethods(methods);
        if (typeof window !== 'undefined') {
          const localVal = localStorage.getItem('alyatama_extra_bed_rate');
          if (localVal && Number(localVal) >= 0) {
            setExtraBedRate(Number(localVal));
          }
        }
        if (prop && prop.extra_bed_rate !== undefined && Number(prop.extra_bed_rate) >= 0) {
          setExtraBedRate(Number(prop.extra_bed_rate));
        }

        try {
          const res = await fetch('/api/panel/properties', { cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.property?.extra_bed_rate !== undefined && Number(json.property.extra_bed_rate) >= 0) {
              setExtraBedRate(Number(json.property.extra_bed_rate));
            }
          }
        } catch (e) {}

        // Auto select first available room if none selected
        if (!selectedRoomId && rooms.length > 0) {
          const firstAvail = rooms.find((r) => {
            const avail = evaluateRoomAvailability(r, reservations, checkinDate);
            return avail.isAvailable;
          });
          if (firstAvail) {
            setSelectedRoomId(firstAvail.id);
          } else {
            setSelectedRoomId(rooms[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();

    const onRateSync = (e: any) => {
      if (e?.detail && Number(e.detail) >= 0) {
        setExtraBedRate(Number(e.detail));
      } else {
        loadData();
      }
    };
    window.addEventListener('storage', onRateSync);
    window.addEventListener('extra-bed-updated', onRateSync);
    return () => {
      window.removeEventListener('storage', onRateSync);
      window.removeEventListener('extra-bed-updated', onRateSync);
    };
  }, [checkinDate]);

  // Calculate pricing based on selected room, rental type, & extra bed
  const selectedRoom = allRooms.find((r) => r.id === selectedRoomId);
  const diffDays = Math.max(1, Math.round((new Date(checkoutDate).getTime() - new Date(checkinDate).getTime()) / (1000 * 3600 * 24)));
  
  let calculatedRoomTotal = 0;
  if (selectedRoom) {
    if (rentalType === 'daily') {
      calculatedRoomTotal = selectedRoom.base_rate * diffDays;
    } else if (rentalType === 'monthly') {
      calculatedRoomTotal = selectedRoom.monthly_rate || 2500000;
    }
  }

  const totalExtraBed = extraBedQty * extraBedRate * diffDays;
  const calculatedTotal = calculatedRoomTotal + totalExtraBed;

  // Update default payment amount to total
  useEffect(() => {
    if (calculatedTotal > 0) {
      setPaymentAmount(calculatedTotal);
    }
  }, [calculatedTotal]);

  // QRIS image check
  const isQrisSelected = paymentMethod.toLowerCase().includes('qris');
  const qrisMethod = paymentMethods.find((m) => m.code === 'qris');
  const qrisImageUrl = qrisMethod?.qris_image_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80';

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

    if (isQrisSelected && !qrisVerified) {
      alert('Wajib mencentang kotak konfirmasi bahwa pembayaran QRIS tamu telah berhasil masuk / diverifikasi.');
      return;
    }

    setLoading(true);
    try {
      const extraBreakdown = extraBedQty > 0 ? [{
        description: `Ekstra Bed / Kasur Tambahan (${extraBedQty} Unit x ${diffDays} Malam)`,
        amount: totalExtraBed,
      }] : [];

      const walkInNotes = [
        notes.trim(),
        extraBedQty > 0 ? `[Ekstra Bed: +${extraBedQty} Unit x Rp ${extraBedRate.toLocaleString('id-ID')}]` : '',
        isQrisSelected ? '[Pembayaran Terverifikasi via QRIS]' : '',
      ].filter(Boolean).join('\n');

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
        baseSubtotal: calculatedRoomTotal,
        extraCharges: totalExtraBed,
        extraChargesBreakdown: extraBreakdown,
        totalAmount: calculatedTotal,
        paymentAmount: Number(paymentAmount),
        paymentMethod,
        staffUserId: staffUser?.id || 'staff-direct',
        staffRole: staffUser?.role || 'staff',
        staffShiftId: activeShift?.id || null,
        staffNameSnapshot: activeShift?.staff_name_snapshot || staffUser?.full_name || 'Petugas Bertugas',
        notes: walkInNotes || undefined,
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
              <span>2. Model Sewa &amp; Tanggal Menginap</span>
            </h3>

            {/* Pilihan Model Sewa: Hanya Harian & Bulanan (Tahunan Dihapus) */}
            <div className="grid grid-cols-2 gap-3">
              {(['daily', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRentalType(mode)}
                  className={`p-3 rounded-xl border text-center transition font-semibold capitalize cursor-pointer ${
                    rentalType === mode
                      ? 'bg-[#355C46] text-white border-[#355C46] shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Sewa {mode === 'daily' ? 'Harian (Per Malam)' : 'Bulanan'}
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

            {/* Form Penambahan Ekstra Bed (Tarif Ditentukan Admin) */}
            <div className="bg-[#FAF7F2] border border-[#E5DCD0] p-4 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-[#806044] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Penambahan Ekstra Bed (Kasur Tambahan)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Biaya diatur oleh admin dan otomatis diakumulasikan ke total tagihan walk-in.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <label htmlFor="adminExtraBedQty" className="text-xs font-semibold text-stone-700">
                    Jumlah Kasur:
                  </label>
                  <select
                    id="adminExtraBedQty"
                    value={extraBedQty}
                    onChange={(e) => setExtraBedQty(Number(e.target.value))}
                    className="p-2 rounded-xl border border-stone-300 bg-white font-bold text-xs focus:ring-2 focus:ring-[#355C46]"
                  >
                    <option value="0">0 (Tidak Ada)</option>
                    <option value="1">1 Unit</option>
                    <option value="2">2 Unit</option>
                    <option value="3">3 Unit</option>
                  </select>
                </div>
              </div>

              {extraBedQty > 0 && (
                <div className="pt-3 border-t border-[#E5DCD0] grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Tarif Ekstra Bed / Malam (Ditentukan Admin):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-stone-500">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={extraBedRate}
                        onChange={(e) => setExtraBedRate(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 font-bold bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-[#E5DCD0] text-right">
                    <span className="text-[11px] text-stone-500 block">
                      Total Ekstra Bed ({extraBedQty} unit × {diffDays} malam):
                    </span>
                    <strong className="text-xs text-[#355C46] font-bold">
                      +{formatRupiah(totalExtraBed)}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Room Selection (Sama Seperti Halaman Pilihan Kamar Tamu) */}
          <div className="space-y-4 pt-3 border-t border-stone-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#355C46] flex items-center gap-1.5">
                <BedDouble className="w-4 h-4" />
                <span>3. Pilih Kamar Tersedia ({allRooms.length} Unit)</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                Status ketersediaan terhubung langsung dengan sistem reservasi &amp; halaman tamu
              </span>
            </div>

            {allRooms.length === 0 ? (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                Memuat daftar unit kamar ALYATAMA HOMESTAY...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {allRooms.map((room) => {
                  const availInfo = evaluateRoomAvailability(room, allReservations, checkinDate);
                  const isAvail = availInfo.isAvailable;
                  const isSelected = selectedRoomId === room.id;
                  const rate = rentalType === 'daily' 
                    ? formatRupiah(room.base_rate) + '/malam'
                    : formatRupiah(room.monthly_rate || 2500000) + '/bln';

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        if (isAvail) {
                          setSelectedRoomId(room.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 relative ${
                        !isAvail
                          ? 'opacity-65 bg-stone-100/90 border-stone-200 cursor-not-allowed select-none'
                          : isSelected
                          ? 'border-[#355C46] bg-[#355C46]/5 ring-2 ring-[#355C46] shadow-sm cursor-pointer'
                          : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-[#806044] cursor-pointer'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs bg-[#30291F] text-white px-2.5 py-0.5 rounded-md">
                              No. {room.room_number}
                            </span>
                            <span className="text-xs font-semibold text-[#806044] uppercase tracking-wider">
                              {room.room_type}
                            </span>
                          </div>

                          {/* Status Badge identik dengan halaman tamu */}
                          {isAvail ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-500 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-500 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              Tidak Tersedia
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-stone-900 text-sm">{room.name}</h4>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {room.amenities.slice(0, 3).join(', ')} • Kapasitas {room.capacity_adults} Dewasa
                        </p>

                        {!isAvail && (
                          <p className="text-[10px] text-rose-700 font-medium mt-1.5 bg-rose-50/80 p-1.5 rounded border border-rose-200/60 leading-tight">
                            *{availInfo.reason || 'Kamar tidak dapat dipilih pada tanggal ini'}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 mt-1">
                        <span className="text-[11px] text-stone-500">Tarif Sewa:</span>
                        <strong className="text-xs text-[#355C46] font-bold block">{rate}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Payment & Total */}
          <div className="space-y-4 pt-3 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#355C46] pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>4. Rincian Tagihan &amp; Pembayaran Kasir</span>
            </h3>

            {/* Rincian Finansial Walk-in */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Biaya Sewa Kamar ({rentalType === 'daily' ? `${diffDays} Malam` : '1 Bulan'}):</span>
                <span className="font-semibold text-stone-900">{formatRupiah(calculatedRoomTotal)}</span>
              </div>
              {extraBedQty > 0 && (
                <div className="flex justify-between text-emerald-800 bg-emerald-50/60 p-1.5 rounded-lg font-medium">
                  <span>Tambahan Ekstra Bed ({extraBedQty} Unit × {diffDays} Malam):</span>
                  <span>+{formatRupiah(totalExtraBed)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Biaya Keseluruhan:</span>
                <strong className="text-[#355C46]">{formatRupiah(calculatedTotal)}</strong>
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
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    if (!e.target.value.toLowerCase().includes('qris')) {
                      setQrisVerified(false);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46] bg-white font-medium text-stone-800"
                >
                  <option value="Tunai / Kasir">Tunai (Cash di Resepsionis)</option>
                  <option value="QRIS ALYATAMA">QRIS ALYATAMA HOMESTAY</option>
                  <option value="Transfer Bank BSI">Transfer Bank (BCA / BSI / Mandiri)</option>
                  <option value="Kartu Debit">Kartu Debit Kasir</option>
                </select>
              </div>
            </div>

            {/* QRIS Image & Verification Checklist (Tampil jika Metode QRIS Dipilih) */}
            {isQrisSelected && (
              <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#355C46] text-white">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      Pindai QRIS Resmi ALYATAMA HOMESTAY
                    </h4>
                    <p className="text-[11px] text-stone-600">
                      Tunjukkan gambar QRIS kepada tamu dan pastikan nominal pembayaran tepat sebesar {formatRupiah(paymentAmount)}.
                    </p>
                  </div>
                </div>

                {/* QRIS Display Container */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200 max-w-xs mx-auto text-center space-y-2 shadow-xs">
                  <img
                    src={qrisImageUrl}
                    alt="QRIS ALYATAMA HOMESTAY"
                    className="w-56 h-56 object-contain mx-auto rounded-lg border border-stone-100"
                  />
                  <div className="text-[11px] text-stone-500 font-mono">
                    NMID / Merchant: ALYATAMA HOMESTAY
                  </div>
                </div>

                {/* Checklist Konfirmasi QRIS (Wajib Dicentang) */}
                <div className="p-3.5 bg-white border-2 border-emerald-500/60 rounded-xl flex items-start gap-3 shadow-2xs">
                  <input
                    type="checkbox"
                    id="qrisVerifiedCheckbox"
                    checked={qrisVerified}
                    onChange={(e) => setQrisVerified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#355C46] focus:ring-[#355C46] cursor-pointer shrink-0"
                  />
                  <label htmlFor="qrisVerifiedCheckbox" className="text-xs text-stone-800 font-semibold leading-relaxed cursor-pointer select-none">
                    Saya mengonfirmasi bahwa tamu telah memindai QRIS dan pembayaran sejumlah <span className="text-[#355C46] font-bold">{formatRupiah(paymentAmount)}</span> telah berhasil masuk dan terverifikasi pada rekening kasir ALYATAMA HOMESTAY. <span className="text-rose-600">*</span>
                  </label>
                </div>
              </div>
            )}

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
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-stone-500 text-[11px]">
              {isQrisSelected && !qrisVerified ? (
                <span className="text-amber-700 font-medium">*Centang konfirmasi pembayaran QRIS untuk mengaktifkan tombol simpan.</span>
              ) : (
                'Otomatis mengunci unit kamar & mencatat staf penerima.'
              )}
            </span>
            <button
              type="submit"
              disabled={loading || allRooms.length === 0 || (isQrisSelected && !qrisVerified)}
              className="w-full sm:w-auto bg-[#355C46] hover:bg-[#284635] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Memproses Data Walk-in...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Konfirmasi &amp; Simpan Reservasi Walk-in</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
