import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Search,
  Filter,
  Truck,
  Building,
  RotateCcw,
  Receipt,
  Camera,
  FileCheck
} from 'lucide-react';
import { InventoryItem, InventoryReceiptRecord } from '../../types';
import { INITIAL_INVENTORY } from '../../data/afghanistanData';

export const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQCItem, setActiveQCItem] = useState<InventoryItem | null>(null);

  // Goods Receipt Modal State (Page 12: Section 12-1)
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [receiptItemCode, setReceiptItemCode] = useState<string>('MAT-ST-25');
  const [orderedQty, setOrderedQty] = useState<number>(50);
  const [receivedQty, setReceivedQty] = useState<number>(46); // 8% discrepancy (> 5%)
  const [receiptToast, setReceiptToast] = useState<string | null>(null);

  const [receiptsList, setReceiptsList] = useState<InventoryReceiptRecord[]>([
    {
      id: 'REC-1405-01',
      itemCode: 'MAT-ST-25',
      itemName: 'میلگرد آجدار Φ25 شاخه ۱۲ متری AIII',
      orderedQty: 50,
      receivedQty: 46,
      discrepancyPercent: 8,
      hasAlert: true,
      receiptConfirmed: false,
      timestamp: '۱۴۰۴/۰۷/۲۴ ۰۹:۳۰'
    },
    {
      id: 'REC-1405-02',
      itemCode: 'MAT-CEM-01',
      itemName: 'سیمان پرتلند تیپ ۲ غوری',
      orderedQty: 500,
      receivedQty: 500,
      discrepancyPercent: 0,
      hasAlert: false,
      receiptConfirmed: true,
      timestamp: '۱۴۰۴/۰۷/۲۳ ۱۴:۱۵'
    }
  ]);

  const filteredItems = items.filter(item => {
    const matchesWh = selectedWarehouse === 'ALL' || item.warehouseLocation === selectedWarehouse;
    const matchesOrig = selectedOrigin === 'ALL' || item.origin === selectedOrigin;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWh && matchesOrig && matchesSearch;
  });

  const lowStockCount = items.filter(i => i.quantity <= i.minThreshold).length;

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const diff = Math.abs(orderedQty - receivedQty);
    const diffPercent = orderedQty > 0 ? Math.round((diff / orderedQty) * 100) : 0;
    const hasAlert = diffPercent > 5;

    const matchedItem = items.find(i => i.itemCode === receiptItemCode);
    const newRecord: InventoryReceiptRecord = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      itemCode: receiptItemCode,
      itemName: matchedItem?.name || receiptItemCode,
      orderedQty,
      receivedQty,
      discrepancyPercent: diffPercent,
      hasAlert,
      receiptConfirmed: !hasAlert,
      timestamp: 'هم‌اکنون'
    };

    setReceiptsList([newRecord, ...receiptsList]);
    setShowReceiptModal(false);

    if (hasAlert) {
      setReceiptToast(`هشدار مغایرت بارنامه (${diffPercent}٪): اعلان خودکار برای مدیر خرید ارسال گردید.`);
    } else {
      setReceiptToast(`رسید انبار تأیید و رویداد receipt.confirmed برای حسابداری ثبت شد.`);
    }
    setTimeout(() => setReceiptToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                مدیریت انبار، زنجیره تأمین و ثبت رسید کالا (Inventory & Goods Receipt)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ردیابی مصالح داخلی و وارداتی، کنترل کیفیت، و ثبت هوشمند رسید کالا با کنترل مغایرت بارنامه بیش از ۵٪
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-md shadow-amber-500/20"
          >
            <Receipt className="w-4 h-4" />
            <span>ثبت رسید انبار (ورود کالا)</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {receiptToast && (
        <div className="bg-amber-950/90 border border-amber-800 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2 shadow-xl animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{receiptToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">تعداد اقلام ساختمانی فعال:</div>
          <div className="text-xl font-black text-amber-400 font-mono">{items.length} کالای موجود</div>
          <div className="text-[11px] text-slate-500">سیمان، میلگرد، آجر، کابل، لوله</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">شاخص هدررفت و ضایعات (Waste Index):</div>
          <div className="text-xl font-black text-emerald-400 font-mono">2.8% (هدف: &lt; 3.5%)</div>
          <div className="text-[11px] text-emerald-400">کاهش ۲۵٪ ضایعات نسبت به میانگین صنعت</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">رسیدهای دارای مغایرت بارنامه (&gt; ۵٪):</div>
          <div className="text-xl font-black text-rose-400 font-mono">
            {receiptsList.filter(r => r.hasAlert).length} مورد نیاز به بررسی
          </div>
          <div className="text-[11px] text-slate-400">قاعده خودکار ممیزی بخش ۱۲-۱ سند</div>
        </div>
      </div>

      {/* Recent Goods Receipts Table (Page 12 Section 12-1) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>رسیدهای ثبت‌شده اخیر در انبار کارگاه (Goods Receipt Audit)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">آخرین وقایع</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">شماره رسید</th>
                <th className="p-3">نام مصالح</th>
                <th className="p-3 text-center">مقدار سفارش</th>
                <th className="p-3 text-center">مقدار دریافتی</th>
                <th className="p-3 text-center">مغایرت</th>
                <th className="p-3 text-center">وضعیت اعلان</th>
                <th className="p-3 text-left">رویداد حسابداری</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {receiptsList.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-amber-400">{rec.id}</td>
                  <td className="p-3 font-medium text-slate-200">{rec.itemName}</td>
                  <td className="p-3 text-center font-mono text-slate-300">{rec.orderedQty}</td>
                  <td className="p-3 text-center font-mono font-bold text-slate-100">{rec.receivedQty}</td>
                  <td className="p-3 text-center font-mono">
                    <span className={rec.discrepancyPercent > 5 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {rec.discrepancyPercent}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {rec.hasAlert ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold">
                        هشدار مدیر خرید صادر شد
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                        منطبق با سفارش
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-left font-mono text-[11px]">
                    {rec.receiptConfirmed ? (
                      <span className="text-emerald-400 font-bold">receipt.confirmed ✓</span>
                    ) : (
                      <span className="text-amber-400 font-bold">در انتظار تسویه</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="جستجو با نام مصالح، کد کالا یا تأمین‌کننده..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 pr-9 pl-3 py-2.5 rounded-lg focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>محل انبار:</span>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">همه انبارها</option>
              <option value="انبار مرکزی کابل" className="bg-slate-900">انبار مرکزی کابل</option>
              <option value="سایت پروژه" className="bg-slate-900">سایت پروژه دارالامان</option>
              <option value="انبار کارگاه هرات" className="bg-slate-900">انبار کارگاه هرات</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>مبدأ تأمین:</span>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">همه مبادی</option>
              <option value="domestic" className="bg-slate-900">تولیدات داخلی افغانستان</option>
              <option value="imported" className="bg-slate-900">واردات خارجی (ایران/ازبکستان/چین)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.quantity <= item.minThreshold;
          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between gap-3 transition shadow-sm ${
                isLow ? 'border-amber-500/70 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    {item.itemCode}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    item.origin === 'domestic'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-sky-950/80 text-sky-400 border border-sky-800/60'
                  }`}>
                    {item.origin === 'domestic' ? 'تولید ملی' : 'وارداتی'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-100">{item.name}</h3>

                <div className="mt-3 text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>محل استقرار:</span>
                    <span className="text-slate-300 font-medium">{item.warehouseLocation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تأمین‌کننده:</span>
                    <span className="text-slate-300 font-medium">{item.supplierName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>بهر / بچ کنترل:</span>
                    <span className="font-mono text-slate-400 text-[11px]">{item.batchNumber}</span>
                  </div>
                </div>

                {/* Stock Level Bar */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">موجودی فعلی:</span>
                    <span className={`font-mono font-black text-sm ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.quantity.toLocaleString('fa-AF')} {item.unit}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>حداقل آستانه: {item.minThreshold} {item.unit}</span>
                    <span>نرخ واحد: {item.unitCost.toLocaleString('fa-AF')} AFN</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  ضایعات: {item.wastePercentage}%
                </span>

                <button
                  onClick={() => setActiveQCItem(item)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>شناسنامه کیفی و QC</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goods Receipt Modal (Page 12 Section 12-1) */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateReceipt}
            className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-slate-100">ثبت رسید انبار و کنترل مغایرت بارنامه (Section 12-1)</h3>
              </div>
              <button type="button" onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">انتخاب قلم کالای سفارش‌شده:</label>
                <select
                  value={receiptItemCode}
                  onChange={(e) => setReceiptItemCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {items.map(i => (
                    <option key={i.itemCode} value={i.itemCode}>{i.name} ({i.itemCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">مقدار در فاکتور/بارنامه:</label>
                  <input
                    type="number"
                    value={orderedQty}
                    onChange={(e) => setOrderedQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">مقدار واقعی دریافت شده:</label>
                  <input
                    type="number"
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-amber-400 font-bold font-mono"
                  />
                </div>
              </div>

              {/* Calculated Discrepancy Alert Notice */}
              {orderedQty > 0 && Math.abs(orderedQty - receivedQty) / orderedQty > 0.05 && (
                <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>مغایرت بیش از ۵٪ شناسایی شد ({Math.round(Math.abs(orderedQty - receivedQty) / orderedQty * 100)}٪ کسری)!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    طبق ضابطه بخش ۱۲-۱، رویداد Alert خودکار برای مدیر خرید ارسال گردیده و تأیید نهایی موکول به صدور صورتجلسه کسری می‌گردد.
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>پیوست تصویر بارنامه ممهور:</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">waybill_scan_signed.pdf ✓</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                ثبت رسید و به‌روزرسانی موجودی
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QC Modal Details */}
      {activeQCItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">برگ نتایج کنترل کیفیت ورودی (QC Checklist)</h3>
              </div>
              <button onClick={() => setActiveQCItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200">{activeQCItem.name}</div>
                <div className="text-slate-400">شماره بچ: {activeQCItem.batchNumber} • انبار: {activeQCItem.warehouseLocation}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700">
                  <span>تطابق گواهی کارخانه (Mill Test Certificate):</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> تأیید شده
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700">
                  <span>آزمایشگاه مقاومت مصالح کابل:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> استاندارد ANSA
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700">
                  <span>آزمون مقاومت کششی یا فشاری:</span>
                  <span className="text-slate-200 font-mono">Fy = 412 MPa (&gt; 400 MPa)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveQCItem(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                بستن و چاپ برگه QC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
