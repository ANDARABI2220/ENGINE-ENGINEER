import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Project } from '../types';
import { INITIAL_PROJECTS } from '../data/afghanistanData';
import { indexedDBService } from '../services/indexedDBService';
import {
  MaterialProfile,
  StandardMaterialDTO,
  INDUSTRY_STANDARD_MATERIALS,
  toStandardMaterialDTO
} from '../types/material';

export interface MonthlyMetric {
  month: string;
  solarMonthIndex: number;
  plannedProgress: number; // 0 - 100%
  actualProgress: number | null; // 0 - 100% or null for future
  plannedCostM: number; // in Millions AFN (Cumulative Planned Value - PV)
  actualCostM: number | null; // in Millions AFN (Cumulative Actual Cost - AC)
  earnedValueM: number | null; // in Millions AFN (EV = Progress % * Total Budget)
  monthlyBurnM: number; // in Millions AFN spent in this specific month
  monthlyPlannedBurnM: number; // in Millions AFN planned for this specific month
  isForecast: boolean;
  milestone?: string;
}

export interface CostCategoryItem {
  category: string;
  spentM: number;
  budgetM: number;
  percent: number;
  color: string;
}

export interface EVMMetrics {
  totalBudgetM: number;
  actualCostM: number;
  plannedValueM: number;
  earnedValueM: number;
  costVarianceM: number; // CV = EV - AC
  scheduleVarianceM: number; // SV = EV - PV
  cpi: number; // CPI = EV / AC
  spi: number; // SPI = EV / PV
  estimateAtCompletionM: number; // EAC = BAC / CPI
  remainingBudgetM: number;
  averageMonthlyBurnM: number;
  runwayMonths: number;
  healthStatus: 'healthy' | 'caution' | 'critical';
}

export interface ProjectMilestone {
  id: string;
  name: string;
  phase: string;
  plannedProgress: number; // 0 - 100%
  actualProgress: number; // 0 - 100%
  targetDate: string;
  status: 'completed' | 'in_progress' | 'delayed' | 'upcoming';
  criticalPath: boolean;
}

export interface ProjectContextType {
  projects: Project[];
  currentProjectId: string;
  currentProject: Project;
  setCurrentProjectId: (id: string) => void;
  monthlyMetrics: MonthlyMetric[];
  costCategories: CostCategoryItem[];
  projectMilestones: ProjectMilestone[];
  evmMetrics: EVMMetrics;
  timeFilter: 'all' | 'historical' | 'forecast';
  setTimeFilter: (filter: 'all' | 'historical' | 'forecast') => void;
  // Material Manager State & Methods
  materials: MaterialProfile[];
  activeMaterialId: string;
  setActiveMaterialId: (id: string) => void;
  activeMaterialDTO: StandardMaterialDTO;
  createMaterial: (data: Omit<MaterialProfile, 'id' | 'version' | 'history' | 'createdAt' | 'updatedAt'>) => MaterialProfile;
  updateMaterial: (id: string, updates: Partial<MaterialProfile>, changeSummary?: string) => MaterialProfile | null;
  deleteMaterial: (id: string) => boolean;
  resetMaterialsToDefault: () => void;
  getMaterialById: (id: string) => MaterialProfile | undefined;
}

