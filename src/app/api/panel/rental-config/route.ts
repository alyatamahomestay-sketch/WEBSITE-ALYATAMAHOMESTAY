import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SectionConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  regulerBadge: string;
  regulerTitle: string;
  regulerDescription: string;
  regulerFacilities: string[];
  regulerDailyRate?: number;
  regulerMonthlyRate?: number;
  vipBadge: string;
  vipTagline: string;
  vipTitle: string;
  vipDescription: string;
  vipFacilities: string[];
  vipDailyRate?: number;
  vipMonthlyRate?: number;
}

const DEFAULT_CONFIG: SectionConfig = {
  sectionTitle: 'Pilihan Kamar REGULER & VIP',
  sectionSubtitle: 'Tersedia 2 kategori pilihan kamar dengan opsi masa sewa Harian dan Bulanan. Rincian tarif transparan dan otomatis mengikuti harga resmi yang ditentukan manajemen.',
  regulerBadge: 'Tipe Kamar Reguler',
  regulerTitle: 'Kamar Syariah Tipe REGULER',
  regulerDescription: 'Pilihan tepat untuk istirahat tenang, bersih, dan hemat. Cocok untuk pelancong muslim, transit keluarga, santri, atau penugasan kerja singkat di Bangkinang Kota.',
  regulerFacilities: [
    'Pendingin Ruangan (AC Sejuk)',
    'Wi-Fi Gratis Berkecepatan Tinggi',
    'Kamar Mandi Dalam Bersih & Higienis',
    'Kasur Empuk Standar Syariah',
    'Area Tenang & Bebas Rokok / Maksiat',
    'Aman & Privasi Terjaga 24 Jam'
  ],
  regulerDailyRate: 150000,
  regulerMonthlyRate: 1500000,
  vipBadge: 'Tipe Kamar VIP',
  vipTagline: 'Kenyamanan Eksklusif',
  vipTitle: 'Kamar Syariah Tipe VIP',
  vipDescription: 'Kamar eksklusif berukuran lebih luas dengan fasilitas premium, Smart TV, Water Heater, dan tata ruang elegan untuk kenyamanan istirahat maksimal Anda.',
  vipFacilities: [
    'Semua Fasilitas Kamar Tipe Reguler',
    'Water Heater (Air Hangat Nyaman)',
    'Smart TV Hiburan Islami & Digital',
    'Ruang Kamar Lebih Luas & Meja Kerja',
    'Layanan Kebersihan Berkala',
    'Akses Cepat & Parkir Lebih Luas'
  ],
  vipDailyRate: 200000,
  vipMonthlyRate: 3000000
};

// In-memory server cache
let serverConfig: SectionConfig = { ...DEFAULT_CONFIG };

// Local file storage path
const CONFIG_FILE_PATH = path.join(process.cwd(), '.rental-config.json');

function loadConfigFromFile(): SectionConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        serverConfig = { ...DEFAULT_CONFIG, ...parsed };
        return serverConfig;
      }
    }
  } catch (e) {}
  return serverConfig;
}

function saveConfigToFile(config: SectionConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {}
}

// Initial load
loadConfigFromFile();

export async function GET() {
  try {
    const config = loadConfigFromFile();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newConfig: SectionConfig = {
      ...serverConfig,
      ...(body.config || body)
    };
    serverConfig = newConfig;
    saveConfigToFile(newConfig);
    return NextResponse.json({ success: true, config: newConfig });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
