import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Compass,
  Bot,
  Box,
  Calculator,
  Warehouse,
  Users,
  Layers,
  Activity,
  ClipboardCheck,
  ShieldAlert,
  TestTube2,
  Settings,
  ChevronRight,
  ChevronLeft,
  Palette
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  drawingsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  drawingsCount = 108,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('afghanabuild_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('afghanabuild_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const navItems = [
    { id: 'ceo_dashboard', label: 'داشبورد', icon: LayoutDashboard, badge: null },
    { id: 'projects', label: 'پروژه‌ها', icon: FolderKanban, badge: '12' },
    { id: 'cad', label: 'نقشه‌کشی CAD', icon: Compass, badge: null },
    { id: 'ai_cad_agent', label: 'دستیار هوشمند CAD', icon: Bot, badge: 'AI' },
    { id: 'bim', label: 'مدل‌سازی BIM', icon: Box, badge: null },
    { id: 'boq', label: 'برآورد BOQ', icon: Calculator, badge: '3' },
    { id: 'inventory', label: 'انبار مصالح', icon: Warehouse, badge: null },
    { id: 'hr', label: 'منابع انسانی', icon: Users, badge: null },
    { id: 'materials', label: 'مدیریت متریال‌ها', icon: Layers, badge: null },
    { id: 'geotech', label: 'ژئوتکنیک', icon: Activity, badge: null },
    { id: 'field_form', label: 'گزارش کارگاهی', icon: ClipboardCheck, badge: null },
    { id: 'compliance', label: 'انطباق استانداردها', icon: ShieldAlert, badge: null },
    { id: 'design_system', label: 'سیستم طراحی (PDF)', icon: Palette, badge: 'v1.0' },
    { id: 'tests', label: 'تست‌های سیستم', icon: TestTube2, badge: null },
    { id: 'settings', label: 'تنظیمات', icon: Settings, badge: null },
  ];

  return (
    <aside
      className={`relative hidden md:flex flex-col border-e border-slate-800 bg-slate-900/70 dark:bg-slate-950/70 backdrop-blur-sm select-none transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="ناوبری اصلی سامانه"
    >
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 ab-scroll">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-right">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md shrink-0 ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950 font-bold'
                        : 'bg-slate-800 text-amber-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip on Collapsed (renders to the side) */}
              {isCollapsed && (
                <div className="absolute top-1/2 -translate-y-1/2 start-full ms-2 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 text-xs font-medium whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-[1070]">
                  {item.label}
                  {item.badge && ` (${item.badge})`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle Button at sidebar edge (⟨ / ⟩) */}
      <div className="p-2 border-t border-slate-800 flex items-center justify-center">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium"
          aria-label={isCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <>
              <ChevronRight className="w-4 h-4" />
              <span>جمع کردن منو</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
