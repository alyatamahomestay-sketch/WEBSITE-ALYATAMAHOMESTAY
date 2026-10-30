'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  FolderOpen, 
  CheckCircle2, 
  X, 
  Loader2, 
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';

interface ImageUploadPickerProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export default function ImageUploadPicker({
  value,
  onChange,
  folder = 'uploads',
  label = 'Foto / Gambar',
  helperText = 'Format JPG, PNG, atau WEBP (Maksimal 10MB)',
  required = false,
}: ImageUploadPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Berkas yang dipilih harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file melebihi batas maksimal 10MB.');
      return;
    }

    setErrorMsg('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/panel/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah foto.');
      }

      onChange(data.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-[#392B21]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden Native File Input (Directly triggers Windows File Explorer) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Primary UI: Direct File Explorer Dropzone / Picker */}
      {!value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-[#806044] bg-[#806044]/10 scale-[1.01]'
              : 'border-[#D9CFC1] hover:border-[#806044] hover:bg-[#FAF7F2] bg-stone-50/60'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#806044]/10 border border-[#806044]/20 flex items-center justify-center text-[#806044]">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <FolderOpen className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-[#392B21]">
                {uploading ? 'Sedang Mengunggah Foto...' : 'Pilih Foto dari File Explorer / Komputer'}
              </p>
              <p className="text-[11px] text-stone-500">
                {uploading
                  ? 'Mohon tunggu beberapa saat...'
                  : 'Klik tombol di bawah atau seret & lepas file foto ke area ini'}
              </p>
            </div>

            <button
              type="button"
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#806044] hover:bg-[#6c5037] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Buka File Explorer</span>
            </button>

            <span className="text-[10px] text-stone-400">
              {helperText}
            </span>
          </div>
        </div>
      ) : (
        /* Image Preview & Change Options */
        <div className="border border-[#E5DCD0] rounded-2xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
              <img
                src={value}
                alt="Pratinjau Foto"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/alyatama-flyer.jpg';
                }}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Foto Berhasil Terpasang</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate" title={value}>
                {value.startsWith('data:') ? 'Tersimpan dalam berkas data gambar' : value}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
                  <span>{uploading ? 'Mengunggah...' : 'Ganti Foto (File Explorer)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error alert if upload fails */}
      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Discrete Toggle for Manual URL Input */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] text-[#806044] hover:underline inline-flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showManualUrl ? 'Sembunyikan Opsi Tautan Manual' : 'Atau masukkan tautan URL gambar secara manual'}</span>
        </button>

        {showManualUrl && (
          <div className="mt-1.5">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... atau /images/nama-file.jpg"
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#806044]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
