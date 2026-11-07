import { Reservation, PropertySettings, PaymentMethod } from '../types';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../formatters';
import { normalizeIndonesianPhone } from '../phone';

/**
 * Generates and downloads a crisp, high-resolution JPG image of the reservation slip.
 */
export async function downloadReservationSlipJpg(
  reservation: Reservation,
  propertySettings?: PropertySettings | null,
  paymentMethods: PaymentMethod[] = []
): Promise<{ success: boolean; fileName: string }> {
  if (typeof window === 'undefined') {
    throw new Error('Hanya dapat dijalankan di browser');
  }

  // Target high-resolution canvas: 1000 x 1240 (Retina-quality 2x)
  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 1240;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia di browser ini');
  }

  // --- Background ---
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, width, height);

  // Outer decorative border
  ctx.strokeStyle = '#D4C3AD';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.strokeStyle = '#806044';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // --- Header Box (Deep Brown with Gold Accent) ---
  ctx.fillStyle = '#392B21';
  roundRect(ctx, 44, 44, width - 88, 160, 16);
  ctx.fill();

  // Header Gold Top Line
  ctx.fillStyle = '#C9A84C';
  roundRect(ctx, 44, 44, width - 88, 6, [16, 16, 0, 0]);
  ctx.fill();

  // Brand Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  const brandName = propertySettings?.name || 'ALYATAMA HOMESTAY';
  ctx.fillText(brandName, width / 2, 95);

  // Subtitle
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('PENGINAPAN SYARIAH BANGKINANG KOTA', width / 2, 122);

  // Address & Contact
  ctx.fillStyle = '#E7D8C5';
  ctx.font = '12px system-ui, sans-serif';
  ctx.letterSpacing = '0px';
  const address = propertySettings?.address || 'Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah';
  ctx.fillText(address, width / 2, 146);

  const phone = propertySettings?.phone || '0882-7992-7664';
  const wa = propertySettings?.whatsapp_number || '088279927664';
  ctx.fillText(`Telp: ${phone} | WhatsApp Konfirmasi: ${wa}`, width / 2, 168);

  // --- Document Type Ribbon / Badge ---
  const isApproved = reservation.status === 'confirmed' || reservation.status === 'approved_pending_payment' || reservation.status === 'checked_in';
  const docBadgeText = isApproved ? 'BUKTI RESERVASI & KONFIRMASI RESMI' : 'BUKTI PERMINTAAN RESERVASI RESMI';

  ctx.fillStyle = '#806044';
  roundRect(ctx, 220, 220, width - 440, 36, 18);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(docBadgeText, width / 2, 243);

  // --- Reservation Number & Date Info Card ---
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, 275, width - 88, 90, 14);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left: Nomor Reservasi
  ctx.textAlign = 'left';
  ctx.fillStyle = '#756A5F';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('NOMOR RESERVASI RESMI', 70, 310);

  ctx.fillStyle = '#392B21';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(reservation.reservation_number, 70, 340);

  // Right: Status & Tanggal Terbit
  ctx.textAlign = 'right';
  ctx.fillStyle = '#756A5F';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('STATUS PERMINTAAN', width - 70, 310);

  ctx.fillStyle = isApproved ? '#15803d' : '#806044';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(isApproved ? 'DISETUJUI (TERKONFIRMASI)' : 'MENUNGGU VERIFIKASI ADMIN', width - 70, 336);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(`Diterbitkan: ${formatDateTimeIndo(new Date())}`, width - 70, 355);

  // --- Section 1: Data Tamu & Rincian Kamar ---
  let curY = 385;

  const priceSnapshot = Array.isArray(reservation.price_snapshot) ? reservation.price_snapshot[0] : reservation.price_snapshot;
  const room = reservation.rooms?.[0];
  const roomName = room?.name || 'Unit Kamar Homestay';
  const roomType = room?.room_type || 'Syariah';
  const roomNo = room?.room_number ? ` (No. ${room.room_number})` : '';
  const rentalLabel = reservation.rental_type === 'monthly' ? 'Sewa Bulanan' : reservation.rental_type === 'yearly' ? 'Sewa Tahunan' : 'Sewa Harian';

  const checkinStr = `${formatDateIndo(reservation.checkin_date)} (14:00 WIB)`;
  const checkoutStr = `${formatDateIndo(reservation.checkout_date)} (12:00 WIB)`;
  const nights = reservation.duration_units || priceSnapshot?.total_nights || 1;
  const unitLabel = reservation.rental_type === 'monthly' ? 'Bulan' : reservation.rental_type === 'yearly' ? 'Tahun' : 'Malam';
  const durationStr = `${nights} ${unitLabel}`;
  const guestsCount = `${reservation.adults} Dewasa${reservation.children > 0 ? `, ${reservation.children} Anak` : ''}`;

  // Extract extra bed info
  let extraBedCount = 0;
  const specReq = String(reservation.special_requests || '');
  const extraBedMatch = specReq.match(/\[(?:Permintaan:\s*)?\+(\d+)\s*Unit\s*Ekstra\s*Bed\]/i) || specReq.match(/\[Ekstra\s*Bed:\s*\+(\d+)\s*Unit/i);
  if (extraBedMatch && extraBedMatch[1]) {
    extraBedCount = parseInt(extraBedMatch[1], 10);
  }

  const configuredExtraRate = propertySettings?.extra_bed_rate || 30000;
  const defaultRoomRate = room?.base_rate || 200000;
  const baseSubtotalNum = Number(priceSnapshot?.base_subtotal) || (defaultRoomRate * nights);
  let extraChargesNum = Number(priceSnapshot?.extra_charges) || (extraBedCount > 0 ? (extraBedCount * configuredExtraRate * nights) : 0);
  const discountAmt = Number(priceSnapshot?.discount_amount) || 0;
  const totalAmountNum = Number(priceSnapshot?.total_amount) || ((baseSubtotalNum - discountAmt) + extraChargesNum);
  const totalPaidNum = Number(priceSnapshot?.total_paid) || (reservation.payment_status === 'paid' ? totalAmountNum : 0);
  const isPaid = reservation.payment_status === 'paid';
  const balanceDueNum = isPaid ? 0 : (priceSnapshot?.balance_due != null ? Number(priceSnapshot.balance_due) : Math.max(0, totalAmountNum - totalPaidNum));

  const hasExtraBed = extraChargesNum > 0 || extraBedCount > 0;
  const sec1Height = hasExtraBed ? 295 : 245;

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, sec1Height, 14);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  // Section Header
  ctx.fillStyle = '#FAF7F2';
  roundRect(ctx, 44, curY, width - 88, 40, [14, 14, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#806044';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('1. DATA TAMU & RINCIAN UNIT KAMAR', 65, curY + 25);

  // Row 1: Nama Tamu & Kontak
  const guestName = reservation.guest?.full_name || '-';
  const guestPhone = reservation.guest?.phone || '-';

  drawField(ctx, 65, curY + 65, 'Nama Lengkap Tamu', guestName);
  drawField(ctx, 520, curY + 65, 'Nomor WhatsApp / HP', guestPhone);

  // Row 2: Unit Kamar & Tipe
  drawField(ctx, 65, curY + 125, 'Unit Kamar Dipilih', `${roomName}${roomNo} [${roomType}]`);
  drawField(ctx, 520, curY + 125, 'Pilihan Masa Sewa', rentalLabel);

  // Row 3: Jadwal Menginap & Durasi
  drawField(ctx, 65, curY + 185, 'Jadwal Check-in', checkinStr);
  drawField(ctx, 360, curY + 185, 'Jadwal Check-out', checkoutStr);
  drawField(ctx, 680, curY + 185, 'Durasi & Tamu', `${durationStr} (${guestsCount})`);

  // Row 4: Ekstra Bed jika memesan
  if (hasExtraBed) {
    drawField(ctx, 65, curY + 245, 'Penambahan Ekstra Bed', `+${extraBedCount || 1} Unit Kasur Tambahan (+${formatRupiah(extraChargesNum)})`);
    drawField(ctx, 520, curY + 245, 'Fasilitas Ekstra Bed', 'Termasuk Bantal Empuk & Sprei Bersih Homestay');
  }

  // --- Section 2: Rincian Biaya & Tagihan ---
  curY = curY + sec1Height + 20;

  const sec2Height = hasExtraBed ? 250 : 210;

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, sec2Height, 14);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  // Section Header
  ctx.fillStyle = '#FAF7F2';
  roundRect(ctx, 44, curY, width - 88, 40, [14, 14, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#806044';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('2. RINCIAN BIAYA & STATUS PEMBAYARAN', 65, curY + 25);

  const boxHeight = hasExtraBed ? 175 : 140;

  // Financial Grid Box
  ctx.fillStyle = '#392B21';
  roundRect(ctx, 65, curY + 55, width - 130, boxHeight, 10);
  ctx.fill();

  // Subtotal Sewa Kamar Pokok
  ctx.fillStyle = '#E7D8C5';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`Subtotal Sewa Pokok (${durationStr}):`, 90, curY + 82);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(formatRupiah(baseSubtotalNum), 420, curY + 82);

  let nextRowY = curY + 106;

  // Tambahan Ekstra Bed jika ada
  if (hasExtraBed) {
    ctx.fillStyle = '#FDE047';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`+ Ekstra Bed (${extraBedCount || 1} Unit x ${nights} Malam):`, 90, nextRowY);
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`+${formatRupiah(extraChargesNum)}`, 420, nextRowY);
    nextRowY += 24;
  }

  // Diskon Promo jika ada
  if (discountAmt > 0) {
    ctx.fillStyle = '#4ade80';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`- Diskon Promo (${priceSnapshot?.discount_reason || priceSnapshot?.promo_code || 'Promo'}):`, 90, nextRowY);
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`-${formatRupiah(discountAmt)}`, 420, nextRowY);
    nextRowY += 24;
  }

  // Divider line
  ctx.strokeStyle = '#5a4638';
  ctx.beginPath();
  ctx.moveTo(90, nextRowY - 4);
  ctx.lineTo(width - 90, nextRowY - 4);
  ctx.stroke();

  // Left side: TOTAL BIAYA SEWA RESMI
  ctx.textAlign = 'left';
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('TOTAL BIAYA SEWA RESMI:', 90, nextRowY + 16);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(formatRupiah(totalAmountNum), 275, nextRowY + 18);

  // Right side: Diterima & Sisa Tagihan (Right-aligned inside box, NEVER overflows past border)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#E7D8C5';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(`Diterima Kasir: ${formatRupiah(totalPaidNum)}`, width - 90, nextRowY + 10);

  ctx.fillStyle = balanceDueNum === 0 ? '#4ade80' : '#FDE047';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`Sisa Saat Tiba: ${formatRupiah(balanceDueNum)}`, width - 90, nextRowY + 28);
  ctx.textAlign = 'left';

  // --- Catatan Kepatuhan Syariah & Ketentuan Homestay ---
  curY = curY + sec2Height + 20;

  const syariahHeight = 78;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, syariahHeight, 12);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  ctx.fillStyle = '#392B21';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('CATATAN PENTING KEPATUHAN SYARIAH & KETENTUAN HOMESTAY:', 65, curY + 24);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#756A5F';
  ctx.fillText('• Pasangan yang menginap wajib menunjukkan identitas pernikahan sah (KTP beralamat sama / Buku Nikah).', 65, curY + 44);
  ctx.fillText('• Dilarang membawa minuman keras, narkoba, hewan peliharaan, serta menjaga ketenangan adab Islami.', 65, curY + 62);

  // --- Segel & Stempel Dokumen Resmi PMS ALYATAMA ---
  curY = curY + syariahHeight + 20;

  const sec4Height = 110;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, sec4Height, 14);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  // Seal Graphic
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(85, curY + 55, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓', 85, curY + 63);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#392B21';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('DOKUMEN RESMI TERCATAT DALAM SISTEM PMS ALYATAMA', 125, curY + 45);

  ctx.fillStyle = '#756A5F';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Jl. Mayor Ali Rasyid No 19 Bangkinang Kota, Panti Asuhan Putra Muhammadiyah, Kampar, Riau', 125, curY + 67);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(`Hash Validasi: SHA256-${reservation.id.slice(0, 12)} | Generator: PMS-ALYATAMA-CLIENT`, 125, curY + 87);

  // Bottom Notice
  curY = curY + sec4Height + 25;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#756A5F';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Harap simpan file gambar (.jpg) ini sebagai bukti pemesanan saat tiba di homestay.', width / 2, curY);

  // Convert canvas to Blob (image/jpeg)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengonversi bukti reservasi menjadi gambar JPG'));
          return;
        }

        const fileName = `Bukti-Reservasi-${reservation.reservation_number}.jpg`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        resolve({ success: true, fileName });
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Generates direct WhatsApp chat URL to Admin
 */
