import { BOQItem, SoilTest, InventoryItem, Project, PermitRecord, Employee } from '../types';

export interface RegionalRateProfile {
  city: 'کابل' | 'هرات' | 'مزار شریف' | 'قندهار' | 'جلال‌آباد';
  multiplier: number;
  seismicZone: string;
  designPGA: number; // Peak Ground Acceleration
  averageSnowLoadKpa: number;
  winterFrostDepthCm: number;
  primaryTradePartner: string;
}

export const AFGHAN_REGIONS: Record<string, RegionalRateProfile> = {
  'کابل': {
    city: 'کابل',
    multiplier: 1.0,
    seismicZone: 'زون ۱ (خطر بسیار بالا)',
    designPGA: 0.35,
    averageSnowLoadKpa: 1.5,
    winterFrostDepthCm: 80,
    primaryTradePartner: 'بازار داخلی و مرز تورخم'
  },
  'هرات': {
    city: 'هرات',
    multiplier: 0.94,
    seismicZone: 'زون ۲ (خطر بالا)',
    designPGA: 0.28,
    averageSnowLoadKpa: 0.8,
    winterFrostDepthCm: 40,
    primaryTradePartner: 'مرز اسلام‌قلعه (ایران)'
  },
  'مزار شریف': {
    city: 'مزار شریف',
    multiplier: 0.97,
    seismicZone: 'زون ۲ (خطر بالا)',
    designPGA: 0.30,
    averageSnowLoadKpa: 1.0,
    winterFrostDepthCm: 50,
    primaryTradePartner: 'بندر حیرتان (ازبکستان)'
  },
  'قندهار': {
    city: 'قندهار',
    multiplier: 1.03,
    seismicZone: 'زون ۳ (متوسط)',
    designPGA: 0.20,
    averageSnowLoadKpa: 0.3,
    winterFrostDepthCm: 20,
    primaryTradePartner: 'بندر اسپین‌بولدک (پاکستان)'
  },
  'جلال‌آباد': {
    city: 'جلال‌آباد',
    multiplier: 0.95,
    seismicZone: 'زون ۱ (خطر بسیار بالا)',
    designPGA: 0.38,
    averageSnowLoadKpa: 0.2,
    winterFrostDepthCm: 15,
    primaryTradePartner: 'گمرک تورخم (پاکستان)'
  }
};

export const INITIAL_PROJECT: Project = {
  id: 'proj-01',
  name: 'برج مسکونی کابل (Kabul Residential Tower)',
  code: 'AB-2024-001',
  client: 'وزارت شهرسازی و اراضی',
  location: 'کابل، ناحیه ۴',
  status: 'active',
  budget: 45000000, // 45 million AFN
  currency: 'AFN (افغانی)',
  progressPercent: 68,
  startDate: '1403/01/15',
  completionDate: '1403/06/30',
  ownerId: 'default-owner'
};

export const INITIAL_PROJECTS: Project[] = [
  INITIAL_PROJECT,
  {
    id: 'proj-02',
    name: 'پل بزرگ هرات (هریرود)',
    code: 'AB-2024-014',
    client: 'شهرداری هرات',
    location: 'هرات، کمربندی جنوبی',
    status: 'planning', // در انتظار تأیید
    budget: 32000000,
    currency: 'AFN (افغانی)',
    progressPercent: 42,
    startDate: '1403/02/01',
    completionDate: '1403/08/15',
    ownerId: 'default-owner'
  },
  {
    id: 'proj-03',
    name: 'مدرسه ۱۲ کلاسه مزارشریف',
    code: 'AB-2024-022',
    client: 'وزارت معارف',
    location: 'بلخ، مزارشریف',
    status: 'active',
    budget: 18500000,
    currency: 'AFN (افغانی)',
    progressPercent: 91,
    startDate: '1402/10/10',
    completionDate: '1403/05/20',
    ownerId: 'default-owner'
  },
  {
    id: 'proj-04',
    name: 'بازسازی جاده ترانزیتی قندهار',
    code: 'AB-2023-088',
    client: 'وزارت فواید عامه',
    location: 'قندهار، شاهراه اصلی',
    status: 'completed',
    budget: 85000000,
    currency: 'AFN (افغانی)',
    progressPercent: 100,
    startDate: '1402/04/01',
    completionDate: '1403/03/01',
    ownerId: 'default-owner'
  },
  {
    id: 'proj-05',
    name: 'مجتمع تجاری بین‌المللی جلال‌آباد',
    code: 'AB-2024-031',
    client: 'بخش خصوصی (سرمایه‌گذاری ننگرهار)',
    location: 'ننگرهار، جلال‌آباد',
    status: 'on_hold', // متوقف
    budget: 52000000,
    currency: 'AFN (افغانی)',
    progressPercent: 12,
    startDate: '1403/01/20',
    completionDate: '1404/01/10',
    ownerId: 'default-owner'
  }
];

