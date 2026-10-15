import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Clock,
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  UploadCloud,
  FileText,
  UserCheck,
  Building,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { PermitRecord } from '../../types';
import { INITIAL_PERMITS } from '../../data/afghanistanData';

export const ComplianceTracker: React.FC = () => {
  const [permits, setPermits] = useState<PermitRecord[]>([
    {
      id: 'perm-01',
      projectId: 'proj-01',
      permitType: 'جواز احداث بنا و مجوز ساختمانی (Building Permit)',
      authority: 'ریاست ناحیه دهم شهرداری کابل',
      submissionDate: '۱۴۰۴/۰۹/۱۰',
      approvalDate: '۱۴۰۴/۱۰/۲۵',
      expiryDate: '۱۴۰۶/۱۰/۲۵',
      stage: 'legal_approved',
      status: 'approved',
      referenceNumber: 'KM-PERMIT-1404-9821',
      notes: 'تأییدیه نهایی صادر و شماره ثبت در سامانه شهرداری کابل درج گردید. اعتبار: ۲ سال تقویمی.',
      requiredDocs: [
        { name: 'سند مالکیت قباله شرعی زمین', uploaded: true },
        { name: 'نقشه‌های چهارگانه A/S/E/M تایید شده', uploaded: true },
        { name: 'گزارش ژئوتکنیک مکانیک خاک', uploaded: true },
        { name: 'فیش پرداخت عوارض نوسازی', uploaded: true }
      ]
    },
    {
      id: 'perm-02',
      projectId: 'proj-01',
      permitType: 'تأییدیه انطباق استاندارد لرزه‌ای و مقاومت سازه',
      authority: 'اداره ملی استانداردهای افغانستان (ANSA)',
      submissionDate: '۱۴۰۴/۱۰/۰۵',
      approvalDate: '۱۴۰۴/۱۱/۰۲',
      expiryDate: '۱۴۰۶/۱۱/۰۲',
      stage: 'legal_approved',
      status: 'approved',
      referenceNumber: 'ANSA-STR-2025-441',
      notes: 'انطباق تحلیل طیفی زلزله زون ۱ کابل و جزئیات بتن مسلح ACI 318 تایید گردید.',
      requiredDocs: [
        { name: 'دفترچه محاسبات بارگذاری زلزله و باد', uploaded: true },
        { name: 'مدل تحلیلی ETABS و SAFE', uploaded: true },
        { name: 'نتایج تست کشش آزمایشگاهی میلگرد', uploaded: true }
      ]
    },
    {
      id: 'perm-03',
      projectId: 'proj-01',
      permitType: 'تأییدیه سیستم ایمنی و اعلام/اطفای حریق',
      authority: 'اداره اطفائیه و دفاع مدنی وزارت امور داخله',
      submissionDate: '۱۴۰۵/۰۶/۱۰',
      expiryDate: '۱۴۰۵/۱۲/۲۹',
      stage: 'internal_approved',
      status: 'under_review',
      referenceNumber: 'FIRE-DEPT-KBL-782',
      notes: 'توسط مدیر فنی سازمان تأیید و جهت ممیزی نهایی به اداره اطفائیه ارسال گردید.',
      requiredDocs: [
        { name: 'پلان خروج اضطراری و پله فرار', uploaded: true },
        { name: 'مشخصات فنی بوستر پمپ حریق', uploaded: true },
        { name: 'گواهی استاندارد کابل‌های نسوز', uploaded: false }
      ]
    }
  ]);

  const advancePermitStage = (permitId: string) => {
    setPermits(permits.map(p => {
      if (p.id === permitId) {
        if (p.stage === 'draft_request') {
          return { ...p, stage: 'internal_approved', status: 'under_review', notes: 'توسط مدیر فنی پروژه تایید و به نهاد قانونی ارسال شد.' };
        } else if (p.stage === 'internal_approved') {
          return { ...p, stage: 'legal_approved', status: 'approved', approvalDate: '۱۴۰۴/۰۷/۲۴', expiryDate: '۱۴۰۶/۰۷/۲۴', notes: 'مجوز رسمی از سوی نهاد قانونی صادر گردید.' };
        }
      }
      return p;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                درخواست مجوز، استانداردهای ملی و تأییدیه‌های دامنه‌ای (Permit Workflow)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                گردش کار سه‌مرحله‌ای: پیش‌نویس (شخصی) ← تأیید داخلی (پروژه‌ای) ← تأیید نهاد قانونی (سازمانی)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>مراجع قانونی: شهرداری کابل • اداره ملی استاندارد (ANSA)</span>
        </div>
      </div>

      {/* 3-Stage Workflow Architecture Explainer Card (Page 12 Table 12-3) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-xs text-amber-400 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4" />
          <span>ماتریس جریان مجوز سه‌مرحله‌ای و تفکیک دامنه‌های دسترسی (Domain Separation):</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200 block">مرحله ۱: تکمیل مدارک (دامنه شخصی)</span>
            <p className="text-[11px] text-slate-400">تأییدکننده: مهندس سایت • خروجی: پیش‌نویس درخواست و آپلود مدارک اولیه</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-sky-400 block">مرحله ۲: تأیید داخلی (دامنه پروژه‌ای)</span>
            <p className="text-[11px] text-slate-400">تأییدکننده: مدیر فنی • خروجی: ارسال رسمی درخواست به نهادهای دولتی</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 block">مرحله ۳: تأیید قانونی (دامنه سازمانی)</span>
            <p className="text-[11px] text-slate-400">تأییدکننده: نهاد بیرونی (شهرداری/ANSA) • خروجی: شماره پروانه و تاریخ اعتبار</p>
          </div>
        </div>
      </div>

      {/* Permits List */}
      <div className="space-y-4">
        {permits.map((permit) => {
          const isLegalApproved = permit.stage === 'legal_approved';
          const isInternalApproved = permit.stage === 'internal_approved';

          return (
            <div
              key={permit.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800/60">
                      {permit.referenceNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100">{permit.permitType}</h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    مرجع قانونی: <strong className="text-slate-300">{permit.authority}</strong>
                  </div>
                </div>

                {/* 3-Stage Progress Indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      isLegalApproved
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isInternalApproved
                        ? 'bg-sky-950 text-sky-400 border border-sky-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {isLegalApproved ? 'تأیید قانونی (مرحله ۳)' :
                       isInternalApproved ? 'ارسال به نهاد (مرحله ۲)' : 'پیش‌نویس (مرحله ۱)'}
                    </span>
                  </div>

                  {!isLegalApproved && (
                    <button
                      onClick={() => advancePermitStage(permit.id)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      {permit.stage === 'draft_request' ? 'تأیید داخلی و ارسال' : 'ثبت شماره جواز قانونی'}
                    </button>
                  )}
                </div>
              </div>

              {/* Note / Description */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {permit.notes}
              </p>

              {/* Documents Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">مدارک و ضمائم فنی بارگذاری‌شده:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  {permit.requiredDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        doc.uploaded
                          ? 'bg-slate-950 border-slate-800 text-slate-300'
                          : 'bg-amber-950/20 border-amber-800/50 text-amber-300'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{doc.name}</span>
                      {doc.uploaded ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold shrink-0">در انتظار</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiry Alert & Dates Bar (Page 12: Expiry alert badge on dashboard) */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>تاریخ ارسال مدارک: {permit.submissionDate}</span>
                {permit.expiryDate && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاریخ اعتبار پروانه: {permit.expiryDate}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
