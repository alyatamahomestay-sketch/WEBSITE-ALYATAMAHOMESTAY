import { formatRupiah, formatDateIndo } from './formatters';
import { normalizeIndonesianPhone } from './phone';
import { Reservation } from './types';

export interface WhatsAppMessagePayload {
  canSend: boolean;
  reasonIfNotAllowed?: string;
  recipientPhone: string;
  messageText: string;
  waDirectUrl: string;
}

/**
 * Prepares the manual WhatsApp message payload only if customer has explicitly consented
 */
export function prepareManualWhatsAppMessage(params: {
  reservation: Reservation;
  propertySettings?: { name?: string; phone?: string; address?: string };
  documentSlipUrl?: string;
  messageType: 'approval_payment_request' | 'payment_confirmed' | 'general_update';
}): WhatsAppMessagePayload {
  const { reservation, propertySettings, documentSlipUrl, messageType } = params;

  // 1. Strict Check: Consent
  const consent = reservation.whatsapp_consent;
  if (!consent || !consent.has_consented) {
    return {
      canSend: false,
      reasonIfNotAllowed:
        'Tamu tidak memberikan persetujuan (consent) untuk menerima bukti melalui WhatsApp saat pemesanan.',
      recipientPhone: reservation.guest?.phone || '',
      messageText: '',
      waDirectUrl: '',
    };
  }

  // 2. Normalize recipient phone
  const rawPhone = reservation.guest?.phone || consent.phone;
  const recipientPhone = normalizeIndonesianPhone(rawPhone);

  if (!recipientPhone) {
    return {
      canSend: false,
      reasonIfNotAllowed: 'Nomor telepon tamu tidak valid.',
      recipientPhone: '',
      messageText: '',
      waDirectUrl: '',
    };
  }

  const homestayName = propertySettings?.name || 'ALYATAMA HOMESTAY';
  const guestName = reservation.guest?.full_name || 'Tamu Terhormat';
  const resNumber = reservation.reservation_number;
  const roomName = reservation.rooms?.[0]?.name || 'Kamar Homestay';
  const checkinStr = formatDateIndo(reservation.checkin_date);
  const checkoutStr = formatDateIndo(reservation.checkout_date);
  const snap = Array.isArray(reservation.price_snapshot) ? reservation.price_snapshot[0] : reservation.price_snapshot;
  const totalStr = formatRupiah(snap?.total_amount);
  const depositStr = formatRupiah(snap?.deposit_required);
  const balanceStr = formatRupiah(snap?.balance_due);
  const extraCharges = Number(snap?.extra_charges) || 0;
  const extraBreakdown = Array.isArray(snap?.extra_charges_breakdown) ? snap.extra_charges_breakdown : [];
  const extraBedLine = extraCharges > 0 
    ? `• Ekstra Bed: ${extraBreakdown[0]?.description || `+Kasur Tambahan (${formatRupiah(extraCharges)})`}\n` 
    : '';

  let messageText = '';

  if (messageType === 'approval_payment_request') {
    messageText = `Halo ${guestName},\n\nTerima kasih telah mengajukan pemesanan di *${homestayName}*.\n\nPermintaan reservasi Anda telah *DISETUJUI* oleh admin homestay:\n` +
      `• No. Reservasi: *${resNumber}*\n` +
      `• Unit Kamar: ${roomName}\n` +
      extraBedLine +
      `• Periode: ${checkinStr} s/d ${checkoutStr}\n` +
      `• Total Biaya: ${totalStr}\n` +
      `• Uang Muka (Deposit): ${depositStr}\n\n` +
      `Untuk menyelesaikan pemesanan, silakan periksa rincian bukti pemesanan dan instruksi pembayaran di tautan berikut:\n${documentSlipUrl || '(Tersedia di website homestay)'}\n\n` +
      `Setelah melakukan transfer atau scan QRIS, mohon kirimkan konfirmasi kepada kami. Terima kasih atas kepercayaan Anda.\n\n*${homestayName}*`;
  } else if (messageType === 'payment_confirmed') {
    messageText = `Halo ${guestName},\n\nKabar baik! Pembayaran untuk reservasi Anda di *${homestayName}* telah diverifikasi dan *TERKONFIRMASI*.\n\n` +
      `• No. Reservasi: *${resNumber}*\n` +
      `• Unit Kamar: ${roomName}\n` +
      extraBedLine +
      `• Jadwal Check-in: ${checkinStr} (Mulai 14:00 WIB)\n` +
      `• Jadwal Check-out: ${checkoutStr} (Maksimal 12:00 WIB)\n` +
      `• Sisa Tagihan: ${balanceStr}\n\n` +
      `Bukti tanda terima pembayaran resmi dapat dilihat melalui tautan berikut:\n${documentSlipUrl || '(Tersedia di website homestay)'}\n\n` +
      `Kami menantikan kedatangan Anda di ALYATAMA HOMESTAY. Semoga perjalanan Anda menyenangkan!\n\n*${homestayName}*`;
  } else {
    messageText = `Halo ${guestName},\n\nInformasi terkait reservasi Anda *${resNumber}* di *${homestayName}*:\n` +
      `Tautan rincian pemesanan: ${documentSlipUrl || '(Tersedia di website homestay)'}\n\n` +
      `Jika ada pertanyaan, jangan ragu untuk menghubungi kami.\n\n*${homestayName}*`;
  }

  const encodedMessage = encodeURIComponent(messageText);
  const waDirectUrl = `https://wa.me/${recipientPhone}?text=${encodedMessage}`;

  return {
    canSend: true,
    recipientPhone,
    messageText,
    waDirectUrl,
  };
}
