import { BOQItem } from '../types';
import { AFGHAN_REGIONS } from '../data/afghanistanData';

export class BOQService {
  /**
   * Recalculates all items based on selected Afghanistan city multiplier
   */
  static applyRegionalPricing(items: BOQItem[], targetCity: keyof typeof AFGHAN_REGIONS): BOQItem[] {
    const profile = AFGHAN_REGIONS[targetCity];
    if (!profile) return items;

    return items.map(item => {
      // Calculate adjusted rate based on the regional market index
      const baseRate = item.unitRate;
      const adjustedRate = Math.round(baseRate * profile.multiplier);
      return {
        ...item,
        region: profile.city,
        unitRate: adjustedRate,
        totalAmount: Math.round(adjustedRate * item.quantity),
      };
    });
  }

  static calculateTotals(items: BOQItem[]) {
    const totalCost = items.reduce((sum, item) => sum + item.totalAmount, 0);

    const byCategory: Record<string, number> = {};
    items.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.totalAmount;
    });

    const concreteVolumeM3 = items
      .filter(i => i.unit === 'متر مکعب' && i.category === 'بتن و قالب‌بندی')
      .reduce((sum, i) => sum + i.quantity, 0);

    const rebarTons = items
      .filter(i => i.unit === 'تن' && i.category === 'فولاد و آرماتور')
      .reduce((sum, i) => sum + i.quantity, 0);

    // Approximate ratio of steel to concrete (kg/m3)
    const steelRatioKgPerM3 = concreteVolumeM3 > 0 ? Math.round((rebarTons * 1000) / concreteVolumeM3) : 0;

    return {
      totalCost,
      byCategory,
      concreteVolumeM3,
      rebarTons,
      steelRatioKgPerM3,
    };
  }

  /**
   * Afghan Traditional Construction Unit Converter
   */
  static convertUnits(val: number, from: string, to: string): number {
    // 1 Seer (سیر) = 7 kg
    // 1 Ton (تن) = 1000 kg = ~142.85 Seer
    // 1 Ghaz (گز) = 0.9144 meters
    // 1 Kharwar (خروار) = 80 Seer = 560 kg
    if (from === 'تن' && to === 'کیلوگرم') return val * 1000;
    if (from === 'کیلوگرم' && to === 'تن') return val / 1000;
    if (from === 'تن' && to === 'سیر') return (val * 1000) / 7;
    if (from === 'سیر' && to === 'کیلوگرم') return val * 7;
    if (from === 'گز' && to === 'متر') return val * 0.9144;
    if (from === 'متر' && to === 'گز') return val / 0.9144;
    return val;
  }
}
