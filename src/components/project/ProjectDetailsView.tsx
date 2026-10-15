import React, { useState } from 'react';
import {
  ArrowRight,
  Edit3,
  MoreVertical,
  Building,
  MapPin,
  Calendar,
  Users,
  FileCheck,
  Clock,
  Compass,
  Calculator,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  Paperclip,
  Share2
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

interface ProjectDetailsViewProps {
  onBack: () => void;
  onNavigateToCAD: (drawingCode?: string) => void;
  onNavigateToBOQ: () => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
  onBack,
  onNavigateToCAD,
  onNavigateToBOQ,
}) => {
  const { currentProject, projectMilestones } = useProject();
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'drawings' | 'boq' | 'gantt' | 'reports' | 'team' | 'files'>('overview');
  const [ganttZoom, setGanttZoom] = useState<'month' | 'week'>('month');

  const tabs = [
    { id: 'overview', label: 'نمای کلی' },
    { id: 'drawings', label: 'نقشه‌ها (CAD)' },
    { id: 'boq', label: 'برآورد هزینه (BOQ)' },
    { id: 'gantt', label: 'زمان‌بندی و گانت' },
    { id: 'reports', label: 'گزارش‌های کارگاهی' },
    { id: 'team', label: 'تیم اجرایی' },
    { id: 'files', label: 'فایل‌ها و مجوزها' },
  ];

  // Gantt Chart Tasks Data
  const ganttTasks = [
    { id: 't1', name: 'گودبرداری و سازه نگهبان نیلینگ', start: 1, duration: 2, progress: 100, critical: true },
    { id: 't2', name: 'بتن‌ریزی فونداسیون رادیه C30', start: 3, duration: 2, progress: 100, critical: true },
    { id: 't3', name: 'اجرای اسکلت زیرزمین منفی ۱ و ۲', start: 5, duration: 3, progress: 90, critical: true },
    { id: 't4', name: 'ستون‌ها و دیوارهای برشی طبقه همکف', start: 7, duration: 2, progress: 75, critical: false },
    { id: 't5', name: 'اسکلت طبقات ۱ الی ۶ و دال مجوف', start: 8, duration: 4, progress: 45, critical: true },
    { id: 't6', name: 'تیغه‌چینی و سفت‌کاری با آجر کابل', start: 10, duration: 3, progress: 20, critical: false },
    { id: 't7', name: 'لوله‌کشی تأسیسات مکانیکی و برقی', start: 11, duration: 3, progress: 10, critical: false },
  ];

  const months = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      {/* 1. Breadcrumbs & Header Bar (Wireframe 7-4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-colors font-medium"
          >
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            <span>بازگشت به پروژه‌ها</span>
          </button>
          <span>/</span>
          <span className="text-slate-300 font-semibold">{currentProject.name}</span>
          <span>/</span>
          <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {currentProject.code}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => showSuccess('ویرایش پروژه', 'فرم ویرایش مشخصات باز گردید.')}
            className="ab-btn-secondary text-xs h-8 px-3"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ویرایش</span>
          </button>
          <button
            onClick={() => showSuccess('اشتراک‌گذاری', 'لینک گزارش پروژه در کلیپ‌بورد کپی شد.')}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="عملیات بیشتر"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Horizontal Scrollable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 ab-scroll border-b border-slate-800 text-xs font-semibold select-none">
        {tabs.map((tab) => (
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

      {/* 3. Main Split View: Left (Content) / Right (Sidebar Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Card */}
          <div className="ab-card p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 text-sm">پیشرفت کلی پروژه</span>
              <span className="font-mono text-lg font-black text-amber-400">{currentProject.progressPercent}٪</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${currentProject.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>تاریخ آغاز: {currentProject.startDate}</span>
              <span>مهلت پایان مصوب: {currentProject.completionDate}</span>
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Project Render Image */}
              <div className="ab-card overflow-hidden relative group">
                <img
                  src="/src/assets/images/project_kabul_tower_1792040379395.jpg"
                  alt={currentProject.name}
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
                  <span className="text-xs font-mono text-amber-400 font-bold">طرح معماری و سازه‌ای مصوب</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-100">{currentProject.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">۱۲ طبقه روی همکف + ۲ طبقه پارکینگ زیرزمینی • بتن مسلح رده C30 ضدزلزله زون ۱</p>
                </div>
              </div>

              {/* Quick Jump Buttons to CAD & BOQ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => onNavigateToCAD('S01')}
                  className="ab-card-interactive p-4.5 cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">استودیوی CAD پروژه</h4>
                      <p className="text-xs text-slate-400">مشاهده نقشه‌های اجرایی سازه S01</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                </div>

                <div
                  onClick={onNavigateToBOQ}
                  className="ab-card-interactive p-4.5 cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">برآورد و متره BOQ</h4>
                      <p className="text-xs text-slate-400">ریز مقادیر مصالح، میلگرد و بتن</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Gantt Schedule */}
          {(activeTab === 'gantt' || activeTab === 'overview') && (
            <div className="ab-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">نمودار زمان‌بندی گانت و مسیر بحرانی (CPM)</h4>
                  <p className="text-xs text-slate-400">پایش فعالیت‌های ساختمانی بر اساس تقویم شمسی</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setGanttZoom('month')}
                    className={`px-2.5 py-1 rounded font-semibold ${ganttZoom === 'month' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    ماهانه
                  </button>
                  <button
                    onClick={() => setGanttZoom('week')}
                    className={`px-2.5 py-1 rounded font-semibold ${ganttZoom === 'week' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    هفتگی
                  </button>
                </div>
              </div>

              {/* Gantt Timeline Grid */}
              <div className="overflow-x-auto pb-2 ab-scroll">
                <div className="min-w-[650px] space-y-2 text-xs">
                  {/* Timeline Header */}
                  <div className="grid grid-cols-12 gap-1 bg-slate-950/80 p-2 rounded-lg text-center font-mono text-[11px] text-slate-400">
                    <div className="col-span-4 text-right pr-2">فعالیت اجرایی</div>
                    <div className="col-span-8 grid grid-cols-8 text-center">
                      {months.slice(0, 8).map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Task Rows */}
                  {ganttTasks.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-12 gap-1 items-center p-2 rounded-lg hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="col-span-4 text-right pr-2">
                        <span className="font-semibold text-slate-200 block truncate">{task.name}</span>
                        {task.critical && (
                          <span className="text-[10px] text-rose-400 font-bold">مسیر بحرانی</span>
                        )}
                      </div>
                      <div className="col-span-8 grid grid-cols-8 relative h-7 bg-slate-950/40 rounded-lg p-1">
                        <div
                          className={`absolute top-1.5 bottom-1.5 rounded-md shadow flex items-center justify-end px-2 text-[10px] font-mono font-bold text-slate-950 ${
                            task.critical ? 'bg-amber-500' : 'bg-sky-400'
                          }`}
                          style={{
                            right: `${(task.start - 1) * 12.5}%`,
                            width: `${task.duration * 12.5}%`,
                          }}
                        >
                          {task.progress}٪
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs Stubs */}
          {activeTab === 'drawings' && (
            <div className="ab-card p-6 text-center space-y-3">
              <Compass className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="font-bold text-base text-slate-100">نقشه‌های اجرایی پروژه ({currentProject.name})</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                شامل ۱۰۸ شیت نقشه معماری (سری A)، سازه (سری S)، برق (سری E) و مکانیک (سری M).
              </p>
              <button
                onClick={() => onNavigateToCAD('S01')}
                className="ab-btn-primary text-xs"
              >
                باز کردن در استودیوی نقشه‌کشی CAD
              </button>
            </div>
          )}

          {activeTab === 'boq' && (
            <div className="ab-card p-6 text-center space-y-3">
              <Calculator className="w-10 h-10 text-sky-400 mx-auto" />
              <h4 className="font-bold text-base text-slate-100">برآورد احجام و مبالغ (BOQ)</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                برآورد بهای بتن، میلگرد، تأسیسات و دستمزد کارگاهی بر اساس نرخ‌های محلی ولایت کابل.
              </p>
              <button
                onClick={onNavigateToBOQ}
                className="ab-btn-primary text-xs"
              >
                مشاهده جدول کامل متره و برآورد
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Summary Area (4 Cols) - Stacks below on mobile */}
        <div className="lg:col-span-4 space-y-5">
          {/* Project Details Panel (Wireframe 7-4) */}
          <div className="ab-card p-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              اطلاعات تفصیلی پروژه
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-400">کارفرما:</span>
                <span className="font-semibold text-slate-100 text-left">{currentProject.client}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">موقعیت:</span>
                <span className="font-semibold text-slate-100 text-left">{currentProject.location}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">مساحت زیربنا:</span>
                <span className="font-mono font-bold text-slate-100">۱۲٬۵۰۰ m²</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">بودجه مصوب:</span>
                <span className="font-mono font-bold text-amber-400">
                  {currentProject.budget.toLocaleString()} افغانی
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">نوع سازه:</span>
                <span className="font-semibold text-slate-100">بتن مسلح رده C30</span>
              </div>
            </div>
          </div>

          {/* Project Team Card */}
          <div className="ab-card p-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              عوامل و تیم فنی پروژه
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/avatar_engineer_lead_1792040379283.jpg"
                  alt="مهندس ناظر"
                  className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                />
                <div>
                  <h5 className="font-bold text-xs text-slate-100">مهندس احمد رضایی</h5>
                  <p className="text-[11px] text-slate-400">مهندس ارشد ناظر مقیم کارگاه</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/avatar_architect_1792040378297.jpg"
                  alt="معمار پروژه"
                  className="w-10 h-10 rounded-xl object-cover border border-sky-500/40"
                />
                <div>
                  <h5 className="font-bold text-xs text-slate-100">مهندس فرهاد کریمی</h5>
                  <p className="text-[11px] text-slate-400">معمار ارشد و هماهنگ‌کننده BIM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Permits Card */}
          <div className="ab-card p-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              مدارک و مجوزهای قانونی
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">جواز ساخت شهرداری کابل</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مصوب
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">تأییدیه آیین‌نامه ANSA</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مصوب
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">مجوز ایمنی و حریق اطفائیه</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  در دست بررسی
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
