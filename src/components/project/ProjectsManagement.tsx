import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Check,
  Building,
  Calendar,
  Layers,
  MapPin,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Project } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { Stepper, StepItem } from '../common/Stepper';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface ProjectsManagementProps {
  onOpenProjectDetails: (projectId: string) => void;
}

export const ProjectsManagement: React.FC<ProjectsManagementProps> = ({
  onOpenProjectDetails,
}) => {
  const { projects, setCurrentProjectId } = useProject();
  const { showSuccess, showWarning } = useToast();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'planning' | 'completed' | 'on_hold'>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof Project>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Row Selection for Batch Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // New Project Stepper State (Section 4-10)
  const [newProjectStep, setNewProjectStep] = useState(0);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    code: '',
    client: '',
    location: 'کابل، ناحیه ۱۰',
    budget: 25000000,
    structureType: 'بتنی مسلح',
    startDate: '۱۴۰۳/۰۷/۰۱',
    completionDate: '۱۴۰۴/۰۸/۳۰',
    supervisorEngineer: 'مهندس احمد رضایی',
  });

  const stepperSteps: StepItem[] = [
    { id: 'step-1', title: 'اطلاعات پایه' },
    { id: 'step-2', title: 'موقعیت مکانی' },
    { id: 'step-3', title: 'مدارک و مجوزها' },
    { id: 'step-4', title: 'تیم و نقش‌ها' },
    { id: 'step-5', title: 'تأیید نهایی' },
  ];

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesProvince = provinceFilter === 'all' || p.location.includes(provinceFilter);
      const matchesYear = yearFilter === 'all' || p.startDate.includes(yearFilter);

      return matchesSearch && matchesStatus && matchesProvince && matchesYear;
    });
  }, [projects, searchQuery, statusFilter, provinceFilter, yearFilter]);

  // Sorting Logic
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [filteredProjects, sortField, sortDirection]);

  // Pagination Logic
  const totalItems = sortedProjects.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProjects.slice(start, start + pageSize);
  }, [sortedProjects, currentPage, pageSize]);

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProjects.map(p => p.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const handleBatchExport = () => {
    showSuccess('خروجی گزارش', `${selectedIds.length} پروژه جهت صدور فایل اکسل و PDF انتخاب گردید.`);
  };

  const handleBatchDelete = () => {
    showWarning('عملیات دسته‌جمعی', 'حذف دسته‌جمعی نیازمند سطح اختیارات مدیر ارشد فنی می‌باشد.');
  };

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            فعال
          </span>
        );
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            در انتظار تأیید
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تکمیل‌شده
          </span>
        );
      case 'on_hold':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            متوقف
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-5">
      {/* 1. Header Toolbar (Section 7-3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100">
                مدیریت پروژه‌ها (Projects Management)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                فهرست کامل پروژه‌های عمرانی افغانستان همراه با کنترل پیشرفت، فیلترها و جدول استاندارد
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFilterDrawer(prev => !prev)}
            className={`ab-btn-secondary text-xs h-9 ${showFilterDrawer ? 'border-amber-500 text-amber-400' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فیلترها {statusFilter !== 'all' || provinceFilter !== 'all' ? '(فعال)' : ''}</span>
          </button>
          <button
            onClick={() => {
              setNewProjectStep(0);
              setIsNewProjectModalOpen(true);
            }}
            className="ab-btn-primary text-xs h-9"
          >
            <Plus className="w-4 h-4" />
            <span>پروژه جدید</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Filter Bar */}
      <div className="ab-card p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">وضعیت:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="planning">در انتظار تأیید</option>
              <option value="completed">تکمیل‌شده</option>
              <option value="on_hold">متوقف</option>
            </select>
          </div>

          {/* Province Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">ولایت:</span>
            <select
              value={provinceFilter}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">همه ولایات</option>
              <option value="کابل">کابل</option>
              <option value="هرات">هرات</option>
              <option value="بلخ">بلخ / مزارشریف</option>
              <option value="قندهار">قندهار</option>
              <option value="ننگرهار">ننگرهار / جلال‌آباد</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">سال:</span>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">همه سال‌ها</option>
              <option value="1403">۱۴۰۳</option>
              <option value="1402">۱۴۰۲</option>
              <option value="1404">۱۴۰۴</option>
            </select>
          </div>

          {/* Quick Clear */}
          {(statusFilter !== 'all' || provinceFilter !== 'all' || yearFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setProvinceFilter('all');
                setYearFilter('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-amber-400 hover:underline text-xs"
            >
              پاکسازی فیلترها
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="جست‌وجوی پروژه، کد، کارفرما..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg ps-8 pe-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Batch Operations Toolbar (When rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-amber-300 font-semibold">
            {selectedIds.length} پروژه انتخاب شده است
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchExport}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>خروجی اکسل</span>
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف دسته‌جمعی</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Data Table (Section 7-3 & 4-9) */}
      <div className="ab-card overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 dark:bg-slate-950/90 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === paginatedProjects.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    aria-label="انتخاب همه پروژه‌ها"
                  />
                </th>
                <th
                  onClick={() => handleSort('code')}
                  className="p-3.5 font-bold cursor-pointer hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>کد پروژه</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="p-3.5 font-bold cursor-pointer hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>نام پروژه</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-3.5 font-bold">کارفرما</th>
                <th
                  onClick={() => handleSort('progressPercent')}
                  className="p-3.5 font-bold cursor-pointer hover:text-amber-400 transition-colors select-none w-44"
                >
                  <div className="flex items-center gap-1.5">
                    <span>پیشرفت فیزیکی</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-3.5 font-bold text-center">وضعیت</th>
                <th
                  onClick={() => handleSort('completionDate')}
                  className="p-3.5 font-bold cursor-pointer hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>مهلت تحویل</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-3.5 font-bold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    هیچ پروژه‌ای مطابق معیارهای فیلتر یافت نشد.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((proj, idx) => {
                  const isSelected = selectedIds.includes(proj.id);
                  const isZebra = idx % 2 === 1;

                  return (
                    <tr
                      key={proj.id}
                      className={`transition-colors hover:bg-slate-800/50 ${
                        isSelected
                          ? 'bg-amber-500/10'
                          : isZebra
                          ? 'bg-slate-900/30 dark:bg-slate-950/30'
                          : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(proj.id)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-3.5 font-mono text-amber-400 font-bold">
                        {proj.code}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-100">
                        <button
                          onClick={() => {
                            setCurrentProjectId(proj.id);
                            onOpenProjectDetails(proj.id);
                          }}
                          className="hover:text-amber-400 hover:underline text-right"
                        >
                          {proj.name}
                        </button>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {proj.location}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300">{proj.client}</td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">تحقق:</span>
                            <span className="font-bold text-slate-100">{proj.progressPercent}٪</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-300 bg-amber-500"
                              style={{ width: `${proj.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">{getStatusBadge(proj.status)}</td>
                      <td className="p-3.5 font-mono text-slate-300">{proj.completionDate}</td>
                      <td className="p-3.5 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setCurrentProjectId(proj.id);
                              onOpenProjectDetails(proj.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="مشاهده جزئیات و گانت"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProjectToDelete(proj)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="حذف پروژه"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Vertical Cards (Section 4-9) */}
        <div className="md:hidden divide-y divide-slate-800 p-2">
          {paginatedProjects.map((proj) => (
            <div key={proj.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {proj.code}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100 mt-1">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-slate-400">{proj.client} • {proj.location}</p>
                </div>
                {getStatusBadge(proj.status)}
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">پیشرفت فیزیکی:</span>
                  <span className="font-bold text-slate-100 font-mono">{proj.progressPercent}٪</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">موعد: {proj.completionDate}</span>
                <button
                  onClick={() => {
                    setCurrentProjectId(proj.id);
                    onOpenProjectDetails(proj.id);
                  }}
                  className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1"
                >
                  <span>نمایش جزئیات</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Pagination Bar (Section 7-3 & 4-9) */}
        <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            نمایش <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> تا{' '}
            <strong className="text-slate-200">{Math.min(currentPage * pageSize, totalItems)}</strong> از{' '}
            <strong className="text-slate-200">{totalItems}</strong> ردیف
          </div>

          <div className="flex items-center gap-2">
            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                aria-label="صفحه قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded font-bold text-xs transition ${
                    currentPage === i + 1
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                aria-label="صفحه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1 ps-3 border-s border-slate-800">
              <span>نمایش:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
              >
                <option value={5}>۵</option>
                <option value={10}>۱۰</option>
                <option value={20}>۲۰</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 5. New Project Stepper Modal (Section 4-10) */}
      {isNewProjectModalOpen && (
        <div
          className="fixed inset-0 z-[1055] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl bg-slate-900 dark:bg-slate-950 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  ثبت پروژه عمرانی جدید
                </h3>
                <p className="text-xs text-slate-400">
                  فرآیند ۵ مرحله‌ای استاندارد ثبت پروژه عمرانی در سامانه
                </p>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Stepper Header */}
            <Stepper
              steps={stepperSteps}
              currentStepIndex={newProjectStep}
              onStepClick={(idx) => setNewProjectStep(idx)}
              maxCompletedStepIndex={newProjectStep}
            />

            {/* Step Body */}
            <div className="min-h-[200px] p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4 text-xs">
              {newProjectStep === 0 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">نام کامل پروژه:</label>
                    <input
                      type="text"
                      value={newProjectData.name}
                      onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                      placeholder="مثلاً مجتمع مسکونی نیلوفر کابل"
                      className="ab-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">کد پروژه:</label>
                      <input
                        type="text"
                        value={newProjectData.code}
                        onChange={(e) => setNewProjectData({ ...newProjectData, code: e.target.value })}
                        placeholder="AB-2024-099"
                        className="ab-input font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">کارفرما:</label>
                      <input
                        type="text"
                        value={newProjectData.client}
                        onChange={(e) => setNewProjectData({ ...newProjectData, client: e.target.value })}
                        placeholder="وزارت شهرسازی / بخش خصوصی"
                        className="ab-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newProjectStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">موقعیت و ولایت:</label>
                    <input
                      type="text"
                      value={newProjectData.location}
                      onChange={(e) => setNewProjectData({ ...newProjectData, location: e.target.value })}
                      placeholder="کابل، ناحیه ۴، جاده شهید مزاری"
                      className="ab-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">نوع سازه:</label>
                      <select
                        value={newProjectData.structureType}
                        onChange={(e) => setNewProjectData({ ...newProjectData, structureType: e.target.value })}
                        className="ab-input"
                      >
                        <option value="بتنی مسلح">اسکلت بتن مسلح رده C30</option>
                        <option value="فلزی">اسکلت فولادی با مهاربند همگرا/واگرا</option>
                        <option value="ترکیبی">اسکلت ترکیبی با هسته برشی بتنی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">برآورد بودجه (افغانی):</label>
                      <input
                        type="number"
                        value={newProjectData.budget}
                        onChange={(e) => setNewProjectData({ ...newProjectData, budget: Number(e.target.value) })}
                        className="ab-input font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newProjectStep === 2 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <span className="font-bold">استعلام مدارک قانونی:</span>
                    <p className="mt-1 text-[11px] text-slate-300">
                      جهت آغاز فاز عملیاتی، آپلود جواز ساختمان شهرداری، تاییدیه ANSA و گزارش مکانیک خاک الزامی است.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span>جواز احداث شهرداری کابل</span>
                      <span className="text-emerald-400 font-bold">✓ آماده بارگذاری</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span>دفترچه محاسبات زلزله ANSA</span>
                      <span className="text-emerald-400 font-bold">✓ آماده بارگذاری</span>
                    </div>
                  </div>
                </div>
              )}

              {newProjectStep === 3 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">مهندس ناظر مقیم:</label>
                    <input
                      type="text"
                      value={newProjectData.supervisorEngineer}
                      onChange={(e) => setNewProjectData({ ...newProjectData, supervisorEngineer: e.target.value })}
                      className="ab-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">تاریخ شروع (شمسی):</label>
                      <input
                        type="text"
                        value={newProjectData.startDate}
                        onChange={(e) => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                        className="ab-input font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">مهلت اتمام (شمسی):</label>
                      <input
                        type="text"
                        value={newProjectData.completionDate}
                        onChange={(e) => setNewProjectData({ ...newProjectData, completionDate: e.target.value })}
                        className="ab-input font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newProjectStep === 4 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                    خلاصه اطلاعات جهت ثبت نهایی:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>پروژه: <strong className="text-slate-100">{newProjectData.name || 'برج مسکونی جدید'}</strong></div>
                    <div>کد: <strong className="text-amber-400 font-mono">{newProjectData.code || 'AB-2024-NEW'}</strong></div>
                    <div>کارفرما: <strong className="text-slate-100">{newProjectData.client || 'وزارت شهرسازی'}</strong></div>
                    <div>موقعیت: <strong className="text-slate-100">{newProjectData.location}</strong></div>
                    <div>سازه: <strong className="text-slate-100">{newProjectData.structureType}</strong></div>
                    <div>بودجه: <strong className="text-slate-100 font-mono">{(newProjectData.budget / 1000000).toFixed(1)}M ؋</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={newProjectStep === 0}
                onClick={() => setNewProjectStep(prev => prev - 1)}
                className="ab-btn-secondary text-xs disabled:opacity-40"
              >
                مرحله قبل
              </button>

              {newProjectStep < stepperSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setNewProjectStep(prev => prev + 1)}
                  className="ab-btn-primary text-xs"
                >
                  مرحله بعد
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    showSuccess('ثبت پروژه جدید', `پروژه ${newProjectData.name || 'جدید'} با موفقیت ایجاد و به فهرست افزوده شد.`);
                    setIsNewProjectModalOpen(false);
                  }}
                  className="ab-btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  تأیید و ذخیره پروژه
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal (Rule 4-1) */}
      {projectToDelete && (
        <DeleteConfirmationModal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirm={() => {
            showSuccess('حذف پروژه', `پروژه «${projectToDelete.name}» با موفقیت حذف گردید.`);
            setProjectToDelete(null);
          }}
          title="حذف پروژه عمرانی"
          itemName={projectToDelete.name}
          message={`آیا از حذف کامل پروژه «${projectToDelete.name}» و کلیه نقشه‌ها و محاسبات مربوطه اطمینان دارید؟`}
        />
      )}
    </div>
  );
};
