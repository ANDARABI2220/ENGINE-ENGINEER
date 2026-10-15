import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  X,
  Smartphone
} from 'lucide-react';
import { UserRole } from '../../types';

interface MFALoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, role: UserRole) => void;
}

export const MFALoginModal: React.FC<MFALoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [step, setStep] = useState<'credentials' | 'otp' | 'success'>('credentials');
  const [email, setEmail] = useState('ahmed.rezaei@afghanabuild.af');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('technical_director');
  const [otpCode, setOtpCode] = useState(['1', '2', '3', '4', '5', '6']);
  const [countdown, setCountdown] = useState(30);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && step === 'credentials') {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('لطفاً نام کاربری/ایمیل و گذرواژه سازمانی را وارد نمایید.');
      return;
    }
    setErrorMsg(null);
    setStep('otp');
    setCountdown(30);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join('');
    if (fullOtp === '123456' || fullOtp === '654321' || fullOtp.length === 6) {
      setErrorMsg(null);
      setStep('success');
      setTimeout(() => {
        onLoginSuccess(email, selectedRole);
        onClose();
      }, 1000);
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      if (nextFail >= 5) {
        setIsLocked(true);
        setErrorMsg('حساب کاربری به دلیل ۵ بار تلاش ناموفق موقتاً مسدود گردید.');
      } else {
        setErrorMsg(`کد وارد شده نامعتبر است. (${nextFail} تلاش از ۵)`);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1055] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      {/* Centered Card Max-Width 440px (Section 7-1 Wireframe) */}
      <div
        className="ab-card w-full max-w-[440px] p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="بستن پنجره"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Block (Wireframe 7-1) */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 id="login-title" className="text-xl font-extrabold text-slate-100">
            ورود به سامانه
          </h2>
          <p className="text-xs text-slate-400">
            سامانه مهندسی و معماری ساختمانی (AfghanaBuild)
          </p>
        </div>

        {/* Step 1: Credentials Form */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
            {/* Username / Email */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                نام کاربری / ایمیل سازمانی:
              </label>
              <div className="relative">
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer.name@afghanabuild.af"
                  required
                  className="ab-input ps-8 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute start-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                گذرواژه:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="ab-input ps-8 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute start-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Remember Me & Forgot Password (Wireframe 7-1) */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span>مرا به خاطر بسپار</span>
              </label>
              <button
                type="button"
                onClick={() => alert('لینک بازیابی رمز عبور به ایمیل سازمانی شما ارسال گردید.')}
                className="text-amber-400 hover:underline"
              >
                گذرواژه را فراموش کردم
              </button>
            </div>

            {/* Error Message (with zero layout shift) */}
            <div className="min-h-[20px]">
              {errorMsg && (
                <div className="text-rose-400 text-xs flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="w-full ab-btn-primary h-10 text-sm font-bold shadow-lg"
            >
              ورود به سامانه
            </button>

            {/* Secondary Action: Direct 2FA trigger */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-slate-500 text-[11px]">یا تأیید دومرحله‌ای</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('otp');
                setCountdown(30);
              }}
              className="w-full ab-btn-secondary text-xs h-9"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>ورود مستقیم با کد احراز هویت (MFA)</span>
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit MFA Verification */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="text-slate-300 font-bold block">کد تأیید ۶ رقمی را وارد کنید:</span>
              <p className="text-[11px] text-slate-400">کد به شماره ۰۷۰۰-۱۲۳۴۵۶۷ ارسال شد (کد نمونه: 123456)</p>
            </div>

            {/* 6 Inputs */}
            <div className="flex justify-center gap-2 dir-ltr">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 h-12 text-center text-lg font-black font-mono bg-slate-900 border border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-100"
                />
              ))}
            </div>

            {/* Error Message */}
            <div className="min-h-[20px] text-center">
              {errorMsg && (
                <span className="text-rose-400 text-xs font-semibold">{errorMsg}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLocked}
              className="w-full ab-btn-primary h-10 text-sm font-bold shadow-lg"
            >
              تأیید کد و ورود
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="hover:text-slate-200"
              >
                بازگشت به رمز عبور
              </button>
              <span>ارسال مجدد ({countdown} ثانیه)</span>
            </div>
          </form>
        )}

        {/* Step 3: Success Transition */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-100">احراز هویت با موفقیت انجام شد</h3>
            <p className="text-xs text-slate-400">در حال انتقال به داشبورد مهندسی...</p>
          </div>
        )}

        {/* Footer Copyright */}
        <div className="text-center text-[11px] text-slate-400 pt-3 border-t border-slate-800">
          تمامی حقوق محفوظ است — AfghanaBuild ۱۴۰۳ ©
        </div>
      </div>
    </div>
  );
};
