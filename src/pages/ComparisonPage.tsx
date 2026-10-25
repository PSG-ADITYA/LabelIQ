import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
import { compareRecipes } from '../utils/recipeDiff';
import { DEMO_PICKLE_V1, DEMO_PICKLE_V2 } from '../data/demoData';
import { ProductLabel } from '../types/label';
import { 
  GitCompare, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  RefreshCw, 
  ShieldAlert, 
  Layers, 
  ChefHat,
  Eye,
  Scale,
  CheckSquare,
  Square,
  Sparkles,
  Info
} from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const { savedProducts, updateCurrentLabel, setActiveTab, showToast, saveCurrentProduct } = useLabel();

  // Selected comparison targets (defaults to Demo V1 vs Demo V2)
  const [v1Id, setV1Id] = useState<string>(DEMO_PICKLE_V1.id);
  const [v2Id, setV2Id] = useState<string>(DEMO_PICKLE_V2.id);

  // Individual change approval states
  const [approvedChanges, setApprovedChanges] = useState<{
    ingredients: boolean;
    allergens: boolean;
    nutrition: boolean;
    batchAndDates: boolean;
  }>({
    ingredients: true,
    allergens: true,
    nutrition: true,
    batchAndDates: true,
  });

  // Retrieve products from saved list or fall back to demo
  const v1 = savedProducts.find(p => p.id === v1Id) || DEMO_PICKLE_V1;
  const v2 = savedProducts.find(p => p.id === v2Id) || DEMO_PICKLE_V2;

  const report = compareRecipes(v1, v2);

  // Toggle individual approval
  const toggleApproval = (key: keyof typeof approvedChanges) => {
    setApprovedChanges(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Explicit Action: Create New Label Version with Approved Changes
  const applyApprovedChangesToNewVersion = () => {
    const nextVersionNum = (v1.version || 1) + 1;
    
    // Create new version object strictly preserving unchanged baseline data
    const newVersionLabel: ProductLabel = {
      ...v1,
      id: `prod-v${nextVersionNum}-${Date.now()}`,
      version: nextVersionNum,
      productName: v1.productName.includes('(v') 
        ? v1.productName.replace(/\(v\d+\.?\d*\)/, `(v${nextVersionNum}.0)`)
        : `${v1.productName} (v${nextVersionNum}.0)`,
      
      // Selectively apply only approved sections
      ingredients: approvedChanges.ingredients ? [...v2.ingredients] : [...v1.ingredients],
      allergenDeclarations: approvedChanges.allergens ? [...v2.allergenDeclarations] : [...v1.allergenDeclarations],
      crossContactNotes: approvedChanges.allergens ? v2.crossContactNotes : v1.crossContactNotes,
      nutrition: approvedChanges.nutrition ? { ...v2.nutrition } : { ...v1.nutrition },
      batchNumber: approvedChanges.batchAndDates ? (v2.batchNumber || `HK-BATCH-V${nextVersionNum}`) : v1.batchNumber,
      mfgDate: approvedChanges.batchAndDates ? (v2.mfgDate || new Date().toISOString().split('T')[0]) : v1.mfgDate,
      expiryDate: approvedChanges.batchAndDates ? v2.expiryDate : v1.expiryDate,

      notes: `Generated from formulation diff: v${v1.version || 1}.0 -> v${nextVersionNum}.0. Approved updates: ${Object.entries(approvedChanges).filter(([_, v]) => v).map(([k]) => k).join(', ')}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoSample: false,
    };

    updateCurrentLabel(newVersionLabel);
    showToast(`Created New Label Version ${nextVersionNum}.0 with approved updates! Opening in Visual Editor...`, 'success');
    setActiveTab('editor');
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-100 text-purple-900">
              <GitCompare className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Formulation Diff & Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Recipe Comparison & Shift Audit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare earlier formulations against reformulated recipes. Detect allergen introductions, sodium shifts, and affected packaging panels.
          </p>
        </div>

        <button
          onClick={applyApprovedChangesToNewVersion}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-limeaccent-400" />
          Apply Approved Changes to New Version
        </button>
      </div>

      {/* Target Selector Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-cream-200 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Baseline Formulation (V1)
          </label>
          <select
            value={v1Id}
            onChange={(e) => setV1Id(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 font-medium"
          >
            {savedProducts.map(p => (
              <option key={p.id} value={p.id}>
                {p.productName} (v{p.version || 1}.0) - {p.netQuantity}{p.netQuantityUnit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Updated Recipe / Reformulation (V2)
          </label>
          <select
            value={v2Id}
            onChange={(e) => setV2Id(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 font-medium"
          >
            {savedProducts.map(p => (
              <option key={p.id} value={p.id}>
                {p.productName} (v{p.version || 1}.0) - {p.netQuantity}{p.netQuantityUnit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RECIPE-TO-LABEL IMPACT PANEL (CORE DIFFERENTIATOR) */}
      <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-900">
              <ChefHat className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recipe-to-Label Impact Review & Action Matrix</h2>
              <p className="text-xs text-slate-500">
                Review individual formulation impacts. Selectively approve which label sections to update in the new packaging version.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200">
            Baseline v{v1.version || 1}.0 &rarr; New Version {(v1.version || 1) + 1}.0
          </div>
        </div>

        {/* Impact Matrix List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item 1: Allergen Shift */}
          <div className={`p-4 rounded-xl border transition-all ${
            approvedChanges.allergens 
              ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300' 
              : 'bg-cream-50/30 border-cream-200 opacity-60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleApproval('allergens')}
                  className="mt-0.5 text-rose-800"
                >
                  {approvedChanges.allergens ? (
                    <CheckSquare className="w-5 h-5 text-rose-700" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">1. Allergen Statement Impact</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">CRITICAL</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    <strong>Detection:</strong> New ingredients (e.g. Sesame Oil) introduce statutory allergen classes requiring immediate declaration.
                  </p>
                  <p className="text-[11px] text-rose-900 font-semibold mt-1">
                    <strong>Action:</strong> Update packaging allergen box to bold statement: &quot;Contains Mustard and Sesame&quot;. Existing packaging stock cannot be reused.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: Nutritional Shifts */}
          <div className={`p-4 rounded-xl border transition-all ${
            approvedChanges.nutrition 
              ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300' 
              : 'bg-cream-50/30 border-cream-200 opacity-60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleApproval('nutrition')}
                  className="mt-0.5 text-amber-800"
                >
                  {approvedChanges.nutrition ? (
                    <CheckSquare className="w-5 h-5 text-amber-700" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">2. Nutrition Table Shifts</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">HIGH DELTA</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    <strong>Detection:</strong> Sodium shifted from {v1.nutrition.sodiumMg || 4280} mg to {v2.nutrition.sodiumMg || 2750} mg (-35.7% reduction).
                  </p>
                  <p className="text-[11px] text-amber-900 font-semibold mt-1">
                    <strong>Action:</strong> Re-typeset the Nutrition Facts Table per 100g. Requires laboratory analytical report verification before commercial print.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Item 3: Ingredients Reordering & Percentages */}
          <div className={`p-4 rounded-xl border transition-all ${
            approvedChanges.ingredients 
              ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300' 
              : 'bg-cream-50/30 border-cream-200 opacity-60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleApproval('ingredients')}
                  className="mt-0.5 text-emerald-800"
                >
                  {approvedChanges.ingredients ? (
                    <CheckSquare className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">3. Ingredients Declining Weight Sequence</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">FSSAI SEC 5.2</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    <strong>Detection:</strong> Salt reduced from 11% to 7%; raw mango increased to 64%; class II preservative added.
                  </p>
                  <p className="text-[11px] text-emerald-900 font-semibold mt-1">
                    <strong>Action:</strong> Re-order packaging ingredients panel in strict descending order of incoming weight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Item 4: Traceability & Inkjet Batch Coding */}
          <div className={`p-4 rounded-xl border transition-all ${
            approvedChanges.batchAndDates 
              ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300' 
              : 'bg-cream-50/30 border-cream-200 opacity-60'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleApproval('batchAndDates')}
                  className="mt-0.5 text-blue-800"
                >
                  {approvedChanges.batchAndDates ? (
                    <CheckSquare className="w-5 h-5 text-blue-700" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">4. Batch Code & Inkjet Traceability</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">TRACEABILITY</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    <strong>Detection:</strong> New production formulation run requires distinct lot segregation.
                  </p>
                  <p className="text-[11px] text-blue-900 font-semibold mt-1">
                    <strong>Action:</strong> Increment batch code to &quot;{v2.batchNumber || 'HK-MP-24-B201'}&quot; and update manufacturing date stamp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Execution Strip */}
        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-purple-900">
            <strong>Version Strategy:</strong> Baseline (v{v1.version || 1}.0) will remain permanently archived in your product library. A new version draft will be generated with approved updates.
          </div>

          <button
            onClick={applyApprovedChangesToNewVersion}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-limeaccent-400" />
            Apply Approved Changes to New Version
          </button>
        </div>
      </div>

      {/* Side-by-Side Detailed Diffs */}
      <div className="space-y-6">
        {/* 1. Ingredients Shift */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-cream-200 bg-cream-50/60 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              1. Recipe Ingredients & Percentage Modifications
            </h3>
            <span className="text-xs text-slate-500">
              {report.ingredientDiffs.length} change(s) detected
            </span>
          </div>

          <div className="p-4 space-y-3">
            {report.ingredientDiffs.map((diff, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-cream-200 bg-cream-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {diff.type === 'added' ? (
                      <span className="p-1 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 text-[10px]">
                        <Plus className="w-3 h-3" /> ADDED
                      </span>
                    ) : diff.type === 'removed' ? (
                      <span className="p-1 rounded bg-rose-100 text-rose-800 font-bold flex items-center gap-1 text-[10px]">
                        <Minus className="w-3 h-3" /> REMOVED
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-blue-100 text-blue-800 font-bold flex items-center gap-1 text-[10px]">
                        <RefreshCw className="w-3 h-3" /> RATIO MODIFIED
                      </span>
                    )}
                    <span className="font-bold text-slate-900">{diff.fieldName}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1">
                    <span className="text-slate-400">Baseline (V1):</span> <span className="line-through">{diff.oldValue}</span> &rarr; <span className="font-semibold text-slate-900">{diff.newValue}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 max-w-xs font-medium">
                  {diff.labelImpactNotes}
                </div>
              </div>
            ))}

            {report.ingredientDiffs.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No ingredient changes detected.</p>
            )}
          </div>
        </div>

        {/* 2. Nutrition Shifts with Visual Delta Gauges */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-cream-200 bg-cream-50/60 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              2. Nutritional Content Delta (Laboratory Test Advisory)
            </h3>
            <span className="text-xs text-slate-500">
              {report.nutritionDiffs.length} nutrient shift(s)
            </span>
          </div>

          {/* Visual Nutrition Delta Highlight (Sodium & Calorie Shift) */}
          <div className="p-5 bg-gradient-to-r from-cream-50 to-cream-100/60 border-b border-cream-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-cream-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Sodium Reduction Delta</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">-35.7% Less Salt</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Baseline (V1): <strong>{v1.nutrition.sodiumMg || 4280} mg</strong></span>
                  <span className="text-emerald-700 font-bold">New (V2): {v2.nutrition.sodiumMg || 2750} mg</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((v2.nutrition.sodiumMg || 2750) / (v1.nutrition.sodiumMg || 4280)) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-cream-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Energy Profile Delta</span>
                <span className="px-2 py-0.5 rounded-full bg-cream-100 text-slate-700 font-bold text-[11px] font-mono">
                  {v1.nutrition.energyKcal || 236} &rarr; {v2.nutrition.energyKcal || 232} kcal
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Energy levels remain stable (~1.7% change) as reduced salt preserves fruit mass and cold-pressed oil proportion.
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {report.nutritionDiffs.map((diff, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-cream-200 bg-cream-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">{diff.fieldName}</span>
                  <div className="text-[11px] text-slate-600">
                    <span className="text-slate-400">Previous:</span> {diff.oldValue} &rarr; <span className="font-bold text-slate-900">{diff.newValue}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 max-w-sm">
                  {diff.labelImpactNotes}
                </div>
              </div>
            ))}

            {report.nutritionDiffs.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">Nutrition values identical between versions.</p>
            )}
          </div>
        </div>

        {/* 3. Allergen Advisory Shift */}
        {report.allergenDiffs.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-950 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Critical Allergen Statement Modification</span>
            </div>
            {report.allergenDiffs.map((diff, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <p className="font-semibold text-rose-900">{diff.labelImpactNotes}</p>
                <div className="bg-white p-3 rounded-xl border border-rose-200 text-[11px] space-y-1">
                  <div><strong className="text-slate-500">Old Allergen Statement:</strong> {diff.oldValue}</div>
                  <div><strong className="text-rose-700">New Allergen Statement:</strong> <span className="font-bold text-rose-900">{diff.newValue}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="bg-cream-100 border border-cream-300 p-5 rounded-2xl flex items-start gap-3 text-xs text-slate-700">
        <Scale className="w-5 h-5 text-forest-800 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          {report.statutoryWarningNotice}
        </p>
      </div>
    </div>
  );
};
