export type AppLanguage = 'fa' | 'ps' | 'en'; // دری / پشتو / English
export type CalendarType = 'solar' | 'gregorian'; // شمسی / میلادی
export type ThemeMode = 'dark' | 'light' | 'auto';

export interface ToastNotification {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message?: string;
  durationMs?: number; // 5000 for auto dismiss, 0 for sticky (errors)
  actionLabel?: string;
  onAction?: () => void;
}

export type UserRole =
  | 'ceo' // مدیر عامل
  | 'technical_director' // مدیر فنی
  | 'engineer_arch' // مهندس معماری
  | 'engineer_struct' // مهندس سازه
  | 'engineer_elec' // مهندس برق
  | 'engineer_mech' // مهندس مکانیک
  | 'geotech' // متخصص ژئوتکنیک
  | 'boq_estimator' // کارشناس برآورد
  | 'warehouse_manager' // مسئول انبار
  | 'procurement_manager' // مسئول خرید
  | 'accountant' // حسابدار
  | 'project_manager' // مدیر پروژه
  | 'field_worker'; // کاربر میدانی

export type DrawingSeries = 'A' | 'S' | 'E' | 'M';

// State machine per Page 8 & 11: Draft -> Review -> Approved / Published -> Superseded
export type DrawingStatus = 'draft' | 'review' | 'approved' | 'published' | 'superseded';

export type NoteCategory = 'architecture' | 'structure' | 'electrical' | 'mechanical' | 'general';

export interface CADElement {
  id: string;
  type: 'line' | 'rect' | 'circle' | 'column' | 'wall' | 'rebar' | 'dimension' | 'text' | 'beam' | 'door';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  radius?: number;
  color: string;
  strokeWidth: number;
  fill?: string;
  text?: string;
  label?: string;
  layer: string;
  rebarType?: string;
  spacing?: number;
}

export interface CADLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
}

export interface DrawingAnnotationPin {
  id: string;
  x: number;
  y: number;
  text: string;
  responsible: string;
  attachmentName?: string;
  scope: 'this_version_only' | 'propagate_all'; // Page 11
  createdAt: string;
}

export interface Drawing {
  id: string;
  projectId: string;
  series: DrawingSeries;
  code: string; // e.g. A01, S05, E12, M03
  title: string;
  floor: string;
  version: string; // Rev A, B, ...
  status: DrawingStatus;
  engineerName: string;
  linkedNoteIds: string[];
  annotations?: DrawingAnnotationPin[];
  elements?: CADElement[];
  cadData?: string;
  scale?: string;
  updatedAt: string;
  ownerId?: string;
}

export interface GeneralNote {
  id: string;
  code: string; // e.g. G-001, G-014
  category: NoteCategory;
  title: string;
  text: string;
  linkedDrawingCodes: string[];
  version: number;
  status: 'draft' | 'approved';
  createdBy: string;
  updatedAt: string;
  ownerId?: string;
}

export interface BOQItem {
  id: string;
  projectId: string;
  itemCode: string;
  description: string;
  category: 'بتن و قالب‌بندی' | 'فولاد و آرماتور' | 'سفت‌کاری و بنایی' | 'تأسیسات برقی' | 'تأسیسات مکانیکی' | 'نیروی انسانی و دستمزد' | 'ماشین‌آلات';
  unit: string;
  quantity: number;
  unitRate: number; // in AFN
  totalAmount: number;
  region: 'کابل' | 'هرات' | 'مزار شریف' | 'قندهار' | 'جلال‌آباد';
  updatedAt: string;
  ownerId?: string;
}

export interface SoilTest {
  id: string;
  projectId: string;
  boreholeId: string;
  depthMeters: number;
  sptNValue: number;
  soilClassification: string;
  bearingCapacityKpa: number;
  groundwaterDepthMeters: number;
  seismicZone: 'زون ۱ (خطر بسیار بالا)' | 'زون ۲ (خطر بالا)' | 'زون ۳ (متوسط)' | 'زون ۴ (کم)';
  recommendedFoundation: string;
  engineerNotes: string;
  testDate: string;
  ownerId?: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'سیمان و سنگدانه‌ها' | 'میلگرد و فولاد' | 'آجر و بلوک' | 'تجهیزات برق' | 'لوله‌کشی و بهداشتی' | 'تجهیزات ایمنی';
  warehouseLocation: 'انبار مرکزی کابل' | 'انبار کارگاه هرات' | 'انبار پایگاه مزار' | 'سایت پروژه';
  quantity: number;
  unit: string;
  minThreshold: number;
  unitCost: number; // in AFN
  supplierName: string;
  origin: 'domestic' | 'imported';
  qcStatus: 'passed' | 'pending' | 'failed';
  batchNumber: string;
  wastePercentage: number;
  updatedAt: string;
  ownerId?: string;
}

export interface InventoryReceiptRecord {
  id: string;
  itemCode: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  discrepancyPercent: number;
  hasAlert: boolean; // discrepancy > 5% (Page 12)
  receiptConfirmed: boolean;
  waybillPhotoUrl?: string;
  timestamp: string;
}

export interface FieldProgressReport {
  clientUuid: string;
  projectId: string;
  physicalProgress: number;
  notes: string;
  photosCount: number;
  gpsVerified: boolean;
  status: 'offline_queued' | 'synced' | 'conflict';
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  budget: number;
  currency: string;
  progressPercent: number;
  startDate: string;
  completionDate: string;
  ownerId?: string;
}

// 3-Stage Permit flow per Page 12
export interface PermitRecord {
  id: string;
  projectId: string;
  permitType: string;
  authority: string;
  submissionDate: string;
  approvalDate?: string;
  stage?: 'draft_request' | 'internal_approved' | 'legal_approved';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  referenceNumber: string;
  notes: string;
  expiryDate?: string;
  requiredDocs: { name: string; uploaded: boolean }[];
  ownerId?: string;
}

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  department: 'معماری' | 'سازه' | 'برق و مکانیک' | 'ژئوتکنیک' | 'متره و برآورد' | 'کارگاه میدانی';
  phone: string;
  salaryAFN: number;
  attendanceDays: number;
  safetyStatus: 'green' | 'yellow' | 'red';
  contractType: 'دائمی' | 'پروژه‌ای' | 'مشاوره‌ای';
}

export interface AuditEntry {
  id: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  timestamp: string;
  scope: 'سازمانی' | 'پروژه‌ای' | 'شخصی';
}
