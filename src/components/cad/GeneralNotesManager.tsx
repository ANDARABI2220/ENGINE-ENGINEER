import React, { useState } from 'react';
import {
  FileCode2,
  Plus,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Save,
  Link,
  AlertCircle
} from 'lucide-react';
import { GeneralNote, NoteCategory } from '../../types';
import { DrawingService } from '../../services/drawingService';

export const GeneralNotesManager: React.FC = () => {
  const [notes, setNotes] = useState<GeneralNote[]>(DrawingService.getNotes());
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingNote, setEditingNote] = useState<GeneralNote | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredNotes = notes.filter(n => {
    const matchesCat = selectedCategory === 'ALL' || n.category === selectedCategory;
    const matchesQuery =
      n.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSave = (noteToSave: GeneralNote) => {
    const result = DrawingService.updateGeneralNote(noteToSave);
    setNotes(DrawingService.getNotes());
    setEditingNote(null);
    setStatusMessage(`یادداشت ${noteToSave.code} با موفقیت ویرایش شد و در تمام ${result.affectedDrawingsCount} نقشه مرتبط اعمال گردید.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAddNew = () => {
    const newNote: GeneralNote = {
      id: 'note-' + Date.now(),
      code: `G-0${notes.length + 1}`,
      category: 'structure',
      title: 'یادداشت فنی و استاندارد جدید سازه',
      text: 'مشخصات فنی و استانداردها مطابق با الزامات کد ملی ساختمان افغانستان (ANBC)...',
      linkedDrawingCodes: ['S01', 'S05'],
      version: 1,
      status: 'approved',
      createdBy: 'مهندس ناظر ارشد',
      updatedAt: new Date().toLocaleDateString('fa-AF')
    };
    setEditingNote(newNote);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                مدیریت یادداشت‌های عمومی یکپارچه (Centralized Engineering Notes)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                راهکار جلوگیری از یادداشت‌های تکراری: هرگونه ویرایش در متن یا ضوابط بلافاصله در تمام نقشه‌های متصل منعکس می‌گردد.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن یادداشت استاندارد جدید</span>
        </button>
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Workflow Explainer Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <RefreshCw className="w-4 h-4" />
            <span>مکانیزم همگام‌سازی خودکار دوطرفه (Automated Cascading Propagation)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            مثال: با اصلاح مشخصات میلگرد در یادداشت مرکزی <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">G-014</code>، تمامی ۲۱ نقشه سری سازه (S01 الی S21) و مقاطع معماری فوراً به‌روزرسانی شده و تاریخ بازبینی آنها ثبت می‌گردد.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <div className="text-center px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-amber-400 font-black text-sm">{notes.length}</div>
            <div className="text-[10px] text-slate-400">یادداشت فعال</div>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-emerald-400 font-black text-sm">۱۰۹</div>
            <div className="text-[10px] text-slate-400">نقشه تحت پوشش</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="جستجو در کد یادداشت، عنوان یا متن..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 pr-9 pl-3 py-2.5 rounded-lg focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'همه دسته‌ها' },
            { id: 'structure', label: 'سازه' },
            { id: 'architecture', label: 'معماری' },
            { id: 'electrical', label: 'برق' },
            { id: 'mechanical', label: 'مکانیک' },
            { id: 'general', label: 'عمومی' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => {
          const categoryColors = {
            structure: 'border-amber-500/30 bg-amber-950/10 text-amber-400',
            architecture: 'border-sky-500/30 bg-sky-950/10 text-sky-400',
            electrical: 'border-yellow-500/30 bg-yellow-950/10 text-yellow-400',
            mechanical: 'border-cyan-500/30 bg-cyan-950/10 text-cyan-400',
            general: 'border-slate-500/30 bg-slate-800/20 text-slate-300',
          };

          return (
            <div
              key={note.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between gap-4 transition shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950">
                      {note.code}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${categoryColors[note.category]}`}>
                      {note.category === 'structure' ? 'مهندسی سازه' :
                       note.category === 'architecture' ? 'مهندسی معماری' :
                       note.category === 'electrical' ? 'مهندسی برق' :
                       note.category === 'mechanical' ? 'مهندسی مکانیک' : 'عمومی'}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    نسخه {note.version} • {note.updatedAt}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-100">{note.title}</h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-sans">
                  {note.text}
                </p>

                {/* Linked Drawings Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Link className="w-3.5 h-3.5 text-amber-400" />
                    <span>پیوند به {note.linkedDrawingCodes.length} نقشه فعال:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {note.linkedDrawingCodes.map((code) => (
                      <span
                        key={code}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-mono hover:border-amber-400 transition"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">ایجادکننده: {note.createdBy}</span>
                <button
                  onClick={() => setEditingNote(note)}
                  className="bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg transition"
                >
                  ویرایش و همگام‌سازی
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Modal Editor for General Note */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-slate-100">
                  ویرایش یادداشت مرکزی {editingNote.code}
                </h3>
              </div>
              <button
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">کد یکتا:</label>
                <input
                  type="text"
                  value={editingNote.code}
                  onChange={(e) => setEditingNote({ ...editingNote, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">دسته‌بندی تخصصی:</label>
                <select
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="structure">مهندسی سازه</option>
                  <option value="architecture">مهندسی معماری</option>
                  <option value="electrical">مهندسی برق</option>
                  <option value="mechanical">مهندسی مکانیک</option>
                  <option value="general">عمومی و کارگاهی</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">عنوان کامل یادداشت:</label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">متن کامل ضابطه / مشخصات استاندارد:</label>
              <textarea
                rows={5}
                value={editingNote.text}
                onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-sans leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                کدهای نقشه‌های متصل (با کاما جدا کنید، مانند: S01, S02, S05, S14, A06):
              </label>
              <input
                type="text"
                value={editingNote.linkedDrawingCodes.join(', ')}
                onChange={(e) => {
                  const codes = e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                  setEditingNote({ ...editingNote, linkedDrawingCodes: codes });
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono"
              />
            </div>

            <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl flex items-center gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>با ذخیره این فرم، بلافاصله تغییرات در تمامی {editingNote.linkedDrawingCodes.length} نقشه متصل ذخیره و نسخه‌بندی می‌شود.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={() => handleSave(editingNote)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره و انتشار همزمان</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