export const INITIAL_BOQ_ITEMS: BOQItem[] = [
  {
    id: 'boq-01',
    projectId: 'proj-01',
    itemCode: 'BOQ-STR-01',
    description: 'بتن‌ریزی سازه‌ای با بتن آماده رده C30 پی و دیوارهای حائل شامل پمپاژ و ویبره',
    category: 'بتن و قالب‌بندی',
    unit: 'متر مکعب',
    quantity: 1450,
    unitRate: 4900,
    totalAmount: 7105000,
    region: 'کابل',
    updatedAt: '1405/07/12'
  },
  {
    id: 'boq-02',
    projectId: 'proj-01',
    itemCode: 'BOQ-STR-02',
    description: 'تهیه، برش، خم و بستن میلگرد آجدار فولادی AIII (سایز ۱۶ الی ۲۸ میلی‌متر)',
    category: 'فولاد و آرماتور',
    unit: 'تن',
    quantity: 210,
    unitRate: 59000,
    totalAmount: 12390000,
    region: 'کابل',
    updatedAt: '1405/07/12'
  },
  {
    id: 'boq-03',
    projectId: 'proj-01',
    itemCode: 'BOQ-STR-03',
    description: 'قالب‌بندی فلزی مدولار با داربست مثلثی برای ستون‌ها و دال‌های بتنی',
    category: 'بتن و قالب‌بندی',
    unit: 'متر مربع',
    quantity: 4800,
    unitRate: 480,
    totalAmount: 2304000,
    region: 'کابل',
    updatedAt: '1405/07/12'
  },
  {
    id: 'boq-04',
    projectId: 'proj-01',
    itemCode: 'BOQ-ARC-01',
    description: 'تیغه‌چینی با آجر سفال پخته ۲۰ سانتی با ملات ماسه سیمان ۱:۴ و میلگرد بستر',
    category: 'سفت‌کاری و بنایی',
    unit: 'متر مربع',
    quantity: 3200,
    unitRate: 850,
    totalAmount: 2720000,
    region: 'کابل',
    updatedAt: '1405/07/10'
  },
  {
    id: 'boq-05',
    projectId: 'proj-01',
    itemCode: 'BOQ-ELC-01',
    description: 'سیستم کامل کابل‌کشی تابلو اصلی MDP و فرعی‌ها به همراه سینی کابل گالوانیزه',
    category: 'تأسیسات برقی',
    unit: 'متر طول',
    quantity: 8500,
    unitRate: 320,
    totalAmount: 2720000,
    region: 'کابل',
    updatedAt: '1405/07/08'
  },
  {
    id: 'boq-06',
    projectId: 'proj-01',
    itemCode: 'BOQ-MEC-01',
    description: 'لوله‌کشی پنج‌لایه سرد و گرم و فاضلاب پوش‌فیت به همراه سیستم رایزر آتشنشانی',
    category: 'تأسیسات مکانیکی',
    unit: 'متر طول',
    quantity: 6200,
    unitRate: 410,
    totalAmount: 2542000,
    region: 'کابل',
    updatedAt: '1405/07/08'
  },
  {
    id: 'boq-07',
    projectId: 'proj-01',
    itemCode: 'BOQ-LBR-01',
    description: 'اکیپ ماهر آرماتوربندی و بتن‌ریزی (استادکاران و کارگران تخصصی)',
    category: 'نیروی انسانی و دستمزد',
    unit: 'روز-نفر',
    quantity: 1800,
    unitRate: 950,
    totalAmount: 1710000,
    region: 'کابل',
    updatedAt: '1405/07/05'
  },
  {
    id: 'boq-08',
    projectId: 'proj-01',
    itemCode: 'BOQ-EQP-01',
    description: 'اجاره و بهره‌برداری تاورکرین، پمپ بتن دکل‌دار و ژنراتور اضطراری کارگاه',
    category: 'ماشین‌آلات',
    unit: 'ماه',
    quantity: 6,
    unitRate: 380000,
    totalAmount: 2280000,
    region: 'کابل',
    updatedAt: '1405/07/05'
  }
];

