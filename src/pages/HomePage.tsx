import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
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
  Calendar, 
  Download, 
  Check, 
  Wheat, 
  Eye,
  QrCode,
  Smartphone,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { QrCodeSvg } from '../utils/barcodeGenerator';
import { OFFICIAL_FSSAI_VERIFY_PORTAL } from '../utils/batchUtils';

export const HomePage: React.FC = () => {
  const { setActiveTab, resetToDemo, createNewBlankLabel, batches, updateCurrentLabel } = useLabel();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleLaunchSample = async (type: 'pickle' | 'honey' | 'turmeric') => {
    setDemoLoading(true);
    try {
      if (type === 'pickle') {
        await resetToDemo();
      } else if (type === 'honey') {
        updateCurrentLabel({
          productName: 'Raw Wildflower Forest Honey',
          brandName: 'Sahyadri Forest Honey',
          category: 'Honey, Jaggery & Sweeteners',
          netQuantity: 500,
          netQuantityUnit: 'g',
          fssaiLicense: '10022099001144',
          dietaryClassification: 'veg',
          isSingleIngredientProduce: true,
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
          batchNumber: 'SFH-2024-H05',
          mfgDate: new Date().toISOString().split('T')[0],
          expiryDate: '2026-10-25',
          storageInstructions: 'Store at room temperature in a dry place. Do not refrigerate. Non-pasteurized honey may naturally crystallize.',
          tasteAndOrigin: {
            enabled: true,
            theme: 'organic',
            tastingNotes: ['Floral Wildflower', 'Caramel Undertones', 'Rich Amber'],
            aromaProfile: 'Woody, fresh bloom forest nectar',
            texture: 'Viscous, raw granular crystals',
            servingSuggestions: 'Warm herbal tea, sourdough toast, curd bowls',
            regionalOrigin: 'Western Ghats Forest Canopy, 1100m MSL',
            producerStory: 'Harvested ethically by indigenous tribal gatherers from wild Apis dorsata honeycombs deep within protected Sahyadri biosphere.',
            elevationMeters: 1100
          }
        });
      } else if (type === 'turmeric') {
        updateCurrentLabel({
          productName: 'Lakadong High-Curcumin Turmeric',
          brandName: 'Khasi Heritage Botanicals',
          category: 'Spices, Masalas & Seasonings',
          netQuantity: 250,
          netQuantityUnit: 'g',
          fssaiLicense: '10022099001144',
          dietaryClassification: 'veg',
          isSingleIngredientProduce: true,
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
          batchNumber: 'KHB-2024-T09',
          mfgDate: new Date().toISOString().split('T')[0],
          expiryDate: '2026-04-25',
          storageInstructions: 'Store in an airtight container away from direct sunlight.',
          tasteAndOrigin: {
            enabled: true,
            theme: 'artisanal',
            tastingNotes: ['Earthy', 'Warm Pungency', 'Golden Hue'],
            aromaProfile: 'Intense herbal warmth, distinctive peppery notes',
            texture: 'Micro-milled ultra-fine stone-ground powder',
            servingSuggestions: 'Golden milk, heritage curries, ayurvedic infusions',
            regionalOrigin: 'Jaintia Hills, Meghalaya (7.5%+ natural curcumin content)',
            producerStory: 'Grown exclusively by Khasi women farmer collectives using regenerative organic compost without synthetic chemical inputs.',
            elevationMeters: 1350
          }
        });
      }
      setActiveTab('editor');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCreateManually = () => {
    createNewBlankLabel();
    setActiveTab('create');
  };


  const categories = [
    { name: 'Pickles & Preserves', desc: 'Mango, Lime, Mixed' },
    { name: 'Honey & Jaggery', desc: 'Raw, Multi-flora, Bilona' },
    { name: 'Spices & Masalas', desc: 'Turmeric, Chilli, Garam' },
    { name: 'Grains & Millets', desc: 'Ragi, Jowar, Basmati' },
    { name: 'Fresh Produce', desc: 'Orchard Fruits, Greens' },
    { name: 'Dairy & Ghee', desc: 'Desi A2 Ghee, Butter' },
    { name: 'Bakery & Sweets', desc: 'Cookies, Breads, Ladoos' },
    { name: 'Beverages', desc: 'Cold Pressed Juices, Teas' },
    { name: 'Snacks & Namkeen', desc: 'Roasted Bhujia, Chips' },
    { name: 'Ready to Cook', desc: 'Dosa Mixes, Chutneys' },
    { name: 'Sauces & Pastes', desc: 'Mustard Kasundi, Dips' }
  ];

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
      {/* 1. HERO SECTION: Farmer-friendly headline, agritech hero photo, and 4 primary starting actions */}
      <section className="relative overflow-hidden rounded-3xl bg-forest-950 text-white p-6 sm:p-10 lg:p-12 border border-forest-800 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-grid-dots pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-limeaccent-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-900 border border-limeaccent-400/30 text-limeaccent-300 text-xs font-semibold tracking-wider uppercase shadow-xs">
              <Wheat className="w-4 h-4 text-limeaccent-400" />
              <span>LabelIQ Studio 4.0 • Built for Farmers, Kitchen Artisans & Agritech Processors</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-serif leading-[1.12]">
              Turn your food harvest into <span className="text-limeaccent-400 font-sans">compliant, print-ready labels</span>.
            </h1>

            <p className="text-base sm:text-lg text-cream-200/90 leading-relaxed font-normal max-w-2xl">
              An accessible food packaging and label management system. Generate editable drafts from plain-language descriptions, scan existing jars or pouches with your device camera, and calculate statutory dates with zero fabricated data.
            </p>

            {/* 4 PRIMARY STARTING ACTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Action 1: Create with AI */}
              <div 
                onClick={() => setActiveTab('ai-draft')}
                className="group p-4 rounded-2xl bg-forest-900/90 hover:bg-forest-900 border-2 border-limeaccent-400/40 hover:border-limeaccent-400 cursor-pointer transition-all shadow-md hover:shadow-limeaccent-400/15 flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-limeaccent-400/20 text-limeaccent-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-limeaccent-300 transition-colors">
                    1. Create with AI Draft
                  </h3>
                  <p className="text-[11px] text-cream-300/80 mt-0.5 leading-snug">
                    Type a recipe in plain words. Get editable front, back, and nutrition panels.
                  </p>
                </div>
              </div>

              {/* Action 2: Scan Existing Label */}
              <div 
                onClick={() => setActiveTab('scanner')}
                className="group p-4 rounded-2xl bg-forest-900/60 hover:bg-forest-900 border border-forest-700 hover:border-forest-500 cursor-pointer transition-all shadow-sm flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-forest-800 text-cream-200 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Scan className="w-5 h-5 text-limeaccent-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cream-100 transition-colors">
                    2. Scan an Existing Label
                  </h3>
                  <p className="text-[11px] text-cream-300/80 mt-0.5 leading-snug">
                    Use device camera or upload image. Run dual local OCR and vision AI.
                  </p>
                </div>
              </div>

              {/* Action 3: Reuse Previous Batch */}
              <div 
                onClick={() => setActiveTab('batches')}
                className="group p-4 rounded-2xl bg-forest-900/60 hover:bg-forest-900 border border-forest-700 hover:border-forest-500 cursor-pointer transition-all shadow-sm flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-forest-800 text-cream-200 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5 text-limeaccent-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cream-100 transition-colors">
                    3. Reuse Product or Batch
                  </h3>
                  <p className="text-[11px] text-cream-300/80 mt-0.5 leading-snug">
                    Schedule recurring runs ({batches.length} saved) with new lot codes and dates.
                  </p>
                </div>
              </div>

              {/* Action 4: Create Manually */}
              <div 
                onClick={handleCreateManually}
                className="group p-4 rounded-2xl bg-forest-900/60 hover:bg-forest-900 border border-forest-700 hover:border-forest-500 cursor-pointer transition-all shadow-sm flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-forest-800 text-cream-200 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <PenTool className="w-5 h-5 text-limeaccent-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cream-100 transition-colors">
                    4. Create Manually
                  </h3>
                  <p className="text-[11px] text-cream-300/80 mt-0.5 leading-snug">
                    Fill in exact mm dimensions, ingredients, nutrition facts, and legal details.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Demo Callout: 3 Sample Products */}
            <div className="pt-3 border-t border-forest-800/80 space-y-2">
              <span className="text-xs text-cream-300 font-semibold block">
                Explore full live editor & storytelling with authentic sample products (1-Click Load):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleLaunchSample('pickle')}
                  disabled={demoLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-limeaccent-400 hover:bg-limeaccent-300 text-forest-950 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <ChefHat className="w-3.5 h-3.5 text-forest-950" />
                  <span>🥭 Pahadi Mango Pickle (400g)</span>
                </button>

                <button
                  onClick={() => handleLaunchSample('honey')}
                  disabled={demoLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-100 border border-forest-600 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-limeaccent-400" />
                  <span>🍯 Forest Honey (500g)</span>
                </button>

                <button
                  onClick={() => handleLaunchSample('turmeric')}
                  disabled={demoLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-100 border border-forest-600 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <Wheat className="w-3.5 h-3.5 text-limeaccent-400" />
                  <span>🌿 Lakadong Turmeric (250g)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Agritech Product Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-forest-800 shadow-2xl group">
              <img 
                src="/assets/agritech_hero.jpg" 
                alt="Artisan Agritech Food Packaging" 
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent flex flex-col justify-end p-6 space-y-1.5">
                <div className="flex items-center gap-1.5 text-limeaccent-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Real Agritech Packaging</span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  Jars, Bottles, Pouches & Cartons
                </h4>
                <p className="text-xs text-cream-200/90 leading-relaxed">
                  Export vector print-ready files at exact physical millimeters with verified barcodes and traceability QR codes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE-STEP WORKFLOW WITH FARM-TO-SHELF SPOTLIGHT */}
      <section className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">Five-Step Journey</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif mt-0.5">
              From Farm Harvest to Compliant Retail Shelf
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              LabelIQ handles the technical regulatory requirements so food artisans and producers can focus on making great food.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('verify')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-950 hover:underline"
          >
            <span>Inspect Public Verification Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* 5 Steps Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200/80 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-forest-900 text-limeaccent-400 font-mono font-bold text-xs flex items-center justify-center">1</div>
              <h4 className="font-bold text-slate-900 text-sm">Enter or Scan Details</h4>
              <p className="text-xs text-slate-600 leading-snug">Type plain description, capture existing label with camera, or enter recipe manually.</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200/80 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-forest-900 text-limeaccent-400 font-mono font-bold text-xs flex items-center justify-center">2</div>
              <h4 className="font-bold text-slate-900 text-sm">Review Extracted Data</h4>
              <p className="text-xs text-slate-600 leading-snug">Verify every ingredient, FSSAI number, and date. Source provenance clearly distinguished.</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200/80 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-forest-900 text-limeaccent-400 font-mono font-bold text-xs flex items-center justify-center">3</div>
              <h4 className="font-bold text-slate-900 text-sm">Select Packaging Design</h4>
              <p className="text-xs text-slate-600 leading-snug">Pick from 12 aesthetic themes suited for glass jars, pouches, canisters, or bottles.</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200/80 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-forest-900 text-limeaccent-400 font-mono font-bold text-xs flex items-center justify-center">4</div>
              <h4 className="font-bold text-slate-900 text-sm">Check Compliance & Layout</h4>
              <p className="text-xs text-slate-600 leading-snug">Automated rules check mandatory elements, font size minima, allergens, and overflow.</p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-forest-50 border border-forest-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-forest-900 text-limeaccent-400 font-mono font-bold text-xs flex items-center justify-center">5</div>
              <h4 className="font-bold text-forest-950 text-sm">Export Vector PDF & Track Batches</h4>
              <p className="text-xs text-slate-700 leading-snug">Download 300+ DPI PDF matching physical label dimensions. Reuse recipes across multi-quantity production runs.</p>
            </div>
          </div>

          {/* Traceability Spotlight Card (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-cream-200 shadow-sm relative group bg-white">
            <img 
              src="/assets/farm_traceability.jpg" 
              alt="Farm to Shelf Traceability" 
              className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="p-4 bg-white border-t border-cream-200 space-y-3">
              <div className="flex items-center gap-1.5 text-forest-800 text-xs font-bold">
                <QrCode className="w-4 h-4" />
                <span>Batch Traceability Portal</span>
              </div>

              {/* Real Scannable QR Code Showcase */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream-50 border border-cream-200">
                <div className="p-1.5 bg-white rounded-xl shadow-sm border border-cream-300 shrink-0">
                  <QrCodeSvg 
                    value={OFFICIAL_FSSAI_VERIFY_PORTAL} 
                    size={68} 
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-[11px] font-bold text-forest-950 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-forest-800" />
                    <span>Scan with Your Smartphone</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    Scan to open official license and batch traceability records directly on any smartphone.
                  </p>
                  <a 
                    href={OFFICIAL_FSSAI_VERIFY_PORTAL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-forest-700 hover:underline"
                  >
                    <span>{OFFICIAL_FSSAI_VERIFY_PORTAL}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Every label exported from LabelIQ includes a verified, scannable QR code linking to official public registries or batch traceability records. Consumers see approved ingredients, batch numbers, and license validity instantly on any phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 WHO IS LABELIQ FOR: THREE TAILORED ENTRY POINTS */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800">Who Is LabelIQ Built For?</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-serif mt-0.5">
            Tailored Workflows for Every Stage of Rural & Artisan Food Production
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Entry 1: Farmers & FPOs */}
          <div 
            onClick={() => setActiveTab('ai-draft')}
            className="p-6 rounded-3xl bg-white border border-cream-200 hover:border-forest-700 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-200 text-forest-900 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Wheat className="w-5 h-5 text-forest-800" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-forest-900 transition-colors">
              Farmers & Farmer Producer Orgs (FPOs)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Package single-ingredient produce, raw honey, cold-pressed oils, millets, and GI spices. Generate farm origin storytelling QR codes with zero design fees.
            </p>
            <div className="pt-2 text-xs font-bold text-forest-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Start with AI Formulation &rarr;</span>
            </div>
          </div>

          {/* Entry 2: Home-Based & Cottage Artisans */}
          <div 
            onClick={() => setActiveTab('scanner')}
            className="p-6 rounded-3xl bg-white border border-cream-200 hover:border-forest-700 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-limeaccent-100/60 border border-limeaccent-300 text-forest-900 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5 text-forest-900" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-forest-900 transition-colors">
              Home Kitchens & Artisan Makers
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pickles, podis, chutneys, vadams, handcrafted sweets, and bilona ghee. Scan your handwritten recipe or phone photo, verify allergens, and calculate legal shelf life.
            </p>
            <div className="pt-2 text-xs font-bold text-forest-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Scan Existing Packaging &rarr;</span>
            </div>
          </div>

          {/* Entry 3: Agritech Startups & Small Processors */}
          <div 
            onClick={() => setActiveTab('batches')}
            className="p-6 rounded-3xl bg-white border border-cream-200 hover:border-forest-700 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-cream-100 border border-cream-300 text-forest-900 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 text-forest-800" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-forest-900 transition-colors">
              Agritech Startups & Food Processors
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lock recipe versions while scheduling recurring production batches. Maintain lot-level QR traceability, multilingual labels, and print-ready vector PDFs.
            </p>
            <div className="pt-2 text-xs font-bold text-forest-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Manage Batches & Lot Codes &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2.6 THEMES & STORYTELLING PREVIEW */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">Visual Aesthetic</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-serif mt-0.5">
              7 Professional Themes for Every Retail Format
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Switch styles anytime in the editor without losing your ingredients or statutory declarations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { id: 'traditional-indian', name: 'Traditional Indian', color: 'from-amber-600 to-amber-800', bestFor: 'Pickles & Ghee' },
            { id: 'natural-farmer-market', name: 'Farmer Market', color: 'from-emerald-700 to-emerald-950', bestFor: 'Fresh & Millets' },
            { id: 'premium-artisanal', name: 'Artisanal Gold', color: 'from-stone-800 to-black', bestFor: 'Spices & Coffee' },
            { id: 'organic-inspired', name: 'Organic Nature', color: 'from-green-600 to-emerald-800', bestFor: 'Honey & Botanicals' },
            { id: 'modern-minimal', name: 'Modern Minimal', color: 'from-slate-700 to-slate-900', bestFor: 'Cold-Pressed Oils' },
            { id: 'bright-retail', name: 'Bright Retail', color: 'from-orange-500 to-red-600', bestFor: 'Snacks & Namkeen' },
            { id: 'export-oriented', name: 'Export Luxury', color: 'from-amber-900 to-amber-950', bestFor: 'Tea, Vanilla & GI' },
          ].map((theme, i) => (
            <div
              key={i}
              onClick={() => {
                updateCurrentLabel({
                  dimensions: {
                    ...useLabel().currentLabel.dimensions,
                    labelTheme: theme.id as any
                  }
                });
                setActiveTab('editor');
              }}
              className="p-3.5 rounded-2xl bg-white border border-cream-200 hover:border-forest-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className={`w-full h-10 rounded-xl bg-gradient-to-br ${theme.color} shadow-xs mb-2 group-hover:scale-102 transition-transform`} />
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-forest-900 transition-colors">
                  {theme.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {theme.bestFor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 11 SUPPORTED FOOD CATEGORIES */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800">Food Categories</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-serif mt-0.5">
            Tailored Rules for Every Artisan Food Category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((c, i) => (
            <div 
              key={i}
              onClick={() => {
                createNewBlankLabel();
                setActiveTab('create');
              }}
              className="p-3.5 rounded-2xl bg-white border border-cream-200 hover:border-forest-600 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="font-bold text-xs text-slate-900 group-hover:text-forest-900 transition-colors">
                {c.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOUR OPERATIONAL PILLARS: Integrity, Multi-Batch, Aesthetics, Free Tier */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-forest-800" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Honest Provenance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero hallucinated values. Every field explicitly identifies whether it was scanned from OCR, typed by the producer, or suggested by AI.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('batches')}
          className="bg-white rounded-2xl border border-cream-200 p-5 shadow-xs space-y-3 cursor-pointer hover:border-forest-400 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-limeaccent-50 border border-limeaccent-300 text-forest-900 flex items-center justify-center">
            <Package className="w-5 h-5 text-forest-900" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Multi-Batch Reuse</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 font-bold">{batches.length} saved</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Keep your recipe formulation locked while generating separate production batches with different jar quantities, lot codes, and expiry dates.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('recommendations')}
          className="bg-white rounded-2xl border border-cream-200 p-5 shadow-xs space-y-3 cursor-pointer hover:border-forest-400 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-cream-100 border border-cream-300 text-forest-800 flex items-center justify-center">
            <Layers className="w-5 h-5 text-forest-800" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">12 Design Templates</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Front-only, back information panel, or continuous wrap layouts. Safe margins, QR codes, and EAN-13 barcodes that stay printable and scannable.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-forest-900 text-limeaccent-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">100% Free Offline Core</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Manual drafting, local Tesseract OCR, live millimeter canvas, audit checks, and high-res vector PDF export are free forever without API keys.
          </p>
        </div>
      </section>

      {/* 5. HONEST REGULATORY DISCLAIMER */}
      <section className="rounded-2xl bg-cream-100/80 border border-cream-300 p-5 flex items-start gap-3.5 text-xs">
        <Info className="w-4 h-4 text-forest-800 shrink-0 mt-0.5" />
        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Regulatory Review Notice:</strong> LabelIQ provides algorithmic layout and statutory checklist assistance referencing Indian Food Safety and Standards (Labelling and Display) Regulations, 2020 and Legal Metrology Rules, 2011. Algorithmic checks do not constitute a statutory certificate or legal guarantee of compliance. Food Business Operators are responsible for packaging compliance.
        </p>
      </section>
    </div>
  );
};
