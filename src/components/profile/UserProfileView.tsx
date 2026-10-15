import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Clock,
  Camera,
  Mail,
  Phone,
  CheckCircle2,
  Key,
  Smartphone,
  Laptop,
  LogOut,
  Save,
  Upload,
  Calendar,
  Globe
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const UserProfileView: React.FC = () => {
  const { showSuccess, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications' | 'activity'>('personal');

  // Personal Info Form State
  const [formData, setFormData] = useState({
    fullName: 'مهندس احمد رضایی',
    email: 'ahmed.rezaei@afghanabuild.af',
    phone: '۰۷۰۰-۱۲۳۴۵۶۷',
    role: 'مهندس ناظر ارشد — بخش فنی و سازه',
    language: 'دری (فارسی)',
    calendar: 'شمسی (هجری خورشیدی)',
    timezone: 'Asia/Kabul (GMT+4:30)',
  });

  // Security States
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailSafetyAlerts: true,
    emailDailyReport: true,
    smsUrgentDiscrepancy: true,
    cadAnnotationMention: true,
  });

  // Audit Trail History
  const auditLogs = [
    { id: '1', action: 'تأیید نقشه اجرایی سازه S01 (Rev B)', date: '۱۴۰۳/۰۷/۱۴ - ۱۱:۳۰', ip: '185.120.45.12 (کابل)' },
    { id: '2', action: 'بررسی گزارش آزمایش مکانیک خاک BH-01', date: '۱۴۰۳/۰۷/۱۲ - ۰۹:۱۵', ip: '185.120.45.12 (کابل)' },
    { id: '3', action: 'ثبت مغایرت دریافت بارنامه میلگرد در انبار', date: '۱۴۰۳/۰۷/۱۰ - ۱۴:۴۵', ip: '185.120.45.12 (کابل)' },
    { id: '4', action: 'ورود موفق به سامانه با احراز هویت دومرحله‌ای (MFA)', date: '۱۴۰۳/۰۷/۰۸ - ۰۸:۰۰', ip: '185.120.45.12 (کابل)' },
  ];

  const handleSave = () => {
    showSuccess('ذخیره تغییرات', 'اطلاعات پروفایل شما با موفقیت به‌روزرسانی گردید.');
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-6 space-y-6">
      {/* 1. Profile Header Card (Wireframe 7-5) */}
      <div className="ab-card p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
          {/* Avatar with Camera Overlay (Drag & Drop support) */}
          <div className="relative group cursor-pointer">
            <img
              src="/src/assets/images/avatar_engineer_lead_1792040379283.jpg"
              alt="احمد رضایی"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500 shadow-xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] gap-1">
              <Camera className="w-5 h-5 text-amber-400" />
              <span>تغییر تصویر</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-black text-slate-100">{formData.fullName}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                فعال
              </span>
            </div>
            <p className="text-xs text-amber-400 font-semibold">{formData.role}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400 justify-center sm:justify-start pt-1">
              <span className="font-mono">{formData.email}</span>
              <span>•</span>
              <span>عضو از فروردین ۱۴۰۲</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="ab-btn-primary text-xs h-9 px-4 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تغییرات</span>
        </button>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'personal'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>اطلاعات شخصی</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>امنیت و رمز عبور</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'notifications'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>اعلان‌ها</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'activity'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>گزارش فعالیت‌ها (Audit Trail)</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="ab-card p-6">
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="space-y-4 max-w-2xl text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">نام کامل:</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="ab-input"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">شماره تماس کاری:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="ab-input font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">پست الکترونیکی سازمانی:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ab-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">سمت و رده کاربری:</label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="ab-input opacity-70 cursor-not-allowed bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">زبان پیش‌فرض:</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="ab-input"
                >
                  <option value="دری (فارسی)">دری (فارسی)</option>
                  <option value="پښتو (پشتو)">پښتو (پشتو)</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">نوع تقویم:</label>
                <select
                  value={formData.calendar}
                  onChange={(e) => setFormData({ ...formData, calendar: e.target.value })}
                  className="ab-input"
                >
                  <option value="شمسی (هجری خورشیدی)">شمسی (هجری خورشیدی)</option>
                  <option value="میلادی (Gregorian)">میلادی (Gregorian)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">منطقه زمانی:</label>
                <input
                  type="text"
                  value={formData.timezone}
                  disabled
                  className="ab-input font-mono opacity-70 bg-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-2xl text-xs animate-in fade-in">
            {/* MFA Section */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>احراز هویت دومرحله‌ای (MFA / 2FA)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    حفاظت از حساب کاربری با ارسال کد امنیتی به شماره ۰۷۰۰-۱۲۳۴۵۶۷ هنگام ورود.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMfaEnabled(!mfaEnabled);
                    showInfo('امنیت حساب', mfaEnabled ? 'MFA غیرفعال شد.' : 'MFA فعال گردید.');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    mfaEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {mfaEnabled ? 'فعال است' : 'غیرفعال'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>تغییر گذرواژه حساب کاربری</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رمز عبور فعلی:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="ab-input font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رمز عبور جدید:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="ab-input font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>نشست‌های فعال (Active Sessions)</span>
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">مرورگر فعلی (Chrome 128 / Windows 11)</span>
                    <p className="text-[11px] text-emerald-400 mt-0.5">کابل، افغانستان • نشست جاری</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    آنلاین
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-xl text-xs animate-in fade-in">
            <h4 className="font-bold text-sm text-slate-100 mb-2">تنظیمات ارسال هشدارها و پیام‌ها</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">هشدارهای ایمنی و حوادث کارگاهی (HSE)</span>
                  <span className="text-slate-400 text-[11px]">ارسال فوری پیامک و ایمیل در صورت ثبت تخلف ایمنی</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailSafetyAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailSafetyAlerts: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">مغایرت بارنامه مصالح انبار (&gt; ۵٪)</span>
                  <span className="text-slate-400 text-[11px]">اطلاع‌رسانی سریع کسری سیمان و میلگرد تحویلی</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsUrgentDiscrepancy}
                  onChange={(e) => setNotifications({ ...notifications, smsUrgentDiscrepancy: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">ارجاع یادداشت‌های فنی در نقشه‌های CAD</span>
                  <span className="text-slate-400 text-[11px]">نوتیفیکیشن هنگام ثبت پین جدید روی شیت‌های معماری/سازه</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.cadAnnotationMention}
                  onChange={(e) => setNotifications({ ...notifications, cadAnnotationMention: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Trail */}
        {activeTab === 'activity' && (
          <div className="space-y-3 text-xs animate-in fade-in">
            <h4 className="font-bold text-sm text-slate-100 mb-2">تاریخچه لاگ‌های امنیتی و اقدامات مهندسی</h4>
            <div className="divide-y divide-slate-800 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div>
                    <span className="font-semibold text-slate-200">{log.action}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{log.ip}</p>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
