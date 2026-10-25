import { ProductLabel, RecipeDiffItem } from '../types/label';

export interface RecipeComparisonReport {
  v1Label: ProductLabel;
  v2Label: ProductLabel;
  ingredientDiffs: RecipeDiffItem[];
  nutritionDiffs: RecipeDiffItem[];
  identityDiffs: RecipeDiffItem[];
  allergenDiffs: RecipeDiffItem[];
  overallSummary: string;
  affectedLabelSections: {
    sectionName: string;
    impact: 'Critical' | 'Moderate' | 'Minor';
    recommendation: string;
  }[];
  statutoryWarningNotice: string;
}

export function compareRecipes(v1: ProductLabel, v2: ProductLabel): RecipeComparisonReport {
  const ingredientDiffs: RecipeDiffItem[] = [];
  const nutritionDiffs: RecipeDiffItem[] = [];
  const identityDiffs: RecipeDiffItem[] = [];
  const allergenDiffs: RecipeDiffItem[] = [];
  const affectedSections: RecipeComparisonReport['affectedLabelSections'] = [];

  // 1. Ingredients comparison
  const v1IngMap = new Map(v1.ingredients.map(i => [i.name.toLowerCase().trim(), i]));
  const v2IngMap = new Map(v2.ingredients.map(i => [i.name.toLowerCase().trim(), i]));

  // Check for additions and modifications
  v2.ingredients.forEach(v2Item => {
    const v1Item = v1IngMap.get(v2Item.name.toLowerCase().trim());
    if (!v1Item) {
      ingredientDiffs.push({
        type: 'added',
        fieldName: 'Ingredient Addition',
        oldValue: 'Not present',
        newValue: `${v2Item.name} (${v2Item.percentage || 'unspecified %'})${v2Item.isAllergen ? ' [ALLERGEN]' : ''}`,
        impactLevel: v2Item.isAllergen ? 'high' : 'medium',
        labelImpactNotes: v2Item.isAllergen 
          ? 'CRITICAL: New ingredient is a declared allergen! Allergen statement must be updated immediately.' 
          : 'Ingredient list on packaging panel must be updated.',
      });
    } else {
      if (v1Item.percentage !== v2Item.percentage || v1Item.order !== v2Item.order) {
        ingredientDiffs.push({
          type: 'modified',
          fieldName: `Ratio/Order: ${v2Item.name}`,
          oldValue: `Order #${v1Item.order} (${v1Item.percentage || 'N/A'})`,
          newValue: `Order #${v2Item.order} (${v2Item.percentage || 'N/A'})`,
          impactLevel: 'medium',
          labelImpactNotes: 'Ensure descending weight order compliance under FSSAI Section 5.2.',
        });
      }
    }
  });

  // Check for removals
  v1.ingredients.forEach(v1Item => {
    const v2Item = v2IngMap.get(v1Item.name.toLowerCase().trim());
    if (!v2Item) {
      ingredientDiffs.push({
        type: 'removed',
        fieldName: 'Ingredient Removal',
        oldValue: `${v1Item.name} (${v1Item.percentage || 'unspecified %'})`,
        newValue: 'Removed from formulation',
        impactLevel: v1Item.isAllergen ? 'high' : 'medium',
        labelImpactNotes: v1Item.isAllergen
          ? 'Ingredient removed, but check facility cross-contact before removing allergen warning.'
          : 'Remove from printed ingredient panel.',
      });
    }
  });

  // 2. Nutrition comparison
  const n1 = v1.nutrition;
  const n2 = v2.nutrition;

  const compareNutrient = (name: string, val1: number | null, val2: number | null, unit: string) => {
    if (val1 !== val2) {
      const diff = (val2 ?? 0) - (val1 ?? 0);
      const sign = diff > 0 ? '+' : '';
      const percentChange = val1 && val1 !== 0 ? ` (${sign}${((diff / val1) * 100).toFixed(1)}%)` : '';
      
      const isSodiumOrSugar = name.toLowerCase().includes('sodium') || name.toLowerCase().includes('sugar');
      
      nutritionDiffs.push({
        type: 'modified',
        fieldName: name,
        oldValue: val1 !== null ? `${val1} ${unit}` : 'Missing/Null',
        newValue: val2 !== null ? `${val2} ${unit}` : 'Missing/Null',
        impactLevel: isSodiumOrSugar ? 'high' : 'medium',
        labelImpactNotes: `Nutrition facts table must be re-typeset. Value shifted by ${sign}${diff} ${unit}${percentChange}. Laboratory test verification recommended.`,
      });
    }
  };

  compareNutrient('Sodium', n1.sodiumMg, n2.sodiumMg, 'mg');
  compareNutrient('Energy', n1.energyKcal, n2.energyKcal, 'kcal');
  compareNutrient('Total Carbohydrates', n1.carbohydratesG, n2.carbohydratesG, 'g');
  compareNutrient('Total Sugars', n1.totalSugarsG, n2.totalSugarsG, 'g');
  compareNutrient('Added Sugars', n1.addedSugarsG, n2.addedSugarsG, 'g');
  compareNutrient('Total Fat', n1.totalFatG, n2.totalFatG, 'g');
  compareNutrient('Saturated Fat', n1.saturatedFatG, n2.saturatedFatG, 'g');
  compareNutrient('Trans Fat', n1.transFatG, n2.transFatG, 'g');
  compareNutrient('Protein', n1.proteinG, n2.proteinG, 'g');

  // 3. Allergen Declarations
  const all1 = v1.allergenDeclarations.join(' | ');
  const all2 = v2.allergenDeclarations.join(' | ');
  if (all1 !== all2) {
    allergenDiffs.push({
      type: 'modified',
      fieldName: 'Allergen Advisory Statement',
      oldValue: all1 || 'None declared',
      newValue: all2 || 'None declared',
      impactLevel: 'high',
      labelImpactNotes: 'Mandatory principal panel declaration changed. Existing packaging stock cannot be reused for new batch.',
    });
  }

  // 4. Identity & Traceability
  if (v1.productName !== v2.productName) {
    identityDiffs.push({
      type: 'modified',
      fieldName: 'Product Name',
      oldValue: v1.productName,
      newValue: v2.productName,
      impactLevel: 'high',
      labelImpactNotes: 'Requires front principal display panel layout update.',
    });
  }
  if (v1.netQuantity !== v2.netQuantity || v1.netQuantityUnit !== v2.netQuantityUnit) {
    identityDiffs.push({
      type: 'modified',
      fieldName: 'Net Quantity',
      oldValue: `${v1.netQuantity} ${v1.netQuantityUnit}`,
      newValue: `${v2.netQuantity} ${v2.netQuantityUnit}`,
      impactLevel: 'high',
      labelImpactNotes: 'Affects Legal Metrology compliance and minimum numeral font size threshold.',
    });
  }
  if (v1.batchNumber !== v2.batchNumber) {
    identityDiffs.push({
      type: 'modified',
      fieldName: 'Batch / Lot Number',
      oldValue: v1.batchNumber,
      newValue: v2.batchNumber,
      impactLevel: 'medium',
      labelImpactNotes: 'Update inkjet batch coding or sticker overlay.',
    });
  }

  // Determine affected label sections
  if (ingredientDiffs.length > 0) {
    affectedSections.push({
      sectionName: 'Ingredients Panel',
      impact: 'Critical',
      recommendation: 'Re-order ingredients by weight and ensure all new ingredients have correct common names.',
    });
  }
  if (nutritionDiffs.length > 0) {
    affectedSections.push({
      sectionName: 'Nutrition Facts Table',
      impact: 'Critical',
      recommendation: 'Update per 100g and per serving values. Do not estimate from raw ingredients without lab testing or certified recipe calculation.',
    });
  }
  if (allergenDiffs.length > 0) {
    affectedSections.push({
      sectionName: 'Allergen & Cross-Contact Box',
      impact: 'Critical',
      recommendation: 'Ensure bold allergen typography (e.g. "Contains Mustard, Sesame") meets FSSAI prominence guidelines.',
    });
  }
  if (identityDiffs.length > 0) {
    affectedSections.push({
      sectionName: 'Principal Display Panel (PDP)',
      impact: 'Moderate',
      recommendation: 'Verify font hierarchy and net quantity placement on the front panel.',
    });
  }

  const totalModifications = ingredientDiffs.length + nutritionDiffs.length + allergenDiffs.length + identityDiffs.length;
  const overallSummary = totalModifications === 0
    ? 'No formulation or label differences detected between versions.'
    : `Detected ${ingredientDiffs.length} ingredient changes, ${nutritionDiffs.length} nutrition shifts, ${allergenDiffs.length} allergen revisions, and ${identityDiffs.length} identity updates.`;

  return {
    v1Label: v1,
    v2Label: v2,
    ingredientDiffs,
    nutritionDiffs,
    identityDiffs,
    allergenDiffs,
    overallSummary,
    affectedLabelSections: affectedSections,
    statutoryWarningNotice: 'NOTICE: A recipe or formulation change does not automatically determine verified nutrition values or allergen safety. Always substantiate nutritional shifts with laboratory analysis or certified databases before packaging release.',
  };
}
