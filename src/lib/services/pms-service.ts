import { 
  Room, 
  Reservation, 
  Promotion, 
  PaymentMethod, 
  Expense, 
  HousekeepingTask, 
  MaintenanceTicket, 
  InventoryItem, 
  PropertySettings,
  Payment,
  Deposit,
  AuditLog,
  AdvertisementPhoto,
  StaffUser,
  StaffShift,
  StaffAccountStatus
} from '../types';
import { 
  INITIAL_ROOMS, 
  INITIAL_RESERVATIONS, 
  INITIAL_PROMOTIONS, 
  INITIAL_PAYMENT_METHODS, 
  INITIAL_EXPENSES, 
  INITIAL_HOUSEKEEPING, 
  INITIAL_MAINTENANCE, 
  INITIAL_INVENTORY, 
  INITIAL_PROPERTY_SETTINGS,
  INITIAL_AD_PHOTOS,
  INITIAL_STAFF_USERS,
  INITIAL_STAFF_SHIFTS
} from '../mock-fallback';
import { isSupabaseConfigured } from '../supabase/check-env';
import { createClient } from '../supabase/client';

// Global memory state for interactive preview when Supabase env is not yet entered
let memRooms: Room[] = [...INITIAL_ROOMS];
let memReservations: Reservation[] = [...INITIAL_RESERVATIONS];
let memPromotions: Promotion[] = [...INITIAL_PROMOTIONS];
let memPaymentMethods: PaymentMethod[] = [...INITIAL_PAYMENT_METHODS];
let memExpenses: Expense[] = [...INITIAL_EXPENSES];
let memHousekeeping: HousekeepingTask[] = [...INITIAL_HOUSEKEEPING];
let memMaintenance: MaintenanceTicket[] = [...INITIAL_MAINTENANCE];
let memInventory: InventoryItem[] = [...INITIAL_INVENTORY];
let memProperty: PropertySettings = { ...INITIAL_PROPERTY_SETTINGS };
let memAdPhotos: AdvertisementPhoto[] = [...INITIAL_AD_PHOTOS];
let memStaffUsers: StaffUser[] = [...INITIAL_STAFF_USERS];

function syncMemPropertyToStorage(property: PropertySettings) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('alyatama_property_settings', JSON.stringify(property));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }
}

