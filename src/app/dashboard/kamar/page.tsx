'use client';

import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Plus, 
  Edit, 
  Archive, 
  Trash2,
  Users, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  DollarSign,
  AlertCircle,
  Calendar,
  Building2
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Room, RoomOperationalStatus } from '@/lib/types';
import { formatRupiah, getRoomOperationalStatusMeta } from '@/lib/formatters';
import ImageUploadPicker from '@/components/common/ImageUploadPicker';
import { showAdminToast } from '@/components/common/AdminToast';

export default function KamarManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Form Fields
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Standard Queen');
  const [description, setDescription] = useState('');
  const [capacityAdults, setCapacityAdults] = useState(2);
  const [capacityChildren, setCapacityChildren] = useState(1);
  const [baseRate, setBaseRate] = useState(250000);
  const [monthlyRate, setMonthlyRate] = useState<number | ''>(2500000);
  const [yearlyRate, setYearlyRate] = useState<number | ''>(24000000);
  const [operationalStatus, setOperationalStatus] = useState<RoomOperationalStatus>('tersedia');
  const [amenitiesInput, setAmenitiesInput] = useState('AC Dingin, WiFi Berkecepatan Tinggi, Kamar Mandi Dalam, Water Heater');
  const [photoUrl, setPhotoUrl] = useState('/images/alyatama-flyer.jpg');
  const [internalNotes, setInternalNotes] = useState('');

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await PmsService.getRooms(true);
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoomId(null);
    setRoomNumber('');
    setName('');
    setRoomType('REGULER');
    setDescription('');
    setCapacityAdults(2);
    setCapacityChildren(1);
    setBaseRate(250000);
    setMonthlyRate(2500000);
    setYearlyRate(24000000);
    setOperationalStatus('tersedia');
    setAmenitiesInput('AC Dingin, WiFi Berkecepatan Tinggi, Kamar Mandi Dalam, Water Heater');
    setPhotoUrl('/images/alyatama-flyer.jpg');
    setInternalNotes('');
    setShowModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.room_number);
    setName(room.name);
    setRoomType(room.room_type);
    setDescription(room.description);
    setCapacityAdults(room.capacity_adults);
    setCapacityChildren(room.capacity_children);
    setBaseRate(room.base_rate);
    setMonthlyRate(room.monthly_rate ?? '');
    setYearlyRate(room.yearly_rate ?? '');
    setOperationalStatus(room.operational_status);
    setAmenitiesInput(room.amenities.join(', '));
    setPhotoUrl(room.photos?.[0] || '');
    setInternalNotes(room.internal_notes || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArr = amenitiesInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const photosArr = photoUrl.trim() ? [photoUrl.trim()] : [];

    const numMonthly = monthlyRate !== '' ? Number(monthlyRate) : undefined;
    const numYearly = yearlyRate !== '' ? Number(yearlyRate) : undefined;

    try {
      if (editingRoomId) {
        await PmsService.updateRoom(editingRoomId, {
          room_number: roomNumber,
          name,
          room_type: roomType,
          description,
          capacity_adults: capacityAdults,
          capacity_children: capacityChildren,
          base_rate: baseRate,
          monthly_rate: numMonthly,
          yearly_rate: numYearly,
          operational_status: operationalStatus,
          amenities: amenitiesArr,
          photos: photosArr,
          internal_notes: internalNotes,
        });
        showAdminToast('edit', `Data kamar "${name}" (No. ${roomNumber}) berhasil diperbarui.`);
        setFeedback(`Berhasil Diubah: Kamar "${name}" berhasil diperbarui.`);
      } else {
        await PmsService.createRoom({
          room_number: roomNumber,
          name,
          room_type: roomType,
          description,
          capacity_adults: capacityAdults,
          capacity_children: capacityChildren,
          base_rate: baseRate,
          monthly_rate: numMonthly,
          yearly_rate: numYearly,
          operational_status: operationalStatus,
          amenities: amenitiesArr,
          photos: photosArr,
          internal_notes: internalNotes,
          is_archived: false,
        });
        showAdminToast('add', `Kamar baru No. ${roomNumber} (${name}) berhasil ditambahkan.`);
        setFeedback(`Berhasil Menambahkan: Kamar baru No. ${roomNumber} berhasil ditambahkan.`);
      }
      setShowModal(false);
      loadRooms();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan kamar');
    }
  };

  const handleArchive = async (room: Room) => {
    const actionLabel = room.is_archived ? 'Pulihkan kamar ini agar kembali aktif' : 'Arsipkan kamar ini (tidak akan muncul di website publik)';
    if (!confirm(`${actionLabel}: ${room.name}?`)) return;
    try {
      await PmsService.updateRoom(room.id, { is_archived: !room.is_archived });
      const actionMsg = room.is_archived 
        ? `Kamar No. ${room.room_number} berhasil dipulihkan dari arsip.`
        : `Kamar No. ${room.room_number} berhasil diarsipkan.`;
      showAdminToast('edit', actionMsg);
      setFeedback(`Berhasil Diubah: ${actionMsg}`);
      loadRooms();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status arsip');
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Hapus permanen unit kamar "${room.name}" (No. ${room.room_number})?\n\nPerhatian: Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await PmsService.deleteRoom(room.id);
      showAdminToast('delete', `Kamar No. ${room.room_number} (${room.name}) berhasil dihapus.`);
      setFeedback(`Berhasil Dihapus: Kamar ${room.name} berhasil dihapus.`);
      loadRooms();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kamar');
    }
  };

  const handleQuickStatusChange = async (room: Room, newStatus: RoomOperationalStatus) => {
    try {
      await PmsService.updateRoom(room.id, { operational_status: newStatus });
      showAdminToast('edit', `Status operasional Kamar No. ${room.room_number} diubah menjadi "${newStatus}".`);
      setFeedback(`Berhasil Diubah: Status operasional Kamar No. ${room.room_number} diubah.`);
      loadRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#392B21] tracking-tight">
            Manajemen Kamar & Tarif Multi-Masa Sewa
          </h2>
          <p className="text-xs text-[#756A5F]">
            Kelola unit homestay, tarif Harian, Bulanan, Tahunan, serta status kebersihan & operasional.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#806044] hover:bg-[#6c5037] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Unit Kamar Baru
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-700 font-bold text-xs">&times;</button>
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-xs text-left">
            <thead className="bg-[#FAF7F2] border-b border-[#E5DCD0] text-[#756A5F] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">No. Kamar</th>
                <th className="py-3.5 px-4 font-bold">Nama &amp; Tipe</th>
                <th className="py-3.5 px-4 font-bold">Kapasitas</th>
                <th className="py-3.5 px-4 font-bold text-right">Tarif Harian</th>
                <th className="py-3.5 px-4 font-bold text-right">Tarif Bulanan</th>
                <th className="py-3.5 px-4 font-bold text-center">Status Operasional</th>
                <th className="py-3.5 px-4 font-bold text-center">Status Arsip</th>
                <th className="py-3.5 px-4 font-bold text-right w-40 min-w-[140px] whitespace-nowrap">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCD0]/60">
              {rooms.map((r) => {
                const meta = getRoomOperationalStatusMeta(r.operational_status);
                return (
                  <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#392B21]">
                      {r.room_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-[#392B21] block font-semibold">{r.name}</strong>
                      <span className="text-[11px] text-[#756A5F]">{r.room_type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#756A5F]">
                      {r.capacity_adults} Dws{r.capacity_children > 0 ? `, ${r.capacity_children} Anak` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#392B21]">
                      {formatRupiah(r.base_rate)}/mlm
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#806044]">
                      {r.monthly_rate ? `${formatRupiah(r.monthly_rate)}/bln` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={r.operational_status}
                        onChange={(e) => handleQuickStatusChange(r, e.target.value as RoomOperationalStatus)}
                        className={`text-[11px] font-medium border rounded-md px-2 py-1 ${meta.badgeClass}`}
                      >
                        <option value="tersedia">Tersedia</option>
                        <option value="ditempati">Ditempati</option>
                        <option value="menunggu_dibersihkan">Menunggu Dibersihkan</option>
                        <option value="sedang_dibersihkan">Sedang Dibersihkan</option>
                        <option value="siap_digunakan">Siap Digunakan (Inspected)</option>
                        <option value="dalam_perawatan">Dalam Perawatan</option>
                        <option value="tidak_dijual_sementara">Tidak Dijual Sementara</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {r.is_archived ? (
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-medium">Diarsipkan</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Aktif</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right w-40 min-w-[140px] whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <button
                          onClick={() => openEditModal(r)}
                          title="Edit Kamar"
                          className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-4 h-4 text-[#806044] shrink-0" />
                        </button>
                        <button
                          onClick={() => handleArchive(r)}
                          title={r.is_archived ? 'Pulihkan dari Arsip' : 'Arsipkan Kamar (Sembunyikan dari Publik)'}
                          className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer shadow-2xs ${
                            r.is_archived 
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' 
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <Archive className="w-4 h-4 shrink-0" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          title="Hapus Kamar Permanen"
                          className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E5DCD0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F2]">
              <h3 className="font-serif font-bold text-[#392B21] text-base">
                {editingRoomId ? 'Edit Data Kamar' : 'Tambah Unit Kamar Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 font-bold text-lg">&times;</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#392B21] mb-1">Nomor / Kode Kamar</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 101"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#392B21] mb-1">Nama Kamar</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kamar Melati"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#392B21] mb-1">
                  Tipe Kamar <span className="text-xs font-normal text-stone-500">(Pilihan Utama: REGULER atau VIP)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setRoomType('REGULER')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      roomType.toUpperCase().includes('REGULER')
                        ? 'bg-[#392B21] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    REGULER
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomType('VIP')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      roomType.toUpperCase().includes('VIP')
                        ? 'bg-[#806044] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    VIP
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ketik REGULER atau VIP (atau nama spesifik)"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2] text-xs font-semibold"
                />
              </div>

              {/* 2 Model Sewa Rates (Harian & Bulanan) */}
              <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DCD0] space-y-3">
                <span className="font-bold text-[#806044] block">Pengaturan Tarif Masa Sewa (IDR)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Tarif Harian / Malam *</label>
                    <input
                      type="number"
                      required
                      min="50000"
                      step="5000"
                      value={baseRate}
                      onChange={(e) => setBaseRate(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#E5DCD0] p-2 font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Tarif Bulanan (30 hari)</label>
                    <input
                      type="number"
                      min="500000"
                      step="50000"
                      placeholder="Contoh: 2500000"
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-lg border border-[#E5DCD0] p-2 font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#392B21] mb-1">Kapasitas Dewasa</label>
                  <input
                    type="number"
                    min="1"
                    value={capacityAdults}
                    onChange={(e) => setCapacityAdults(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#392B21] mb-1">Kapasitas Anak</label>
                  <input
                    type="number"
                    min="0"
                    value={capacityChildren}
                    onChange={(e) => setCapacityChildren(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#392B21] mb-1">Deskripsi Kamar</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Deskripsi fasilitas, kenyamanan, dan suasana kamar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#392B21] mb-1">Fasilitas (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="AC Dingin, WiFi Gratis, Kamar Mandi Dalam, Water Heater"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2]"
                />
              </div>

              <div>
                <ImageUploadPicker
                  label="Foto Unit Kamar"
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  folder="rooms"
                  helperText="Format JPG, PNG, WEBP. Klik untuk memilih foto dari komputer/perangkat Anda."
                />
              </div>

              <div>
                <label className="block font-semibold text-[#392B21] mb-1">Catatan Internal Staf (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Dekat tangga lobi utama"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DCD0] p-2.5 bg-[#FAF7F2]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5DCD0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#806044] hover:bg-[#6c5037] text-white font-bold shadow-sm"
                >
                  Simpan Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
