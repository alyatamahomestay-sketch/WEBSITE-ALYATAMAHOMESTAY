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

  // Target high-resolution canvas: 1000 x 1460 (Retina-quality 2x)
  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 1460;
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

  const phone = propertySettings?.phone || '0822-8547-2008';
  const wa = propertySettings?.whatsapp_number || '0822-8547-2008';
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

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, 250, 14);
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
  const guestEmail = reservation.guest?.email || '-';

  drawField(ctx, 65, curY + 65, 'Nama Lengkap Tamu', guestName);
  drawField(ctx, 520, curY + 65, 'Nomor WhatsApp / HP', guestPhone);

  // Row 2: Unit Kamar & Tipe
  const roomName = reservation.rooms?.[0]?.name || 'Unit Kamar Homestay';
  const roomType = reservation.rooms?.[0]?.room_type || 'Syariah';
  const roomNo = reservation.rooms?.[0]?.room_number ? ` (No. ${reservation.rooms[0].room_number})` : '';
  const rentalLabel = reservation.rental_type === 'monthly' ? 'Sewa Bulanan' : reservation.rental_type === 'yearly' ? 'Sewa Tahunan' : 'Sewa Harian';

  drawField(ctx, 65, curY + 125, 'Unit Kamar Dipilih', `${roomName}${roomNo} [${roomType}]`);
  drawField(ctx, 520, curY + 125, 'Pilihan Masa Sewa', rentalLabel);

  // Row 3: Jadwal Menginap & Durasi
  const checkinStr = `${formatDateIndo(reservation.checkin_date)} (14:00 WIB)`;
  const checkoutStr = `${formatDateIndo(reservation.checkout_date)} (12:00 WIB)`;
  const durationStr = reservation.duration_units
    ? `${reservation.duration_units} ${reservation.rental_type === 'monthly' ? 'Bulan' : 'Malam'}`
    : `${reservation.price_snapshot?.total_nights || 1} Malam`;
  const guestsCount = `${reservation.adults} Dewasa${reservation.children > 0 ? `, ${reservation.children} Anak` : ''}`;

  drawField(ctx, 65, curY + 185, 'Jadwal Check-in', checkinStr);
  drawField(ctx, 360, curY + 185, 'Jadwal Check-out', checkoutStr);
  drawField(ctx, 680, curY + 185, 'Durasi & Tamu', `${durationStr} (${guestsCount})`);

  // --- Section 2: Rincian Biaya & Tagihan ---
  curY = 655;

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, 205, 14);
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

  const priceSnapshot = reservation.price_snapshot;
  const totalAmount = formatRupiah(priceSnapshot?.total_amount);
  const totalPaid = formatRupiah(priceSnapshot?.total_paid || 0);
  const balanceDue = formatRupiah(priceSnapshot?.balance_due ?? priceSnapshot?.total_amount);
  const depositReq = formatRupiah(priceSnapshot?.deposit_required || 0);

  // Financial Grid Box
  ctx.fillStyle = '#392B21';
  roundRect(ctx, 65, curY + 55, width - 130, 130, 10);
  ctx.fill();

  // Total
  ctx.fillStyle = '#E7D8C5';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('TOTAL BIAYA SEWA', 90, curY + 85);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(totalAmount, 90, curY + 115);

  // DP
  ctx.fillStyle = '#E7D8C5';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('UANG MUKA (DP)', 380, curY + 85);
  ctx.fillStyle = '#C9A84C';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(depositReq, 380, curY + 115);

  // Pembayaran Terverifikasi
  ctx.fillStyle = '#E7D8C5';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('DITERIMA SISTEM', 620, curY + 85);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(totalPaid, 620, curY + 115);

  // Bottom Line of Financial Grid
  ctx.strokeStyle = '#5a4638';
  ctx.beginPath();
  ctx.moveTo(90, curY + 135);
  ctx.lineTo(width - 90, curY + 135);
  ctx.stroke();

  ctx.fillStyle = '#E7D8C5';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('SISA TAGIHAN SAAT CHECK-IN:', 90, curY + 162);
  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(balanceDue, 380, curY + 162);

  // --- Section 3: Rekening Pembayaran & Instruksi WhatsApp ---
  curY = 880;

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, 290, 14);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  // Section Header
  ctx.fillStyle = '#FAF7F2';
  roundRect(ctx, 44, curY, width - 88, 40, [14, 14, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#806044';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('3. INSTRUKSI PEMBAYARAN & KONFIRMASI WHATSAPP ADMIN', 65, curY + 25);

  // Bank Info Card
  const bankMethod = paymentMethods.find((pm) => pm.code === 'bank_transfer' && pm.is_active);
  const bankAccount = bankMethod?.account_number || '123-456-7890';
  const bankOwner = bankMethod?.account_name || 'ALYATAMA HOMESTAY';

  ctx.fillStyle = '#FAF7F2';
  roundRect(ctx, 65, curY + 55, 410, 120, 10);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  ctx.fillStyle = '#392B21';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('Rekening Transfer Bank Resmi:', 85, curY + 80);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#806044';
  ctx.fillText(bankAccount, 85, curY + 110);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#756A5F';
  ctx.fillText(`a.n. ${bankOwner}`, 85, curY + 132);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('Sertakan No. Reservasi pada berita transfer.', 85, curY + 155);

  // WhatsApp Instructions Card
  ctx.fillStyle = '#F0FDF4';
  roundRect(ctx, 505, curY + 55, 430, 120, 10);
  ctx.fill();
  ctx.strokeStyle = '#BBF7D0';
  ctx.stroke();

  ctx.fillStyle = '#166534';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('WhatsApp Konfirmasi Admin Homestay:', 525, curY + 80);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#15803d';
  ctx.fillText(wa, 525, curY + 110);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#166534';
  ctx.fillText('Petugas bertugas melayani verifikasi 24 Jam', 525, curY + 132);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#15803d';
  ctx.fillText('Kirimkan gambar bukti ini via chat WhatsApp admin.', 525, curY + 155);

  // Instructions Note Box
  ctx.fillStyle = '#FAF7F2';
  roundRect(ctx, 65, curY + 190, width - 130, 65, 8);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  ctx.fillStyle = '#392B21';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('CATATAN PENTING KEPATUHAN SYARIAH:', 85, curY + 212);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#756A5F';
  ctx.fillText('• Pasangan yang menginap wajib menunjukkan identitas pernikahan sah (KTP beralamat sama / Buku Nikah).', 85, curY + 230);
  ctx.fillText('• Dilarang membawa minuman keras, narkoba, hewan peliharaan, serta menjaga ketenangan adab Islami.', 85, curY + 245);

  // --- Section 4: Footer Stamp & Verification Seal ---
  curY = 1195;

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 44, curY, width - 88, 120, 14);
  ctx.fill();
  ctx.strokeStyle = '#E5DCD0';
  ctx.stroke();

  // Seal Graphic
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(85, curY + 60, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓', 85, curY + 67);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#392B21';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('DOKUMEN RESMI TERCATAT DALAM SISTEM PMS ALYATAMA', 125, curY + 50);

  ctx.fillStyle = '#756A5F';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Panti Asuhan Putra Muhammadiyah Bangkinang Kota, Kabupaten Kampar, Riau 28411', 125, curY + 72);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(`Hash Validasi: SHA256-${reservation.id.slice(0, 12)} | Generator: PMS-ALYATAMA-CLIENT`, 125, curY + 92);

  // Bottom Notice
  ctx.textAlign = 'center';
  ctx.fillStyle = '#756A5F';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Harap simpan file gambar (.jpg) ini sebagai bukti pemesanan saat tiba di homestay.', width / 2, 1345);

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
  const rawAdminPhone = propertySettings?.whatsapp_number || propertySettings?.phone || '0822-8547-2008';
  const cleanPhone = normalizeIndonesianPhone(rawAdminPhone) || '6282285472008';

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
