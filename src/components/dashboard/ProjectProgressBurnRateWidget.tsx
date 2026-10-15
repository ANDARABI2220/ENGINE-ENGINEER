import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Layers,
  ChevronDown,
  Filter,
  Maximize2,
  Info,
  ShieldCheck,
  Flag,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { useProjectContext } from '../../context/ProjectContext';

interface ProjectProgressBurnRateWidgetProps {
  onNavigate?: (tabId: string) => void;
  className?: string;
}

export const ProjectProgressBurnRateWidget: React.FC<ProjectProgressBurnRateWidgetProps> = ({
  onNavigate,
  className = ''
}) => {
  const {
    projects,
    currentProjectId,
    currentProject,
    setCurrentProjectId,
    monthlyMetrics,
    costCategories,
    evmMetrics,
    timeFilter,
    setTimeFilter
  } = useProjectContext();

  const [activeView, setActiveView] = useState<'scurve' | 'burnRate' | 'evm' | 'categories'>('scurve');

  // Format Persian currency numbers
  const formatAFN = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    return `${val.toLocaleString('fa-AF', { maximumFractionDigits: 1 })} میلیون ؋`;
  };

  const formatPercent = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    return `${val}٪`;
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl ${className}`}>
      {/* Top Header & Project Context Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base text-slate-100">
                  پایش پیشرفت فیزیکی و نرخ مصرف بودجه (S-Curve & Burn Rate)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold">
                  {currentProject.code}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  evmMetrics.healthStatus === 'healthy'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : evmMetrics.healthStatus === 'caution'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  {evmMetrics.healthStatus === 'healthy' ? 'وضعیت بودجه: نرمال و پایدار' : evmMetrics.healthStatus === 'caution' ? 'وضعیت بودجه: نیازمند پایش' : 'وضعیت بودجه: اضافه مصرف'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                داده‌های تحلیلی بلادرنگ متصل به کانتکست پروژه: <span className="text-slate-200 font-bold">{currentProject.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Context Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs shadow-inner">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">پروژه فعال:</span>
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer pr-1"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                timeFilter === 'all'
                  ? 'bg-slate-800 text-amber-400 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تمام دوره
            </button>
            <button
              onClick={() => setTimeFilter('historical')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                timeFilter === 'historical'
                  ? 'bg-slate-800 text-amber-400 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              عملکرد واقعی
            </button>
            <button
              onClick={() => setTimeFilter('forecast')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                timeFilter === 'forecast'
                  ? 'bg-slate-800 text-amber-400 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              پیش‌بینی
            </button>
          </div>
        </div>
      </div>

      {/* KPI Performance Bar (EVM & Cashflow Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Budget (BAC) */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">بودجه مصوب (BAC):</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-mono font-black text-amber-400 text-sm mt-1">
            {evmMetrics.totalBudgetM.toFixed(1)}M ؋
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            تعهد مالی کل قرارداد
          </div>
        </div>

        {/* Actual Cost (AC) */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">هزینه‌کرد واقعی (AC):</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="font-mono font-black text-sky-400 text-sm mt-1">
            {evmMetrics.actualCostM.toFixed(1)}M ؋
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {((evmMetrics.actualCostM / evmMetrics.totalBudgetM) * 100).toFixed(0)}٪ از بودجه کل مصرف شده
          </div>
        </div>

        {/* Earned Value (EV) */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">ارزش کسب‌شده (EV):</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-mono font-black text-emerald-400 text-sm mt-1">
            {evmMetrics.earnedValueM.toFixed(1)}M ؋
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            پیشرفت فیزیکی: {currentProject.progressPercent}٪
          </div>
        </div>

        {/* Cost Performance Index (CPI) */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">شاخص هزینه (CPI):</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              evmMetrics.cpi >= 1.0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
            }`}>
              {evmMetrics.cpi >= 1.0 ? 'مطلوب' : 'هشدار'}
            </span>
          </div>
          <div className="font-mono font-black text-slate-100 text-sm mt-1 flex items-center gap-1">
            <span>{evmMetrics.cpi.toFixed(2)}</span>
            {evmMetrics.cpi >= 1.0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            واریانس هزینه: {evmMetrics.costVarianceM >= 0 ? `+${evmMetrics.costVarianceM}M` : `${evmMetrics.costVarianceM}M`} AFN
          </div>
        </div>

        {/* Schedule Performance Index (SPI) */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">شاخص زمان (SPI):</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              evmMetrics.spi >= 1.0 ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
            }`}>
              {evmMetrics.spi >= 1.0 ? 'طبق برنامه' : 'تأخیر'}
            </span>
          </div>
          <div className="font-mono font-black text-slate-100 text-sm mt-1 flex items-center gap-1">
            <span>{evmMetrics.spi.toFixed(2)}</span>
            {evmMetrics.spi >= 1.0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            واریانس زمان: {evmMetrics.scheduleVarianceM >= 0 ? `+${evmMetrics.scheduleVarianceM}M` : `${evmMetrics.scheduleVarianceM}M`} AFN
          </div>
        </div>

        {/* Budget Runway */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">ماندگاری بودجه:</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="font-mono font-black text-purple-400 text-sm mt-1">
            {evmMetrics.runwayMonths} ماه
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            نرخ میانگین: {evmMetrics.averageMonthlyBurnM}M AFN/ماه
          </div>
        </div>
      </div>

      {/* Chart View Mode Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('scurve')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'scurve'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>منحنی پیشرفت اس-کورو S-Curve (٪)</span>
          </button>

          <button
            onClick={() => setActiveView('burnRate')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'burnRate'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>نرخ مصرف ماهانه و جریان نقدینگی (Burn Rate)</span>
          </button>

          <button
            onClick={() => setActiveView('evm')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'evm'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>تحلیل ارزش کسب‌شده (PV / EV / AC)</span>
          </button>

          <button
            onClick={() => setActiveView('categories')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeView === 'categories'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>تفکیک هزینه‌کرد اقلام کارگاه</span>
          </button>
        </div>

        {/* View Legend & Summary Quick Badge */}
        <div className="text-[11px] text-slate-400 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>عملکرد واقعی</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>برنامه مصوب</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>ارزش کسب‌شده</span>
          </div>
        </div>
      </div>

      {/* Recharts Visualization Canvas */}
      <div className="h-80 w-full pt-1">
        {/* VIEW 1: S-Curve AreaChart */}
        {activeView === 'scurve' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyMetrics}
              margin={{ top: 12, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="actualProgressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="plannedProgressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit="٪"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  direction: 'rtl',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(value: any, name: any) => [
                  value !== null && value !== undefined ? `${value}٪` : 'پیش‌بینی در آینده',
                  name === 'actualProgress'
                    ? 'پیشرفت فیزیکی واقعی (Earned Progress)'
                    : 'پیشرفت برنامه‌ای مصوب (Planned Progress)'
                ]}
                labelFormatter={(label: any) => `دوره: ${label}`}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-medium px-2">
                    {value === 'actualProgress'
                      ? 'پیشرفت واقعی فیزیکی سازه (Actual ٪)'
                      : 'منحنی پیشرفت برنامه‌ریزی‌شده مصوب (Baseline ٪)'}
                  </span>
                )}
              />
              <ReferenceLine
                y={currentProject.progressPercent}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `پیشرفت جاری: ${currentProject.progressPercent}٪`,
                  fill: '#ef4444',
                  fontSize: 11,
                  position: 'right'
                }}
              />
              <Area
                type="monotone"
                dataKey="plannedProgress"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#plannedProgressGrad)"
                name="plannedProgress"
              />
              <Area
                type="monotone"
                dataKey="actualProgress"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
                fillOpacity={1}
                fill="url(#actualProgressGrad)"
                name="actualProgress"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* VIEW 2: Monthly Burn Rate & Cumulative Cash Flow ComposedChart */}
        {activeView === 'burnRate' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlyMetrics}
              margin={{ top: 12, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
              />
              {/* Left Axis for Monthly Burn */}
              <YAxis
                yAxisId="monthly"
                stroke="#f59e0b"
                tick={{ fill: '#f59e0b', fontSize: 11 }}
                unit="M؋"
                domain={[0, 15]}
              />
              {/* Right Axis for Cumulative */}
              <YAxis
                yAxisId="cumulative"
                orientation="right"
                stroke="#38bdf8"
                tick={{ fill: '#38bdf8', fontSize: 11 }}
                unit="M؋"
                domain={[0, Math.ceil(evmMetrics.totalBudgetM * 1.05)]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  direction: 'rtl'
                }}
                formatter={(value: any, name: any) => [
                  value !== null ? `${value} میلیون افغانی` : '—',
                  name === 'monthlyBurnM'
                    ? 'نرخ مصرف واقعی ماهانه (Monthly Burn)'
                    : name === 'monthlyPlannedBurnM'
                    ? 'نرخ مصرف برنامه‌ای ماهانه'
                    : name === 'actualCostM'
                    ? 'هزینه‌کرد تجمعی واقعی (AC)'
                    : 'بودجه برنامه‌ای تجمعی (PV)'
                ]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-medium px-2">
                    {value === 'monthlyBurnM'
                      ? 'نرخ مصرف ماهانه (میله‌ای - M؋)'
                      : value === 'actualCostM'
                      ? 'هزینه‌کرد تجمعی واقعی (خط سبز)'
                      : 'بودجه تجمعی برنامه‌ای (خط آبی)'}
                  </span>
                )}
              />
              <ReferenceLine
                yAxisId="cumulative"
                y={evmMetrics.totalBudgetM}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `سقف بودجه: ${evmMetrics.totalBudgetM}M ؋`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              <Bar
                yAxisId="monthly"
                dataKey="monthlyBurnM"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                name="monthlyBurnM"
              >
                {monthlyMetrics.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isForecast ? '#64748b' : '#f59e0b'}
                    opacity={entry.isForecast ? 0.4 : 0.9}
                  />
                ))}
              </Bar>
              <Line
                yAxisId="cumulative"
                type="monotone"
                dataKey="plannedCostM"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#38bdf8' }}
                name="plannedCostM"
              />
              <Line
                yAxisId="cumulative"
                type="monotone"
                dataKey="actualCostM"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                name="actualCostM"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* VIEW 3: Earned Value Management (PV / EV / AC) */}
        {activeView === 'evm' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyMetrics.filter((m) => !m.isForecast || m.month.includes('جاری'))}
              margin={{ top: 12, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  direction: 'rtl'
                }}
                formatter={(value: any, name: any) => [
                  `${value} میلیون افغانی`,
                  name === 'plannedCostM'
                    ? 'ارزش برنامه‌ریزی‌شده (PV)'
                    : name === 'earnedValueM'
                    ? 'ارزش کسب‌شده فیزیکی (EV)'
                    : 'هزینه واقعی انجام‌شده (AC)'
                ]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-medium px-2">
                    {value === 'plannedCostM'
                      ? 'Planned Value (PV)'
                      : value === 'earnedValueM'
                      ? 'Earned Value (EV)'
                      : 'Actual Cost (AC)'}
                  </span>
                )}
              />
              <Bar dataKey="plannedCostM" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="earnedValueM" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="actualCostM" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* VIEW 4: Cost Category Breakdown */}
        {activeView === 'categories' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={costCategories}
              layout="vertical"
              margin={{ top: 12, right: 30, left: 100, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit="M؋"
              />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#64748b"
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  direction: 'rtl'
                }}
                formatter={(value: any, name: any) => [
                  `${value} میلیون افغانی`,
                  name === 'spentM' ? 'مصرف واقعی تجمعی' : 'سقف بودجه مصوب سرفصل'
                ]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-medium px-2">
                    {value === 'spentM' ? 'مصرف واقعی کارگاه' : 'سقف بودجه تخصیصی ردیف'}
                  </span>
                )}
              />
              <Bar dataKey="budgetM" fill="#334155" radius={[0, 4, 4, 0]} maxBarSize={18} />
              <Bar dataKey="spentM" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {costCategories.map((entry, index) => (
                  <Cell key={`cat-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Project Milestones Progress Tracker */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>نقاط عطف کلیدی و تحویل فازهای اجرایی پروژه:</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {currentProject.startDate} تا {currentProject.completionDate}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {monthlyMetrics
            .filter((m) => m.milestone)
            .slice(0, 4)
            .map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2"
              >
                <div className="mt-0.5">
                  {!m.isForecast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-200 truncate">
                    {m.milestone}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                    <span>{m.month.replace(' (جاری)', '')}</span>
                    <span className="font-mono text-amber-300">{m.plannedProgress}٪</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Narrative Analysis Footer & Quick Actions */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className={`w-2.5 h-2.5 rounded-full ${
            evmMetrics.cpi >= 1.0 ? 'bg-emerald-400' : 'bg-rose-400'
          }`} />
          <span>
            پروژه <strong>{currentProject.name}</strong> با نرخ مصرف میانگین <strong>{evmMetrics.averageMonthlyBurnM} میلیون افغانی در ماه</strong> و ماندگاری بودجه <strong>{evmMetrics.runwayMonths} ماه</strong> پایش می‌شود.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('project')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center gap-1"
              >
                <span>مشاهده برنامه زمان‌بندی (WBS)</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => onNavigate('boq')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center gap-1"
              >
                <span>متره و برآورد (BOQ)</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
