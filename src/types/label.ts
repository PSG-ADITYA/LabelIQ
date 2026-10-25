export type MeasurementUnit = 'mm' | 'cm' | 'in';
export type MassVolumeUnit = 'g' | 'kg' | 'ml' | 'l';
export type Orientation = 'landscape' | 'portrait';
export type LayoutStyle = 'standard' | 'two-panel' | 'front-back' | 'minimal';
export type DietaryClassification = 'veg' | 'non-veg' | 'vegan';

export interface IngredientItem {
  id: string;
  name: string;
  percentage?: string;
  order: number;
  isAllergen: boolean;
  notes?: string;
}

export interface NutritionValue {
  value: number | null;
  unit: string;
}

export interface NutritionFacts {
  servingBasis: string; // e.g., "per 100g" or "per 100ml"
  servingSize: string; // e.g., "15g (approx. 1 tbsp)"
  energyKcal: number | null;
  proteinG: number | null;
  carbohydratesG: number | null;
  totalSugarsG: number | null;
  addedSugarsG: number | null;
  totalFatG: number | null;
  saturatedFatG: number | null;
  transFatG: number | null;
  cholesterolMg: number | null;
  sodiumMg: number | null;
}

export type LabelTheme = 
  | 'heritage-premium'
  | 'clean-modern'
  | 'organic-inspired'
  | 'bold-artisan'
  | 'minimal-monochrome'
  | 'artisan-bakery'
  | 'spice-market'
  | 'premium-beverage'
  | 'healthy-snack'
  | 'dairy-fresh'
  | 'gourmet-condiment'
  | 'custom-brand'
  // Legacy aliases for backward compatibility
  | 'clean-white'
  | 'kraft-paper'
  | 'artisan-dark'
  | 'forest-heritage';

export interface LabelDimensions {
  width: number;
  height: number;
  unit: MeasurementUnit;
  orientation: Orientation;
  bleed: number;
  safeMargin: number;
  layoutStyle: LayoutStyle;
  fontSizeScale: number; // 0.8 to 1.4
  showBarcode: boolean;
  showQrCode: boolean;
  showVegLogo: boolean;
  showNutritionTable: boolean;
  showBilingualTitles: boolean;
  labelTheme: LabelTheme;
  textAlign: 'left' | 'center';
  borderRadiusMm: number;
  // Custom brand styling & typography controls
  fontFamily?: 'sans' | 'serif' | 'slab' | 'mono';
  customPrimaryColor?: string;
  customAccentColor?: string;
  customBgColor?: string;
  customTextColor?: string;
  showCertifications?: boolean;
  selectedCertifications?: string[];
}

export interface ManufacturerDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  customerCarePhone: string;
  customerCareEmail: string;
  website?: string;
}

export type FieldProvenance = 
  | 'user_input'
  | 'ocr_extraction'
  | 'uploaded_document'
  | 'verified_calculation'
  | 'ai_suggestion';

export interface FieldWithProvenance<T = any> {
  value: T;
  source: FieldProvenance;
  needsReview?: boolean;
  notes?: string;
}

export type ProvenanceMap = Record<string, FieldProvenance>;

export type FoodCategory =
  | 'Pickles, Chutneys, Sauces & Condiments'
  | 'Honey, Jaggery & Sweeteners'
  | 'Fresh or Minimally Processed Fruit & Vegetables'
  | 'Dairy Products'
  | 'Grains, Millets, Rice & Flour'
  | 'Spices & Seasonings'
  | 'Oils & Edible Fats'
  | 'Snacks, Bakery & Confectionery'
  | 'Beverages'
  | 'Ready-to-Eat & Processed Foods'
  | 'Custom Food Products';

