/**
 * Material Manager Domain Types and Interfaces
 * Type-safe definitions for structural engineering materials (Steel, Concrete, Timber)
 * compliant with مبحث ۹ (بتن)، مبحث ۱۰ (فولاد)، ACI 318، AISC 360 و Eurocode 5.
 */

export type MaterialCategory = 'steel' | 'concrete' | 'timber';

export interface CoreMechanicalProperties {
  elasticModulus: number; // in GPa (Gigapascals)
  poissonsRatio: number; // dimensionless (e.g. 0.20 - 0.30)
  density: number; // in kg/m³
  yieldStrength?: number; // in MPa (Megapascals)
  compressiveStrength?: number; // in MPa
  thermalExpansionAlpha?: number; // 1/K (e.g. 1.2e-5)
}

export interface MaterialVersionRecord {
  version: number;
  timestamp: string;
  author: string;
  changes: string;
  snapshot: CoreMechanicalProperties;
}

export interface MaterialProfile {
  id: string;
  name: string;
  nameFa: string;
  category: MaterialCategory;
  isStandard: boolean; // True for industry baselines, false for custom user profiles
  properties: CoreMechanicalProperties;
  version: number;
  history: MaterialVersionRecord[];
  createdAt: string;
  updatedAt: string;
  projectId: string;
  description?: string;
  standardReference?: string; // e.g. مبحث ۹ / ASTM A36 / EN 338
}

/**
 * Physical Plausibility Ranges for Validation
 */
export interface PropertyRangeLimit {
  min: number;
  max: number;
  unit: string;
  labelFa: string;
}

export interface CategoryValidationRules {
  elasticModulus: PropertyRangeLimit;
  poissonsRatio: PropertyRangeLimit;
  density: PropertyRangeLimit;
}

export const MATERIAL_VALIDATION_RULES: Record<MaterialCategory, CategoryValidationRules> = {
  steel: {
    elasticModulus: { min: 140, max: 260, unit: 'GPa', labelFa: 'مدول الاستیسیته (E)' },
    poissonsRatio: { min: 0.20, max: 0.38, unit: '', labelFa: 'ضریب پواسون (ν)' },
    density: { min: 7000, max: 8500, unit: 'kg/m³', labelFa: 'چگالی (ρ)' }
  },
  concrete: {
    elasticModulus: { min: 12, max: 65, unit: 'GPa', labelFa: 'مدول الاستیسیته (E)' },
    poissonsRatio: { min: 0.10, max: 0.32, unit: '', labelFa: 'ضریب پواسون (ν)' },
    density: { min: 1600, max: 3200, unit: 'kg/m³', labelFa: 'چگالی (ρ)' }
  },
  timber: {
    elasticModulus: { min: 4, max: 28, unit: 'GPa', labelFa: 'مدول الاستیسیته (E)' },
    poissonsRatio: { min: 0.15, max: 0.55, unit: '', labelFa: 'ضریب پواسون (ν)' },
    density: { min: 280, max: 1300, unit: 'kg/m³', labelFa: 'چگالی (ρ)' }
  }
};

/**
 * Industry-Standard Baseline Profiles Pre-populated
 */
