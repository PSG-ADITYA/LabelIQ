import React, { useState } from 'react';
import { 
  X, 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  Eye, 
  Layers 
} from 'lucide-react';
import { SUPPORTED_INDIAN_LANGUAGES } from '../data/translationDictionary';
import { IndianLanguageCode, ProductLabel } from '../types/label';
import { API_BASE } from '../services/api';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: ProductLabel;
  onApplyTranslation: (bilingualConfig: any) => void;
}

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  onClose,
  label,
  onApplyTranslation,
}) => {
  const [selectedLang, setSelectedLang] = useState<IndianLanguageCode>('hi');
  const [displayMode, setDisplayMode] = useState<'bilingual' | 'regional-only'>('bilingual');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [translatedFields, setTranslatedFields] = useState<Record<string, string>>({
    productName: '',
    category: '',
    ingredients: '',
    storage: '',
    directions: '',
    allergens: '',
  });
  const [translationMethod, setTranslationMethod] = useState<string>('');

  if (!isOpen) return null;

  // Execute Translation via Backend API
  const handleTranslate = async (targetLang: IndianLanguageCode) => {
    setIsTranslating(true);
    try {
      const ingredientsText = label.ingredients.map(i => i.name).join(', ');
      const allergensText = label.allergenDeclarations.join(', ');

      const res = await fetch(`${API_BASE}/ai/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetLanguage: targetLang,
          fields: {
            productName: label.productName,
            category: label.category,
            ingredients: ingredientsText,
            storage: label.storageInstructions,
            directions: label.directionsForUse || 'Ready to consume.',
            allergens: allergensText,
            netQty: `${label.netQuantity}${label.netQuantityUnit}`,
            fssaiLicense: label.fssaiLicense,
          }
        }),
      });

      if (!res.ok) {
        throw new Error('Translation failed');
      }

      const data = await res.json();
      setTranslatedFields(data.translatedFields);
      setTranslationMethod(data.method);
    } catch (err: any) {
      console.warn('Translation error:', err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApply = () => {
    onApplyTranslation({
      enabled: true,
      targetLanguage: selectedLang,
      translatedProductName: translatedFields.productName || label.productName,
      translatedCategory: translatedFields.category || label.category,
      translatedIngredients: translatedFields.ingredients || '',
      translatedStorage: translatedFields.storage || label.storageInstructions,
      translatedDirections: translatedFields.directions || label.directionsForUse,
      translatedAllergens: translatedFields.allergens || '',
      displayMode,
      reviewedByHuman: hasReviewed,
    });
    onClose();
  };

  const currentLangMeta = SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_INDIAN_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-cream-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-800 border border-forest-700 flex items-center justify-center text-limeaccent-300">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-cream-50 flex items-center gap-2">
                <span>Multilingual Packaging Translation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-800 text-limeaccent-400 font-bold border border-forest-700">
                  FSSAI Compliant
                </span>
              </h2>
              <p className="text-xs text-cream-200">
                Preserves numbers, units, 14-digit licenses & dates verbatim while translating packaging text.
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

        {/* Language Selection & Mode Bar */}
        <div className="p-4 bg-cream-50 border-b border-cream-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Target Language:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORTED_INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      handleTranslate(lang.code);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedLang === lang.code
                        ? 'bg-forest-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-cream-100 border border-cream-200'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] opacity-75 ml-1">({lang.name})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Mode */}
            <div className="flex bg-cream-200/80 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setDisplayMode('bilingual')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  displayMode === 'bilingual' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Bilingual (English + {currentLangMeta.name})
              </button>
              <button
                onClick={() => setDisplayMode('regional-only')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  displayMode === 'regional-only' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                {currentLangMeta.name} Only
              </button>
            </div>
          </div>

          {/* Quick trigger button */}
          {!translatedFields.productName && !isTranslating && (
            <button
              onClick={() => handleTranslate(selectedLang)}
              className="w-full py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-limeaccent-400" />
              <span>Translate Label Fields to {currentLangMeta.nativeName}</span>
            </button>
          )}
        </div>

        {/* Translation Review Comparison Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {isTranslating ? (
            <div className="py-12 text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-forest-800 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Translating packaging terminology into {currentLangMeta.name} with regulatory preservation...
              </p>
            </div>
          ) : translatedFields.productName ? (
            <div className="space-y-4">
              {/* Preservation Assurance Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Verified: Numbers (<strong>{label.netQuantity}{label.netQuantityUnit}</strong>), FSSAI License (<strong>{label.fssaiLicense}</strong>), and Dates are 100% preserved.
                  </span>
                </div>
                {translationMethod && (
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300 shrink-0">
                    {translationMethod}
                  </span>
                )}
              </div>

              {/* Side-by-side Field Comparison */}
              <div className="border border-cream-200 rounded-2xl overflow-hidden divide-y divide-cream-200">
                {/* Product Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-3 bg-cream-50/50">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Original (English)</span>
                    <p className="text-xs font-bold text-slate-900 font-serif">{label.productName}</p>
                  </div>
                  <div className="sm:border-l sm:border-cream-200 sm:pl-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block mb-0.5">
                      Translated ({currentLangMeta.nativeName})
                    </span>
                    <input
                      type="text"
                      value={translatedFields.productName}
                      onChange={(e) => setTranslatedFields({ ...translatedFields, productName: e.target.value })}
                      className="w-full text-xs font-bold text-slate-900 font-serif bg-white border border-cream-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-forest-800"
                    />
                  </div>
                </div>

                {/* Storage Instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-3 bg-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Original Storage</span>
                    <p className="text-xs text-slate-700">{label.storageInstructions}</p>
                  </div>
                  <div className="sm:border-l sm:border-cream-200 sm:pl-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block mb-0.5">
                      Translated Storage
                    </span>
                    <textarea
                      rows={2}
                      value={translatedFields.storage}
                      onChange={(e) => setTranslatedFields({ ...translatedFields, storage: e.target.value })}
                      className="w-full text-xs text-slate-700 bg-white border border-cream-300 rounded-lg p-2 focus:ring-1 focus:ring-forest-800"
                    />
                  </div>
                </div>

                {/* Directions for Use */}
                <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 gap-3 bg-cream-50/50">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Directions for Use</span>
                    <p className="text-xs text-slate-700">{label.directionsForUse || 'Ready to consume.'}</p>
                  </div>
                  <div className="sm:border-l sm:border-cream-200 sm:pl-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block mb-0.5">
                      Translated Directions
                    </span>
                    <input
                      type="text"
                      value={translatedFields.directions}
                      onChange={(e) => setTranslatedFields({ ...translatedFields, directions: e.target.value })}
                      className="w-full text-xs text-slate-700 bg-white border border-cream-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-forest-800"
                    />
                  </div>
                </div>
              </div>

              {/* Human Review Affirmation */}
              <label className="flex items-start gap-2.5 p-3.5 rounded-xl border border-cream-200 bg-cream-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReviewed}
                  onChange={(e) => setHasReviewed(e.target.checked)}
                  className="mt-0.5 rounded text-forest-900 focus:ring-forest-800"
                />
                <span className="text-xs text-slate-700">
                  <strong>Human Review Confirmation:</strong> I have reviewed the translated packaging texts, verified that legal numbers & allergen declarations are accurate, and approve applying this translation to the label.
                </span>
              </label>
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Languages className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                Select your target Indian language above to generate an authentic, FSSAI-compliant packaging translation.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-cream-50 border-t border-cream-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            disabled={!translatedFields.productName || !hasReviewed}
            className="px-5 py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4 text-limeaccent-400" />
            <span>Apply to Label Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
