import React, { useState } from 'react';
import {
  Palette,
  Type,
  Maximize2,
  Box,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sliders,
  Copy,
  Check,
  Moon,
  Sun,
  Printer,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export const DesignSystemGuide: React.FC = () => {
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'components' | 'spacing' | 'accessibility' | 'performance'>('colors');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Copy to clipboard helper
  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
    showSuccess('کپی شد', `کد رنگ ${hex} در کلیپ‌بورد کپی شد.`);
  };

  const primaryShades = [
    { name: '50', hex: '#fffbeb', rgb: '255, 251, 235', textDark: true },
    { name: '100', hex: '#fef3c7', rgb: '254, 243, 199', textDark: true },
    { name: '200', hex: '#fde68a', rgb: '253, 230, 138', textDark: true },
    { name: '300', hex: '#fcd34d', rgb: '252, 211, 77', textDark: true },
    { name: '400', hex: '#fbbf24', rgb: '251, 191, 36', textDark: true },
    { name: '500', hex: '#f59e0b', rgb: '245, 158, 11', textDark: true, isBrand: true },
    { name: '600', hex: '#d97706', rgb: '217, 119, 6', textDark: false },
    { name: '700', hex: '#b45309', rgb: '180, 83, 9', textDark: false },
    { name: '800', hex: '#92400e', rgb: '146, 64, 14', textDark: false },
    { name: '900', hex: '#78350f', rgb: '120, 53, 15', textDark: false },
    { name: '950', hex: '#451a03', rgb: '69, 26, 3', textDark: false },
  ];

  const secondaryShades = [
    { name: '50', hex: '#f0f9ff', textDark: true },
    { name: '100', hex: '#e0f2fe', textDark: true },
    { name: '200', hex: '#bae6fd', textDark: true },
    { name: '300', hex: '#7dd3fc', textDark: true },
    { name: '400', hex: '#38bdf8', textDark: true, isBrand: true },
    { name: '500', hex: '#0ea5e9', textDark: false },
    { name: '600', hex: '#0284c7', textDark: false },
    { name: '700', hex: '#0369a1', textDark: false },
    { name: '800', hex: '#075985', textDark: false },
    { name: '900', hex: '#0c4a6e', textDark: false },
    { name: '950', hex: '#082f49', textDark: false },
  ];

  const neutralShades = [
    { name: '50', hex: '#f8fafc', textDark: true },
    { name: '100', hex: '#f1f5f9', textDark: true },
    { name: '200', hex: '#e2e8f0', textDark: true },
    { name: '300', hex: '#cbd5e1', textDark: true },
    { name: '400', hex: '#94a3b8', textDark: true },
    { name: '500', hex: '#64748b', textDark: false },
    { name: '600', hex: '#475569', textDark: false },
    { name: '700', hex: '#334155', textDark: false },
    { name: '800', hex: '#1e293b', textDark: false },
    { name: '900', hex: '#0f172a', textDark: false },
    { name: '950', hex: '#020617', textDark: false, isBrand: true },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      {/* Header (Section 1 of PDF) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
              AFGHANABUILD DESIGN SYSTEM v1.0
            </span>
            <span className="text-xs text-slate-400 font-mono">15-10-2026</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100">
            سامانه طراحی مهندسی و معماری ساختمانی افغانستان
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            راهنمای جامع پیاده‌سازی سیستم طراحی: توکن‌های بصری، کامپوننت‌های زنده، سیستم رنگ‌های کهربایی و فیروزه‌ای، و الزامات دسترسی‌پذیری WCAG 2.1 AA/AAA.
          </p>
        </div>

        {/* Live Controls Bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="ab-btn-secondary text-xs h-9 px-3"
            title="آزمایش حالت تیره و روشن زنده"
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>حالت روشن</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>حالت تیره</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="ab-btn-primary text-xs h-9 px-3.5"
            title="چاپ یا خروجی PDF"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ / خروجی PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 ab-scroll border-b border-slate-800 text-xs font-semibold">
        {[
          { id: 'colors', label: '۱. پالت‌های رنگی و کنتراست (WCAG)' },
          { id: 'typography', label: '۲. تایپوگرافی و مقیاس متن' },
          { id: 'components', label: '۳. کتابخانه کامپوننت‌های زنده' },
          { id: 'spacing', label: '۴. شبکه ۴ پیکسلی و انیمیشن‌ها' },
          { id: 'accessibility', label: '۵. استاندارد دسترسی‌پذیری' },
          { id: 'performance', label: '⚡ ۶. معماری ۶۰ فریم و بنچمارک عملکرد زنده' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: COLORS (Pages 1 - 10 of PDF)                         */}
      {/* ============================================================ */}
      {activeTab === 'colors' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Guiding Principles */}
          <div className="ab-card p-4.5 bg-amber-500/5 border-amber-500/30 space-y-1.5 text-xs">
            <span className="font-bold text-amber-400">سه اصل راهنما در انتخاب رنگ‌های سامانه:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>اعتماد مهندسی</strong>: انتقال حس دقت، استحکام و رسمیت سازه (نه بازیگوشی و حواس‌پرتی).</li>
              <li><strong>خوانایی چندساعته</strong>: کنتراست‌های دقیق بدون خستگی چشم پس از ساعت‌ها کار با نقشه و جدول BOQ.</li>
              <li><strong>معنای رنگی پایدار</strong>: هر رنگ وضعیتی معنای ثابت دارد و برای تزئین بی‌دلیل به کار نمی‌رود.</li>
            </ul>
          </div>

          {/* 1.1 Primary Palette */}
          <div className="ab-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">۱-۱ پالت اصلی — کهربایی ساختمانی (Construction Gold / Primary)</h3>
                <p className="text-xs text-slate-400">رنگ برند، دکمه‌های اقدام اصلی و حلقه‌های فوکوس (سایه ۵۰۰ تیره و ۶۰۰ روشن)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 text-center text-xs">
              {primaryShades.map((shade) => (
                <div
                  key={shade.name}
                  onClick={() => copyColor(shade.hex)}
                  className="rounded-xl overflow-hidden p-2.5 flex flex-col justify-between h-24 cursor-pointer hover:scale-105 transition-transform border border-slate-700/50 shadow-sm"
                  style={{ backgroundColor: shade.hex }}
                >
                  <span className={`font-mono text-[11px] font-bold ${shade.textDark ? 'text-slate-950' : 'text-slate-100'}`}>
                    {shade.name} {shade.isBrand && '★'}
                  </span>
                  <span className={`font-mono text-[10px] select-all ${shade.textDark ? 'text-slate-900' : 'text-slate-200'}`}>
                    {shade.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1.2 Secondary Palette */}
          <div className="ab-card p-5 space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100">۱-۲ پالت مکمل — فیروزه‌ای نقشه‌کشی (Blueprint Cyan / Secondary)</h3>
              <p className="text-xs text-slate-400">رنگ ثانویه برای لینک‌ها، اطلاعات، نمودارها و خطوط نقشه و ابعاد CAD</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 text-center text-xs">
              {secondaryShades.map((shade) => (
                <div
                  key={shade.name}
                  onClick={() => copyColor(shade.hex)}
                  className="rounded-xl overflow-hidden p-2.5 flex flex-col justify-between h-24 cursor-pointer hover:scale-105 transition-transform border border-slate-700/50 shadow-sm"
                  style={{ backgroundColor: shade.hex }}
                >
                  <span className={`font-mono text-[11px] font-bold ${shade.textDark ? 'text-slate-950' : 'text-slate-100'}`}>
                    {shade.name} {shade.isBrand && '★'}
                  </span>
                  <span className={`font-mono text-[10px] select-all ${shade.textDark ? 'text-slate-900' : 'text-slate-200'}`}>
                    {shade.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1.3 Neutral Slate */}
          <div className="ab-card p-5 space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100">۱-۳ پالت خنثی — خاکستری فولادی (Steel Slate / Neutral)</h3>
              <p className="text-xs text-slate-400">ستون فقرات پس‌زمینه‌ها، سطوح کارت، منوها و حاشیه‌ها</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 text-center text-xs">
              {neutralShades.map((shade) => (
                <div
                  key={shade.name}
                  onClick={() => copyColor(shade.hex)}
                  className="rounded-xl overflow-hidden p-2.5 flex flex-col justify-between h-24 cursor-pointer hover:scale-105 transition-transform border border-slate-700/50 shadow-sm"
                  style={{ backgroundColor: shade.hex }}
                >
                  <span className={`font-mono text-[11px] font-bold ${shade.textDark ? 'text-slate-950' : 'text-slate-100'}`}>
                    {shade.name} {shade.isBrand && '★'}
                  </span>
                  <span className={`font-mono text-[10px] select-all ${shade.textDark ? 'text-slate-900' : 'text-slate-200'}`}>
                    {shade.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1.4 Status Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="ab-card p-4 border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>موفقیت (Emerald)</span>
              </div>
              <p className="text-[11px] text-slate-400">تأییدیه، ذخیره، تکمیل پروژه، پرداخت</p>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                <span>#10b981 / #34d399</span>
                <span>AAA 9.29:1</span>
              </div>
            </div>

            <div className="ab-card p-4 border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>هشدار (Amber)</span>
              </div>
              <p className="text-[11px] text-slate-400">هشدار، نزدیک شدن مهلت، کسری بارنامه</p>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                <span>#f59e0b / #fbbf24</span>
                <span>AAA 10.69:1</span>
              </div>
            </div>

            <div className="ab-card p-4 border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <XCircle className="w-4 h-4" />
                <span>خطا و خطر (Rose)</span>
              </div>
              <p className="text-[11px] text-slate-400">خطا، عملیات تخریب، اعتبارسنجی ناموفق</p>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400 bg-rose-500/10 p-2 rounded-lg">
                <span>#f43f5e / #fb7185</span>
                <span>AA 6.63:1</span>
              </div>
            </div>

            <div className="ab-card p-4 border-sky-500/30 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Info className="w-4 h-4" />
                <span>اطلاعات (Sky)</span>
              </div>
              <p className="text-[11px] text-slate-400">اطلاع‌رسانی، راهنما، ابعاد و یادداشت‌ها</p>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-400 bg-sky-500/10 p-2 rounded-lg">
                <span>#0ea5e9 / #38bdf8</span>
                <span>AAA 8.33:1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TYPOGRAPHY (Pages 11 - 15 of PDF)                    */}
      {/* ============================================================ */}
      {activeTab === 'typography' && (
        <div className="ab-card p-6 space-y-5 animate-in fade-in text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100">۲-۲ مقیاس کامل تایپوگرافی (Type Scale Specimen)</h3>
            <p className="text-slate-400 mt-0.5">مبنای ریشه ۱۶px با ضریب ۱.۲۵ (Major Third) با فونت Vazirmatn و JetBrains Mono</p>
          </div>

          <div className="space-y-4 divide-y divide-slate-800">
            <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-2xl font-black text-slate-100">
                h1 · 40px · 800: سامانه مهندسی و معماری ساختمانی
              </span>
              <span className="font-mono text-slate-500">2.5rem · weight 800 · lh 1.2</span>
            </div>

            <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-xl font-extrabold text-slate-100">
                h2 · 32px · 800: مدیریت پروژه‌های عمرانی افغانستان
              </span>
              <span className="font-mono text-slate-500">2.0rem · weight 800 · lh 1.25</span>
            </div>

            <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-lg font-bold text-slate-100">
                h3 · 28px · 700: محاسبه برآورد هزینه و احجام (BOQ)
              </span>
              <span className="font-mono text-slate-500">1.75rem · weight 700 · lh 1.3</span>
            </div>

            <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-base font-bold text-slate-100">
                h4 · 24px · 700: نقشه‌های اجرایی سازه بتنی
              </span>
              <span className="font-mono text-slate-500">1.5rem · weight 700 · lh 1.35</span>
            </div>

            <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-100">
                body-lg · 16px · 400: این سامانه برای چرخه عمر پروژه‌های ساختمانی کابل طراحی شده است.
              </span>
              <span className="font-mono text-slate-500">1.0rem · weight 400 · lh 1.7</span>
            </div>

            <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-xs text-slate-300">
                body (پیش‌فرض) · 14px · 400: متن بدنه جدول‌ها، فرم‌ها و کارت‌های اطلاعاتی
              </span>
              <span className="font-mono text-slate-500">0.875rem · weight 400 · lh 1.55</span>
            </div>

            <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-xs font-mono text-amber-400 dir-ltr">
                mono · 13px: BOQ-2024-001 · 1,250.00 m³ · N 34°31' E 69°10'
              </span>
              <span className="font-mono text-slate-500">JetBrains Mono · tabular-nums</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: COMPONENTS (Pages 18 - 25 of PDF)                    */}
      {/* ============================================================ */}
      {activeTab === 'components' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Buttons Specimen (Section 4-1) */}
          <div className="ab-card p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              ۴-۱ دکمه‌ها (Buttons)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="ab-btn-primary text-xs">
                <span>دکمه اصلی (Primary)</span>
              </button>
              <button className="ab-btn-secondary text-xs">
                <span>دکمه ثانویه (Secondary)</span>
              </button>
              <button className="px-4 h-10 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                <span>دکمه شفاف (Ghost)</span>
              </button>
              <button className="px-4 h-10 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors">
                <span>حذف پروژه (Danger)</span>
              </button>
              <button disabled className="px-4 h-10 rounded-lg text-xs font-medium bg-slate-800 text-slate-500 cursor-not-allowed">
                <span>غیرفعال (Disabled)</span>
              </button>
            </div>
          </div>

          {/* Form Controls (Section 4-2) */}
          <div className="ab-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              ۴-۲ کنترل‌های فرم و ورودی‌ها (Inputs)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ورودی استاندارد:</label>
                <input type="text" placeholder="مثلاً برج مسکونی کابل" className="ab-input" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نوع سازه:</label>
                <select className="ab-input">
                  <option>بتنی مسلح C30</option>
                  <option>اسکلت فولادی</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">کد پروژه (غیرفعال):</label>
                <input type="text" value="AB-2024-001" disabled className="ab-input opacity-60 font-mono" />
              </div>
            </div>
          </div>

          {/* Toast Samples (Section 4-7) */}
          <div className="ab-card p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              ۴-۷ آزمایش اعلان‌های شناور توست (Toast Triggers)
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => showSuccess('ذخیره شد', 'تغییرات پروژه با موفقیت ثبت گردید.')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                نمایش توست موفقیت
              </button>
              <button
                onClick={() => showError('خطا در ذخیره', 'اتصال به سرور قطع است. لطفاً دوباره تلاش کنید.', () => showSuccess('اتصال مجدد', 'ارتباط برقرار شد.'))}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                نمایش توست خطا (با دکمه تلاش مجدد)
              </button>
              <button
                onClick={() => showWarning('هشدار مهلت', '۳ روز تا پایان مهلت ارسال گزارش پیشرفت باقی مانده است.')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                نمایش توست هشدار
              </button>
              <button
                onClick={() => showInfo('اطلاع‌رسانی', 'نسخه جدید نقشه سازه S01 در دسترس است.')}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
              >
                نمایش توست اطلاع‌رسانی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: SPACING & BREAKPOINTS (Pages 16 - 17)                */}
      {/* ============================================================ */}
      {activeTab === 'spacing' && (
        <div className="ab-card p-6 space-y-5 animate-in fade-in text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100">۳-۲ نقاط شکست ریسپانسیو (Breakpoints)</h3>
            <p className="text-slate-400 mt-0.5">طراحی موبایل‌اول با انطباق اتوماتیک در تبلت و دسکتاپ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 text-sm">موبایل (&lt; 768px)</span>
              <p className="text-slate-300">چیدمان ۴ ستونی • نوار ناوبری پایین صفحه • تبدیل جدول‌ها به کارت‌های عمودی</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-sky-400 text-sm">تبلت (768 - 1024px)</span>
              <p className="text-slate-300">چیدمان ۸ ستونی • سایدبار دو ستونی • منوی بالای افقی</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 text-sm">دسکتاپ (≥ 1024px)</span>
              <p className="text-slate-300">چیدمان ۱۲ ستونی • سایدبار ۲۴۰px جمع‌شونده • پنل کمکی جانبی</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: ACCESSIBILITY (Pages 35 - 37)                        */}
      {/* ============================================================ */}
      {activeTab === 'accessibility' && (
        <div className="ab-card p-6 space-y-4 animate-in fade-in text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100">۸-۱ چک‌لیست کامل انطباق با WCAG 2.1 سطح AA/AAA</h3>
            <p className="text-slate-400 mt-0.5">پشتیبانی کامل از صفحه‌خوان‌ها، ناوبری کیبورد و کاربران کم‌توان</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400">قابل درک (Perceivable):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>کنتراست حداقل ۴.۵:۱ برای متن و ۳:۱ برای حاشیه‌ها</li>
                <li>عدم اتکای صرف به رنگ و استفاده از برچسب و آیکون</li>
                <li>متن جایگزین (alt) برای کلیه تصاویر و دیاگرام‌ها</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400">قابل استفاده (Operable):</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>پشتیبانی ۱۰۰٪ از ناوبری با کیبورد (Tab, Esc, Enter, Ctrl+K)</li>
                <li>حلقه فوکوس (Focus Trap) در مودال‌ها و دراورها</li>
                <li>لینک پرش به محتوا (Skip Link) برای رد شدن از هدر</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: 60 FPS PERFORMANCE ARCHITECTURE & BENCHMARK          */}
      {/* ============================================================ */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-fade-in text-xs">
          {/* Top Banner */}
          <div className="ab-card p-5 bg-amber-500/5 border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                GPU COMPOSITING
              </span>
              <span className="font-bold text-sm text-slate-100">
                معماری ۶۰ فریم پایدار در تمام دستگاه‌های دسکتاپ، تبلت و موبایل
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              سامانه AfghanaBuild از اصل «صفر ری‌فلو در انیمیشن» (Zero-Reflow Animation Principle) پیروی می‌کند. تمام افکت‌های لمسی، ترنزیشن‌ها و تغییرات بصری کارت‌ها صرفاً توسط واحد پردازش گرافیک (GPU) و لایه‌های سخت‌افزاری کامپوزیت پردازش می‌شوند تا بودجه ۱۶.۶ میلی‌ثانیه‌ای هر فریم هرگز شکسته نشود.
            </p>
          </div>

          {/* Interactive Touch & Click Testing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="ab-card-interactive-accent p-4 space-y-2">
              <span className="font-bold text-amber-400 text-xs">کارت تعاملی مهندسی (Hover & Active)</span>
              <p className="text-slate-300 text-[11px]">
                روی این کارت هاور و کلیک کنید. تغییر ارتفاع بصری فقط با <code className="text-amber-300 font-mono">translateY(-3px) scale(1.008)</code> و بدون تغییر مارجین یا پدینگ اعمال می‌شود.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="ab-chip-interactive bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  فیدبک ملایم
                </span>
                <span className="ab-chip-interactive bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  60 FPS
                </span>
              </div>
            </div>

            <div className="ab-card p-4 space-y-3">
              <span className="font-bold text-sky-400 text-xs">دکمه‌های با فیدبک الاستیک</span>
              <div className="flex flex-wrap gap-2">
                <button className="ab-btn-primary text-xs h-8 px-3">
                  اقدام اصلی
                </button>
                <button className="ab-btn-secondary text-xs h-8 px-3">
                  اقدام ثانویه
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                پاسخ مقیاس ۰.۹۷ در رویداد Active با منحنی <code className="text-sky-300 font-mono">cubic-bezier(0.2, 0, 0, 1)</code> در ۱۶۰ میلی‌ثانیه.
              </p>
            </div>

            <div className="ab-card p-4 space-y-2">
              <span className="font-bold text-emerald-400 text-xs">بهینه‌سازی لمسی موبایل</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li><code className="text-emerald-300 font-mono">touch-action: manipulation;</code> (حذف تاخیر ۳۰۰ms)</li>
                <li><code className="text-emerald-300 font-mono">-webkit-tap-highlight-color: transparent;</code></li>
                <li>حداقل ارتفاع لمسی ۴۴px برای انگشت کاربر</li>
              </ul>
            </div>
          </div>

          {/* Properties Table */}
          <div className="ab-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              جدول قوانین CSS برای توسعه‌دهندگان AfghanaBuild
            </h3>
            <div className="overflow-x-auto ab-scroll">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-2 px-3 font-semibold">ویژگی CSS</th>
                    <th className="py-2 px-3 font-semibold">مرحله در خط لوله</th>
                    <th className="py-2 px-3 font-semibold">وضعیت در پروژه</th>
                    <th className="py-2 px-3 font-semibold">علت فنی و جایگزین</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-mono text-emerald-400">transform: translate / scale</td>
                    <td className="py-2 px-3 text-slate-300">Composite (GPU)</td>
                    <td className="py-2 px-3"><span className="text-emerald-400 font-bold">✅ الزامی و مجاز</span></td>
                    <td className="py-2 px-3 text-slate-400">مستقیماً در کارت گرافیک بدون محاسبه چیدمان مجدد پردازش می‌شود.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-emerald-400">opacity</td>
                    <td className="py-2 px-3 text-slate-300">Composite (GPU)</td>
                    <td className="py-2 px-3"><span className="text-emerald-400 font-bold">✅ الزامی و مجاز</span></td>
                    <td className="py-2 px-3 text-slate-400">تغییر شفافیت آلفا بدون رپینت کردن لایه‌های زیرین.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-rose-400">top / left / right / bottom</td>
                    <td className="py-2 px-3 text-slate-300">Layout + Paint + Composite</td>
                    <td className="py-2 px-3"><span className="text-rose-400 font-bold">⛔ ممنوع در انیمیشن</span></td>
                    <td className="py-2 px-3 text-slate-400">باعث شکست هندسی کل صفحه می‌شود؛ جایگزین: translate3d.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-rose-400">width / height</td>
                    <td className="py-2 px-3 text-slate-300">Layout + Paint + Composite</td>
                    <td className="py-2 px-3"><span className="text-rose-400 font-bold">⛔ ممنوع در انیمیشن</span></td>
                    <td className="py-2 px-3 text-slate-400">باعث لکنت فریم ریت می‌شود؛ جایگزین: scaleX/scaleY.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