export const INDUSTRY_STANDARD_MATERIALS: MaterialProfile[] = [
  // 1. Steel Profiles
  {
    id: 'std_steel_s355',
    name: 'Structural Steel S355 (مبحث ۱۰)',
    nameFa: 'فولاد ساختمانی پرمقاومت S355 (مبحث ۱۰ مقررات ملی)',
    category: 'steel',
    isStandard: true,
    properties: {
      elasticModulus: 210.0,
      poissonsRatio: 0.30,
      density: 7850,
      yieldStrength: 355.0,
      thermalExpansionAlpha: 1.2e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'مبحث ۱۰ مقررات ملی ساختمان / EN 10025-2',
    description: 'فولاد ساختمانی کربنی پرکاربرد در قاب‌های خمشی و مهاربندی تیرها و ستون‌های فولادی'
  },
  {
    id: 'std_steel_s275',
    name: 'Mild Steel S275 / A36',
    nameFa: 'فولاد نرمه ساختمانی S275 (معادل ASTM A36)',
    category: 'steel',
    isStandard: true,
    properties: {
      elasticModulus: 200.0,
      poissonsRatio: 0.28,
      density: 7850,
      yieldStrength: 275.0,
      thermalExpansionAlpha: 1.2e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'ASTM A36 / AISC 360-16',
    description: 'فولاد ساختمانی شکل‌پذیر برای مقاطع نورد گرم و صفحات اتصالات'
  },
  {
    id: 'std_steel_rebar_a3',
    name: 'Reinforcing Rebar AIII (400 MPa)',
    nameFa: 'فولاد میلگرد آجدار رده AIII (آج ۴۰۰)',
    category: 'steel',
    isStandard: true,
    properties: {
      elasticModulus: 200.0,
      poissonsRatio: 0.30,
      density: 7850,
      yieldStrength: 400.0,
      thermalExpansionAlpha: 1.2e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'مبحث ۹ مقررات ملی / استاندارد ۳۱۳۲ ایران',
    description: 'آرماتورهای طولی تیرها، ستون‌ها و دیوارهای برشی سازه‌های بتن مسلح'
  },

  // 2. Concrete Profiles
  {
    id: 'std_concrete_c30',
    name: 'Structural Concrete C30/37 (مبحث ۹)',
    nameFa: 'بتن سازه‌ای معمولی رده C30 (مبحث ۹ مقررات ملی)',
    category: 'concrete',
    isStandard: true,
    properties: {
      elasticModulus: 30.0,
      poissonsRatio: 0.20,
      density: 2400,
      yieldStrength: 30.0,
      compressiveStrength: 30.0,
      thermalExpansionAlpha: 1.0e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'مبحث ۹ مقررات ملی / ACI 318-19',
    description: 'بتن سازه‌ای استاندارد برای دال‌ها، ستون‌ها و فونداسیون‌های رادیه ساختمان‌های شهری'
  },
  {
    id: 'std_concrete_c40',
    name: 'High-Strength Concrete C40/50',
    nameFa: 'بتن پرمقاومت رده C40 (برج‌ها و دهانه‌های بزرگ)',
    category: 'concrete',
    isStandard: true,
    properties: {
      elasticModulus: 35.0,
      poissonsRatio: 0.20,
      density: 2450,
      yieldStrength: 40.0,
      compressiveStrength: 40.0,
      thermalExpansionAlpha: 1.0e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'ACI 363R / مبحث ۹',
    description: 'بتن با روانی بالا و مقاومت فشاری ویژه مناسب ستون‌های باربر طبقات پایین برج‌ها'
  },
  {
    id: 'std_concrete_c25',
    name: 'Standard Concrete C25/30',
    nameFa: 'بتن رده C25 (سازه‌های سبک و کفسازی)',
    category: 'concrete',
    isStandard: true,
    properties: {
      elasticModulus: 26.5,
      poissonsRatio: 0.18,
      density: 2350,
      yieldStrength: 25.0,
      compressiveStrength: 25.0,
      thermalExpansionAlpha: 1.0e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'مبحث ۹ مقررات ملی',
    description: 'مناسب دیوارهای حائل کم‌ارتفاع و سقف‌های تیرچه بلوک'
  },

  // 3. Timber Profiles
  {
    id: 'std_timber_c24',
    name: 'Softwood Structural Timber C24',
    nameFa: 'چوب سازه‌ای سوزنی‌برگ رده C24 (کاج و صنوبر)',
    category: 'timber',
    isStandard: true,
    properties: {
      elasticModulus: 11.0,
      poissonsRatio: 0.35,
      density: 420,
      yieldStrength: 24.0,
      thermalExpansionAlpha: 0.5e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'EN 338 / Eurocode 5',
    description: 'چوب ساختمانی پرکاربرد در خرپاهای سقفی، قاب‌های سبک چوبی و کف‌سازی'
  },
  {
    id: 'std_timber_glulam_gl28h',
    name: 'Glued Laminated Timber (Glulam GL28h)',
    nameFa: 'چوب چندلایه مهندسی‌شده گلوالم رده GL28h',
    category: 'timber',
    isStandard: true,
    properties: {
      elasticModulus: 12.6,
      poissonsRatio: 0.38,
      density: 460,
      yieldStrength: 28.0,
      thermalExpansionAlpha: 0.5e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'EN 14080 / Eurocode 5',
    description: 'تیرهای قوسی و دهانه‌های بزرگ چوبی با صلبیت و تاب‌آوری بالای لرزه‌ای'
  },
  {
    id: 'std_timber_hardwood_d40',
    name: 'Hardwood Timber D40 (بلوط و راش)',
    nameFa: 'چوب سخت پهن‌برگ سازه‌ای رده D40',
    category: 'timber',
    isStandard: true,
    properties: {
      elasticModulus: 13.0,
      poissonsRatio: 0.32,
      density: 660,
      yieldStrength: 40.0,
      thermalExpansionAlpha: 0.6e-5
    },
    version: 1,
    history: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    projectId: 'global',
    standardReference: 'EN 338',
    description: 'چوب سنگین مقاوم در برابر سایش برای ستون‌های چوبی و اتصالات سنگین'
  }
];

/**
 * Real-time Validation Function
 */
export interface ValidationResult {
  isValid: boolean;
  errors: {
    elasticModulus?: string;
    poissonsRatio?: string;
    density?: string;
    name?: string;
  };
}

export function validateMaterialProperties(
  category: MaterialCategory,
  properties: CoreMechanicalProperties,
  name?: string
): ValidationResult {
  const rules = MATERIAL_VALIDATION_RULES[category];
  const errors: ValidationResult['errors'] = {};

  if (name !== undefined && !name.trim()) {
    errors.name = 'نام پروفیل مصالح نمی‌تواند خالی باشد.';
  }

  // Elastic Modulus check
  if (properties.elasticModulus < rules.elasticModulus.min || properties.elasticModulus > rules.elasticModulus.max) {
    errors.elasticModulus = `مدول الاستیسیته برای دسته ${category} باید در محدوده مجاز فیزیکی [${rules.elasticModulus.min} تا ${rules.elasticModulus.max} ${rules.elasticModulus.unit}] باشد.`;
  }

  // Poisson's Ratio check
  if (properties.poissonsRatio < rules.poissonsRatio.min || properties.poissonsRatio > rules.poissonsRatio.max) {
    errors.poissonsRatio = `ضریب پواسون برای دسته ${category} باید در محدوده مجاز [${rules.poissonsRatio.min} تا ${rules.poissonsRatio.max}] باشد.`;
  }

  // Density check
  if (properties.density < rules.density.min || properties.density > rules.density.max) {
    errors.density = `چگالی مصالح برای دسته ${category} باید در محدوده مجاز [${rules.density.min} تا ${rules.density.max} ${rules.density.unit}] باشد.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Standardized Data Interface DTO for External FEA / Structural Engines
 */
export interface StandardMaterialDTO {
  id: string;
  name: string;
  nameFa: string;
  category: MaterialCategory;
  elasticModulusE: number; // in GPa
  poissonsRatioNu: number;
  densityRho: number; // kg/m³
  yieldStrengthFy: number; // MPa
  thermalExpansionAlpha: number;
  version: number;
  isStandard: boolean;
}

export function toStandardMaterialDTO(profile: MaterialProfile): StandardMaterialDTO {
  return {
    id: profile.id,
    name: profile.name,
    nameFa: profile.nameFa,
    category: profile.category,
    elasticModulusE: profile.properties.elasticModulus,
    poissonsRatioNu: profile.properties.poissonsRatio,
    densityRho: profile.properties.density,
    yieldStrengthFy: profile.properties.yieldStrength || (profile.category === 'steel' ? 355 : profile.category === 'concrete' ? 30 : 24),
    thermalExpansionAlpha: profile.properties.thermalExpansionAlpha || 1.0e-5,
    version: profile.version,
    isStandard: profile.isStandard
  };
}
