import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Building,
  Zap,
  Flame,
  Wrench
} from 'lucide-react';
import { Drawing, DrawingSeries } from '../../types';
import { DrawingService } from '../../services/drawingService';

interface DrawingCatalogProps {
  onSelectDrawing: (drawingCode: string) => void;
}

export const DrawingCatalog: React.FC<DrawingCatalogProps> = ({ onSelectDrawing }) => {
  const [drawings] = useState<Drawing[]>(DrawingService.getDrawings());
  const [selectedSeries, setSelectedSeries] = useState<DrawingSeries | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');

  const filtered = drawings.filter(d => {
    const matchesSeries = selectedSeries === 'ALL' || d.series === selectedSeries;
    const matchesQuery =
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.engineerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.floor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = selectedFloor === 'ALL' || d.floor.includes(selectedFloor);
    return matchesSeries && matchesQuery && matchesFloor;
  });

  const seriesCounts = {
    A: drawings.filter(d => d.series === 'A').length,
    S: drawings.filter(d => d.series === 'S').length,
    E: drawings.filter(d => d.series === 'E').length,
    M: drawings.filter(d => d.series === 'M').length,
  };

  const seriesInfo = [
    { id: 'ALL', label: 'تمام رشته‌ها', count: drawings.length, icon: Layers, color: 'text-slate-100' },
    { id: 'A', label: 'رشته معماری (A01 - A26)', count: seriesCounts.A, icon: Building, color: 'text-sky-400' },
    { id: 'S', label: 'رشته سازه (S01 - S21)', count: seriesCounts.S, icon: Wrench, color: 'text-amber-400' },
    { id: 'E', label: 'رشته برق (E01 - E34)', count: seriesCounts.E, icon: Zap, color: 'text-yellow-400' },
    { id: 'M', label: 'رشته مکانیک (M01 - M28)', count: seriesCounts.M, icon: Flame, color: 'text-cyan-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>کاتالوگ کامل نقشه‌های تخصصی پروژه (A / S / E / M)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            دسترسی مستقیم و متمرکز به تمامی ۱۰۹ نقشه مهندسی، آرماتوربندی، پلان‌ها، تابلوها و سیستم‌های مکانیکی با کنترل نسخه
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 rounded-lg">
            مجموع نقشه‌ها: <strong className="text-amber-400">{drawings.length}</strong>
          </span>
          <span className="px-3 py-1 bg-emerald-950/70 border border-emerald-800/60 text-xs font-semibold text-emerald-400 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>۱۰۰٪ مصوب و آماده صدور جواز</span>
          </span>
        </div>
      </div>

      {/* Series Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {seriesInfo.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedSeries === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedSeries(item.id as any)}
              className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg bg-slate-800 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.count} نقشه
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Sub-filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="جستجو با کد نقشه (مثل S01, A06, E28, M10)، عنوان، طراح..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 pr-9 pl-3 py-2.5 rounded-lg focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>تراز طبقه:</span>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-none"
            >
              <option value="ALL">همه طبقات</option>
              <option value="زیرزمین">زیرزمین‌ها</option>
              <option value="همکف">همکف</option>
              <option value="نمونه">طبقات نمونه ۱ تا ۹</option>
              <option value="بام">بام</option>
              <option value="فونداسیون">پی و فونداسیون</option>
            </select>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} مورد یافت شد
          </span>
        </div>
      </div>

      {/* Drawings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((drawing) => {
          const seriesBadgeColor =
            drawing.series === 'A' ? 'bg-sky-950/80 text-sky-400 border-sky-800/60' :
            drawing.series === 'S' ? 'bg-amber-950/80 text-amber-400 border-amber-800/60' :
            drawing.series === 'E' ? 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60' :
            'bg-cyan-950/80 text-cyan-400 border-cyan-800/60';

          return (
            <div
              key={drawing.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition flex flex-col justify-between gap-3 group shadow-sm hover:shadow-lg hover:shadow-amber-500/5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border font-mono ${seriesBadgeColor}`}>
                      {drawing.code}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {drawing.floor}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    v{drawing.version}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition leading-snug">
                  {drawing.title}
                </h3>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>مهندس مسئول:</span>
                    <span className="text-slate-300 font-medium">{drawing.engineerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>مقیاس ترسیم:</span>
                    <span className="text-slate-300 font-mono">{drawing.scale || '1:100'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>یادداشت‌های متصل:</span>
                    <span className="text-amber-300 font-bold">{drawing.linkedNoteIds?.length || 0} یادداشت استاندارد</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  به‌روزرسانی: {drawing.updatedAt}
                </span>

                <button
                  onClick={() => onSelectDrawing(drawing.code)}
                  className="flex items-center gap-1.5 bg-slate-800 group-hover:bg-amber-500 text-slate-200 group-hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>باز کردن در CAD</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
