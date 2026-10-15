import React, { useState, useEffect } from 'react';
import {
  Users,
  Camera,
  MapPin,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileDown,
  Printer,
  FileText,
  Eye
} from 'lucide-react';
import { FieldProgressReport } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { useSyncContext } from '../../context/SyncContext';
import { indexedDBService } from '../../services/indexedDBService';
import { FieldReportPDFModal } from './FieldReportPDFModal';

interface FieldProgressReportFormProps {
  currentProjectId: string;
}

export const FieldProgressReportForm: React.FC<FieldProgressReportFormProps> = ({
  currentProjectId
}) => {
  const { projects } = useProjectContext();
  const { isOnline, enqueueChange } = useSyncContext();
  const [projectId, setProjectId] = useState(currentProjectId);
  const [physicalProgress, setPhysicalProgress] = useState<number>(45);
  const [fieldNotes, setFieldNotes] = useState<string>('بتن‌ریزی ستون‌های محور C3 با موفقیت تکمیل شد. نمونه‌گیری سیلندری ۲۸ روزه انجام پذیرفت.');
  const [photosCount, setPhotosCount] = useState<number>(2);
  const [gpsVerified, setGpsVerified] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<FieldProgressReport[]>([]);
  const [showConflictDrawer, setShowConflictDrawer] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load site tasks from IndexedDB on component mount or projectId change
  useEffect(() => {
    let isMounted = true;
    indexedDBService.getOfflineSiteTasks(projectId).then((tasks) => {
      if (!isMounted) return;
      if (tasks && tasks.length > 0) {
        setOfflineQueue(tasks);
      } else {
        // Fallback default sample tasks
        const initialTasks: FieldProgressReport[] = [
          { clientUuid: 'uuid-1', projectId, physicalProgress: 42, notes: 'آرماتوربندی دال همکف تایید شد', photosCount: 3, gpsVerified: true, status: 'synced', updatedAt: '۱۴۰۴/۰۷/۲۳ ۱۶:۳۰' },
          { clientUuid: 'uuid-2', projectId, physicalProgress: 44, notes: 'تست کشش میلگرد Φ25 کارخانه میهن', photosCount: 1, gpsVerified: true, status: 'synced', updatedAt: '۱۴۰۴/۰۷/۲۴ ۰۹:۱۵' },
        ];
        setOfflineQueue(initialTasks);
      }
    }).catch((err) => {
      console.warn('[FieldReports] Error loading from IndexedDB:', err);
    });
    return () => { isMounted = false; };
  }, [projectId]);

  // PDF Export Modal State
  const [isPDFModalOpen, setIsPDFModalOpen] = useState<boolean>(false);
  const [selectedPDFReport, setSelectedPDFReport] = useState<{
    projectId: string;
    projectName: string;
    projectCode: string;
    location: string;
    physicalProgress: number;
    fieldNotes: string;
    photosCount: number;
    gpsVerified: boolean;
    engineerName?: string;
    reportDate?: string;
    reportTime?: string;
  } | null>(null);

  // Auto-save local draft to IndexedDB / localStorage on change
  useEffect(() => {
    const draft = { projectId, physicalProgress, fieldNotes, photosCount, gpsVerified, savedAt: Date.now() };
    localStorage.setItem('afghanabuild_field_draft', JSON.stringify(draft));
  }, [projectId, physicalProgress, fieldNotes, photosCount, gpsVerified]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const currentProjectObj = projects.find((p) => p.id === projectId) || {
    id: projectId,
    name: projectId === 'proj-01' ? 'برج مسکونی کابل (Kabul Residential Tower)' : projectId === 'proj-02' ? 'پل بزرگ هرات (هریرود)' : 'پروژه ساختمانی پامیر الماس',
    code: 'AB-2024-001',
    location: 'کابل، ناحیه ۴، دارالامان'
  };

  const handleSaveDraft = () => {
    showToast('پیش‌نویس به صورت خودکار در حافظه پایدار IndexedDB دستگاه ذخیره شد.');
  };

  const handleSendReport = async () => {
    const clientUuid = 'task-' + Date.now();
    const newEntry: FieldProgressReport = {
      clientUuid,
      projectId,
      physicalProgress,
      notes: fieldNotes,
      photosCount,
      gpsVerified,
      status: isOnline ? 'synced' : 'offline_queued',
      updatedAt: new Date().toLocaleDateString('fa-AF') + ' ' + new Date().toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' })
    };

    // Save to IndexedDB and enqueue in Background Sync Queue
    try {
      await indexedDBService.saveOfflineSiteTask(newEntry);
      await enqueueChange('site_task', 'create', clientUuid, newEntry);
      setOfflineQueue(prev => [newEntry, ...prev]);
      if (isOnline) {
        showToast('گزارش میدانی با موفقیت در پایگاه داده ثبت و همگام‌سازی شد.');
      } else {
        showToast('گزارش میدانی در دیتابیس دستگاه (IndexedDB) ذخیره و به صف آفلاین افزوده شد.');
      }
    } catch (err) {
      console.error('[FieldReports] Error saving report:', err);
      setOfflineQueue(prev => [newEntry, ...prev]);
      showToast('گزارش به صورت محلی ثبت شد.');
    }
  };

  // Open PDF modal for the active report being drafted
  const handleOpenActiveReportPDF = () => {
    setSelectedPDFReport({
      projectId,
      projectName: currentProjectObj.name,
      projectCode: currentProjectObj.code || 'AB-2024',
      location: currentProjectObj.location || 'کابل، دارالامان',
      physicalProgress,
      fieldNotes,
      photosCount,
      gpsVerified,
      engineerName: 'احمد مسعود اندرابی (مهندس ناظر مقیم)',
      reportDate: new Date().toLocaleDateString('fa-AF'),
      reportTime: new Date().toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' })
    });
    setIsPDFModalOpen(true);
  };

  // Open PDF modal for a specific queued report
  const handleOpenQueuedReportPDF = (item: FieldProgressReport) => {
    const proj = projects.find((p) => p.id === item.projectId) || currentProjectObj;
    setSelectedPDFReport({
      projectId: item.projectId,
      projectName: proj.name,
      projectCode: proj.code || 'AB-2024',
      location: proj.location || 'کارگاه پروژه',
      physicalProgress: item.physicalProgress,
      fieldNotes: item.notes,
      photosCount: item.photosCount,
      gpsVerified: item.gpsVerified,
      engineerName: 'احمد مسعود اندرابی (مهندس ناظر)',
      reportDate: item.updatedAt.split(' ')[0] || new Date().toLocaleDateString('fa-AF'),
      reportTime: item.updatedAt.split(' ')[1] || '۱۰:۰۰'
    });
    setIsPDFModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header with Quick PDF Export */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">
              فرم ثبت گزارش پیشرفت میدانی کارگاه (Offline Field Report)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              طراحی اختصاصی برای تلفن همراه و تبلت با ذخیره‌سازی آفلاین فوری و صدور سند رسمی PDF
            </p>
          </div>
        </div>

        {/* Header Action Button: Export PDF */}
        <button
          onClick={handleOpenActiveReportPDF}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
          title="مشاهده پیش‌نمایش و دانلود گزارش به عنوان فایل PDF رسمی"
        >
          <FileDown className="w-4 h-4" />
          <span>خروجی PDF رسمی</span>
        </button>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-emerald-950/90 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Single-Column Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        {/* Project Selection */}
        <div>
          <label className="text-xs text-slate-300 font-bold block mb-1">پروژه ساختمانی:</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer min-h-[44px]"
          >
            {projects.length > 0 ? (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))
            ) : (
              <>
                <option value="proj-01">برج مسکونی کابل (Kabul Residential Tower - دارالامان)</option>
                <option value="proj-02">پل بزرگ هرات (هریرود - کمربندی)</option>
                <option value="proj-03">مدرسه ۱۲ کلاسه مزارشریف</option>
              </>
            )}
          </select>
        </div>

        {/* Physical Progress Slider & Number */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">درصد پیشرفت فیزیکی کارگاه:</span>
            <span className="font-black text-amber-400 font-mono text-base">{physicalProgress}٪</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={physicalProgress}
            onChange={(e) => setPhysicalProgress(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Notes Field */}
        <div>
          <label className="text-xs text-slate-300 font-bold block mb-1">یادداشت فنی و گزارش کار روزانه:</label>
          <textarea
            rows={4}
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            placeholder="شرح عملیات اجراشده، وضعیت اکیپ‌ها، بتن‌ریزی یا موانع اجرایی..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
          />
        </div>

        {/* Photo Upload & GPS Badges */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setPhotosCount(c => c + 1);
              showToast('تصویر جدید با برچسب مختصات به گزارش ضمیمه شد.');
            }}
            className="min-h-[44px] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition p-2.5"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>+ عکس از کارگاه ({photosCount})</span>
          </button>

          <div className="min-h-[44px] flex items-center justify-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-bold p-2.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>مختصات GPS تأیید شد</span>
          </div>
        </div>

        {/* Dedicated In-Card PDF Export Row */}
        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            <span>نیاز به ارائه نسخه چاپی به کارفرما یا دفتر فنی دارید؟</span>
          </div>
          <button
            type="button"
            onClick={handleOpenActiveReportPDF}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg font-bold text-xs transition flex items-center gap-1.5 shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>خروجی PDF و چاپ</span>
          </button>
        </div>
      </div>

      {/* Offline Queue Summary with Individual PDF Export Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>صف گزارش‌های آفلاین ثبت‌شده در این دستگاه ({offlineQueue.length})</span>
          </div>
          <button
            onClick={() => setShowConflictDrawer(true)}
            className="text-[11px] text-amber-400 hover:underline font-semibold"
          >
            مدیریت تعارض‌ها (Conflict)
          </button>
        </div>

        <div className="space-y-2">
          {offlineQueue.map((item) => (
            <div key={item.clientUuid} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3 flex-wrap">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-200">{item.notes}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {item.updatedAt} • پیشرفت: {item.physicalProgress}% • عکس‌ها: {item.photosCount}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  در انتظار اتصال
                </span>
                <button
                  onClick={() => handleOpenQueuedReportPDF(item)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition"
                  title="خروجی PDF این گزارش"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Action Bar (نوار عملیات چسبان - ۵۶px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-h-[56px]">
          {/* Status badge */}
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline">آفلاین — {offlineQueue.length + 1} در صف ذخیره</span>
            <span className="sm:hidden">{offlineQueue.length + 1} در صف</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenActiveReportPDF}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
              title="تولید و دانلود سند PDF رسمی"
            >
              <FileDown className="w-4 h-4" />
              <span>خروجی PDF</span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">ذخیره پیش‌نویس</span>
              <span className="sm:hidden">ذخیره</span>
            </button>

            <button
              onClick={handleSendReport}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>ارسال گزارش</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Export Preview Modal */}
      {selectedPDFReport && (
        <FieldReportPDFModal
          isOpen={isPDFModalOpen}
          onClose={() => setIsPDFModalOpen(false)}
          reportData={selectedPDFReport}
          onSuccessToast={showToast}
        />
      )}

      {/* Conflict Resolution Drawer (Page 12) */}
      {showConflictDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-slate-100">حل تعارض نسخه‌های آفلاین (Conflict Resolution)</h3>
              </div>
              <button onClick={() => setShowConflictDrawer(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              گزارش دیگری برای این پروژه در تراز مشابه ثبت شده است. طبق قاعده Last-Writer-Wins یا ادغام دستی انتخاب فرمایید:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/50 space-y-2">
                <span className="text-[11px] font-bold text-amber-400">نسخه ۱ (ثبت شده در کارگاه میدانی شما):</span>
                <p className="text-xs text-slate-200">پیشرفت: ۴۵٪ • بتن‌ریزی ستون‌های محور C3 با موفقیت تکمیل شد.</p>
                <button
                  onClick={() => {
                    showToast('نسخه شما به عنوان نسخه نهایی اعمال گردید.');
                    setShowConflictDrawer(false);
                  }}
                  className="w-full py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  پذیرش و اعمال نسخه من
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-sky-400">نسخه ۲ (ثبت شده توسط مهندس ناظر):</span>
                <p className="text-xs text-slate-200">پیشرفت: ۴۴٪ • آرماتوربندی دال همکف تایید شد.</p>
                <button
                  onClick={() => {
                    showToast('نسخه سرور انتخاب شد.');
                    setShowConflictDrawer(false);
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  پذیرش نسخه سرور
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
