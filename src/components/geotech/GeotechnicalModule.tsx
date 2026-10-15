import React, { useState } from 'react';
import {
  Mountain,
  Activity,
  Layers,
  ShieldAlert,
  Compass,
  FileCheck,
  Droplet,
  ChevronRight,
  Info
} from 'lucide-react';
import { SoilTest } from '../../types';
import { INITIAL_SOIL_TESTS } from '../../data/afghanistanData';

export const GeotechnicalModule: React.FC = () => {
  const [tests] = useState<SoilTest[]>(INITIAL_SOIL_TESTS);
  const [selectedBorehole, setSelectedBorehole] = useState<SoilTest>(INITIAL_SOIL_TESTS[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                ارزیابی زمین، مکانیک خاک و تحلیل ژئوتکنیک (Geotechnical Engineering)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ثبت و تحلیل گمانه‌های حفاری SPT/CPT، محاسبه ظرفیت باربری خاک و توصیه نوع پی در زون‌های لرزه‌ای افغانستان
              </p>
            </div>
          </div>
        </div>

        {/* Afghan Seismic Zone Alert */}
        <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-800/60 px-3.5 py-2 rounded-xl text-xs text-rose-300">
          <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>پروژه در محدوده گسل فعال چمن-کابل (زون ۱ با شتاب مبنای PGA = 0.35g)</span>
        </div>
      </div>

      {/* Main Grid: Borehole Selectors + Detailed Soil Stratigraphy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Boreholes List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>گمانه‌های آزمایشگاهی ثبت‌شده (Borehole Logs):</span>
          </h3>

          <div className="space-y-2.5">
            {tests.map((test) => {
              const isSelected = selectedBorehole.id === test.id;
              return (
                <div
                  key={test.id}
                  onClick={() => setSelectedBorehole(test)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-100">{test.boreholeId}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      عمق {test.depthMeters} متر
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{test.soilClassification}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>SPT-N: <strong className="text-emerald-400">{test.sptNValue}</strong></span>
                    <span>ظرفیت باربری: <strong className="text-amber-400">{test.bearingCapacityKpa} kPa</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Foundation Algorithm Recommendation Box */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>پیشنهاد الگوریتمی نوع پی (Foundation AI):</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 leading-relaxed">
              <strong>{selectedBorehole.recommendedFoundation}</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              با توجه به عدد SPT = {selectedBorehole.sptNValue} و ظرفیت باربری {selectedBorehole.bearingCapacityKpa} کیلوپاسکال، پی گسترده با ضخامت ۱۲۰ سانتی‌متر بیشترین پایداری را در برابر واژگونی ناشی از زلزله فراهم می‌آورد.
            </p>
          </div>
        </div>

        {/* Visual Borehole Stratigraphy Column & Geotech Graph */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">
                  ستون چینه نگاری خاک و نتایج آزمایش گمانه: {selectedBorehole.boreholeId}
                </h3>
                <span className="text-[11px] text-slate-400">تاریخ انجام آزمایش میدانی: {selectedBorehole.testDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-800/50">
                <Droplet className="w-3.5 h-3.5" />
                <span>تراز آب زیرزمینی: {selectedBorehole.groundwaterDepthMeters} متر</span>
              </div>
            </div>

            {/* Visual Depth Layers Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">لایه‌بندی عمقی خاک (Soil Profile 0 - {selectedBorehole.depthMeters}m):</span>
              <div className="w-full h-14 rounded-xl overflow-hidden flex border border-slate-700 shadow-inner">
                <div style={{ width: '20%' }} className="bg-amber-900/80 p-2 text-[10px] text-amber-200 flex flex-col justify-center border-l border-amber-950">
                  <span className="font-bold">0 - 5m: رس و ماسه</span>
                  <span>تراکم متوسط (N=18)</span>
                </div>
                <div style={{ width: '35%' }} className="bg-amber-800/80 p-2 text-[10px] text-amber-100 flex flex-col justify-center border-l border-amber-950">
                  <span className="font-bold">5 - 14m: شن رس‌دار</span>
                  <span>متراکم با قلوه‌سنگ (N=32)</span>
                </div>
                <div style={{ width: '45%' }} className="bg-slate-700 p-2 text-[10px] text-slate-100 flex flex-col justify-center">
                  <span className="font-bold">14 - {selectedBorehole.depthMeters}m: بستر سنگی متلاشی</span>
                  <span>بسیار سخت (N=45+)</span>
                </div>
              </div>
            </div>

            {/* Detailed Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">شاخص ضربه SPT:</div>
                <div className="text-base font-black text-amber-400 font-mono mt-1">N = {selectedBorehole.sptNValue}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">تراکم عالی</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">ظرفیت باربری مجاز (qa):</div>
                <div className="text-base font-black text-sky-400 font-mono mt-1">{selectedBorehole.bearingCapacityKpa} kPa</div>
                <div className="text-[10px] text-slate-400 mt-0.5">۲.۸ کیلوگرم/سانتی‌متر²</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">سطح ایستابی آب:</div>
                <div className="text-base font-black text-cyan-400 font-mono mt-1">{selectedBorehole.groundwaterDepthMeters} m</div>
                <div className="text-[10px] text-slate-400 mt-0.5">بدون فشار آرتزین</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">رده لرزه‌ای پهنه:</div>
                <div className="text-xs font-black text-rose-400 font-mono mt-1">Zone 1 (خطر بحرانی)</div>
                <div className="text-[10px] text-rose-300 mt-0.5">ANSA Standard</div>
              </div>
            </div>

            {/* Engineering Field Notes */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Info className="w-4 h-4" />
                <span>گزارش تفسیری مهندس ژئوتکنیک:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedBorehole.engineerNotes}
              </p>
            </div>
          </div>

          {/* Afghanistan Fault Lines and Seismic Risk Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>پهنه‌بندی گسل‌های فعال و مناطق لرزه‌خیز افغانستان</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-rose-400 block mb-0.5">گسل چمن - کابل:</span>
                <span className="text-[11px] text-slate-400">طول بیش از ۹۰۰ کیلومتر با توان لرزه‌زایی بیش از M 7.5. اعمال ضریب اهمیت سازه I = 1.25 الزامی است.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-0.5">گسل هرات (هریرود):</span>
                <span className="text-[11px] text-slate-400">پهنه‌بندی زون ۲ لرزه‌ای با دوره بازگشت ۴۷۵ ساله. کنترل درز انقطاع سازه الزامی است.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-sky-400 block mb-0.5">زون هندوکش - بدخشان:</span>
                <span className="text-[11px] text-slate-400">زمین‌لرزه‌های عمیق کانون متوسط (۱۰۰ تا ۲۰۰ کیلومتر) با شدت تکانش مداوم.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
