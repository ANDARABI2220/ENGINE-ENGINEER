import React, { useState } from 'react';
import {
  Banknote,
  Receipt,
  TrendingUp,
  FileCheck,
  Download,
  Plus,
  ShieldCheck,
  Building,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_PROJECT } from '../../data/afghanistanData';

export const FinanceModule: React.FC = () => {
  const [project] = useState(INITIAL_PROJECT);
  const [invoices, setInvoices] = useState([
    { id: 'INV-1405-01', client: 'شرکت سرمایه‌گذاری پامیر', title: 'صورت وضعیت شماره ۱ - گودبرداری و پی‌ریزی', amountAFN: 24500000, taxBRTAFN: 490000, date: '1405/03/15', status: 'paid' },
    { id: 'INV-1405-02', client: 'شرکت سرمایه‌گذاری پامیر', title: 'صورت وضعیت شماره ۲ - اسکلت زیرزمین و همکف', amountAFN: 18200000, taxBRTAFN: 364000, date: '1405/06/01', status: 'paid' },
    { id: 'INV-1405-03', client: 'شرکت سرمایه‌گذاری پامیر', title: 'صورت وضعیت شماره ۳ - اسکلت طبقات ۱ تا ۴', amountAFN: 15800000, taxBRTAFN: 316000, date: '1405/07/10', status: 'pending' },
  ]);

  const totalBilled = invoices.reduce((s, i) => s + i.amountAFN, 0);
  const totalTaxBRT = invoices.reduce((s, i) => s + i.taxBRTAFN, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                مالی، صورت وضعیت‌ها و انطباق با قوانین مالیاتی افغانستان
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                مدیریت بودجه، صدور فاکتور رسمی، محاسبه مالیات بر معاملات انتفاعی (۲٪ BRT) و مالیات موضوعی قراردادها
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl">
            واحد پولی رسمی: <strong className="text-amber-400 font-mono">AFN (افغانی)</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">بودجه مصوب قرارداد:</div>
          <div className="text-xl font-black text-amber-400 font-mono">
            {project.budget.toLocaleString('fa-AF')} AFN
          </div>
          <div className="text-[11px] text-slate-500">۱۲۵ میلیون افغانی کل پروژه</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">مجموع صورت وضعیت‌های ارائه‌شده:</div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {totalBilled.toLocaleString('fa-AF')} AFN
          </div>
          <div className="text-[11px] text-emerald-400">۴۶.۸٪ کل بودجه وصول یا در گردش</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">مالیات ۲٪ BRT واریز شده به وزارت مالیه:</div>
          <div className="text-xl font-black text-sky-400 font-mono">
            {totalTaxBRT.toLocaleString('fa-AF')} AFN
          </div>
          <div className="text-[11px] text-slate-500">منطبق بر قانون مالیات بر عایدات افغانستان</div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>صورت وضعیت‌های تایید شده و در جریان مهندسی</span>
          </div>
          <button
            onClick={() => alert('فرم صدور صورت وضعیت پیمانکاری جدید باز شد.')}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>صدور صورت وضعیت جدید</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">شماره سند</th>
                <th className="p-3.5 font-bold">عنوان صورت وضعیت</th>
                <th className="p-3.5 font-bold">کارفرما</th>
                <th className="p-3.5 font-bold text-center">تاریخ</th>
                <th className="p-3.5 font-bold text-center">مبلغ ناخالص (AFN)</th>
                <th className="p-3.5 font-bold text-center">کسور ۲٪ BRT</th>
                <th className="p-3.5 font-bold text-left">وضعیت پرداخت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-amber-400 font-bold">{inv.id}</td>
                  <td className="p-3.5 text-slate-100 font-medium">{inv.title}</td>
                  <td className="p-3.5 text-slate-300">{inv.client}</td>
                  <td className="p-3.5 text-center text-slate-400 font-mono">{inv.date}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-100">
                    {inv.amountAFN.toLocaleString('fa-AF')}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-400">
                    {inv.taxBRTAFN.toLocaleString('fa-AF')}
                  </td>
                  <td className="p-3.5 text-left">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      inv.status === 'paid'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}>
                      {inv.status === 'paid' ? 'تسویه شده' : 'در دست بررسی مالی'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
