'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  ShieldCheck, 
  Clock, 
  KeyRound, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  UserX,
  Lock,
  Mail,
  User,
  History
} from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { StaffUser, StaffShift, StaffAccountStatus } from '@/lib/types';
import { formatDateIndo } from '@/lib/formatters';

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [shiftList, setShiftList] = useState<StaffShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [status, setStatus] = useState<StaffAccountStatus>('ACTIVE');
  const [pinPassword, setPinPassword] = useState('1234');

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, shifts] = await Promise.all([
        PmsService.getStaffUsers(),
        PmsService.getStaffShifts(),
      ]);
      setStaffList(users);
      setShiftList(shifts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setRole('staff');
    setStatus('ACTIVE');
    setPinPassword('1234');
    setShowModal(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUserId(user.id);
    setFullName(user.full_name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setPinPassword(user.password_hash || '1234');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !email.trim()) {
      alert('Mohon lengkapi Nama Lengkap, Username, dan Email staf.');
      return;
    }

    try {
      if (editingUserId) {
        await PmsService.updateStaffUser(editingUserId, {
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          role,
          status,
          password_hash: pinPassword.trim(),
        });
        setFeedback(`Akun staf "${fullName}" berhasil diperbarui.`);
      } else {
        await PmsService.createStaffUser({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          role,
          status,
          password_hash: pinPassword.trim(),
          invited_by: 'admin-panel',
          last_login_at: null,
        });
        setFeedback(`Akun staf baru "${fullName}" berhasil didaftarkan.`);
      }

      setShowModal(false);
      await loadData();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data staf');
    }
  };

  const handleStatusChange = async (user: StaffUser, newStatus: StaffAccountStatus) => {
    try {
      await PmsService.updateStaffStatus(user.id, newStatus);
      await loadData();
      setFeedback(`Status akun "${user.full_name}" diubah menjadi ${newStatus}.`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err?.message || err}`);
    }
  };

  const getStatusBadge = (st: StaffAccountStatus) => {
    switch (st) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'INVITED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'INACTIVE':
        return 'bg-stone-200 text-stone-700 border-stone-300';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#355C46]/10 text-[#355C46] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kontrol Eksklusif Administrator (V3.1)</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Manajemen Akun Staf & Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Sistem tertutup tanpa registrasi publik. Hanya Administrator yang berwenang menambah, mengaktifkan, menonaktifkan, atau mereset password staf homestay.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-[#355C46] hover:bg-[#284635] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah / Undang Staf Baru</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#355C46]" />
            <span>Daftar Akun Pengelola & Staf Terdaftar ({staffList.length})</span>
          </h3>
          <span className="text-xs text-stone-500">Status Otorisasi Terkunci</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FAF7F2] text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                <th className="py-3 px-4 font-semibold">Username / Email</th>
                <th className="py-3 px-4 font-semibold">Peran</th>
                <th className="py-3 px-4 font-semibold">Status Akun</th>
                <th className="py-3 px-4 font-semibold">Login Terakhir</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staffList.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-stone-900">
                    {user.full_name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-stone-800">{user.username}</div>
                    <div className="text-[11px] text-stone-400">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.role === 'admin'
                        ? 'bg-[#355C46] text-white'
                        : 'bg-[#806044] text-white'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-500 text-[11px]">
                    {user.last_login_at 
                      ? new Date(user.last_login_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
                      : 'Belum pernah login'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user, e.target.value as StaffAccountStatus)}
                        className="text-[11px] bg-stone-100 border border-stone-300 rounded px-2 py-1 text-stone-700"
                        title="Ubah status akun"
                      >
                        <option value="ACTIVE">ACTIVE (Boleh Login)</option>
                        <option value="INACTIVE">INACTIVE (Nonaktif)</option>
                        <option value="SUSPENDED">SUSPENDED (Ditangguhkan)</option>
                        <option value="INVITED">INVITED (Undangan)</option>
                      </select>

                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition"
                        title="Edit Data / Reset Password"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Shift History Table */}
      <div className="bg-white rounded-2xl border border-[#E5DCD0] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#806044]" />
            <span>Riwayat Shift Staf & Bukti Kehadiran ({shiftList.length})</span>
          </h3>
          <span className="text-xs text-stone-500">Mencatat Timestamp & Snapshot Nama</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FAF7F2] text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Petugas (Snapshot)</th>
                <th className="py-3 px-4 font-semibold">Tanggal Shift</th>
                <th className="py-3 px-4 font-semibold">Waktu Mulai</th>
                <th className="py-3 px-4 font-semibold">Waktu Selesai</th>
                <th className="py-3 px-4 font-semibold">Status Shift</th>
                <th className="py-3 px-4 font-semibold">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {shiftList.map((shift) => (
                <tr key={shift.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-stone-900">
                    {shift.staff_name_snapshot}
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600">
                    {shift.date_local}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {new Date(shift.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {shift.ended_at 
                      ? `${new Date(shift.ended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                      : <span className="text-emerald-700 font-semibold animate-pulse">Sedang Berlangsung</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      shift.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {shift.status === 'active' ? 'Aktif Bertugas' : 'Selesai'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-500 italic">
                    {shift.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Staff */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900">
                {editingUserId ? 'Edit Akun Staf' : 'Tambah Akun Staf Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap Staf *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Rahmat Hidayat"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Username Unik *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rahmat"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Peran (Role) *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                  >
                    <option value="staff">STAFF (Operasional)</option>
                    <option value="admin">ADMIN (Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Staf *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahmat@alyatamahomestay.com"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">PIN / Password Akses *</label>
                  <input
                    type="text"
                    required
                    value={pinPassword}
                    onChange={(e) => setPinPassword(e.target.value)}
                    placeholder="Min 4 karakter"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Akun</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StaffAccountStatus)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#355C46]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INVITED">INVITED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#355C46] hover:bg-[#284635] text-white font-semibold shadow-xs"
                >
                  {editingUserId ? 'Simpan Perubahan' : 'Buat Akun Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
