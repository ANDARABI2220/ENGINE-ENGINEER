import React, { useState } from 'react';
import {
  Users,
  Shield,
  HardHat,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Employee } from '../../types';
import { INITIAL_EMPLOYEES } from '../../data/afghanistanData';

export const HRModule: React.FC = () => {
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const safetyLogs = [
    { id: 'HSE-01', title: 'بازرسی داربست‌های مدولار ستون‌های طبقه ۴', date: '1405/07/12', status: 'تأیید شد', inspector: 'مهندس صفی‌الله رحمانی', items: 'بست‌ها، پایه‌های تراز، و توری محافظ بررسی گردید.' },
    { id: 'HSE-02', title: 'کنترل تجهیزات حفاظت فردی (PPE) کارگران بتن‌ریزی', date: '1405/07/10', status: 'تأیید شد', inspector: 'مسئول ایمنی کارگاه', items: 'چک‌لیست کلاه ایمنی، عینک محافظ پاشش بتن و چکمه‌های فولادی ۱۰۰٪ تکمیل شد.' },
    { id: 'HSE-03', title: 'تهویه و اکسیژن‌سنجی انبار مصالح زیرزمین ۲', date: '1405/07/08', status: 'تأیید شد', inspector: 'تیم ایمنی و بهداشت', items: 'فن‌های فشار مثبت فعال و میزان گاز کربن مونوکسید صفر درصد ثبت شد.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                منابع انسانی، کادر مهندسی و ایمنی کارگاه (HR & HSE Safety)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                پرونده پرسنل متخصص، ثبت حضور و غیاب میدانی، قراردادها و چک‌لیست‌های ایمنی و حفاظت کار
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-2 rounded-xl text-xs text-emerald-300">
          <HardHat className="w-4 h-4 text-amber-400" />
          <span>رکورد ۲۸۰ روز متوالی کاری بدون حادثه شغلی (Zero Accidents)</span>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>کادر مهندسی مقیم و سرپرستان پروژه الماس کابل</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-slate-100">{emp.fullName}</div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 font-semibold">
                  {emp.department}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>سمت: <strong className="text-slate-200">{emp.role}</strong></div>
                <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Phone className="w-3 h-3 text-slate-500" /> {emp.phone}
                  </span>
                  <span className="text-emerald-400 font-bold">{emp.attendanceDays} روز حضور ماه جاری</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">نوع قرارداد: {emp.contractType}</span>
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> وضعیت ایمنی سبز
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HSE Safety Inspection Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">گزارش‌های بازرسی ایمنی و حفاظت فنی کارگاه (HSE)</h3>
          </div>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> استانداردهای ILO و وزارت کار افغانستان
          </span>
        </div>

        <div className="space-y-3">
          {safetyLogs.map((log) => (
            <div key={log.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-[11px]">{log.id}</span>
                  <span className="font-bold text-slate-200">{log.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">{log.items}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-slate-400 text-[11px]">
                <span>بازرس: {log.inspector}</span>
                <span className="font-mono">{log.date}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
