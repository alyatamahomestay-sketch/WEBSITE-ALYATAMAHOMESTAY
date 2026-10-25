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
  AuditLog
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
  INITIAL_PROPERTY_SETTINGS 
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
    if (!isSupabaseConfigured()) {
      return memProperty;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('properties').select('*').limit(1).single();
    if (error || !data) return memProperty;
    return data as PropertySettings;
  },

  async updatePropertySettings(updates: Partial<PropertySettings>): Promise<PropertySettings> {
    if (!isSupabaseConfigured()) {
      memProperty = { ...memProperty, ...updates, updated_at: new Date().toISOString() };
      return memProperty;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('properties')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', memProperty.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as PropertySettings;
  },

  // --- ROOMS ---
  async getRooms(includeArchived = false): Promise<Room[]> {
    if (!isSupabaseConfigured()) {
      return includeArchived ? memRooms : memRooms.filter(r => !r.is_archived);
    }
    const supabase = createClient();
    let query = supabase.from('rooms').select('*').order('room_number', { ascending: true });
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }
    const { data, error } = await query;
    if (error) return memRooms.filter(r => includeArchived || !r.is_archived);
    return data as Room[];
  },

  async getRoomById(id: string): Promise<Room | null> {
    if (!isSupabaseConfigured()) {
      return memRooms.find(r => r.id === id) || null;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('rooms').select('*').eq('id', id).single();
    if (error) return memRooms.find(r => r.id === id) || null;
    return data as Room;
  },

  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const newRoom: Room = {
      ...room,
      id: 'room-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured()) {
      memRooms.push(newRoom);
      return newRoom;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('rooms').insert([room]).select().single();
    if (error) throw new Error(error.message);
    return data as Room;
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    if (!isSupabaseConfigured()) {
      const idx = memRooms.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Kamar tidak ditemukan');
      memRooms[idx] = { ...memRooms[idx], ...updates, updated_at: new Date().toISOString() };
      return memRooms[idx];
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('rooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Room;
  },

  // --- RESERVATIONS ---
  async getReservations(statusFilter?: string): Promise<Reservation[]> {
    if (!isSupabaseConfigured()) {
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
      return { success: true, message: 'Reservasi berhasil disetujui (Menunggu Pembayaran / DP).' };
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc('approve_reservation_atomic', {
      p_reservation_id: reservationId,
      p_admin_id: adminId || null,
      p_target_status: 'approved_pending_payment'
    });

    if (error) return { success: false, message: error.message };
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
  }
};
