export interface RegulatoryStandard {
  id: string;
  name: string;
  authority: string;
  country: string;
  officialGazetteRef: string;
  effectiveDate: string;
  lastReviewedDate: string;
  scope: string;
  sourceUrl: string;
  isFullyImplemented: boolean;
  disclaimer: string;
}

export const ACTIVE_REGULATORY_FRAMEWORKS: RegulatoryStandard[] = [
  {
    id: 'fssai_2020',
    name: 'FSSAI Packaging and Labelling Regulations 2020',
    authority: 'Food Safety and Standards Authority of India (FSSAI)',
    country: 'India',
    officialGazetteRef: 'F. No. Stds/SP(Water & Beverages)/Notification(1)/FSSAI-2019',
    effectiveDate: 'December 14, 2021',
    lastReviewedDate: 'March 2024',
    scope: 'All pre-packaged foods sold or distributed in India',
    sourceUrl: 'https://fssai.gov.in/upload/uploadfiles/files/Compendium_Packaging_Labelling_Regulations_2020.pdf',
    isFullyImplemented: true,
    disclaimer: 'Implements core statutory checks under Chapter 2 (General Requirements) & Chapter 4 (Mandatory Declarations). Does not replace statutory inspection.'
  },
  {
    id: 'codex_general',
    name: 'Codex General Standard for Labelling of Prepackaged Foods',
    authority: 'Codex Alimentarius Commission (FAO / WHO)',
    country: 'International (Codex)',
    officialGazetteRef: 'CXS 1-1985 (Rev. 2018)',
    effectiveDate: '1985 (Amended 2018)',
    lastReviewedDate: 'January 2024',
    scope: 'International trade & cross-border food distribution',
    sourceUrl: 'https://www.fao.org/fao-who-codexalimentarius/sh-proxy/en/?lnk=1&url=https%253A%252F%252Fworkspace.fao.org%252Fsites%252Fcodex%252FStandards%252FCXS%2B1-1985%252FCXS_001e.pdf',
    isFullyImplemented: false,
    disclaimer: 'Core guidance principles implemented; local national legislations supersede Codex standards.'
  }
];

export const FSSAI_MAJOR_ALLERGENS = [
  { key: 'mustard', label: 'Mustard & products thereof' },
  { key: 'gluten', label: 'Cereals containing gluten (wheat, rye, barley, oats)' },
  { key: 'crustaceans', label: 'Crustaceans & products thereof' },
  { key: 'eggs', label: 'Eggs & egg products' },
  { key: 'fish', label: 'Fish & fish products' },
  { key: 'peanuts', label: 'Peanuts, tree nuts & products thereof' },
  { key: 'soybeans', label: 'Soybeans & products thereof' },
  { key: 'milk', label: 'Milk & milk products (including lactose)' },
  { key: 'sulphite', label: 'Sulphite in concentrations of 10mg/kg or more' },
];

export interface FoodCategoryConfig {
  id: string;
  name: string;
  shortDesc: string;
  defaultFormat: string;
  defaultDimensions: { width: number; height: number; unit: 'mm' };
  defaultLayout: 'two-panel' | 'standard' | 'minimal';
  isNutritionExemptEligible: boolean; // e.g. raw single-ingredient produce
  hasDrainedWeight: boolean; // e.g. pickles/canned goods in liquid
  hasFruitContent: boolean; // e.g. juices, jams, beverages
  specialDeclarations: string[];
  placeholderDescription: string;
}