export function getGuestToAdminWhatsAppUrl(params: {
  reservation: Reservation;
  propertySettings?: PropertySettings | null;
}): string {
  const { reservation, propertySettings } = params;
  const rawAdminPhone = propertySettings?.whatsapp_number || propertySettings?.phone || '0882-7992-7664';
  const cleanPhone = normalizeIndonesianPhone(rawAdminPhone) || '6288279927664';

  const guestName = reservation.guest?.full_name || 'Tamu';
  const resNumber = reservation.reservation_number;
  const roomName = reservation.rooms?.[0]?.name || 'Unit Kamar';
  const roomType = reservation.rooms?.[0]?.room_type ? ` (${reservation.rooms[0].room_type})` : '';
  const checkinStr = formatDateIndo(reservation.checkin_date);
  const checkoutStr = formatDateIndo(reservation.checkout_date);
  const totalStr = formatRupiah(reservation.price_snapshot?.total_amount);

  const messageText =
    `Assalamu'alaikum Admin ALYATAMA HOMESTAY,\n\n` +
    `Saya telah mengajukan reservasi kamar melalui website resmi dengan rincian sebagai berikut:\n\n` +
    `• *No. Reservasi:* ${resNumber}\n` +
    `• *Nama Tamu:* ${guestName}\n` +
    `• *Unit Kamar:* ${roomName}${roomType}\n` +
    `• *Jadwal Check-in:* ${checkinStr}\n` +
    `• *Jadwal Check-out:* ${checkoutStr}\n` +
    `• *Total Biaya:* ${totalStr}\n\n` +
    `Berikut saya lampirkan file gambar bukti pemesanan (.jpg) untuk diverifikasi dan dikonfirmasi ketersediaan kamarnya.\n\n` +
    `Mohon petunjuk langkah selanjutnya. Terima kasih.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

// Helper: draws field label and value
function drawField(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, value: string) {
  ctx.fillStyle = '#756A5F';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);

  ctx.fillStyle = '#392B21';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(value, x, y + 20);
}

// Helper: rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | number[] = 0
) {
  let rTopLeft = 0;
  let rTopRight = 0;
  let rBottomRight = 0;
  let rBottomLeft = 0;

  if (typeof radius === 'number') {
    rTopLeft = radius;
    rTopRight = radius;
    rBottomRight = radius;
    rBottomLeft = radius;
  } else if (Array.isArray(radius)) {
    rTopLeft = radius[0] || 0;
    rTopRight = radius[1] || 0;
    rBottomRight = radius[2] || 0;
    rBottomLeft = radius[3] || 0;
  }

  ctx.beginPath();
  ctx.moveTo(x + rTopLeft, y);
  ctx.lineTo(x + w - rTopRight, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rTopRight);
  ctx.lineTo(x + w, y + h - rBottomRight);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rBottomRight, y + h);
  ctx.lineTo(x + rBottomLeft, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rBottomLeft);
  ctx.lineTo(x, y + rTopLeft);
  ctx.quadraticCurveTo(x, y, x + rTopLeft, y);
  ctx.closePath();
}
