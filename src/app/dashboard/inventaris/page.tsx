'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle2, Search, Plus } from 'lucide-react';
import { PmsService } from '@/lib/services/pms-service';
import { InventoryItem } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';

export default function InventarisPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await PmsService.getInventoryItems();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const lowStockItems = items.filter((item) => item.current_stock <= item.min_stock_alert);

  const filtered = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Inventaris & Stok Perlengkapan
        </h2>
        <p className="text-xs text-stone-500">
          Monitoring ketersediaan linen, sabun, amenities, dan perlengkapan operasional homestay.
        </p>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="font-semibold block">Peringatan Stok Menipis!</strong>
            Ada {lowStockItems.length} item berada di bawah atau menyentuh batas minimum stok ({lowStockItems.map((i) => i.name).join(', ')}).
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <input
            type="text"
            placeholder="Cari barang atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-xs text-stone-500">
            Total {items.length} master barang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Nama Barang</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold text-center">Stok Saat Ini</th>
                <th className="py-3 px-4 font-semibold text-center">Batas Minimum</th>
                <th className="py-3 px-4 font-semibold">Lokasi Gudang</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => {
                const isLow = item.current_stock <= item.min_stock_alert;
                return (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-stone-600">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-stone-900">
                      {item.current_stock} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center text-stone-500">
                      {item.min_stock_alert} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {item.storage_location || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                          Perlu Restok
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Aman
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
