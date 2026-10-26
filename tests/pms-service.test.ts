import { describe, it, expect } from 'vitest';
import { PmsService } from '../src/lib/services/pms-service';

describe('PMS Service Operations & Concurrency Handling', () => {
  it('retrieves default rooms and supports adding/updating rooms', async () => {
    const rooms = await PmsService.getRooms();
    expect(rooms.length).toBeGreaterThan(0);

    const testRoom = await PmsService.createRoom({
      room_number: 'TEST-999',
      name: 'Kamar Uji Coba',
      room_type: 'Deluxe Suite',
      description: 'Deskripsi uji coba',
      capacity_adults: 2,
      capacity_children: 1,
      base_rate: 350000,
      operational_status: 'tersedia',
      amenities: ['AC', 'WiFi'],
      photos: [],
      is_archived: false,
    });

    expect(testRoom.room_number).toBe('TEST-999');

    // Update operational status
    const updated = await PmsService.updateRoom(testRoom.id, {
      operational_status: 'dalam_perawatan',
    });
    expect(updated.operational_status).toBe('dalam_perawatan');
  });

  it('performs atomic reservation approval and status updates', async () => {
    const reservations = await PmsService.getReservations();
    const pending = reservations.find((r) => r.status === 'pending_approval');
    expect(pending).toBeDefined();

    if (pending) {
      const approval = await PmsService.approveReservation(pending.id, 'admin-tester');
      expect(approval.success).toBe(true);

      const approvedRes = await PmsService.getReservationById(pending.id);
      expect(approvedRes?.status).toBe('approved_pending_payment');
    }
  });

  it('records payments and updates balance due accurately', async () => {
    const reservations = await PmsService.getReservations();
    const res = reservations[0];
    expect(res).toBeDefined();

    const previousPaid = res.price_snapshot?.total_paid || 0;
    const paymentResult = await PmsService.addPayment({
      reservationId: res.id,
      amount: 100000,
      paymentMethod: 'qris',
      notes: 'Uji coba pembayaran',
    });

    expect(paymentResult.success).toBe(true);

    const updatedRes = await PmsService.getReservationById(res.id);
    expect(updatedRes?.price_snapshot?.total_paid).toBe(previousPaid + 100000);
  });

  it('manages housekeeping task lifecycle', async () => {
    const tasks = await PmsService.getHousekeepingTasks();
    expect(tasks.length).toBeGreaterThan(0);

    const firstTask = tasks[0];
    await PmsService.updateHousekeepingStatus(firstTask.id, 'sedang_dikerjakan');
    let reloaded = await PmsService.getHousekeepingTasks();
    expect(reloaded.find((t) => t.id === firstTask.id)?.status).toBe('sedang_dikerjakan');

    await PmsService.updateHousekeepingStatus(firstTask.id, 'selesai');
    reloaded = await PmsService.getHousekeepingTasks();
    expect(reloaded.find((t) => t.id === firstTask.id)?.status).toBe('selesai');
  });

  it('records expenses and reflects them in the operational ledger', async () => {
    const initialExpenses = await PmsService.getExpenses();
    const countBefore = initialExpenses.length;

    await PmsService.createExpense({
      category: 'listrik',
      description: 'Beli token listrik tes',
      amount: 250000,
      expense_date: '2026-10-25',
      payment_method: 'Transfer Bank',
      vendor: 'PLN',
    });

    const afterExpenses = await PmsService.getExpenses();
    expect(afterExpenses.length).toBe(countBefore + 1);
  });

  it('manages advertisement and promotional photos lifecycle for admin & public gallery', async () => {
    const activePhotos = await PmsService.getAdvertisementPhotos(true);
    expect(activePhotos.length).toBeGreaterThan(0);

    // Create a new advertisement photo
    const newAd = await PmsService.createAdvertisementPhoto({
      title: 'Brosur Ramadhan Syariah 2026',
      category: 'brosur_flyer',
      image_url: '/images/alyatama-flyer.jpg',
      description: 'Diskon khusus menginap mingguan dan bulanan selama bulan suci',
      badge: 'Spesial Ramadhan',
      is_active: true,
      display_order: 99,
    });

    expect(newAd.id).toBeDefined();
    expect(newAd.title).toBe('Brosur Ramadhan Syariah 2026');

    // Update the advertisement photo
    const updated = await PmsService.updateAdvertisementPhoto(newAd.id, {
      title: 'Brosur Ramadhan Syariah 2026 (Updated)',
      is_active: false,
    });
    expect(updated.title).toBe('Brosur Ramadhan Syariah 2026 (Updated)');
    expect(updated.is_active).toBe(false);

    // Verify it is excluded when activeOnly is true
    const activeAfter = await PmsService.getAdvertisementPhotos(true);
    expect(activeAfter.some((p) => p.id === newAd.id)).toBe(false);

    // Delete the test photo
    const deleteResult = await PmsService.deleteAdvertisementPhoto(newAd.id);
    expect(deleteResult).toBe(true);
  });
});
