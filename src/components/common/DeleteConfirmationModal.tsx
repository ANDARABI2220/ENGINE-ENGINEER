import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  message?: string;
  requireTypingName?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  message,
  requireTypingName = true,
}) => {
  const [typedName, setTypedName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTypedName('');
      setIsDeleting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfirmed = requireTypingName ? typedName.trim() === itemName.trim() : true;

  const handleDelete = () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setTimeout(() => {
      onConfirm();
      setIsDeleting(false);
      onClose();
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[1055] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="w-full max-w-[560px] rounded-2xl border border-rose-500/30 bg-slate-900 dark:bg-slate-950 p-6 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-100">
                {title || 'تأیید عملیات حذف'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">این عملیات غیرقابل بازگشت است.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="بستن مودال"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed">
          {message || `آیا از حذف «${itemName}» اطمینان کامل دارید؟ تمام اطلاعات، تاریخچه و متعلقات آن از سامانه پاک خواهد شد.`}
        </p>

        {requireTypingName && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              جهت تأیید، عبارت <span className="font-bold text-rose-400 select-all">{itemName}</span> را تایپ کنید:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={itemName}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono text-center"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isConfirmed) handleDelete();
              }}
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
            className={`px-5 py-2 text-sm font-semibold rounded-lg text-white transition-all shadow-md ${
              isConfirmed && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-500 active:scale-95'
                : 'bg-rose-950/50 text-slate-500 cursor-not-allowed border border-rose-900/30'
            }`}
          >
            {isDeleting ? 'در حال حذف...' : 'حذف قطعی'}
          </button>
        </div>
      </div>
    </div>
  );
};
