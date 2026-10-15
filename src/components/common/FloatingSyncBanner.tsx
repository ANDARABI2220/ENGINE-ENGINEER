import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  X,
  Layers,
  Clock,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { useSyncContext } from '../../context/SyncContext';

export const FloatingSyncBanner: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    isSyncing,
    queueCount,
    queuedItems,
    lastSyncTime,
    lastSyncNote,
    triggerSync,
    toggleSimulatedOffline
  } = useSyncContext();

  const [isOpen, setIsOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  // Return compact pill if closed, or expandable full drawer
  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'اطلاعات پروژه';
      case 'boq_item':
        return 'ردیف متره BOQ';
      case 'site_task':
        return 'گزارش کارگاه';
      case 'seismic_data':
        return 'ارزیابی لرزه‌خیزی';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> همگام‌شده
          </span>
        );
      case 'conflict_resolved':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> تعارض رفع شد
          </span>
        );
      case 'syncing':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> در حال ارسال
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
            خطا
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            در صف آفلاین
          </span>
        );
    }
  };

  return (
    <>
      {/* Floating Widget Bottom-Left */}
      <aside aria-label="وضعیت اتصال شبکه و همگام‌سازی" className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2 max-w-[calc(100vw-2rem)] select-none">
        {/* Main Banner Pill */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${
            !isOnline
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
              : isSyncing
              ? 'bg-blue-950/90 border-blue-500/40 text-blue-200'
              : queueCount > 0
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-300 hover:border-slate-500/60'
          }`}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Status Indicator Icon */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 focus:outline-none cursor-pointer"
            title="مشاهده جزئیات همگام‌سازی و صف تغییرات آفلاین"
          >
            {!isOnline ? (
              <div className="relative flex items-center justify-center p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <WifiOff className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping opacity-75" />
              </div>
            ) : isSyncing ? (
              <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Wifi className="w-4 h-4" />
              </div>
            )}

            {/* Label */}
            <div className="text-right">
              <div className="text-xs font-semibold flex items-center gap-1.5">
                {!isOnline ? (
                  <span>حالت آفلاین</span>
                ) : isSyncing ? (
                  <span>در حال همگام‌سازی...</span>
                ) : (
                  <span>اتصال برخط (Online)</span>
                )}
                {queueCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {queueCount} در صف
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                {!isOnline
                  ? 'ذخیره در دیتابیس IndexedDB'
                  : lastSyncTime
                  ? `آخرین همگام‌سازی: ${lastSyncTime}`
                  : 'داده‌ها هماهنگ هستند'}
              </p>
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1 border-r border-slate-700/50 pr-2 mr-1">
            {isOnline && (
              <button
                onClick={() => triggerSync()}
                disabled={isSyncing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
                title="همگام‌سازی دستی اکنون"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="باز کردن پنل مدیریت صف و شبیه‌ساز آفلاین"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Sync Queue & Offline Manager Drawer */}
        {isOpen && (
          <div
            className="w-80 sm:w-96 max-h-[75vh] flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">مدیریت اتصال و صف آفلاین</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content & Status Details */}
            <div className="p-4 space-y-3.5 overflow-y-auto text-xs">
              {/* Storage & Network Status Card */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">وضعیت شبکه واقعی:</span>
                  <span className={`font-semibold flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    {isOnline ? 'اینترنت متصل' : 'قطع'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">پایگاه داده IndexedDB:</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" /> فعال و پایدار
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">ماژول‌های ذخیره آفلاین:</span>
                  <span className="text-slate-200 text-[11px]">پروژه‌ها، متره BOQ، کارگاه، لرزه‌خیزی</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">سیاست حل تعارض:</span>
                  <span className="text-cyan-300 text-[11px] font-mono">Latest Timestamp Wins</span>
                </div>
              </div>

              {/* Offline Simulator Switch */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-300">شبیه‌سازی قطعی اینترنت (کارگاه)</div>
                  <div className="text-[11px] text-slate-400">برای آزمایش رفتار آفلاین سامانه</div>
                </div>
                <button
                  onClick={toggleSimulatedOffline}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isSimulatedOffline
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSimulatedOffline ? 'قطع دستی (فعال)' : 'شروع شبیه‌سازی'}
                </button>
              </div>

              {/* Sync Note Alert */}
              {lastSyncNote && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{lastSyncNote}</span>
                </div>
              )}

              {/* Queued Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    صف تغییرات ذخیره شده ({queuedItems.length})
                  </span>
                  {queueCount > 0 && isOnline && (
                    <button
                      onClick={() => triggerSync()}
                      disabled={isSyncing}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      ارسال صف
                    </button>
                  )}
                </div>

                {queuedItems.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    تمام داده‌ها هماهنگ هستند و موردی در صف معلق نیست.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                    {queuedItems.map((item) => (
                      <div
                        key={item.queueId}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            {getEntityLabel(item.entityType)}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {item.isoTime}
                          </span>
                          <span className="font-mono text-slate-500">
                            {item.action === 'create' ? 'ثبت جدید' : item.action === 'update' ? 'ویرایش' : 'حذف'}
                          </span>
                        </div>
                        {item.conflictResolvedNote && (
                          <div className="text-[10px] text-cyan-400 bg-cyan-950/30 p-1 rounded border border-cyan-800/40">
                            {item.conflictResolvedNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-400">
              <span>Stale-While-Revalidate PWA</span>
              <button
                onClick={() => triggerSync()}
                disabled={isSyncing || !isOnline}
                className="text-amber-400 hover:underline disabled:opacity-50 cursor-pointer"
              >
                همگام‌سازی دستی
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
