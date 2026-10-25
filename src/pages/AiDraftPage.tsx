import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
import { SUPPORTED_FOOD_CATEGORIES, FoodCategoryConfig } from '../data/fssaiRules';
import { FieldProvenance, ProductLabel } from '../types/label';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Upload, 
  HelpCircle, 
  RefreshCw, 
  Edit3, 
  Info, 
  Layers, 
  ShieldCheck, 
  Check, 
  Tag,
  Package,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';

export const AiDraftPage: React.FC = () => {
  const { updateCurrentLabel, setActiveTab, showToast, settings } = useLabel();

  // Input Form State
  const [selectedCategory, setSelectedCategory] = useState<string>(SUPPORTED_FOOD_CATEGORIES[0].name);
  const [description, setDescription] = useState<string>('');
  const [supportFile, setSupportFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showKnownAccordion, setShowKnownAccordion] = useState<boolean>(false);

  // Voice speech state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<string>('en-IN');

  // Optional known fields
  const [knownBrand, setKnownBrand] = useState<string>('');
  const [knownNetQty, setKnownNetQty] = useState<string>('');
  const [knownFssai, setKnownFssai] = useState<string>('');

  // Generated Draft & Review State
  const [draftResult, setDraftResult] = useState<any | null>(null);
  const [generationMethod, setGenerationMethod] = useState<string>('');

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice transcription is not supported in this browser. Please use Chrome, Edge, or Safari.', 'warning');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your food product or recipe details clearly.', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
        showToast('Voice transcription captured!', 'success');
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        showToast(`Voice input error: ${event.error}`, 'warning');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const currentCategoryConfig = SUPPORTED_FOOD_CATEGORIES.find(c => c.name === selectedCategory) || SUPPORTED_FOOD_CATEGORIES[0];

  // Quick farmer examples for instant testing
  const loadExample = (categoryName: string, textExample: string, brand?: string, net?: string) => {
    setSelectedCategory(categoryName);
    setDescription(textExample);
    if (brand) setKnownBrand(brand);
    if (net) setKnownNetQty(net);
    setDraftResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSupportFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const executeGenerateDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim() && !supportFile && !knownBrand) {
      showToast('Please provide a brief product description or upload a recipe/label document.', 'warning');
      return;
    }

    setIsGenerating(true);
    showToast('Analyzing product formulation & packaging requirements...', 'info');

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('category', selectedCategory);
      formData.append('jurisdiction', settings.defaultJurisdiction || 'FSSAI (India)');
      if (supportFile) {
        formData.append('supportFile', supportFile);
      }
      formData.append('knownFields', JSON.stringify({
        brandName: knownBrand.trim(),
        netQuantity: knownNetQty ? parseFloat(knownNetQty) : undefined,
        fssaiLicense: knownFssai.trim(),
      }));

      const headers: Record<string, string> = {};
      if (settings.geminiApiKey) {
        headers['x-gemini-key'] = settings.geminiApiKey;
      }

      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setDraftResult(data.draft);
      setGenerationMethod(data.method || 'Deterministic Agricultural Rule Engine');
      showToast('Label draft generated successfully! Review and edit suggested values below.', 'success');
    } catch (err: any) {
      console.error('Draft error:', err);
      showToast(`Draft generation failed: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Transfer confirmed draft into the visual label canvas
  const applyDraftToCanvas = () => {
    if (!draftResult) return;

    updateCurrentLabel({
      productName: draftResult.productName || 'Artisan Food Product',
      brandName: draftResult.brandName || 'Brand Name',
      category: draftResult.category || selectedCategory,
      description: draftResult.description || '',
      netQuantity: draftResult.netQuantity || 400,
      netQuantityUnit: draftResult.netQuantityUnit || 'g',
      fssaiLicense: draftResult.fssaiLicense || '',
      dietaryClassification: draftResult.dietaryClassification || 'veg',
      isSingleIngredientProduce: draftResult.isSingleIngredientProduce || false,
      ingredients: (draftResult.ingredients || []).map((ing: any, idx: number) => ({
        id: `ing-ai-${idx}`,
        name: ing.name || '',
        percentage: ing.percentage || '',
        order: idx + 1,
        isAllergen: Boolean(ing.isAllergen),
      })),
      allergenDeclarations: draftResult.allergenDeclarations || [],
      nutrition: {
        servingBasis: draftResult.nutrition?.servingBasis || 'per 100g',
        servingSize: draftResult.nutrition?.servingSize || '100g',
        energyKcal: draftResult.nutrition?.energyKcal ?? null,
        proteinG: draftResult.nutrition?.proteinG ?? null,
        carbohydratesG: draftResult.nutrition?.carbohydratesG ?? null,
        totalSugarsG: draftResult.nutrition?.totalSugarsG ?? null,
        addedSugarsG: draftResult.nutrition?.addedSugarsG ?? null,
        totalFatG: draftResult.nutrition?.totalFatG ?? null,
        saturatedFatG: draftResult.nutrition?.saturatedFatG ?? null,
        transFatG: draftResult.nutrition?.transFatG ?? null,
        cholesterolMg: draftResult.nutrition?.cholesterolMg ?? null,
        sodiumMg: draftResult.nutrition?.sodiumMg ?? null,
      },
      storageInstructions: draftResult.storageInstructions || 'Store in a cool dry place.',
      directionsForUse: draftResult.directionsForUse || '',
      bestBeforeMonths: draftResult.bestBeforeMonths || 12,
      dimensions: {
        width: draftResult.suggestedPackaging?.width || 120,
        height: draftResult.suggestedPackaging?.height || 75,
        unit: 'mm',
        orientation: (draftResult.suggestedPackaging?.width || 120) >= (draftResult.suggestedPackaging?.height || 75) ? 'landscape' : 'portrait',
        bleed: 2,
        safeMargin: 3,
        layoutStyle: draftResult.suggestedPackaging?.layoutStyle || 'two-panel',
        fontSizeScale: 1.0,
        showBarcode: true,
        showQrCode: true,
        showVegLogo: true,
        showNutritionTable: true,
        showBilingualTitles: false,
        labelTheme: draftResult.suggestedPackaging?.theme || 'heritage-premium',
        textAlign: 'left',
        borderRadiusMm: 3,
      },
      provenanceMap: draftResult.provenanceMap || {},
      isDemoSample: false,
    });

    showToast('Loaded AI draft into Physical Label Editor!', 'success');
    setActiveTab('editor');
  };

  const getProvenanceBadge = (fieldKey: string) => {
    const prov: FieldProvenance = draftResult?.provenanceMap?.[fieldKey] || 'ai_suggestion';
    switch (prov) {
      case 'user_input':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">User Provided</span>;
      case 'uploaded_document':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">Document Extracted</span>;
      case 'verified_calculation':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">Deterministic Rule</span>;
      case 'ocr_extraction':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">OCR Extracted</span>;
      case 'ai_suggestion':
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><span>AI Inferred</span><span className="font-normal text-[9px]">(Confirm)</span></span>;
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-forest-950 text-white rounded-3xl p-6 sm:p-10 border border-forest-800/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-limeaccent-400/15 border border-limeaccent-400/30 text-limeaccent-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-limeaccent-400" />
            <span>Create with AI • Farmer-First Assist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
            Describe your product in plain language.
          </h1>
          <p className="text-cream-200 text-sm sm:text-base leading-relaxed">
            No design software required. Simply tell us about your recipe, produce, or food specialty. LabelIQ analyzes your description, detects allergens, recommends container sizing, and builds an editable packaging proof.
          </p>
        </div>
      </div>

      {!draftResult ? (
        /* 2. INPUT FORM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-cream-200 shadow-sm p-6 sm:p-8 space-y-6">
            <form onSubmit={executeGenerateDraft} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Select Food Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
                >
                  {SUPPORTED_FOOD_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  {currentCategoryConfig.shortDesc}
                </p>
              </div>

              {/* Natural Language Description with Voice Input */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Describe Your Product or Recipe
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Voice Language Selector */}
                    <select
                      value={speechLanguage}
                      onChange={(e) => setSpeechLanguage(e.target.value)}
                      className="text-[11px] bg-cream-50 border border-cream-300 rounded-lg px-2 py-1 text-slate-700 font-medium"
                      title="Voice Input Language"
                    >
                      <option value="en-IN">English (India)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="te-IN">Telugu (తెలుగు)</option>
                      <option value="ta-IN">Tamil (தமிழ்)</option>
                      <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                      <option value="mr-IN">Marathi (मराठी)</option>
                      <option value="bn-IN">Bengali (বাংলা)</option>
                    </select>

                    {/* Microphone Toggle Button */}
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                        isListening
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-forest-900 hover:bg-forest-800 text-limeaccent-300'
                      }`}
                      title="Dictate product description using microphone"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Voice Dictation</span>
                        </>
                      )}
                    </button>

                    {description && (
                      <button
                        type="button"
                        onClick={() => setDescription('')}
                        className="text-[11px] text-slate-400 hover:text-red-600 font-medium px-1.5"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={currentCategoryConfig.placeholderDescription}
                  className="w-full p-4 rounded-2xl border border-cream-300 bg-cream-50/30 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Describe ingredients, processing (sun-dried, cold-pressed), container size, and shelf life.</span>
                  <span>{description.length} chars</span>
                </div>
              </div>

              {/* Optional Recipe Sheet / Supporting Document Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Supporting Document / Photo (Optional)
                </label>
                <div className="border-2 border-dashed border-cream-300 rounded-2xl p-4 text-center hover:bg-cream-50/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="support-doc-upload"
                  />
                  <label htmlFor="support-doc-upload" className="cursor-pointer block space-y-2">
                    <Upload className="w-6 h-6 text-forest-800 mx-auto" />
                    <span className="text-xs font-semibold text-forest-900 block">
                      {supportFile ? supportFile.name : 'Upload handwritten recipe notes, packaging photo, or lab certificate'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">JPG, PNG, WebP or PDF (Max 10MB)</span>
                  </label>

                  {filePreview && (
                    <div className="mt-3 inline-block relative rounded-xl overflow-hidden border border-cream-200">
                      <img src={filePreview} alt="Preview" className="h-20 w-auto object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Known Facts Accordion */}
              <div className="border border-cream-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowKnownAccordion(!showKnownAccordion)}
                  className="w-full px-4 py-3 bg-cream-50/80 flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:bg-cream-100/80 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-forest-800" />
                    <span>Enter Only What You Already Know (Optional Details)</span>
                  </span>
                  {showKnownAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showKnownAccordion && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white text-xs">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={knownBrand}
                        onChange={(e) => setKnownBrand(e.target.value)}
                        placeholder="e.g. Sahyadri Organics"
                        className="w-full px-3 py-2 rounded-xl border border-cream-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Net Weight</label>
                      <input
                        type="text"
                        value={knownNetQty}
                        onChange={(e) => setKnownNetQty(e.target.value)}
                        placeholder="e.g. 400"
                        className="w-full px-3 py-2 rounded-xl border border-cream-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">FSSAI Lic. (If Assigned)</label>
                      <input
                        type="text"
                        value={knownFssai}
                        onChange={(e) => setKnownFssai(e.target.value)}
                        placeholder="14-digit number"
                        className="w-full px-3 py-2 rounded-xl border border-cream-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit & Demo Actions */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-limeaccent-400" />
                      <span>Generating Label Draft...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-limeaccent-400" />
                      <span>Generate Editable Label Draft &rarr;</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      loadExample(
                        'Pickles, Chutneys, Sauces & Condiments',
                        'Traditional sun-cured raw green mango pickle made in cold-pressed mustard oil with fenugreek seeds, kashmiri red chilli, turmeric and sea salt. Packed in 400g glass jar. Best before 12 months.',
                        'Dadi\'s Heritage Kitchen',
                        '400'
                      );
                      setTimeout(() => executeGenerateDraft(), 50);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-950 underline cursor-pointer"
                  >
                    <span>⚡ Try Instant Demo (Pahadi Pickle • No API Key Needed)</span>
                  </button>
                  <span className="text-[11px] text-slate-400">Deterministic fallback ready</span>
                </div>
              </div>

              {/* Regulatory Advisory Notice */}
              <div className="p-3.5 rounded-xl bg-cream-100/70 border border-cream-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-forest-800 shrink-0 mt-0.5" />
                <span>
                  <strong>Advisory Draft Only:</strong> Algorithmic AI generation provides packaging formulation structure based on FSSAI guidelines. It does not replace statutory laboratory certification or official regulatory inspection.
                </span>
              </div>
            </form>
          </div>

          {/* Quick Farmer Templates Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-cream-100/60 rounded-3xl p-5 border border-cream-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-forest-800" />
                <span>Try an Artisan Example</span>
              </h3>
              <p className="text-xs text-slate-600 leading-snug">
                Click any real food recipe below to see how LabelIQ structures natural descriptions into ready-to-print packaging:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => loadExample(
                    'Pickles, Chutneys, Sauces & Condiments',
                    'Traditional sun-cured raw green mango pickle made in cold-pressed mustard oil with fenugreek seeds, kashmiri red chilli, turmeric and sea salt. Packed in 400g glass jar. Best before 12 months.',
                    'Dadi\'s Heritage Kitchen',
                    '400'
                  )}
                  className="w-full p-3 rounded-2xl bg-white border border-cream-300 hover:border-forest-700 text-left text-xs space-y-1 transition-all shadow-xs"
                >
                  <div className="font-bold text-forest-900">🥭 Sun-Cured Raw Mango Pickle</div>
                  <div className="text-[11px] text-slate-500">Pickles in cold-pressed mustard oil with fenugreek (400g)</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadExample(
                    'Honey, Jaggery & Sweeteners',
                    '100% pure raw unprocessed forest wildflower honey harvested by tribal beekeepers in Western Ghats. Unfiltered, non-pasteurized, naturally crystallizes. 500g glass jar. Best before 18 months.',
                    'Sahyadri Forest Honey',
                    '500'
                  )}
                  className="w-full p-3 rounded-2xl bg-white border border-cream-300 hover:border-forest-700 text-left text-xs space-y-1 transition-all shadow-xs"
                >
                  <div className="font-bold text-forest-900">🍯 Raw Wildflower Forest Honey</div>
                  <div className="text-[11px] text-slate-500">Single-ingredient unprocessed forest honey (500g)</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadExample(
                    'Spices, Masalas & Seasonings',
                    'Pure single-origin Lakadong turmeric powder from Jaintia Hills, Meghalaya with guaranteed 7.5% natural curcumin content. Sun-dried, unadulterated, stone-ground. 250g moisture-barrier pouch. Best before 18 months.',
                    'Khasi Heritage Botanicals',
                    '250'
                  )}
                  className="w-full p-3 rounded-2xl bg-white border border-cream-300 hover:border-forest-700 text-left text-xs space-y-1 transition-all shadow-xs"
                >
                  <div className="font-bold text-forest-900">🌿 Lakadong High-Curcumin Turmeric</div>
                  <div className="text-[11px] text-slate-500">Single-origin GI spice with 7.5% natural curcumin (250g)</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadExample(
                    'Dairy Products & Desi Ghee',
                    'Traditional Bilona Cow Ghee made from grass-fed Gir cow A2 curd churned in wooden churner and clarified over slow cow-dung fire. Golden granular texture, rich aroma. 500ml glass jar. Best before 9 months.',
                    'Vedic Gau Ras',
                    '500'
                  )}
                  className="w-full p-3 rounded-2xl bg-white border border-cream-300 hover:border-forest-700 text-left text-xs space-y-1 transition-all shadow-xs"
                >
                  <div className="font-bold text-forest-900">🧈 Vedic Gir Cow A2 Bilona Ghee</div>
                  <div className="text-[11px] text-slate-500">Cultured bilona method pure desi ghee (500ml)</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadExample(
                    'Grains, Millets, Rice & Flour',
                    'Traditional unpolished foxtail millet grain harvested from organic rainfed farms in Karnataka. Naturally gluten-free, rich in dietary fiber. Packed in 1kg zipper pouch.',
                    'Deccan Heirloom Millets',
                    '1000'
                  )}
                  className="w-full p-3 rounded-2xl bg-white border border-cream-300 hover:border-forest-700 text-left text-xs space-y-1 transition-all shadow-xs"
                >
                  <div className="font-bold text-forest-900">🌾 Unpolished Foxtail Millet</div>
                  <div className="text-[11px] text-slate-500">Naturally gluten-free whole millet grain (1kg)</div>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Nutrition Hallucination</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                LabelIQ never invents fake nutrition assay values from culinary text. You can review and verify all values before printing.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* 3. REVIEW & VERIFICATION SCREEN */
        <div className="bg-white rounded-3xl border border-cream-200 shadow-xl p-6 sm:p-10 space-y-8 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cream-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">Review Suggested Draft</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-forest-900 text-limeaccent-400">
                  {generationMethod}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {draftResult.productName || 'Generated Product Draft'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDraftResult(null)}
                className="px-4 py-2.5 rounded-xl border border-cream-300 text-slate-600 hover:bg-cream-50 text-xs font-bold transition-all"
              >
                &larr; Edit Description
              </button>

              <button
                type="button"
                onClick={applyDraftToCanvas}
                className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span>Transfer to Label Canvas</span>
                <ArrowRight className="w-4 h-4 text-limeaccent-400" />
              </button>
            </div>
          </div>

          {/* Review Prompts & Notices */}
          {draftResult.reviewPrompts && draftResult.reviewPrompts.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Verification Checklist:</span>
              </span>
              <ul className="list-disc list-inside text-xs text-amber-900 space-y-0.5 pl-1">
                {draftResult.reviewPrompts.map((prompt: string, idx: number) => (
                  <li key={idx}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Fields Review Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Field: Product Name */}
            <div className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 uppercase tracking-wide">Product Title</label>
                {getProvenanceBadge('productName')}
              </div>
              <input
                type="text"
                value={draftResult.productName || ''}
                onChange={(e) => setDraftResult({ ...draftResult, productName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-bold text-sm"
              />
            </div>

            {/* Field: Brand Name */}
            <div className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 uppercase tracking-wide">Brand Name</label>
                {getProvenanceBadge('brandName')}
              </div>
              <input
                type="text"
                value={draftResult.brandName || ''}
                onChange={(e) => setDraftResult({ ...draftResult, brandName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-bold text-sm"
              />
            </div>

            {/* Field: Net Quantity */}
            <div className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 uppercase tracking-wide">Declared Net Quantity</label>
                {getProvenanceBadge('netQuantity')}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={draftResult.netQuantity || ''}
                  onChange={(e) => setDraftResult({ ...draftResult, netQuantity: parseFloat(e.target.value) || 0 })}
                  className="w-2/3 px-3 py-2 rounded-xl border border-cream-300 bg-white font-bold text-sm"
                />
                <select
                  value={draftResult.netQuantityUnit || 'g'}
                  onChange={(e) => setDraftResult({ ...draftResult, netQuantityUnit: e.target.value })}
                  className="w-1/3 px-3 py-2 rounded-xl border border-cream-300 bg-white font-bold text-sm"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                </select>
              </div>
            </div>

            {/* Field: FSSAI License */}
            <div className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 uppercase tracking-wide">14-Digit FSSAI License</label>
                {getProvenanceBadge('fssaiLicense')}
              </div>
              <input
                type="text"
                value={draftResult.fssaiLicense || ''}
                placeholder="Enter 14-digit license number"
                onChange={(e) => setDraftResult({ ...draftResult, fssaiLicense: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-mono text-sm"
              />
            </div>

            {/* Field: Ingredients List (Full Span) */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Ingredients Declaration</label>
                  <span className="text-[11px] text-slate-500">Ordered in descending order of incoming weight</span>
                </div>
                {getProvenanceBadge('ingredients')}
              </div>

              <div className="space-y-2">
                {(draftResult.ingredients || []).map((ing: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-cream-200">
                    <span className="font-mono text-slate-400 text-xs w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => {
                        const updated = [...draftResult.ingredients];
                        updated[idx].name = e.target.value;
                        setDraftResult({ ...draftResult, ingredients: updated });
                      }}
                      className="flex-1 px-2 py-1 border border-cream-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={ing.percentage || ''}
                      placeholder="%"
                      onChange={(e) => {
                        const updated = [...draftResult.ingredients];
                        updated[idx].percentage = e.target.value;
                        setDraftResult({ ...draftResult, ingredients: updated });
                      }}
                      className="w-16 px-2 py-1 border border-cream-300 rounded-lg text-xs text-center"
                    />
                    <label className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ing.isAllergen || false}
                        onChange={(e) => {
                          const updated = [...draftResult.ingredients];
                          updated[idx].isAllergen = e.target.checked;
                          setDraftResult({ ...draftResult, ingredients: updated });
                        }}
                        className="rounded text-rose-600"
                      />
                      <span>Allergen</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Field: Allergen Declaration */}
            <div className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 uppercase tracking-wide">Allergen Advice Statement</label>
                {getProvenanceBadge('allergenDeclarations')}
              </div>
              <input
                type="text"
                value={(draftResult.allergenDeclarations || []).join(' ')}
                onChange={(e) => setDraftResult({ ...draftResult, allergenDeclarations: [e.target.value] })}
                className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-rose-600"
              />
            </div>

            {/* Field: Packaging Recommendation */}
            <div className="p-4 rounded-2xl bg-forest-900 text-white space-y-2">
              <div className="flex items-center justify-between text-cream-200">
                <label className="font-bold uppercase tracking-wide">Suggested Packaging</label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 text-limeaccent-400 border border-limeaccent-400/40">
                  Recommended Rationale
                </span>
              </div>
              <div className="font-bold text-sm text-limeaccent-300">
                {draftResult.suggestedPackaging?.format} ({draftResult.suggestedPackaging?.width}×{draftResult.suggestedPackaging?.height}mm)
              </div>
              <p className="text-[11px] text-cream-300 leading-snug">
                Theme: <strong className="text-white capitalize">{draftResult.suggestedPackaging?.theme?.replace('-', ' ')}</strong> • Layout: <strong className="text-white">{draftResult.suggestedPackaging?.layoutStyle}</strong>. Provides dedicated info panel for ingredient and regulatory declarations.
              </p>
            </div>
          </div>

          {/* Bottom Confirmation Bar */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ready to adjust colors, typography, barcodes, and batch lot numbers?
            </span>
            <button
              type="button"
              onClick={applyDraftToCanvas}
              className="px-6 py-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <span>Confirm & Open in Label Canvas</span>
              <ArrowRight className="w-4 h-4 text-limeaccent-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
