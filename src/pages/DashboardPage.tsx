import React from 'react';
import { useLabel } from '../context/LabelContext';
import { validateProductLabel } from '../utils/validationEngine';
import { 
  FileText, 
  Scan, 
  ShieldCheck, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Copy, 
  Trash2, 
  Eye, 
  Package, 
  Sparkles,
  GitCompare,
  Boxes,
  Cpu
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    currentLabel, 
    savedProducts, 
    batches,
    setActiveTab, 
    loadProduct, 
    duplicateProduct, 
    deleteProduct, 
    createNewBlankLabel,
    applyBatchToEditor,
    aiConnectionStatus 
  } = useLabel();

  // Run validation on the current label to show real-time stats
  const validationSummary = validateProductLabel(currentLabel);
  const passRate = Math.round((validationSummary.passedCount / (validationSummary.totalChecks || 1)) * 100);

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-800">
            <span className="w-2 h-2 rounded-full bg-limeaccent-500" />
            <span>Operations & Compliance Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif mt-1">
            Production Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Overview of product profiles, active packaging drafts, scheduled production batches, and statutory checks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('batches')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 font-bold text-xs border border-cream-300 transition-all active:scale-95"
          >
            <Package className="w-4 h-4 text-forest-800" />
            <span>Batches ({batches.length})</span>
          </button>

          <button
            onClick={createNewBlankLabel}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 text-limeaccent-400" />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* 4 Core Production Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Scheduled Batches */}
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Batches</span>
            <Package className="w-4 h-4 text-forest-800" />
          </div>
          <div className="text-2xl font-black text-slate-900">{batches.length}</div>
          <p className="text-[11px] text-slate-500">
            {batches.reduce((sum, b) => sum + (b.planned_units || 0), 0).toLocaleString()} total units planned
          </p>
        </div>

        {/* Metric 2: Compliance Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">FSSAI Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{passRate}%</span>
            <span className="text-xs text-slate-500">({validationSummary.passedCount}/{validationSummary.totalChecks} checks)</span>
          </div>
          <div className="w-full bg-cream-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${passRate}%` }} 
            />
          </div>
        </div>

        {/* Metric 3: Active Formulation */}
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Formulation</span>
            <GitCompare className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-base font-bold text-slate-900 truncate" title={currentLabel.productName}>
            {currentLabel.productName || 'Untitled Label'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-mono font-bold text-forest-800">v{currentLabel.version}.0</span>
            <span>&middot;</span>
            <span>{currentLabel.ingredients.length} ingredients</span>
          </div>
        </div>

        {/* Metric 4: AI & OCR Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Recognition Engine</span>
            <Cpu className="w-4 h-4 text-forest-800" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            {aiConnectionStatus?.status === 'live_authenticated' ? 'Vision AI + OCR' : 'Local OCR (Tesseract)'}
          </div>
          <p className="text-[11px] text-slate-500">
            {aiConnectionStatus?.status === 'live_authenticated' ? 'Multimodal visual analysis ready' : 'Local offline extraction active'}
          </p>
        </div>
      </div>

      {/* Production Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('batches')}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-forest-300 hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center group-hover:bg-forest-900 group-hover:text-limeaccent-400 transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Production Batches</h3>
          <p className="text-[11px] text-slate-500 leading-snug">
            Schedule lot codes, packaging sizes (200g, 400g, 1kg), and multi-label sheet print calculations.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-forest-300 hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-limeaccent-50 text-forest-800 flex items-center justify-center group-hover:bg-forest-900 group-hover:text-limeaccent-400 transition-colors">
            <Scan className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Scan Label Document</h3>
          <p className="text-[11px] text-slate-500 leading-snug">
            Upload packaging photographs or print proofs for dual-engine text & schema extraction.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-forest-300 hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center group-hover:bg-forest-900 group-hover:text-limeaccent-400 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Visual Label Canvas</h3>
          <p className="text-[11px] text-slate-500 leading-snug">
            True millimeter packaging canvas with safe margins, bleed guides, and scannable EAN/QR codes.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-forest-300 hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-forest-900 group-hover:text-limeaccent-400 transition-colors">
            <GitCompare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Recipe Diff & Audit</h3>
          <p className="text-[11px] text-slate-500 leading-snug">
            Compare recipe reformulations (e.g. sodium -35.7%) and review individual label section impacts.
          </p>
        </button>
      </div>

      {/* Recent Production Batches & Active Drafts Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Production Runs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-cream-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800">Live Production Runs</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Scheduled Batches</h2>
            </div>
            <button
              onClick={() => setActiveTab('batches')}
              className="text-xs font-bold text-forest-800 hover:underline"
            >
              View All Batches &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {batches.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-cream-200 bg-cream-50/40 hover:bg-cream-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{b.batch_number}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-slate-700 border border-cream-300">
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {b.product_name || currentLabel.productName} &middot; <span className="font-semibold">{b.planned_units} units</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Mfg: {b.mfg_date} | Exp: {b.expiry_date}
                  </div>
                </div>

                <button
                  onClick={() => applyBatchToEditor(b)}
                  className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-xs"
                >
                  Generate Label &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Product Profiles & Vault (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-cream-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800">Product Vault</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Saved Product Drafts</h2>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">{savedProducts.length} drafts</span>
          </div>

          <div className="space-y-3">
            {savedProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-cream-200 bg-white hover:border-forest-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{p.productName || 'Untitled Label'}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                    <span>{p.category}</span>
                    <span>&middot;</span>
                    <span className="font-mono">{p.dimensions.width}×{p.dimensions.height}{p.dimensions.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => loadProduct(p.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-forest-900 hover:bg-cream-100"
                    title="Open in editor"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateProduct(p.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-forest-900 hover:bg-cream-100"
                    title="Duplicate draft"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
