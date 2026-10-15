import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info,
  Activity,
  Layers,
  MapPin,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  AfghanCityKey,
  SeismicDashboardData,
  calculateSeismicRiskDashboard,
  RiskTier
} from '../../services/gisSeismicHazardService';
import { indexedDBService, OfflineSeismicRecord } from '../../services/indexedDBService';

interface SeismicRiskDashboardProps {
  cityKey: AfghanCityKey;
  onCityChange?: (city: AfghanCityKey) => void;
  isPulsingEnabled: boolean;
  onTogglePulsing: (enabled: boolean) => void;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string) => void;
}

export const SeismicRiskDashboard: React.FC<SeismicRiskDashboardProps> = ({
  cityKey,
  onCityChange,
  isPulsingEnabled,
  onTogglePulsing,
  selectedElementId,
  onSelectElement
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeDrillDown, setActiveDrillDown] = useState<'none' | 'liquefaction' | 'pga' | 'proximity' | 'audit'>('none');
  const [sensitivityThreshold, setSensitivityThreshold] = useState<'standard' | 'conservative' | 'critical'>('standard');

  // Fast compute dashboard metrics with sub-10ms latency
  const data: SeismicDashboardData = useMemo(() => {
    return calculateSeismicRiskDashboard(cityKey, sensitivityThreshold);
  }, [cityKey, sensitivityThreshold]);

  // Persist latest seismic calculation to IndexedDB offline storage
  React.useEffect(() => {
    const record: OfflineSeismicRecord = {
      id: `seismic-${cityKey}-${sensitivityThreshold}`,
      projectId: 'proj-01',
      cityName: data.cityNameFa,
      pga: data.pga.amplifiedPGA,
      liquefactionScore: data.liquefaction.score,
      soilClassification: data.pga.soilType,
      bearingCapacityKpa: 220,
      riskTier: data.overallTier,
      highRiskElementIds: Array.from(new Set(data.highRiskElementIds || [])),
      notes: data.engineeringImplicationsFa,
      updatedAt: new Date().toLocaleDateString('fa-AF'),
      timestamp: Date.now()
    };
    indexedDBService.saveOfflineSeismicRecord(record).catch(() => {});
  }, [cityKey, sensitivityThreshold, data]);

  // Helper for gauge percentage (0 to 10 scale)
  const getGaugePercentage = (score: number) => Math.min(100, Math.max(0, (score / 10) * 100));

  return (
    <div className="absolute bottom-4 right-4 z-20 font-['Vazirmatn',sans-serif] pointer-events-auto transition-all duration-300">
      {/* Collapsed Floating Pill */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 hover:border-amber-500/80 px-4 py-2.5 rounded-2xl shadow-2xl transition group text-slate-100"
          title="باز کردن داشبورد جامع ریسک لرزه‌ای"
        >
          <div className="relative">
            <span
              className="w-3 h-3 rounded-full block animate-ping absolute opacity-75"
              style={{ backgroundColor: data.overallColor }}
            />
            <span
              className="w-3 h-3 rounded-full block relative"
              style={{ backgroundColor: data.overallColor }}
            />
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>داشبورد ریسک لرزه‌ای GIS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-400">
                {data.cityNameFa}
              </span>
            </div>
            <div className="text-xs font-mono font-black" style={{ color: data.overallColor }}>
              شاخص خطر: {data.overallScore} / ۱۰ ({data.overallTierFa})
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
        </button>
      ) : (
        /* Expanded Dashboard Card */
        <div className="w-[370px] sm:w-[420px] max-w-[94vw] bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-xs flex flex-col max-h-[540px]">
          {/* Header */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-xl border flex items-center justify-center shadow-inner"
                style={{
                  backgroundColor: `${data.overallColor}18`,
                  borderColor: `${data.overallColor}50`,
                  color: data.overallColor
                }}
              >
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-xs flex items-center gap-1.5">
                  <span>داشبورد ارزیابی ریسک لرزه‌ای (BIM & GIS)</span>
                </h3>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span>مختصات سایت:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {data.siteCoordinates.lat}° N, {data.siteCoordinates.lon}° E
                  </span>
                  <span>({data.cityNameFa})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveDrillDown(activeDrillDown === 'audit' ? 'none' : 'audit')}
                className={`p-1.5 rounded-lg border transition ${
                  activeDrillDown === 'audit'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="مستندات متدولوژی و صحه‌سنجی داده‌ها (Audit Trail)"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                title="بستن پنل"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-3.5 space-y-3 overflow-y-auto scrollbar-thin">
            {/* Consolidated Overall Risk Banner */}
            <div
              className="p-3 rounded-xl border space-y-2 relative overflow-hidden transition"
              style={{
                backgroundColor: `${data.overallColor}10`,
                borderColor: `${data.overallColor}40`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    شاخص ریسک ترکیبی لرزه‌ای (Composite Seismic Index)
                  </span>
                  <div className="text-sm font-black text-slate-100 flex items-center gap-2 mt-0.5">
                    <span>{data.overallTierFa}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border"
                      style={{
                        backgroundColor: `${data.overallColor}20`,
                        borderColor: `${data.overallColor}60`,
                        color: data.overallColor
                      }}
                    >
                      {data.overallTier.toUpperCase()} TIER
                    </span>
                  </div>
                </div>

                {/* Score Circular Badge */}
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono border shadow-lg"
                  style={{
                    backgroundColor: `${data.overallColor}25`,
                    borderColor: `${data.overallColor}70`
                  }}
                >
                  <span className="text-base font-black leading-none" style={{ color: data.overallColor }}>
                    {data.overallScore}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">از ۱۰</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${getGaugePercentage(data.overallScore)}%`,
                    backgroundColor: data.overallColor
                  }}
                />
              </div>

              {/* Engineering implications text */}
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                {data.engineeringImplicationsFa}
              </p>
            </div>

            {/* Core 3 Seismic Risk Metrics Gauges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-0.5">
                <span>سه شاخص کلیدی ارزیابی ساختگاه:</span>
                <span className="text-[10px] text-cyan-400">کلیک برای جزییات فرمول</span>
              </div>

              {/* Metric 1: Liquefaction */}
              <div
                onClick={() => setActiveDrillDown(activeDrillDown === 'liquefaction' ? 'none' : 'liquefaction')}
                className={`p-2.5 rounded-xl border cursor-pointer transition ${
                  activeDrillDown === 'liquefaction'
                    ? 'bg-slate-900 border-amber-500/60 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-slate-200 text-[11px]">۱. پتانسیل روان‌گرایی خاک</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-black text-xs" style={{ color: data.liquefaction.color }}>
                      {data.liquefaction.score}/۱۰
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: data.liquefaction.color }}
                    />
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${getGaugePercentage(data.liquefaction.score)}%`,
                      backgroundColor: data.liquefaction.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>تراز آب: {data.liquefaction.groundwaterDepthM} متر</span>
                  <span className="font-mono text-slate-300">{data.liquefaction.benchmark}</span>
                  <span style={{ color: data.liquefaction.color }} className="font-bold">
                    {data.liquefaction.tierFa}
                  </span>
                </div>

                {activeDrillDown === 'liquefaction' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-300">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">پهنه ژئوتکنیکی فعال:</span>
                      <span className="text-cyan-400 font-bold">{data.liquefaction.zoneName}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">شاخص مقاومت نفوذ استاندارد:</span>
                      <span className="text-emerald-400 font-bold">N-SPT ≈ {data.liquefaction.sptAvg}</span>
                    </div>
                    <p className="text-slate-400 leading-snug">
                      محاسبه بر اساس نسبت مقاومت تناوبی برشی خاک (CRR) به تقاضای تنش برشی زلزله (CSR). در صورت وقوع زلزله، افت فشار آب منفذی سبب روان‌گرایی ماسه‌های لای‌دار می‌گردد.
                    </p>
                  </div>
                )}
              </div>

              {/* Metric 2: Peak Ground Acceleration (PGA) */}
              <div
                onClick={() => setActiveDrillDown(activeDrillDown === 'pga' ? 'none' : 'pga')}
                className={`p-2.5 rounded-xl border cursor-pointer transition ${
                  activeDrillDown === 'pga'
                    ? 'bg-slate-900 border-amber-500/60 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-bold text-slate-200 text-[11px]">۲. شتاب بیشینه زمین (PGA)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-black text-xs" style={{ color: data.pga.color }}>
                      {data.pga.rawValue}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: data.pga.color }}
                    />
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${getGaugePercentage(data.pga.score)}%`,
                      backgroundColor: data.pga.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>پایه استاندارد: {data.pga.benchmark}</span>
                  <span className="font-mono text-amber-400">تقویت ساختگاه: {data.pga.amplifiedPGA}g</span>
                  <span style={{ color: data.pga.color }} className="font-bold">
                    {data.pga.tierFa}
                  </span>
                </div>

                {activeDrillDown === 'pga' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-300">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">تیپ خاک ساختگاه (استاندارد ۲۸۰۰):</span>
                      <span className="text-cyan-400 font-bold">{data.pga.soilType}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">شتاب سنگ بستر بدون اثر خاک:</span>
                      <span className="text-slate-200 font-bold">{data.pga.basePGA}g</span>
                    </div>
                    <p className="text-slate-400 leading-snug">
                      بر مبنای نقشه‌های هم‌پتانسیل PSHA سازمان زمین‌شناسی USGS با دوره بازگشت ۴۷۵ سال. خاک‌های سست موجب تشدید شتاب طیفی تا ۱.۲۵ برابر می‌شوند.
                    </p>
                  </div>
                )}
              </div>

              {/* Metric 3: Historical Seismic Proximity (M5+) */}
              <div
                onClick={() => setActiveDrillDown(activeDrillDown === 'proximity' ? 'none' : 'proximity')}
                className={`p-2.5 rounded-xl border cursor-pointer transition ${
                  activeDrillDown === 'proximity'
                    ? 'bg-slate-900 border-amber-500/60 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-slate-200 text-[11px]">۳. مجاورت با زلزله‌های M5+ (USGS)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-black text-xs" style={{ color: data.proximity.color }}>
                      {data.proximity.rawValue}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: data.proximity.color }}
                    />
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${getGaugePercentage(data.proximity.score)}%`,
                      backgroundColor: data.proximity.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{data.proximity.m5PlusCount} رویداد شدید</span>
                  <span className="font-mono text-slate-300">نزدیک‌ترین: Mw {data.proximity.nearestM5Event.magnitude}</span>
                  <span style={{ color: data.proximity.color }} className="font-bold">
                    {data.proximity.tierFa}
                  </span>
                </div>

                {activeDrillDown === 'proximity' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">نام رویداد کانون:</span>
                      <span className="text-rose-400 font-bold">{data.proximity.nearestM5Event.eventName}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">تاریخ و عمق کانونی:</span>
                      <span className="text-slate-200">
                        {data.proximity.nearestM5Event.eventDate} ({data.proximity.nearestM5Event.depthKm} km)
                      </span>
                    </div>
                    <p className="text-slate-400 leading-snug">
                      فاصله محاسبه‌شده با فرمول Haversine از مرکز هندسی پروژه تا رومرکز ثبت‌شده در پایگاه جهانی USGS Earthquake Catalog.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* High Risk BIM Elements Pulsing Animation Controller */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200 text-[11px]">پالس بصری المان‌های پرخطر (GPU Animation)</span>
                </div>
                <button
                  onClick={() => onTogglePulsing(!isPulsingEnabled)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                    isPulsingEnabled
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isPulsingEnabled ? 'فعال (۲.۵s پالس)' : 'غیرفعال'}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>المان‌های تحت هشدار در مدل:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {data.highRiskElementIds.length} جزء سازه‌ای بحرانی
                </span>
              </div>

              {/* Element chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {Array.from(new Set(data.highRiskElementIds)).map((id) => (
                  <button
                    key={id}
                    onClick={() => onSelectElement && onSelectElement(id)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition border ${
                      selectedElementId === id
                        ? 'bg-amber-500/30 text-amber-300 border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Requirements Checklist Accordion */}
            <div className="p-2.5 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-slate-300 block">
                الزامات طراحی آیین‌نامه‌ای ساختگاه (استاندارد ۲۸۰۰ و ANSA):
              </span>
              <ul className="space-y-1 text-[10px] text-slate-400">
                {data.codeRequirementsFa.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Audit Trail Drawer (When triggered) */}
            {activeDrillDown === 'audit' && (
              <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-2.5 text-[10px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>سند صحه‌سنجی داده‌ها (Audit Trail)</span>
                  </span>
                  <button
                    onClick={() => setActiveDrillDown('none')}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {data.auditItems.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-slate-200">{item.metric}</div>
                    <div className="text-slate-400">
                      پایگاه: <span className="text-slate-300 font-mono">{item.dataset}</span> ({item.agency})
                    </div>
                    <div className="text-slate-400">
                      متدولوژی: <span className="text-slate-300">{item.methodology}</span>
                    </div>
                    <div className="font-mono text-cyan-400 text-[9px] bg-slate-900 p-1 rounded">
                      {item.formula}
                    </div>
                  </div>
                ))}

                {/* Sensitivity threshold selector */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">حساسیت محاسبات:</span>
                  <div className="flex items-center gap-1">
                    {(['standard', 'conservative', 'critical'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSensitivityThreshold(t)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition ${
                          sensitivityThreshold === t
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t === 'standard' ? 'استاندارد' : t === 'conservative' ? 'محافظه‌کارانه' : 'بحرانی'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
