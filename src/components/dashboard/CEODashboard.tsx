import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  Banknote,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  DollarSign,
  Activity,
  Flame,
  BarChart3,
  Calendar,
  Flag,
  Target,
  Sparkles,
  ChevronRight,
  Maximize2,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { ProjectProgressBurnRateWidget } from './ProjectProgressBurnRateWidget';
import { ProjectBudgetUtilizationSummaryCard } from './ProjectBudgetUtilizationSummaryCard';
import { useProjectContext, ProjectMilestone } from '../../context/ProjectContext';

interface CEODashboardProps {
  currentProjectId?: string;
  onSelectProject: (projId: string) => void;
  onNavigate: (tabId: string) => void;
}

export const CEODashboard: React.FC<CEODashboardProps> = ({
  currentProjectId,
  onSelectProject,
  onNavigate
}) => {
  const {
    projects,
    currentProjectId: activeProjectId,
    currentProject,
    setCurrentProjectId,
    monthlyMetrics,
    projectMilestones,
    evmMetrics,
    timeFilter,
    setTimeFilter
  } = useProjectContext();

  const [milestoneFilter, setMilestoneFilter] = useState<'all' | 'critical'>('all');
  const [dashboardViewMode, setDashboardViewMode] = useState<'dual_charts' | 'comprehensive_widget'>('dual_charts');

  // Filter milestones based on critical path toggle
  const filteredMilestones = projectMilestones.filter((m) => {
    if (milestoneFilter === 'critical') return m.criticalPath;
    return true;
  });

  // Shorten name for clean X-axis display in Bar Chart
  const milestoneChartData = filteredMilestones.map((m) => {
    let shortName = m.name;
    if (shortName.length > 18) {
      shortName = shortName.substring(0, 18) + '...';
    }
    return {
      ...m,
      shortName,
      variance: m.actualProgress - m.plannedProgress
    };
  });

  // Milestone completion stats
  const completedMilestones = projectMilestones.filter((m) => m.status === 'completed').length;
  const inProgressMilestones = projectMilestones.filter((m) => m.status === 'in_progress').length;
  const delayedMilestones = projectMilestones.filter((m) => m.status === 'delayed').length;
  const upcomingMilestones = projectMilestones.filter((m) => m.status === 'upcoming').length;

  // Warehouse discrepancy alert (> 5% discrepancy per Page 12)
  const warehouseDiscrepancyAlerts = [
    {
      id: 'ALERT-01',
      item: 'میلگرد Φ25 کارخانه میهن',
      ordered: 50,
      received: 46,
      diffPercent: 8,
      warehouse: 'انبار مرکزی کابل',
      status: 'در انتظار تأیید مدیر خرید'
    },
    {
      id: 'ALERT-02',
      item: 'سیمان پاکتی پرتلند غوری',
      ordered: 1000,
      received: 940,
      diffPercent: 6,
      warehouse: 'سایت کارگاه دارالامان',
      status: 'گزارش کسری بارنامه صادر شد'
    }
  ];

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const avgProgress = Math.round(
    projects.reduce((s, p) => s + p.progressPercent, 0) / projects.length
  );

  const handleSelectProject = (projId: string) => {
    setCurrentProjectId(projId);
    onSelectProject(projId);
  };

  // Custom Tooltip for Milestones Bar Chart
  const CustomMilestoneTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ProjectMilestone & { variance: number } = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[220px] text-right font-['Vazirmatn',sans-serif]">
          <div className="font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span>{data.name}</span>
            {data.criticalPath && (
              <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-bold">
                مسیر بحرانی (CPM)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            فاز: <span className="text-slate-200">{data.phase}</span> • موعد: <span className="text-amber-300 font-mono">{data.targetDate}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sky-400 font-medium">پیشرفت برنامه‌ای:</span>
            <span className="font-mono font-bold text-sky-400">{data.plannedProgress}٪</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-medium">پیشرفت واقعی محقق:</span>
            <span className="font-mono font-bold text-amber-400">{data.actualProgress}٪</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 pt-1 font-mono text-[11px]">
            <span className="text-slate-400">انحراف (Variance):</span>
            <span className={data.variance >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {data.variance >= 0 ? `+${data.variance}٪ (جلوتر)` : `${data.variance}٪ (تأخیر)`}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 pt-0.5">
            وضعیت: {data.status === 'completed' ? 'تکمیل شده' : data.status === 'in_progress' ? 'در حال اجرا' : data.status === 'delayed' ? 'دارای تأخیر' : 'آتی / برنامه‌ریزی‌شده'}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Burn Rate Line Chart
  const CustomBurnRateTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[210px] text-right font-['Vazirmatn',sans-serif]">
          <div className="font-bold text-slate-100 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>دوره: {data.month}</span>
            {data.isForecast && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">
                پیش‌بینی
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-400">نرخ مصرف ماهانه:</span>
            <span className="font-mono font-bold text-amber-400">{data.monthlyBurnM} میلیون ؋</span>
          </div>
          {data.actualCostM !== null && (
            <div className="flex items-center justify-between">
              <span className="text-emerald-400">هزینه‌کرد واقعی تجمعی (AC):</span>
              <span className="font-mono font-bold text-emerald-400">{data.actualCostM}M ؋</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sky-400">بودجه برنامه‌ای تجمعی (PV):</span>
            <span className="font-mono font-bold text-sky-400">{data.plannedCostM}M ؋</span>
          </div>
          {data.milestone && (
            <div className="text-[10px] text-amber-300 pt-1 border-t border-slate-800">
              نقطه عطف: {data.milestone}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-100">
                  داشبورد اجرایی و نظارتی کلان (CEO Executive Dashboard)
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                  سطح دسترسی: مدیریت ارشد / نظارتی
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نمای تحلیلی پیشرفت نقاط عطف پروژه، نرخ مصرف بودجه، شاخص‌های ارزش کسب‌شده (EVM) و هشدارهای مغایرت انبار
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono shadow-sm">
            سازمان: شرکت ساختمانی و مهندسی پامیر الماس
          </span>
        </div>
      </div>

      {/* Fixed 4-Column KPI Block (Section 7-2 Wireframe: پروژه‌ها ۱۲ | پیشرفت ۶۸٪ | هزینه ۴۵M | کارکنان ۸۷) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ab-card-interactive p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">پروژه‌های فعال</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">12</span>
            <span className="text-xs text-slate-400">پروژه در حال اجرا</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>۲ پروژه جدید در این ماه</span>
          </div>
        </div>

        <div className="ab-card-interactive p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">میانگین پیشرفت فیزیکی</span>
            <Target className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-400 font-mono">68%</span>
            <span className="text-xs text-slate-400">تحقق اهداف فصلی</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: '68%' }} />
          </div>
        </div>

        <div className="ab-card-interactive p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">بودجه مصرفی / تعهدات</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">45M</span>
            <span className="text-xs text-slate-400">افغانی (AFN)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            از مجموع ۱۲۵ میلیون مصوب
          </div>
        </div>

        <div className="ab-card-interactive p-4.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">نیروی کار و کارکنان</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400 font-mono">87</span>
            <span className="text-xs text-slate-400">مهندس و کارگر در کارگاه</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>۱۰۰٪ دارای تجهیزات ایمنی HSE</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CEO DASHBOARD SUMMARY CARD: Budget Utilization vs Expenditures */}
      {/* ============================================================== */}
      <ProjectBudgetUtilizationSummaryCard
        onSelectProject={handleSelectProject}
        onNavigateToFinance={() => onNavigate('finance')}
      />

      {/* ============================================================== */}
      {/* CEO VISUALIZATION CONTROLS BAR: Project & Mode Selectors       */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shadow-inner">
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-400">پروژه منتخب جهت تحلیل نمودار:</span>
            <select
              value={activeProjectId}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="bg-transparent text-amber-300 font-black text-xs focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-bold">
            بودجه: {(currentProject.budget / 1000000).toFixed(1)}M AFN • پیشرفت فیزیکی: {currentProject.progressPercent}٪
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setDashboardViewMode('dual_charts')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              dashboardViewMode === 'dual_charts'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>نمودارهای تفکیکی (نقاط عطف و نرخ مصرف)</span>
          </button>
          <button
            onClick={() => setDashboardViewMode('comprehensive_widget')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              dashboardViewMode === 'comprehensive_widget'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>سامانه پایش تفصیلی S-Curve & EVM</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: RECHARTS-BASED DUAL CHARTS                          */}
      {/* 1. Bar Chart: Project Milestones vs Actual Progress           */}
      {/* 2. Line Chart: Budget Burn Rate Over Time                     */}
      {/* ============================================================== */}
      {dashboardViewMode === 'dual_charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ------------------------------------------------------------ */}
          {/* CHART 1: RECHARTS BAR CHART (Milestones vs Actual Progress)  */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-100">
                    تحلیل نقاط عطف پروژه در برابر پیشرفت واقعی
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  مقایسه درصد پیشرفت برنامه‌ای مصوب در برابر پیشرفت واقعی محقق‌شده (Milestones vs Actual)
                </p>
              </div>

              {/* Milestone Critical Path Filter */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setMilestoneFilter('all')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${
                    milestoneFilter === 'all'
                      ? 'bg-slate-800 text-amber-400 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تمام نقاط عطف ({projectMilestones.length})
                </button>
                <button
                  onClick={() => setMilestoneFilter('critical')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${
                    milestoneFilter === 'critical'
                      ? 'bg-slate-800 text-rose-400 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  مسیر بحرانی CPM ({projectMilestones.filter((m) => m.criticalPath).length})
                </button>
              </div>
            </div>

            {/* Quick Status Pills */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">تکمیل‌شده:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{completedMilestones}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">در حال اجرا:</span>
                <span className="font-bold text-amber-400 font-mono text-sm">{inProgressMilestones}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">دارای تأخیر:</span>
                <span className="font-bold text-rose-400 font-mono text-sm">{delayedMilestones}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">فازهای آتی:</span>
                <span className="font-bold text-sky-400 font-mono text-sm">{upcomingMilestones}</span>
              </div>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="h-80 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={milestoneChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="shortName"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    unit="٪"
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomMilestoneTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    formatter={(value) => (
                      <span className="text-[11px] text-slate-300 font-medium px-1">
                        {value === 'plannedProgress'
                          ? 'پیشرفت برنامه‌ای مصوب نقطه عطف (Planned ٪)'
                          : 'پیشرفت واقعی محقق‌شده (Actual ٪)'}
                      </span>
                    )}
                  />
                  <ReferenceLine
                    y={currentProject.progressPercent}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: `تراز پروژه: ${currentProject.progressPercent}٪`,
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                  <Bar
                    dataKey="plannedProgress"
                    fill="#38bdf8"
                    name="plannedProgress"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="actualProgress"
                    name="actualProgress"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  >
                    {milestoneChartData.map((entry, index) => (
                      <Cell
                        key={`milestone-cell-${index}`}
                        fill={
                          entry.actualProgress >= entry.plannedProgress
                            ? '#10b981'
                            : entry.status === 'delayed'
                            ? '#f43f5e'
                            : '#f59e0b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Narrative Footer */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  نقطه عطف بحرانی بعدی: <strong>{projectMilestones.find((m) => m.status === 'in_progress')?.name || 'تحویل فاز'}</strong>
                </span>
              </div>
              <button
                onClick={() => onNavigate('project')}
                className="text-amber-400 hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>مشاهده WBS کامل</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* CHART 2: RECHARTS LINE CHART (Budget Burn Rate Over Time)     */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-100">
                    روند و نرخ مصرف بودجه در طول زمان (Budget Burn Rate)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  نمودار خطی نرخ جریان نقدینگی ماهانه به همراه خطوط هزینه تجمعی و بودجه مصوب (AFN)
                </p>
              </div>

              {/* Time Range Filter */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${
                    timeFilter === 'all'
                      ? 'bg-slate-800 text-amber-400 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ۱۲ ماه خورشیدی
                </button>
                <button
                  onClick={() => setTimeFilter('historical')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${
                    timeFilter === 'historical'
                      ? 'bg-slate-800 text-amber-400 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  واقعی سپری‌شده
                </button>
              </div>
            </div>

            {/* Burn Rate Metrics Summary */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">مصرف میانگین:</span>
                <span className="font-bold text-amber-400 font-mono text-sm">
                  {evmMetrics.averageMonthlyBurnM}M <span className="text-[10px] font-normal text-slate-400">؋/ماه</span>
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">ماندگاری بودجه:</span>
                <span className="font-bold text-purple-400 font-mono text-sm">
                  {evmMetrics.runwayMonths} <span className="text-[10px] font-normal text-slate-400">ماه</span>
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">شاخص هزینه (CPI):</span>
                <span className={`font-bold font-mono text-sm ${evmMetrics.cpi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {evmMetrics.cpi.toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">صرفه‌جویی (CV):</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  +{evmMetrics.costVarianceM}M ؋
                </span>
              </div>
            </div>

            {/* Recharts Line Chart Container */}
            <div className="h-80 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyMetrics}
                  margin={{ top: 10, right: 15, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(val: string) => val.split(' ')[0]}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    unit="M؋"
                  />
                  <Tooltip content={<CustomBurnRateTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    formatter={(value) => (
                      <span className="text-[11px] text-slate-300 font-medium px-1">
                        {value === 'monthlyBurnM'
                          ? 'نرخ مصرف ماهانه (Monthly Burn M؋)'
                          : value === 'actualCostM'
                          ? 'مجموع هزینه‌کرد واقعی تجمعی (AC)'
                          : 'بودجه مبنای برنامه‌ای تجمعی (PV)'}
                      </span>
                    )}
                  />
                  <ReferenceLine
                    y={evmMetrics.averageMonthlyBurnM}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `میانگین: ${evmMetrics.averageMonthlyBurnM}M AFN`,
                      fill: '#f59e0b',
                      fontSize: 10,
                      position: 'insideTopLeft'
                    }}
                  />
                  {/* Line 1: Monthly Burn Rate */}
                  <Line
                    type="monotone"
                    dataKey="monthlyBurnM"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1, stroke: '#0f172a' }}
                    activeDot={{ r: 6, fill: '#f59e0b' }}
                    name="monthlyBurnM"
                  />
                  {/* Line 2: Cumulative Actual Cost */}
                  <Line
                    type="monotone"
                    dataKey="actualCostM"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10b981' }}
                    name="actualCostM"
                  />
                  {/* Line 3: Planned Baseline Cost */}
                  <Line
                    type="monotone"
                    dataKey="plannedCostM"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#38bdf8' }}
                    name="plannedCostM"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Narrative Footer */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>
                  سقف بودجه کل: <strong>{evmMetrics.totalBudgetM} میلیون افغانی</strong> • باقیمانده: <strong>{evmMetrics.remainingBudgetM}M ؋</strong>
                </span>
              </div>
              <button
                onClick={() => onNavigate('finance')}
                className="text-amber-400 hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>دفتر مالی و بودجه</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative View: Comprehensive S-Curve & EVM Widget */}
      {dashboardViewMode === 'comprehensive_widget' && (
        <ProjectProgressBurnRateWidget onNavigate={onNavigate} />
      )}

      {/* Warehouse Discrepancy Alerts (> 5% Discrepancy Alert Banner per Page 12) */}
      {warehouseDiscrepancyAlerts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>هشدارهای مغایرت دریافت مصالح انبار (اختلاف بارنامه بیش از ۵٪):</span>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-amber-400 hover:underline text-[11px] font-semibold"
            >
              بررسی در انبارداری
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {warehouseDiscrepancyAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-100">{alert.item}</span>
                  <span className="text-rose-400 font-mono">کسری: {alert.diffPercent}٪</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  سفارش: {alert.ordered} تن/کیسه • دریافت واقعی: {alert.received} تن/کیسه
                </div>
                <div className="text-[10px] text-amber-300 font-medium pt-0.5">
                  وضعیت: {alert.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Project Drill-Down Table (Page 13 Wireframe) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>پروژه‌های سازمان و وضعیت فازهای اجرایی</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {projects.length} پروژه سازمانی
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">کد پروژه</th>
                <th className="p-3.5 font-bold">نام پروژه و موقعیت</th>
                <th className="p-3.5 font-bold">کارفرما</th>
                <th className="p-3.5 font-bold text-center">بودجه کل</th>
                <th className="p-3.5 font-bold text-center">پیشرفت فیزیکی</th>
                <th className="p-3.5 font-bold text-center">وضعیت</th>
                <th className="p-3.5 font-bold text-left">عملیات نظارتی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projects.map((proj) => {
                const isCurrent = proj.id === activeProjectId;
                return (
                  <tr
                    key={proj.id}
                    className={`transition ${
                      isCurrent
                        ? 'bg-amber-500/10 border-r-4 border-amber-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{proj.code}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{proj.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black">
                            انتخاب فعلی
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{proj.location}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">{proj.client}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-100">
                      {(proj.budget / 1000000).toFixed(1)}M AFN
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono font-bold text-slate-200">
                          {proj.progressPercent}٪
                        </span>
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${proj.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          proj.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {proj.status === 'active' ? 'در حال ساخت' : 'مرحله طراحی'}
                      </span>
                    </td>
                    <td className="p-3.5 text-left">
                      <button
                        onClick={() => handleSelectProject(proj.id)}
                        className={`flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isCurrent ? 'پروژه جاری نمودار' : 'انتخاب در نمودار و جزئیات'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