export interface ProductLabel {
  id: string;
  version: number;
  productName: string;
  brandName: string;
  category: string;
  description: string;
  netQuantity: number;
  netQuantityUnit: MassVolumeUnit;
  mrp?: number;
  // Category-specific conditional fields
  isSingleIngredientProduce?: boolean;
  isNutritionExempt?: boolean;
  drainedWeight?: number | null;
  fruitPulpPercent?: number | null;
  fruitJuicePercent?: number | null;
  caffeineMg?: number | null;
  caffeineMgPerL?: number | null;
  categorySpecificNotes?: string;
  grainGradeOrCultivar?: string;
  extractionMethodOrSource?: string;
  brixDegrees?: number | null;
  dairyFatPercent?: number | null;
  dairySnfPercent?: number | null;
  pasteurizationType?: string;
  floralSource?: string;
  crystallizationNotice?: string;
  cropHarvestDate?: string;
  millingDate?: string;
  oilProcessingType?: string;
  freeFattyAcidPercent?: number | null;
  provenanceMap?: ProvenanceMap;
  market: string;
  regulatoryFramework: string;
  dietaryClassification: DietaryClassification;
  fssaiLicense: string;
  ingredients: IngredientItem[];
  allergenDeclarations: string[];
  crossContactNotes: string;
  nutrition: NutritionFacts;
  batchNumber: string;
  mfgDate: string; // YYYY-MM-DD
  bestBeforeMonths: number;
  expiryDate: string; // YYYY-MM-DD
  storageInstructions: string;
  directionsForUse?: string;
  manufacturer: ManufacturerDetails;
  barcode: string;
  qrCodeUrl?: string;
  dimensions: LabelDimensions;
  brandLogoUrl?: string;
  notes?: string;
  tasteAndOrigin?: TasteAndOriginPanel;
  bilingual?: BilingualLabelConfig;
  createdAt: string;
  updatedAt: string;
  isDemoSample?: boolean;
}

export type TasteAndOriginTheme = 
  | 'farmer-market' 
  | 'artisanal' 
  | 'organic' 
  | 'minimal' 
  | 'traditional-indian' 
  | 'retail' 
  | 'export';

export interface TasteAndOriginPanel {
  enabled: boolean;
  theme: TasteAndOriginTheme;
  regionalOrigin?: string;
  producerStory?: string;
  tastingNotes?: string[];
  aromaProfile?: string;
  texture?: string;
  servingSuggestions?: string;
  harvestSeason?: string;
  elevationMeters?: number;
  heroPhotoUrl?: string;
}

export type IndianLanguageCode = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn';

export interface BilingualLabelConfig {
  enabled: boolean;
  targetLanguage: IndianLanguageCode;
  translatedProductName?: string;
  translatedCategory?: string;
  translatedIngredients?: string;
  translatedStorage?: string;
  translatedDirections?: string;
  translatedAllergens?: string;
  displayMode: 'bilingual' | 'regional-only' | 'primary-only';
  reviewedByHuman?: boolean;
}

export interface IngredientExplanation {
  name: string;
  vernacularName?: string;
  simpleExplanation: string;
  culinaryPurpose: string;
  commonSources: string;
  allergenInfo: string;
  cautions: string;
  isAdditive?: boolean;
  insNumber?: string;
}

export type ValidationSeverity = 'error' | 'warning' | 'review' | 'layout' | 'passed';
export type ValidationCategory = 
  | 'Missing Information' 
  | 'Needs Correction' 
  | 'Needs Human Verification' 
  | 'Layout Issues' 
  | 'Passed Checks';

export interface ValidationIssue {
  id: string;
  ruleCode: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  title: string;
  message: string;
  whyItMatters: string;
  triggerField: string;
  actionableStep: string;
  source: 'FSSAI Deterministic Rule' | 'Codex Guideline' | 'Layout Constraint' | 'AI Inferred Suggestion';
}

export interface RecipeDiffItem {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  fieldName: string;
  oldValue: string;
  newValue: string;
  impactLevel: 'high' | 'medium' | 'low';
  labelImpactNotes: string;
}

export interface AppSettings {
  preferredUnit: MeasurementUnit;
  defaultJurisdiction: string;
  geminiApiKey: string;
  useLiveAi: boolean;
  darkMode: boolean;
  minimumFontSizePt: number;
}

export type BatchStatus = 'Planned' | 'In Production' | 'Packaged' | 'Released' | 'Archived';

export interface ProductionBatch {
  id: string;
  product_id: string;
  product_name?: string;
  brand_name?: string;
  category?: string;
  variant_id?: string;
  variant_name?: string;
  net_quantity?: number;
  net_quantity_unit?: string;
  packaging_format?: string;
  barcode_ean13?: string;
  recipe_version_id?: string;
  version_tag?: string;
  label_design_id?: string;
  batch_number: string;
  mfg_date: string;
  expiry_date: string;
  best_before_months: number;
  batch_size_quantity: number;
  batch_size_unit: string;
  planned_units: number;
  packaged_units: number;
  status: BatchStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  net_quantity: number;
  net_quantity_unit: MassVolumeUnit;
  drained_weight?: number | null;
  packaging_format: string;
  barcode_ean13: string;
  default_width_mm: number;
  default_height_mm: number;
}

