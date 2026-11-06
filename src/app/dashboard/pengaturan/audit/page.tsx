'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Search, Clock, FileText, RotateCcw, ShieldAlert, AlertTriangle } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { AuditLog } from '@/lib/types';
import { formatDateTimeIndo } from '@/lib/formatters';
import ResetTransactionsModal from '@/components/panel/ResetTransactionsModal';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await PmsService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || l.entity_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Audit Log & Riwayat Keamanan Sistem
        </h2>
        <p className="text-xs text-stone-500">
          Catatan riwayat perubahan data krusial, persetujuan reservasi, dan aktivitas keuangan yang bersifat permanen (read-only).
        </p>
      </div>

      {/* Zona Tindakan Krusial: Reset Transaksi */}
      <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Zona Pengaturan Krusial &bull; Hak Akses Administrator</span>
          </div>
          <h3 className="text-sm font-bold text-stone-900">
            Reset Seluruh Data Transaksi (Reservasi & Pembayaran)
          </h3>
          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Hapus seluruh data transaksi pemesanan, pembayaran, dan log reservasi dari database Supabase secara permanen. Diperlukan otentikasi ID dan kata sandi admin terkait Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Seluruh Transaksi</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <input
            type="text"
            placeholder="Filter aktivitas atau entitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-xs text-stone-500">
            Total {logs.length} jejak audit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Waktu Pencatatan</th>
                <th className="py-3 px-4 font-semibold">Tindakan (Action)</th>
                <th className="py-3 px-4 font-semibold">Entitas</th>
                <th className="py-3 px-4 font-semibold">ID Entitas</th>
                <th className="py-3 px-4 font-semibold">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-sans text-stone-600">
                    {formatDateTimeIndo(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-stone-100 text-stone-900 font-semibold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 capitalize">
                    {log.entity_name}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 text-[11px] truncate max-w-xs">
                    {log.entity_id || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 font-sans text-[11px] max-w-sm truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ResetTransactionsModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
