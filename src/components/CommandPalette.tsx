import React, { useState, useEffect } from 'react';
import {
  Search,
  Compass,
  FileSpreadsheet,
  Package,
  Layers,
  Box,
  Mountain,
  Users,
  ShieldCheck,
  FileCode2,
  Calendar,
  X,
  ArrowRight,
  ExternalLink,
  FolderKanban,
  Palette
} from 'lucide-react';
import { UserRole, AppLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
  currentRole: UserRole;
  language: AppLanguage;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentRole,
  language
}) => {
  const [query, setQuery] = useState('');
  const t = TRANSLATIONS[language] || TRANSLATIONS.fa;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'ceo_dashboard', label: 'داشبورد ارشد مدیریتی', desc: 'نمای کلان پیشرفت پروژه‌ها، شاخص‌های ارزش کسب‌شده و کنترل بحران', icon: Layers, role: 'all' },
    { id: 'projects', label: 'مدیریت پروژه‌ها (Projects Management)', desc: 'جدول کامل پروژه‌های عمرانی، فیلترها و ثبت پروژه جدید', icon: FolderKanban, role: 'all' },
    { id: 'design_system', label: 'سیستم طراحی و مشخصات بصری (Design System PDF)', desc: 'راهنمای ۵۲ صفحه‌ای توکن‌ها، پالت رنگ، کامپوننت‌های زنده و WCAG', icon: Palette, role: 'all' },
    { id: 'user_profile', label: 'پروفایل کاربر و تنظیمات امنیت', desc: 'اطلاعات پرسنلی مهندس، احراز هویت دومرحله‌ای MFA و لاگ فعالیت‌ها', icon: Users, role: 'all' },
    { id: 'cad', label: t.drawings, desc: 'استودیو ترسیم ۲ بعدی CAD و ویرایشگر المان‌ها', icon: Compass, role: 'all' },
    { id: 'catalog', label: t.catalog, desc: 'مشاهده ۱۰۹ نقشه سری A01-A26, S01-S21, E01-E34, M01-M28', icon: Layers, role: 'all' },
    { id: 'notes', label: t.notes, desc: 'یادداشت‌های متمرکز با انتشار خودکار (Propagate G-014)', icon: FileCode2, role: 'all' },
    { id: 'bim', label: t.bim, desc: 'مدل سه‌بعدی اسکلت سازه، تداخل‌یابی و شبیه‌ساز زلزله', icon: Box, role: 'all' },
    { id: 'materials', label: 'مدیریت مصالح سازه (Material Manager)', desc: 'تعریف و ویرایش پروفیل‌های فولاد، بتن و چوب، اعتبارسنجی فیزیکی و ردیابی نسخه', icon: Layers, role: 'all' },
    { id: 'geotech', label: t.geotech, desc: 'گمانه‌های آزمایشگاهی خاک، SPT و گسل‌های افغانستان', icon: Mountain, role: 'all' },
    { id: 'inventory', label: t.inventory, desc: 'مدیریت انبار، کنترل کیفیت و ثبت رسید با هشدار مغایرت > ۵٪', icon: Package, role: 'all' },
    { id: 'fieldReport', label: t.fieldReport, desc: 'گزارش پیشرفت فیزیکی میدانی آفلاین با نوار چسبان', icon: Users, role: 'field_worker' },
    { id: 'permits', label: t.permits, desc: 'جوازهای ۳ مرحله‌ای شهرداری کابل و استاندارد ANSA', icon: ShieldCheck, role: 'all' },
    { id: 'schedule', label: t.schedule, desc: 'ساختار شکست کار (WBS)، گانت چارت و مسیر بحرانی', icon: Calendar, role: 'all' },
    { id: 'tests', label: t.tests, desc: 'اجرای تست‌های خودکار واحد، یکپارچگی و پوشش کد > ۸۰٪', icon: ShieldCheck, role: 'all' },
    { id: 'settings', label: t.settings, desc: 'تنظیمات زبان، تقویم شمسی/میلادی و دسترس‌پذیری WCAG', icon: Search, role: 'all' },
  ];

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.desc.toLowerCase().includes(query.toLowerCase()) ||
    cmd.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-slate-800 border border-slate-700 text-slate-400 rounded-md font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              هیچ نتیجه‌ای یافت نشد.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full text-right p-3 rounded-xl hover:bg-slate-800/80 text-slate-200 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 rotate-180 transition" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>حرکت با <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">↓</kbd></span>
            <span>انتخاب با <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Enter</kbd></span>
          </div>
          <span className="text-amber-400 font-medium">پلتفرم مهندسی و معماری افغانستان</span>
        </div>
      </div>
    </div>
  );
};
