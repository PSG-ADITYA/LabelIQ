import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Leaf, 
  FlaskConical, 
  Info,
  BookOpen,
  Award
} from 'lucide-react';
import { explainIngredient } from '../data/ingredientDatabase';
import { IngredientExplanation } from '../types/label';

interface IngredientIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Array<{ name: string; percentage?: string; isAllergen?: boolean }>;
}

export const IngredientIntelligenceModal: React.FC<IngredientIntelligenceModalProps> = ({
  isOpen,
  onClose,
  ingredients
}) => {
  const [viewMode, setViewMode] = useState<'consumer' | 'manufacturer'>('consumer');
  const [selectedIngredientName, setSelectedIngredientName] = useState<string>(
    ingredients.length > 0 ? ingredients[0].name : ''
  );

  if (!isOpen) return null;

  const currentIng = ingredients.find(i => i.name === selectedIngredientName) || ingredients[0];
  const explanation: IngredientExplanation = currentIng ? explainIngredient(currentIng.name) : {
    name: 'Selected Ingredient',
    vernacularName: 'Culinary Ingredient',
    simpleExplanation: 'Authentic agricultural ingredient.',
    culinaryPurpose: 'Essential formulation element.',
    commonSources: 'Agricultural supply chain.',
    allergenInfo: 'Verify statutory allergen thresholds.',
    cautions: 'Adhere to FSSAI standards.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-cream-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-800 border border-forest-700 flex items-center justify-center text-limeaccent-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-cream-50 flex items-center gap-2">
                <span>Understand My Ingredients</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-800 text-limeaccent-400 font-bold border border-forest-700">
                  AI + Food Science
                </span>
              </h2>
              <p className="text-xs text-cream-200">
                Evidence-based functional roles, allergen warnings & authentic sourcing insights.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cream-300 hover:text-white hover:bg-forest-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audience Toggle: Consumer vs Manufacturer */}
        <div className="px-6 py-3 bg-cream-50 border-b border-cream-200 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Viewing perspective:
          </span>
          <div className="flex bg-cream-200/70 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('consumer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'consumer'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Consumer-Friendly Story</span>
            </button>
            <button
              onClick={() => setViewMode('manufacturer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'manufacturer'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-forest-800" />
              <span>Food Tech & Manufacturer Specs</span>
            </button>
          </div>
        </div>

        {/* Modal Body with Sidebar and Detail View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
          {/* Ingredients Pill Selector Sidebar */}
          <div className="md:col-span-4 border-r border-cream-200 p-4 overflow-y-auto space-y-1.5 bg-cream-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Formula Ingredients ({ingredients.length})
            </span>
            {ingredients.map((ing, i) => {
              const isSelected = (currentIng && currentIng.name === ing.name) || (!currentIng && i === 0);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedIngredientName(ing.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-forest-900 text-white font-bold shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-cream-100 border border-cream-200'
                  }`}
                >
                  <span className="truncate">{ing.name}</span>
                  {ing.isAllergen && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                      Allergen
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Ingredient Card */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-5 bg-white">
            {/* Title & Vernacular Pill */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 font-serif">
                  {explanation.name}
                </h3>
                {explanation.insNumber && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {explanation.insNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-forest-800 font-semibold">
                Desi / Vernacular Names: <span className="font-normal text-slate-600">{explanation.vernacularName}</span>
              </p>
            </div>

            {/* Mode-specific Content */}
            {viewMode === 'consumer' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">
                    What is it in plain words?
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {explanation.simpleExplanation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">
                    Why do we use it in cooking?
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {explanation.culinaryPurpose}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">
                    Where does it come from?
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {explanation.commonSources}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-forest-800" /> Food Science & Functional Mechanism
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {explanation.culinaryPurpose}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-forest-800" /> Agronomic Source & Cultivar Provenance
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {explanation.commonSources}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-amber-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-700" /> FSSAI Formulation & Labeling Compliance Notes
                  </span>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    {explanation.cautions}
                  </p>
                </div>
              </div>
            )}

            {/* Allergen & Cautions Alert */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 text-xs text-rose-950">
              <span className="font-bold flex items-center gap-1.5 text-rose-800 text-[11px]">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Statutory Allergen & Sensitivity Notice</span>
              </span>
              <p className="text-[11px] text-rose-900/90 leading-relaxed">
                {explanation.allergenInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-cream-50 border-t border-cream-200 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            Complies with Food Safety and Standards (Labeling & Display) Regulations, 2020.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
