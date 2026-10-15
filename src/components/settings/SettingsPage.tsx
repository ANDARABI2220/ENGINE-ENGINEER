import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  Shield,
  Globe,
  Users,
  Puzzle,
  Info,
  RotateCcw,
  Save,
  Moon,
  Sun,
  Monitor,
  Check
} from 'lucide-react';
import { AppLanguage, CalendarType, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

interface SettingsPageProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  calendar: CalendarType;
  onCalendarChange: (cal: CalendarType) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  language,
  onLanguageChange,
  calendar,
  onCalendarChange,
  currentRole,
  onRoleChange,
}) => {
  const { theme, setTheme, reducedMotion, setReducedMotion } = useTheme();
  const { showSuccess, showInfo } = useToast();

  const [activeCategory, setActiveCategory] = useState<
    'general' | 'appearance' | 'notifications' | 'security' | 'region' | 'users' | 'integrations' | 'about'
  >('appearance');

  // Form states
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [fontSizePercent, setFontSizePercent] = useState<number>(100);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const categories = [
    { id: 'general', label: 'عمومی', icon: SettingsIcon },
    { id: 'appearance', label: 'ظاهر و نمایش', icon: Palette },
    { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
    { id: 'security', label: 'امنیت', icon: Shield },
    { id: 'region', label: 'زبان و منطقه', icon: Globe },
    { id: 'users', label: 'کاربران و سطوح دسترسی', icon: Users },
    { id: 'integrations', label: 'یکپارچه‌سازی', icon: Puzzle },
    { id: 'about', label: 'درباره سامانه', icon: Info },
  ];

  const handleSave = () => {
    setIsDirty(false);
    showSuccess('ذخیره تغییرات', 'تنظیمات با موفقیت در سامانه ذخیره گردید.');
  };

  const handleReset = () => {
    setTheme('dark');
    onLanguageChange('fa');
    onCalendarChange('solar');
    setUnitSystem('metric');
    setFontSizePercent(100);
    setReducedMotion(false);
    setIsDirty(false);
    showInfo('بازنشانی', 'تنظیمات به مقادیر پیش‌فرض بازگردانی شدند.');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-100">تنظیمات سامانه (System Settings)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مدیریت ظاهر، تم، دسترسی‌پذیری و استانداردهای منطقه‌ای سامانه AfghanaBuild
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid: Wireframe 7-6 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Right Column (in RTL): Category Navigation */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1">
          <div className="ab-card p-2 space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1 text-right">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Left Column (in RTL): Active Setting Details Panel */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <div className="ab-card p-6 space-y-6">
            {/* Category: Appearance & Display (Wireframe 7-6 Spec) */}
            {activeCategory === 'appearance' && (
              <div className="space-y-6 text-xs animate-in fade-in">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100">تنظیمات ظاهر و نمایش (Appearance)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تغییرات به صورت زنده و بلادرنگ در رابط کاربری اعمال می‌شوند.
                  </p>
                </div>

                {/* 1. Theme Selector */}
                <div className="space-y-3">
                  <label className="block text-slate-300 font-bold">پوسته رنگی و تم (Theme Mode):</label>
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    <button
                      type="button"
                      onClick={() => { setTheme('dark'); setIsDirty(true); }}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                      <span>تیره (Dark)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setTheme('light'); setIsDirty(true); }}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'light'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span>روشن (Light)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setTheme('auto'); setIsDirty(true); }}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'auto'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Monitor className="w-5 h-5" />
                      <span>خودکار سیستم</span>
                    </button>
                  </div>
                </div>

                {/* 2. Language Selector */}
                <div className="space-y-2 max-w-md">
                  <label className="block text-slate-300 font-bold">زبان رابط کاربری:</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      onLanguageChange(e.target.value as AppLanguage);
                      setIsDirty(true);
                    }}
                    className="ab-input"
                  >
                    <option value="fa">دری / فارسی (افغانستان)</option>
                    <option value="ps">پښتو (افغانستان)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                {/* 3. Calendar Type */}
                <div className="space-y-2 max-w-md">
                  <label className="block text-slate-300 font-bold">تقویم پیش‌فرض:</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name="calendar"
                        checked={calendar === 'solar'}
                        onChange={() => { onCalendarChange('solar'); setIsDirty(true); }}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>شمسی (هجری خورشیدی)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name="calendar"
                        checked={calendar === 'gregorian'}
                        onChange={() => { onCalendarChange('gregorian'); setIsDirty(true); }}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>میلادی (Gregorian)</span>
                    </label>
                  </div>
                </div>

                {/* 4. Measurement Units */}
                <div className="space-y-2 max-w-md">
                  <label className="block text-slate-300 font-bold">واحد اندازه‌گیری مهندسی:</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name="units"
                        checked={unitSystem === 'metric'}
                        onChange={() => { setUnitSystem('metric'); setIsDirty(true); }}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>متریک (m, cm, mm, kg, AFN)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name="units"
                        checked={unitSystem === 'imperial'}
                        onChange={() => { setUnitSystem('imperial'); setIsDirty(true); }}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>امپریال (ft, in, lbs)</span>
                    </label>
                  </div>
                </div>

                {/* 5. Font Size Slider */}
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span>اندازه قلم‌ها:</span>
                    <span className="font-mono text-amber-400">{fontSizePercent}٪</span>
                  </div>
                  <input
                    type="range"
                    min={85}
                    max={125}
                    step={5}
                    value={fontSizePercent}
                    onChange={(e) => {
                      setFontSizePercent(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>۸۵٪ (فشرده)</span>
                    <span>۱۰۰٪ (استاندارد)</span>
                    <span>۱۲۵٪ (بزرگ)</span>
                  </div>
                </div>

                {/* 6. Accessibility: Reduced Motion (WCAG 2.1) */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 max-w-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-slate-200">
                      کاهش انیمیشن‌ها (احترام به prefers-reduced-motion):
                    </span>
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={(e) => {
                        setReducedMotion(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="rounded border-slate-700 text-amber-500 w-4 h-4"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400">
                    برای دستگاه‌های کم‌توان یا کاربرانی که به حرکات متوالی حساسیت دارند، تمامی ترنزیشن‌ها و انیمیشن‌های سنگین خاموش می‌شوند.
                  </p>
                </div>
              </div>
            )}

            {/* Other Categories */}
            {activeCategory === 'general' && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <h3 className="text-base font-bold text-slate-100">تنظیمات عمومی سامانه</h3>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <p className="text-slate-300">نام سازمان: شرکت ساختمانی و مهندسی پامیر الماس</p>
                  <p className="text-slate-400">شناسه سیستم: AFGHANA-BUILD-CORP-2026</p>
                  <p className="text-slate-400">موقعیت دفتر مرکزی: کابل، دارالامان</p>
                </div>
              </div>
            )}

            {activeCategory === 'security' && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <h3 className="text-base font-bold text-slate-100">امنیت، رمزنگاری و مجوزها</h3>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  سامانه بر پایه پایگاه داده امن Firebase Firestore و رمزنگاری داده‌های حساس پیکربندی گردیده است.
                </div>
              </div>
            )}

            {activeCategory === 'about' && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <h3 className="text-base font-bold text-slate-100">درباره سامانه مهندسی و معماری AfghanaBuild</h3>
                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>نسخه نرم‌افزار: <strong>1.0.0 (Design System Spec 2026)</strong></p>
                  <p>توسعه‌یافته بر اساس استانداردهای ملی افغانستان (ANSA) و آیین‌نامه‌های بین‌المللی ACI 318 و IBC.</p>
                  <p className="text-slate-500 font-mono text-[11px]">موتور پردازش: Node 22 • React 19 • Tailwind CSS v4 • Three.js</p>
                </div>
              </div>
            )}

            {/* Sticky Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="ab-btn-secondary text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازگردانی پیش‌فرض</span>
              </button>

              <button
                type="button"
                disabled={!isDirty}
                onClick={handleSave}
                className={`ab-btn-primary text-xs ${
                  !isDirty ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
