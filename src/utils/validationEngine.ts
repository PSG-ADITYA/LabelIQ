import { ProductLabel, ValidationIssue } from '../types/label';

export interface ValidationSummary {
  totalChecks: number;
  errorsCount: number;
  warningsCount: number;
  reviewCount: number;
  layoutIssuesCount: number;
  passedCount: number;
  issues: ValidationIssue[];
  passedChecks: ValidationIssue[];
  canExport: boolean;
  complianceRatingNotice: string;
}

export function validateProductLabel(label: ProductLabel): ValidationSummary {
  const issues: ValidationIssue[] = [];
  const passedChecks: ValidationIssue[] = [];

  // Helper to add issues or passed checks
  const check = (
    passed: boolean,
    issue: Omit<ValidationIssue, 'id' | 'severity' | 'category'> & {
      severityIfFailed: 'error' | 'warning' | 'review' | 'layout';
      categoryIfFailed: 'Missing Information' | 'Needs Correction' | 'Needs Human Verification' | 'Layout Issues';
    }
  ) => {
    if (!passed) {
      issues.push({
        id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ruleCode: issue.ruleCode,
        severity: issue.severityIfFailed,
        category: issue.categoryIfFailed,
        title: issue.title,
        message: issue.message,
        whyItMatters: issue.whyItMatters,
        triggerField: issue.triggerField,
        actionableStep: issue.actionableStep,
        source: issue.source,
      });
    } else {
      passedChecks.push({
        id: `pass-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ruleCode: issue.ruleCode,
        severity: 'passed',
        category: 'Passed Checks',
        title: issue.title,
        message: `Passed: ${issue.title} meets specified criteria.`,
        whyItMatters: issue.whyItMatters,
        triggerField: issue.triggerField,
        actionableStep: 'No action required.',
        source: issue.source,
      });
    }
  };

  // 1. Product Name & Identity
  check(Boolean(label.productName && label.productName.trim().length >= 3), {
    ruleCode: 'FSSAI-001-NAME',
    severityIfFailed: 'error',
    categoryIfFailed: 'Missing Information',
    title: 'Product Name Declaration',
    message: 'The official name of the food item is missing or too brief.',
    whyItMatters: 'Under FSSAI Labelling Regulations (Section 5.1), every pre-packaged food container must declare the true nature of the product prominently.',
    triggerField: 'productName',
    actionableStep: 'Enter the unambiguous culinary or standard product name.',
    source: 'FSSAI Deterministic Rule',
  });

  // 2. Brand Name
  check(Boolean(label.brandName && label.brandName.trim().length > 0), {
    ruleCode: 'FSSAI-002-BRAND',
    severityIfFailed: 'warning',
    categoryIfFailed: 'Missing Information',
    title: 'Brand / Trademark Name',
    message: 'Brand or trade name is blank.',
    whyItMatters: 'Brand identification ensures consumer trust and legal traceability for product accountability.',
    triggerField: 'brandName',
    actionableStep: 'Provide the registered or trading brand name of your business.',
    source: 'FSSAI Deterministic Rule',
  });

  // 3. Net Quantity & Unit
  const validUnits = ['g', 'kg', 'ml', 'l'];
  const hasValidNetQty = Boolean(label.netQuantity && label.netQuantity > 0 && validUnits.includes(label.netQuantityUnit));
  check(hasValidNetQty, {
    ruleCode: 'FSSAI-003-NETQTY',
    severityIfFailed: 'error',
    categoryIfFailed: 'Missing Information',
    title: 'Net Quantity & Approved Metric Unit',
    message: 'Net quantity must be a positive number paired with an approved metric unit (g, kg, ml, l).',
    whyItMatters: 'Legal Metrology (Packaged Commodities) Rules and FSSAI Section 5.3 mandate declared weight or volume in standard metric notation.',
    triggerField: 'netQuantity',
    actionableStep: 'Specify a net quantity greater than zero and select an appropriate unit (e.g. 400 g).',
    source: 'FSSAI Deterministic Rule',
  });

  // 4. FSSAI License Number Check (14 numeric digits)
  const fssaiRegex = /^[0-9]{14}$/;
  const hasValidFssai = Boolean(label.fssaiLicense && fssaiRegex.test(label.fssaiLicense.trim()));
  check(hasValidFssai, {
    ruleCode: 'FSSAI-004-LIC',
    severityIfFailed: 'error',
    categoryIfFailed: 'Needs Correction',
    title: '14-Digit FSSAI License Number',
    message: label.fssaiLicense 
      ? `Entered license number "${label.fssaiLicense}" is invalid. Must be exactly 14 digits.`
      : 'FSSAI 14-digit Food Business Operator (FBO) license number is missing.',
    whyItMatters: 'FSSAI Section 5.10 requires the 14-digit license number and FSSAI logo on the principal display panel of every prepackaged food.',
    triggerField: 'fssaiLicense',
    actionableStep: 'Enter your 14-digit state or central FSSAI registration/license number (e.g., 10019022009841).',
    source: 'FSSAI Deterministic Rule',
  });

  // 5. Dietary Classification (Veg / Non-Veg Logo)
  check(Boolean(label.dimensions.showVegLogo), {
    ruleCode: 'FSSAI-005-VEGLOGO',
    severityIfFailed: 'warning',
    categoryIfFailed: 'Needs Correction',
    title: 'Dietary Symbol (Veg / Non-Veg Indicator)',
    message: 'The mandatory Vegetarian green dot symbol or Non-Vegetarian brown triangle symbol is turned off in label controls.',
    whyItMatters: 'FSSAI Regulation 5.4 mandates display of the veg/non-veg logo in close proximity to the brand name or product title.',
    triggerField: 'dimensions.showVegLogo',
    actionableStep: 'Enable the dietary symbol toggle in the Packaging & Label Dimensions panel.',
    source: 'FSSAI Deterministic Rule',
  });

  // 6. Ingredients List & Ordering
  const hasIngredients = Array.isArray(label.ingredients) && label.ingredients.length > 0;
  check(hasIngredients, {
    ruleCode: 'FSSAI-006-INGR-EMPTY',
    severityIfFailed: 'error',
    categoryIfFailed: 'Missing Information',
    title: 'List of Ingredients',
    message: 'No ingredients have been added to the product declaration.',
    whyItMatters: 'FSSAI Section 5.2 requires all ingredients to be declared in descending order of incoming weight (m/m) or volume (v/v) at the time of manufacture.',
    triggerField: 'ingredients',
    actionableStep: 'Add each ingredient used in your recipe along with percentages where applicable.',
    source: 'FSSAI Deterministic Rule',
  });

  // 7. Allergen Cross-Verification
  // Detect if any ingredient is flagged as allergen but allergen declaration statement is empty
  const allergenIngredients = label.ingredients.filter(i => i.isAllergen);
  const declaredAllergensText = label.allergenDeclarations.join(' ').toLowerCase();
  
  if (allergenIngredients.length > 0) {
    const missingAllergenStatements = allergenIngredients.filter(
      ing => !declaredAllergensText.includes(ing.name.toLowerCase().split(' ')[0])
    );

    check(missingAllergenStatements.length === 0, {
      ruleCode: 'FSSAI-007-ALLERGEN-CROSS',
      severityIfFailed: 'warning',
      categoryIfFailed: 'Needs Human Verification',
      title: 'Allergen Statement Inconsistency',
      message: `Ingredients list contains potential allergens (${allergenIngredients.map(a => a.name).join(', ')}), but your Allergen Declaration statement might not explicitly cover them.`,
      whyItMatters: 'Mandatory declaration of known allergens (e.g. mustard, sesame, nuts, gluten, soy, milk) is required by law to prevent anaphylaxis in sensitive consumers. Never assume a product is allergen-free without rigorous verification.',
      triggerField: 'allergenDeclarations',
      actionableStep: 'Review the allergen warning text in Step B and explicitly list: "Contains [Allergen Name]".',
      source: 'FSSAI Deterministic Rule',
    });
  }

  // 8. Nutrition Information: FSSAI 2020 Mandatory 5 Core Nutrients + Fat/Sugar breakdowns
  const hasNutrition = Boolean(label.nutrition);
  const hasEnergy = hasNutrition && label.nutrition.energyKcal !== null && label.nutrition.energyKcal !== undefined;
  const hasProtein = hasNutrition && label.nutrition.proteinG !== null && label.nutrition.proteinG !== undefined;
  const hasCarbs = hasNutrition && label.nutrition.carbohydratesG !== null && label.nutrition.carbohydratesG !== undefined;
  const hasTotalFat = hasNutrition && label.nutrition.totalFatG !== null && label.nutrition.totalFatG !== undefined;
  const hasSodium = hasNutrition && label.nutrition.sodiumMg !== null && label.nutrition.sodiumMg !== undefined;
  const hasAddedSugar = hasNutrition && label.nutrition.addedSugarsG !== null && label.nutrition.addedSugarsG !== undefined;
  const hasTransFat = hasNutrition && label.nutrition.transFatG !== null && label.nutrition.transFatG !== undefined;
  const hasSaturatedFat = hasNutrition && label.nutrition.saturatedFatG !== null && label.nutrition.saturatedFatG !== undefined;

  const exemptKeywords = ['honey', 'produce', 'vegetables', 'fruit', 'grains', 'millets', 'flour', 'spices', 'seasonings'];
  const isSingleIngredientExempt = label.isNutritionExempt || 
    (label.isSingleIngredientProduce && label.ingredients.length <= 1) ||
    (exemptKeywords.some(k => (label.category || '').toLowerCase().includes(k)) && label.ingredients.length <= 1);

  if (isSingleIngredientExempt && (!hasEnergy || !hasProtein)) {
    check(true, {
      ruleCode: 'FSSAI-008-NUTRI-EXEMPT',
      severityIfFailed: 'review',
      categoryIfFailed: 'Needs Human Verification',
      title: 'Single-Ingredient Agricultural Exemption (Nutrition Table Optional)',
      message: 'Under FSSAI Regulation 5.2(3), unprocessed single-ingredient agricultural foods (e.g., pure raw honey, whole spices, raw grains, fresh produce) are exempt from mandatory nutrition facts tables provided no nutritional/health claims are made.',
      whyItMatters: 'Farmers and primary producers packaging single-ingredient unprocessed commodities do not require mandatory laboratory assays unless advertising specific nutritional claims.',
      triggerField: 'nutrition',
      actionableStep: 'Optional: you may leave the nutrition table blank or include baseline assays.',
      source: 'FSSAI Deterministic Rule',
    });
  } else {
    check(hasEnergy && hasProtein && hasCarbs && hasTotalFat && hasSodium && hasAddedSugar && hasTransFat && hasSaturatedFat, {
      ruleCode: 'FSSAI-008-NUTRI-MANDATORY',
      severityIfFailed: 'error',
      categoryIfFailed: 'Missing Information',
      title: 'Mandatory Nutrition Disclosures (Core Nutrients & Sugar/Fat Breakdowns)',
      message: 'FSSAI 2020 mandates explicit declaration per 100g/100ml of: Energy (kcal), Protein (g), Carbohydrates (g), Total Fat (g), Sodium (mg), Added Sugars (g), Saturated Fat (g), and Trans Fat (g).',
      whyItMatters: 'Regulation 5.2(3) mandates listing Energy, Protein, Carbohydrates, Total Sugars, Added Sugars, Total Fat, Saturated Fat, Trans Fat, and Sodium per 100g or 100ml. Missing values must be tested, never fabricated.',
      triggerField: 'nutrition.energyKcal',
      actionableStep: 'Enter verified laboratory or calculated values for all mandatory statutory nutrients.',
      source: 'FSSAI Deterministic Rule',
    });
  }

  // 9. Date Validity & Consistency Check
  const mfg = label.mfgDate ? new Date(label.mfgDate) : null;
  const exp = label.expiryDate ? new Date(label.expiryDate) : null;

  check(Boolean(label.mfgDate && label.batchNumber), {
    ruleCode: 'FSSAI-009-TRACEABILITY',
    severityIfFailed: 'error',
    categoryIfFailed: 'Missing Information',
    title: 'Batch Number and Date of Manufacture',
    message: 'Both Batch / Lot Number and Date of Manufacture/Packing are mandatory for traceability.',
    whyItMatters: 'In the event of a product recall or quality audit, batch and packing date identify specific production runs.',
    triggerField: 'batchNumber',
    actionableStep: 'Provide a batch code and packing date in Step D.',
    source: 'FSSAI Deterministic Rule',
  });

  if (mfg && exp) {
    const isDateConsistent = exp.getTime() > mfg.getTime();
    check(isDateConsistent, {
      ruleCode: 'FSSAI-010-DATE-ORDER',
      severityIfFailed: 'error',
      categoryIfFailed: 'Needs Correction',
      title: 'Contradictory Expiry / Best-Before Date',
      message: `Expiry date (${label.expiryDate}) cannot be earlier than or identical to Manufacturing date (${label.mfgDate}).`,
      whyItMatters: 'Contradictory dates violate legal packaging standards and cause immediate regulatory seizure at retail.',
      triggerField: 'expiryDate',
      actionableStep: 'Adjust the Best-Before or Expiry date to be properly in the future relative to the manufacturing date.',
      source: 'FSSAI Deterministic Rule',
    });
  }

  // 10. Manufacturer Details & Consumer Care
  const hasFullAddress = Boolean(
    label.manufacturer.name &&
    label.manufacturer.address &&
    (label.manufacturer.customerCarePhone || label.manufacturer.customerCareEmail)
  );

  check(hasFullAddress, {
    ruleCode: 'FSSAI-011-MFG-CONTACT',
    severityIfFailed: 'warning',
    categoryIfFailed: 'Missing Information',
    title: 'Manufacturer Address & Consumer Care Details',
    message: 'Full physical premises address and at least one consumer care contact (phone or email) are required.',
    whyItMatters: 'FSSAI Section 5.6 mandates the name and complete address of the manufacturer and customer grievance redressal contact.',
    triggerField: 'manufacturer.customerCarePhone',
    actionableStep: 'Fill in the complete street address and toll-free / mobile helpline or email address.',
    source: 'FSSAI Deterministic Rule',
  });

  // 11. Storage Instructions
  check(Boolean(label.storageInstructions && label.storageInstructions.trim().length > 10), {
    ruleCode: 'FSSAI-012-STORAGE',
    severityIfFailed: 'warning',
    categoryIfFailed: 'Needs Human Verification',
    title: 'Storage Condition Advisory',
    message: 'Storage instructions are missing or very short.',
    whyItMatters: 'Foods requiring specific ambient conditions (e.g. keeping oil submerged, protecting from moisture or sunlight) must inform the consumer to prevent microbial spoilage.',
    triggerField: 'storageInstructions',
    actionableStep: 'Specify clear storage instructions such as "Store in a cool, dry place. Keep oil layer intact."',
    source: 'FSSAI Deterministic Rule',
  });

  // 12. Physical Label Dimensions & Text Overflow Simulation
  // Calculate total printable area in mm²:
  const dims = label.dimensions;
  let widthMm = dims.width;
  let heightMm = dims.height;
  if (dims.unit === 'cm') { widthMm *= 10; heightMm *= 10; }
  if (dims.unit === 'in') { widthMm *= 25.4; heightMm *= 25.4; }

  const safeWidthMm = Math.max(10, widthMm - (dims.safeMargin * 2));
  const safeHeightMm = Math.max(10, heightMm - (dims.safeMargin * 2));
  const printableAreaMm2 = safeWidthMm * safeHeightMm;

  // Approximate character density: at 100% scale, ~1 char requires approx 3 mm² of layout space
  const totalTextCharacters = 
    (label.productName?.length || 0) +
    (label.description?.length || 0) +
    label.ingredients.reduce((acc, i) => acc + i.name.length + 10, 0) +
    (label.storageInstructions?.length || 0) +
    (label.manufacturer?.name?.length || 0) +
    (label.manufacturer?.address?.length || 0) +
    180; // nutrition table text approx

  const scaledCharArea = totalTextCharacters * 2.8 * (dims.fontSizeScale || 1.0);
  const isOverflowing = scaledCharArea > printableAreaMm2;

  check(!isOverflowing, {
    ruleCode: 'LAYOUT-001-OVERFLOW',
    severityIfFailed: 'layout',
    categoryIfFailed: 'Layout Issues',
    title: 'Text Density / Physical Label Area Overflow Warning',
    message: `Estimated text content (~${totalTextCharacters} characters at scale ${(dims.fontSizeScale * 100).toFixed(0)}%) may exceed or heavily crowd the selected label dimensions (${dims.width}x${dims.height}${dims.unit}).`,
    whyItMatters: 'Small food packaging with compressed typography risks illegibility under statutory minimum font size thresholds (FSSAI min 1.0mm x-height).',
    triggerField: 'dimensions.width',
    actionableStep: 'Increase label dimensions, adjust font scale down, or switch to a two-panel wrap-around packaging style.',
    source: 'Layout Constraint',
  });

  // 13. Minimum Font Size Check
  const effectivePt = 8.5 * (dims.fontSizeScale || 1.0);
  check(effectivePt >= 6.5, {
    ruleCode: 'LAYOUT-002-MINFONT',
    severityIfFailed: 'layout',
    categoryIfFailed: 'Layout Issues',
    title: 'Minimum Typography Legibility Threshold',
    message: `Current font scale results in effective text rendering under 6.5pt (~0.9mm).`,
    whyItMatters: 'Regulatory standards require mandatory declarations to be easily readable by the naked eye without optical magnification.',
    triggerField: 'dimensions.fontSizeScale',
    actionableStep: 'Increase the font scale slider in the Label Editor control panel.',
    source: 'Layout Constraint',
  });

  const errorsCount = issues.filter(i => i.severity === 'error').length;
  const warningsCount = issues.filter(i => i.severity === 'warning').length;
  const reviewCount = issues.filter(i => i.severity === 'review').length;
  const layoutIssuesCount = issues.filter(i => i.severity === 'layout').length;

  return {
    totalChecks: issues.length + passedChecks.length,
    errorsCount,
    warningsCount,
    reviewCount,
    layoutIssuesCount,
    passedCount: passedChecks.length,
    issues,
    passedChecks,
    canExport: errorsCount === 0,
    complianceRatingNotice: errorsCount === 0 
      ? 'All deterministic statutory rules passed. Proceed to print or packaging production with human verification.' 
      : `${errorsCount} critical statutory requirement(s) need correction before print export.`,
  };
}
