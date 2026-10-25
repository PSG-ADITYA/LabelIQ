import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
import { COMMON_LABEL_PRESETS, FSSAI_MAJOR_ALLERGENS } from '../data/fssaiRules';
import { 
  IngredientItem, 
  MeasurementUnit, 
  MassVolumeUnit, 
  Orientation, 
  LayoutStyle, 
  DietaryClassification 
} from '../types/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  Save, 
  Eye, 
  HelpCircle,
  GripVertical,
  RotateCcw,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

export const CreateLabelPage: React.FC = () => {
  const { 
    currentLabel, 
    updateCurrentLabel, 
    saveCurrentProduct, 
    setActiveTab, 
    showToast,
    createNewBlankLabel,
    loadDemoPickle
  } = useLabel();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // Steps definition
  const steps = [
    { num: 1, title: 'Product Identity', desc: 'Name, Category & Net Quantity' },
    { num: 2, title: 'Ingredients & Allergens', desc: 'Recipe items & warning statements' },
    { num: 3, title: 'Nutrition Facts', desc: 'Statutory nutritional values per 100g' },
    { num: 4, title: 'Traceability & FSSAI', desc: 'Batch, dates, license & address' },
    { num: 5, title: 'Dimensions & Packaging', desc: 'Physical mm/cm sizing & layout' },
  ];

  // Helper for ingredient manipulation
  const addIngredient = () => {
    const newItem: IngredientItem = {
      id: `ing-${Date.now()}`,
      name: '',
      percentage: '',
      order: currentLabel.ingredients.length + 1,
      isAllergen: false,
    };
    updateCurrentLabel({
      ingredients: [...currentLabel.ingredients, newItem],
    });
  };

  const updateIngredient = (id: string, partial: Partial<IngredientItem>) => {
    updateCurrentLabel({
      ingredients: currentLabel.ingredients.map(i => (i.id === id ? { ...i, ...partial } : i)),
    });
  };

  const removeIngredient = (id: string) => {
    updateCurrentLabel({
      ingredients: currentLabel.ingredients.filter(i => i.id !== id),
    });
  };

  // Helper for nutrition fields
  const handleNutritionChange = (key: keyof typeof currentLabel.nutrition, val: string) => {
    const num = val === '' ? null : parseFloat(val);
    updateCurrentLabel({
      nutrition: {
        ...currentLabel.nutrition,
        [key]: isNaN(num as number) ? null : num,
      },
    });
  };

  // Step-by-Step Validation Function
  const validateStep = (step: number): string[] => {
    const errs: string[] = [];

    if (step === 1) {
      if (!currentLabel.productName.trim()) {
        errs.push('Product Name is mandatory (required on front Principal Display Panel).');
      }
      if (!currentLabel.brandName.trim()) {
        errs.push('Brand or Trading Name is mandatory.');
      }
      if (!currentLabel.netQuantity || currentLabel.netQuantity <= 0) {
        errs.push('Net Quantity must be a valid number greater than zero.');
      }
      if (!currentLabel.category) {
        errs.push('Product Category must be specified.');
      }
    }

    if (step === 2) {
      if (currentLabel.ingredients.length === 0) {
        errs.push('At least one ingredient must be listed.');
      }
      const emptyIng = currentLabel.ingredients.find(i => !i.name.trim());
      if (emptyIng) {
        errs.push('All listed ingredients must have a valid ingredient name.');
      }
    }

    if (step === 3) {
      if (!currentLabel.nutrition.servingSize.trim()) {
        errs.push('Serving size is required (e.g. "15g (approx 1 tbsp)" or "100g").');
      }
      // FSSAI 2020 Mandatory 5 Core Nutrients
      if (currentLabel.nutrition.energyKcal === null) {
        errs.push('Energy (kcal) is a mandatory FSSAI declaration per 100g.');
      }
      if (currentLabel.nutrition.proteinG === null) {
        errs.push('Protein (g) is a mandatory FSSAI declaration per 100g.');
      }
      if (currentLabel.nutrition.carbohydratesG === null) {
        errs.push('Total Carbohydrates (g) is a mandatory FSSAI declaration per 100g.');
      }
      if (currentLabel.nutrition.totalFatG === null) {
        errs.push('Total Fat (g) is a mandatory FSSAI declaration per 100g.');
      }
      if (currentLabel.nutrition.sodiumMg === null) {
        errs.push('Sodium (mg) is a mandatory FSSAI declaration per 100g.');
      }
    }

    if (step === 4) {
      if (!currentLabel.batchNumber.trim()) {
        errs.push('Batch or Lot identification number is mandatory for traceability.');
      }
      if (!currentLabel.mfgDate.trim()) {
        errs.push('Manufacturing / Packing Date is mandatory.');
      }
      if (!currentLabel.expiryDate.trim()) {
        errs.push('Expiry or Best-Before Date is mandatory.');
      }
      if (currentLabel.mfgDate && currentLabel.expiryDate) {
        if (new Date(currentLabel.expiryDate) <= new Date(currentLabel.mfgDate)) {
          errs.push('Expiry Date must be chronologically after the Manufacturing Date.');
        }
      }
      if (!currentLabel.fssaiLicense.trim()) {
        errs.push('14-digit FSSAI License Number is mandatory.');
      } else if (!/^\d{14}$/.test(currentLabel.fssaiLicense.trim())) {
        errs.push('FSSAI License Number must contain exactly 14 numeric digits.');
      }
      if (!currentLabel.manufacturer.name.trim()) {
        errs.push('Manufacturer or Packer company name is mandatory.');
      }
      if (!currentLabel.manufacturer.address.trim()) {
        errs.push('Manufacturer street address / physical location is mandatory.');
      }

      // Conditional Category Checks
      if (currentLabel.category === 'Pickles, Chutneys & Condiments') {
        if (!currentLabel.drainedWeight || currentLabel.drainedWeight <= 0) {
          errs.push('Drained Weight is legally required under Legal Metrology for pickles/condiments packaged in oil or brine.');
        }
      }
      if (currentLabel.category === 'Non-Alcoholic Beverages & Syrups' || currentLabel.category === 'Fruit & Vegetable Processing (Jams, Purees)') {
        if (currentLabel.fruitPulpPercent === null || currentLabel.fruitPulpPercent === undefined || currentLabel.fruitPulpPercent <= 0) {
          errs.push('Fruit Juice / Pulp percentage (%) declaration is legally mandatory for this product category.');
        }
      }
      if (currentLabel.category === 'Honey, Cold-Pressed Oils & Agritech Produce') {
        if (!currentLabel.extractionMethodOrSource || !currentLabel.extractionMethodOrSource.trim()) {
          errs.push('Extraction method (e.g. Cold-Pressed, Wood-Pressed, Raw) must be declared for agritech oils/honey.');
        }
      }
    }

    if (step === 5) {
      if (!currentLabel.dimensions.width || currentLabel.dimensions.width < 20) {
        errs.push('Physical label width must be at least 20mm.');
      }
      if (!currentLabel.dimensions.height || currentLabel.dimensions.height < 20) {
        errs.push('Physical label height must be at least 20mm.');
      }
    }

    return errs;
  };

  const handleNextStep = () => {
    const errs = validateStep(currentStep);
    if (errs.length > 0) {
      setStepErrors(errs);
      showToast(`Please address ${errs.length} required field(s) before continuing.`, 'warning');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }
    setStepErrors([]);
    setCurrentStep(prev => Math.min(steps.length, prev + 1));
  };

  const handleStepJump = (targetStep: number) => {
    // If going forward, validate current step first
    if (targetStep > currentStep) {
      const errs = validateStep(currentStep);
      if (errs.length > 0) {
        setStepErrors(errs);
        showToast('Please complete mandatory fields on this step before advancing.', 'warning');
        return;
      }
    }
    setStepErrors([]);
    setCurrentStep(targetStep);
  };

  return (
    <div className="space-y-6 py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner with Clear vs Demo Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200 uppercase tracking-wider">
              Guided Creator
            </span>
            <span className="text-xs text-slate-500">
              {currentLabel.productName ? `Draft: ${currentLabel.productName}` : 'Clean Blank Draft'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Food Label Design & Regulatory Entry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step statutory entry. Mandatory fields are enforced per FSSAI 2020 rules before progressing.
          </p>
        </div>

        {/* Action Buttons: Demo vs Blank */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              loadDemoPickle();
              setStepErrors([]);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200 transition-all shadow-sm"
            title="Populate form with authentic pickle sample data"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Load Demo Sample (Pickle)
          </button>

          <button
            type="button"
            onClick={() => {
              createNewBlankLabel();
              setStepErrors([]);
              setCurrentStep(1);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-slate-700 font-semibold text-xs border border-cream-300 transition-all"
            title="Reset to empty blank draft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear to Blank
          </button>

          <button
            type="button"
            onClick={saveCurrentProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Validation Error Banner (When progression is blocked) */}
      {stepErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-sm space-y-2 text-xs text-rose-900">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Cannot Proceed: Complete the following {stepErrors.length} required field(s):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-rose-700 pl-1 font-medium">
            {stepErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <button
                key={step.num}
                onClick={() => handleStepJump(step.num)}
                className={`text-left p-2.5 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-forest-50 border-2 border-forest-900 shadow-xs' 
                    : isCompleted 
                    ? 'bg-cream-50 hover:bg-cream-100 border border-cream-200' 
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-forest-900 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cream-300 text-slate-700'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : step.num}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 truncate">{step.title}</div>
                    <div className="text-[10px] text-slate-400 truncate hidden sm:block">Step {step.num}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-cream-200 shadow-sm space-y-6">
        {/* STEP 1: Product Identity */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="p-3.5 rounded-xl bg-forest-50/70 border border-forest-200 text-xs text-forest-900">
              <strong>Step 1 Objective:</strong> Establish product naming, trade brand, metric net quantity, and applicable regulatory jurisdiction.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Product Name *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <input
                  type="text"
                  value={currentLabel.productName}
                  onChange={(e) => updateCurrentLabel({ productName: e.target.value })}
                  placeholder="e.g. Heritage Dadi's Spiced Raw Mango Pickle"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                    !currentLabel.productName.trim() && stepErrors.length > 0 ? 'border-rose-400 ring-2 ring-rose-200' : 'border-cream-300'
                  } focus:outline-none focus:ring-2 focus:ring-forest-800`}
                />
                <p className="text-[11px] text-slate-500 mt-1">Must describe the true nature of food on the front panel.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Brand or Trading Name *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <input
                  type="text"
                  value={currentLabel.brandName}
                  onChange={(e) => updateCurrentLabel({ brandName: e.target.value })}
                  placeholder="e.g. Heritage Kitchen Foods"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                    !currentLabel.brandName.trim() && stepErrors.length > 0 ? 'border-rose-400 ring-2 ring-rose-200' : 'border-cream-300'
                  } focus:outline-none focus:ring-2 focus:ring-forest-800`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Product Category *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Condition Rules</span>
                </div>
                <select
                  value={currentLabel.category}
                  onChange={(e) => updateCurrentLabel({ category: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-white"
                >
                  <option value="Pickles, Chutneys & Condiments">Pickles, Chutneys & Condiments</option>
                  <option value="Spices, Seasonings & Blends">Spices, Seasonings & Blends</option>
                  <option value="Grains, Flour, Pulses & Millets">Grains, Flour, Pulses & Millets</option>
                  <option value="Honey, Cold-Pressed Oils & Agritech Produce">Honey, Cold-Pressed Oils & Agritech Produce</option>
                  <option value="Bakery, Snacks & Confectionery">Bakery, Snacks & Confectionery</option>
                  <option value="Dairy Products & Analogues">Dairy Products & Analogues</option>
                  <option value="Non-Alcoholic Beverages & Syrups">Non-Alcoholic Beverages & Syrups</option>
                  <option value="Fruit & Vegetable Processing (Jams, Purees)">Fruit & Vegetable Processing (Jams, Purees)</option>
                  <option value="Custom Food Category">Custom Food Category</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Triggers category-specific rules (e.g. Drained Weight, Cold-Pressed extraction, Pulp %).</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Dietary Classification (FSSAI Logo) *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <div className="flex gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="dietary"
                      checked={currentLabel.dietaryClassification === 'veg'}
                      onChange={() => updateCurrentLabel({ dietaryClassification: 'veg' })}
                      className="text-forest-800 focus:ring-forest-800"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                      <span className="w-3.5 h-3.5 rounded-sm border-2 border-emerald-600 flex items-center justify-center p-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      </span>
                      Vegetarian (Green Dot)
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="dietary"
                      checked={currentLabel.dietaryClassification === 'non-veg'}
                      onChange={() => updateCurrentLabel({ dietaryClassification: 'non-veg' })}
                      className="text-amber-800 focus:ring-amber-800"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-amber-900">
                      <span className="w-3.5 h-3.5 rounded-sm border-2 border-amber-800 flex items-center justify-center p-0.5">
                        <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-amber-800" />
                      </span>
                      Non-Vegetarian (Brown Triangle)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Net Quantity & Metric Unit *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={currentLabel.netQuantity || ''}
                    onChange={(e) => updateCurrentLabel({ netQuantity: parseFloat(e.target.value) || 0 })}
                    placeholder="400"
                    className={`w-2/3 text-xs px-3.5 py-2.5 rounded-xl border ${
                      (!currentLabel.netQuantity || currentLabel.netQuantity <= 0) && stepErrors.length > 0 ? 'border-rose-400 ring-2 ring-rose-200' : 'border-cream-300'
                    } focus:outline-none focus:ring-2 focus:ring-forest-800`}
                  />
                  <select
                    value={currentLabel.netQuantityUnit}
                    onChange={(e) => updateCurrentLabel({ netQuantityUnit: e.target.value as MassVolumeUnit })}
                    className="w-1/3 text-xs px-3 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-white"
                  >
                    <option value="g">g (grams)</option>
                    <option value="kg">kg (kilograms)</option>
                    <option value="ml">ml (millilitres)</option>
                    <option value="l">l (litres)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Under Legal Metrology, unit must be metric without symbols like &quot;gms&quot;.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Market Jurisdiction *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">FSSAI 2020</span>
                </div>
                <select
                  value={currentLabel.regulatoryFramework}
                  onChange={(e) => updateCurrentLabel({ regulatoryFramework: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-white"
                >
                  <option value="FSSAI (Food Safety and Standards Authority of India)">
                    FSSAI (Food Safety and Standards Authority of India) - 2020 Standard
                  </option>
                  <option value="Codex General Standard for the Labelling of Prepackaged Foods">
                    Codex Alimentarius (International General Standard)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Product Description & Culinary Notes
                </label>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Optional</span>
              </div>
              <textarea
                rows={2}
                value={currentLabel.description}
                onChange={(e) => updateCurrentLabel({ description: e.target.value })}
                placeholder="Briefly describe the product, flavor profile, and preparation style..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Ingredients & Allergens */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900">
                <p className="font-semibold">FSSAI Declining Weight Order & Allergen Integrity</p>
                <p>
                  List all ingredients in descending order of incoming weight or volume. 
                  <strong> Crucial Rule:</strong> Never infer that a product is allergen-free merely because an allergen is omitted from this list. Always confirm shared line cross-contact.
                </p>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recipe Ingredients *</h3>
                  <p className="text-[11px] text-slate-500">At least one ingredient is required.</p>
                </div>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-900 bg-forest-50 px-3 py-1.5 rounded-lg border border-forest-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Ingredient
                </button>
              </div>

              {currentLabel.ingredients.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-cream-300 rounded-xl bg-cream-50/50">
                  <p className="text-xs text-slate-500 font-medium">No ingredients added yet.</p>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="mt-2 text-xs font-bold text-forest-800 underline hover:text-forest-900"
                  >
                    Click here to add your first ingredient
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentLabel.ingredients.map((ing, idx) => (
                    <div key={ing.id} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl border border-cream-200 bg-cream-50/40">
                      <span className="text-slate-400 font-mono text-xs w-6 text-center">#{idx + 1}</span>
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                        placeholder="Ingredient Name (e.g. Raw Green Mango Pieces)"
                        className="w-full sm:flex-1 text-xs px-3 py-1.5 rounded-lg border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
                      />
                      <input
                        type="text"
                        value={ing.percentage || ''}
                        onChange={(e) => updateIngredient(ing.id, { percentage: e.target.value })}
                        placeholder="e.g. 62%"
                        className="w-full sm:w-24 text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 bg-white text-center focus:outline-none focus:ring-2 focus:ring-forest-800"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-rose-700 cursor-pointer whitespace-nowrap px-2">
                        <input
                          type="checkbox"
                          checked={ing.isAllergen}
                          onChange={(e) => updateIngredient(ing.id, { isAllergen: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-medium text-[11px]">Allergen</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ing.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sourced Major Allergens */}
            <div className="space-y-3 pt-4 border-t border-cream-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">FSSAI Statutory Major Allergens</h3>
                  <p className="text-[11px] text-slate-500">Select any recognized allergen classes present in recipe:</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Human Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {FSSAI_MAJOR_ALLERGENS.map((all) => {
                  const isChecked = currentLabel.allergenDeclarations.some(d => d.toLowerCase().includes(all.key));
                  return (
                    <label key={all.key} className="flex items-center gap-2 p-2 rounded-lg border border-cream-200 hover:bg-cream-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateCurrentLabel({
                              allergenDeclarations: [...currentLabel.allergenDeclarations, `Contains ${all.label.split('&')[0].trim()}`],
                            });
                          } else {
                            updateCurrentLabel({
                              allergenDeclarations: currentLabel.allergenDeclarations.filter(d => !d.toLowerCase().includes(all.key)),
                            });
                          }
                        }}
                        className="rounded text-forest-800 focus:ring-forest-800"
                      />
                      <span className="text-[11px] text-slate-700">{all.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facility Cross-Contact Warning */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-800">
                Facility Cross-Contact Advisory
              </label>
              <input
                type="text"
                value={currentLabel.crossContactNotes}
                onChange={(e) => updateCurrentLabel({ crossContactNotes: e.target.value })}
                placeholder="e.g. Manufactured in a shared facility that also handles Sesame and Tree Nuts."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
              <p className="text-[10px] text-slate-400">Printed on the packaging panel beneath ingredients.</p>
            </div>
          </div>
        )}

        {/* STEP 3: Nutrition Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-forest-50/70 border border-forest-200 p-4 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-forest-800 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-forest-900">
                <p className="font-semibold">Mandatory Core FSSAI 2020 Nutrition Facts</p>
                <p>
                  Per 100g / 100ml declarations are statutory. Missing lab values must remain empty until verified; never invent lab test results.
                </p>
              </div>
            </div>

            {/* Serving Basis and Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Serving Basis *
                </label>
                <select
                  value={currentLabel.nutrition.servingBasis}
                  onChange={(e) => updateCurrentLabel({
                    nutrition: { ...currentLabel.nutrition, servingBasis: e.target.value }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white font-medium"
                >
                  <option value="per 100g">Per 100 g</option>
                  <option value="per 100ml">Per 100 ml</option>
                  <option value="per serving">Per Single Serving</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Serving Portion Size *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <input
                  type="text"
                  value={currentLabel.nutrition.servingSize}
                  onChange={(e) => updateCurrentLabel({
                    nutrition: { ...currentLabel.nutrition, servingSize: e.target.value }
                  })}
                  placeholder="e.g. 15 g (approx. 1 tbsp)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800 font-medium"
                />
              </div>
            </div>

            {/* Mandatory Nutrients Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Mandatory Nutritional Declarations (Per 100g/ml)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Energy (kcal) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.energyKcal ?? ''}
                    onChange={(e) => handleNutritionChange('energyKcal', e.target.value)}
                    placeholder="236"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Protein (g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.proteinG ?? ''}
                    onChange={(e) => handleNutritionChange('proteinG', e.target.value)}
                    placeholder="2.4"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Carbohydrates (g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.carbohydratesG ?? ''}
                    onChange={(e) => handleNutritionChange('carbohydratesG', e.target.value)}
                    placeholder="14.8"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Sugars (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.totalSugarsG ?? ''}
                    onChange={(e) => handleNutritionChange('totalSugarsG', e.target.value)}
                    placeholder="2.1"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Added Sugars (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.addedSugarsG ?? ''}
                    onChange={(e) => handleNutritionChange('addedSugarsG', e.target.value)}
                    placeholder="0.0"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Fat (g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.totalFatG ?? ''}
                    onChange={(e) => handleNutritionChange('totalFatG', e.target.value)}
                    placeholder="18.5"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saturated Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.saturatedFatG ?? ''}
                    onChange={(e) => handleNutritionChange('saturatedFatG', e.target.value)}
                    placeholder="2.2"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trans Fat (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentLabel.nutrition.transFatG ?? ''}
                    onChange={(e) => handleNutritionChange('transFatG', e.target.value)}
                    placeholder="0.0"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Sodium (mg) *</label>
                    <span className="text-[9px] font-bold text-rose-700">Crucial</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={currentLabel.nutrition.sodiumMg ?? ''}
                    onChange={(e) => handleNutritionChange('sodiumMg', e.target.value)}
                    placeholder="4280"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cholesterol (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentLabel.nutrition.cholesterolMg ?? ''}
                    onChange={(e) => handleNutritionChange('cholesterolMg', e.target.value)}
                    placeholder="0.0"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Traceability & FSSAI */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="p-3.5 rounded-xl bg-forest-50/70 border border-forest-200 text-xs text-forest-900">
              <strong>Step 4 Objective:</strong> Mandatory batch identification, manufacturing and expiry dates, 14-digit FSSAI licensing, and manufacturer contact details.
            </div>

            {/* Batch and Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Batch / Lot Number *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <input
                  type="text"
                  value={currentLabel.batchNumber}
                  onChange={(e) => updateCurrentLabel({ batchNumber: e.target.value })}
                  placeholder="e.g. HK-MP-24-B108"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Manufacturing Date *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <input
                  type="date"
                  value={currentLabel.mfgDate}
                  onChange={(e) => updateCurrentLabel({ mfgDate: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Expiry / Best Before Date *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Mandatory</span>
                </div>
                <input
                  type="date"
                  value={currentLabel.expiryDate}
                  onChange={(e) => updateCurrentLabel({ expiryDate: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
            </div>

            {/* FSSAI License */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    14-Digit FSSAI License Number *
                  </label>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">14 Digits</span>
                </div>
                <input
                  type="text"
                  maxLength={14}
                  value={currentLabel.fssaiLicense}
                  onChange={(e) => updateCurrentLabel({ fssaiLicense: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 10019022009841"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono tracking-wider"
                />
                <p className="text-[10px] text-slate-500 mt-1">Must be an active food business operator license registered on FoSCoS.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Barcode Number (EAN-13 / GTIN)
                </label>
                <input
                  type="text"
                  maxLength={13}
                  value={currentLabel.barcode}
                  onChange={(e) => updateCurrentLabel({ barcode: e.target.value })}
                  placeholder="e.g. 8901234567890"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Will generate vector SVG EAN-13 barcode on label.</p>
              </div>
            </div>

            {/* Storage and Directions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Storage Instructions *
                </label>
                <textarea
                  rows={2}
                  value={currentLabel.storageInstructions}
                  onChange={(e) => updateCurrentLabel({ storageInstructions: e.target.value })}
                  placeholder="e.g. Store in a cool, dry place. Protect from direct sunlight. Use a clean, dry spoon. Keep oil layer intact."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Directions For Use / Consumption Advice
                </label>
                <textarea
                  rows={2}
                  value={currentLabel.directionsForUse || ''}
                  onChange={(e) => updateCurrentLabel({ directionsForUse: e.target.value })}
                  placeholder="e.g. Stir well before serving. Best enjoyed with parathas or dal rice."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>
            </div>

            {/* Category-Specific Statutory Conditional Fields */}
            <div className="bg-cream-100/70 p-4 rounded-xl border border-cream-300 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest-800" />
                <h4 className="text-xs font-bold text-forest-950 uppercase tracking-wider">
                  Category-Specific Compliance Declarations: {currentLabel.category}
                </h4>
              </div>

              {currentLabel.category === 'Pickles, Chutneys & Condiments' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Drained Weight ({currentLabel.netQuantityUnit}) *
                      </label>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        Legal Metrology
                      </span>
                    </div>
                    <input
                      type="number"
                      value={currentLabel.drainedWeight || ''}
                      onChange={(e) => updateCurrentLabel({ drainedWeight: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 240"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Mandatory under Legal Metrology when packaged in oil/brine medium (mass of solid food excluding oil).
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Oil Layer Submersion Advisory
                    </label>
                    <input
                      type="text"
                      value={currentLabel.categorySpecificNotes || ''}
                      onChange={(e) => updateCurrentLabel({ categorySpecificNotes: e.target.value })}
                      placeholder="e.g. Keep top layer of mustard oil submerged to prevent oxidation."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      FSSAI best practice advisory for naturally fermented traditional pickles.
                    </p>
                  </div>
                </div>
              )}

              {currentLabel.category === 'Non-Alcoholic Beverages & Syrups' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Fruit Juice / Pulp Content (%) *
                      </label>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        Mandatory
                      </span>
                    </div>
                    <input
                      type="number"
                      value={currentLabel.fruitPulpPercent || ''}
                      onChange={(e) => updateCurrentLabel({ fruitPulpPercent: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 15"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Mandatory minimum fruit pulp declaration on front panel.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Caffeine Level (mg/L)
                    </label>
                    <input
                      type="number"
                      value={currentLabel.caffeineMg || ''}
                      onChange={(e) => updateCurrentLabel({ caffeineMg: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 120"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">If &gt; 145 mg/L, statutory &quot;Contains Caffeine&quot; advisory required.</p>
                  </div>
                </div>
              )}

              {currentLabel.category === 'Spices, Seasonings & Blends' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Agmark / Quality Grade Designation
                    </label>
                    <input
                      type="text"
                      value={currentLabel.categorySpecificNotes || ''}
                      onChange={(e) => updateCurrentLabel({ categorySpecificNotes: e.target.value })}
                      placeholder="e.g. AGMARK Special Grade / Grade 1 Bold"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Recommended for high-potency whole and powdered spices.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Cultivar / Regional Origin
                    </label>
                    <input
                      type="text"
                      value={currentLabel.grainGradeOrCultivar || ''}
                      onChange={(e) => updateCurrentLabel({ grainGradeOrCultivar: e.target.value })}
                      placeholder="e.g. Guntur Sannam Chili / Alleppey Finger Turmeric"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Geographical Indication (GI) or cultivar declaration if applicable.</p>
                  </div>
                </div>
              )}

              {currentLabel.category === 'Grains, Flour, Pulses & Millets' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Milling Process / Grain Variety *
                    </label>
                    <input
                      type="text"
                      value={currentLabel.grainGradeOrCultivar || ''}
                      onChange={(e) => updateCurrentLabel({ grainGradeOrCultivar: e.target.value })}
                      placeholder="e.g. Stone-Ground Traditional Chakki Atta (Unbleached)"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Specify whether unpolished, whole grain, or stone milled.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Moisture Content &amp; Aeration Advisory
                    </label>
                    <input
                      type="text"
                      value={currentLabel.categorySpecificNotes || ''}
                      onChange={(e) => updateCurrentLabel({ categorySpecificNotes: e.target.value })}
                      placeholder="e.g. Moisture &le; 13.0%. Store in cool dry airtight container."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Recommended for preventing weevil infestation and grain moisture spoilage.</p>
                  </div>
                </div>
              )}

              {currentLabel.category === 'Honey, Cold-Pressed Oils & Agritech Produce' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Extraction Method / Harvest Type *
                      </label>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Agritech Declaration
                      </span>
                    </div>
                    <input
                      type="text"
                      value={currentLabel.extractionMethodOrSource || ''}
                      onChange={(e) => updateCurrentLabel({ extractionMethodOrSource: e.target.value })}
                      placeholder="e.g. Traditional Wood-Pressed / Kachi Ghani (Unrefined)"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Must state if cold-pressed, wood-pressed, or unpasteurized forest honey.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Botanical / Floral Flora Origin
                    </label>
                    <input
                      type="text"
                      value={currentLabel.categorySpecificNotes || ''}
                      onChange={(e) => updateCurrentLabel({ categorySpecificNotes: e.target.value })}
                      placeholder="e.g. Mustard Blossom Mono-Floral Honey / Native Sesame"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Identifies single-source agricultural provenance.</p>
                  </div>
                </div>
              )}

              {currentLabel.category === 'Fruit & Vegetable Processing (Jams, Purees)' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Fruit Content (% by mass) *
                      </label>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        FSSAI Mandatory
                      </span>
                    </div>
                    <input
                      type="number"
                      value={currentLabel.fruitPulpPercent || ''}
                      onChange={(e) => updateCurrentLabel({ fruitPulpPercent: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 45"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Minimum 45% fruit content required for standard Fruit Jam (FSSAI 2.3.30).</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Total Soluble Solids (&deg;Brix min)
                    </label>
                    <input
                      type="number"
                      value={currentLabel.brixDegrees || ''}
                      onChange={(e) => updateCurrentLabel({ brixDegrees: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 68"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Jam standard: Minimum 65 &deg;Brix refractometer reading.</p>
                  </div>
                </div>
              )}

              {currentLabel.category === 'Dairy Products & Analogues' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Milk Fat (% minimum)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentLabel.dairyFatPercent || ''}
                      onChange={(e) => updateCurrentLabel({ dairyFatPercent: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 6.0"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Mandatory statutory declaration for milk, ghee, paneer, and butter.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Milk Solids-Not-Fat (SNF %)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentLabel.dairySnfPercent || ''}
                      onChange={(e) => updateCurrentLabel({ dairySnfPercent: parseFloat(e.target.value) || null })}
                      placeholder="e.g. 9.0"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Declared per FSSAI dairy standards table.</p>
                  </div>
                </div>
              )}

              {currentLabel.category === 'Custom Food Category' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Custom Statutory Declaration / Advisory Note
                  </label>
                  <textarea
                    rows={2}
                    value={currentLabel.categorySpecificNotes || ''}
                    onChange={(e) => updateCurrentLabel({ categorySpecificNotes: e.target.value })}
                    placeholder="Enter any tailored statutory advisories or specific certification declarations..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-cream-300 bg-white"
                  />
                </div>
              )}

              {currentLabel.category === 'Bakery, Snacks & Confectionery' && (
                <div className="text-[11px] text-slate-600">
                  Standard pre-packaged commodity rules apply. Ensure accurate allergen warnings for gluten/nuts and moisture barrier storage instructions.
                </div>
              )}
            </div>

            {/* Manufacturer Details */}
            <div className="space-y-4 pt-4 border-t border-cream-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Manufacturer / Packer Information *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Entity Name *</label>
                  <input
                    type="text"
                    value={currentLabel.manufacturer.name}
                    onChange={(e) => updateCurrentLabel({ manufacturer: { ...currentLabel.manufacturer, name: e.target.value } })}
                    placeholder="e.g. Heritage Kitchen Foods Pvt. Ltd."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Street Address / Industrial Estate *</label>
                  <input
                    type="text"
                    value={currentLabel.manufacturer.address}
                    onChange={(e) => updateCurrentLabel({ manufacturer: { ...currentLabel.manufacturer, address: e.target.value } })}
                    placeholder="Plot 42, Industrial Area, Gagret Road"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Care Contact / Phone *</label>
                  <input
                    type="text"
                    value={currentLabel.manufacturer.customerCarePhone}
                    onChange={(e) => updateCurrentLabel({ manufacturer: { ...currentLabel.manufacturer, customerCarePhone: e.target.value } })}
                    placeholder="+91 1800 200 4545"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Care Email *</label>
                  <input
                    type="email"
                    value={currentLabel.manufacturer.customerCareEmail}
                    onChange={(e) => updateCurrentLabel({ manufacturer: { ...currentLabel.manufacturer, customerCareEmail: e.target.value } })}
                    placeholder="care@heritagekitchenfoods.in"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Packaging & Label Dimensions */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-forest-50/70 border border-forest-200">
              <h3 className="text-xs font-bold text-forest-950">Packaging Dimensions & Physical Presets</h3>
              <p className="text-xs text-forest-800 mt-0.5">
                Physical label dimensions dictate legal font sizes and printable layout area. Presets represent standard Indian food packaging containers.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">Container Presets</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {COMMON_LABEL_PRESETS.map((preset) => {
                  const isSelected = 
                    currentLabel.dimensions.width === preset.width && 
                    currentLabel.dimensions.height === preset.height &&
                    currentLabel.dimensions.unit === preset.unit;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateCurrentLabel({
                        dimensions: {
                          ...currentLabel.dimensions,
                          width: preset.width,
                          height: preset.height,
                          unit: preset.unit,
                          orientation: preset.orientation,
                          layoutStyle: preset.layoutStyle,
                        }
                      })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-forest-900 bg-forest-50/60 ring-2 ring-forest-800'
                          : 'border-cream-200 hover:border-forest-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-900">{preset.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-1">
                        {preset.width} × {preset.height} {preset.unit} ({preset.orientation})
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Dimensions Form */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-cream-200">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Width *</label>
                <input
                  type="number"
                  min="20"
                  value={currentLabel.dimensions.width}
                  onChange={(e) => updateCurrentLabel({
                    dimensions: { ...currentLabel.dimensions, width: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Height *</label>
                <input
                  type="number"
                  min="20"
                  value={currentLabel.dimensions.height}
                  onChange={(e) => updateCurrentLabel({
                    dimensions: { ...currentLabel.dimensions, height: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Measurement Unit</label>
                <select
                  value={currentLabel.dimensions.unit}
                  onChange={(e) => updateCurrentLabel({
                    dimensions: { ...currentLabel.dimensions, unit: e.target.value as MeasurementUnit }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white"
                >
                  <option value="mm">Millimetres (mm)</option>
                  <option value="cm">Centimetres (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Orientation</label>
                <select
                  value={currentLabel.dimensions.orientation}
                  onChange={(e) => updateCurrentLabel({
                    dimensions: { ...currentLabel.dimensions, orientation: e.target.value as Orientation }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white"
                >
                  <option value="landscape">Landscape (Wrap Around)</option>
                  <option value="portrait">Portrait (Upright Front)</option>
                </select>
              </div>
            </div>

            {/* Layout Style and Margins */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Panel Configuration</label>
                <select
                  value={currentLabel.dimensions.layoutStyle}
                  onChange={(e) => updateCurrentLabel({
                    dimensions: { ...currentLabel.dimensions, layoutStyle: e.target.value as LayoutStyle }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white"
                >
                  <option value="two-panel">Two-Panel Wrap (PDP + Information)</option>
                  <option value="standard">Single Panel Front Display</option>
                  <option value="minimal">Compact Minimalist Format</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Bleed Margin ({currentLabel.dimensions.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={currentLabel.dimensions.bleed}
                  onChange={(e) => updateCurrentLabel({
                    dimensions: { ...currentLabel.dimensions, bleed: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Safe Margin ({currentLabel.dimensions.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={currentLabel.dimensions.safeMargin}
                  onChange={(e) => updateCurrentLabel({
                    dimensions: { ...currentLabel.dimensions, safeMargin: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 font-mono"
                />
              </div>
            </div>

            {/* Brand Logo Upload */}
            <div className="pt-4 border-t border-cream-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Brand Logo (Optional Image)
              </label>
              <div className="flex items-center gap-4">
                {currentLabel.brandLogoUrl ? (
                  <div className="relative w-16 h-16 rounded-xl border border-cream-300 overflow-hidden bg-white p-1 flex items-center justify-center">
                    <img src={currentLabel.brandLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => updateCurrentLabel({ brandLogoUrl: undefined })}
                      className="absolute top-0 right-0 p-1 bg-rose-600 text-white rounded-bl-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-cream-300 hover:border-forest-600 bg-cream-50 text-xs text-slate-600">
                    <span>Upload Brand Logo (PNG / JPG / SVG)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateCurrentLabel({ brandLogoUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-cream-200">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => {
              setStepErrors([]);
              setCurrentStep(prev => Math.max(1, prev - 1));
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-cream-300 text-slate-700 font-semibold text-xs hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Step
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
            >
              Continue to {steps[currentStep].title}
              <ArrowRight className="w-4 h-4 text-limeaccent-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const errs = validateStep(5);
                if (errs.length > 0) {
                  setStepErrors(errs);
                  return;
                }
                saveCurrentProduct();
                setActiveTab('editor');
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-limeaccent-400 hover:bg-limeaccent-300 text-forest-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              Finish & Open Live Editor
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
