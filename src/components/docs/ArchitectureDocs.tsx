import React, { useState } from 'react';
import {
  BookOpen,
  Server,
  Layers,
  Terminal,
  Shield,
  Download,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Code
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'design_system' | 'architecture' | 'windows' | 'docker' | 'backup' | 'api'>('design_system');

  const downloadBackupJSON = async () => {
    try {
      const res = await fetch('/api/system/backup');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AfghanaBuild_System_Backup_${Date.now()}.json`;
      link.click();
    } catch (e) {
      alert('خطا در دریافت پشتیبان سیستمی');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                مستندات جامع معماری، دیزاین سیستم و استانداردهای مهندسی
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                راهنمای تفکیک لایه‌ها، سیستم طراحی UI/UX (۱۹ بخش)، کانتینرهای ویندوز و پایگاه داده
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={downloadBackupJSON}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <Download className="w-4 h-4" />
          <span>دانلود اسنپ‌شات پشتیبان سیستم (JSON Backup)</span>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'design_system', label: 'سند جامع طراحی UI/UX و Design System (۱۹ بخش)' },
          { id: 'architecture', label: 'معماری چندلایه سیستم (۴ لایه)' },
          { id: 'windows', label: 'سازگاری و نصب در محیط ویندوز' },
          { id: 'docker', label: 'پیکربندی Docker و Kubernetes' },
          { id: 'backup', label: 'استراتژی پشتیبان‌گیری و بازیابی' },
          { id: 'api', label: 'مشخصات APIهای REST و امنیت' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === 'design_system' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-lg text-amber-400 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>سند جامع معماری فرانت‌اند و سیستم طراحی UI/UX سامانه سازمانی (۱۹ بخش الزامی)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تدوین‌شده با رعایت الزامات نقشه راه توسعه نرم‌افزار مهندسی ساختمانی، اقلیم کاری افغانستان، پشتیبانی آفلاین و استانداردهای WCAG 2.1 AA
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 text-xs font-mono font-bold">
                نسخه مستند: 1.0.0 (Production-Ready)
              </span>
            </div>

            {/* Quick 19 Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300">۱. خلاصه اجرایی:</span>
                <p className="text-slate-400 text-[11px]">طراحی SPA با React 18/19، تایپ‌اسکریپت، تاب‌آوری آفلاین در کارگاه‌های کابل/ولایات و وضوح زیر آفتاب.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-sky-300">۲. اصول طراحی:</span>
                <p className="text-slate-400 text-[11px]">کنتراست بالای ۴.۵:۱، فونت Vazirmatn، رویکرد Offline-First، حذف ابهام در یادداشت‌های سازه و ریتم ۴/۸px.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300">۳. معماری اطلاعات (۲۶ صفحه):</span>
                <p className="text-slate-400 text-[11px]">پوشش از ورود و MFA تا کاتالوگ ۱۰۹ نقشه، بوم CAD، مدل‌سازی BIM، BOQ، آزمایش خاک، انبارداری و گانت.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-300">۴. ماتریس نقش‌ها و RBAC (۱۴ نقش):</span>
                <p className="text-slate-400 text-[11px]">تفکیک اختیارات مدیرعامل، مدیر پروژه، مهندسان معمار/سازه/برق/مکانیک/خاک، مترور، انباردار و کاربر میدانی.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300">۵. سیستم طراحی (Design System):</span>
                <p className="text-slate-400 text-[11px]">پالت رنگ‌های سازمانی Slate Navy، Amber و Blueprint Cyan به همراه رنگ‌های معنایی، گوشه‌ها و اهداف لمسی ≥۴۴px.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-rose-300">۶. توکن‌های طراحی (Design Tokens):</span>
                <p className="text-slate-400 text-[11px]">فرمت استاندارد JSON برای متغیرهای رنگی، فواصل، z-index، سایه‌ها و شعاع انحنای گوشه‌ها.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-sky-300">۷. کتابخانه ۴۲ کامپوننت:</span>
                <p className="text-slate-400 text-[11px]">شامل AppShell، Topbar، Project Switcher، Drawing Toolbar، Layer Panel، Note Card و Offline Indicator.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300">۸. وایرفریم ۱۲ صفحه کلیدی:</span>
                <p className="text-slate-400 text-[11px]">ساختار بلوکی داشبورد، ادیتور 2D، مدل 3D، BOQ، گزارش میدانی موبایل، گردش کار تایید و یادداشت G-014.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-300">۹. استانداردهای تعاملی UI:</span>
                <p className="text-slate-400 text-[11px]">حلقه فوکوس طلایی ۲px، پیشگیری از کلیک تکراری تراکنش‌ها و انیمیشن‌های روان هاور.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300">۱۰. جریان‌های کاری (۱۷ User Flow):</span>
                <p className="text-slate-400 text-[11px]">مراحل کامل ورود، آپلود نقشه، انتشار Rev B، تغییر ضابطه G-014، ثبت آفلاین کارگاه و کنترل بارنامه انبار.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-sky-300">۱۱. واکنش‌گرایی در ۷ عرض:</span>
                <p className="text-slate-400 text-[11px]">بهینه‌سازی برای ۳۶۰/۳۹۰px موبایل، ۷۶۸/۱۰۲۴px تبلت و ۱۲۸۰/۱۴۴۰/۱۹۲۰px دسکتاپ‌های مهندسی.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300">۱۲. انیمیشن و راندمان (Performance):</span>
                <p className="text-slate-400 text-[11px]">هدف ≥۶۰fps، فقط transform و opacity، زمان‌های ۱۲۰/۱۸۰/۲۴۰ms و Web Worker برای CAD/BIM.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-300">۱۳. دسترس‌پذیری (WCAG 2.1 AA):</span>
                <p className="text-slate-400 text-[11px]">پیمایش کامل کیبورد، برچسب‌های ARIA، بزرگ‌نمایی تا ۲۰۰٪ و کنتراست رنگی فراتر از استاندارد.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-rose-300">۱۴. معماری آفلاین و کش کارگاه:</span>
                <p className="text-slate-400 text-[11px]">ذخیره‌سازی فرم‌ها در IndexedDB، صف خودکار ارسال، و حل تعارض داده‌ها بر اساس حق تقدم ناظر مجاز.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300">۱۵. پیام‌های ۱۴گانه سیستم:</span>
                <p className="text-slate-400 text-[11px]">پیام‌های دقیق به فارسی دری برای موفقیت، خطای اعتبارسنجی، تعارض نسخه، هشدار مغایرت انبار و قطعی اینترنت.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-sky-300">۱۶. برنامه تست و ارزیابی (Test-Ready):</span>
                <p className="text-slate-400 text-[11px]">چک‌لیست سناریوهای کیبورد، اسکرین‌ریدر، قطعی شبکه، پایش فریم‌ریت و شبیه‌سازی کاربران چندنقشی.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300">۱۷. نقشه راه پیاده‌سازی (Roadmap):</span>
                <p className="text-slate-400 text-[11px]">اولویت‌بندی فاز ۱ (MVP)، فاز ۲ (مدل‌سازی سه‌بعدی و BOQ) و فاز ۳ (گانت و تدارکات بین‌المللی).</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-300">۱۸. ماتریس انطباق نیازمندی‌ها:</span>
                <p className="text-slate-400 text-[11px]">نگاشت یکپارچه یادداشت‌ها به G-014، اقلیم افغانستان به زون‌های زلزله و کسری مصالح به انبارداری.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300">۱۹. چک‌لیست پذیرش (Definition of Done):</span>
                <p className="text-slate-400 text-[11px]">معیارهای صریح قبولی از ساخت بدون خطای TypeScript تا انطباق کامل RTL و حفظ صددرصدی داده‌های آفلاین.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>تفکیک لایه‌ها و تعاملات داده‌ای و کنترلی (Clean Architecture)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-amber-400 text-sm block">۱. لایه داده (Data Layer):</span>
                <p className="text-slate-300 leading-relaxed">
                  مدل‌های داده با روابط صریح در <code>src/types/index.ts</code>. پایگاه داده ابری Firestore به همراه مخزن محلی آفلاین با قابلیت بازگشت به خودکارسازی در محیط‌های بدون اینترنت افغانستان. پشتیبان‌گیری با کد اعتبارسنجی SHA256 و استراتژی بازبینی منظم دوره‌ای.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-sky-400 text-sm block">۲. لایه بک‌اند (Backend Layer):</span>
                <p className="text-slate-300 leading-relaxed">
                  سرویس‌های تجاری مستقل بر روی Express و Node.js سازگار با ویندوز و لینوکس. روت‌های استاندارد REST API شامل <code>/api/health</code>، <code>/api/ai/chat</code> و <code>/api/system/backup</code> با اعتبارسنجی توکن و کنترل دسترسی بر اساس نقش (RBAC).
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-emerald-400 text-sm block">۳. لایه فرانت‌اند (Frontend Layer):</span>
                <p className="text-slate-300 leading-relaxed">
                  رابط کاربری واکنش‌گرا React 19 + TypeScript + Tailwind CSS. رعایت الزامات دسترسی‌پذیری WCAG 2.1 سطح AA، پشتیبانی کامل از چینش راست به چپ (RTL)، تایپوگرافی فارسی وزیرمتن و انیمیشن‌های روان ۶۰ فریم بر ثانیه زیر ۱۶ میلی‌ثانیه.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-purple-400 text-sm block">۴. لایه زیرساخت (Infrastructure Layer):</span>
                <p className="text-slate-300 leading-relaxed">
                  کانتینرهای استاندارد Docker با موتور Hyper-V و WSL2 در ویندوز ۱۰ و ۱۱ و ویندوز سرور ۲۰۲۲. سیستم نظارت بر شاخص‌های سلامت سامانه با هشدارهای خودکار برای حافظه و قطعی ارتباط.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'windows' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span>راهنمای راه‌اندازی و اجرای بومی بر روی محیط ویندوز (Windows 10/11 & Server)</span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            تمامی اسکریپت‌ها، مسیرهای فایل، ماژول‌ها و ابزارهای ساخت این پروژه کاملاً با محیط ویندوز (شامل خط فرمان PowerShell و CMD) سازگار می‌باشند:
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-amber-400 font-bold"># ۱. نصب پیش‌نیازها در ویندوز (Node.js LTS):</div>
            <div className="text-slate-300">winget install OpenJS.NodeJS.LTS</div>

            <div className="text-amber-400 font-bold mt-3"># ۲. کلون و نصب وابستگی‌ها در PowerShell:</div>
            <div className="text-slate-300">git clone https://github.com/company/afghanabuild.git</div>
            <div className="text-slate-300">cd afghanabuild</div>
            <div className="text-slate-300">npm install</div>

            <div className="text-amber-400 font-bold mt-3"># ۳. اجرای سرور توسعه (پورت ۳۰۰۰):</div>
            <div className="text-slate-300">npm run dev</div>

            <div className="text-amber-400 font-bold mt-3"># ۴. ساخت نسخه نهایی ویندوز سرور:</div>
            <div className="text-slate-300">npm run build</div>
            <div className="text-slate-300">npm start</div>
          </div>
        </div>
      )}

      {activeSection === 'docker' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            <span>پیکربندی استاندارد Dockerfile و docker-compose برای ویندوز</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <div className="text-amber-400 font-bold"># Dockerfile (Multi-Stage Production Build)</div>
            <div>FROM node:22-alpine AS builder</div>
            <div>WORKDIR /app</div>
            <div>COPY package*.json ./</div>
            <div>RUN npm ci</div>
            <div>COPY . .</div>
            <div>RUN npm run build</div>
            <div className="pt-2 text-amber-400 font-bold"># Production Stage</div>
            <div>FROM node:22-alpine AS runner</div>
            <div>WORKDIR /app</div>
            <div>ENV NODE_ENV=production</div>
            <div>ENV PORT=3000</div>
            <div>COPY --from=builder /app/dist ./dist</div>
            <div>COPY --from=builder /app/package*.json ./</div>
            <div>COPY --from=builder /app/node_modules ./node_modules</div>
            <div>COPY --from=builder /app/server.ts ./</div>
            <div>EXPOSE 3000</div>
            <div>CMD ["node", "dist/server.js"]</div>
          </div>
        </div>
      )}

      {activeSection === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <span>استراتژی پشتیبان‌گیری خودکار، بازیابی بلایا و ممیزی داده‌ها</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300">۱. چرخه پشتیبان‌گیری روزانه (Daily Snapshot):</span>
              <p className="text-slate-400">
                سیستم به صورت خودکار در ساعت ۲۴:۰۰ هر شب یک نسخه کامل از تمامی نقشه‌ها، ویرایش‌ها، کدهای یادداشت مرکزی و ردیف‌های فهرست بها تهیه و در دو نسخه در سرور محلی کابل و فضای ذخیره‌سازی ابری رمزنگاری‌شده نگهداری می‌نماید.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-300">۲. هدف زمان بازیابی (RTO &lt; 15 mins):</span>
              <p className="text-slate-400">
                در صورت بروز هرگونه قطعی سرور یا خرابی سخت‌افزار در دفتر کابل، سامانه از طریق فایل اسنپ‌شات در کمتر از ۱۵ دقیقه با تمام تاریخچه پروژه‌ها راه‌اندازی مجدد می‌گردد.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'api' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-400" />
            <span>مشخصات سرویس‌های REST API و کنترل دسترسی مبتنی بر نقش (RBAC)</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">GET</span>
                <span className="text-slate-200">/api/health</span>
              </div>
              <span className="text-slate-400 text-[11px]">ارزیابی پایش و سلامت آنلاین سرور</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold border border-sky-800">POST</span>
                <span className="text-slate-200">/api/ai/chat</span>
              </div>
              <span className="text-slate-400 text-[11px]">مشاوره مهندسی سازه، کد ملی و BOQ با Gemini</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-bold border border-amber-800">GET</span>
                <span className="text-slate-200">/api/system/backup</span>
              </div>
              <span className="text-slate-400 text-[11px]">دریافت اسنپ‌شات رسمی پشتیبان کل داده‌ها</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
