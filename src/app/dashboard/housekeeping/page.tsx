'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, Play, Check } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { HousekeepingTask } from '@/lib/types';
import { formatDateTimeIndo } from '@/lib/formatters';
import { showAdminToast } from '@/components/common/AdminToast';

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await PmsService.getHousekeepingTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: HousekeepingTask['status']) => {
    try {
      await PmsService.updateHousekeepingStatus(taskId, newStatus);
      showAdminToast('edit', `Status kebersihan berhasil diperbarui menjadi ${newStatus}.`);
      setFeedback(`Status kebersihan berhasil diperbarui menjadi ${newStatus}.`);
      loadTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Manajemen Kebersihan Kamar (Housekeeping)
        </h2>
        <p className="text-xs text-stone-500">
          Penugasan pembersihan harian, sterilisasi pasca check-out, dan inspeksi kesiapan kamar.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="font-bold">&times;</button>
        </div>
      )}

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-5 rounded-2xl border bg-white shadow-sm space-y-4 ${
              task.status === 'selesai'
                ? 'border-emerald-200'
                : task.status === 'sedang_dikerjakan'
                ? 'border-blue-300 ring-1 ring-blue-300'
                : 'border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-800">
                No. {task.room?.room_number || '-'}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                  task.status === 'selesai'
                    ? 'bg-emerald-100 text-emerald-800'
                    : task.status === 'sedang_dikerjakan'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {task.status}
              </span>
            </div>

            <div>
              <strong className="text-sm font-semibold text-stone-900 block">
                {task.room?.name || 'Unit Kamar'}
              </strong>
              <span className="text-[11px] text-stone-500 capitalize">
                Jenis: {task.task_type.replace('_', ' ')}
              </span>
            </div>

            {task.notes && (
              <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                {task.notes}
              </p>
            )}

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
              {task.status === 'menunggu' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'sedang_dikerjakan')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Mulai Bersihkan
                </button>
              )}

              {task.status === 'sedang_dikerjakan' && (
                <button
                  onClick={() => handleUpdateStatus(task.id, 'selesai')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Tandai Selesai & Bersih
                </button>
              )}

              {task.status === 'selesai' && (
                <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Inspeksi selesai ({formatDateTimeIndo(task.completed_at || task.updated_at)})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
