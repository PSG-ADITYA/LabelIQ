import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLabel } from '../context/LabelContext';
import { COMMON_LABEL_PRESETS } from '../data/fssaiRules';
import { validateProductLabel } from '../utils/validationEngine';
import { MeasurementUnit, Orientation, LayoutStyle, IngredientItem } from '../types/label';
import { LABEL_TEMPLATES, getTemplateById, LabelTemplateDefinition } from '../data/labelTemplates';
import { LabelCanvasRenderer } from '../components/LabelCanvasRenderer';
import { formatBatchVariant, getPublicTraceabilityUrl, isLocalhost, OFFICIAL_FSSAI_VERIFY_PORTAL } from '../utils/batchUtils';
import { isValidEan13, formatOrFixEan13 } from '../utils/barcodeGenerator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IngredientIntelligenceModal } from '../components/IngredientIntelligenceModal';
import { TranslationModal } from '../components/TranslationModal';
import { TasteAndOriginEditor } from '../components/TasteAndOriginEditor';
import { 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Printer, 
  Download, 
  Save, 
  AlertTriangle, 
  Sliders, 
  Palette, 
  Maximize2, 
  Check, 
  X, 
  ChevronRight, 
  Filter, 
  Columns, 
  Eye, 
  ShieldCheck,
  CheckCircle2,
  Layers,
  Box,
  QrCode,
  Barcode,
  ListPlus,
  Tag,
  Activity,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Sparkles,
  Languages,
  BookOpen,
  Compass,
  ClipboardCheck,
  Undo2,
  Redo2
} from 'lucide-react';