function loadMemPropertyFromStorage(): PropertySettings | null {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('alyatama_property_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
}

function syncMemRoomsToStorage(rooms: Room[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('alyatama_rooms_data', JSON.stringify(rooms));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }
}

function loadMemRoomsFromStorage(): Room[] | null {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('alyatama_rooms_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }
  return null;
}

function syncMemReservationsToStorage(reservations: Reservation[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('alyatama_reservations_data', JSON.stringify(reservations));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }
}

function loadMemReservationsFromStorage(): Reservation[] | null {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('alyatama_reservations_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }
  return null;
}

function syncMemStaffUsersToStorage(users: StaffUser[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('alyatama_staff_users_data', JSON.stringify(users));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }
}

function loadMemStaffUsersFromStorage(): StaffUser[] | null {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('alyatama_staff_users_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
  }
  return null;
}
let memStaffShifts: StaffShift[] = [...INITIAL_STAFF_SHIFTS];
let memAuditLogs: AuditLog[] = [
  {
    id: 'aud-1',
    action: 'SYSTEM_INIT',
    entity_name: 'properties',
    entity_id: 'a0000000-0000-0000-0000-000000000001',
    details: { message: 'Inisialisasi sistem ALYATAMA HOMESTAY berhasil.' },
    created_at: new Date().toISOString(),
  }
];

export const PmsService = {
  // --- PROPERTIES ---
  async getPropertySettings(): Promise<PropertySettings> {
    const fromStorage = loadMemPropertyFromStorage();
    if (fromStorage) {
      memProperty = fromStorage;
      return memProperty;
    }
    if (!isSupabaseConfigured()) {
      syncMemPropertyToStorage(memProperty);
      return memProperty;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('properties').select('*').limit(1).single();
    if (error || !data) {
      syncMemPropertyToStorage(memProperty);
      return memProperty;
    }
    memProperty = data as PropertySettings;
    syncMemPropertyToStorage(memProperty);
    return memProperty;
  },

  async updatePropertySettings(updates: Partial<PropertySettings>): Promise<PropertySettings> {
    memProperty = { ...memProperty, ...updates, updated_at: new Date().toISOString() };
    syncMemPropertyToStorage(memProperty);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', memProperty.id)
        .select()
        .single();
      if (!error && data) {
        memProperty = data as PropertySettings;
        syncMemPropertyToStorage(memProperty);
      }
    }
    return memProperty;
  },

  // --- ROOMS ---
  async getRooms(includeArchived = false): Promise<Room[]> {
    const fromStorage = loadMemRoomsFromStorage();
    if (fromStorage && fromStorage.length > 0) {
      memRooms = fromStorage;
      return includeArchived ? memRooms : memRooms.filter(r => !r.is_archived);
    }
    if (!isSupabaseConfigured()) {
      syncMemRoomsToStorage(memRooms);
      return includeArchived ? memRooms : memRooms.filter(r => !r.is_archived);
    }
    const supabase = createClient();
    let query = supabase.from('rooms').select('*').order('room_number', { ascending: true });
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      syncMemRoomsToStorage(memRooms);
      return memRooms.filter(r => includeArchived || !r.is_archived);
    }
    memRooms = data as Room[];
    syncMemRoomsToStorage(memRooms);
    return includeArchived ? memRooms : memRooms.filter(r => !r.is_archived);
  },

  async getRoomById(id: string): Promise<Room | null> {
    const rooms = await this.getRooms(true);
    return rooms.find(r => r.id === id) || null;
  },

  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const newRoom: Room = {
      ...room,
      id: 'room-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memRooms = [...memRooms, newRoom];
    syncMemRoomsToStorage(memRooms);

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/panel/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', room }),
        });
        const json = await res.json();
        if (json.success && json.room) {
          const idx = memRooms.findIndex(r => r.id === newRoom.id);
          if (idx !== -1) memRooms[idx] = json.room;
          syncMemRoomsToStorage(memRooms);
          return json.room;
        }
      } catch (err: any) {}
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('rooms').insert([room]).select().single();
      if (!error && data) {
        const idx = memRooms.findIndex(r => r.id === newRoom.id);
        if (idx !== -1) memRooms[idx] = data as Room;
        syncMemRoomsToStorage(memRooms);
        return data as Room;
      }
    }
    return newRoom;
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const idx = memRooms.findIndex(r => r.id === id);
    if (idx !== -1) {
      memRooms[idx] = { ...memRooms[idx], ...updates, updated_at: new Date().toISOString() };
      syncMemRoomsToStorage(memRooms);
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/panel/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', id, updates }),
        });
        const json = await res.json();
        if (json.success && json.room) {
          if (idx !== -1) memRooms[idx] = json.room;
          syncMemRoomsToStorage(memRooms);
          return json.room;
        }
      } catch (err: any) {}
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('rooms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        if (idx !== -1) memRooms[idx] = data as Room;
        syncMemRoomsToStorage(memRooms);
        return data as Room;
      }
    }

    if (idx !== -1) return memRooms[idx];
    throw new Error('Kamar tidak ditemukan');
  },

  async deleteRoom(id: string): Promise<{ success: boolean; message: string }> {
    const idx = memRooms.findIndex(r => r.id === id);
    if (idx !== -1) {
      memRooms.splice(idx, 1);
      syncMemRoomsToStorage(memRooms);
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/panel/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id }),
        });
        const json = await res.json();
        if (json.success) return json;
      } catch (err: any) {}
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from('rooms').delete().eq('id', id);
    }
    return { success: true, message: 'Kamar berhasil dihapus' };
  },

  // --- RESERVATIONS ---
  async getReservations(statusFilter?: string): Promise<Reservation[]> {
    const fromStorage = loadMemReservationsFromStorage();
    if (fromStorage && fromStorage.length > 0) {
      memReservations = fromStorage;
    }

    if (!isSupabaseConfigured()) {
      syncMemReservationsToStorage(memReservations);
      if (statusFilter && statusFilter !== 'all') {
        return memReservations.filter(r => r.status === statusFilter);
      }
      return memReservations;
    }
    const supabase = createClient();
    let query = supabase
      .from('reservations')
      .select(`
        *,
        guest:guests(*),
        rooms:reservation_rooms(room:rooms(*)),
        price_snapshot:reservation_price_snapshots(*),
        payments:payments(*),
        deposit:deposits(*),
        whatsapp_consent:whatsapp_consents(*)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      syncMemReservationsToStorage(memReservations);
      if (statusFilter && statusFilter !== 'all') {
        return memReservations.filter(r => r.status === statusFilter);
      }
      return memReservations;
    }
    memReservations = data as unknown as Reservation[];
    syncMemReservationsToStorage(memReservations);
    return memReservations;
    if (error) {
      if (statusFilter && statusFilter !== 'all') {
        return memReservations.filter(r => r.status === statusFilter);
      }
      return memReservations;
    }
    return data as unknown as Reservation[];
  },

  async getReservationById(id: string): Promise<Reservation | null> {
    if (!isSupabaseConfigured()) {
      return memReservations.find(r => r.id === id || r.reservation_number === id) || null;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:guests(*),
        rooms:reservation_rooms(room:rooms(*)),
        price_snapshot:reservation_price_snapshots(*),
        payments:payments(*),
        deposit:deposits(*),
        whatsapp_consent:whatsapp_consents(*)
      `)
      .or(`id.eq.${id},reservation_number.eq.${id}`)
      .single();

    if (error) {
      return memReservations.find(r => r.id === id || r.reservation_number === id) || null;
    }
    return data as unknown as Reservation;
  },

  async approveReservation(reservationId: string, adminId?: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      const res = memReservations.find(r => r.id === reservationId);
      if (!res) return { success: false, message: 'Reservasi tidak ditemukan' };
      res.status = 'approved_pending_payment';
      res.approved_at = new Date().toISOString();
      res.approved_by = adminId || 'admin-demo';
      res.updated_at = new Date().toISOString();
      syncMemReservationsToStorage(memReservations);
      return { success: true, message: 'Reservasi berhasil disetujui (Menunggu Pembayaran / DP).' };
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc('approve_reservation_atomic', {
      p_reservation_id: reservationId,
      p_admin_id: adminId || null,
      p_target_status: 'approved_pending_payment'
    });

    if (error) return { success: false, message: error.message };
    const rIdx = memReservations.findIndex(r => r.id === reservationId);
    if (rIdx !== -1) {
      memReservations[rIdx].status = 'approved_pending_payment';
      syncMemReservationsToStorage(memReservations);
    }
    return { success: true, message: 'Reservasi disetujui secara aman dan atomik.' };
  },

  async rejectReservation(reservationId: string, reason: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      const res = memReservations.find(r => r.id === reservationId);
      if (!res) return { success: false, message: 'Reservasi tidak ditemukan' };
      res.status = 'rejected';
      res.rejected_at = new Date().toISOString();
      res.rejected_reason = reason;
      res.updated_at = new Date().toISOString();
      syncMemReservationsToStorage(memReservations);
      return { success: true, message: 'Reservasi ditolak.' };
    }
    const supabase = createClient();
    const { error } = await supabase
      .from('reservations')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservationId);
    if (error) return { success: false, message: error.message };
    const rIdx = memReservations.findIndex(r => r.id === reservationId);
    if (rIdx !== -1) {
      memReservations[rIdx].status = 'rejected';
      syncMemReservationsToStorage(memReservations);
    }
    return { success: true, message: 'Reservasi ditolak.' };
  },

  async updateReservationStatus(
    reservationId: string, 
    newStatus: Reservation['status'], 
    opts?: { checkedInAt?: string; checkedOutAt?: string }
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      const res = memReservations.find(r => r.id === reservationId);
      if (!res) return { success: false, message: 'Reservasi tidak ditemukan' };
      res.status = newStatus;
      if (newStatus === 'checked_in') res.checked_in_at = opts?.checkedInAt || new Date().toISOString();
      if (newStatus === 'checked_out') res.checked_out_at = opts?.checkedOutAt || new Date().toISOString();
      res.updated_at = new Date().toISOString();
      syncMemReservationsToStorage(memReservations);
      return { success: true, message: `Status reservasi berhasil diubah ke ${newStatus}.` };
    }
    const supabase = createClient();
    const payload: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === 'checked_in') payload.checked_in_at = opts?.checkedInAt || new Date().toISOString();
    if (newStatus === 'checked_out') payload.checked_out_at = opts?.checkedOutAt || new Date().toISOString();

    const { error } = await supabase.from('reservations').update(payload).eq('id', reservationId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Status diperbarui ke ${newStatus}.` };
  },

  async addPayment(paymentData: {
    reservationId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    referenceNumber?: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      const res = memReservations.find(r => r.id === paymentData.reservationId);
      if (!res) return { success: false, message: 'Reservasi tidak ditemukan' };
      const newPay: Payment = {
        id: 'pay-' + Date.now(),
        payment_number: 'PAY-' + Date.now(),
        reservation_id: paymentData.reservationId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        payment_date: new Date().toISOString(),
        status: 'verified',
        reference_number: paymentData.referenceNumber,
        notes: paymentData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!res.payments) res.payments = [];
      res.payments.push(newPay);

      // Recalculate price snapshot
      if (res.price_snapshot) {
        res.price_snapshot.total_paid += paymentData.amount;
        res.price_snapshot.balance_due = Math.max(0, res.price_snapshot.total_amount - res.price_snapshot.total_paid);
        if (res.price_snapshot.balance_due === 0) {
          res.payment_status = 'paid';
          if (res.status === 'approved_pending_payment') {
            res.status = 'confirmed';
          }
        } else {
          res.payment_status = 'partially_paid';
        }
      }
      return { success: true, message: 'Pembayaran berhasil dicatat & saldo tagihan diperbarui.' };
    }

    const supabase = createClient();
    const { error } = await supabase.from('payments').insert([{
      payment_number: 'PAY-' + Date.now(),
      reservation_id: paymentData.reservationId,
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod,
      notes: paymentData.notes,
      reference_number: paymentData.referenceNumber,
      status: 'verified',
    }]);

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Pembayaran berhasil disimpan ke database.' };
  },

  // --- PROMOTIONS ---
  async getPromotions(): Promise<Promotion[]> {
    if (!isSupabaseConfigured()) return memPromotions;
    const supabase = createClient();
    const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (error) return memPromotions;
    return data as Promotion[];
  },

  async createPromotion(promo: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'used_count'>): Promise<Promotion> {
    const newPromo: Promotion = {
      ...promo,
      id: 'promo-' + Date.now(),
      used_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured()) {
      memPromotions.unshift(newPromo);
      return newPromo;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('promotions').insert([promo]).select().single();
    if (error) throw new Error(error.message);
    return data as Promotion;
  },

  async togglePromotionActive(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const p = memPromotions.find(item => item.id === id);
      if (p) p.is_active = !p.is_active;
      return p ? p.is_active : false;
    }
    const p = memPromotions.find(item => item.id === id);
    const newStatus = p ? !p.is_active : true;
    const supabase = createClient();
    await supabase.from('promotions').update({ is_active: newStatus }).eq('id', id);
    return newStatus;
  },

  // --- PAYMENT METHODS ---
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (!isSupabaseConfigured()) return memPaymentMethods;
    const supabase = createClient();
    const { data, error } = await supabase.from('payment_methods').select('*').order('created_at', { ascending: true });
    if (error) return memPaymentMethods;
    return data as PaymentMethod[];
  },

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    if (!isSupabaseConfigured()) {
      const idx = memPaymentMethods.findIndex(pm => pm.id === id);
      if (idx !== -1) {
        memPaymentMethods[idx] = { ...memPaymentMethods[idx], ...updates, updated_at: new Date().toISOString() };
        return memPaymentMethods[idx];
      }
      throw new Error('Metode bayar tidak ditemukan');
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('payment_methods').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data as PaymentMethod;
  },

  // --- EXPENSES ---
  async getExpenses(): Promise<Expense[]> {
    if (!isSupabaseConfigured()) return memExpenses;
    const supabase = createClient();
    const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    if (error) return memExpenses;
    return data as Expense[];
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'expense_number'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: 'exp-' + Date.now(),
      expense_number: 'EXP-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured()) {
      memExpenses.unshift(newExpense);
      return newExpense;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('expenses').insert([{
      ...expense,
      expense_number: 'EXP-' + Date.now(),
    }]).select().single();
    if (error) throw new Error(error.message);
    return data as Expense;
  },

  // --- HOUSEKEEPING ---
  async getHousekeepingTasks(): Promise<HousekeepingTask[]> {
    if (!isSupabaseConfigured()) return memHousekeeping;
    const supabase = createClient();
    const { data, error } = await supabase.from('housekeeping_tasks').select('*, room:rooms(*)').order('created_at', { ascending: false });
    if (error) return memHousekeeping;
    return data as HousekeepingTask[];
  },

  async updateHousekeepingStatus(id: string, status: HousekeepingTask['status']): Promise<void> {
    if (!isSupabaseConfigured()) {
      const task = memHousekeeping.find(t => t.id === id);
      if (task) {
        task.status = status;
        if (status === 'selesai') task.completed_at = new Date().toISOString();
      }
      return;
    }
    const supabase = createClient();
    await supabase.from('housekeeping_tasks').update({
      status,
      completed_at: status === 'selesai' ? new Date().toISOString() : null
    }).eq('id', id);
  },

  // --- INVENTORY ---
  async getInventoryItems(): Promise<InventoryItem[]> {
    if (!isSupabaseConfigured()) return memInventory;
    const supabase = createClient();
    const { data, error } = await supabase.from('inventory_items').select('*').order('name', { ascending: true });
    if (error) return memInventory;
    return data as InventoryItem[];
  },

  // --- MAINTENANCE ---
  async getMaintenanceTickets(): Promise<MaintenanceTicket[]> {
    if (!isSupabaseConfigured()) return memMaintenance;
    const supabase = createClient();
    const { data, error } = await supabase.from('maintenance_tickets').select('*, room:rooms(*)').order('created_at', { ascending: false });
    if (error) return memMaintenance;
    return data as MaintenanceTicket[];
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    if (!isSupabaseConfigured()) return memAuditLogs;
    const supabase = createClient();
    const { data, error } = await supabase.from('audit_logs').select('*, actor:profiles(*)').order('created_at', { ascending: false }).limit(100);
    if (error) return memAuditLogs;
    return data as AuditLog[];
  },

  async logAudit(action: string, entityName: string, entityId?: string, details?: any) {
    const entry: AuditLog = {
      id: 'aud-' + Date.now(),
      action,
      entity_name: entityName,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    };
    memAuditLogs.unshift(entry);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from('audit_logs').insert([{
        action,
        entity_name: entityName,
        entity_id: entityId,
        details,
      }]);
    }
  },

  // --- ADVERTISEMENT PHOTOS & GALLERY ---
  async getAdvertisementPhotos(onlyActive = false): Promise<AdvertisementPhoto[]> {
    // 1. Client-side fetch via server API with localStorage sync
    if (typeof window !== 'undefined') {
      try {
        const deletedIdsStr = localStorage.getItem('alyatama_deleted_ad_ids');
        const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];

        const res = await fetch(`/api/panel/photos?active=${onlyActive}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.photos)) {
            const cleanList = json.photos.filter((p: AdvertisementPhoto) => !deletedIds.includes(p.id));
            return cleanList;
          }
        }
      } catch (err) {
        console.warn('Photos API fetch error, falling back to local store:', err);
      }
    }

    // 2. Direct Supabase query (Server or Fallback)
    const localDeletedIds: string[] = typeof window !== 'undefined' && localStorage.getItem('alyatama_deleted_ad_ids')
      ? JSON.parse(localStorage.getItem('alyatama_deleted_ad_ids') || '[]')
      : [];

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      let query = supabase.from('advertisement_photos').select('*').order('display_order', { ascending: true });
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return (data as AdvertisementPhoto[]).filter((p) => !localDeletedIds.includes(p.id));
      }
    }

    // 3. In-memory fallback with deleted items strictly excluded
    const list = onlyActive ? memAdPhotos.filter((p) => p.is_active) : memAdPhotos;
    return [...list]
      .filter((p) => !localDeletedIds.includes(p.id))
      .sort((a, b) => a.display_order - b.display_order);
  },

  async createAdvertisementPhoto(photoData: Omit<AdvertisementPhoto, 'id' | 'created_at' | 'updated_at'>): Promise<AdvertisementPhoto> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/panel/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', photo: photoData }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.photo) {
            memAdPhotos.push(json.photo);
            return json.photo;
          }
        }
      } catch (err) {
        console.warn('API create photo error, fallback to direct Supabase:', err);
      }
    }

    const newPhoto: AdvertisementPhoto = {
      ...photoData,
      id: 'ad-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memAdPhotos.push(newPhoto);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('advertisement_photos').insert([newPhoto]).select().single();
      if (!error && data) return data as AdvertisementPhoto;
    }
    return newPhoto;
  },

  async updateAdvertisementPhoto(id: string, updates: Partial<AdvertisementPhoto>): Promise<AdvertisementPhoto> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/panel/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', id, updates }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.photo) {
            const idx = memAdPhotos.findIndex((p) => p.id === id);
            if (idx !== -1) memAdPhotos[idx] = json.photo;
            return json.photo;
          }
        }
      } catch (err) {
        console.warn('API update photo error, fallback to direct Supabase:', err);
      }
    }

    const idx = memAdPhotos.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memAdPhotos[idx] = { ...memAdPhotos[idx], ...updates, updated_at: new Date().toISOString() };
    }
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('advertisement_photos').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (!error && data) return data as AdvertisementPhoto;
    }
    if (idx !== -1) return memAdPhotos[idx];
    throw new Error('Foto iklan tidak ditemukan');
  },

  async deleteAdvertisementPhoto(id: string): Promise<boolean> {
    // 1. Persist deletion in client localStorage
    if (typeof window !== 'undefined') {
      try {
        const deletedIdsStr = localStorage.getItem('alyatama_deleted_ad_ids');
        const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
          localStorage.setItem('alyatama_deleted_ad_ids', JSON.stringify(deletedIds));
        }

        // 2. Call server-side API to delete from database and server cache
        await fetch('/api/panel/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id }),
        });
      } catch (err) {
        console.warn('API delete photo notice:', err);
      }
    }

    // 3. Remove from memory
    memAdPhotos = memAdPhotos.filter((p) => p.id !== id);

    // 4. Delete directly from Supabase if client-accessible
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('advertisement_photos').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
    return true;
  },

  // --- V3.1 STAFF ACCESS MANAGEMENT ---
  async getStaffUsers(): Promise<StaffUser[]> {
    const fromStorage = loadMemStaffUsersFromStorage();
    if (fromStorage && fromStorage.length > 0) {
      memStaffUsers = fromStorage;
      return memStaffUsers;
    }

    if (!isSupabaseConfigured()) {
      syncMemStaffUsersToStorage(memStaffUsers);
      return memStaffUsers;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('staff_users').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) {
      syncMemStaffUsersToStorage(memStaffUsers);
      return memStaffUsers;
    }
    
    // If Supabase returned data, cache to memory & storage
    memStaffUsers = data as StaffUser[];
    syncMemStaffUsersToStorage(memStaffUsers);
    return memStaffUsers;
  },

  async getStaffUserById(id: string): Promise<StaffUser | null> {
    const list = await this.getStaffUsers();
    return list.find((u) => u.id === id) || null;
  },

  async createStaffUser(userData: Omit<StaffUser, 'id' | 'created_at' | 'updated_at'>): Promise<StaffUser> {
    const list = await this.getStaffUsers();
    const existing = list.find(
      (u) => u.username.toLowerCase() === userData.username.toLowerCase() || u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existing) {
      throw new Error('Username atau Email sudah terdaftar dalam sistem');
    }

    const newUser: StaffUser = {
      ...userData,
      id: 'staff-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memStaffUsers = [...memStaffUsers, newUser];
    syncMemStaffUsersToStorage(memStaffUsers);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('staff_users').insert([newUser]).select().single();
      if (!error && data) {
        const idx = memStaffUsers.findIndex((u) => u.id === newUser.id);
        if (idx !== -1) memStaffUsers[idx] = data as StaffUser;
        syncMemStaffUsersToStorage(memStaffUsers);
        return data as StaffUser;
      }
    }
    return newUser;
  },

  async updateStaffUser(id: string, updates: Partial<StaffUser>): Promise<StaffUser> {
    const list = await this.getStaffUsers();
    const idx = list.findIndex((u) => u.id === id);
    if (idx !== -1) {
      memStaffUsers[idx] = { ...memStaffUsers[idx], ...updates, updated_at: new Date().toISOString() };
      syncMemStaffUsersToStorage(memStaffUsers);
    }
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('staff_users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (!error && data) {
        if (idx !== -1) memStaffUsers[idx] = data as StaffUser;
        syncMemStaffUsersToStorage(memStaffUsers);
        return data as StaffUser;
      }
    }
    if (idx !== -1) return memStaffUsers[idx];
    throw new Error('Pengguna staf tidak ditemukan');
  },

  async deleteStaffUser(id: string): Promise<boolean> {
    const list = await this.getStaffUsers();
    const idx = list.findIndex((u) => u.id === id);
    if (idx !== -1) {
      memStaffUsers.splice(idx, 1);
      syncMemStaffUsersToStorage(memStaffUsers);
    }
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from('staff_users').delete().eq('id', id);
    }
    return true;
  },

  async updateStaffStatus(id: string, status: StaffAccountStatus): Promise<StaffUser> {
    return this.updateStaffUser(id, { status });
  },

  async verifyStaffLogin(identifier: string, pinOrPass: string): Promise<{ success: boolean; user?: StaffUser; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pinOrPass.trim();

    // 1. Try Supabase Auth Authenticator if environment is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let loginEmail = cleanId;

        // If user logged in using username instead of email, lookup their registered email
        if (!cleanId.includes('@')) {
          const { data: staffData } = await supabase
            .from('staff_users')
            .select('*')
            .eq('username', cleanId)
            .maybeSingle();

          if (staffData?.email) {
            loginEmail = staffData.email;
          }
        }

        // Authenticate with Supabase Authenticator
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: cleanPass,
        });

        if (!authError && authData.user) {
          // Find corresponding staff_users record
          const { data: staffRecord } = await supabase
            .from('staff_users')
            .select('*')
            .or(`id.eq.${authData.user.id},email.eq.${authData.user.email}`)
            .maybeSingle();

          if (staffRecord) {
            if (staffRecord.status !== 'ACTIVE') {
              return { 
                success: false, 
                error: `Akses ditolak: Akun staf berstatus ${staffRecord.status}. Hubungi Administrator untuk aktivasi.` 
              };
            }
            await this.updateStaffUser(staffRecord.id, { last_login_at: new Date().toISOString() });
            return { success: true, user: staffRecord as StaffUser };
          }

          // Use auth metadata if staff_users table entry is being populated
          const metaRole = (authData.user.user_metadata?.role as 'admin' | 'staff') || 'admin';
          const authStaffUser: StaffUser = {
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Pengelola ALYATAMA',
            username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || 'admin',
            email: authData.user.email || '',
            role: metaRole,
            status: 'ACTIVE',
            created_at: authData.user.created_at,
            updated_at: new Date().toISOString(),
          };
          return { success: true, user: authStaffUser };
        }
      } catch (err) {
        console.warn('Supabase auth attempt returned error, falling back to local verification:', err);
      }
    }

    // 2. Local fallback verification
    const users = await this.getStaffUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, error: 'Kredensial staf tidak valid atau akun tidak terdaftar' };
    }

    if (user.status !== 'ACTIVE') {
      return { 
        success: false, 
        error: `Akses ditolak: Akun staf berstatus ${user.status}. Hubungi Administrator untuk aktivasi.` 
      };
    }

    if (user.password_hash && user.password_hash !== cleanPass) {
      return { success: false, error: 'Kredensial staf tidak valid' };
    }

    await this.updateStaffUser(user.id, { last_login_at: new Date().toISOString() });
    return { success: true, user };
  },

  // --- V3.1 STAFF SHIFTS ---
  async getStaffShifts(staffUserId?: string): Promise<StaffShift[]> {
    let list = memStaffShifts;
    if (staffUserId) {
      list = list.filter((s) => s.staff_user_id === staffUserId);
    }
    return [...list].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  async getActiveShift(staffUserId: string): Promise<StaffShift | null> {
    const list = await this.getStaffShifts(staffUserId);
    return list.find((s) => s.status === 'active') || null;
  },

  async startShift(staffUserId: string, staffNameSnapshot: string, notes?: string): Promise<StaffShift> {
    const existing = await this.getActiveShift(staffUserId);
    if (existing) {
      return existing;
    }

    const newShift: StaffShift = {
      id: 'shift-' + Date.now(),
      staff_user_id: staffUserId,
      staff_name_snapshot: staffNameSnapshot,
      started_at: new Date().toISOString(),
      ended_at: null,
      status: 'active',
      date_local: new Date().toISOString().split('T')[0],
      notes: notes || 'Shift Operasional Harian',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memStaffShifts.push(newShift);
    return newShift;
  },

  async endShift(shiftId: string): Promise<StaffShift> {
    const idx = memStaffShifts.findIndex((s) => s.id === shiftId);
    if (idx !== -1) {
      memStaffShifts[idx] = {
        ...memStaffShifts[idx],
        status: 'ended',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return memStaffShifts[idx];
    }
    throw new Error('Shift tidak ditemukan');
  },

  // --- ROOM AVAILABILITY CHECK ---
  async checkRoomAvailability(
    roomId: string, 
    checkinDate: string, 
    checkoutDate: string, 
    excludeReservationId?: string
  ): Promise<boolean> {
    const rooms = await this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room || room.operational_status === 'dalam_perawatan' || room.operational_status === 'tidak_dijual_sementara' || room.is_archived) {
      return false;
    }

    const inTime = new Date(checkinDate).getTime();
    const outTime = new Date(checkoutDate).getTime();
    if (isNaN(inTime) || isNaN(outTime) || inTime >= outTime) {
      return false;
    }

    const reservations = await this.getReservations();
    const hasConflict = reservations.some((res) => {
      if (excludeReservationId && res.id === excludeReservationId) return false;
      if (res.status === 'cancelled' || res.status === 'rejected' || res.status === 'expired') {
        return false;
      }
      const roomMatch = res.rooms?.some((r) => r.id === roomId);
      if (!roomMatch) return false;

      const resIn = new Date(res.checkin_date).getTime();
      const resOut = new Date(res.checkout_date).getTime();
      return resIn < outTime && inTime < resOut;
    });

    return !hasConflict;
  },

  // --- V3.1 WALK-IN RESERVATION WITH AUTOMATIC ATTRIBUTION ---
  async createWalkInReservation(params: {
    guest: { full_name: string; phone: string; email?: string };
    roomId: string;
    checkinDate: string;
    checkoutDate: string;
    rentalType: 'daily' | 'monthly' | 'yearly';
    durationUnits?: number;
    adults: number;
    children: number;
    baseSubtotal: number;
    totalAmount: number;
    paymentAmount: number;
    paymentMethod: string;
    staffUserId: string;
    staffRole: 'admin' | 'staff';
    staffShiftId?: string | null;
    staffNameSnapshot?: string | null;
    notes?: string;
  }): Promise<Reservation> {
    const isAvail = await this.checkRoomAvailability(params.roomId, params.checkinDate, params.checkoutDate);
    if (!isAvail) {
      throw new Error('Kamar tidak tersedia pada tanggal yang dipilih');
    }

    const guestId = 'gst-' + Date.now();
    const room = (await this.getRooms()).find((r) => r.id === params.roomId);

    const resId = 'res-walkin-' + Date.now();
    const resNum = 'ALY-W-' + Math.floor(100000 + Math.random() * 900000);
    const isFullyPaid = params.paymentAmount >= params.totalAmount;

    const newRes: Reservation = {
      id: resId,
      reservation_number: resNum,
      guest_id: guestId,
      rental_type: params.rentalType,
      duration_units: params.durationUnits || 1,
      checkin_date: params.checkinDate,
      checkout_date: params.checkoutDate,
      adults: params.adults,
      children: params.children,
      status: 'confirmed',
      payment_status: isFullyPaid ? 'paid' : params.paymentAmount > 0 ? 'partially_paid' : 'unpaid',
      special_requests: params.notes || null,
      booking_source: 'walk_in',
      created_by_user_id: params.staffUserId,
      created_by_role: params.staffRole,
      staff_shift_id: params.staffShiftId || null,
      staff_name_snapshot: params.staffNameSnapshot || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      guest: {
        id: guestId,
        full_name: params.guest.full_name,
        phone: params.guest.phone,
        normalized_phone: params.guest.phone.replace(/\D/g, ''),
        email: params.guest.email || null,
        category: 'regular',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      rooms: room ? [room] : [],
      price_snapshot: {
        id: 'snp-' + Date.now(),
        reservation_id: resId,
        rental_type: params.rentalType,
        duration_units: params.durationUnits || 1,
        total_nights: Math.max(1, Math.round((new Date(params.checkoutDate).getTime() - new Date(params.checkinDate).getTime()) / (1000 * 3600 * 24))),
        base_subtotal: params.baseSubtotal,
        nightly_breakdown: [],
        discount_amount: 0,
        extra_charges: 0,
        deposit_required: 0,
        total_amount: params.totalAmount,
        total_paid: params.paymentAmount,
        balance_due: Math.max(0, params.totalAmount - params.paymentAmount),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      payments: params.paymentAmount > 0 ? [
        {
          id: 'pay-' + Date.now(),
          payment_number: 'PAY-W-' + Math.floor(100000 + Math.random() * 900000),
          reservation_id: resId,
          amount: params.paymentAmount,
          payment_method: params.paymentMethod,
          payment_date: new Date().toISOString().split('T')[0],
          status: 'verified',
          verified_by: params.staffNameSnapshot || 'Staf Bertugas',
          verified_at: new Date().toISOString(),
          notes: 'Pembayaran walk-in di tempat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ] : []
    };

    memReservations.unshift(newRes);
    return newRes;
  }
};