// Comprehensive monthly data for each project
export const PROJECT_METRICS_MAP: Record<string, MonthlyMetric[]> = {
  'proj-01': [
    { month: 'حمل ۱۴۰۵', solarMonthIndex: 1, plannedProgress: 5, actualProgress: 5, plannedCostM: 6.2, actualCostM: 5.8, earnedValueM: 6.25, monthlyBurnM: 5.8, monthlyPlannedBurnM: 6.2, isForecast: false, milestone: 'تجهیز کارگاه و گمانه‌زنی' },
    { month: 'ثور ۱۴۰۵', solarMonthIndex: 2, plannedProgress: 12, actualProgress: 14, plannedCostM: 15.0, actualCostM: 14.5, earnedValueM: 17.5, monthlyBurnM: 8.7, monthlyPlannedBurnM: 8.8, isForecast: false, milestone: 'تکمیل گودبرداری' },
    { month: 'جوزا ۱۴۰۵', solarMonthIndex: 3, plannedProgress: 20, actualProgress: 22, plannedCostM: 25.0, actualCostM: 24.2, earnedValueM: 27.5, monthlyBurnM: 9.7, monthlyPlannedBurnM: 10.0, isForecast: false, milestone: 'بتن‌ریزی فونداسیون رادیه' },
    { month: 'سرطان ۱۴۰۵', solarMonthIndex: 4, plannedProgress: 28, actualProgress: 30, plannedCostM: 35.0, actualCostM: 34.0, earnedValueM: 37.5, monthlyBurnM: 9.8, monthlyPlannedBurnM: 10.0, isForecast: false, milestone: 'اجرای سقف منفی ۲' },
    { month: 'اسد ۱۴۰۵', solarMonthIndex: 5, plannedProgress: 35, actualProgress: 36, plannedCostM: 43.8, actualCostM: 42.5, earnedValueM: 45.0, monthlyBurnM: 8.5, monthlyPlannedBurnM: 8.8, isForecast: false, milestone: 'تکمیل اسکلت زیرزمین‌ها' },
    { month: 'سنبله ۱۴۰۵ (جاری)', solarMonthIndex: 6, plannedProgress: 40, actualProgress: 42, plannedCostM: 50.0, actualCostM: 48.2, earnedValueM: 52.5, monthlyBurnM: 5.7, monthlyPlannedBurnM: 6.2, isForecast: false, milestone: 'آرماتوربندی طبقه ۳ روی همکف' },
    { month: 'میزان ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 7, plannedProgress: 48, actualProgress: null, plannedCostM: 60.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 10.0, monthlyPlannedBurnM: 10.0, isForecast: true, milestone: 'اجرای اسکلت طبقه ۶' },
    { month: 'عقرب ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 8, plannedProgress: 56, actualProgress: null, plannedCostM: 70.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 10.5, monthlyPlannedBurnM: 10.0, isForecast: true, milestone: 'شروع سفت‌کاری و تیغه‌چینی' },
    { month: 'قوس ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 9, plannedProgress: 65, actualProgress: null, plannedCostM: 81.2, actualCostM: null, earnedValueM: null, monthlyBurnM: 11.2, monthlyPlannedBurnM: 11.2, isForecast: true, milestone: 'رایزر تأسیسات مکانیکی و برقی' },
    { month: 'جدی ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 10, plannedProgress: 74, actualProgress: null, plannedCostM: 92.5, actualCostM: null, earnedValueM: null, monthlyBurnM: 11.3, monthlyPlannedBurnM: 11.3, isForecast: true },
    { month: 'دلو ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 11, plannedProgress: 83, actualProgress: null, plannedCostM: 104.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 11.5, monthlyPlannedBurnM: 11.5, isForecast: true },
    { month: 'حوت ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 12, plannedProgress: 92, actualProgress: null, plannedCostM: 115.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 11.0, monthlyPlannedBurnM: 11.0, isForecast: true, milestone: 'پایان اسکلت و نمای شیشه‌ای' },
  ],
  'proj-02': [
    { month: 'حمل ۱۴۰۵', solarMonthIndex: 1, plannedProgress: 25, actualProgress: 26, plannedCostM: 21.0, actualCostM: 20.5, earnedValueM: 22.1, monthlyBurnM: 5.5, monthlyPlannedBurnM: 5.5, isForecast: false, milestone: 'تکمیل سفت‌کاری بلوک الف' },
    { month: 'ثور ۱۴۰۵', solarMonthIndex: 2, plannedProgress: 35, actualProgress: 37, plannedCostM: 30.0, actualCostM: 29.2, earnedValueM: 31.45, monthlyBurnM: 8.7, monthlyPlannedBurnM: 9.0, isForecast: false },
    { month: 'جوزا ۱۴۰۵', solarMonthIndex: 3, plannedProgress: 45, actualProgress: 46, plannedCostM: 38.5, actualCostM: 37.8, earnedValueM: 39.1, monthlyBurnM: 8.6, monthlyPlannedBurnM: 8.5, isForecast: false, milestone: 'لوله کشی گاز و اطفای حریق' },
    { month: 'سرطان ۱۴۰۵', solarMonthIndex: 4, plannedProgress: 55, actualProgress: 57, plannedCostM: 47.0, actualCostM: 46.0, earnedValueM: 48.45, monthlyBurnM: 8.2, monthlyPlannedBurnM: 8.5, isForecast: false, milestone: 'کف‌سازی و سرامیک‌کاری' },
    { month: 'اسد ۱۴۰۵', solarMonthIndex: 5, plannedProgress: 62, actualProgress: 64, plannedCostM: 53.0, actualCostM: 52.1, earnedValueM: 54.4, monthlyBurnM: 6.1, monthlyPlannedBurnM: 6.0, isForecast: false },
    { month: 'سنبله ۱۴۰۵ (جاری)', solarMonthIndex: 6, plannedProgress: 66, actualProgress: 68, plannedCostM: 56.5, actualCostM: 55.4, earnedValueM: 57.8, monthlyBurnM: 3.3, monthlyPlannedBurnM: 3.5, isForecast: false, milestone: 'نصب آسانسور و درب‌ها' },
    { month: 'میزان ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 7, plannedProgress: 75, actualProgress: null, plannedCostM: 64.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 7.5, monthlyPlannedBurnM: 7.5, isForecast: true },
    { month: 'عقرب ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 8, plannedProgress: 85, actualProgress: null, plannedCostM: 72.5, actualCostM: null, earnedValueM: null, monthlyBurnM: 8.5, monthlyPlannedBurnM: 8.5, isForecast: true, milestone: 'نقاشی و روشنایی نهایی' },
    { month: 'قوس ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 9, plannedProgress: 95, actualProgress: null, plannedCostM: 81.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 8.5, monthlyPlannedBurnM: 8.5, isForecast: true, milestone: 'تحویل موقت واحدها' },
  ],
  'proj-03': [
    { month: 'حمل ۱۴۰۵', solarMonthIndex: 1, plannedProgress: 2, actualProgress: 2, plannedCostM: 3.0, actualCostM: 2.8, earnedValueM: 2.8, monthlyBurnM: 2.8, monthlyPlannedBurnM: 3.0, isForecast: false, milestone: 'تسطیح اراضی بندر' },
    { month: 'ثور ۱۴۰۵', solarMonthIndex: 2, plannedProgress: 6, actualProgress: 5, plannedCostM: 8.5, actualCostM: 7.5, earnedValueM: 7.0, monthlyBurnM: 4.7, monthlyPlannedBurnM: 5.5, isForecast: false },
    { month: 'جوزا ۱۴۰۵', solarMonthIndex: 3, plannedProgress: 10, actualProgress: 9, plannedCostM: 14.0, actualCostM: 13.0, earnedValueM: 12.6, monthlyBurnM: 5.5, monthlyPlannedBurnM: 5.5, isForecast: false, milestone: 'زیرسازی ریل و آسفالت' },
    { month: 'سرطان ۱۴۰۵', solarMonthIndex: 4, plannedProgress: 14, actualProgress: 13, plannedCostM: 20.0, actualCostM: 18.5, earnedValueM: 18.2, monthlyBurnM: 5.5, monthlyPlannedBurnM: 6.0, isForecast: false },
    { month: 'اسد ۱۴۰۵', solarMonthIndex: 5, plannedProgress: 16, actualProgress: 16, plannedCostM: 23.0, actualCostM: 22.0, earnedValueM: 22.4, monthlyBurnM: 3.5, monthlyPlannedBurnM: 3.0, isForecast: false, milestone: 'فونداسیون سوله‌های انبار' },
    { month: 'سنبله ۱۴۰۵ (جاری)', solarMonthIndex: 6, plannedProgress: 18, actualProgress: 18, plannedCostM: 25.5, actualCostM: 24.5, earnedValueM: 25.2, monthlyBurnM: 2.5, monthlyPlannedBurnM: 2.5, isForecast: false, milestone: 'نصب اسکلت فلزی سوله ۱' },
    { month: 'میزان ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 7, plannedProgress: 25, actualProgress: null, plannedCostM: 35.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 9.5, monthlyPlannedBurnM: 9.5, isForecast: true },
    { month: 'عقرب ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 8, plannedProgress: 32, actualProgress: null, plannedCostM: 45.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 10.0, monthlyPlannedBurnM: 10.0, isForecast: true },
    { month: 'قوس ۱۴۰۵ (پیش‌بینی)', solarMonthIndex: 9, plannedProgress: 40, actualProgress: null, plannedCostM: 56.0, actualCostM: null, earnedValueM: null, monthlyBurnM: 11.0, monthlyPlannedBurnM: 11.0, isForecast: true, milestone: 'تکمیل ساندویچ پانل سقف' },
  ]
};

export const PROJECT_COST_CATEGORIES_MAP: Record<string, CostCategoryItem[]> = {
  'proj-01': [
    { category: 'میلگرد و فولاد سازه', spentM: 18.5, budgetM: 42.0, percent: 38, color: '#f59e0b' },
    { category: 'بتن آماده و قالب‌بندی', spentM: 14.2, budgetM: 32.0, percent: 29, color: '#38bdf8' },
    { category: 'تأسیسات الکترومکانیکال (MEP)', spentM: 6.5, budgetM: 24.0, percent: 13, color: '#a855f7' },
    { category: 'نیروی انسانی و دستمزد', spentM: 5.2, budgetM: 15.0, percent: 11, color: '#10b981' },
    { category: 'ماشین‌آلات و تجهیزات کارگاه', spentM: 3.8, budgetM: 12.0, percent: 9, color: '#ec4899' },
  ],
  'proj-02': [
    { category: 'نازک‌کاری و متریال معماری', spentM: 24.5, budgetM: 35.0, percent: 44, color: '#f59e0b' },
    { category: 'تأسیسات سرمایش و گرمایش', spentM: 15.2, budgetM: 22.0, percent: 27, color: '#38bdf8' },
    { category: 'نیروی انسانی و پیمانکاران جزء', spentM: 9.8, budgetM: 16.0, percent: 18, color: '#10b981' },
    { category: 'آسانسور و تجهیزات ویژه', spentM: 5.9, budgetM: 12.0, percent: 11, color: '#a855f7' },
  ],
  'proj-03': [
    { category: 'خاکبرداری و زیرسازی محوطه', spentM: 11.2, budgetM: 45.0, percent: 46, color: '#f59e0b' },
    { category: 'اسکلت فلزی و پوشش سوله', spentM: 8.5, budgetM: 50.0, percent: 35, color: '#38bdf8' },
    { category: 'ماشین‌آلات سنگین راهسازی', spentM: 3.2, budgetM: 25.0, percent: 13, color: '#ec4899' },
    { category: 'مجوزها، ژئوتکنیک و نظارت', spentM: 1.6, budgetM: 20.0, percent: 6, color: '#10b981' },
  ]
};

export const PROJECT_MILESTONES_MAP: Record<string, ProjectMilestone[]> = {
  'proj-01': [
    { id: 'm-01', name: 'تجهیز کارگاه و مطالعات خاک (BH01-BH03)', phase: 'فاز ۱: ژئوتکنیک', plannedProgress: 100, actualProgress: 100, targetDate: '۱۴۰۴/۱۲/۱۵', status: 'completed', criticalPath: false },
    { id: 'm-02', name: 'اخذ جواز شهرداری کابل و استاندارد ANSA', phase: 'فاز ۱: مستندات قانونی', plannedProgress: 100, actualProgress: 100, targetDate: '۱۴۰۴/۱۲/۲۵', status: 'completed', criticalPath: true },
    { id: 'm-03', name: 'گودبرداری عمیق (-۸.۵م) و نیلینگ دیواره', phase: 'فاز ۲: خاکی و نگهبان', plannedProgress: 100, actualProgress: 100, targetDate: '۱۴۰۵/۰۱/۲۵', status: 'completed', criticalPath: true },
    { id: 'm-04', name: 'آرماتوربندی و فونداسیون گسترده رادیه (S01-S05)', phase: 'فاز ۲: پی‌ریزی', plannedProgress: 100, actualProgress: 100, targetDate: '۱۴۰۵/۰۳/۱۰', status: 'completed', criticalPath: true },
    { id: 'm-05', name: 'اسکلت بتنی زیرزمین‌ها (منفی ۱ تا ۳)', phase: 'فاز ۳: اسکلت بتنی', plannedProgress: 100, actualProgress: 95, targetDate: '۱۴۰۵/۰۵/۲۰', status: 'in_progress', criticalPath: true },
    { id: 'm-06', name: 'اسکلت سازه بتنی طبقات روی همکف (۱ تا ۶)', phase: 'فاز ۳: اسکلت بتنی', plannedProgress: 65, actualProgress: 60, targetDate: '۱۴۰۵/۰۸/۳۰', status: 'in_progress', criticalPath: true },
    { id: 'm-07', name: 'رایزرهای تأسیسات مکانیکی و آتشنشانی (MEP)', phase: 'فاز ۴: تأسیسات', plannedProgress: 35, actualProgress: 28, targetDate: '۱۴۰۵/۱۰/۱۵', status: 'delayed', criticalPath: false },
    { id: 'm-08', name: 'سفت‌کاری، تیغه‌چینی و عایق‌کاری طبقات', phase: 'فاز ۴: بنایی', plannedProgress: 25, actualProgress: 18, targetDate: '۱۴۰۵/۱۱/۲۰', status: 'in_progress', criticalPath: false },
    { id: 'm-09', name: 'نمای کرتین‌وال شیشه‌ای و نازک‌کاری نهایی', phase: 'فاز ۵: نما و تکمیلی', plannedProgress: 10, actualProgress: 5, targetDate: '۱۴۰۶/۰۵/۳۰', status: 'upcoming', criticalPath: false }
  ],
  'proj-02': [
    { id: 'm-21', name: 'تجهیز کارگاه و مطالعات خاک هرات', phase: 'فاز ۱: آماده‌سازی', plannedProgress: 100, actualProgress: 100, targetDate: '۱۴۰۴/۰۶/۱۰', status: 'completed', criticalPath: false },
    { id: 'm-22', name: 'اسکلت بتنی و سقف‌های تیرچه بلوک', phase: 'فاز ۲: سازه بتنی', plannedProgress: 100, actualProgress: 100, targetDate: '۱۴۰۴/۱۱/۲۰', status: 'completed', criticalPath: true },
    { id: 'm-23', name: 'سفت‌کاری و دیوارچینی بلوک الف و ب', phase: 'فاز ۳: سفت‌کاری', plannedProgress: 100, actualProgress: 98, targetDate: '۱۴۰۵/۰۲/۱۵', status: 'in_progress', criticalPath: true },
    { id: 'm-24', name: 'تأسیسات برق، آب و گاز شهری هرات', phase: 'فاز ۳: تأسیسات MEP', plannedProgress: 85, actualProgress: 80, targetDate: '۱۴۰۵/۰۵/۳۰', status: 'in_progress', criticalPath: false },
    { id: 'm-25', name: 'نازک‌کاری، سفیدکاری و سرامیک کف', phase: 'فاز ۴: نازک‌کاری', plannedProgress: 70, actualProgress: 68, targetDate: '۱۴۰۵/۰۸/۱۵', status: 'in_progress', criticalPath: false },
    { id: 'm-26', name: 'نصب آسانسور و تجهیزات موتورخانه', phase: 'فاز ۴: تجهیزات', plannedProgress: 55, actualProgress: 50, targetDate: '۱۴۰۵/۱۰/۱۰', status: 'in_progress', criticalPath: true },
    { id: 'm-27', name: 'نقاشی، درب‌ها و نصبیات تحویل موقت', phase: 'فاز ۵: تحویل', plannedProgress: 30, actualProgress: 25, targetDate: '۱۴۰۵/۱۲/۲۰', status: 'upcoming', criticalPath: true }
  ],
  'proj-03': [
    { id: 'm-31', name: 'تسطیح و آزمایش خاک محوطه بندر حیرتان', phase: 'فاز ۱: خاکبرداری', plannedProgress: 100, actualProgress: 100, targetDate: '۱۴۰۵/۰۲/۲۰', status: 'completed', criticalPath: false },
    { id: 'm-32', name: 'دیوار پیرامونی و فنس امنیتی گمرک', phase: 'فاز ۱: محوطه‌سازی', plannedProgress: 100, actualProgress: 95, targetDate: '۱۴۰۵/۰۴/۱۵', status: 'in_progress', criticalPath: false },
    { id: 'm-33', name: 'فونداسیون بتنی سوله‌های انبار ۱ و ۲', phase: 'فاز ۲: پی‌ریزی', plannedProgress: 50, actualProgress: 45, targetDate: '۱۴۰۵/۰۶/۳۰', status: 'in_progress', criticalPath: true },
    { id: 'm-34', name: 'ساخت و نصب اسکلت فلزی سوله مرکزی', phase: 'فاز ۲: اسکلت فولادی', plannedProgress: 30, actualProgress: 20, targetDate: '۱۴۰۵/۰۹/۲۰', status: 'delayed', criticalPath: true },
    { id: 'm-35', name: 'زیرسازی خطوط ریل بارانداز بندر', phase: 'فاز ۳: ریل و بارانداز', plannedProgress: 20, actualProgress: 12, targetDate: '۱۴۰۵/۱۲/۱۰', status: 'in_progress', criticalPath: true },
    { id: 'm-36', name: 'تأسیسات روشنایی محوطه و ژنراتور اضطراری', phase: 'فاز ۳: برق و محوطه', plannedProgress: 10, actualProgress: 5, targetDate: '۱۴۰۶/۰۸/۳۰', status: 'upcoming', criticalPath: false }
  ]
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{
  children: React.ReactNode;
  initialProjectId?: string;
  onProjectChange?: (id: string) => void;
}> = ({ children, initialProjectId = 'proj-01', onProjectChange }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectIdState] = useState<string>(initialProjectId);
  const [timeFilter, setTimeFilter] = useState<'all' | 'historical' | 'forecast'>('all');

  // Load offline projects from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    indexedDBService.getOfflineProjects().then((offlineProjects) => {
      if (!isMounted) return;
      if (offlineProjects && offlineProjects.length > 0) {
        setProjects(offlineProjects);
      }
    }).catch((err) => {
      console.warn('[ProjectContext] IndexedDB load notice:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const setCurrentProjectId = (id: string) => {
    setCurrentProjectIdState(id);
    if (onProjectChange) {
      onProjectChange(id);
    }
  };

  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === currentProjectId) || projects[0];
  }, [projects, currentProjectId]);

  const rawMetrics = useMemo(() => {
    return PROJECT_METRICS_MAP[currentProjectId] || PROJECT_METRICS_MAP['proj-01'];
  }, [currentProjectId]);

  const monthlyMetrics = useMemo(() => {
    if (timeFilter === 'historical') {
      return rawMetrics.filter((m) => !m.isForecast);
    }
    if (timeFilter === 'forecast') {
      return rawMetrics.filter((m) => m.isForecast || m.month.includes('جاری'));
    }
    return rawMetrics;
  }, [rawMetrics, timeFilter]);

  const costCategories = useMemo(() => {
    return PROJECT_COST_CATEGORIES_MAP[currentProjectId] || PROJECT_COST_CATEGORIES_MAP['proj-01'];
  }, [currentProjectId]);

  const projectMilestones = useMemo(() => {
    return PROJECT_MILESTONES_MAP[currentProjectId] || PROJECT_MILESTONES_MAP['proj-01'];
  }, [currentProjectId]);

  const evmMetrics: EVMMetrics = useMemo(() => {
    const totalBudgetM = currentProject.budget / 1000000;
    const currentMonthMetric = rawMetrics.find((m) => m.month.includes('جاری')) || rawMetrics[rawMetrics.length - 1];
    const actualCostM = currentMonthMetric?.actualCostM ?? 48.2;
    const plannedValueM = currentMonthMetric?.plannedCostM ?? 50.0;
    const earnedValueM = (currentProject.progressPercent / 100) * totalBudgetM;

    const costVarianceM = earnedValueM - actualCostM;
    const scheduleVarianceM = earnedValueM - plannedValueM;

    const cpi = actualCostM > 0 ? parseFloat((earnedValueM / actualCostM).toFixed(2)) : 1.0;
    const spi = plannedValueM > 0 ? parseFloat((earnedValueM / plannedValueM).toFixed(2)) : 1.0;

    const estimateAtCompletionM = cpi > 0 ? parseFloat((totalBudgetM / cpi).toFixed(1)) : totalBudgetM;
    const remainingBudgetM = parseFloat((totalBudgetM - actualCostM).toFixed(1));

    // Calculate historical burn rate average
    const historicalBurnMonths = rawMetrics.filter((m) => !m.isForecast);
    const totalBurned = historicalBurnMonths.reduce((sum, m) => sum + m.monthlyBurnM, 0);
    const averageMonthlyBurnM = historicalBurnMonths.length > 0
      ? parseFloat((totalBurned / historicalBurnMonths.length).toFixed(1))
      : 7.5;

    const runwayMonths = averageMonthlyBurnM > 0
      ? parseFloat((remainingBudgetM / averageMonthlyBurnM).toFixed(1))
      : 0;

    let healthStatus: 'healthy' | 'caution' | 'critical' = 'healthy';
    if (cpi < 0.9 || spi < 0.85 || runwayMonths < 4) {
      healthStatus = 'critical';
    } else if (cpi < 1.0 || spi < 0.95 || runwayMonths < 7) {
      healthStatus = 'caution';
    }

    return {
      totalBudgetM,
      actualCostM,
      plannedValueM,
      earnedValueM: parseFloat(earnedValueM.toFixed(1)),
      costVarianceM: parseFloat(costVarianceM.toFixed(1)),
      scheduleVarianceM: parseFloat(scheduleVarianceM.toFixed(1)),
      cpi,
      spi,
      estimateAtCompletionM,
      remainingBudgetM,
      averageMonthlyBurnM,
      runwayMonths,
      healthStatus
    };
  }, [currentProject, rawMetrics]);

  // Material Management State & Storage Persistence
  const [materials, setMaterials] = useState<MaterialProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`afghanabuild_materials_${initialProjectId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load materials from localStorage:', e);
    }
    return INDUSTRY_STANDARD_MATERIALS;
  });

  const [activeMaterialId, setActiveMaterialId] = useState<string>(() => {
    return materials[0]?.id || 'std_concrete_c30';
  });

  // Reload materials when currentProjectId changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`afghanabuild_materials_${currentProjectId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMaterials(parsed);
          setActiveMaterialId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    setMaterials(INDUSTRY_STANDARD_MATERIALS);
    setActiveMaterialId('std_concrete_c30');
  }, [currentProjectId]);

  // Persist materials whenever they change
  const persistMaterials = (updated: MaterialProfile[]) => {
    setMaterials(updated);
    try {
      localStorage.setItem(`afghanabuild_materials_${currentProjectId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save materials to localStorage:', e);
    }
  };

  const createMaterial = (
    data: Omit<MaterialProfile, 'id' | 'version' | 'history' | 'createdAt' | 'updatedAt'>
  ): MaterialProfile => {
    const newId = `mat_custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const newMaterial: MaterialProfile = {
      ...data,
      id: newId,
      isStandard: false,
      version: 1,
      history: [
        {
          version: 1,
          timestamp: now,
          author: 'مهندس محاسب سازه (Technical User)',
          changes: 'تعریف اولیه پروفیل مصالح سفارشی',
          snapshot: { ...data.properties }
        }
      ],
      createdAt: now,
      updatedAt: now,
      projectId: currentProjectId
    };

    const nextList = [newMaterial, ...materials];
    persistMaterials(nextList);
    setActiveMaterialId(newId);
    return newMaterial;
  };

  const updateMaterial = (
    id: string,
    updates: Partial<MaterialProfile>,
    changeSummary: string = 'ویرایش مشخصات مکانیکی مصالح'
  ): MaterialProfile | null => {
    const existingIndex = materials.findIndex((m) => m.id === id);
    if (existingIndex === -1) return null;

    const existing = materials[existingIndex];
    const now = new Date().toISOString();
    const newVersion = existing.version + 1;

    const updatedProfile: MaterialProfile = {
      ...existing,
      ...updates,
      version: newVersion,
      updatedAt: now,
      history: [
        {
          version: newVersion,
          timestamp: now,
          author: 'مهندس محاسب سازه (Technical User)',
          changes: changeSummary,
          snapshot: { ...(updates.properties || existing.properties) }
        },
        ...existing.history
      ]
    };

    const nextList = [...materials];
    nextList[existingIndex] = updatedProfile;
    persistMaterials(nextList);
    return updatedProfile;
  };

  const deleteMaterial = (id: string): boolean => {
    const target = materials.find((m) => m.id === id);
    if (!target) return false;
    // Don't delete industry standards, allow deleting custom materials
    const nextList = materials.filter((m) => m.id !== id);
    persistMaterials(nextList);
    if (activeMaterialId === id) {
      setActiveMaterialId(nextList[0]?.id || 'std_concrete_c30');
    }
    return true;
  };

  const resetMaterialsToDefault = () => {
    persistMaterials(INDUSTRY_STANDARD_MATERIALS);
    setActiveMaterialId('std_concrete_c30');
  };

  const getMaterialById = (id: string): MaterialProfile | undefined => {
    return materials.find((m) => m.id === id);
  };

  const activeMaterialDTO: StandardMaterialDTO = useMemo(() => {
    const current = materials.find((m) => m.id === activeMaterialId) || materials[0] || INDUSTRY_STANDARD_MATERIALS[0];
    return toStandardMaterialDTO(current);
  }, [materials, activeMaterialId]);

  const contextValue: ProjectContextType = {
    projects,
    currentProjectId,
    currentProject,
    setCurrentProjectId,
    monthlyMetrics,
    costCategories,
    projectMilestones,
    evmMetrics,
    timeFilter,
    setTimeFilter,
    materials,
    activeMaterialId,
    setActiveMaterialId,
    activeMaterialDTO,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    resetMaterialsToDefault,
    getMaterialById
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    // Graceful fallback if used outside Provider
    const fallbackProjects = INITIAL_PROJECTS;
    const fallbackProj = fallbackProjects[0];
    const metrics = PROJECT_METRICS_MAP['proj-01'];
    const defaultMats = INDUSTRY_STANDARD_MATERIALS;
    return {
      projects: fallbackProjects,
      currentProjectId: fallbackProj.id,
      currentProject: fallbackProj,
      setCurrentProjectId: () => {},
      monthlyMetrics: metrics,
      costCategories: PROJECT_COST_CATEGORIES_MAP['proj-01'],
      projectMilestones: PROJECT_MILESTONES_MAP['proj-01'],
      evmMetrics: {
        totalBudgetM: 125.0,
        actualCostM: 48.2,
        plannedValueM: 50.0,
        earnedValueM: 52.5,
        costVarianceM: 4.3,
        scheduleVarianceM: 2.5,
        cpi: 1.09,
        spi: 1.05,
        estimateAtCompletionM: 114.7,
        remainingBudgetM: 76.8,
        averageMonthlyBurnM: 7.8,
        runwayMonths: 9.8,
        healthStatus: 'healthy'
      },
      timeFilter: 'all',
      setTimeFilter: () => {},
      materials: defaultMats,
      activeMaterialId: defaultMats[0].id,
      setActiveMaterialId: () => {},
      activeMaterialDTO: toStandardMaterialDTO(defaultMats[0]),
      createMaterial: (d) => ({
        ...d,
        id: 'tmp_fallback',
        isStandard: false,
        version: 1,
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: 'proj-01'
      }),
      updateMaterial: () => null,
      deleteMaterial: () => true,
      resetMaterialsToDefault: () => {},
      getMaterialById: (id) => defaultMats.find((m) => m.id === id)
    };
  }
  return context;
};

export const useProject = useProjectContext;
