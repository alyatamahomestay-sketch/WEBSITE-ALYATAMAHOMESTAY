import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from 'date-fns';
import { NightlyRateItem, Promotion, Room, RoomRatePeriod } from './types';

export interface PricingCalculationResult {
  totalNights: number;
  nightlyBreakdown: NightlyRateItem[];
  baseSubtotal: number;
  discountAmount: number;
  discountReason: string | null;
  promoSnapshot: any | null;
  extraCharges: number;
  depositRequired: number;
  totalAmount: number;
  balanceDue: number;
}

/**
 * Calculates total nights between checkin and checkout.
 * Example: checkin 2026-10-10, checkout 2026-10-12 = 2 nights
 */
export function calculateNights(checkinDateStr: string, checkoutDateStr: string): number {
  const checkin = parseISO(checkinDateStr);
  const checkout = parseISO(checkoutDateStr);
  const nights = differenceInCalendarDays(checkout, checkin);
  return nights > 0 ? nights : 0;
}

/**
 * Generates nightly rates for each night of the stay, factoring in rate overrides
 */
export function calculateNightlyBreakdown(
  checkinDateStr: string,
  checkoutDateStr: string,
  baseRate: number,
  ratePeriods: RoomRatePeriod[] = []
): NightlyRateItem[] {
  const nights = calculateNights(checkinDateStr, checkoutDateStr);
  if (nights <= 0) return [];

  const checkin = parseISO(checkinDateStr);
  // Nights end on day before checkout
  const lastNight = new Date(checkin);
  lastNight.setDate(lastNight.getDate() + (nights - 1));

  const intervalDays = eachDayOfInterval({ start: checkin, end: lastNight });

  return intervalDays.map((dateObj) => {
    const dateStr = format(dateObj, 'yyyy-MM-dd');

    // Check if this date falls within any rate period override
    const override = ratePeriods.find(
      (rp) => dateStr >= rp.start_date && dateStr <= rp.end_date
    );

    if (override) {
      return {
        date: dateStr,
        rate: Number(override.rate),
        is_override: true,
        label: override.label,
      };
    }

    return {
      date: dateStr,
      rate: Number(baseRate),
      is_override: false,
    };
  });
}

/**
 * Evaluates promotional discount rules
 */
export function evaluatePromotionDiscount(
  subtotal: number,
  nights: number,
  checkinDateStr: string,
  promo: Promotion | null | undefined
): { discount: number; reason: string | null } {
  if (!promo || !promo.is_active) {
    return { discount: 0, reason: null };
  }

  // Check valid date range
  if (checkinDateStr < promo.start_date || checkinDateStr > promo.end_date) {
    return { discount: 0, reason: null };
  }

  // Check min nights
  if (promo.min_nights && nights < promo.min_nights) {
    return { discount: 0, reason: null };
  }

  // Check max nights if set
  if (promo.max_nights && nights > promo.max_nights) {
    return { discount: 0, reason: null };
  }

  // Check minimum spend
  if (promo.min_spend && subtotal < Number(promo.min_spend)) {
    return { discount: 0, reason: null };
  }

  // Calculate discount
  let discount = 0;
  if (promo.discount_type === 'percentage') {
    discount = Math.round((subtotal * Number(promo.discount_value)) / 100);
  } else {
    discount = Number(promo.discount_value);
  }

  // Cannot exceed subtotal
  discount = Math.min(discount, subtotal);
  discount = Math.max(0, discount);

  return {
    discount,
    reason: `Diskon promo ${promo.name} (${promo.code || 'Auto'})`,
  };
}

/**
 * Full reservation pricing engine
 */
export function calculateReservationPricing(params: {
  checkinDateStr: string;
  checkoutDateStr: string;
  room: Pick<Room, 'base_rate'>;
  ratePeriods?: RoomRatePeriod[];
  promotion?: Promotion | null;
  customDiscount?: number;
  customDiscountReason?: string;
  extraCharges?: number;
  depositPercentage?: number; // e.g. 50 for 50%
  totalPaid?: number;
}): PricingCalculationResult {
  const {
    checkinDateStr,
    checkoutDateStr,
    room,
    ratePeriods = [],
    promotion = null,
    customDiscount = 0,
    customDiscountReason,
    extraCharges = 0,
    depositPercentage = 50,
    totalPaid = 0,
  } = params;

  const totalNights = calculateNights(checkinDateStr, checkoutDateStr);
  const nightlyBreakdown = calculateNightlyBreakdown(
    checkinDateStr,
    checkoutDateStr,
    room.base_rate,
    ratePeriods
  );

  const baseSubtotal = nightlyBreakdown.reduce((sum, item) => sum + item.rate, 0);

  // Evaluate promo or custom discount
  let discountAmount = 0;
  let discountReason: string | null = null;
  let promoSnapshot: any | null = null;

  if (promotion) {
    const promoResult = evaluatePromotionDiscount(
      baseSubtotal,
      totalNights,
      checkinDateStr,
      promotion
    );
    if (promoResult.discount > 0) {
      discountAmount = promoResult.discount;
      discountReason = promoResult.reason;
      promoSnapshot = {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
      };
    }
  } else if (customDiscount > 0) {
    discountAmount = Math.min(customDiscount, baseSubtotal);
    discountReason = customDiscountReason || 'Diskon khusus admin';
  }

  const netRoomAmount = Math.max(0, baseSubtotal - discountAmount);
  const totalAmount = netRoomAmount + Number(extraCharges);

  // Deposit typically 50% of total amount or customized
  const depositRequired = Math.round((totalAmount * (depositPercentage || 50)) / 100);
  const balanceDue = Math.max(0, totalAmount - (totalPaid || 0));

  return {
    totalNights,
    nightlyBreakdown,
    baseSubtotal,
    discountAmount,
    discountReason,
    promoSnapshot,
    extraCharges: Number(extraCharges),
    depositRequired,
    totalAmount,
    balanceDue,
  };
}
