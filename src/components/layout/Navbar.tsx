import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Globe,
  ShieldCheck,
  ChevronDown,
  Menu,
  Building2,
  Bell,
  Check,
  Zap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProject } from '../../context/ProjectContext';
import { AppLanguage, UserRole } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onOpenCommandPalette: () => void;
  onOpenMobileDrawer: () => void;
  onOpenAuthModal: () => void;
  onOpenPerformanceModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  currentRole,
  setCurrentRole,
  onOpenCommandPalette,
  onOpenMobileDrawer,
  onOpenAuthModal,
  onOpenPerformanceModal,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { projects, currentProjectId, setCurrentProjectId, currentProject } = useProject();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'technical_director', label: 'مدیر فنی ارشد' },
    { role: 'ceo', label: 'مدیر عامل (CEO)' },
    { role: 'project_manager', label: 'مدیر پروژه' },
    { role: 'engineer_struct', label: 'مهندس محاسب سازه' },
    { role: 'engineer_arch', label: 'مهندس معمار' },
    { role: 'geotech', label: 'متخصص ژئوتکنیک' },
    { role: 'boq_estimator', label: 'مترور و برآوردکننده' },
  ];

  const currentRoleLabel = rolesList.find(r => r.role === currentRole)?.label || 'مدیر فنی ارشد';

  return (
    <header className="sticky top-0 z-[1020] h-14 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 flex items-center justify-between px-3 md:px-5 select-none">
      {/* Right Zone (in RTL): Hamburger, Brand & Project Selector */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="باز کردن منو"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => setActiveTab('ceo_dashboard')}
          className="flex items-center gap-2 group text-right"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
            AB
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-100 hidden sm:inline-block">
            AfghanaBuild
          </span>
        </button>

        {/* Project Switcher Dropdown (Section 4-4) */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProjectDropdownOpen(prev => !prev);
              setIsRoleDropdownOpen(false);
              setIsLangDropdownOpen(false);
            }}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors max-w-[200px]"
            title="جابجایی پروژه فعال"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{currentProject?.name || 'انتخاب پروژه'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute top-full mt-1.5 start-0 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-[1000] animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-800">
                پروژه‌های عمرانی فعال
              </div>
              <div className="max-h-60 overflow-y-auto ab-scroll">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentProjectId(p.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      p.id === currentProjectId ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <p className="truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.code}</p>
                    </div>
                    {p.id === currentProjectId && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Zone: Global Search Trigger (Ctrl + K) */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-700/70 hover:border-amber-500/50 text-xs text-slate-400 transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
            <span className="truncate">جست‌وجو در پروژه‌ها، نقشه‌ها، BOQ...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Left Zone (in RTL): 60 FPS Badge, Theme Toggle, Language, Role & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 60 FPS Performance Lab Trigger */}
        <button
          onClick={onOpenPerformanceModal}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all ab-interactive-elem"
          title="معماری ۶۰ فریم بر ثانیه، افکت‌های لمسی و آزمایشگاه عملکرد"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono text-[11px] sm:text-xs">60 FPS</span>
        </button>

        {/* Theme Toggle Button (Light/Dark Instant Switch) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors relative"
          title={resolvedTheme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
          aria-label="تغییر تم"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          )}
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsLangDropdownOpen(prev => !prev);
              setIsRoleDropdownOpen(false);
              setIsProjectDropdownOpen(false);
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">
              {language === 'fa' ? 'دری' : language === 'ps' ? 'پشتو' : 'EN'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangDropdownOpen && (
            <div className="absolute top-full mt-1.5 end-0 w-32 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 z-[1000] text-xs">
              <button
                onClick={() => { setLanguage('fa'); setIsLangDropdownOpen(false); }}
                className={`w-full text-right px-3 py-1.5 hover:bg-slate-800 ${language === 'fa' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
              >
                دری (فارسی)
              </button>
              <button
                onClick={() => { setLanguage('ps'); setIsLangDropdownOpen(false); }}
                className={`w-full text-right px-3 py-1.5 hover:bg-slate-800 ${language === 'ps' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
              >
                پښتو (پشتو)
              </button>
              <button
                onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                className={`w-full text-right px-3 py-1.5 hover:bg-slate-800 ${language === 'en' ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => {
              setIsRoleDropdownOpen(prev => !prev);
              setIsLangDropdownOpen(false);
              setIsProjectDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[120px] truncate">{currentRoleLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute top-full mt-1.5 end-0 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 z-[1000] text-xs">
              <div className="px-3 py-1 text-[10px] text-slate-400 border-b border-slate-800 font-semibold">
                تغییر نقش کاربری (RBAC)
              </div>
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    setCurrentRole(r.role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-right px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between ${
                    r.role === currentRole ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {r.role === currentRole && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar Button */}
        <button
          onClick={() => setActiveTab('user_profile')}
          className={`flex items-center gap-2 p-1 rounded-xl transition-all ${
            activeTab === 'user_profile' ? 'ring-2 ring-amber-500' : 'hover:bg-slate-800'
          }`}
          title="پروفایل کاربر"
        >
          <img
            src="/src/assets/images/avatar_engineer_lead_1792040379283.jpg"
            alt="احمد رضایی"
            className="w-8 h-8 rounded-lg object-cover border border-amber-500/40 shadow-sm"
          />
        </button>
      </div>
    </header>
  );
};
