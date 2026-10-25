'use client';

import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Plus, 
  Edit, 
  Archive, 
  Users, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  DollarSign,
  AlertCircle 
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { Room, RoomOperationalStatus } from '@/lib/types';
import { formatRupiah, getRoomOperationalStatusMeta } from '@/lib/formatters';

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
  const [operationalStatus, setOperationalStatus] = useState<RoomOperationalStatus>('tersedia');
  const [amenitiesInput, setAmenitiesInput] = useState('AC Dingin, WiFi Berkecepatan Tinggi, Kamar Mandi Dalam, Water Heater');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80');
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
    setRoomType('Standard Queen');
    setDescription('');
    setCapacityAdults(2);
    setCapacityChildren(1);
    setBaseRate(250000);
    setOperationalStatus('tersedia');
    setAmenitiesInput('AC Dingin, WiFi Berkecepatan Tinggi, Kamar Mandi Dalam, Water Heater');
    setPhotoUrl('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80');
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
          operational_status: operationalStatus,
          amenities: amenitiesArr,
          photos: photosArr,
          internal_notes: internalNotes,
        });
        setFeedback(`Kamar ${name} berhasil diperbarui.`);
      } else {
        await PmsService.createRoom({
          room_number: roomNumber,
          name,
          room_type: roomType,
          description,
          capacity_adults: capacityAdults,
          capacity_children: capacityChildren,
          base_rate: baseRate,
          operational_status: operationalStatus,
          amenities: amenitiesArr,
          photos: photosArr,
          internal_notes: internalNotes,
          is_archived: false,
        });
        setFeedback(`Kamar baru No. ${roomNumber} berhasil ditambahkan.`);
      }
      setShowModal(false);
      loadRooms();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan kamar');
    }
  };

  const handleArchive = async (room: Room) => {
    if (!confirm(`Arsipkan kamar ${room.name}? Kamar tidak akan ditampilkan di website publik.`)) return;
    try {
      await PmsService.updateRoom(room.id, { is_archived: !room.is_archived });
      setFeedback(`Status arsip kamar ${room.name} diperbarui.`);
      loadRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleQuickStatusChange = async (room: Room, newStatus: RoomOperationalStatus) => {
    try {
      await PmsService.updateRoom(room.id, { operational_status: newStatus });
      loadRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Manajemen Kamar & Tarif
          </h2>
          <p className="text-xs text-stone-500">
            Kelola unit fisik homestay, penyesuaian tarif, fasilitas, dan status operasional kamar.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Unit Kamar Baru
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Kamar</th>
                <th className="py-3 px-4 font-semibold">Nama & Tipe</th>
                <th className="py-3 px-4 font-semibold">Kapasitas</th>
                <th className="py-3 px-4 font-semibold text-right">Tarif Dasar / Malam</th>
                <th className="py-3 px-4 font-semibold text-center">Status Operasional</th>
                <th className="py-3 px-4 font-semibold text-center">Arsip</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rooms.map((r) => {
                const meta = getRoomOperationalStatusMeta(r.operational_status);
                return (
                  <tr key={r.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {r.room_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-stone-900 block">{r.name}</strong>
                      <span className="text-[11px] text-stone-500">{r.room_type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {r.capacity_adults} Dws{r.capacity_children > 0 ? `, ${r.capacity_children} Anak` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-stone-900">
                      {formatRupiah(r.base_rate)}
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
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(r)}
                          title="Edit Kamar"
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchive(r)}
                          title={r.is_archived ? 'Pulihkan dari Arsip' : 'Arsipkan Kamar'}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                        >
                          <Archive className="w-3.5 h-3.5" />
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

      {/* Add / Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900 text-sm">
                {editingRoomId ? 'Edit Data Kamar' : 'Tambah Unit Kamar Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor / Kode Kamar</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 101"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nama Kamar</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kamar Melati"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tipe Kamar</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Standard Queen"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tarif Dasar / Malam (Rp)</label>
                  <input
                    type="number"
                    required
                    min="50000"
                    step="5000"
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kapasitas Dewasa</label>
                  <input
                    type="number"
                    min="1"
                    value={capacityAdults}
                    onChange={(e) => setCapacityAdults(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kapasitas Anak</label>
                  <input
                    type="number"
                    min="0"
                    value={capacityChildren}
                    onChange={(e) => setCapacityChildren(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Deskripsi Kamar</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Deskripsi fasilitas, kenyamanan, dan suasana kamar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Fasilitas (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="AC, WiFi, Water Heater, Smart TV"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL Foto Kamar (Supabase Storage atau Web)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan Internal Staf (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Dekat tangga lobi"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium"
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
