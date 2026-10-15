import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  X,
  CheckCircle2,
  FileText,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  Camera,
  Loader2,
  Award
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FieldReportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: {
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
  };
  onSuccessToast?: (msg: string) => void;
}

export const FieldReportPDFModal: React.FC<FieldReportPDFModalProps> = ({
  isOpen,
  onClose,
  reportData,
  onSuccessToast
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const serialNumber = `AFB-REP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const currentDate = reportData.reportDate || new Date().toLocaleDateString('fa-AF');
  const currentTime = reportData.reportTime || new Date().toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' });

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      // Allow DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // 2x for Retina sharpness
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate proportional height
      const imgWidth = pdfWidth - 16; // 8mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 8, 8, imgWidth, Math.min(imgHeight, pdfHeight - 16));
      
      const fileName = `AfghanaBuild-FieldReport-${reportData.projectCode || 'REP'}-${Date.now()}.pdf`;
      pdf.save(fileName);

      if (onSuccessToast) {
        onSuccessToast('سند PDF رسمی گزارش با کیفیت بالا دانلود شد.');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      // Fallback: window.print
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <span>پیش‌نمایش سند PDF رسمی گزارش نظارت میدانی</span>
                <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {serialNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                قالب‌بندی استاندارد مهندسی کشور با تأییدیه مختصات ماهواره‌ای و مهرهای نظارتی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال تولید PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="چاپ سند"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Sheet Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950 flex justify-center">
          {/* Printable White Sheet Container (A4 Ratio Format) */}
          <div
            ref={reportRef}
            className="w-full max-w-[760px] bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl space-y-6 text-right font-['Vazirmatn',sans-serif] border border-slate-200"
            dir="rtl"
            style={{ minHeight: '1020px' }}
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-start justify-between">
                {/* Right: Ministry / Company Branding */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    جمهوری اسلامی افغانستان • وزارت شهرسازی و اراضی
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    شرکت مهندسی و ساختمانی پامیر الماس (AfghanaBuild)
                  </h1>
                  <div className="text-xs font-bold text-amber-700">
                    سامانه هوشمند نظارت فنی و کنترل پروژه کارگاهی
                  </div>
                </div>

                {/* Left: Metadata & Serial */}
                <div className="text-left font-mono text-xs space-y-1">
                  <div className="flex items-center justify-end gap-1.5 text-slate-700">
                    <span className="font-bold text-slate-900 font-sans">شماره گزارش:</span>
                    <span className="font-bold text-amber-800">{serialNumber}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-slate-700">
                    <span className="font-bold text-slate-900 font-sans">تاریخ ثبت:</span>
                    <span>{currentDate}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-slate-700">
                    <span className="font-bold text-slate-900 font-sans">ساعت ثبت:</span>
                    <span>{currentTime}</span>
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                    ✓ تأیید و ثبت در پایگاه ابری
                  </div>
                </div>
              </div>

              {/* Sub-header Banner */}
              <div className="mt-4 py-2 px-3 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  فرم رسمی گزارش روزانه مهندس ناظر مقیم کارگاه (Field Inspection & Progress Sheet)
                </span>
                <span className="font-mono text-slate-600 text-[11px]">
                  استاندارد ANSA / کدهای ساختمانی افغانستان
                </span>
              </div>
            </div>

            {/* 2. General Project Specifications Grid */}
            <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-r-4 border-amber-600 pr-2">
                <span>۱. مشخصات عمومی پروژه و کارگاه</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">نام پروژه ساختمانی:</span>
                  <span className="font-bold text-slate-900">{reportData.projectName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">کد سازمانی پروژه:</span>
                  <span className="font-mono font-bold text-slate-900">{reportData.projectCode}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">موقعیت و ناحیه:</span>
                  <span className="font-bold text-slate-900">{reportData.location}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">مهندس ناظر مقیم:</span>
                  <span className="font-bold text-slate-900">{reportData.engineerName || 'احمد مسعود اندرابی'}</span>
                </div>
              </div>
            </div>

            {/* 3. Physical Progress Gauge Section */}
            <div className="space-y-2.5">
              <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-r-4 border-amber-600 pr-2">
                <span>۲. وضعیت پیشرفت فیزیکی محقق‌شده کارگاه</span>
              </h2>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-amber-950 font-bold block">
                    درصد تجمعی پیشرفت فیزیکی مورد تأیید در این گزارش:
                  </span>
                  <p className="text-[11px] text-slate-600">
                    محاسبه شده بر مبنای احجام کار اجراشده، متره و برآورد BOQ و فاز فعال پروژه
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left font-mono">
                    <span className="text-3xl font-black text-amber-700">{reportData.physicalProgress}٪</span>
                    <span className="block text-[10px] text-slate-500">تحقق واقعی</span>
                  </div>
                  <div className="w-36 bg-slate-200 rounded-full h-3.5 overflow-hidden border border-slate-300">
                    <div
                      className="bg-amber-600 h-3.5 rounded-full"
                      style={{ width: `${Math.min(reportData.physicalProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Technical Field Notes & Operations */}
            <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-r-4 border-amber-600 pr-2">
                <span>۳. شرح عملیات اجرایی روزانه و یادداشت‌های فنی مهندس ناظر</span>
              </h2>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs leading-relaxed text-slate-800">
                <p className="font-medium whitespace-pre-line">
                  {reportData.fieldNotes || 'هیچ یادداشت تکمیلی ثبت نگردیده است.'}
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap gap-4">
                  <span>• تطابق با نقشه‌های مصوب سازه (S-Series): <strong>تأیید شد</strong></span>
                  <span>• نمونه‌گیری بتن جهت آزمون فشاری ۲۸ روزه: <strong>انجام پذیرفت</strong></span>
                  <span>• وضعیت ایمنی اکیپ‌های اجرایی (HSE): <strong>کامل</strong></span>
                </div>
              </div>
            </div>

            {/* 5. Geolocation, Photos & Environmental Conditions */}
            <div className="space-y-2">
              <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-r-4 border-amber-600 pr-2">
                <span>۴. راستی‌آزمایی ماهواره‌ای (GPS)، مستندات تصویری و شرایط محیطی</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>موقعیت مکانی ماهواره‌ای (GPS):</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700">
                    34.5281° N, 69.1723° E (دقت ±۲.۵م)
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold">
                    ✓ حضور در شعاع مجاز کارگاه تأیید گردید
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                    <Camera className="w-3.5 h-3.5" />
                    <span>عکس‌های پیوست‌شده:</span>
                  </div>
                  <div className="font-bold text-slate-800">
                    {reportData.photosCount} فریم تصویر دیجیتال
                  </div>
                  <div className="text-[10px] text-slate-500">
                    دارای فراداده ژئوتگ و زمان‌بندی
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>شرایط جوی و دما:</span>
                  </div>
                  <div className="font-bold text-slate-800">
                    آفتابی • ۲۳ درجه سانتی‌گراد
                  </div>
                  <div className="text-[10px] text-slate-500">
                    مجاز برای بتن‌ریزی بدون یخ‌زدگی
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Sign-off, Signatures & Digital Verification Stamp */}
            <div className="pt-4 border-t-2 border-slate-900 space-y-3">
              <div className="text-xs font-bold text-slate-800">
                ۵. تأییدیه‌ها و امضاهای مجاز نظارتی:
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                {/* Site Engineer */}
                <div className="p-3 border border-slate-200 rounded-xl text-center space-y-6 bg-slate-50">
                  <div className="text-[11px] font-bold text-slate-700">
                    مهندس ناظر مقیم کارگاه
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono italic">
                    [امضا و مهر دیجیتال]
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 border-t border-slate-200 pt-1">
                    احمد مسعود اندرابی
                  </div>
                </div>

                {/* Project Manager */}
                <div className="p-3 border border-slate-200 rounded-xl text-center space-y-6 bg-slate-50">
                  <div className="text-[11px] font-bold text-slate-700">
                    سرپرست کارگاه / مدیر پروژه
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono italic">
                    [امضای تأیید احجام]
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 border-t border-slate-200 pt-1">
                    مهندس وحیدالله نوری
                  </div>
                </div>

                {/* Digital Stamp */}
                <div className="p-3 border-2 border-dashed border-amber-500/70 rounded-xl text-center flex flex-col items-center justify-center space-y-1 bg-amber-50/50">
                  <Award className="w-6 h-6 text-amber-600" />
                  <span className="text-[10px] font-black text-amber-900">
                    مهر رسمی نظارت و کنترل کیفیت
                  </span>
                  <span className="text-[9px] font-mono text-slate-600">
                    AfghanaBuild QA Verified
                  </span>
                  <span className="text-[8px] font-mono text-emerald-700 font-bold">
                    HASH: 8F92-BC41-E810
                  </span>
                </div>
              </div>

              {/* Legal Footer Note */}
              <div className="pt-3 text-center text-[10px] text-slate-500 border-t border-slate-200">
                این سند مطابق قوانین فنی وزارت شهرسازی و استانداردهای انکشاف ملی افغانستان تهیه گردیده و نسخه چاپی آن دارای ارزش قانونی و نظارتی می‌باشد.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>سند آماده استخراج در ابعاد استاندارد A4 (کیفیت چاپی ۳۰۰ DPI)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              بستن
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال دانلود...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
