import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  MousePointer,
  Square,
  Minus,
  Ruler,
  FileCode2,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Pin,
  RefreshCw,
  Eye,
  EyeOff,
  History,
  AlertTriangle,
  RotateCcw,
  Tag,
  Paperclip,
  User,
  Bot,
  Sparkles,
  Send,
  Activity
} from 'lucide-react';
import { Drawing, CADElement, GeneralNote, CADLayer, DrawingStatus, DrawingAnnotationPin } from '../../types';
import { DrawingService } from '../../services/drawingService';
import { CADAgentService } from '../../services/cadAgentService';

interface CADStudioProps {
  initialDrawingCode?: string;
  onOpenNotesManager?: () => void;
  onOpenAIAgent?: () => void;
}

export const CADStudio: React.FC<CADStudioProps> = ({
  initialDrawingCode = 'S01',
  onOpenNotesManager,
  onOpenAIAgent
}) => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [selectedDrawingCode, setSelectedDrawingCode] = useState<string>(initialDrawingCode);
  const [activeDrawing, setActiveDrawing] = useState<Drawing | null>(null);
  const [linkedNotes, setLinkedNotes] = useState<GeneralNote[]>([]);

  // AI CAD Agent State & Execution
  const [showAIAgentDrawer, setShowAIAgentDrawer] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiExecuting, setIsAiExecuting] = useState<boolean>(false);
  const [aiLastExplanation, setAiLastExplanation] = useState<string | null>(null);

  const handleExecuteAICommand = async (customPrompt?: string) => {
    const p = customPrompt || aiPrompt;
    if (!p.trim() || isAiExecuting) return;
    setIsAiExecuting(true);
    try {
      const res = await CADAgentService.processCADPrompt(p, selectedDrawingCode);
      if (res.elements2D.length > 0) {
        setNewElements((prev) => [...prev, ...res.elements2D]);
        if (activeDrawing) {
          const updated = {
            ...activeDrawing,
            elements: [...(activeDrawing.elements || []), ...res.elements2D]
          };
          DrawingService.updateDrawing(updated);
          setActiveDrawing(updated);
        }
      }
      setAiLastExplanation(res.message);
      showNotification(res.message);
      if (!customPrompt) setAiPrompt('');
    } catch (err) {
      showNotification('خطا در اجرای دستور هوش مصنوعی CAD');
    } finally {
      setIsAiExecuting(false);
    }
  };

  // Canvas Viewport State (Zoom up to 400% per Page 14)
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drafting Tools (5-tool FAB compatible per Page 14)
  const [selectedTool, setSelectedTool] = useState<'select' | 'pan' | 'line' | 'rect' | 'column' | 'rebar' | 'dimension' | 'pin'>('select');
  const [drawingColor, setDrawingColor] = useState<string>('#38bdf8');
  const [newElements, setNewElements] = useState<CADElement[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Revision State Machine: Draft -> Review -> Published -> Superseded (Page 11)
  const [drawingStatus, setDrawingStatus] = useState<DrawingStatus>('draft');
  const [revisionCode, setRevisionCode] = useState<string>('Rev A');

  // Annotation Pin Modal (Page 11: 3-field pin with Propagate choice)
  const [pendingPinCoords, setPendingPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [pinText, setPinText] = useState('کنترل هم‌پوشانی میلگردها با آیین‌نامه ANSA');
  const [pinResponsible, setPinResponsible] = useState('مهندس ناظر سازه');
  const [pinAttachment, setPinAttachment] = useState('گزارش_کشش_میلگرد.pdf');
  const [pinScope, setPinScope] = useState<'this_version_only' | 'propagate_all'>('propagate_all');

  // Layers
  const [layers, setLayers] = useState<CADLayer[]>([
    { id: 'arch', name: 'معماری و پلان', color: '#f8fafc', visible: true, locked: false },
    { id: 'struct', name: 'سازه و ستون‌ها', color: '#ef4444', visible: true, locked: false },
    { id: 'rebar', name: 'آرماتور و میلگرد', color: '#f59e0b', visible: true, locked: false },
    { id: 'mep', name: 'تأسیسات مکانیک و برق', color: '#06b6d4', visible: true, locked: false },
    { id: 'dim', name: 'اندازه‌گذاری و محورها', color: '#ec4899', visible: true, locked: false },
    { id: 'pins', name: 'پین‌های یادداشت میدانی', color: '#a855f7', visible: true, locked: false },
  ]);

  const [activeNoteEdit, setActiveNoteEdit] = useState<GeneralNote | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const dList = DrawingService.getDrawings();
    setDrawings(dList);
    const target = dList.find(d => d.code === selectedDrawingCode) || dList[0];
    if (target) {
      setActiveDrawing(target);
      setNewElements(target.elements || []);
      setLinkedNotes(DrawingService.getNotesForDrawing(target.code));
      setDrawingStatus(target.status || 'draft');
      setRevisionCode('Rev ' + (target.version || 'A'));
    }
  }, [selectedDrawingCode]);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeDrawing) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Engineering Grid (20px / 50px)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    const canvasW = 1600;
    const canvasH = 1000;

    for (let x = 0; x <= canvasW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasH);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasW, y);
      ctx.stroke();
    }

    // 2. Blueprint Sheet Boundary
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvasW - 40, canvasH - 40);

    // 3. Render CAD Elements
    const allElements = [...(activeDrawing.elements || []), ...newElements];
    allElements.forEach(el => {
      ctx.strokeStyle = el.color || '#38bdf8';
      ctx.lineWidth = el.strokeWidth || 2;
      ctx.fillStyle = el.fill || 'transparent';

      if (el.type === 'rect') {
        const rx = Math.min(el.x1, el.x2);
        const ry = Math.min(el.y1, el.y2);
        const rw = Math.abs(el.x2 - el.x1);
        const rh = Math.abs(el.y2 - el.y1);
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (el.type === 'column') {
        const rx = Math.min(el.x1, el.x2);
        const ry = Math.min(el.y1, el.y2);
        const rw = Math.max(30, Math.abs(el.x2 - el.x1));
        const rh = Math.max(30, Math.abs(el.y2 - el.y1));
        ctx.fillStyle = '#ef444433';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw, ry + rh);
        ctx.moveTo(rx + rw, ry);
        ctx.lineTo(rx, ry + rh);
        ctx.stroke();
      } else if (el.type === 'circle') {
        const rad = el.radius || Math.hypot(el.x2 - el.x1, el.y2 - el.y1) || 25;
        ctx.beginPath();
        ctx.arc(el.x1, el.y1, rad, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.type === 'rebar') {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(el.x1, el.y1);
        ctx.lineTo(el.x2, el.y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(el.x1, el.y1, 5, 0, Math.PI * 2);
        ctx.arc(el.x2, el.y2, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      } else if (el.type === 'line' || el.type === 'wall' || el.type === 'beam') {
        ctx.beginPath();
        ctx.moveTo(el.x1, el.y1);
        ctx.lineTo(el.x2, el.y2);
        ctx.stroke();
      } else if (el.type === 'dimension') {
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(el.x1, el.y1);
        ctx.lineTo(el.x2, el.y2);
        ctx.stroke();
        if (el.text) {
          ctx.font = '12px Vazirmatn, sans-serif';
          ctx.fillStyle = '#f472b6';
          ctx.textAlign = 'center';
          ctx.fillText(el.text, (el.x1 + el.x2) / 2, Math.min(el.y1, el.y2) - 8);
        }
      }

      if (el.label) {
        ctx.font = '12px Vazirmatn, sans-serif';
        ctx.fillStyle = el.color || '#e2e8f0';
        ctx.textAlign = 'right';
        ctx.fillText(el.label, el.x1, el.y1 - 8);
      }
    });

    // 4. Render Annotation Pins (Page 11)
    if (activeDrawing.annotations) {
      activeDrawing.annotations.forEach(p => {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 11px Vazirmatn, sans-serif';
        ctx.fillStyle = '#f3e8ff';
        ctx.fillText(`📌 ${p.text} (${p.responsible})`, p.x + 15, p.y + 4);
      });
    }

    // 5. Engineering Title Block
    const tbW = 420;
    const tbH = 160;
    const tbX = canvasW - 40 - tbW;
    const tbY = canvasH - 40 - tbH;

    ctx.fillStyle = '#0f172aee';
    ctx.fillRect(tbX, tbY, tbW, tbH);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(tbX, tbY, tbW, tbH);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px Vazirmatn, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('شرکت ساختمانی و مهندسی پامیر الماس افغانستان', tbX + tbW - 15, tbY + 25);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Vazirmatn, sans-serif';
    ctx.fillText('پروژه: برج الماس کابل • کارفرما: سرمایه‌گذاری پامیر', tbX + tbW - 15, tbY + 45);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tbX, tbY + 55);
    ctx.lineTo(tbX + tbW, tbY + 55);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px Vazirmatn, sans-serif';
    ctx.fillText(`${activeDrawing.code} : ${activeDrawing.title}`, tbX + tbW - 15, tbY + 80);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Vazirmatn, sans-serif';
    ctx.fillText(`مقیاس: ${activeDrawing.scale || '1:100'} • تراز: ${activeDrawing.floor}`, tbX + tbW - 15, tbY + 105);
    ctx.fillText(`طراح: ${activeDrawing.engineerName} • نسخه: ${revisionCode}`, tbX + tbW - 15, tbY + 125);
    ctx.fillText(`استاندارد: ANSA / ACI • وضعیت: ${drawingStatus === 'published' ? 'منتشرشده (Published)' : drawingStatus === 'review' ? 'در انتظار بازبینی' : 'پیش‌نویس (Draft)'}`, tbX + tbW - 15, tbY + 145);

    ctx.restore();
  }, [activeDrawing, newElements, zoom, pan, drawingStatus, revisionCode]);

  // Handle Mouse Click for Drawing & Pinning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;

    if (e.button === 1 || selectedTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (selectedTool === 'pin') {
      // Open Pin Creation Modal (Page 11)
      setPendingPinCoords({ x: Math.round(rawX), y: Math.round(rawY) });
    } else if (selectedTool !== 'select') {
      setIsDrawing(true);
      setDragStart({ x: rawX, y: rawY });
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x: Math.round(rawX), y: Math.round(rawY) });

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && dragStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const endX = (e.clientX - rect.left - pan.x) / zoom;
      const endY = (e.clientY - rect.top - pan.y) / zoom;

      const elementId = 'elem-' + Date.now();
      let created: CADElement | null = null;

      if (['line', 'rect', 'column', 'rebar', 'dimension'].includes(selectedTool)) {
        created = {
          id: elementId,
          type: selectedTool as any,
          x1: Math.round(dragStart.x),
          y1: Math.round(dragStart.y),
          x2: Math.round(endX),
          y2: Math.round(endY),
          color: drawingColor,
          strokeWidth: selectedTool === 'column' || selectedTool === 'rebar' ? 3 : 2,
          layer: selectedTool === 'rebar' ? 'rebar' : selectedTool === 'column' ? 'struct' : 'arch',
          label: selectedTool === 'column' ? 'ستون C30' : selectedTool === 'rebar' ? 'Φ25 AIII' : undefined,
          text: selectedTool === 'dimension' ? `${Math.round(Math.hypot(endX - dragStart.x, endY - dragStart.y))} mm` : undefined
        };
      }

      if (created) {
        setNewElements(prev => [...prev, created!]);
        showNotification(`المان جدید (${created.type}) اضافه شد.`);
      }

      setIsDrawing(false);
      setDragStart(null);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSavePin = () => {
    if (!pendingPinCoords || !activeDrawing) return;
    const newPin: DrawingAnnotationPin = {
      id: 'pin-' + Date.now(),
      x: pendingPinCoords.x,
      y: pendingPinCoords.y,
      text: pinText,
      responsible: pinResponsible,
      attachmentName: pinAttachment,
      scope: pinScope,
      createdAt: new Date().toLocaleDateString('fa-AF')
    };

    const updatedAnnotations = [...(activeDrawing.annotations || []), newPin];
    const updatedDrawing = { ...activeDrawing, annotations: updatedAnnotations };
    DrawingService.updateDrawing(updatedDrawing);
    setActiveDrawing(updatedDrawing);
    setPendingPinCoords(null);

    if (pinScope === 'propagate_all') {
      showNotification(`یادداشت روی مختصات (${newPin.x}, ${newPin.y}) ثبت شد و به تمام نقشه‌ها منتشر (Propagate) گردید.`);
    } else {
      showNotification(`یادداشت روی مختصات (${newPin.x}, ${newPin.y}) ثبت و فقط در این نسخه ذخیره شد.`);
    }
  };

  // State Machine Step (Draft -> Review -> Published -> Superseded)
  const handleAdvanceStatus = () => {
    if (drawingStatus === 'draft') {
      setDrawingStatus('review');
      showNotification('نقشه جهت بازبینی مدیر فنی ارسال شد (Review).');
    } else if (drawingStatus === 'review') {
      setDrawingStatus('published');
      showNotification('نقشه با موفقیت تأیید نهایی و منتشر گردید (Published).');
    } else if (drawingStatus === 'published') {
      setDrawingStatus('superseded');
      setRevisionCode('Rev B');
      showNotification('نسخه پیشین منسوخ (Superseded) و ویرایش جدید ایجاد شد.');
    }
  };

  const handleRollback = () => {
    setDrawingStatus('draft');
    showNotification('تغییرات لغو شد و نقشه به حالت پیش‌نویس (Rollback) بازگشت.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top CAD Studio Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Drawing Selector & Revision Lifecycle */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDrawingCode}
            onChange={(e) => setSelectedDrawingCode(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-amber-300 font-bold px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
          >
            {drawings.map(d => (
              <option key={d.code} value={d.code}>{d.code} : {d.title}</option>
            ))}
          </select>

          {/* Revision State Badge & Workflow Stepper (Page 8 & 11) */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="font-mono text-slate-400 font-bold">{revisionCode}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              drawingStatus === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              drawingStatus === 'review' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              drawingStatus === 'superseded' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
              'bg-sky-950 text-sky-300 border border-sky-800'
            }`}>
              {drawingStatus === 'published' ? 'منتشرشده' :
               drawingStatus === 'review' ? 'در انتظار بازبینی' :
               drawingStatus === 'superseded' ? 'منسوخ‌شده' : 'پیش‌نویس'}
            </span>
          </div>

          {/* State Machine Transition Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleAdvanceStatus}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition"
            >
              {drawingStatus === 'draft' ? 'ارسال برای بازبینی' :
               drawingStatus === 'review' ? 'تأیید و انتشار (Publish)' :
               drawingStatus === 'published' ? 'ایجاد بازنگری جدید' : 'بازگشت به پیش‌نویس'}
            </button>
            {drawingStatus !== 'draft' && (
              <button
                onClick={handleRollback}
                title="Rollback به نسخه قبل"
                className="p-1.5 bg-slate-800 text-slate-300 hover:text-rose-400 rounded-lg border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 5-Tool Palette & Actions (Page 14) */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setSelectedTool('select')}
            title="انتخاب"
            className={`p-1.5 rounded-lg ${selectedTool === 'select' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool('pan')}
            title="جابجایی بوم (Pan)"
            className={`p-1.5 rounded-lg ${selectedTool === 'pan' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedTool('rect'); setDrawingColor('#38bdf8'); }}
            title="دیوار (Rectangle)"
            className={`p-1.5 rounded-lg ${selectedTool === 'rect' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedTool('column'); setDrawingColor('#ef4444'); }}
            title="ستون بتنی C30"
            className={`p-1.5 rounded-lg ${selectedTool === 'column' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            <Square className="w-4 h-4 text-rose-500" />
          </button>
          <button
            onClick={() => { setSelectedTool('rebar'); setDrawingColor('#f59e0b'); }}
            title="میلگرد AIII"
            className={`p-1.5 rounded-lg ${selectedTool === 'rebar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            <Minus className="w-4 h-4 text-amber-400 stroke-[3]" />
          </button>
          <button
            onClick={() => { setSelectedTool('dimension'); setDrawingColor('#ec4899'); }}
            title="اندازه‌گذاری"
            className={`p-1.5 rounded-lg ${selectedTool === 'dimension' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            <Ruler className="w-4 h-4 text-pink-400" />
          </button>
          <button
            onClick={() => setSelectedTool('pin')}
            title="پین یادداشت میدانی روی نقشه (Annotation Pin)"
            className={`p-1.5 rounded-lg ${selectedTool === 'pin' ? 'bg-purple-600 text-white font-bold' : 'text-purple-400'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Export (Zoom up to 400% per Page 14) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] px-2 font-mono text-slate-300 min-w-[44px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(4.0, z + 0.2))}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              if (onOpenAIAgent) {
                onOpenAIAgent();
              } else {
                setShowAIAgentDrawer(!showAIAgentDrawer);
              }
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs shadow-md shadow-amber-500/20"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>عامل هوشمند CAD</span>
          </button>

          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs"
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span>یادداشت‌ها</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Canvas & Left Notes Drawer (Page 14: 1440px Drawer opens < 300ms) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center: Canvas Workspace */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={1600}
            height={1000}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full object-contain select-none shadow-2xl"
          />

          {/* Coordinate Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 font-mono">
            X: {mousePos.x} mm | Y: {mousePos.y} mm • زوم: {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Left Side: Notes Drawer (Page 14 Specification: 400px Drawer) */}
        {showNotesDrawer && (
          <div className="w-80 md:w-96 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-3 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                <span>یادداشت‌های فنی متصل (G-014, G-015)</span>
              </div>
              <button onClick={() => setShowNotesDrawer(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              هرگونه ویرایش در یادداشت مرکزی، در تمامی ۲۱ نقشه سازه به صورت خودکار اعمال می‌شود.
            </p>

            <div className="space-y-2.5">
              {linkedNotes.map(n => (
                <div key={n.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                      {n.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">v{n.version}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-200">{n.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3 font-sans">
                    {n.text}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{n.linkedDrawingCodes.length} نقشه متصل</span>
                    <button
                      onClick={() => setActiveNoteEdit(n)}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      ویرایش و انتشار همزمان
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Side: Quick AI CAD Agent Drawer */}
        {showAIAgentDrawer && (
          <div className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>دستیار هوشمند نقشه‌کشی CAD</span>
                </div>
                <button
                  onClick={() => setShowAIAgentDrawer(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                دستورات خود را به زبان دری بنویسید تا المان‌ها فوراً روی این نقشه ترسیم و ذخیره شوند.
              </p>

              {/* Sample Quick Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold block">ترسیم سریع:</span>
                <div className="flex flex-col gap-1">
                  {[
                    'ستون بتنی ۵۰×۵۰ با ۸ میلگرد فی ۲۰',
                    'پی گسترده رادیه ۲.۴×۲.۴ با ضخامت ۶۰ سانت',
                    'پلان اتاق ۴ در ۵ متر با در ورودی',
                    'فریم خمشی با تیر دهانه ۵.۵ متر و دو ستون'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteAICommand(chip)}
                      disabled={isAiExecuting}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 text-right transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {aiLastExplanation && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>آخرین عملیات اعمال‌شده:</span>
                  </span>
                  <p className="text-[11px] text-slate-300">{aiLastExplanation}</p>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecuteAICommand();
                  }}
                  placeholder="مثال: ستون ۵۰ در ۵۰ با میلگرد..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 p-2 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  disabled={isAiExecuting}
                />
                <button
                  onClick={() => handleExecuteAICommand()}
                  disabled={isAiExecuting || !aiPrompt.trim()}
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold transition"
                  title="اجرا روی نقشه"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Annotation Pin Creation Modal (Page 11: 3-Field Pin + Propagate Choice) */}
      {pendingPinCoords && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <Pin className="w-4 h-4 text-purple-400" />
                <span>ثبت پین یادداشت روی مختصات ({pendingPinCoords.x}, {pendingPinCoords.y})</span>
              </div>
              <button onClick={() => setPendingPinCoords(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">متن یادداشت / دستور کار مهندسی:</label>
                <input
                  type="text"
                  value={pinText}
                  onChange={(e) => setPinText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">مهندس مسئول پیگیری:</label>
                <input
                  type="text"
                  value={pinResponsible}
                  onChange={(e) => setPinResponsible(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">پیوست مدرک / تصویر آزمایشگاه:</label>
                <input
                  type="text"
                  value={pinAttachment}
                  onChange={(e) => setPinAttachment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-300 font-mono"
                />
              </div>

              {/* Propagation Choice (Page 11 Fig 11-2) */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-300 font-bold block">دامنه انتشار یادداشت:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPinScope('this_version_only')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      pinScope === 'this_version_only'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    فقط این نسخه
                  </button>
                  <button
                    type="button"
                    onClick={() => setPinScope('propagate_all')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      pinScope === 'propagate_all'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    انتشار به همه نسخه‌ها (Propagate)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setPendingPinCoords(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleSavePin}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                ثبت و الصاق پین به نقشه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
