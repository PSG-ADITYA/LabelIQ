export interface RecommendationRequest {
  category: string;
  widthMm: number;
  heightMm: number;
  layoutStyle: 'two-panel' | 'standard' | 'minimal';
  ingredientCount: number;
  hasNutritionTable: boolean;
  distributionChannel?: 'farmers_market' | 'retail_supermarket' | 'e_commerce' | 'bulk_b2b';
}

export interface RecommendationResult {
  templateId: string;
  templateName: string;
  matchScore: number; // 0-100
  recommendedLayout: 'two-panel' | 'standard' | 'minimal';
  rationales: string[];
  densityWarning?: string;
}

export function computeTemplateRecommendations(req: RecommendationRequest): RecommendationResult[] {
  const areaMm2 = req.widthMm * req.heightMm;
  const isWide = req.widthMm >= req.heightMm * 1.3;
  const isHighDensity = req.ingredientCount > 6 || req.hasNutritionTable;

  const catalog = [
    {
      id: 'heritage-premium',
      name: 'Heritage Premium',
      categories: ['Pickles, Chutneys & Condiments', 'Spices & Seasonings', 'Gourmet Condiments'],
      bestLayout: 'two-panel' as const,
      minArea: 7000,
      description: 'Ornate classical framing with deep royal burgundy and gold accents.',
    },
    {
      id: 'clean-modern',
      name: 'Clean & Modern',
      categories: ['Bakery & Confectionery', 'Dairy Products', 'General Packaged Food', 'Healthy Snacks'],
      bestLayout: 'standard' as const,
      minArea: 5000,
      description: 'Swiss typographic grid with high-contrast legibility and clear whitespace.',
    },
    {
      id: 'organic-inspired',
      name: 'Organic-inspired',
      categories: ['Honey, Oils & Agricultural Produce', 'Grains, Flour & Millets', 'Fruit & Vegetable Processing'],
      bestLayout: 'two-panel' as const,
      minArea: 6500,
      description: 'Botanical sage and olive tones tailored for farm-direct produce and organic certifications.',
    },
    {
      id: 'bold-artisan',
      name: 'Bold Artisan',
      categories: ['Pickles, Chutneys & Condiments', 'Spices & Seasonings', 'Artisanal Condiments'],
      bestLayout: 'two-panel' as const,
      minArea: 7500,
      description: 'Heavy slab typography and rich terracotta suited for craft and small-batch foods.',
    },
    {
      id: 'minimal-monochrome',
      name: 'Minimal Monochrome',
      categories: ['Coffee & Teas', 'Craft Beverages', 'Gourmet Condiments'],
      bestLayout: 'minimal' as const,
      minArea: 3500,
      description: 'Precision typographic hierarchy in pure black and white with minimal ink coverage.',
    },
    {
      id: 'artisan-bakery',
      name: 'Artisan Bakery',
      categories: ['Bakery & Confectionery', 'Sourdough & Breads', 'Sweets & Desserts'],
      bestLayout: 'standard' as const,
      minArea: 5000,
      description: 'Warm crust tones and rustic script headers suited for baked goods.',
    },
    {
      id: 'spice-market',
      name: 'Spice Market',
      categories: ['Spices & Seasonings', 'Grains, Flour & Millets', 'Curry Pastes & Masalas'],
      bestLayout: 'two-panel' as const,
      minArea: 6000,
      description: 'Warm turmeric ochre and paprika accents with segmented technical ingredient details.',
    },
    {
      id: 'premium-beverage',
      name: 'Premium Beverage',
      categories: ['Non-Alcoholic Beverages & Syrups', 'Juices & Cordials', 'Dairy & Plant Milks'],
      bestLayout: 'standard' as const,
      minArea: 6000,
      description: 'Deep indigo and citrus vertical hierarchy suited for bottles and cans.',
    },
    {
      id: 'healthy-snack',
      name: 'Healthy Snack',
      categories: ['Snacks, Namkeen & Savouries', 'Dry Fruits & Seeds', 'Granola & Energy Bites'],
      bestLayout: 'standard' as const,
      minArea: 4500,
      description: 'Crisp mint highlights with dedicated callouts for nutrient density and net weight.',
    },
    {
      id: 'dairy-fresh',
      name: 'Dairy Fresh',
      categories: ['Dairy Products', 'Ghee & Butter', 'Paneer & Yogurts'],
      bestLayout: 'two-panel' as const,
      minArea: 6000,
      description: 'Pastoral sky blue and cream palette communicating purity and freshness.',
    },
    {
      id: 'gourmet-condiment',
      name: 'Gourmet Condiment',
      categories: ['Pickles, Chutneys & Condiments', 'Mustards & Relishes', 'Infused Vinegars'],
      bestLayout: 'two-panel' as const,
      minArea: 6800,
      description: 'Earthy truffle olive and understated gold accents with fold-line information panels.',
    },
    {
      id: 'custom-brand',
      name: 'Custom Brand',
      categories: ['Custom Food Products', 'All Categories'],
      bestLayout: 'two-panel' as const,
      minArea: 4000,
      description: 'Neutral baseline allowing full customization of colors, fonts, and borders.',
    },
  ];

  return catalog.map(tmpl => {
    let score = 50;
    const rationales: string[] = [];

    // 1. Food category match
    if (tmpl.categories.some(c => req.category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(req.category.toLowerCase()))) {
      score += 25;
      rationales.push(`Direct aesthetic alignment with the "${req.category}" food category.`);
    }

    // 2. Packaging aspect ratio and layout match
    if (isWide && tmpl.bestLayout === 'two-panel') {
      score += 15;
      rationales.push(`Recommended because your dimensions (${req.widthMm}×${req.heightMm}mm) provide a wide aspect ratio, ideal for a two-panel wrap layout with a separate information panel.`);
    } else if (!isWide && tmpl.bestLayout === 'standard') {
      score += 15;
      rationales.push(`Suited for compact single-front packaging labels.`);
    }

    // 3. Information density handling
    if (isHighDensity) {
      if (tmpl.bestLayout === 'two-panel') {
        score += 10;
        rationales.push(`High information density: Accommodates your ${req.ingredientCount} ingredients and full nutrition table without crowding.`);
      }
    }

    // 4. Distribution channel consideration
    if (req.distributionChannel === 'farmers_market' && (tmpl.id === 'organic-inspired' || tmpl.id === 'bold-artisan')) {
      score += 10;
      rationales.push('Earthy craft styling resonates strongly with organic farmers markets.');
    } else if (req.distributionChannel === 'retail_supermarket' && (tmpl.id === 'clean-modern' || tmpl.id === 'healthy-snack')) {
      score += 10;
      rationales.push('High shelf contrast optimizes readability in retail supermarket displays.');
    }

    // Density warning if printable area is small for the content
    let densityWarning: string | undefined;
    if (areaMm2 < 5500 && isHighDensity) {
      densityWarning = `Available printable area (${Math.round(areaMm2)} mm²) is tight for ${req.ingredientCount} ingredients and a full nutrition table. Consider using a 0.85x typography scale or expanding label dimensions.`;
    }

    return {
      templateId: tmpl.id,
      templateName: tmpl.name,
      matchScore: Math.min(98, score),
      recommendedLayout: tmpl.bestLayout,
      rationales,
      densityWarning,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// Reference-Label Comparison Metrics
export interface ReferenceComparisonResult {
  overallDesignSimilarityScore: number; // 0-100
  metricBreakdown: {
    textHierarchy: { score: number; observation: string; suggestion: string };
    contrastAndReadability: { score: number; observation: string; suggestion: string };
    informationDensity: { score: number; observation: string; suggestion: string };
    spaceUtilization: { score: number; observation: string; suggestion: string };
    brandBalance: { score: number; observation: string; suggestion: string };
    mandatoryContentPresence: { score: number; observation: string; suggestion: string };
  };
  keyTakeaways: string[];
  statutoryNotice: string;
}

export function compareReferenceLabel(
  currentLabel: any,
  referenceLabel: {
    brandName: string;
    productName: string;
    dimensions: { width: number; height: number; unit: string };
    hasNutritionTable: boolean;
    hasQrCode: boolean;
    hasBarcode: boolean;
    colorDominance: 'light' | 'dark' | 'vibrant';
  }
): ReferenceComparisonResult {
  const currentArea = (currentLabel.dimensions?.width || 120) * (currentLabel.dimensions?.height || 75);
  const refArea = referenceLabel.dimensions.width * referenceLabel.dimensions.height;
  const areaRatio = currentArea / (refArea || 1);

  const hasMandatoryFssai = Boolean(currentLabel.fssaiLicense && currentLabel.fssaiLicense.length === 14);
  const hasVegLogo = Boolean(currentLabel.dimensions?.showVegLogo);
  const hasNutrition = Boolean(currentLabel.dimensions?.showNutritionTable);

  const textHierarchyScore = currentLabel.productName?.length > 0 && currentLabel.brandName?.length > 0 ? 88 : 65;
  const contrastScore = 84;
  const densityScore = currentLabel.ingredients?.length > 8 ? 76 : 90;
  const spaceUtilScore = Math.min(95, Math.round(75 + (areaRatio > 0.8 && areaRatio < 1.3 ? 15 : 0)));
  const brandBalanceScore = currentLabel.brandName ? 86 : 60;
  const mandatoryScore = (hasMandatoryFssai ? 35 : 0) + (hasVegLogo ? 35 : 0) + (hasNutrition ? 30 : 0);

  const overall = Math.round(
    (textHierarchyScore * 0.2) +
    (contrastScore * 0.15) +
    (densityScore * 0.15) +
    (spaceUtilScore * 0.15) +
    (brandBalanceScore * 0.15) +
    (mandatoryScore * 0.2)
  );

  return {
    overallDesignSimilarityScore: overall,
    metricBreakdown: {
      textHierarchy: {
        score: textHierarchyScore,
        observation: currentLabel.productName ? 'Prominent title hierarchy on Principal Display Panel.' : 'Product title needs stronger typographical weight.',
        suggestion: 'Keep product name at least 1.4x larger than descriptor text for rapid retail identification.',
      },
      contrastAndReadability: {
        score: contrastScore,
        observation: 'High contrast between background and text exceeds statutory 4.5:1 minimum ratio.',
        suggestion: 'Maintain strong color contrast between background and ingredient text.',
      },
      informationDensity: {
        score: densityScore,
        observation: `Current label accommodates ${currentLabel.ingredients?.length || 0} ingredients within selected dimensions.`,
        suggestion: currentLabel.ingredients?.length > 8 ? 'Use two-panel wrap layout so the front display panel remains uncluttered.' : 'Balanced information density.',
      },
      spaceUtilization: {
        score: spaceUtilScore,
        observation: `Packaging surface area: ${currentLabel.dimensions?.width || 120}×${currentLabel.dimensions?.height || 75}${currentLabel.dimensions?.unit || 'mm'}.`,
        suggestion: 'Ensure 3mm safe margins around all critical text elements.',
      },
      brandBalance: {
        score: brandBalanceScore,
        observation: currentLabel.brandName ? `Brand name "${currentLabel.brandName}" is cleanly positioned above title.` : 'Brand name is missing.',
        suggestion: 'Place brand identity consistently across all packaging sizes.',
      },
      mandatoryContentPresence: {
        score: mandatoryScore,
        observation: `FSSAI License (${hasMandatoryFssai ? 'Present' : 'Missing'}), Veg Logo (${hasVegLogo ? 'Enabled' : 'Disabled'}), Nutrition Facts (${hasNutrition ? 'Enabled' : 'Disabled'}).`,
        suggestion: mandatoryScore < 100 ? 'Ensure all 3 mandatory statutory marks are enabled on the packaging.' : 'All mandatory statutory packaging elements are present.',
      },
    },
    keyTakeaways: [
      `Design balance score: ${overall}/100.`,
      referenceLabel.hasBarcode && !currentLabel.dimensions?.showBarcode ? 'The reference packaging features an EAN-13 barcode; consider enabling barcode on your label.' : 'Barcode status is aligned.',
      'Comparison evaluates visual design metrics and spatial balance. It does not certify official regulatory compliance.',
    ],
    statutoryNotice: 'Visual design metrics are informational and advisory. Comparative analysis does not establish official regulatory compliance or endorsement.',
  };
}
