import React, { useState, useEffect } from 'react';
import { useLabel } from '../context/LabelContext';
import { LABEL_TEMPLATES, getTemplateById } from '../data/labelTemplates';
import { api } from '../services/api';
import { 
  Sparkles, 
  Palette, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Scale, 
  Maximize2, 
  Check, 
  Info, 
  FileText, 
  GitCompare, 
  Upload, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ReferencePreset {
  id: string;
  name: string;
  brandName: string;
  productName: string;
  format: string;
  dimensions: { width: number; height: number; unit: string };
  hasNutritionTable: boolean;
  hasQrCode: boolean;
  hasBarcode: boolean;
  colorDominance: 'light' | 'dark' | 'vibrant';
  description: string;
}

const AUTHORIZED_REFERENCE_PRESETS: ReferencePreset[] = [
  {
    id: 'ref-artisan-jar',
    name: 'Artisanal Glass Jar Standard (400g)',
    brandName: 'Heritage Organic Farm',
    productName: 'Raw Wildflower Honey & Spices',
    format: 'Two-Panel Wrap (120×75mm)',
    dimensions: { width: 120, height: 75, unit: 'mm' },
    hasNutritionTable: true,
    hasQrCode: true,
    hasBarcode: true,
    colorDominance: 'light',
    description: 'Gold-standard artisanal condiment ratio with 60% front PDP and 40% side information panel.',
  },
  {
    id: 'ref-retail-pouch',
    name: 'Retail Supermarket Standup Pouch (250g)',
    brandName: 'Nourish Grain Co.',
    productName: 'Roasted Foxtail Millet Crisps',
    format: 'Single Front Panel (140×90mm)',
    dimensions: { width: 140, height: 90, unit: 'mm' },
    hasNutritionTable: true,
    hasQrCode: false,
    hasBarcode: true,
    colorDominance: 'vibrant',
    description: 'High-contrast retail snack packaging optimized for supermarket shelf visibility.',
  },
  {
    id: 'ref-gourmet-tin',
    name: 'Export Gourmet Canister / Tin (100g)',
    brandName: 'Spice Route Botanicals',
    productName: 'Single-Origin Malabar Black Pepper',
    format: 'Full Wrap Minimal (180×65mm)',
    dimensions: { width: 180, height: 65, unit: 'mm' },
    hasNutritionTable: false,
    hasQrCode: true,
    hasBarcode: true,
    colorDominance: 'dark',
    description: 'Minimalist export spice tin prioritizing geographical indication and batch traceability.',
  },
];

export const DesignRecommendationsPage: React.FC = () => {
  const { currentLabel, updateCurrentLabel, showToast, setActiveTab } = useLabel();

  // Recommendation Engine State
  const [selectedChannel, setSelectedChannel] = useState<'farmers_market' | 'retail_supermarket' | 'e_commerce' | 'bulk_b2b'>('farmers_market');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);

  // Reference Label Comparison State
  const [selectedRefPreset, setSelectedRefPreset] = useState<ReferencePreset>(AUTHORIZED_REFERENCE_PRESETS[0]);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);

  // Fetch recommendations whenever current label or distribution channel changes
  useEffect(() => {
    let isMounted = true;
    setLoadingRecommendations(true);

    api.getRecommendations({
      category: currentLabel.category || 'Pickles, Chutneys & Condiments',
      widthMm: currentLabel.dimensions.width,
      heightMm: currentLabel.dimensions.height,
      layoutStyle: currentLabel.dimensions.layoutStyle,
      ingredientCount: currentLabel.ingredients.length,
      hasNutritionTable: currentLabel.dimensions.showNutritionTable,
      distributionChannel: selectedChannel,
    })
      .then(res => {
        if (isMounted) {
          setRecommendations(res);
          setLoadingRecommendations(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingRecommendations(false);
      });

    return () => { isMounted = false; };
  }, [currentLabel.category, currentLabel.dimensions.width, currentLabel.dimensions.height, currentLabel.dimensions.layoutStyle, currentLabel.ingredients.length, currentLabel.dimensions.showNutritionTable, selectedChannel]);

  // Compute reference comparison
  useEffect(() => {
    let isMounted = true;
    setLoadingComparison(true);

    api.compareReference(currentLabel, selectedRefPreset)
      .then(res => {
        if (isMounted) {
          setComparisonResult(res);
          setLoadingComparison(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingComparison(false);
      });

    return () => { isMounted = false; };
  }, [currentLabel, selectedRefPreset]);

  const handleApplyRecommendedTemplate = (rec: any) => {
    const tmpl = getTemplateById(rec.templateId as any);
    updateCurrentLabel({
      dimensions: {
        ...currentLabel.dimensions,
        labelTheme: tmpl.id,
        fontFamily: tmpl.fontFamily,
        layoutStyle: rec.recommendedLayout || tmpl.recommendedLayout,
      }
    });
    showToast(`Applied "${tmpl.name}" recommended design theme! Opening in Visual Editor...`, 'success');
    setActiveTab('editor');
  };

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header in SelfSync Editorial Style */}
      <div className="border-b border-cream-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-800">
          <Sparkles className="w-4 h-4 text-limeaccent-500" />
          <span>Intelligent Packaging Optimization</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
          Design Recommendation & Reference Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Algorithmic design suggestions tailored to your product category, physical surface area ({currentLabel.dimensions.width}×{currentLabel.dimensions.height}{currentLabel.dimensions.unit}), and information density. Compare your draft against verified packaging standards using explainable visual design metrics.
        </p>
      </div>

      {/* SECTION 1: RECOMMENDATION ENGINE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-serif">
              <Palette className="w-5 h-5 text-forest-800" />
              Tailored Template Recommendations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked dynamically by printable area ({Math.round(currentLabel.dimensions.width * currentLabel.dimensions.height)} mm²), {currentLabel.ingredients.length} ingredients, and distribution channel.
            </p>
          </div>

          {/* Distribution Context Switcher */}
          <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-xl border border-cream-200 text-xs shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Retail Context:</span>
            {[
              { id: 'farmers_market', label: 'Farmers Market / Artisan' },
              { id: 'retail_supermarket', label: 'Supermarket Shelf' },
              { id: 'e_commerce', label: 'E-Commerce Direct' },
              { id: 'bulk_b2b', label: 'Bulk / B2B' },
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedChannel === ch.id
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 High-Scoring Recommended Cards */}
        {loadingRecommendations ? (
          <div className="p-12 text-center text-xs text-slate-500">Calculating recommendations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.slice(0, 3).map((rec, idx) => {
              const tmpl = getTemplateById(rec.templateId as any);
              const isCurrent = currentLabel.dimensions.labelTheme === tmpl.id;

              return (
                <div
                  key={rec.templateId}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
                    idx === 0 ? 'border-forest-800 ring-2 ring-forest-800/20' : 'border-cream-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-limeaccent-100 text-forest-900 border border-limeaccent-300">
                        {rec.matchScore}% Match
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-limeaccent-500" /> Best Fit
                        </span>
                      )}
                    </div>

                    {/* Visual Swatch */}
                    <div
                      className="w-full h-24 rounded-xl border p-2 flex flex-col justify-between shadow-inner"
                      style={{
                        backgroundColor: tmpl.palette.background,
                        color: tmpl.palette.text,
                        borderColor: tmpl.palette.border,
                      }}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wider opacity-75">{tmpl.tagline}</span>
                      <div className="text-xs font-black truncate">{tmpl.name}</div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{tmpl.name}</h3>
                      <span className="text-[11px] font-semibold text-forest-800 block mt-0.5">
                        {tmpl.categoryTag}
                      </span>
                    </div>

                    {/* Explainable Rationales */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600 border-t border-cream-200">
                      {rec.rationales.map((r: string, rIdx: number) => (
                        <div key={rIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest-800 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug">{r}</span>
                        </div>
                      ))}
                    </div>

                    {rec.densityWarning && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-tight flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{rec.densityWarning}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-cream-200 mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 capitalize">
                      {rec.recommendedLayout} Layout
                    </span>

                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-forest-900 bg-forest-100 px-3 py-1.5 rounded-xl">
                        <Check className="w-3.5 h-3.5" /> Currently Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyRecommendedTemplate(rec)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-xs"
                      >
                        Apply Theme <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: REFERENCE-LABEL COMPARISON AUDIT */}
      <section className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-cream-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-900">
              <GitCompare className="w-4 h-4 text-purple-700" />
              <span>Comparative Design Metrics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif mt-0.5">
              Reference-Label Design Benchmarking
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare your current label draft side-by-side against verified, authorized packaging formats.
            </p>
          </div>

          {/* Reference Dataset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Benchmark Against:</span>
            <select
              value={selectedRefPreset.id}
              onChange={(e) => {
                const found = AUTHORIZED_REFERENCE_PRESETS.find(p => p.id === e.target.value);
                if (found) setSelectedRefPreset(found);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 font-medium"
            >
              {AUTHORIZED_REFERENCE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Visual Inspection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: User's Current Draft */}
          <div className="p-5 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-cream-200 pb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Your Active Draft</span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-cream-300">
                {currentLabel.dimensions.width}×{currentLabel.dimensions.height}{currentLabel.dimensions.unit}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-cream-200 space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-forest-800 block">
                {currentLabel.brandName || 'Brand Name'}
              </span>
              <h4 className="font-black text-sm text-slate-900 truncate">
                {currentLabel.productName || 'Product Title'}
              </h4>
              <p className="text-[10px] text-slate-600 line-clamp-2">
                Ingredients: {currentLabel.ingredients.map(i => i.name).join(', ') || 'None entered'}
              </p>
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-cream-100 font-mono">
                <span>Net: {currentLabel.netQuantity} {currentLabel.netQuantityUnit}</span>
                <span>FSSAI: {currentLabel.fssaiLicense ? 'Verified (14-digit)' : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Card B: Selected Reference Preset */}
          <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-purple-200 pb-2">
              <span className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">Authorized Benchmark Standard</span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-purple-300 text-purple-900">
                {selectedRefPreset.dimensions.width}×{selectedRefPreset.dimensions.height}{selectedRefPreset.dimensions.unit}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-purple-800 block">
                {selectedRefPreset.brandName}
              </span>
              <h4 className="font-black text-sm text-slate-900 truncate">
                {selectedRefPreset.productName}
              </h4>
              <p className="text-[10px] text-slate-600">
                {selectedRefPreset.description}
              </p>
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-cream-100 font-mono text-purple-900">
                <span>Format: {selectedRefPreset.format}</span>
                <span>EAN Barcode: {selectedRefPreset.hasBarcode ? 'Present' : 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explainable Design Metrics Grid */}
        {comparisonResult && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Explainable Design Metrics
              </h3>
              <div className="flex items-center gap-1.5 font-bold text-xs text-forest-900 bg-limeaccent-100 px-3 py-1 rounded-full border border-limeaccent-300">
                <span>Overall Spatial Harmony:</span>
                <span className="font-mono text-sm">{comparisonResult.overallDesignSimilarityScore}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {Object.entries(comparisonResult.metricBreakdown).map(([key, data]: [string, any]) => (
                <div key={key} className="p-3.5 rounded-xl border border-cream-200 bg-cream-50/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-slate-900">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-xs font-mono font-bold text-forest-800">
                      {data.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-cream-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-forest-800 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {data.observation}
                  </p>
                  <p className="text-[10px] text-forest-900 font-semibold leading-snug">
                    💡 Tip: {data.suggestion}
                  </p>
                </div>
              ))}
            </div>

            {/* Key Takeaways */}
            <div className="p-4 rounded-xl bg-forest-900 text-white space-y-2 text-xs">
              <span className="font-bold text-limeaccent-400 uppercase tracking-wider text-[10px] block">
                Benchmarking Key Findings
              </span>
              <ul className="space-y-1 text-cream-200">
                {comparisonResult.keyTakeaways.map((k: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-limeaccent-400">•</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Statutory Integrity Disclaimer */}
        <div className="text-[11px] text-slate-500 leading-relaxed border-t border-cream-200 pt-3">
          {comparisonResult?.statutoryNotice || 'Visual design metrics are informational and advisory. Comparative analysis does not establish official regulatory compliance or endorsement.'}
        </div>
      </section>
    </div>
  );
};
