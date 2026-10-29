import React, { useState } from 'react';
import { useLabel, NavTab } from '../context/LabelContext';
import { 
  Sparkles, 
  Scan, 
  PenTool, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Package, 
  Layers, 
  ChefHat, 
  Info, 
  Download, 
  Wheat, 
  Eye,
  QrCode,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Edit3,
  Copy,
  Trash2,
  Tag,
  MessageSquare,
  Send,
  X,
  FileText,
  Sliders,
  Check,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { QrCodeSvg } from '../utils/barcodeGenerator';
import { OFFICIAL_FSSAI_VERIFY_PORTAL } from '../utils/batchUtils';

export const HomePage: React.FC = () => {
  const { 
    setActiveTab, 
    resetToDemo, 
    createNewBlankLabel, 
    batches, 
    updateCurrentLabel,
    savedProducts,
    loadProduct,
    duplicateProduct,
    deleteProduct,
    renameProduct,
    showToast,
    currentLabel,
    isDirty
  } = useLabel();
  const [demoLoading, setDemoLoading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'ocr_scan' | 'ai_draft' | 'layout_editor' | 'other'>('ocr_scan');

  const handleLaunchSample = async (type: 'pickle' | 'honey' | 'turmeric') => {
    setDemoLoading(true);
    try {
      if (type === 'pickle') {
        await resetToDemo();
      } else if (type === 'honey') {
        updateCurrentLabel({
          productName: 'Raw Wildflower Forest Honey',
          brandName: 'Pahadi Heritage Foods',
          brandQuote: 'Pure 100% Unprocessed Himalayan Forest Nectar',
          category: 'Honey & Jaggery',
          netQuantity: 250,
          netQuantityUnit: 'g',
          fssaiLicense: '10019022009841',
          dietaryClassification: 'veg',
          isSingleIngredientProduce: true,
          bestBeforePeriod: '12 Months from Packing',
          ingredients: [{ id: 'ing-h1', name: 'Raw Unprocessed Forest Honey', percentage: '100%', order: 1, isAllergen: false }],
          allergenDeclarations: [],
          nutrition: {
            servingBasis: 'per 100g',
            servingSize: '20g',
            energyKcal: 320,
            proteinG: 0.3,
            carbohydratesG: 82.0,
            totalSugarsG: 80.0,
            addedSugarsG: 0.0,
            totalFatG: 0.0,
            saturatedFatG: 0.0,
            transFatG: 0.0,
            cholesterolMg: 0.0,
            sodiumMg: 4.0,
          },
          batchNumber: 'HK-BATCH-2026-H05',
          mfgDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-10-25',
          storageInstructions: 'Store at room temperature in a dry place. Do not refrigerate. Non-pasteurized honey may naturally crystallize.',
          dimensions: {
            width: 80,
            height: 110,
            unit: 'mm',
            orientation: 'portrait',
            bleed: 2,
            safeMargin: 3,
            layoutStyle: 'standard',
            fontSizeScale: 1.0,
            showBarcode: true,
            showQrCode: true,
            showVegLogo: true,
            showNutritionTable: true,
            showBilingualTitles: false,
            labelTheme: 'organic-inspired',
            textAlign: 'left',
            borderRadiusMm: 3
          }
        });
      } else if (type === 'turmeric') {
        updateCurrentLabel({
          productName: 'Lakadong High-Curcumin Turmeric',
          brandName: 'Khasi Heritage Botanicals',
          brandQuote: 'Single-Origin 7.5%+ Natural Curcumin Spices',
          category: 'Spices & Masalas',
          netQuantity: 250,
          netQuantityUnit: 'g',
          fssaiLicense: '10019022009841',
          dietaryClassification: 'veg',
          isSingleIngredientProduce: true,
          bestBeforePeriod: '18 Months from Manufacture',
          ingredients: [{ id: 'ing-t1', name: 'Pure Lakadong Turmeric Powder', percentage: '100%', order: 1, isAllergen: false }],
          allergenDeclarations: [],
          nutrition: {
            servingBasis: 'per 100g',
            servingSize: '5g',
            energyKcal: 354,
            proteinG: 7.8,
            carbohydratesG: 64.9,
            totalSugarsG: 3.2,
            addedSugarsG: 0.0,
            totalFatG: 9.9,
            saturatedFatG: 3.1,
            transFatG: 0.0,
            cholesterolMg: 0.0,
            sodiumMg: 38.0,
          },
          batchNumber: 'HK-BATCH-2026-T12',
          mfgDate: new Date().toISOString().split('T')[0],
          expiryDate: '2028-04-25',
          storageInstructions: 'Store in an airtight container away from direct sunlight.',
          dimensions: {
            width: 100,
            height: 140,
            unit: 'mm',
            orientation: 'portrait',
            bleed: 2,
            safeMargin: 3,
            layoutStyle: 'standard',
            fontSizeScale: 1.0,
            showBarcode: true,
            showQrCode: true,
            showVegLogo: true,
            showNutritionTable: true,
            showBilingualTitles: false,
            labelTheme: 'spice-market',
            textAlign: 'left',
            borderRadiusMm: 3
          }
        });
      }
      showToast('Loaded demo product with authentic packaging details!', 'success');
      setActiveTab('editor');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCreateManually = () => {
    if (isDirty && currentLabel.productName && !currentLabel.isDemoSample) {
      if (!window.confirm('You have unsaved changes in your active packaging draft. Starting a new blank label will reset your progress. Are you sure you want to proceed?')) {
        return;
      }
    }
    createNewBlankLabel();
    setActiveTab('create');
  };

  const handleStartMethod = (tab: NavTab) => {
    if (isDirty && currentLabel.productName && !currentLabel.isDemoSample) {
      if (!window.confirm('You have unsaved changes in your active packaging draft. Leaving this section may discard your current progress. Are you sure you want to proceed?')) {
        return;
      }
    }
    setActiveTab(tab);
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* 1. WELCOMING COMPACT DASHBOARD HEADER */}
      <section className="bg-forest-950 text-white rounded-3xl p-6 sm:p-8 border border-forest-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-limeaccent-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 border border-forest-700 text-limeaccent-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-limeaccent-400" />
              <span>AI-Assisted Food Packaging Studio</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-serif">
              Create your food label
            </h1>
            
            <p className="text-sm sm:text-base text-cream-200/90 leading-relaxed font-normal">
              Upload a label or tell us about your product. We'll help you prepare a printable design with zero design or legal background required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleLaunchSample('pickle')}
              disabled={demoLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-850 text-limeaccent-300 font-bold text-xs border border-forest-700 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Instantly explore live editor with pre-loaded demo label"
            >
              <ChefHat className="w-4 h-4 text-limeaccent-400" />
              <span>Load Demo Pickle</span>
            </button>
            <button
              onClick={handleCreateManually}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-limeaccent-400 hover:bg-limeaccent-300 text-forest-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <PenTool className="w-4 h-4 text-forest-950" />
              <span>+ New Blank Label</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. THREE PRIMARY STARTING CARDS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-forest-800" />
            <span>Choose Your Starting Method</span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">Pick any option to begin your packaging journey</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* OPTION 1 — SCAN AN EXISTING LABEL */}
          <div 
            onClick={() => handleStartMethod('scanner')}
            className="group p-6 rounded-3xl bg-white border-2 border-cream-200 hover:border-forest-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-forest-900 text-limeaccent-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <Scan className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-forest-50 text-forest-800 border border-forest-200 uppercase tracking-wider">
                  Camera / File Upload
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-forest-900 transition-colors">
                  Option 1 — Scan an existing label
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Ideal for Home Kitchens & Artisan Makers. Upload a food package photo or PDF. AI will extract ingredients, allergens, dates, and nutrition facts for your review.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cream-50/80 border border-cream-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-forest-900">
                  <Check className="w-3.5 h-3.5 text-forest-800" />
                  <span>JPG, PNG, WebP or PDF (up to 10MB)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-forest-900">
                  <Check className="w-3.5 h-3.5 text-forest-800" />
                  <span>Separates multiple supplement panels</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-forest-800"
            >
              <span>Upload and scan</span>
              <ArrowRight className="w-3.5 h-3.5 text-limeaccent-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* OPTION 2 — CREATE WITH AI */}
          <div 
            onClick={() => handleStartMethod('ai-draft')}
            className="group p-6 rounded-3xl bg-white border-2 border-cream-200 hover:border-forest-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-limeaccent-100/80 text-forest-900 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-forest-900" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-limeaccent-50 text-forest-900 border border-limeaccent-300 uppercase tracking-wider">
                  Everyday Language
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-forest-900 transition-colors">
                  Option 2 — Create with AI
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Tailored for Farmers & Farmer Producer Orgs (FPOs) and food creators. Describe your product in simple words. AI drafts ingredients, nutrition, allergen warnings, and packaging dimensions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-forest-50/70 border border-forest-100 text-xs text-forest-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Example Description:</span>
                <p className="text-[11px] italic text-forest-900 leading-snug">
                  "Homemade mango pickle made with raw mango, mustard oil, salt and spices."
                </p>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-forest-800"
            >
              <span>Describe my product</span>
              <ArrowRight className="w-3.5 h-3.5 text-limeaccent-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* OPTION 3 — START FROM SCRATCH */}
          <div 
            onClick={handleCreateManually}
            className="group p-6 rounded-3xl bg-white border-2 border-cream-200 hover:border-forest-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cream-100 text-slate-800 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <PenTool className="w-6 h-6 text-forest-800" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cream-100 text-slate-700 border border-cream-300 uppercase tracking-wider">
                  Step-by-Step
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-forest-900 transition-colors">
                  Option 3 — Start from scratch
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Open a guided 5-step form. We explain every field in plain English, with instant previews and pre-filled standard lab values.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cream-50/80 border border-cream-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-forest-900">
                  <Check className="w-3.5 h-3.5 text-forest-800" />
                  <span>Plain-language field guides</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-forest-900">
                  <Check className="w-3.5 h-3.5 text-forest-800" />
                  <span>1-click FSSAI FoSCoS Auto-Extract</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-forest-800"
            >
              <span>Enter details manually</span>
              <ArrowRight className="w-3.5 h-3.5 text-limeaccent-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. QUICK 1-CLICK DEMO LOADERS */}
      <section className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-forest-800 shrink-0" />
          <span className="font-semibold text-slate-800">Need to see an authentic sample first?</span>
          <span className="text-slate-500 hidden md:inline">Load a completed label with ingredients, allergens, and FSSAI details:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleLaunchSample('pickle')}
            disabled={demoLoading}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-cream-50 text-slate-800 font-bold border border-cream-300 transition-all cursor-pointer shadow-2xs"
          >
            🥭 Mango Pickle (400g)
          </button>
          <button
            onClick={() => handleLaunchSample('honey')}
            disabled={demoLoading}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-cream-50 text-slate-800 font-bold border border-cream-300 transition-all cursor-pointer shadow-2xs"
          >
            🍯 Forest Honey (250g)
          </button>
          <button
            onClick={() => handleLaunchSample('turmeric')}
            disabled={demoLoading}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-cream-50 text-slate-800 font-bold border border-cream-300 transition-all cursor-pointer shadow-2xs"
          >
            🌿 Lakadong Turmeric (250g)
          </button>
        </div>
      </section>

      {/* 4. RECENT PACKAGING DRAFTS */}
      <section className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800">Your Work</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                {savedProducts.length} drafts
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif mt-0.5">
              Recent Packaging Drafts
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cream-300 text-slate-700 hover:bg-cream-100 text-xs font-semibold transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-forest-800" />
              <span>Feedback</span>
            </button>
            <button
              onClick={handleCreateManually}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <PenTool className="w-3.5 h-3.5 text-limeaccent-400" />
              <span>New Draft</span>
            </button>
          </div>
        </div>

        {/* Drafts List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProducts.map((p) => {
            const isEditingName = renamingId === p.id;
            const status = p.draftStatus || 'draft';
            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-cream-200 hover:border-forest-600 bg-cream-50/40 hover:bg-white transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      {p.dimensions.width}×{p.dimensions.height}{p.dimensions.unit}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {p.isDemoSample && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          DEMO
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        status === 'print_ready'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : status === 'in_review'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {status === 'print_ready' ? '🟢 Print-Ready' : status === 'in_review' ? '🔍 In Review' : '📝 Draft'}
                      </span>
                    </div>
                  </div>

                  {isEditingName ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-forest-600 bg-white flex-1 font-bold"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          renameProduct(p.id, renameValue);
                          setRenamingId(null);
                        }}
                        className="px-2 py-1 rounded bg-forest-900 text-white text-[10px] font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setRenamingId(null)}
                        className="px-2 py-1 rounded bg-cream-200 text-slate-700 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {p.productName || 'Untitled Label'}
                    </h4>
                  )}

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {p.brandName ? `${p.brandName} • ` : ''}{p.category} ({p.netQuantity}{p.netQuantityUnit})
                  </p>
                </div>

                <div className="pt-2 border-t border-cream-200/80 flex items-center justify-between gap-1">
                  <button
                    onClick={() => loadProduct(p.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-limeaccent-400" />
                    <span>Open Editor</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRenamingId(p.id);
                        setRenameValue(p.productName);
                      }}
                      className="p-1.5 rounded-lg border border-cream-300 text-slate-600 hover:bg-cream-100 hover:text-slate-900"
                      title="Rename label draft"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicateProduct(p.id)}
                      className="p-1.5 rounded-lg border border-cream-300 text-slate-600 hover:bg-cream-100 hover:text-slate-900"
                      title="Duplicate product draft"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete draft "${p.productName}"?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-cream-300 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MORE TOOLS & ADVANCED UTILITIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Advanced Tools & Utilities
          </h3>
          <span className="text-xs text-slate-400">Production, audit, and batch management</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => handleStartMethod('batches')}
            className="p-4 rounded-2xl bg-white border border-cream-200 hover:border-forest-600 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 font-bold">
                {batches.length} lots
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-xs group-hover:text-forest-900">
              Batch & Lot Management
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Assign lot numbers, manufacturing and expiry dates across production batches.
            </p>
          </div>

          <div 
            onClick={() => handleStartMethod('recommendations')}
            className="p-4 rounded-2xl bg-white border border-cream-200 hover:border-forest-600 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs group-hover:text-forest-900">
              Packaging Themes & Gallery
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Preview 12 design themes for glass jars, standup pouches, tins, and bottles.
            </p>
          </div>

          <div 
            onClick={() => handleStartMethod('verify')}
            className="p-4 rounded-2xl bg-white border border-cream-200 hover:border-forest-600 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs group-hover:text-forest-900">
              Public QR Traceability Portal
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Inspect what smartphone consumers see when scanning your printed QR code.
            </p>
          </div>

          <div 
            onClick={() => handleStartMethod('history')}
            className="p-4 rounded-2xl bg-white border border-cream-200 hover:border-forest-600 shadow-2xs hover:shadow-xs transition-all cursor-pointer group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs group-hover:text-forest-900">
              Audit Vault & Version History
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Review recipe revisions, date changes, and export history.
            </p>
          </div>
        </div>
      </section>

      {/* 6. REGULATORY DISCLAIMER */}
      <section className="rounded-2xl bg-cream-100/90 border border-cream-300 p-4 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-forest-800 shrink-0 mt-0.5" />
        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Regulatory Review Notice:</strong> LabelIQ assists food artisans and processors with packaging layouts, allergen identification, and statutory checklist formatting. AI and algorithmic tools assist with preparation; food business operators are responsible for verifying final packaging information against applicable food safety standards.
        </p>
      </section>

      {/* FEEDBACK MODAL */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-cream-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 bg-forest-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-limeaccent-400" />
                <h3 className="font-bold text-base font-serif">Report Issue or Scan Feedback</h3>
              </div>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1 rounded-lg text-cream-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Thank you! Your feedback and diagnostics report have been recorded.', 'success');
                setFeedbackModalOpen(false);
                setFeedbackText('');
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 text-xs bg-cream-50"
                >
                  <option value="ocr_scan">Camera / Tesseract OCR Failed Scan</option>
                  <option value="ai_draft">Gemini AI Formulation / Draft Error</option>
                  <option value="layout_editor">Canvas Layout / Font Clipping Issue</option>
                  <option value="other">General Feedback / Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Describe What Happened</label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Scanned an image and a field was missing. Or wanted to adjust a layout..."
                  className="w-full p-3 rounded-xl border border-cream-300 text-xs focus:ring-1 focus:ring-forest-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-900 text-white font-bold hover:bg-forest-800 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-limeaccent-400" />
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
