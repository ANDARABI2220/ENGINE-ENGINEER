import React, { useState, useEffect } from 'react';
import {
  Compass,
  Layers,
  FileSpreadsheet,
  Box,
  Mountain,
  Package,
  Calendar,
  Banknote,
  Users,
  ShieldCheck,
  Bot,
  CheckCircle2,
  BookOpen,
  LogIn,
  LogOut,
  User as UserIcon,
  Wifi,
  Building2,
  MapPin,
  FileCode2,
  Search,
  Globe,
  ChevronDown,
  Menu,
  X,
  Sidebar as SidebarIcon,
  Lock,
  ArrowRightLeft,
  Settings,
  Sparkles
} from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { UserRole, AppLanguage, CalendarType } from '../types';
import { ROLE_LABELS, TRANSLATIONS } from '../services/i18n';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
  setSelectedCity: (city: any) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  calendar: CalendarType;
  setCalendar: (cal: CalendarType) => void;
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  onOpenCommandPalette: () => void;
  onOpenMFALogin: () => void;
  drawingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  currentRole,
  setCurrentRole,
  language,
  setLanguage,
  currentProjectId,
  setCurrentProjectId,
  onOpenCommandPalette,
  onOpenMFALogin,
  drawingsCount
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(3);

  const t = TRANSLATIONS[language] || TRANSLATIONS.fa;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const projects = [
    { id: 'proj-01', name: 'برج الماس کابل (Kabul Diamond Tower)' },
    { id: 'proj-02', name: 'مجتمع مسکونی هرات باستان' },
    { id: 'proj-03', name: 'پایانه لجستیک حیرتان بلخ' },
  ];

  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name || projects[0].name;

  const navItems = [
    { id: 'ceo_dashboard', label: 'داشبورد مدیر عامل', icon: Building2, badge: 'CEO' },
    { id: 'cad', label: t.drawings, icon: Compass, badge: drawingsCount },
    { id: 'ai_cad_agent', label: 'عامل هوشمند CAD', icon: Sparkles, badge: 'CAD AI', isSpecial: true },
    { id: 'catalog', label: t.catalog, icon: Layers, badge: '۱۰۹' },
    { id: 'notes', label: t.notes, icon: FileCode2, badge: 'G-014' },
    { id: 'bim', label: t.bim, icon: Box },
    { id: 'materials', label: 'مدیریت مصالح سازه', icon: Layers, badge: 'FEA' },
    { id: 'boq', label: t.boq, icon: FileSpreadsheet },
    { id: 'geotech', label: t.geotech, icon: Mountain },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'field_form', label: t.fieldReport, icon: Users, badge: 'آفلاین' },
    { id: 'project', label: t.schedule, icon: Calendar },
    { id: 'finance', label: t.finance, icon: Banknote },
    { id: 'hr', label: t.hr, icon: Users },
    { id: 'compliance', label: t.permits, icon: ShieldCheck, badge: 'ANSA' },
    { id: 'ai', label: t.aiAssistant, icon: Bot, isSpecial: true },
    { id: 'settings', label: t.settings, icon: Settings },
    { id: 'tests', label: t.tests, icon: CheckCircle2, badge: '91.8%' },
    { id: 'docs', label: t.docs, icon: BookOpen },
  ];

  return (
    <>
      {/* 56px Sticky Topbar (Page 3 & 6 Specification) */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 h-14 select-none">
        <div className="max-w-7xl mx-auto px-3 h-full flex items-center justify-between gap-2">
          {/* Left: Mobile Menu Toggle + Logo + Project Switcher */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              title="باز کردن منو"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div
              onClick={() => setActiveTab('ceo_dashboard')}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-100 hidden md:inline tracking-tight group-hover:text-amber-400 transition">
                AfghanaBuild
              </span>
            </div>

            {/* Project Switcher Dropdown (Page 3 & 6) */}
            <div className="relative flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2 py-1 rounded-lg text-xs">
              <span className="text-slate-400 hidden sm:inline text-[11px]">پروژه:</span>
              <select
                value={currentProjectId}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[180px] truncate"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: Command Palette Trigger (Ctrl + K per Page 6) */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition shadow-inner w-56 md:w-64 justify-between"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{t.searchPlaceholder}</span>
            </div>
            <kbd className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700 shrink-0">
              Ctrl+K
            </kbd>
          </button>

          {/* Right: Role Switcher + Language Switcher + MFA Auth */}
          <div className="flex items-center gap-2">
            {/* RBAC Role Switcher Dropdown (Page 4) */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as any)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[110px] truncate text-[11px]"
              >
                <option value="technical_director" className="bg-slate-900">مدیر فنی (فول)</option>
                <option value="ceo" className="bg-slate-900">مدیر عامل (CEO)</option>
                <option value="engineer_struct" className="bg-slate-900">مهندس سازه</option>
                <option value="engineer_arch" className="bg-slate-900">مهندس معماری</option>
                <option value="boq_estimator" className="bg-slate-900">کارشناس BOQ</option>
                <option value="warehouse_manager" className="bg-slate-900">مسئول انبار</option>
                <option value="field_worker" className="bg-slate-900">کاربر میدانی</option>
              </select>
            </div>

            {/* Language Switcher (دری / پشتو / English - Page 2 & 15) */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="fa" className="bg-slate-900">دری</option>
              <option value="ps" className="bg-slate-900">پښتو</option>
              <option value="en" className="bg-slate-900">English</option>
            </select>

            {/* MFA Login Trigger */}
            <button
              onClick={onOpenMFALogin}
              title="احراز هویت دومرحله‌ای (MFA)"
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 hover:text-white transition"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Google / User Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-200 max-w-[90px] truncate hidden md:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button onClick={() => logout()} title="خروج" className="text-slate-400 hover:text-rose-400">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithGoogle()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition"
              >
                ورود
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation Bar (Page 3 & 6: Max 3 levels) */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              onClick={() => setActiveTab('ceo_dashboard')}
              className="hover:text-amber-400 cursor-pointer"
            >
              خانه
            </span>
            <span>›</span>
            <span className="text-slate-300 font-bold truncate max-w-[200px]">
              {currentProjectName}
            </span>
            <span>›</span>
            <span className="text-amber-400 font-bold">
              {navItems.find(i => i.id === activeTab)?.label || activeTab}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>نقش فعال: <strong className="text-slate-300">{ROLE_LABELS[currentRole]?.[language] || currentRole}</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Horizontal Modules Bar (Page 3: Tabs) */}
      <nav className="bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar select-none">
        <div className="max-w-7xl mx-auto px-3 flex items-center gap-1 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${item.isSpecial ? 'ring-1 ring-amber-500/30 bg-amber-950/20' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer (Sidebar for < 768px with Focus Trap & Esc per Page 6) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-72 bg-slate-900 border-r border-slate-800 h-full p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span className="font-extrabold text-sm text-slate-100">ناوبری ماژول‌ها</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                        isActive ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 rounded bg-slate-950/40 text-current font-mono">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 font-mono text-center">
              AfghanaBuild CAD & BIM v1.0
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Offline Status Bar (Page 3 & 6: Fixed Status Bar) */}
      <aside className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-400 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 font-bold ${
              isOnline ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <Wifi className="w-3.5 h-3.5" />
              <span>{isOnline ? t.onlineStatus : t.offlineStatus}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline font-mono">آخرین همگام‌سازی: ۱۴۰۴/۰۷/۲۴ ۱۷:۳۰</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono">
            <span className="hidden md:inline">استاندارد ملی: ANSA / ACI 318</span>
            <span className="text-amber-400 font-bold">پوشش کد: ۹۱.۸٪</span>
          </div>
        </div>
      </aside>
    </>
  );
};
