import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Download,
  Calculator,
  MapPin,
  TrendingUp,
  DollarSign,
  PieChart,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  GitCompare,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { BOQItem } from '../../types';
import { INITIAL_BOQ_ITEMS, AFGHAN_REGIONS } from '../../data/afghanistanData';
import { BOQService } from '../../services/boqService';
import { useSyncContext } from '../../context/SyncContext';
import { indexedDBService } from '../../services/indexedDBService';

interface BOQEstimatorProps {
  currentProjectId?: string;
  selectedCity: string;
  onCityChange?: (city: any) => void;
}

export const BOQEstimator: React.FC<BOQEstimatorProps> = ({ currentProjectId, selectedCity, onCityChange }) => {
  const { isOnline, enqueueChange } = useSyncContext();
  const [items, setItems] = useState<BOQItem[]>(() => {
    return BOQService.applyRegionalPricing(INITIAL_BOQ_ITEMS, selectedCity as any);
  });

  // Load BOQ items from IndexedDB
  React.useEffect(() => {
    let isMounted = true;
    indexedDBService.getOfflineBOQItems(currentProjectId).then((offlineItems) => {
      if (!isMounted) return;
      if (offlineItems && offlineItems.length > 0) {
        setItems(BOQService.applyRegionalPricing(offlineItems, selectedCity as any));
      }
    }).catch((err) => {
      console.warn('[BOQ] Error loading items from IndexedDB:', err);
    });
    return () => { isMounted = false; };
  }, [currentProjectId, selectedCity]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDiffView, setShowDiffView] = useState<boolean>(false);
  const [versionCode, setVersionCode] = useState<string>('Rev 2.1');
  const [contentHash, setContentHash] = useState<string>('hash-8f4b2e-2026');

  // Traditional Unit Converter State
  const [calcVal, setCalcVal] = useState<number>(10);
  const [convertFrom, setConvertFrom] = useState<string>('تن');
  const [convertTo, setConvertTo] = useState<string>('سیر');

  const totals = BOQService.calculateTotals(items);

  const handleCitySwitch = (newCity: string) => {
    if (onCityChange) onCityChange(newCity);
    const recalculated = BOQService.applyRegionalPricing(items, newCity as any);
    setItems(recalculated);
  };

  const handleAddItem = async (newItem: Omit<BOQItem, 'id' | 'updatedAt' | 'totalAmount'>) => {
    const item: BOQItem = {
      ...newItem,
      id: 'boq-' + Date.now(),
      totalAmount: Math.round(newItem.quantity * newItem.unitRate),
      updatedAt: new Date().toLocaleDateString('fa-AF')
    };
    try {
      await indexedDBService.saveOfflineBOQItem(item);
      await enqueueChange('boq_item', 'create', item.id, item);
    } catch (err) {
      console.warn('[BOQ] Error persisting item to IndexedDB:', err);
    }
    setItems([item, ...items]);
    setShowAddModal(false);
  };

  const filteredItems = selectedCategory === 'ALL'
    ? items
    : items.filter(i => i.category === selectedCategory);

  const handleExportCSV = () => {
    const header = 'کد قلم,شرح عملیات ساختمانی,دسته,واحد,مقدار,نرخ واحد (افغانی),مجموع (افغانی),منطقه\n';
    const rows = items.map(i =>
      `"${i.itemCode}","${i.description}","${i.category}","${i.unit}",${i.quantity},${i.unitRate},${i.totalAmount},"${i.region}"`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BOQ_${versionCode}_${selectedCity}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-100">
                  برآورد هزینه و کنترل نسخه فهرست بها (BOQ Version Control)
                </h2>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 text-xs font-mono font-bold">
                  {versionCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                محاسبه خودکار مقادیر مصالح با نرخ‌های منطقه‌ای افغانستان و ممیزی هش محتوا ({contentHash})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Version Diff Trigger (Page 11 Fig 11-3) */}
          <button
            onClick={() => setShowDiffView(!showDiffView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              showDiffView
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <GitCompare className="w-4 h-4 text-purple-400" />
            <span>{showDiffView ? 'بستن مقایسه' : 'مقایسه ستونی نسخه‌ها (Diff)'}</span>
          </button>

          {/* City Price Index Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">شاخص نرخ:</span>
            <select
              value={selectedCity}
              onChange={(e) => handleCitySwitch(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="کابل" className="bg-slate-900">کابل (مبنا ۱۰۰٪)</option>
              <option value="هرات" className="bg-slate-900">هرات (۹۴٪ - همجوار ایران)</option>
              <option value="مزار شریف" className="bg-slate-900">مزار شریف (۹۷٪ - حیرتان)</option>
              <option value="قندهار" className="bg-slate-900">قندهار (۱۰۳٪ - اسپین‌بولدک)</option>
              <option value="جلال‌آباد" className="bg-slate-900">جلال‌آباد (۹۵٪ - تورخم)</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن ردیف</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>خروجی CSV</span>
          </button>
        </div>
      </div>

      {/* Version Diff View Box (Page 11 Fig 11-3: Side-by-Side Version Diff with Conflict Warning) */}
      {showDiffView && (
        <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-5 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-sm text-slate-100">
                مقایسه ستونی تغییرات: نسخه جاری (Rev 2.1) در برابر نسخه قبلی (Rev 2.0)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>تعارض نسخه (Conflict Detected)</span>
              </span>
              <button onClick={() => setShowDiffView(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">کد قلم</th>
                  <th className="p-3">شرح عملیات</th>
                  <th className="p-3 text-center">مقدار Rev 2.0</th>
                  <th className="p-3 text-center text-amber-400">مقدار Rev 2.1 (جدید)</th>
                  <th className="p-3 text-center">نرخ Rev 2.0</th>
                  <th className="p-3 text-center text-emerald-400">نرخ Rev 2.1 (جدید)</th>
                  <th className="p-3 text-left">عملیات ادغام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="bg-amber-950/20">
                  <td className="p-3 font-mono font-bold text-amber-400">BOQ-STR-01</td>
                  <td className="p-3 text-slate-200">بتن‌ریزی سازه‌ای رده C30 پی</td>
                  <td className="p-3 text-center font-mono text-slate-400">۱,۴۰۰ m³</td>
                  <td className="p-3 text-center font-mono font-bold text-amber-400">۱,۴۵۰ m³ (+۵۰)</td>
                  <td className="p-3 text-center font-mono text-slate-400">۴,۷۰۰ ؋</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-400">۴,۹۰۰ ؋</td>
                  <td className="p-3 text-left">
                    <button
                      onClick={() => alert('تغییرات Rev 2.1 تأیید و ادغام (Merge) شد.')}
                      className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                    >
                      ادغام و ثبت نهایی (Merge)
                    </button>
                  </td>
                </tr>
                <tr className="bg-purple-950/20">
                  <td className="p-3 font-mono font-bold text-amber-400">BOQ-STR-02</td>
                  <td className="p-3 text-slate-200">میلگرد آجدار فولادی AIII</td>
                  <td className="p-3 text-center font-mono text-slate-400">۱۹۵ تن</td>
                  <td className="p-3 text-center font-mono font-bold text-amber-400">۲۱۰ تن (+۱۵)</td>
                  <td className="p-3 text-center font-mono text-slate-400">۵۷,۰۰۰ ؋</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-400">۵۹,۰۰۰ ؋</td>
                  <td className="p-3 text-left">
                    <button
                      onClick={() => alert('تغییرات تأیید و ادغام شد.')}
                      className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                    >
                      ادغام (Merge)
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">مجموع برآورد ({selectedCity}):</div>
          <div className="text-lg font-black text-amber-400 font-mono">
            {totals.totalCost.toLocaleString('fa-AF')} <span className="text-xs font-normal text-slate-300">افغانی ؋</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Rev 2.1 • Hash: 8f4b2e</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">کل حجم بتن سازه‌ای:</div>
          <div className="text-lg font-black text-sky-400 font-mono">
            {totals.concreteVolumeM3.toLocaleString('fa-AF')} <span className="text-xs font-normal text-slate-300">متر مکعب</span>
          </div>
          <div className="text-[11px] text-slate-500">رده C30 پی و دیوارهای حائل</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">کل میلگرد آجدار AIII:</div>
          <div className="text-lg font-black text-emerald-400 font-mono">
            {totals.rebarTons.toLocaleString('fa-AF')} <span className="text-xs font-normal text-slate-300">تن</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            معادل {(totals.rebarTons * 142.85).toFixed(0)} سیر کابل
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">نسبت مصرف فولاد به بتن:</div>
          <div className="text-lg font-black text-pink-400 font-mono">
            {totals.steelRatioKgPerM3} <span className="text-xs font-normal text-slate-300">کیلوگرم بر متر مکعب</span>
          </div>
          <div className="text-[11px] text-slate-500">شاخص ایمنی بالا زون ۱ زلزله</div>
        </div>
      </div>

      {/* Afghan Traditional Unit Converter */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">تبدیل واحدهای سنتی ساختمانی افغانستان (سیر، گز، خروار)</h4>
            <p className="text-[11px] text-slate-400">محاسبه سریع واحدهای بازار محلی به سیستم بین‌المللی متریک</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <input
            type="number"
            value={calcVal}
            onChange={(e) => setCalcVal(parseFloat(e.target.value) || 0)}
            className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center font-bold text-amber-300 focus:outline-none"
          />

          <select
            value={convertFrom}
            onChange={(e) => setConvertFrom(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="تن">تن</option>
            <option value="کیلوگرم">کیلوگرم</option>
            <option value="سیر">سیر (کابل)</option>
            <option value="گز">گز (طول)</option>
            <option value="متر">متر</option>
          </select>

          <span className="text-slate-400 font-bold">معادل:</span>

          <select
            value={convertTo}
            onChange={(e) => setConvertTo(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="سیر">سیر (۷ کیلوگرم)</option>
            <option value="کیلوگرم">کیلوگرم</option>
            <option value="تن">تن</option>
            <option value="متر">متر</option>
            <option value="گز">گز (۰.۹۱۴ متر)</option>
          </select>

          <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black font-mono">
            {BOQService.convertUnits(calcVal, convertFrom, convertTo).toFixed(2)} {convertTo}
          </div>
        </div>
      </div>

      {/* BOQ Items Table (Page 14: Virtualized table with code, desc, unit, qty, rate, total) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">کد قلم</th>
                <th className="p-3.5 font-bold">شرح عملیات / مصالح</th>
                <th className="p-3.5 font-bold">دسته</th>
                <th className="p-3.5 font-bold text-center">واحد</th>
                <th className="p-3.5 font-bold text-center">مقدار</th>
                <th className="p-3.5 font-bold text-center">نرخ واحد ({selectedCity})</th>
                <th className="p-3.5 font-bold text-left">مجموع کل (AFN ؋)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-amber-400 font-bold">{item.itemCode}</td>
                  <td className="p-3.5 text-slate-100 font-medium max-w-md">{item.description}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-center text-slate-300">{item.unit}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-100">
                    {item.quantity.toLocaleString('fa-AF')}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-300">
                    {item.unitRate.toLocaleString('fa-AF')} ؋
                  </td>
                  <td className="p-3.5 text-left font-mono font-bold text-amber-300">
                    {item.totalAmount.toLocaleString('fa-AF')} ؋
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 border-t-2 border-slate-800 text-slate-100 font-bold">
              <tr>
                <td colSpan={6} className="p-4 text-right">جمع کل ردیف‌ها:</td>
                <td className="p-4 text-left font-mono text-amber-400 text-sm">
                  {filteredItems.reduce((s, i) => s + i.totalAmount, 0).toLocaleString('fa-AF')} ؋
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Line Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as any;
              handleAddItem({
                projectId: 'proj-01',
                itemCode: form.itemCode.value,
                description: form.description.value,
                category: form.category.value,
                unit: form.unit.value,
                quantity: parseFloat(form.quantity.value) || 0,
                unitRate: parseFloat(form.unitRate.value) || 0,
                region: selectedCity as any
              });
            }}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-100">افزودن قلم جدید به فهرست بها (BOQ)</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">کد قلم:</label>
                <input name="itemCode" defaultValue={`BOQ-NEW-${items.length + 1}`} required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-amber-300 font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">دسته‌بندی:</label>
                <select name="category" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                  <option value="بتن و قالب‌بندی">بتن و قالب‌بندی</option>
                  <option value="فولاد و آرماتور">فولاد و آرماتور</option>
                  <option value="سفت‌کاری و بنایی">سفت‌کاری و بنایی</option>
                  <option value="تأسیسات برقی">تأسیسات برقی</option>
                  <option value="تأسیسات مکانیکی">تأسیسات مکانیکی</option>
                  <option value="نیروی انسانی و دستمزد">نیروی انسانی و دستمزد</option>
                  <option value="ماشین‌آلات">ماشین‌آلات</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">شرح عملیات:</label>
              <textarea name="description" rows={2} required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">واحد:</label>
                <input name="unit" defaultValue="متر مربع" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">مقدار:</label>
                <input name="quantity" type="number" defaultValue="100" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">نرخ واحد (؋):</label>
                <input name="unitRate" type="number" defaultValue="1200" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-amber-300 font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300">انصراف</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">ثبت در BOQ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