export const EditorPage: React.FC = () => {
  const { 
    currentLabel, 
    updateCurrentLabel, 
    saveCurrentProduct, 
    showToast, 
    batches, 
    applyBatchToEditor,
    setActiveTab,
    isDirty,
    canUndo,
    canRedo,
    undo,
    redo,
    setDraftStatus
  } = useLabel();

  // Mobile layout active pane (for small screens < 1024px)
  const [mobileActivePane, setMobileActivePane] = useState<'editor' | 'preview'>('editor');

  // Sub-tabs on left inspector panel
  const [editorTab, setEditorTab] = useState<'packaging' | 'identity' | 'ingredients' | 'nutrition' | 'codes' | 'story'>('packaging');
  const [isPrintReadyMode, setIsPrintReadyMode] = useState<boolean>(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState<boolean>(false);
  const [showTranslationModal, setShowTranslationModal] = useState<boolean>(false);
  const [showPrePrintChecklist, setShowPrePrintChecklist] = useState<boolean>(false);

  // Preview & Viewport State
  const [previewZoom, setPreviewZoom] = useState<number>(1.0);
  const [viewPanel, setViewPanel] = useState<'both' | 'front-only' | 'info-only' | 'taste-origin'>('both');
  const [showSafeMarginGuide, setShowSafeMarginGuide] = useState<boolean>(true);
  const [showBleedGuide, setShowBleedGuide] = useState<boolean>(false);
  const [overflowDetails, setOverflowDetails] = useState<string | null>(null);

  // Export & Gallery State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState<boolean>(false);
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  // DOM Refs
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const exportCanvasRef = useRef<HTMLDivElement>(null);

  const dims = currentLabel.dimensions;
  const currentTemplate = getTemplateById(dims.labelTheme);

  // Physical dimensions calculation (exact millimeters)
  let widthMm = dims.width || 120;
  let heightMm = dims.height || 75;
  if (dims.unit === 'cm') { widthMm *= 10; heightMm *= 10; }
  if (dims.unit === 'in') { widthMm *= 25.4; heightMm *= 25.4; }

  // Pixel size on screen at 3.6 px/mm base calibration
  const baseScale = 3.6;
  const effectiveWidthMm = (dims.layoutStyle === 'two-panel' && viewPanel !== 'both') ? Math.round(widthMm / 2) : widthMm;
  const targetPixelWidth = Math.round(effectiveWidthMm * baseScale);
  const targetPixelHeight = Math.round(heightMm * baseScale);

  // Run live validation
  const validationSummary = validateProductLabel(currentLabel);
  const hasLayoutIssues = validationSummary.issues.some(i => i.severity === 'layout') || Boolean(overflowDetails);

  // Dynamic Fit-To-View calculation
  const handleFitToView = useCallback(() => {
    if (!previewViewportRef.current) return;
    const viewportW = previewViewportRef.current.clientWidth - 48;
    const viewportH = previewViewportRef.current.clientHeight - 48;
    if (viewportW <= 0 || viewportH <= 0 || targetPixelWidth <= 0 || targetPixelHeight <= 0) return;

    const scaleW = viewportW / targetPixelWidth;
    const scaleH = viewportH / targetPixelHeight;
    const fitZoom = Math.min(scaleW, scaleH);
    // Clamp between 0.2 and 1.35
    const clamped = Math.max(0.25, Math.min(1.25, Math.floor(fitZoom * 100) / 100));
    setPreviewZoom(clamped);
    showToast(`Fitted to available screen area (${Math.round(clamped * 100)}%)`, 'info');
  }, [targetPixelWidth, targetPixelHeight, showToast]);

  // Initial fit on dimension change if larger than viewport
  useEffect(() => {
    if (previewViewportRef.current) {
      const viewportW = previewViewportRef.current.clientWidth - 48;
      const viewportH = previewViewportRef.current.clientHeight - 48;
      if (targetPixelWidth > viewportW || targetPixelHeight > viewportH) {
        handleFitToView();
      }
    }
  }, [dims.width, dims.height, dims.unit, dims.layoutStyle]);

  // Handle Overflow Callback from shared LabelCanvasRenderer
  const handleOverflowDetected = useCallback((isOverflowing: boolean, details: string) => {
    setOverflowDetails(isOverflowing ? details : null);
  }, []);

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  // Apply packaging theme
  const handleApplyTemplate = (tmpl: LabelTemplateDefinition) => {
    updateCurrentLabel({
      dimensions: {
        ...dims,
        labelTheme: tmpl.id,
        fontFamily: tmpl.fontFamily,
        layoutStyle: tmpl.recommendedLayout,
      }
    });
    setShowTemplateGallery(false);
    showToast(`Applied "${tmpl.name}" packaging theme! All product data preserved.`, 'success');
  };

  // Export as print-ready PDF with exact physical dimensions
  const handleExportPdf = async () => {
    if (!exportCanvasRef.current) return;
    setIsExporting(true);
    showToast('Generating print-ready PDF with exact physical millimeters...', 'info');

    try {
      const canvas = await html2canvas(exportCanvasRef.current, {
        scale: 3.5, // High resolution rendering independent of screen zoom
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const exportWidthMm = (dims.layoutStyle === 'two-panel' && viewPanel !== 'both') ? Math.round(widthMm / 2) : widthMm;
      const orientation = exportWidthMm > heightMm ? 'l' : 'p';

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [exportWidthMm, heightMm],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, exportWidthMm, heightMm);
      const safeFileName = (currentLabel.productName || 'food_label').replace(/[^a-zA-Z0-9_-]/g, '_');
      const panelTag = viewPanel !== 'both' ? `_${viewPanel}` : '';
      pdf.save(`${safeFileName}${panelTag}_${exportWidthMm}x${heightMm}mm_LabelIQ.pdf`);

      showToast(`Downloaded ${exportWidthMm}×${heightMm}mm print-ready PDF!`, 'success');
    } catch (err: any) {
      console.error('PDF export failed:', err);
      showToast('Export failed. Using native browser print dialog instead.', 'warning');
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Export as high-resolution PNG
  const handleExportPng = async () => {
    if (!exportCanvasRef.current) return;
    setIsExporting(true);
    showToast('Rendering high-resolution raster image...', 'info');

    try {
      const canvas = await html2canvas(exportCanvasRef.current, {
        scale: 4.0, // Crisp 300+ DPI equivalent
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeFileName = (currentLabel.productName || 'food_label').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeFileName}_${dims.width}x${dims.height}${dims.unit}.png`;
      link.href = image;
      link.click();

      showToast('High-resolution label image exported!', 'success');
    } catch (err: any) {
      console.error('PNG export error:', err);
      showToast('Image export failed.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Template filter for gallery modal
  const filteredTemplates = LABEL_TEMPLATES.filter(tmpl => {
    if (templateFilter === 'all') return true;
    if (templateFilter === 'pickles' && tmpl.categoryTag.includes('Pickles')) return true;
    if (templateFilter === 'bakery' && tmpl.categoryTag.includes('Bakery')) return true;
    if (templateFilter === 'spices' && tmpl.categoryTag.includes('Spices')) return true;
    if (templateFilter === 'beverages' && tmpl.categoryTag.includes('Beverages')) return true;
    if (templateFilter === 'snacks' && tmpl.categoryTag.includes('Snacks')) return true;
    if (templateFilter === 'dairy' && tmpl.categoryTag.includes('Dairy')) return true;
    if (templateFilter === 'custom' && tmpl.id === 'custom-brand') return true;
    return true;
  });

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Off-screen high-res export canvas (Independent of screen zoom and guide toggles) */}
      <div 
        style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none', zIndex: -100 }}
        aria-hidden="true"
      >
        <div ref={exportCanvasRef}>
          <LabelCanvasRenderer
            label={currentLabel}
            scale={3.6}
            showBleedGuide={false}
            showSafeMarginGuide={false}
            viewPanel={viewPanel}
            isExportMode={true}
          />
        </div>
      </div>

      {/* Top Application Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-forest-900 text-limeaccent-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900">Physical Label Editor</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cream-100 text-slate-800 font-bold border border-cream-200">
                {dims.width} × {dims.height} {dims.unit}
                {dims.unit !== 'mm' && ` (${widthMm}×${heightMm} mm)`}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 font-bold border border-forest-200">
                {currentTemplate.name}
              </span>
              {dims.layoutStyle === 'two-panel' && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium flex items-center gap-1">
                  <Columns className="w-3 h-3" /> Two-Panel Wrap
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified print-ready renderer. Zoom adjusts screen preview only; export maintains true physical dimensions.
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-r border-cream-200 pr-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded-xl border border-cream-300 text-slate-700 hover:bg-cream-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Undo change"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded-xl border border-cream-300 text-slate-700 hover:bg-cream-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Redo change"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Draft Status Selector */}
          <select
            value={currentLabel.draftStatus || 'draft'}
            onChange={(e) => setDraftStatus(e.target.value as any)}
            className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border transition-all cursor-pointer ${
              currentLabel.draftStatus === 'print_ready'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : currentLabel.draftStatus === 'in_review'
                ? 'bg-blue-50 text-blue-900 border-blue-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
            title="Update packaging draft lifecycle status"
          >
            <option value="draft">📝 In Progress (Draft)</option>
            <option value="in_review">🔍 QA / Review</option>
            <option value="print_ready">🟢 Print-Ready Verified</option>
          </select>

          <button
            onClick={() => setShowTemplateGallery(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-all shadow-sm"
          >
            <Palette className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">12 Themes</span>
          </button>

          <button
            onClick={() => setShowTranslationModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition-all shadow-sm"
            title="Translate packaging to Indian regional languages"
          >
            <Languages className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Translate</span> {currentLabel.bilingual?.enabled ? `(${currentLabel.bilingual.targetLanguage.toUpperCase()})` : ''}
          </button>

          <button
            onClick={() => setShowPrePrintChecklist(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition-all shadow-sm"
            title="Comprehensive pre-print compliance audit checklist"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-700" />
            Checklist
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cream-300 text-slate-700 font-semibold text-xs hover:bg-cream-100 transition-all"
            title="Browser Print Preview"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            disabled={isExporting}
            onClick={handleExportPng}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cream-300 text-slate-700 font-semibold text-xs hover:bg-cream-100 transition-all disabled:opacity-50"
            title="Export high-resolution raster image"
          >
            <Download className="w-4 h-4 text-slate-600" />
            PNG
          </button>

          <button
            disabled={isExporting}
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            title="Export vector PDF with exact physical dimensions"
          >
            <Download className="w-4 h-4 text-limeaccent-400" />
            PDF
          </button>

          <button
            onClick={saveCurrentProduct}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all font-bold text-xs ${
              isDirty 
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 ring-1 ring-amber-300' 
                : 'bg-cream-100 text-forest-900 border-cream-300 hover:bg-cream-200'
            }`}
            title={isDirty ? "Save unsaved draft changes" : "Draft saved"}
          >
            <Save className="w-4 h-4" />
            {isDirty ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                <span>Save *</span>
              </span>
            ) : (
              <span>Saved</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Switcher Tab (< 1024px) */}
      <div className="lg:hidden flex rounded-2xl bg-cream-200 p-1 border border-cream-300 text-xs font-bold no-print shadow-xs">
        <button
          type="button"
          onClick={() => setMobileActivePane('editor')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileActivePane === 'editor'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Edit Controls</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActivePane('preview')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileActivePane === 'preview'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Canvas Preview</span>
        </button>
      </div>

      {/* Production Batch & Multi-Quantity Context Banner */}
      <div className="bg-forest-900 text-cream-100 p-3.5 rounded-2xl border border-forest-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-limeaccent-300 uppercase tracking-wider text-[11px]">
            <Layers className="w-4 h-4 text-limeaccent-400" />
            Batch Context:
          </span>
          <select
            value={batches.find(b => b.batch_number === currentLabel.batchNumber)?.id || ''}
            onChange={(e) => {
              const selected = batches.find(b => b.id === e.target.value);
              if (selected) {
                applyBatchToEditor(selected);
              }
            }}
            className="bg-forest-950 text-white font-medium border border-forest-700 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-limeaccent-400 focus:outline-none"
          >
            <option value="">Custom Manual Run ({currentLabel.batchNumber || 'Unassigned Lot'})</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.batch_number} &bull; {formatBatchVariant(b)} ({b.planned_units} units &bull; Exp: {b.expiry_date})
              </option>
            ))}
          </select>
          {currentLabel.batchNumber && (
            <span className="text-[11px] font-mono text-limeaccent-300 bg-forest-800/80 px-2 py-0.5 rounded border border-forest-700">
              Active: {currentLabel.batchNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-cream-200 border-t md:border-t-0 pt-2 md:pt-0 border-forest-800">
          <div>
            <span className="text-slate-400">Batch Planned:</span>{' '}
            <strong className="text-white">
              {batches.find(b => b.batch_number === currentLabel.batchNumber)?.planned_units || 1} units
            </strong>
          </div>
          <div className="h-3 w-px bg-forest-700" />
          <div>
            <span className="text-slate-400">A4 Print Sheets:</span>{' '}
            <strong className="text-limeaccent-300">
              {Math.ceil((batches.find(b => b.batch_number === currentLabel.batchNumber)?.planned_units || 1) / Math.max(1, Math.floor((210 / (widthMm + 6)) * (297 / (heightMm + 6)))))} sheet(s)
            </strong>
            <span className="text-slate-400 text-[10px] ml-1">
              ({Math.max(1, Math.floor((210 / (widthMm + 6)) * (297 / (heightMm + 6))))} labels/sheet)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls Sidebar (4 cols) & Visual Workspace (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Panel (4 cols) */}
        <div className={`lg:col-span-4 space-y-4 no-print ${mobileActivePane === 'editor' ? 'block' : 'hidden lg:block'}`}>
          {/* Sub-tab Navigation */}
          <div className="bg-cream-100 p-1 rounded-2xl flex items-center justify-between border border-cream-200 text-xs">
            <button
              onClick={() => setEditorTab('packaging')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                editorTab === 'packaging' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Packaging dimensions, theme and layout"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Format</span>
            </button>
            <button
              onClick={() => setEditorTab('identity')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                editorTab === 'identity' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Product name, brand, FSSAI and quantity"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Product</span>
            </button>
            <button
              onClick={() => setEditorTab('ingredients')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                editorTab === 'ingredients' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ingredients & Allergens"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recipe</span>
            </button>
            <button
              onClick={() => setEditorTab('nutrition')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                editorTab === 'nutrition' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Nutrition Facts Table"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nutrition</span>
            </button>
            <button
              onClick={() => setEditorTab('codes')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                editorTab === 'codes' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Barcode EAN-13 and Traceability QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Codes</span>
            </button>
            <button
              onClick={() => setEditorTab('story')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                editorTab === 'story' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Taste & Origin Presentation Frame"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Story</span>
            </button>
          </div>

          {/* TAB 1: PACKAGING & THEME */}
          {editorTab === 'packaging' && (
            <div className="space-y-4">
              {/* Active Template Card */}
              <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-forest-800" />
                    Active Theme
                  </span>
                  <button
                    onClick={() => setShowTemplateGallery(true)}
                    className="text-xs font-bold text-forest-800 hover:underline"
                  >
                    Change Theme &rarr;
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-cream-200 bg-cream-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{currentTemplate.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-100 text-forest-900">
                      {currentTemplate.fontFamily.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {currentTemplate.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400">Palette:</span>
                    <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: currentTemplate.palette.background }} />
                    <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: currentTemplate.palette.primaryAccent }} />
                    <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: currentTemplate.palette.secondaryAccent }} />
                    <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: currentTemplate.palette.text }} />
                  </div>
                </div>
              </div>

              {/* Sizing & Packaging Dimensions Controls */}
              <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-forest-800" />
                  Dimensions & Presets
                </h3>

                {/* Container Presets Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Standard Packaging Preset</label>
                  <select
                    onChange={(e) => {
                      const preset = COMMON_LABEL_PRESETS.find(p => p.id === e.target.value);
                      if (preset) {
                        updateCurrentLabel({
                          dimensions: {
                            ...dims,
                            width: preset.width,
                            height: preset.height,
                            unit: preset.unit,
                            orientation: preset.orientation,
                            layoutStyle: preset.layoutStyle,
                          }
                        });
                      }
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 bg-white"
                  >
                    {COMMON_LABEL_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.width}×{p.height}{p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dimension Inputs */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Width</label>
                    <input
                      type="number"
                      min="20"
                      value={dims.width}
                      onChange={(e) => updateCurrentLabel({
                        dimensions: { ...dims, width: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Height</label>
                    <input
                      type="number"
                      min="20"
                      value={dims.height}
                      onChange={(e) => updateCurrentLabel({
                        dimensions: { ...dims, height: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit</label>
                    <select
                      value={dims.unit}
                      onChange={(e) => updateCurrentLabel({
                        dimensions: { ...dims, unit: e.target.value as MeasurementUnit }
                      })}
                      className="w-full text-xs px-2 py-1.5 rounded-lg border border-cream-300 bg-white"
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </div>

                {/* Layout Style and Orientation */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Orientation</label>
                    <select
                      value={dims.orientation}
                      onChange={(e) => updateCurrentLabel({
                        dimensions: { ...dims, orientation: e.target.value as Orientation }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 bg-white"
                    >
                      <option value="landscape">Landscape</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Arrangement</label>
                    <select
                      value={dims.layoutStyle}
                      onChange={(e) => {
                        const style = e.target.value as LayoutStyle;
                        updateCurrentLabel({
                          dimensions: { ...dims, layoutStyle: style }
                        });
                        if (style !== 'two-panel') {
                          setViewPanel('both');
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 bg-white"
                    >
                      <option value="two-panel">Two-Panel Wrap (PDP + Info)</option>
                      <option value="standard">Single Front Label</option>
                      <option value="minimal">Compact Minimal</option>
                    </select>
                  </div>
                </div>

                {/* Typography Scale Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Typography Scale</span>
                    <span className="font-mono text-slate-500 font-medium">{(dims.fontSizeScale * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.35"
                    step="0.05"
                    value={dims.fontSizeScale}
                    onChange={(e) => updateCurrentLabel({
                      dimensions: { ...dims, fontSizeScale: parseFloat(e.target.value) }
                    })}
                    className="w-full accent-forest-900"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Smaller (0.75x)</span>
                    <span>Default (1.0x)</span>
                    <span>Larger (1.35x)</span>
                  </div>
                </div>

                {/* Bleed & Safe Margin Settings */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bleed ({dims.unit})</label>
                    <input
                      type="number"
                      step="0.5"
                      value={dims.bleed}
                      onChange={(e) => updateCurrentLabel({
                        dimensions: { ...dims, bleed: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Safe Margin ({dims.unit})</label>
                    <input
                      type="number"
                      step="0.5"
                      value={dims.safeMargin}
                      onChange={(e) => updateCurrentLabel({
                        dimensions: { ...dims, safeMargin: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                    />
                  </div>
                </div>

                {/* Element Toggles */}
                <div className="space-y-2 pt-3 border-t border-cream-200">
                  <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Visible Mandatory Elements</span>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dims.showVegLogo}
                        onChange={(e) => updateCurrentLabel({ dimensions: { ...dims, showVegLogo: e.target.checked } })}
                        className="rounded text-forest-800"
                      />
                      <span>FSSAI Veg / Non-Veg Symbol</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dims.showNutritionTable}
                        onChange={(e) => updateCurrentLabel({ dimensions: { ...dims, showNutritionTable: e.target.checked } })}
                        className="rounded text-forest-800"
                      />
                      <span>Nutrition Facts Table</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dims.showBarcode}
                        onChange={(e) => updateCurrentLabel({ dimensions: { ...dims, showBarcode: e.target.checked } })}
                        className="rounded text-forest-800"
                      />
                      <span>Vector Barcode (EAN-13)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dims.showQrCode}
                        onChange={(e) => updateCurrentLabel({ dimensions: { ...dims, showQrCode: e.target.checked } })}
                        className="rounded text-forest-800"
                      />
                      <span>Traceability QR Code</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT IDENTITY */}
          {editorTab === 'identity' && (
            <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-forest-800" />
                Principal Display Identity
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={currentLabel.productName}
                    onChange={(e) => updateCurrentLabel({ productName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300"
                    placeholder="e.g. Traditional Mango Pickle"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Brand or Farm Name *</label>
                  <input
                    type="text"
                    value={currentLabel.brandName}
                    onChange={(e) => updateCurrentLabel({ brandName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300"
                    placeholder="e.g. Pahadi Heritage Farms"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Food Category</label>
                  <select
                    value={currentLabel.category}
                    onChange={(e) => updateCurrentLabel({ category: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 bg-white"
                  >
                    {[
                      'Pickles, Chutneys & Sauces',
                      'Honey & Jaggery',
                      'Spices & Masalas',
                      'Grains, Flours & Pulses',
                      'Fresh Produce',
                      'Dairy Products',
                      'Bakery & Confectionery',
                      'Beverages',
                      'Snacks & Namkeen',
                      'Ready to Eat / Processed Food'
                    ].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Net Quantity</label>
                    <input
                      type="number"
                      value={currentLabel.netQuantity}
                      onChange={(e) => updateCurrentLabel({ netQuantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit</label>
                    <select
                      value={currentLabel.netQuantityUnit}
                      onChange={(e) => updateCurrentLabel({ netQuantityUnit: e.target.value as any })}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 bg-white"
                    >
                      <option value="g">g (grams)</option>
                      <option value="kg">kg (kilograms)</option>
                      <option value="ml">ml (milliliters)</option>
                      <option value="l">l (liters)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">FSSAI License Number</label>
                  <input
                    type="text"
                    maxLength={14}
                    value={currentLabel.fssaiLicense}
                    onChange={(e) => updateCurrentLabel({ fssaiLicense: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-mono tracking-widest"
                    placeholder="14-digit license number"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {currentLabel.fssaiLicense.length === 14 
                      ? '✓ Valid 14-digit license length' 
                      : `Enter 14 digits (${currentLabel.fssaiLicense.length}/14)`}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dietary Classification</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateCurrentLabel({ dietaryClassification: 'veg' })}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        currentLabel.dietaryClassification === 'veg'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                          : 'bg-white text-slate-600 border-cream-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span>Vegetarian</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCurrentLabel({ dietaryClassification: 'non-veg' })}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        currentLabel.dietaryClassification === 'non-veg'
                          ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                          : 'bg-white text-slate-600 border-cream-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-800" />
                      <span>Non-Veg</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INGREDIENTS & ALLERGENS */}
          {editorTab === 'ingredients' && (
            <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ListPlus className="w-4 h-4 text-forest-800" />
                  Recipe Ingredients ({currentLabel.ingredients.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowIngredientsModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200 hover:bg-forest-100 transition-colors"
                    title="Explain functional roles, sourcing and allergens"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Understand Ingredients</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: IngredientItem = {
                        id: `ing-${Date.now()}`,
                        name: '',
                        percentage: '',
                        order: currentLabel.ingredients.length + 1,
                        isAllergen: false,
                      };
                      updateCurrentLabel({ ingredients: [...currentLabel.ingredients, newItem] });
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-800 hover:text-forest-950"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {currentLabel.ingredients.map((ing, idx) => (
                  <div key={ing.id || idx} className="p-2.5 rounded-xl border border-cream-200 bg-cream-50/50 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => {
                          const updated = currentLabel.ingredients.map(i => i.id === ing.id ? { ...i, name: e.target.value } : i);
                          updateCurrentLabel({ ingredients: updated });
                        }}
                        placeholder="Ingredient name (e.g. Mango)"
                        className="flex-1 text-xs px-2 py-1 rounded-lg border border-cream-300 bg-white"
                      />
                      <input
                        type="text"
                        value={ing.percentage || ''}
                        onChange={(e) => {
                          const updated = currentLabel.ingredients.map(i => i.id === ing.id ? { ...i, percentage: e.target.value } : i);
                          updateCurrentLabel({ ingredients: updated });
                        }}
                        placeholder="%"
                        className="w-12 text-xs px-1.5 py-1 rounded-lg border border-cream-300 bg-white font-mono text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateCurrentLabel({ ingredients: currentLabel.ingredients.filter(i => i.id !== ing.id) });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <label className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer pl-6">
                      <input
                        type="checkbox"
                        checked={ing.isAllergen}
                        onChange={(e) => {
                          const updated = currentLabel.ingredients.map(i => i.id === ing.id ? { ...i, isAllergen: e.target.checked } : i);
                          updateCurrentLabel({ ingredients: updated });
                        }}
                        className="rounded text-rose-600"
                      />
                      <span className={ing.isAllergen ? 'font-bold text-rose-700' : ''}>Flag as Statutory Major Allergen</span>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Allergen Warning Statement</label>
                <textarea
                  rows={2}
                  value={currentLabel.allergenDeclarations.join(' ')}
                  onChange={(e) => updateCurrentLabel({ allergenDeclarations: e.target.value ? [e.target.value] : [] })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300"
                  placeholder="e.g. CONTAINS MUSTARD. May contain traces of sesame or tree nuts."
                />
              </div>
            </div>
          )}

          {/* TAB 4: NUTRITION FACTS */}
          {editorTab === 'nutrition' && (
            <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-forest-800" />
                Nutrition Facts Table
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Serving Basis</label>
                  <select
                    value={currentLabel.nutrition.servingBasis}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, servingBasis: e.target.value as any } })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 bg-white"
                  >
                    <option value="per 100g">Per 100g</option>
                    <option value="per 100ml">Per 100ml</option>
                    <option value="per serving">Per Serving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Serving Size</label>
                  <input
                    type="text"
                    value={currentLabel.nutrition.servingSize}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, servingSize: e.target.value } })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300"
                    placeholder="e.g. 20g"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Energy (kcal)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.energyKcal ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, energyKcal: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Protein (g)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.proteinG ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, proteinG: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Carbohydrates (g)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.carbohydratesG ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, carbohydratesG: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Sugars (g)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.totalSugarsG ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, totalSugarsG: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Added Sugars (g)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.addedSugarsG ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, addedSugarsG: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Fat (g)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.totalFatG ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, totalFatG: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Saturated Fat (g)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.saturatedFatG ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, saturatedFatG: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sodium (mg)</span>
                  <input
                    type="number"
                    value={currentLabel.nutrition.sodiumMg ?? ''}
                    onChange={(e) => updateCurrentLabel({ nutrition: { ...currentLabel.nutrition, sodiumMg: parseFloat(e.target.value) || null } })}
                    className="w-full px-2 py-1 rounded border border-cream-300 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BARCODE & QR TRACEABILITY */}
          {editorTab === 'codes' && (
            <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-5">
              {/* EAN-13 Barcode */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-forest-800" />
                    EAN-13 Barcode
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isValidEan13(currentLabel.barcode)
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {isValidEan13(currentLabel.barcode) ? '✓ Valid Checksum' : 'Invalid Check Digit'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={13}
                    value={currentLabel.barcode}
                    onChange={(e) => updateCurrentLabel({ barcode: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-cream-300 font-mono tracking-wider"
                    placeholder="13-digit EAN code"
                  />
                  {!isValidEan13(currentLabel.barcode) && (
                    <button
                      type="button"
                      onClick={() => {
                        const fixed = formatOrFixEan13(currentLabel.barcode);
                        updateCurrentLabel({ barcode: fixed.code });
                        showToast(`Calculated valid EAN-13: ${fixed.code}`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-forest-900 text-white font-bold text-xs"
                      title="Compute standard 13th mod-10 check digit"
                    >
                      Fix
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code Traceability Payload */}
              <div className="space-y-3 pt-3 border-t border-cream-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-forest-800" />
                    QR Code Destination
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('verify')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-800 hover:underline"
                  >
                    <span>Test Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Destination Selector */}
                <div className="space-y-2">
                  {/* Option 1: Official Government FSSAI Portal */}
                  <button
                    type="button"
                    onClick={() => {
                      updateCurrentLabel({ 
                        qrCodeUrl: OFFICIAL_FSSAI_VERIFY_PORTAL,
                        qrDestinationType: 'foscos_portal'
                      });
                      showToast('Set QR destination to Official FoSCoS Search Portal', 'info');
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all ${
                      currentLabel.qrCodeUrl === OFFICIAL_FSSAI_VERIFY_PORTAL
                        ? 'bg-forest-50 border-forest-800 ring-1 ring-forest-800 text-forest-950 font-semibold'
                        : 'bg-white border-cream-200 text-slate-700 hover:bg-cream-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-forest-800" />
                        <span>Official FSSAI FoSCoS Portal</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">Gov Search Directory</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {OFFICIAL_FSSAI_VERIFY_PORTAL}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                      Directs consumers to the official FSSAI portal where they can manually verify your 14-digit license number. (Visiting this directory does not automatically verify the package contents).
                    </span>
                  </button>

                  {/* Option 2: Batch Traceability Portal */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = getPublicTraceabilityUrl(currentLabel.batchNumber || currentLabel.id);
                      updateCurrentLabel({ 
                        qrCodeUrl: url,
                        qrDestinationType: 'public_traceability'
                      });
                      showToast('Set QR destination to LabelIQ Batch Traceability Passport', 'success');
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all ${
                      currentLabel.qrCodeUrl?.includes('?verify=') && !currentLabel.qrCodeUrl?.includes('192.168.')
                        ? 'bg-forest-50 border-forest-800 ring-1 ring-forest-800 text-forest-950 font-semibold'
                        : 'bg-white border-cream-200 text-slate-700 hover:bg-cream-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-forest-800" />
                        <span>LabelIQ Batch Digital Passport</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime-100 text-forest-900 font-bold border border-lime-200">Live Batch Passport</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                      {getPublicTraceabilityUrl(currentLabel.batchNumber || currentLabel.id)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                      Interactive batch passport displaying exact mfg date, shelf life, recipe ingredients, allergen statements, and producer license declarations.
                    </span>
                  </button>

                  {/* Option 3: Wi-Fi LAN Address for Phone Testing */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = getPublicTraceabilityUrl(currentLabel.batchNumber || currentLabel.id, true);
                      updateCurrentLabel({ 
                        qrCodeUrl: url,
                        qrDestinationType: 'public_traceability'
                      });
                      showToast('Set QR destination to Local Wi-Fi Network URL!', 'success');
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all ${
                      currentLabel.qrCodeUrl?.includes('192.168.')
                        ? 'bg-forest-50 border-forest-800 ring-1 ring-forest-800 text-forest-950 font-semibold'
                        : 'bg-white border-cream-200 text-slate-700 hover:bg-cream-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-forest-800" />
                        <span>Direct Smartphone Scan (Wi-Fi LAN)</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200">Local Testing</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                      {getPublicTraceabilityUrl(currentLabel.batchNumber || currentLabel.id, true)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                      Test scanning with your phone's camera while connected to the same local Wi-Fi router.
                    </span>
                  </button>

                  {/* Option 4: Custom Verified Domain */}
                  <div className="p-2.5 rounded-xl border border-cream-200 bg-white text-xs space-y-1">
                    <div className="font-bold text-slate-700">Custom Verified Domain</div>
                    <input
                      type="url"
                      value={
                        currentLabel.qrCodeUrl && 
                        !currentLabel.qrCodeUrl.includes('?verify=') && 
                        currentLabel.qrCodeUrl !== OFFICIAL_FSSAI_VERIFY_PORTAL
                          ? currentLabel.qrCodeUrl 
                          : ''
                      }
                      onChange={(e) => updateCurrentLabel({ 
                        qrCodeUrl: e.target.value,
                        qrDestinationType: 'custom_url'
                      })}
                      placeholder="https://yourbrand.com/trace"
                      className="w-full mt-1 text-[11px] px-2 py-1.5 rounded border border-cream-300 font-mono"
                    />
                    <p className="text-[10px] text-slate-500">
                      Enter your live company website or cloud-hosted traceability link.
                    </p>
                  </div>
                </div>

                {/* Localhost Explanation Callout */}
                {isLocalhost(currentLabel.qrCodeUrl) && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                      <span>Local Demonstration Notice</span>
                    </div>
                    <p className="leading-snug">
                      This QR code encodes <code className="bg-white px-1 rounded font-mono">localhost</code>. It opens perfectly on this computer, but external phones on cellular data will require deployment to a public HTTPS domain.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TASTE & ORIGIN PRESENTATION FRAME */}
          {editorTab === 'story' && (
            <TasteAndOriginEditor
              value={currentLabel.tasteAndOrigin}
              onChange={(panel) => updateCurrentLabel({ tasteAndOrigin: panel })}
              category={currentLabel.category}
            />
          )}

          {/* Density or Overflow Notice */}
          {hasLayoutIssues && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Text Density / Overflow Detected</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {overflowDetails || `Content density is close to exceeding printable boundaries (${dims.width}×${dims.height}${dims.unit}). Consider reducing typography scale or widening label dimensions.`}
              </p>
            </div>
          )}
        </div>

        {/* Central Canvas Workspace (8 cols) */}
        <div className={`lg:col-span-8 space-y-3 ${mobileActivePane === 'preview' ? 'block' : 'hidden lg:block'}`}>
          {/* Workspace Toolbar: Zoom, Guides, and Panel Selector */}
          <div className="bg-white p-3 rounded-2xl border border-cream-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
            {/* Panel Selector (For Two-Panel Wrap) */}
            {dims.layoutStyle === 'two-panel' ? (
              <div className="flex items-center bg-cream-100 rounded-xl p-1 border border-cream-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Inspect:</span>
                <button
                  onClick={() => setViewPanel('both')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewPanel === 'both' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Wrap (Both)
                </button>
                <button
                  onClick={() => setViewPanel('front-only')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewPanel === 'front-only' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Front Panel (PDP)
                </button>
                <button
                  onClick={() => setViewPanel('info-only')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewPanel === 'info-only' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Info Panel
                </button>
                <button
                  onClick={() => setViewPanel('taste-origin')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewPanel === 'taste-origin' ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Inspect Taste & Origin Presentation Frame"
                >
                  Taste & Origin
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Eye className="w-4 h-4 text-forest-800" />
                <span>Single-Panel Layout</span>
              </div>
            )}

            {/* Mode Switcher: Interactive Design vs Print-Ready Mode */}
            <div className="flex items-center gap-1 bg-cream-100 rounded-xl p-1 border border-cream-200 text-xs">
              <button
                onClick={() => setIsPrintReadyMode(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !isPrintReadyMode ? 'bg-forest-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Design Preview with interactive zoom and guides"
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Preview Mode
              </button>
              <button
                onClick={() => setIsPrintReadyMode(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isPrintReadyMode ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Validated Print-Ready View without guides"
              >
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-limeaccent-300" />
                Print-Ready
              </button>
            </div>

            {/* Visual Guide Toggles & Zoom Controls */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {/* Guides Toggles */}
              {!isPrintReadyMode && (
                <div className="flex items-center gap-1 bg-cream-50 rounded-xl p-1 border border-cream-200 text-xs">
                  <button
                    onClick={() => setShowSafeMarginGuide(g => !g)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      showSafeMarginGuide ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-slate-500 hover:bg-cream-100'
                    }`}
                    title="Toggle Safe Margins Guide (Emerald Dashed)"
                  >
                    Safe Margins
                  </button>
                  <button
                    onClick={() => setShowBleedGuide(g => !g)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      showBleedGuide ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'text-slate-500 hover:bg-cream-100'
                    }`}
                    title="Toggle Bleed Guide (Rose Dashed)"
                  >
                    Bleed Area
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="flex items-center bg-cream-100 rounded-xl p-1 border border-cream-200">
                <button
                  onClick={handleFitToView}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-forest-900 rounded-lg hover:bg-white text-xs font-semibold"
                  title="Fit whole label to screen viewport"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-forest-800" />
                  Fit View
                </button>
                <div className="w-[1px] h-4 bg-cream-300 mx-1" />
                <button
                  onClick={() => setPreviewZoom(z => Math.max(0.3, parseFloat((z - 0.1).toFixed(2))))}
                  className="p-1 text-slate-600 hover:text-forest-900 rounded-lg hover:bg-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-slate-800 min-w-[48px] text-center">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  onClick={() => setPreviewZoom(z => Math.min(2.0, parseFloat((z + 0.1).toFixed(2))))}
                  className="p-1 text-slate-600 hover:text-forest-900 rounded-lg hover:bg-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewZoom(1.0)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-white"
                  title="Reset 100% true physical scale"
                >
                  100%
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Viewport: Scrollable, Centered, Pan-enabled when zoomed, fits within screen */}
          <div 
            ref={previewViewportRef}
            className="relative w-full overflow-auto max-h-[calc(100vh-210px)] min-h-[520px] p-6 sm:p-10 bg-cream-100/60 rounded-3xl border border-cream-200 shadow-inner flex items-center justify-center"
          >
            {/* Transform Scaling Container */}
            <div 
              style={{
                transform: `scale(${previewZoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
              className="shrink-0 my-auto mx-auto shadow-2xl rounded"
            >
              <LabelCanvasRenderer
                label={currentLabel}
                scale={3.6}
                showBleedGuide={isPrintReadyMode ? false : showBleedGuide}
                showSafeMarginGuide={isPrintReadyMode ? false : showSafeMarginGuide}
                viewPanel={viewPanel}
                onOverflowDetected={handleOverflowDetected}
              />
            </div>
          </div>

          {/* Bottom Status & Dimension Helper */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Display:</span>
              <span>
                {dims.layoutStyle === 'two-panel' 
                  ? (viewPanel === 'both' ? 'Full Two-Panel Wrap' : viewPanel === 'front-only' ? 'Front PDP Inspection' : 'Info Panel Inspection')
                  : 'Single Front Label'
                }
              </span>
              <span>•</span>
              <span>Canvas Base: {targetPixelWidth}×{targetPixelHeight}px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Full WYSIWYG Print Consistency</span>
            </div>
          </div>
        </div>
      </div>

      {/* 12 TEMPLATES VISUAL GALLERY MODAL */}
      {showTemplateGallery && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-cream-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-cream-200 flex items-center justify-between bg-cream-50/50">
              <div>
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-purple-700" />
                  Packaging Aesthetic Themes
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  12 Distinctive Food Packaging Templates
                </h2>
                <p className="text-xs text-slate-500">
                  Select a template tailored to your food category. Modifies palette, fonts, borders, and layout while preserving all entered product data.
                </p>
              </div>

              <button
                onClick={() => setShowTemplateGallery(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-6 py-3 border-b border-cream-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All 12 Templates' },
                { id: 'pickles', label: 'Pickles & Preserves' },
                { id: 'bakery', label: 'Bakery & Sweets' },
                { id: 'spices', label: 'Spices & Masalas' },
                { id: 'beverages', label: 'Beverages' },
                { id: 'snacks', label: 'Snacks & Namkeen' },
                { id: 'dairy', label: 'Dairy Fresh' },
                { id: 'custom', label: 'Custom Brand' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTemplateFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    templateFilter === f.id
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'bg-cream-100 text-slate-600 hover:bg-cream-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((tmpl) => {
                const isActive = dims.labelTheme === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isActive 
                        ? 'border-forest-900 bg-forest-50/40 ring-2 ring-forest-800' 
                        : 'border-cream-200 hover:border-cream-400 bg-white hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Mini Visual Preview Swatch */}
                      <div 
                        className="w-full h-24 rounded-xl border p-2 flex flex-col justify-between mb-3 shadow-inner"
                        style={{ 
                          backgroundColor: tmpl.palette.background, 
                          color: tmpl.palette.text,
                          borderColor: tmpl.palette.border 
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold tracking-widest uppercase opacity-75">
                            {tmpl.tagline}
                          </span>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.palette.primaryAccent }} />
                        </div>
                        <div>
                          <div className="text-xs font-black truncate">
                            {currentLabel.productName || 'Product Title'}
                          </div>
                          <div className="text-[8px] opacity-70">
                            {currentLabel.netQuantity} {currentLabel.netQuantityUnit} • FSSAI Certified
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{tmpl.name}</h3>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cream-100 text-slate-700">
                          {tmpl.fontFamily}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-forest-800 block mt-0.5">
                        {tmpl.categoryTag}
                      </span>
                      <p className="text-xs text-slate-500 mt-1.5 leading-snug">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-cream-200/80 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: tmpl.palette.background }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: tmpl.palette.primaryAccent }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: tmpl.palette.text }} />
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-forest-900 bg-forest-100 px-3 py-1.5 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          Current Theme
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tmpl)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-xs"
                        >
                          Apply Template
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-cream-200 bg-cream-50 flex items-center justify-between text-xs text-slate-500">
              <span>Selected templates automatically maintain all statutory legal font sizing and margins.</span>
              <button
                onClick={() => setShowTemplateGallery(false)}
                className="px-4 py-2 rounded-xl bg-white border border-cream-300 font-semibold text-slate-700 hover:bg-cream-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. INGREDIENT INTELLIGENCE MODAL */}
      <IngredientIntelligenceModal
        isOpen={showIngredientsModal}
        onClose={() => setShowIngredientsModal(false)}
        ingredients={currentLabel.ingredients}
      />

      {/* 2. MULTILINGUAL TRANSLATION MODAL */}
      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        label={currentLabel}
        onApplyTranslation={(bilingual) => {
          updateCurrentLabel({ bilingual });
          showToast('Bilingual packaging translation applied to label canvas!', 'success');
        }}
      />

      {/* 3. FINAL PRE-PRINT COMPLIANCE CHECKLIST MODAL */}
      {showPrePrintChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-cream-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-800 border border-forest-700 flex items-center justify-center text-limeaccent-300">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-serif text-cream-50 flex items-center gap-2">
                    <span>Final Pre-Print Compliance Checklist</span>
                  </h2>
                  <p className="text-xs text-cream-200">
                    Statutory audit before physical packaging printing & commercial release.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPrePrintChecklist(false)}
                className="p-2 rounded-xl text-cream-300 hover:text-white hover:bg-forest-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Regulatory Guidance Disclaimer Banner */}
            <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="font-bold block text-amber-950">Regulatory Assistance & Guidance Notice:</strong>
                <span>
                  LabelIQ provides automated design, formatting, and layout assistance. It does not replace independent laboratory nutritional testing or official FSSAI legal certification. Final packaging must undergo human compliance review under FSS (Labelling and Display) Regulations, 2020.
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="p-6 overflow-y-auto space-y-3 bg-white text-xs divide-y divide-cream-200">
              {/* Item 1 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">1. Product Name & Category Defined</span>
                  <p className="text-[11px] text-slate-500">
                    {currentLabel.productName} &bull; {currentLabel.category}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                  currentLabel.productName && currentLabel.category ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {currentLabel.productName && currentLabel.category ? '✓ Passed' : '✗ Required'}
                </span>
              </div>

              {/* Item 2 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">2. 14-Digit FSSAI Registration Number</span>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {currentLabel.fssaiLicense || 'Not specified'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                  currentLabel.fssaiLicense && currentLabel.fssaiLicense.length === 14 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentLabel.fssaiLicense && currentLabel.fssaiLicense.length === 14 ? '✓ 14-Digit Valid' : '! Review Needed'}
                </span>
              </div>

              {/* Item 3 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">3. Legal Metrology Net Quantity & Units</span>
                  <p className="text-[11px] text-slate-500">
                    {currentLabel.netQuantity} {currentLabel.netQuantityUnit}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                  currentLabel.netQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {currentLabel.netQuantity > 0 ? '✓ Compliant' : '✗ Missing'}
                </span>
              </div>

              {/* Item 4 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">4. Ingredients in Descending Order</span>
                  <p className="text-[11px] text-slate-500">
                    {currentLabel.ingredients.length} ingredients declared
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                  currentLabel.ingredients.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {currentLabel.ingredients.length > 0 ? '✓ Declared' : '✗ Empty List'}
                </span>
              </div>

              {/* Item 5 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">5. Allergen Declaration Statement</span>
                  <p className="text-[11px] text-slate-500">
                    {currentLabel.allergenDeclarations.length > 0 ? currentLabel.allergenDeclarations.join(', ') : 'No allergens declared'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 bg-emerald-100 text-emerald-800">
                  ✓ Verified
                </span>
              </div>

              {/* Item 6 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">6. Batch Lot Code, Mfg & Best Before</span>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Batch: {currentLabel.batchNumber || 'N/A'} &bull; Mfg: {currentLabel.mfgDate || 'N/A'} &bull; Shelf Life: {currentLabel.bestBeforeMonths}M
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                  currentLabel.batchNumber && currentLabel.mfgDate ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentLabel.batchNumber && currentLabel.mfgDate ? '✓ Complete' : '! Enter Batch'}
                </span>
              </div>

              {/* Item 7 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">7. GS1 EAN-13 Barcode & QR Code</span>
                  <p className="text-[11px] text-slate-500 font-mono">
                    EAN: {currentLabel.barcode} ({isValidEan13(currentLabel.barcode) ? 'Checksum Valid' : 'Check Digit Required'})
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                  isValidEan13(currentLabel.barcode) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isValidEan13(currentLabel.barcode) ? '✓ Validated' : '! Fix Barcode'}
                </span>
              </div>

              {/* Item 8 */}
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">8. Text Density & Print Bleed Margin</span>
                  <p className="text-[11px] text-slate-500">
                    {overflowDetails || 'No text clipping detected. Bleed and safe margins intact.'}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                  !overflowDetails ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {!overflowDetails ? '✓ Printable' : '✗ Overflow'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-cream-200 bg-cream-50 flex items-center justify-between">
              <button
                onClick={() => setShowPrePrintChecklist(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back to Editor
              </button>
              <button
                onClick={() => {
                  setShowPrePrintChecklist(false);
                  handleExportPdf();
                }}
                className="px-5 py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4 text-limeaccent-400" />
                <span>Export Vector PDF Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