export const INITIAL_SOIL_TESTS: SoilTest[] = [
  {
    id: 'soil-01',
    projectId: 'proj-01',
    boreholeId: 'BH-01 (گمانه شمالی)',
    depthMeters: 25,
    sptNValue: 32,
    soilClassification: 'شن رس‌دار متراکم با لایه‌های قلوه‌سنگی (GC-GM)',
    bearingCapacityKpa: 280,
    groundwaterDepthMeters: 14.5,
    seismicZone: 'زون ۱ (خطر بسیار بالا)',
    recommendedFoundation: 'پی گسترده متصل (Raft Foundation) با ضخامت ۱۲۰ سانتی‌متر',
    engineerNotes: 'لایه بستر دارای تراکم عالی است. خطر روان‌گرایی (Liquefaction) در لایه ۵ تا ۸ متری به علت دانه‌بندی شن بسیار ناچیز ارزیابی گردید. آزمایش برش مستقیم زاویه اصطکاک داخلی فی = ۳۴ درجه را نشان می‌دهد.',
    testDate: '1405/06/15'
  },
  {
    id: 'soil-02',
    projectId: 'proj-01',
    boreholeId: 'BH-02 (گمانه مرکزی - زیر هسته برشی)',
    depthMeters: 30,
    sptNValue: 45,
    soilClassification: 'سنگ متلاشی‌شده و ماسه‌سنگ فشرده (Bedrock Transition)',
    bearingCapacityKpa: 360,
    groundwaterDepthMeters: 16.0,
    seismicZone: 'زون ۱ (خطر بسیار بالا)',
    recommendedFoundation: 'پی گسترده تقویت‌شده زیر دیوار برشی با آرماتور متراکم',
    engineerNotes: 'ظرفیت باربری فوق‌العاده بالا زیر تراز منفی ۱۲ متر. برای نشست تفاضلی کمتر از ۲ سانتی‌متر کفایت کامل دارد.',
    testDate: '1405/06/18'
  },
  {
    id: 'soil-03',
    projectId: 'proj-01',
    boreholeId: 'BH-03 (گمانه جنوبی - محوطه پارکینگ)',
    depthMeters: 20,
    sptNValue: 24,
    soilClassification: 'رس کم‌پلاستیک با ماسه ریز (CL)',
    bearingCapacityKpa: 210,
    groundwaterDepthMeters: 12.8,
    seismicZone: 'زون ۱ (خطر بسیار بالا)',
    recommendedFoundation: 'بهسازی سطحی با بالاست کوبیده شده یا شمع‌های کوتاه موضعی',
    engineerNotes: 'رطوبت نسبی خاک در تراز ۵ متری بالاتر است. زهکشی حائل و لوله دور محوطه اکیداً توصیه می‌شود.',
    testDate: '1405/06/20'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-01',
    itemCode: 'MAT-ST-25',
    name: 'میلگرد آجدار فولادی Φ25 شاخه ۱۲ متری AIII',
    category: 'میلگرد و فولاد',
    warehouseLocation: 'انبار مرکزی کابل',
    quantity: 48,
    unit: 'تن',
    minThreshold: 20,
    unitCost: 58500,
    supplierName: 'کارخانه فولاد میهن / وارداتی از اصفهان',
    origin: 'imported',
    qcStatus: 'passed',
    batchNumber: 'BATCH-2026-ST25',
    wastePercentage: 3.2,
    updatedAt: '1405/07/11'
  },
  {
    id: 'inv-02',
    itemCode: 'MAT-ST-20',
    name: 'میلگرد آجدار فولادی Φ20 شاخه ۱۲ متری AIII',
    category: 'میلگرد و فولاد',
    warehouseLocation: 'انبار مرکزی کابل',
    quantity: 36,
    unit: 'تن',
    minThreshold: 15,
    unitCost: 58500,
    supplierName: 'مجتمع فولاد هرات / وارداتی',
    origin: 'imported',
    qcStatus: 'passed',
    batchNumber: 'BATCH-2026-ST20',
    wastePercentage: 2.8,
    updatedAt: '1405/07/11'
  },
  {
    id: 'inv-03',
    itemCode: 'MAT-CEM-01',
    name: 'سیمان پرتلند تیپ ۲ پاکتی ۵۰ کیلویی استاندارد غوری',
    category: 'سیمان و سنگدانه‌ها',
    warehouseLocation: 'انبار مرکزی کابل',
    quantity: 2400,
    unit: 'بوجی (کیسه)',
    minThreshold: 500,
    unitCost: 480,
    supplierName: 'کارخانه سیمان غوری پلخمری',
    origin: 'domestic',
    qcStatus: 'passed',
    batchNumber: 'BATCH-GHORI-09',
    wastePercentage: 1.5,
    updatedAt: '1405/07/12'
  },
  {
    id: 'inv-04',
    itemCode: 'MAT-BRK-01',
    name: 'آجر فشاری قرمز پخته کوره استاندارد کابل (۲۰×۱۰×۵)',
    category: 'آجر و بلوک',
    warehouseLocation: 'سایت پروژه',
    quantity: 65,
    unit: 'هزار عدد',
    minThreshold: 15,
    unitCost: 3200,
    supplierName: 'کوره‌های آجرپزی ده سبز کابل',
    origin: 'domestic',
    qcStatus: 'passed',
    batchNumber: 'BATCH-BRK-KBL-14',
    wastePercentage: 5.0,
    updatedAt: '1405/07/10'
  },
  {
    id: 'inv-05',
    itemCode: 'MAT-ELC-CAB',
    name: 'کابل مسی افشان نسوز ۴×۶ میلی‌متر با پوشش LSZH',
    category: 'تجهیزات برق',
    warehouseLocation: 'انبار مرکزی کابل',
    quantity: 1200,
    unit: 'متر',
    minThreshold: 300,
    unitCost: 185,
    supplierName: 'تأمین الکتریک کابل / کابل البرز',
    origin: 'imported',
    qcStatus: 'passed',
    batchNumber: 'BATCH-ELC-6MM',
    wastePercentage: 2.0,
    updatedAt: '1405/07/07'
  },
  {
    id: 'inv-06',
    itemCode: 'MAT-PIP-5L',
    name: 'لوله پنج‌لایه نیوپایپ سایز ۲۵ میلی‌متر فشار ۱۶ بار',
    category: 'لوله‌کشی و بهداشتی',
    warehouseLocation: 'انبار کارگاه هرات',
    quantity: 1850,
    unit: 'متر',
    minThreshold: 400,
    unitCost: 140,
    supplierName: 'بازرگانی شیرزاد هرات / واردات از ایران',
    origin: 'imported',
    qcStatus: 'passed',
    batchNumber: 'BATCH-PIP-NP25',
    wastePercentage: 2.5,
    updatedAt: '1405/07/06'
  }
];

