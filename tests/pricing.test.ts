import { describe, it, expect } from 'vitest';
import { 
  calculateNights, 
  calculateRentalDuration,
  calculateNightlyBreakdown, 
  evaluatePromotionDiscount, 
  calculateReservationPricing 
} from '../src/lib/pricing';
import { Promotion } from '../src/lib/types';

describe('Pricing Engine & Night Calculations', () => {
  it('correctly calculates total nights according to hospitality standard', () => {
    // Checkin 10th, Checkout 12th = exactly 2 nights
    expect(calculateNights('2026-10-10', '2026-10-12')).toBe(2);
    // 1 night stay
    expect(calculateNights('2026-10-10', '2026-10-11')).toBe(1);
    // Same day or reverse should return 0
    expect(calculateNights('2026-10-10', '2026-10-10')).toBe(0);
    expect(calculateNights('2026-10-12', '2026-10-10')).toBe(0);
  });

  it('calculates rental duration for daily, monthly, and yearly models', () => {
    // Daily: 3 nights
    const dailyDur = calculateRentalDuration('2026-10-10', '2026-10-13', 'daily');
    expect(dailyDur.totalNights).toBe(3);
    expect(dailyDur.durationUnits).toBe(3);
    expect(dailyDur.unitLabel).toBe('Malam');

    // Monthly: 2 months (Oct 01 to Dec 01)
    const monthlyDur = calculateRentalDuration('2026-10-01', '2026-12-01', 'monthly');
    expect(monthlyDur.totalNights).toBe(61);
    expect(monthlyDur.durationUnits).toBe(2);
    expect(monthlyDur.unitLabel).toBe('Bulan');

    // Yearly: 365 nights = 1 year
    const yearlyDur = calculateRentalDuration('2026-01-01', '2027-01-01', 'yearly');
    expect(yearlyDur.totalNights).toBe(365);
    expect(yearlyDur.durationUnits).toBe(1);
    expect(yearlyDur.unitLabel).toBe('Tahun');
  });

  it('calculates nightly breakdown with rate period overrides', () => {
    const baseRate = 250000;
    const ratePeriods = [
      {
        id: 'rp-1',
        room_id: 'room-1',
        start_date: '2026-10-11',
        end_date: '2026-10-11',
        rate: 350000,
        label: 'Malam Minggu Khusus',
        created_at: '',
      },
    ];

    const breakdown = calculateNightlyBreakdown('2026-10-10', '2026-10-12', baseRate, ratePeriods);
    expect(breakdown).toHaveLength(2);
    // Night 1: Oct 10 -> base rate
    expect(breakdown[0].date).toBe('2026-10-10');
    expect(breakdown[0].rate).toBe(250000);
    expect(breakdown[0].is_override).toBe(false);

    // Night 2: Oct 11 -> override rate
    expect(breakdown[1].date).toBe('2026-10-11');
    expect(breakdown[1].rate).toBe(350000);
    expect(breakdown[1].is_override).toBe(true);
    expect(breakdown[1].label).toBe('Malam Minggu Khusus');
  });

  it('evaluates percentage promotional discounts properly', () => {
    const promo: Promotion = {
      id: 'p-1',
      name: 'Diskon 10%',
      code: 'HEMAT10',
      discount_type: 'percentage',
      discount_value: 10,
      start_date: '2026-10-01',
      end_date: '2026-10-31',
      applicable_days: ['0', '1', '2', '3', '4', '5', '6'],
      min_nights: 2,
      min_spend: 400000,
      used_count: 0,
      is_active: true,
      priority: 1,
      created_at: '',
      updated_at: '',
    };

    // Subtotal 500.000 for 2 nights => eligible for 10% (50.000)
    const result = evaluatePromotionDiscount(500000, 2, '2026-10-15', promo);
    expect(result.discount).toBe(50000);
    expect(result.reason).toContain('HEMAT10');

    // If stay is only 1 night => fails min_nights requirement
    const result1Night = evaluatePromotionDiscount(500000, 1, '2026-10-15', promo);
    expect(result1Night.discount).toBe(0);

    // If subtotal is below min_spend
    const resultLowSpend = evaluatePromotionDiscount(300000, 2, '2026-10-15', promo);
    expect(resultLowSpend.discount).toBe(0);
  });

  it('ensures discount never exceeds subtotal', () => {
    const promo: Promotion = {
      id: 'p-2',
      name: 'Voucher 500k',
      code: 'BIG500',
      discount_type: 'fixed',
      discount_value: 500000,
      start_date: '2026-10-01',
      end_date: '2026-10-31',
      applicable_days: ['0', '1', '2', '3', '4', '5', '6'],
      min_nights: 1,
      min_spend: 0,
      used_count: 0,
      is_active: true,
      priority: 1,
      created_at: '',
      updated_at: '',
    };

    // If subtotal is only 250.000, discount is capped at 250.000 (cannot result in negative)
    const result = evaluatePromotionDiscount(250000, 1, '2026-10-15', promo);
    expect(result.discount).toBe(250000);
  });

  it('calculates full reservation pricing, deposit, and balance due for daily model', () => {
    const pricing = calculateReservationPricing({
      checkinDateStr: '2026-10-20',
      checkoutDateStr: '2026-10-22', // 2 nights
      room: { base_rate: 300000 },
      customDiscount: 50000,
      customDiscountReason: 'Potongan ramah tamah',
      depositPercentage: 50,
      totalPaid: 200000,
      rentalType: 'daily',
    });

    expect(pricing.rentalType).toBe('daily');
    expect(pricing.totalNights).toBe(2);
    expect(pricing.durationUnits).toBe(2);
    expect(pricing.unitRate).toBe(300000);
    expect(pricing.baseSubtotal).toBe(600000);
    expect(pricing.discountAmount).toBe(50000);
    expect(pricing.totalAmount).toBe(550000); // 600k - 50k
    expect(pricing.depositRequired).toBe(275000); // 50% of 550k
    expect(pricing.balanceDue).toBe(350000); // 550k - 200k paid
  });

  it('calculates pricing properly for monthly and yearly rental models', () => {
    // Monthly: 1 month with monthly_rate = 2.500.000
    const monthlyPricing = calculateReservationPricing({
      checkinDateStr: '2026-11-01',
      checkoutDateStr: '2026-12-01',
      room: { base_rate: 250000, monthly_rate: 2500000, yearly_rate: 24000000 },
      rentalType: 'monthly',
      durationUnits: 1,
      depositPercentage: 50,
    });

    expect(monthlyPricing.rentalType).toBe('monthly');
    expect(monthlyPricing.durationUnits).toBe(1);
    expect(monthlyPricing.unitRate).toBe(2500000);
    expect(monthlyPricing.baseSubtotal).toBe(2500000);
    expect(monthlyPricing.totalAmount).toBe(2500000);
    expect(monthlyPricing.depositRequired).toBe(1250000); // 50%

    // Yearly: 1 year with yearly_rate = 24.000.000
    const yearlyPricing = calculateReservationPricing({
      checkinDateStr: '2026-01-01',
      checkoutDateStr: '2027-01-01',
      room: { base_rate: 250000, monthly_rate: 2500000, yearly_rate: 24000000 },
      rentalType: 'yearly',
      durationUnits: 1,
      depositPercentage: 50,
    });

    expect(yearlyPricing.rentalType).toBe('yearly');
    expect(yearlyPricing.durationUnits).toBe(1);
    expect(yearlyPricing.unitRate).toBe(24000000);
    expect(yearlyPricing.baseSubtotal).toBe(24000000);
    expect(yearlyPricing.totalAmount).toBe(24000000);
    expect(yearlyPricing.depositRequired).toBe(12000000); // 50%
  });
});