export const SUPPORTED_FOOD_CATEGORIES: FoodCategoryConfig[] = [
  {
    id: 'pickles_condiments',
    name: 'Pickles, Chutneys, Sauces & Condiments',
    shortDesc: 'Artisanal mango, lime, garlic, mixed vegetable pickles and table sauces',
    defaultFormat: 'Glass Jar',
    defaultDimensions: { width: 120, height: 75, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: false,
    hasDrainedWeight: true,
    hasFruitContent: false,
    specialDeclarations: ['Drained Weight (if packed in oil/brine)', 'Acidity regulator / Preservative statement'],
    placeholderDescription: 'e.g. Traditional sun-cured raw mango pickle in cold-pressed mustard oil with fenugreek, red chilli, and sea salt in 400g glass jars.'
  },
  {
    id: 'honey_sweeteners',
    name: 'Honey, Jaggery & Sweeteners',
    shortDesc: 'Raw unprocessed honey, organic jaggery powder, palm jaggery, natural syrups',
    defaultFormat: 'Glass Jar / Squeeze Bottle',
    defaultDimensions: { width: 110, height: 70, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: true,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Floral Source / Region', 'Crystallization is natural notice', 'No added sugar / preservatives'],
    placeholderDescription: 'e.g. 100% pure raw forest wildflower honey harvested from Western Ghats. Unfiltered, non-pasteurized, naturally crystallizes.'
  },
  {
    id: 'produce_fresh',
    name: 'Fresh or Minimally Processed Fruit & Vegetables',
    shortDesc: 'Cleaned, cut, frozen or dried whole farm produce',
    defaultFormat: 'Vented Pouch / Clamshell',
    defaultDimensions: { width: 90, height: 90, unit: 'mm' },
    defaultLayout: 'standard',
    isNutritionExemptEligible: true,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Harvest Date / Packing Date', 'Wash thoroughly before consumption'],
    placeholderDescription: 'e.g. Farm-fresh hydroponic cherry tomatoes, sorted and packed on harvest day in 250g ventilated paper clamshells.'
  },
  {
    id: 'dairy_products',
    name: 'Dairy Products',
    shortDesc: 'Desi ghee, curd, paneer, artisan butter, cheese and dairy sweets',
    defaultFormat: 'Jar / Vacuum Pack / Pouch',
    defaultDimensions: { width: 120, height: 75, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: false,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Milk Fat % & Solids-Not-Fat (SNF) %', 'Pasteurized / A2 Bilona Traditional Ghee', 'Keep Refrigerated below 4°C'],
    placeholderDescription: 'e.g. Traditional bilona A2 cow cultured ghee made from curd churned butter, slow-simmered over firewood in 500ml glass jars.'
  },
  {
    id: 'grains_flour_millets',
    name: 'Grains, Millets, Rice & Flour',
    shortDesc: 'Single-origin rice, heirloom millets, stone-ground whole wheat, gluten-free flours',
    defaultFormat: 'Standup Zipper Pouch',
    defaultDimensions: { width: 100, height: 140, unit: 'mm' },
    defaultLayout: 'standard',
    isNutritionExemptEligible: true,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Crop Harvest Year & Milling Date', 'Naturally Gluten-Free / Allergen cross-contact'],
    placeholderDescription: 'e.g. Unpolished foxtail millet grains grown in semi-arid Karnataka, naturally gluten-free, stone-cleaned, packed in 1kg pouches.'
  },
  {
    id: 'spices_seasonings',
    name: 'Spices & Seasonings',
    shortDesc: 'Whole peppercorns, cumin, turmeric, craft masala blends and infused salts',
    defaultFormat: 'Tin Canister / Pouch',
    defaultDimensions: { width: 180, height: 60, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: true,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Whole vs Ground declaration', 'Aroma preservation foil seal', 'Curcumin / Essential oil assay if tested'],
    placeholderDescription: 'e.g. Lakadong high-curcumin (7.5%) turmeric powder, sun-dried and cold-milled in Meghalaya, packed in 150g craft spice tins.'
  },
  {
    id: 'oils_fats',
    name: 'Oils & Edible Fats',
    shortDesc: 'Cold-pressed (Kachi Ghani) mustard oil, wood-pressed sesame oil, coconut oil',
    defaultFormat: 'Bottle / Tin',
    defaultDimensions: { width: 85, height: 130, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: false,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Cold-Pressed / Wood-Pressed (Kachi Ghani)', 'Free from Argemone Oil', 'Free Fatty Acid (FFA) %'],
    placeholderDescription: 'e.g. Traditional wood-pressed black mustard oil, unfiltered single-seed pressing, pungent natural aroma in 1 Litre dark amber glass bottles.'
  },
  {
    id: 'snacks_bakery',
    name: 'Snacks, Bakery & Confectionery',
    shortDesc: 'Roasted seeds, namkeen, artisan sourdough, cookies, traditional sweets',
    defaultFormat: 'Standup Pouch / Box',
    defaultDimensions: { width: 100, height: 140, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: false,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Major Allergen declarations (Gluten, Nuts, Milk, Soy)', 'Trans-fat and added sugar disclosure', 'Nitrogen-flushed freshness'],
    placeholderDescription: 'e.g. Hand-rolled roasted ragi & jaggery cookies with cardamom and pure desi ghee, zero refined sugar, in 200g kraft boxes.'
  },
  {
    id: 'beverages',
    name: 'Beverages',
    shortDesc: 'Fruit cordials, cold-pressed juices, herbal teas, ready-to-drink tonics',
    defaultFormat: 'Glass Bottle / Can',
    defaultDimensions: { width: 140, height: 80, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: false,
    hasDrainedWeight: false,
    hasFruitContent: true,
    specialDeclarations: ['Fruit Juice / Pulp Content %', 'Non-Alcoholic Beverage', 'Shake well before use; serve chilled'],
    placeholderDescription: 'e.g. Cold-pressed Kokum and cumin digestive beverage, 20% natural fruit extract with pink Himalayan salt in 250ml bottles.'
  },
  {
    id: 'ready_to_eat',
    name: 'Ready-to-Eat & Processed Foods',
    shortDesc: 'Instant meal mixes, retort pouches, heat-and-eat curries, soup powders',
    defaultFormat: 'Retort Pouch / Carton',
    defaultDimensions: { width: 110, height: 150, unit: 'mm' },
    defaultLayout: 'two-panel',
    isNutritionExemptEligible: false,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Reheating / cooking instructions', 'Once opened, consume immediately or refrigerate', 'Full statutory 9-nutrient table'],
    placeholderDescription: 'e.g. Ready-to-cook dehydrated sprouted moong dal khichdi mix with roasted cumin, turmeric and whole spices in 300g pouches.'
  },
  {
    id: 'custom_food',
    name: 'Custom Food Products',
    shortDesc: 'Specialty culinary items, fermented foods, microgreens, novel formulations',
    defaultFormat: 'Custom Packaging',
    defaultDimensions: { width: 100, height: 100, unit: 'mm' },
    defaultLayout: 'standard',
    isNutritionExemptEligible: false,
    hasDrainedWeight: false,
    hasFruitContent: false,
    specialDeclarations: ['Specific culinary instructions', 'Custom dietary certifications (Organic, Vegan, Halal, Kosher)'],
    placeholderDescription: 'e.g. Small-batch artisan culinary creation with custom ingredient proportions and specific serving suggestions.'
  }
];

export const COMMON_LABEL_PRESETS = [
  {
    id: 'glass_jar_wrap',
    name: 'Standard Glass Jar Label (e.g. 400g Pickle / Jam)',
    width: 120,
    height: 75,
    unit: 'mm' as const,
    orientation: 'landscape' as const,
    layoutStyle: 'two-panel' as const,
  },
  {
    id: 'standup_pouch_front',
    name: 'Standup Zipper Pouch (Front Label)',
    width: 100,
    height: 140,
    unit: 'mm' as const,
    orientation: 'portrait' as const,
    layoutStyle: 'standard' as const,
  },
  {
    id: 'tin_canister',
    name: 'Cylindrical Spice Tin / Canister',
    width: 180,
    height: 60,
    unit: 'mm' as const,
    orientation: 'landscape' as const,
    layoutStyle: 'two-panel' as const,
  },
  {
    id: 'box_carton_side',
    name: 'Retail Folding Carton (Side Panel)',
    width: 70,
    height: 120,
    unit: 'mm' as const,
    orientation: 'portrait' as const,
    layoutStyle: 'minimal' as const,
  },
  {
    id: 'bottle_wrap',
    name: 'Beverage & Oil Glass Bottle (Wrap Label)',
    width: 140,
    height: 85,
    unit: 'mm' as const,
    orientation: 'landscape' as const,
    layoutStyle: 'two-panel' as const,
  },
  {
    id: 'custom_preset',
    name: 'Custom User Dimensions',
    width: 100,
    height: 100,
    unit: 'mm' as const,
    orientation: 'landscape' as const,
    layoutStyle: 'standard' as const,
  }
];

