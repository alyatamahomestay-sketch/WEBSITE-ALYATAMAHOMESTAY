export type UserRole = 'admin' | 'staff' | 'owner' | 'reception' | 'finance' | 'housekeeping';

export type StaffAccountStatus = 'INVITED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface StaffUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  status: StaffAccountStatus;
  password_hash?: string;
  invited_by?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type ShiftStatus = 'active' | 'ended';

export interface StaffShift {
  id: string;
  staff_user_id: string;
  staff_name_snapshot: string;
  started_at: string;
  ended_at?: string | null;
  status: ShiftStatus;
  date_local: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type RentalType = 'daily' | 'monthly' | 'yearly';

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  roles?: UserRole[];
  created_at: string;
  updated_at: string;
}

export type RoomOperationalStatus = 
  | 'tersedia' 
  | 'ditempati' 
  | 'menunggu_dibersihkan' 
  | 'sedang_dibersihkan' 
  | 'siap_digunakan' 
  | 'dalam_perawatan' 
  | 'tidak_dijual_sementara';

export interface Room {
  id: string;
  room_number: string;
  name: string;
  room_type: string;
  description: string;
  capacity_adults: number;
  capacity_children: number;
  base_rate: number; // Daily rate in IDR
  monthly_rate?: number; // Monthly rate in IDR (optional)
  yearly_rate?: number; // Yearly rate in IDR (optional)
  operational_status: RoomOperationalStatus;
  amenities: string[];
  photos: string[];
  internal_notes?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomRatePeriod {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  rate: number;
  label: string;
  created_at: string;
}

export interface RoomBlock {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
}

export interface Guest {
  id: string;
  full_name: string;
  phone: string;
  normalized_phone: string;
  email?: string | null;
  category: 'regular' | 'vip' | 'corporate' | 'repeat' | 'santri_keluarga';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ReservationStatus = 
  | 'pending_approval' 
  | 'approved_pending_payment' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'rejected' 
  | 'cancelled' 
  | 'expired' 
  | 'no_show';

export type PaymentStatus = 
  | 'unpaid' 
  | 'pending_verification' 
  | 'partially_paid' 
  | 'paid' 
  | 'partially_refunded' 
  | 'refunded';

export interface Reservation {
  id: string;
  reservation_number: string;
  guest_id: string;
  rental_type?: RentalType;
  duration_units?: number;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  payment_status: PaymentStatus;
  special_requests?: string | null;
  expires_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_reason?: string | null;
  cancelled_at?: string | null;
  cancelled_reason?: string | null;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  // V3.1 Staff Attribution & Booking Source
  booking_source?: 'online' | 'walk_in' | 'phone' | 'admin';
  created_by_user_id?: string | null;
  created_by_role?: 'admin' | 'staff' | 'public';
  staff_shift_id?: string | null;
  staff_name_snapshot?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  guest?: Guest;
  rooms?: Room[];
  price_snapshot?: ReservationPriceSnapshot;
  payments?: Payment[];
  deposit?: Deposit;
  whatsapp_consent?: WhatsAppConsent;
}

export interface NightlyRateItem {
  date: string;
  rate: number;
  is_override: boolean;
  label?: string;
}

export interface ReservationPriceSnapshot {
  id: string;
  reservation_id: string;
  rental_type?: RentalType;
  duration_units?: number; // e.g. 2 nights, 1 month, 1 year
  unit_rate?: number; // Rate per night, month, or year
  total_nights: number;
  base_subtotal: number;
  nightly_breakdown: NightlyRateItem[];
  discount_amount: number;
  discount_reason?: string | null;
  promo_code?: string | null;
  promo_snapshot?: any;
  extra_charges: number;
  extra_charges_breakdown?: Array<{ description: string; amount: number }>;
  deposit_required: number;
  total_amount: number;
  total_paid: number;
  balance_due: number;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  applicable_days: string[];
  min_nights: number;
  max_nights?: number | null;
  min_spend: number;
  usage_limit?: number | null;
  used_count: number;
  target_guest_category?: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  qris_image_url?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  reservation_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  proof_image_url?: string | null;
  reference_number?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  reservation_id: string;
  required_amount: number;
  received_amount: number;
  deducted_amount: number;
  refunded_amount: number;
  status: 'pending' | 'received' | 'partially_refunded' | 'fully_refunded' | 'forfeited';
  deduction_reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  expense_number: string;
  category: 'listrik' | 'air' | 'laundry' | 'kebersihan' | 'perbaikan' | 'perlengkapan' | 'administrasi' | 'donasi_dakwah' | 'lainnya';
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  vendor?: string | null;
  receipt_image_url?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payable {
  id: string;
  payable_number: string;
  vendor: string;
  description: string;
  initial_amount: number;
  paid_amount: number;
  due_date: string;
  status: 'unpaid' | 'partially_paid' | 'paid';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Receivable {
  id: string;
  receivable_number: string;
  guest_id: string;
  reservation_id?: string | null;
  description: string;
  initial_amount: number;
  paid_amount: number;
  due_date: string;
  status: 'unpaid' | 'partially_paid' | 'paid';
  notes?: string | null;
  created_at: string;
  updated_at: string;
  guest?: Guest;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'amenities' | 'linen' | 'pembersih' | 'snack_minuman' | 'elektronik' | 'perlengkapan_kamar';
  current_stock: number;
  unit: string;
  min_stock_alert: number;
  storage_location?: string | null;
  condition: string;
  purchase_price?: number | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
}

export interface MaintenanceTicket {
  id: string;
  ticket_number: string;
  room_id?: string | null;
  issue_type: string;
  description: string;
  priority: 'rendah' | 'sedang' | 'tinggi' | 'darurat';
  affects_room_availability: boolean;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  status: 'dilaporkan' | 'ditinjau' | 'dikerjakan' | 'menunggu_sparepart' | 'selesai' | 'dibatalkan';
  photo_url?: string | null;
  reported_by?: string | null;
  assigned_to?: string | null;
  resolved_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export interface HousekeepingTask {
  id: string;
  room_id: string;
  task_type: 'pembersihan_rutin' | 'pembersihan_checkout' | 'deep_cleaning' | 'pergantian_linen';
  status: 'menunggu' | 'sedang_dikerjakan' | 'selesai' | 'dibatalkan';
  assigned_to?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  damage_reported: boolean;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export interface WhatsAppConsent {
  id: string;
  reservation_id: string;
  phone: string;
  has_consented: boolean;
  consent_timestamp: string;
  ip_address?: string | null;
  created_at: string;
}

export interface MessageActivity {
  id: string;
  reservation_id: string;
  phone: string;
  prepared_by?: string | null;
  prepared_at: string;
  message_preview: string;
  is_marked_sent: boolean;
  marked_sent_at?: string | null;
  notes?: string | null;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_name: string;
  entity_id?: string | null;
  details?: any;
  ip_address?: string | null;
  created_at: string;
  actor?: UserProfile;
}

export interface PropertySettings {
  id: string;
  name: string;
  category: string;
  tagline: string;
  secondary_tagline: string;
  mission_quote: string;
  description: string;
  announcement_banner?: string | null;
  is_announcement_active?: boolean;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  landmark: string;
  google_maps_url: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  checkin_time: string;
  checkout_time: string;
  currency: string;
  timezone: string;
  syariah_policy: string;
  booking_policy: string;
  cancellation_policy: string;
  pending_expiration_hours: number;
  created_at: string;
  updated_at: string;
}

export type AdCategory = 
  | 'brosur_flyer' 
  | 'kamar_fasilitas' 
  | 'kegiatan_dakwah' 
  | 'promo_khusus' 
  | 'flyer' 
  | 'room' 
  | 'facility' 
  | 'activity' 
  | 'promo';

export interface AdvertisementPhoto {
  id: string;
  title: string;
  category: AdCategory;
  image_url: string;
  description?: string | null;
  badge?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
