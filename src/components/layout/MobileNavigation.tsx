import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Compass,
  Calculator,
  MoreHorizontal,
  X,
  Bot,
  Box,
  Warehouse,
  Users,
  Layers,
  Activity,
  ClipboardCheck,
  ShieldAlert,
  TestTube2,
  Settings,
  UserCheck,
  Palette
} from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  setActiveTab,
  isDrawerOpen,
  setIsDrawerOpen,
}) => {
  const primaryBottomNav = [
    { id: 'ceo_dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'projects', label: 'پروژه‌ها', icon: FolderKanban },
    { id: 'cad', label: 'نقشه‌ها', icon: Compass },
    { id: 'boq', label: 'BOQ', icon: Calculator },
  ];

  const allModules = [
    { id: 'ceo_dashboard', label: 'داشبورد مدیریتی', icon: LayoutDashboard },
    { id: 'projects', label: 'مدیریت پروژه‌ها', icon: FolderKanban },
    { id: 'cad', label: 'استودیوی نقشه‌کشی CAD', icon: Compass },
    { id: 'ai_cad_agent', label: 'دستیار هوش مصنوعی CAD', icon: Bot },
    { id: 'bim', label: 'مدل‌سازی سه‌بعدی BIM', icon: Box },
    { id: 'boq', label: 'برآورد هزینه و احجام BOQ', icon: Calculator },
    { id: 'inventory', label: 'انبار مصالح و تجهیزات', icon: Warehouse },
    { id: 'hr', label: 'منابع انسانی و حقوق', icon: Users },
    { id: 'materials', label: 'مدیریت متریال‌ها و مصالح', icon: Layers },
    { id: 'geotech', label: 'آزمایش‌های ژئوتکنیک خاک', icon: Activity },
    { id: 'field_form', label: 'گزارش پیشرفت میدانی', icon: ClipboardCheck },
    { id: 'compliance', label: 'انطباق استاندارد و مجوزها', icon: ShieldAlert },
    { id: 'user_profile', label: 'پروفایل کاربری', icon: UserCheck },
    { id: 'design_system', label: 'سیستم طراحی و توکن‌ها (PDF)', icon: Palette },
    { id: 'tests', label: 'تست‌های تشخیصی سیستم', icon: TestTube2 },
    { id: 'settings', label: 'تنظیمات سامانه', icon: Settings },
  ];

  return (
    <>
      {/* 1. Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        className="md:hidden fixed bottom-0 start-0 end-0 z-[1035] h-16 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-2 select-none"
        aria-label="ناوبری پایین صفحه"
      >
        {primaryBottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsDrawerOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isDrawerOpen ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="نمایش تمام بخش‌ها"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-1">بیشتر</span>
        </button>
      </nav>

      {/* 2. Slide-over Mobile Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-[1045] flex bg-slate-950/80 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-slate-900 dark:bg-slate-950 border-e border-slate-800 flex flex-col p-4 shadow-2xl animate-in slide-in-from-start duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">
                  AB
                </div>
                <span className="font-bold text-sm text-slate-100">بخش‌های سامانه</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
                aria-label="بستن منو"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1 ab-scroll">
              {allModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-right transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