export const INITIAL_PERMITS: PermitRecord[] = [
  {
    id: 'perm-01',
    projectId: 'proj-01',
    permitType: 'جواز ساختمانی و احداث بنا (Building Construction Permit)',
    authority: 'ریاست ناحیه دهم شهرداری کابل',
    submissionDate: '1404/09/10',
    approvalDate: '1404/10/25',
    status: 'approved',
    referenceNumber: 'KM-PERMIT-1404-9821',
    notes: 'تمام نقشه‌های معماری و سازه ممهور به مهر مهندس محاسب و تاییدیه رسمی شهرداری کابل گردید.',
    requiredDocs: [
      { name: 'سند مالکیت قباله شرعی زمین', uploaded: true },
      { name: 'نقشه‌های چهارگانه A/S/E/M تایید شده', uploaded: true },
      { name: 'گزارش ژئوتکنیک مکانیک خاک', uploaded: true },
      { name: 'فیش پرداخت عوارض نوسازی شهرداری', uploaded: true }
    ]
  },
  {
    id: 'perm-02',
    projectId: 'proj-01',
    permitType: 'تأییدیه انطباق استاندارد ملی و مقاومت لرزه‌ای',
    authority: 'اداره ملی استانداردهای افغانستان (ANSA)',
    submissionDate: '1404/10/05',
    approvalDate: '1404/11/02',
    status: 'approved',
    referenceNumber: 'ANSA-STR-2025-441',
    notes: 'انطباق تحلیل طیفی زلزله زون ۱ کابل و جزئیات بتن مسلح ACI 318 تایید گردید.',
    requiredDocs: [
      { name: 'دفترچه محاسبات بارگذاری زلزله و باد', uploaded: true },
      { name: 'مدل تحلیلی ETABS و SAFE', uploaded: true },
      { name: 'نتایج تست کشش آزمایشگاهی میلگرد', uploaded: true }
    ]
  },
  {
    id: 'perm-03',
    projectId: 'proj-01',
    permitType: 'مجوز ایمنی و سیستم اعلام/اطفا حریق',
    authority: 'اداره اطفائیه و دفاع مدنی وزارت امور داخله',
    submissionDate: '1405/06/10',
    status: 'under_review',
    referenceNumber: 'FIRE-DEPT-KBL-782',
    notes: 'بررسی راه پله فرار ضد دود، روشنایی اضطراری و شیرهای هیدرانت در دست بررسی کارشناسان است.',
    requiredDocs: [
      { name: 'پلان خروج اضطراری و زینه فرار', uploaded: true },
      { name: 'مشخصات فنی مخزن و بوستر پمپ حریق', uploaded: true },
      { name: 'گواهی استاندارد کابل‌های نسوز', uploaded: false }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-01', fullName: 'مهندس احمد کریمی', role: 'معمار ارشد و مدیر طراحی', department: 'معماری', phone: '+93 799 123 456', salaryAFN: 85000, attendanceDays: 26, safetyStatus: 'green', contractType: 'دائمی' },
  { id: 'emp-02', fullName: 'دکتر فهیم سلیمی', role: 'مهندس ارشد محاسب سازه', department: 'سازه', phone: '+93 788 234 567', salaryAFN: 95000, attendanceDays: 25, safetyStatus: 'green', contractType: 'دائمی' },
  { id: 'emp-03', fullName: 'مهندس وحید حسینی', role: 'مهندس طراح برق و اتوماسیون', department: 'برق و مکانیک', phone: '+93 777 345 678', salaryAFN: 70000, attendanceDays: 24, safetyStatus: 'green', contractType: 'دائمی' },
  { id: 'emp-04', fullName: 'مهندس جمشید نوری', role: 'مهندس مکانیک و سیالات', department: 'برق و مکانیک', phone: '+93 700 456 789', salaryAFN: 70000, attendanceDays: 26, safetyStatus: 'green', contractType: 'دائمی' },
  { id: 'emp-05', fullName: 'مهندس صفی‌الله رحمانی', role: 'سرپرست کارگاه و مدیر اجرایی', department: 'کارگاه میدانی', phone: '+93 789 567 890', salaryAFN: 75000, attendanceDays: 28, safetyStatus: 'green', contractType: 'دائمی' },
  { id: 'emp-06', fullName: 'محمد قاسم بارکزی', role: 'کارشناس ارشد متره، برآورد و زنجیره تامین', department: 'متره و برآورد', phone: '+93 798 678 901', salaryAFN: 60000, attendanceDays: 26, safetyStatus: 'green', contractType: 'دائمی' }
];
