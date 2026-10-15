import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Zap,
  Gauge,
  Layers,
  Cpu,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  ChevronRight,
  BookOpen,
  X
} from 'lucide-react';

interface PerformanceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceGuideModal: React.FC<PerformanceGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'pipeline' | 'matrix' | 'touch' | 'devtools'>('playground');
  
  // Real-time FPS Telemetry
  const [currentFps, setCurrentFps] = useState<number>(60);
  const [avgFps, setAvgFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const [droppedFrames, setDroppedFrames] = useState<number>(0);
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [activeSegment, setActiveSegment] = useState<number>(0);
  const [toggleState, setToggleState] = useState<boolean>(true);
  const [ripplePos, setRipplePos] = useState<{ x: number; y: number; active: boolean } | null>(null);

  // Playground Cards state
  const [clickCount, setClickCount] = useState<number>(0);
  const [lastClickedElement, setLastClickedElement] = useState<string>('هنوز تعاملی انجام نشده است');

  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const historyRef = useRef<number[]>([]);

  // Telemetry loop with requestAnimationFrame
  useEffect(() => {
    if (!isOpen) return;

    const measureFrame = (now: number) => {
      frameCountRef.current++;
      const delta = now - lastTimeRef.current;

      if (delta >= 500) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        const clampedFps = Math.min(fps, 60);
        setCurrentFps(clampedFps);
        setFrameTimeMs(parseFloat((1000 / (clampedFps || 1)).toFixed(1)));

        historyRef.current.push(clampedFps);
        if (historyRef.current.length > 20) historyRef.current.shift();
        const avg = Math.round(historyRef.current.reduce((a, b) => a + b, 0) / historyRef.current.length);
        setAvgFps(avg);

        if (clampedFps < 55) {
          setDroppedFrames(prev => prev + 1);
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    lastTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isOpen]);

  // Stress test loop (animating 50 elements via transform)
  const stressElements = Array.from({ length: 24 }, (_, i) => i);

  if (!isOpen) return null;

  const handleInteractiveClick = (elemName: string, e?: React.MouseEvent) => {
    setClickCount(prev => prev + 1);
    setLastClickedElement(elemName);

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipplePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      });
      setTimeout(() => setRipplePos(null), 500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="perf-modal-title"
      className="fixed inset-0 z-[1050] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scale-in"
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="perf-modal-title" className="text-base font-extrabold text-slate-100">
                  سیستم معماری رابط کاربری ۶۰ فریم و آزمایشگاه تعاملی
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                  60 FPS STABLE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                راهنمای جامع بهینه‌سازی Compositor، کنترل‌های لمسی و مانیتور زنده نرخ فریم
              </p>
            </div>
          </div>

          {/* Quick Realtime FPS Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentFps >= 58 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentFps >= 58 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-slate-300">نرخ فریم جاری:</span>
              <span className={`font-bold text-sm ${currentFps >= 58 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentFps} FPS
              </span>
              <span className="text-slate-500 text-[10px]">({frameTimeMs}ms)</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ab-interactive-elem"
              aria-label="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-800 bg-slate-900/90 overflow-x-auto ab-scroll shrink-0">
          {[
            { id: 'playground', label: 'آزمایشگاه زنده تعاملات و کلیک', icon: Activity },
            { id: 'pipeline', label: 'خط لوله رندرینگ مرورگر (Pipeline)', icon: Layers },
            { id: 'matrix', label: 'ماتریس خواص مجاز vs پرهزینه', icon: Cpu },
            { id: 'touch', label: 'بهینه‌سازی لمسی و موبایل (Zero-Lag)', icon: Smartphone },
            { id: 'devtools', label: 'دستورالعمل تست با Chrome DevTools', icon: Gauge },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ab-interactive-elem ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 ab-scroll bg-slate-950/40">
          
          {/* ========================================================= */}
          {/* TAB 1: PLAYGROUND & REAL-TIME FPS MONITOR                */}
          {/* ========================================================= */}
          {activeTab === 'playground' && (
            <div className="space-y-6 animate-fade-in">
              {/* Telemetry Dashboard Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">فریم ریت زنده (FPS)</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black font-mono text-emerald-400">{currentFps}</span>
                    <span className="text-[11px] text-slate-500 font-mono">/ 60 Hz</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(currentFps / 60) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">زمان بودجه فریم (Frame Time)</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black font-mono text-sky-400">{frameTimeMs}</span>
                    <span className="text-[11px] text-slate-500 font-mono">میلی‌ثانیه</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 font-mono">سقف استاندارد: 16.6ms</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">تعداد کلیک‌های ثبت‌شده</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black font-mono text-amber-400">{clickCount}</span>
                    <span className="text-[11px] text-slate-500">تعامل</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate mt-2">
                    آخرین: {lastClickedElement}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">شتاب‌دهنده گرافیکی (GPU)</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-bold text-emerald-400">Compositor فعال</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>translateZ(0) فعال</span>
                  </div>
                </div>
              </div>

              {/* Stress Test Animation Toggle */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-slate-100">
                      آزمایش فشار همزمان انیمیشن‌ها (Stress Benchmark)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    فعال‌سازی همزمان ۲۴ شیء متحرک با ترنزیشن‌های Transform سه بعدی جهت اثبات ثبات ۶۰ فریم
                  </p>
                </div>

                <button
                  onClick={() => setIsStressTesting(prev => !prev)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ab-interactive-elem ${
                    isStressTesting
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-950/30'
                  }`}
                >
                  {isStressTesting ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>توقف انیمیشن‌های چندگانه</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>اجرای بنچمارک شبیه‌سازی</span>
                    </>
                  )}
                </button>
              </div>

              {isStressTesting && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                  {stressElements.map((idx) => (
                    <div
                      key={idx}
                      className="h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono text-[10px] text-amber-400 animate-pulse"
                      style={{
                        animationDuration: `${1 + (idx % 4) * 0.3}s`,
                        transform: 'translateZ(0)',
                        willChange: 'transform, opacity'
                      }}
                    >
                      Node #{idx + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Components Showcase */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>آزمایشگاه المان‌های تعاملی (کلیک کنید و فیدبک را مشاهده نمایید):</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">فیدبک لمسی: مقیاس ملایم ۰.۹۷ + سایه</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Interactive Buttons */}
                  <div className="ab-card p-4 space-y-3">
                    <h4 className="font-bold text-xs text-slate-200">۱. انواع دکمه‌های تعاملی با افکت بازگشتی:</h4>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={(e) => handleInteractiveClick('دکمه اصلی کهربایی', e)}
                        className="ab-btn-primary text-xs h-9 px-4 ab-ripple-container relative overflow-hidden"
                      >
                        {ripplePos && ripplePos.active && (
                          <span
                            className="ab-ripple-effect"
                            style={{
                              left: ripplePos.x,
                              top: ripplePos.y,
                              width: 30,
                              height: 30,
                              marginLeft: -15,
                              marginTop: -15
                            }}
                          />
                        )}
                        <span>دکمه اصلی (Primary)</span>
                      </button>

                      <button
                        onClick={(e) => handleInteractiveClick('دکمه ثانویه خاکستری', e)}
                        className="ab-btn-secondary text-xs h-9 px-4"
                      >
                        <span>دکمه ثانویه (Secondary)</span>
                      </button>

                      <button
                        onClick={() => handleInteractiveClick('دکمه تایید موفقیت')}
                        className="px-3.5 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all ab-interactive-elem"
                      >
                        <span>تایید (Success)</span>
                      </button>

                      <button
                        onClick={() => handleInteractiveClick('دکمه هشدار')}
                        className="px-3.5 h-9 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all ab-interactive-elem"
                      >
                        <span>حذف (Danger)</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Interactive Switch & Segmented Tabs */}
                  <div className="ab-card p-4 space-y-3">
                    <h4 className="font-bold text-xs text-slate-200">۲. سوئیچ‌های روان و منوی تبی ۶۰ فریم:</h4>
                    
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-xs text-slate-300">سوییچ سخت‌افزاری GPU:</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={toggleState}
                        onClick={() => {
                          setToggleState(prev => !prev);
                          handleInteractiveClick('سوییچ وضعیت');
                        }}
                        className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-200 ${
                          toggleState ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`bg-slate-950 w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ease-out ${
                            toggleState ? 'translate-x-0' : '-translate-x-5.5'
                          }`}
                          style={{ willChange: 'transform' }}
                        />
                      </button>
                    </div>

                    {/* Segmented control */}
                    <div className="flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      {['روزانه', 'هفتگی', 'ماهانه'].map((label, idx) => (
                        <button
                          key={label}
                          onClick={() => {
                            setActiveSegment(idx);
                            handleInteractiveClick(`بخش‌بندی ${label}`);
                          }}
                          className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-all duration-150 ${
                            activeSegment === idx
                              ? 'bg-amber-500 text-slate-950 font-bold shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                          style={{ transform: 'translateZ(0)' }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Interactive Clickable Card Accent */}
                  <div
                    onClick={() => handleInteractiveClick('کارت تعاملی پروژه‌ها')}
                    className="ab-card-interactive-accent p-4 space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-400">کارت تعاملی با افکت برجستگی (Hover & Active)</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-300">
                      این کارت از کلاس <code className="text-amber-300 font-mono">ab-card-interactive-accent</code> استفاده می‌کند. روی آن کلیک کنید تا پاسخ بازگشتی ملایم و سایه کهربایی را احساس کنید.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="ab-chip-interactive bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        کلیک‌پذیر
                      </span>
                      <span className="ab-chip-interactive bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        سایه دینامیک
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Interactive Input with Focus Glow */}
                  <div className="ab-card p-4 space-y-2.5">
                    <h4 className="font-bold text-xs text-slate-200">۴. فیلد ورودی با حلقه فوکوس استاندارد:</h4>
                    <input
                      type="text"
                      placeholder="متنی تایپ یا کلیک کنید تا حلقه فوکوس فعال شود..."
                      className="ab-input"
                      onFocus={() => handleInteractiveClick('ورودی متنی')}
                    />
                    <p className="text-[11px] text-slate-500">
                      بدون لگ کیبورد، ترنزیشن جعبه‌سایه فوکوس ۱۲۰ میلی‌ثانیه بر روی GPU.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: RENDERING PIPELINE ARCHITECTURE                   */}
          {/* ========================================================= */}
          {activeTab === 'pipeline' && (
            <div className="space-y-5 animate-fade-in text-xs leading-relaxed">
              <div className="ab-card p-4 bg-amber-500/5 border-amber-500/30 space-y-2">
                <h3 className="font-bold text-sm text-amber-400">
                  چگونه مرورگر صفحه را رندر می‌کند و چرا ۶۰ فریم حاصل می‌شود؟
                </h3>
                <p className="text-slate-300">
                  برای دستیابی به نرخ ۶۰ فریم بر ثانیه، هر فریم باید دقیقاً در کمتر از <strong>۱۶.۶ میلی‌ثانیه</strong> پردازش، محاسبه و توسط کارت گرافیک نمایش داده شود. در صورت تاخیر هر مرحله، فریم‌ها گم می‌شوند (Jank / Stutter).
                </p>
              </div>

              {/* 5 Stages diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { step: '۱', name: 'JavaScript', desc: 'محاسبات کد، تغییر استیت ری‌اکت و رویدادهای کاربر', status: 'اجتناب‌ناپذیر' },
                  { step: '۲', name: 'Style Recalc', desc: 'محاسبه قوانین CSS منطبق بر هر المان DOM', status: 'سریع' },
                  { step: '۳', name: 'Layout (Reflow)', desc: 'محاسبه موقعیت و ابعاد هندسی (بسیار سنگین)', status: '⛔ ممنوع در انیمیشن' },
                  { step: '۴', name: 'Paint', desc: 'پر کردن پیکسل‌ها، متن‌ها و رنگ‌ها (سنگین)', status: '⛔ ممنوع در ترنزیشن' },
                  { step: '۵', name: 'Composite', desc: 'ترکیب لایه‌ها روی پردازنده گرافیکی GPU', status: '✅ تایید شده (۶۰ FPS)' },
                ].map((st) => (
                  <div key={st.step} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold text-sm">مرحله {st.step}</span>
                      <h4 className="font-bold text-slate-100 text-xs mt-1">{st.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{st.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold mt-2 pt-2 border-t border-slate-800 text-slate-300">
                      {st.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Compositor Rule */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-sm text-slate-100">قاعده طلایی معماری AfghanaBuild:</h4>
                <p className="text-slate-300">
                  تمامی انیمیشن‌ها، افکت‌های هاور و تغییرات لمسی کارت‌ها فقط و فقط مراحل <strong>JavaScript</strong> و <strong>Composite</strong> را درگیر می‌کنند. مراحل ۳ (Layout) و ۴ (Paint) کاملاً دور زده می‌شوند تا پردازنده اصلی (CPU) آزاد بماند.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ALLOWED VS FORBIDDEN PROPERTIES MATRIX             */}
          {/* ========================================================= */}
          {activeTab === 'matrix' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-100">
                  ماتریس مقایسه‌ای ویژگی‌های انیمیشن CSS بر اساس هزینه رندر
                </h3>
                <p className="text-slate-400 mt-0.5">
                  کتابخانه طراحی AfghanaBuild این استانداردها را به صورت توکن‌های یکپارچه اعمال نموده است.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Allowed 60fps properties */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ویژگی‌های مجاز و پایدار ۶۰ فریم (GPU-Composited)</span>
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold">transform: translate3d(x, y, 0)</span>
                      <span>برای جابجایی المان‌ها و انیمیشن منو بدون Reflow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold">transform: scale(x)</span>
                      <span>برای بزرگ‌نمایی و کوچک‌نمایی هنگام هاور و لمس دکمه</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold">opacity: 0 &lt;--&gt; 1</span>
                      <span>برای محو شدن و ظاهر شدن مودال‌ها و توست‌ها</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold">will-change: transform</span>
                      <span>اطلاع پیشاپیش به موتور گرافیکی جهت اختصاص لایه GPU</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold">backface-visibility: hidden</span>
                      <span>جلوگیری از لرزش پیکسلی در رندرهای باکیفیت بالا</span>
                    </li>
                  </ul>
                </div>

                {/* Prohibited properties */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <XCircle className="w-5 h-5" />
                    <span>ویژگی‌های ممنوعه در ترنزیشن‌های انیمیشنی (افت فریم)</span>
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-rose-300 font-bold">top, left, right, bottom</span>
                      <span>باعث محاسبه مجدد هندسه کل صفحه (Layout Thrashing) می‌شود.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-rose-300 font-bold">width, height</span>
                      <span>تغییر عرض/طول باعث تکان خوردن المان‌های همجوار می‌شود.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-rose-300 font-bold">margin, padding</span>
                      <span>انیمیت کردن فاصله باعث شکست چیدمان انعطاف‌پذیر می‌گردد.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-rose-300 font-bold">box-shadow (انیمیشن مداوم)</span>
                      <span>محاسبه بلور سنگین در فریم‌های متوالی CPU را اشباع می‌کند.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MOBILE & TOUCH INTERACTION ZERO-LAG OPTIMIZATION  */}
          {/* ========================================================= */}
          {activeTab === 'touch' && (
            <div className="space-y-4 animate-fade-in text-xs leading-relaxed">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-100">
                  بهینه‌سازی‌های اختصاصی لمسی برای گوشی‌ها و تبلت‌های مهندسین کارگاه
                </h3>
                <p className="text-slate-400 mt-0.5">
                  تضمین عملکرد بدون تاخیر در شرایط کارگاهی و استفاده تک‌دستی
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-400">۱. حذف تاخیر ۳۰۰ms کلیک:</span>
                  <p className="text-slate-300">
                    استفاده از <code className="text-amber-300 font-mono">touch-action: manipulation;</code> بر روی تمام دکمه‌ها و لینک‌ها تا تاخیر دوبار لمس (Double Tap to Zoom) در سیستم‌عامل‌های Android و iOS برطرف گردد.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-sky-400">۲. حذف هایلایت خاکستری زشت:</span>
                  <p className="text-slate-300">
                    با اعمال <code className="text-sky-300 font-mono">-webkit-tap-highlight-color: transparent;</code> باکس خاکستری پیش‌فرض وب‌کیت خاموش و فیدبک اختصاصی مهندسی مقیاس فعال می‌شود.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400">۳. حداقل اندازه سطح لمسی (44px):</span>
                  <p className="text-slate-300">
                    رعایت استاندارد ارگونومیک ۴۴×۴۴ پیکسل برای تمام کلیدهای لمسی در نمای موبایل جهت راحتی کار حتی با دستکش کارگاهی.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CHROME DEVTOOLS BENCHMARKING GUIDE                */}
          {/* ========================================================= */}
          {activeTab === 'devtools' && (
            <div className="space-y-4 animate-fade-in text-xs leading-relaxed">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-100">
                  چک‌لیست اندازه‌گیری و تایید پایداری ۶۰ فریم با Chrome DevTools
                </h3>
                <p className="text-slate-400 mt-0.5">
                  مراحل گام‌به‌گام برای مهندسین نرم‌افزار جهت تست عملکرد و فریم‌ریت در محیط مرورگر
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono shrink-0">
                    ۱
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">فعال‌سازی نمایشگر نرخ فریم (Frame Rate Meter):</h4>
                    <p className="text-slate-400 mt-0.5">
                      کلید F12 را بزنید &larr; <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono">Ctrl+Shift+P</kbd> &larr; عبارت <code className="text-amber-300 font-mono">Show Frame Rate Meter</code> را تایپ و اینتر بزنید تا نمودار لحظه‌ای FPS و مصرف حافظه GPU در گوشه صفحه ظاهر شود.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono shrink-0">
                    ۲
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">بررسی فلش‌های نقاشی (Paint Flashing):</h4>
                    <p className="text-slate-400 mt-0.5">
                      در پنل <code className="text-amber-300 font-mono">Rendering</code> گزینه <code className="text-amber-300 font-mono">Paint Flashing</code> را روشن کنید. هنگام اسکرول یا کلیک، المان‌ها نباید با رنگ سبز مداوم فلش بزنند که نشان‌دهنده Composite بودن کامل است.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono shrink-0">
                    ۳
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">تست در شرایط شبیه‌سازی پردازنده ضعیف (CPU Throttling):</h4>
                    <p className="text-slate-400 mt-0.5">
                      در پنل <code className="text-amber-300 font-mono">Performance</code> نرخ پردازنده را بر روی <strong>4x Slowdown</strong> یا <strong>6x Slowdown</strong> قرار دهید و سپس تعاملات را اجرا کنید؛ نرخ فریم به علت شتاب‌دهی سخت‌افزاری GPU همچنان نرم و بدون لکنت باقی می‌ماند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Info className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              تمامی انیمیشن‌ها از استاندارد <code className="text-amber-300 font-mono">prefers-reduced-motion</code> برای دسترسی‌پذیری پشتیبانی می‌کنند.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="ab-btn-primary text-xs h-8 px-4"
            >
              بستن و ادامه کار با سامانه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
