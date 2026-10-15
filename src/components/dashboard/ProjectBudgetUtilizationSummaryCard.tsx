import React, { useState, useMemo } from 'react';
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { useProjectContext } from '../../context/ProjectContext';

interface ProjectBudgetUtilizationSummaryCardProps {
  onSelectProject?: (projId: string) => void;
  onNavigateToFinance?: () => void;
}

export const ProjectBudgetUtilizationSummaryCard: React.FC<ProjectBudgetUtilizationSummaryCardProps> = ({
  onSelectProject,
  onNavigateToFinance
}) => {
  const {
    projects,
    currentProjectId,
    setCurrentProjectId,
    currentProject,
    monthlyMetrics,
    evmMetrics,
    costCategories
  } = useProjectContext();

  const [activeView, setActiveView] = useState<'cross_project' | 'project_monthly' | 'cost_distribution'>('cross_project');
  const [selectedSort, setSelectedSort] = useState<'budget' | 'utilization' | 'spent'>('budget');

  // Realistic Afghan engineering project expenditure lookup
  const expenditureMap: Record<string, number> = useMemo(() => ({
    'proj-01': 38.2, // برج مسکونی کابل: 38.2M out of 45M (84.9%)
    'proj-02': 19.5, // پل بزرگ هرات: 19.5M out of 32M (60.9%)
    'proj-03': 17.2, // مدرسه مزار: 17.2M out of 18.5M (93.0%)
    'proj-04': 83.6, // جاده ترانزیتی قندهار: 83.6M out of 85M (98.4%)
    'proj-05': 9.8   // مجتمع جلال‌آباد: 9.8M out of 52M (18.8%)
  }), []);

  // Aggregated data for Recharts across all projects
  const crossProjectData = useMemo(() => {
    const list = projects.map((p) => {
      const budgetM = Number((p.budget / 1000000).toFixed(1));
      const spentM = expenditureMap[p.id] ?? Number(((p.budget * (p.progressPercent / 100) * 0.96) / 1000000).toFixed(1));
      const utilizationPercent = Math.round((spentM / budgetM) * 100);
      const varianceM = Number((budgetM - spentM).toFixed(1));
      let shortName = p.name;
      if (shortName.length > 17) {
        shortName = shortName.substring(0, 16) + '...';
      }

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        shortName,
        location: p.location,
        budgetM,
        spentM,
        varianceM,
        utilizationPercent,
        progressPercent: p.progressPercent,
        status: p.status,
        isSelected: p.id === currentProjectId
      };
    });

    if (selectedSort === 'utilization') {
      return [...list].sort((a, b) => b.utilizationPercent - a.utilizationPercent);
    } else if (selectedSort === 'spent') {
      return [...list].sort((a, b) => b.spentM - a.spentM);
    }
    return [...list].sort((a, b) => b.budgetM - a.budgetM);
  }, [projects, expenditureMap, currentProjectId, selectedSort]);

  // Overall totals
  const totalOrgBudgetM = useMemo(() => {
    return Number((crossProjectData.reduce((acc, p) => acc + p.budgetM, 0)).toFixed(1));
  }, [crossProjectData]);

  const totalOrgSpentM = useMemo(() => {
    return Number((crossProjectData.reduce((acc, p) => acc + p.spentM, 0)).toFixed(1));
  }, [crossProjectData]);

  const totalOrgVarianceM = useMemo(() => {
    return Number((totalOrgBudgetM - totalOrgSpentM).toFixed(1));
  }, [totalOrgBudgetM, totalOrgSpentM]);

  const averageUtilizationRate = useMemo(() => {
    if (totalOrgBudgetM === 0) return 0;
    return Math.round((totalOrgSpentM / totalOrgBudgetM) * 100);
  }, [totalOrgBudgetM, totalOrgSpentM]);

  // Project with highest utilization
  const highestUtilProject = useMemo(() => {
    return [...crossProjectData].sort((a, b) => b.utilizationPercent - a.utilizationPercent)[0];
  }, [crossProjectData]);

  // Monthly project budget vs actual expenditure
  const monthlyExpenditureData = useMemo(() => {
    return monthlyMetrics.map((m) => {
      const budgetM = m.monthlyPlannedBurnM;
      const spentM = m.monthlyBurnM;
      const utilPercent = budgetM > 0 ? Math.round((spentM / budgetM) * 100) : 0;
      return {
        month: m.month.split(' ')[0],
        fullMonth: m.month,
        budgetBurnM: budgetM,
        actualSpentM: spentM,
        plannedCumulativeM: m.plannedCostM,
        actualCumulativeM: m.actualCostM ?? m.plannedCostM,
        utilPercent,
        isForecast: m.isForecast,
        milestone: m.milestone
      };
    });
  }, [monthlyMetrics]);

  // Custom Tooltip for Cross-Project Comparison
  const CustomCrossProjectTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl text-xs space-y-2 min-w-[240px] text-right font-['Vazirmatn',sans-serif] backdrop-blur-md">
          <div className="font-extrabold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span>{data.name}</span>
              <span className="block text-[10px] text-amber-400 font-mono mt-0.5">{data.code} • {data.location}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              data.utilizationPercent > 95
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : data.utilizationPercent > 75
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {data.utilizationPercent}٪ جذب
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-sky-400 block font-sans">بودجه مصوب (Budget):</span>
              <span className="font-bold text-sky-300 text-sm">{data.budgetM}</span>
              <span className="text-[10px] text-slate-400 mr-1">میلیون ؋</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-amber-400 block font-sans">هزینه‌کرد واقعی (Actual):</span>
              <span className="font-bold text-amber-300 text-sm">{data.spentM}</span>
              <span className="text-[10px] text-slate-400 mr-1">میلیون ؋</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400">مانده / تراز بودجه (Variance):</span>
            <span className={`font-mono font-bold ${data.varianceM >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.varianceM >= 0 ? `+${data.varianceM}` : data.varianceM} M ؋
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">پیشرفت فیزیکی کارگاه:</span>
            <span className="font-mono font-bold text-slate-200">{data.progressPercent}٪</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Monthly Project Expenditure
  const CustomMonthlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[210px] text-right font-['Vazirmatn',sans-serif] backdrop-blur-md">
          <div className="font-extrabold text-slate-100 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>دوره: {data.fullMonth}</span>
            {data.isForecast && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">پیش‌بینی</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sky-400">تخصیص بودجه ماهانه:</span>
            <span className="font-mono font-bold text-sky-400">{data.budgetBurnM}M ؋</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-400">هزینه‌کرد واقعی ماهانه:</span>
            <span className="font-mono font-bold text-amber-400">{data.actualSpentM}M ؋</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 pt-1">
            <span className="text-slate-400">نرخ مصرف دوره:</span>
            <span className="font-mono font-bold text-emerald-400">{data.utilPercent}٪</span>
          </div>
          {data.milestone && (
            <div className="text-[10px] text-amber-300 pt-0.5">رویداد: {data.milestone}</div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry: any) => {
    if (entry && entry.id) {
      setCurrentProjectId(entry.id);
      if (onSelectProject) {
        onSelectProject(entry.id);
      }
    }
  };

  return (
    <div className="ab-card p-5 space-y-5 bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800/90 shadow-2xl rounded-2xl relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-80 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30 shadow-inner">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <span>پایش مصرف بودجه در برابر هزینه‌کرد واقعی پروژه‌ها</span>
                <span className="text-xs font-mono text-amber-400/90 font-medium">
                  (Project Budget Utilization vs. Actual Expenditure)
                </span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                تحلیل زنده Recharts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مقایسه بودجه مصوب کل، هزینه‌کرد واقعی محقق‌شده، نرخ جذب سرمایه و مانده نقدینگی در سطح پروژه‌ها
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveView('cross_project')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ab-interactive-elem ${
                activeView === 'cross_project'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>مقایسه کلی پروژه‌ها</span>
            </button>
            <button
              onClick={() => setActiveView('project_monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ab-interactive-elem ${
                activeView === 'project_monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>جریان ماهانه ({currentProject.name.split(' ')[0]})</span>
            </button>
          </div>

          {activeView === 'cross_project' && (
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer ab-interactive-elem"
            >
              <option value="budget">مرتب‌سازی: بودجه مصوب</option>
              <option value="utilization">مرتب‌سازی: نرخ جذب بودجه</option>
              <option value="spent">مرتب‌سازی: هزینه واقعی</option>
            </select>
          )}
        </div>
      </div>

      {/* KPI Summary Bar (4 Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Budget */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 ab-interactive-elem">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>مجموع بودجه مصوب</span>
            <Banknote className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-sky-400 font-mono">{totalOrgBudgetM}</span>
            <span className="text-xs text-slate-400">میلیون افغانی</span>
          </div>
          <div className="text-[10px] text-slate-500">
            برای {projects.length} پروژه سازمان
          </div>
        </div>

        {/* Total Actual Expenditure */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 ab-interactive-elem">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>کل هزینه‌کرد واقعی (Actual)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-400 font-mono">{totalOrgSpentM}</span>
            <span className="text-xs text-slate-400">میلیون افغانی</span>
          </div>
          <div className="text-[10px] text-amber-400/80 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>ثبت نهایی در دفاتر مالی</span>
          </div>
        </div>

        {/* Average Utilization Rate */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 ab-interactive-elem">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>میانگین نرخ جذب بودجه</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 font-mono">{averageUtilizationRate}٪</span>
            <span className="text-xs text-slate-400">از کل اعتبارات</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(averageUtilizationRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Budget / Variance */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 ab-interactive-elem">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>مانده اعتبارات / صرفه‌جویی</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-400 font-mono">+{totalOrgVarianceM}</span>
            <span className="text-xs text-slate-400">میلیون ؋</span>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>کنترل بدون کسری بودجه</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Container */}
      <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800/90 shadow-inner">
        {activeView === 'cross_project' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">
                نمودار ترکیبی: بودجه مصوب در برابر هزینه‌کرد واقعی و درصد جذب (کلیک روی ستون جهت انتخاب پروژه)
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                واحد: میلیون افغانی (M AFN) • خط قرمز: سقف ۱۰۰٪
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={crossProjectData}
                  margin={{ top: 15, right: 20, left: 0, bottom: 45 }}
                  onClick={(state) => {
                    const s = state as any;
                    if (s && s.activePayload && s.activePayload[0]) {
                      handleBarClick(s.activePayload[0].payload);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    unit="M؋"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    unit="٪"
                    domain={[0, 120]}
                  />
                  <Tooltip content={<CustomCrossProjectTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-slate-300 font-medium px-1">
                        {value === 'budgetM'
                          ? 'بودجه مصوب (Approved Budget M؋)'
                          : value === 'spentM'
                          ? 'هزینه‌کرد واقعی (Actual Expenditure M؋)'
                          : 'نرخ جذب بودجه (Utilization Rate ٪)'}
                      </span>
                    )}
                  />
                  <ReferenceLine
                    yAxisId="right"
                    y={100}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'سقف جذب ۱۰۰٪',
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'insideTopLeft'
                    }}
                  />
                  {/* Bar 1: Approved Budget */}
                  <Bar
                    yAxisId="left"
                    dataKey="budgetM"
                    name="budgetM"
                    fill="#38bdf8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  {/* Bar 2: Actual Spent */}
                  <Bar
                    yAxisId="left"
                    dataKey="spentM"
                    name="spentM"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  >
                    {crossProjectData.map((entry, index) => (
                      <Cell
                        key={`cell-spent-${index}`}
                        fill={
                          entry.id === currentProjectId
                            ? '#f59e0b'
                            : entry.utilizationPercent > 95
                            ? '#f43f5e'
                            : entry.utilizationPercent > 80
                            ? '#fbbf24'
                            : '#10b981'
                        }
                        stroke={entry.id === currentProjectId ? '#ffffff' : 'none'}
                        strokeWidth={entry.id === currentProjectId ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  {/* Line: Utilization Percentage */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="utilizationPercent"
                    name="utilizationPercent"
                    stroke="#c084fc"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#c084fc', strokeWidth: 1.5, stroke: '#0f172a' }}
                    activeDot={{ r: 7, fill: '#c084fc' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">
                روند ماهانه تخصیص در برابر هزینه واقعی پروژه منتخب: {currentProject.name}
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                کد: {currentProject.code} • بودجه کل: {(currentProject.budget / 1000000).toFixed(1)}M AFN
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyExpenditureData}
                  margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    unit="M؋"
                  />
                  <Tooltip content={<CustomMonthlyTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-slate-300 font-medium px-1">
                        {value === 'budgetBurnM'
                          ? 'تخصیص بودجه ماهانه (Planned Allocation M؋)'
                          : 'هزینه‌کرد واقعی ماهانه (Actual Expenditure M؋)'}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="budgetBurnM"
                    name="budgetBurnM"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="actualSpentM"
                    name="actualSpentM"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  >
                    {monthlyExpenditureData.map((entry, index) => (
                      <Cell
                        key={`monthly-cell-${index}`}
                        fill={entry.isForecast ? '#64748b' : entry.actualSpentM > entry.budgetBurnM ? '#f43f5e' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Highlights & Interactive Project Selector Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        {/* Highest Absorption */}
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">بیشترین نرخ مصرف بودجه:</span>
            <span className="font-bold text-slate-200">{highestUtilProject?.name || 'جاده ترانزیتی قندهار'}</span>
          </div>
          <span className="px-2 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">
            {highestUtilProject?.utilizationPercent}%
          </span>
        </div>

        {/* Selected Project Status */}
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">پروژه منتخب جاری:</span>
            <span className="font-bold text-amber-400">{currentProject.name.split(' ')[0]} {currentProject.name.split(' ')[1]}</span>
          </div>
          <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
            پیشرفت: {currentProject.progressPercent}%
          </span>
        </div>

        {/* Navigation Action */}
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">تحلیل تفصیلی سرفصل‌ها:</span>
            <span className="font-bold text-slate-300">دفتر مالی و بودجه‌بندی</span>
          </div>
          <button
            onClick={onNavigateToFinance}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1 shadow"
          >
            <span>ورود به ماژول مالی</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
