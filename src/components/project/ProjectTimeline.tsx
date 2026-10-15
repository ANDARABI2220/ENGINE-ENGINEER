import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart2,
  Flag,
  ShieldAlert,
  FolderTree,
  ChevronDown
} from 'lucide-react';
import { INITIAL_PROJECT } from '../../data/afghanistanData';

interface WBSNode {
  id: string;
  code: string;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  isCritical: boolean;
  status: 'completed' | 'in_progress' | 'planned';
  subtasks?: WBSNode[];
}

export const ProjectTimeline: React.FC = () => {
  const [project] = useState(INITIAL_PROJECT);

  const wbsData: WBSNode[] = [
    {
      id: 'wbs-1',
      code: '1.0',
      name: 'فاز ۱: مطالعات زمین‌شناسی و تجهیز کارگاه',
      progress: 100,
      startDate: '1404/11/01',
      endDate: '1404/12/15',
      isCritical: false,
      status: 'completed',
      subtasks: [
        { id: '1.1', code: '1.1', name: 'حفاری گمانه‌های ژئوتکنیک (BH-01 تا BH-03)', progress: 100, startDate: '1404/11/01', endDate: '1404/11/20', isCritical: false, status: 'completed' },
        { id: '1.2', code: '1.2', name: 'اخذ جواز شهرداری کابل و تاییدیه ANSA', progress: 100, startDate: '1404/11/10', endDate: '1404/12/10', isCritical: true, status: 'completed' }
      ]
    },
    {
      id: 'wbs-2',
      code: '2.0',
      name: 'فاز ۲: گودبرداری، پایدارسازی نیلینگ و پی‌ریزی',
      progress: 100,
      startDate: '1404/12/16',
      endDate: '1405/03/10',
      isCritical: true,
      status: 'completed',
      subtasks: [
        { id: '2.1', code: '2.1', name: 'گودبرداری تا تراز منفی ۸.۵۰ متر', progress: 100, startDate: '1404/12/16', endDate: '1405/01/25', isCritical: true, status: 'completed' },
        { id: '2.2', code: '2.2', name: 'آرماتوربندی و بتن‌ریزی فونداسیون گسترده (S01-S05)', progress: 100, startDate: '1405/02/01', endDate: '1405/03/10', isCritical: true, status: 'completed' }
      ]
    },
    {
      id: 'wbs-3',
      code: '3.0',
      name: 'فاز ۳: اجرای اسکلت بتن مسلح طبقات (ستون، تیر، دال)',
      progress: 55,
      startDate: '1405/03/15',
      endDate: '1405/10/30',
      isCritical: true,
      status: 'in_progress',
      subtasks: [
        { id: '3.1', code: '3.1', name: 'اسکلت زیرزمین ۲ و ۱ و همکف (C1-C2)', progress: 100, startDate: '1405/03/15', endDate: '1405/05/20', isCritical: true, status: 'completed' },
        { id: '3.2', code: '3.2', name: 'اسکلت طبقات ۱ تا ۵ با بتن رده C30', progress: 65, startDate: '1405/05/25', endDate: '1405/08/15', isCritical: true, status: 'in_progress' },
        { id: '3.3', code: '3.3', name: 'اسکلت طبقات ۶ تا ۹ و جان‌پناه بام', progress: 0, startDate: '1405/08/20', endDate: '1405/10/30', isCritical: true, status: 'planned' }
      ]
    },
    {
      id: 'wbs-4',
      code: '4.0',
      name: 'فاز ۴: سفت‌کاری و تأسیسات برق و مکانیک (MEP)',
      progress: 25,
      startDate: '1405/06/01',
      endDate: '1406/02/15',
      isCritical: false,
      status: 'in_progress',
      subtasks: [
        { id: '4.1', code: '4.1', name: 'دیوارچینی پیرامونی با وال‌پست ضد زلزله', progress: 40, startDate: '1405/06/01', endDate: '1405/09/20', isCritical: false, status: 'in_progress' },
        { id: '4.2', code: '4.2', name: 'لوله‌کشی پنج‌لایه، فاضلاب و سینی کابل‌ها', progress: 20, startDate: '1405/07/01', endDate: '1405/11/30', isCritical: false, status: 'in_progress' }
      ]
    },
    {
      id: 'wbs-5',
      code: '5.0',
      name: 'فاز ۵: نازک‌کاری، نمای ترکیبی و تحویل نهایی',
      progress: 0,
      startDate: '1405/11/01',
      endDate: '1406/05/30',
      isCritical: true,
      status: 'planned'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                مدیریت جامع پروژه، ساختار شکست کار (WBS) و مسیر بحرانی (CPM)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ردیابی پیشرفت فیزیکی و زمانی پروژه برج الماس کابل مطابق استانداردهای مدیریت پروژه PMI
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <span className="text-slate-400">پیشرفت کل پروژه:</span>
          <span className="font-mono font-black text-amber-400 text-sm">{project.progressPercent}٪</span>
          <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full" style={{ width: `${project.progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Gantt & CPM Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">تاریخ شروع تا خاتمه:</div>
          <div className="text-sm font-bold text-slate-100 font-mono">{project.startDate} الی {project.completionDate}</div>
          <div className="text-[11px] text-slate-500">مدت قرارداد: ۱۸ ماه تقویمی</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">وضعیت مسیر بحرانی (Critical Path):</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">بدون انحراف منفی (On Track)</div>
          <div className="text-[11px] text-slate-500">بتن‌ریزی طبقات ۵ روز جلوتر از برنامه زمان‌بندی</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">شاخص عملکرد زمانی (SPI):</div>
          <div className="text-sm font-bold text-amber-400 font-mono">1.04 (&gt; 1.00 راندمان مطلوب)</div>
          <div className="text-[11px] text-slate-500">شاخص ارزش کسب شده EVM</div>
        </div>
      </div>

      {/* WBS Interactive Tree & Progress Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">فهرست فعالیت‌ها و گانت چارت پیشرفت فازها</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">۵ فاز اصلی • ۱۸ زیرفعالیت</span>
        </div>

        <div className="space-y-4">
          {wbsData.map((node) => (
            <div key={node.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-xs font-bold border border-slate-700">
                    {node.code}
                  </span>
                  <span className="font-bold text-xs text-slate-100">{node.name}</span>
                  {node.isCritical && (
                    <span className="text-[10px] px-2 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold">
                      مسیر بحرانی (CPM)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{node.startDate} تا {node.endDate}</span>
                  <span className={`font-bold ${node.progress === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {node.progress}٪
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    node.progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${node.progress}%` }}
                />
              </div>

              {/* Subtasks if present */}
              {node.subtasks && node.subtasks.length > 0 && (
                <div className="pr-4 pt-1.5 space-y-1.5 border-r-2 border-slate-800 mt-2">
                  {node.subtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">{sub.code}</span>
                        <span className="text-slate-300">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[11px] text-slate-500">{sub.startDate}</span>
                        <span className={sub.progress === 100 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                          {sub.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
