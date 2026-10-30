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
    // Buat reservasi uji coba mandiri
    const rooms = await PmsService.getRooms();
    const targetRoom = rooms[0];
    const testRes = await PmsService.createWalkInReservation({
      guest: { full_name: 'Tamu Uji Coba Approval', phone: '081234567890' },
      roomId: targetRoom.id,
      checkinDate: '2026-12-20',
      checkoutDate: '2026-12-22',
      rentalType: 'daily',
      adults: 1,
      children: 0,
      baseSubtotal: targetRoom.base_rate * 2,
      totalAmount: targetRoom.base_rate * 2,
      paymentAmount: 0,
      paymentMethod: 'Tunai',
      staffUserId: 'staff-user-002',
      staffRole: 'staff',
    });

    // Ubah status ke pending_approval untuk diuji approval-nya
    await PmsService.updateReservationStatus(testRes.id, 'pending_approval');

    const approval = await PmsService.approveReservation(testRes.id, 'admin-tester');
    expect(approval.success).toBe(true);

    const approvedRes = await PmsService.getReservationById(testRes.id);
    expect(approvedRes?.status).toBe('approved_pending_payment');
  });

  it('records payments and updates balance due accurately', async () => {
    const rooms = await PmsService.getRooms();
    const targetRoom = rooms[0];
    const testRes = await PmsService.createWalkInReservation({
      guest: { full_name: 'Tamu Uji Coba Pembayaran', phone: '081234567891' },
      roomId: targetRoom.id,
      checkinDate: '2026-12-25',
      checkoutDate: '2026-12-27',
      rentalType: 'daily',
      adults: 1,
      children: 0,
      baseSubtotal: targetRoom.base_rate * 2,
      totalAmount: targetRoom.base_rate * 2,
      paymentAmount: 0,
      paymentMethod: 'Tunai',
      staffUserId: 'staff-user-002',
      staffRole: 'staff',
    });

    const previousPaid = testRes.price_snapshot?.total_paid || 0;
    const paymentResult = await PmsService.addPayment({
      reservationId: testRes.id,
      amount: 100000,
      paymentMethod: 'qris',
      notes: 'Uji coba pembayaran',
    });

    expect(paymentResult.success).toBe(true);

    const updatedRes = await PmsService.getReservationById(testRes.id);
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

  it('enforces V3.1 admin-controlled staff access lifecycle', async () => {
    // 1. Verify existing active admin login
    const adminLogin = await PmsService.verifyStaffLogin('admin', '1234');
    expect(adminLogin.success).toBe(true);
    expect(adminLogin.user?.role).toBe('admin');

    // 2. Verify active staff login
    const staffLogin = await PmsService.verifyStaffLogin('rahmat', '1234');
    expect(staffLogin.success).toBe(true);
    expect(staffLogin.user?.role).toBe('staff');

    // 3. Verify inactive staff login is rejected
    const inactiveLogin = await PmsService.verifyStaffLogin('ahmad', '1234');
    expect(inactiveLogin.success).toBe(false);
    expect(inactiveLogin.error).toContain('Akses ditolak');

    // 4. Verify non-existent user rejected
    const nonExistent = await PmsService.verifyStaffLogin('ghost_user', '1234');
    expect(nonExistent.success).toBe(false);

    // 5. Admin creates a new staff account
    const newStaff = await PmsService.createStaffUser({
      full_name: 'Budi Santoso',
      username: 'budi_test',
      email: 'budi@test.com',
      role: 'staff',
      status: 'ACTIVE',
      password_hash: 'pass999',
    });
    expect(newStaff.id).toBeDefined();

    // 6. Admin can change staff status to SUSPENDED
    const suspended = await PmsService.updateStaffStatus(newStaff.id, 'SUSPENDED');
    expect(suspended.status).toBe('SUSPENDED');

    // Suspended staff cannot login
    const suspendedLogin = await PmsService.verifyStaffLogin('budi_test', 'pass999');
    expect(suspendedLogin.success).toBe(false);
  });

  it('manages V3.1 staff shift lifecycle and prevents double active shifts', async () => {
    const testUserId = 'staff-user-003'; // Siti Nurhaliza
    const nameSnapshot = 'Siti Nurhaliza';

    // 1. Start a new shift
    const shift = await PmsService.startShift(testUserId, nameSnapshot, 'Shift Pagi');
    expect(shift.id).toBeDefined();
    expect(shift.status).toBe('active');
    expect(shift.staff_name_snapshot).toBe(nameSnapshot);

    // 2. Starting another shift while one is active returns the existing one (prevents duplicate active shift)
    const duplicateAttempt = await PmsService.startShift(testUserId, nameSnapshot, 'Duplicate Attempt');
    expect(duplicateAttempt.id).toBe(shift.id);

    // 3. Active shift query returns the shift
    const active = await PmsService.getActiveShift(testUserId);
    expect(active?.id).toBe(shift.id);

    // 4. End the shift
    const ended = await PmsService.endShift(shift.id);
    expect(ended.status).toBe('ended');
    expect(ended.ended_at).toBeDefined();

    // 5. Querying active shift now returns null
    const activeAfterEnd = await PmsService.getActiveShift(testUserId);
    expect(activeAfterEnd).toBeNull();
  });

  it('creates walk-in reservation with automatic staff attribution and atomic room booking', async () => {
    const rooms = await PmsService.getRooms();
    const targetRoom = rooms[0];

    const walkIn = await PmsService.createWalkInReservation({
      guest: {
        full_name: 'Pak Ridwan Kamil',
        phone: '081234567899',
        email: 'ridwan@test.com',
      },
      roomId: targetRoom.id,
      checkinDate: '2026-12-10',
      checkoutDate: '2026-12-12',
      rentalType: 'daily',
      adults: 2,
      children: 0,
      baseSubtotal: targetRoom.base_rate * 2,
      totalAmount: targetRoom.base_rate * 2,
      paymentAmount: targetRoom.base_rate * 2,
      paymentMethod: 'Tunai / Kasir',
      staffUserId: 'staff-user-002',
      staffRole: 'staff',
      staffShiftId: 'shift-demo-001',
      staffNameSnapshot: 'Rahmat Hidayat',
      notes: 'Tamu walk-in dinas Pemprov',
    });

    expect(walkIn.id).toBeDefined();
    expect(walkIn.booking_source).toBe('walk_in');
    expect(walkIn.created_by_role).toBe('staff');
    expect(walkIn.staff_name_snapshot).toBe('Rahmat Hidayat');
    expect(walkIn.status).toBe('confirmed');
    expect(walkIn.payment_status).toBe('paid');
    expect(walkIn.price_snapshot?.balance_due).toBe(0);
    expect(walkIn.payments?.length).toBe(1);
    expect(walkIn.payments?.[0].verified_by).toBe('Rahmat Hidayat');
  });
});
