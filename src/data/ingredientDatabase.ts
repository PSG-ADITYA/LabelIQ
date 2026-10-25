import { IngredientExplanation } from '../types/label';

export const INGREDIENT_DATABASE: Record<string, IngredientExplanation> = {
  'raw mango': {
    name: 'Raw Green Mango',
    vernacularName: 'Kaccha Aam / Kairi / Mavidikaya',
    simpleExplanation: 'Unripe green mango with high natural acidity and firm texture.',
    culinaryPurpose: 'Primary souring agent, texture base, and tart flavor carrier in traditional pickles and chutneys.',
    commonSources: 'Orchard-harvested across Andhra Pradesh, Uttar Pradesh, Gujarat, and Maharashtra.',
    allergenInfo: 'Not a common food allergen.',
    cautions: 'Naturally rich in citric and malic acids; requires balanced salt and oil for preservation stability.',
  },
  'mustard oil': {
    name: 'Cold-Pressed Mustard Oil (Kachi Ghani)',
    vernacularName: 'Sarson ka Tel / Aavala Nune',
    simpleExplanation: 'Pungent oil cold-pressed from brassica mustard seeds without chemical solvents.',
    culinaryPurpose: 'Natural microbial barrier, moisture inhibitor, and signature pungent aromatic base.',
    commonSources: 'Grown extensively in Rajasthan, Haryana, Madhya Pradesh, and Punjab.',
    allergenInfo: 'Contains Mustard. Declared as a major food allergen under FSSAI Packaging Regulations.',
    cautions: 'Contains allyl isothiocyanate responsible for pungent aroma and erucic acid within statutory limits. Must not be marketed with unsubstantiated therapeutic claims.',
  },
  'fenugreek': {
    name: 'Fenugreek Seeds',
    vernacularName: 'Methi Dana / Mentulu',
    simpleExplanation: 'Aromatic golden-yellow seeds with a distinct pleasant bitter flavor.',
    culinaryPurpose: 'Flavor enhancer, digestive bittering agent, and natural antioxidant supporting shelf stability.',
    commonSources: 'Widely cultivated in Rajasthan, Gujarat, and Uttar Pradesh.',
    allergenInfo: 'Related to legumes and peanuts; sensitive individuals should exercise caution.',
    cautions: 'Bitterness intensifies if roasted at excessive heat.',
  },
  'turmeric': {
    name: 'Turmeric Powder (Curcuma longa)',
    vernacularName: 'Haldi / Pasupu / Manjal',
    simpleExplanation: 'Bright golden spice ground from cured and dried turmeric rhizomes.',
    culinaryPurpose: 'Natural colorant, warm earthy spice flavor, and natural lipid antioxidant.',
    commonSources: 'Erode (Tamil Nadu), Lakadong (Meghalaya), Nizamabad (Telangana), and Sangli (Maharashtra).',
    allergenInfo: 'Not an identified statutory food allergen.',
    cautions: 'Must be tested for lead chromate or starch adulteration. High curcumin varieties provide deeper pigmentation.',
  },
  'asafoetida': {
    name: 'Compounded Asafoetida',
    vernacularName: 'Hing / Inguva / Perungayam',
    simpleExplanation: 'Dried aromatic resin blended with edible wheat or rice flour and gum arabic.',
    culinaryPurpose: 'Umami-rich allium substitute providing deep savory aroma in place of onion and garlic.',
    commonSources: 'Imported raw resin compounded and milled in Hathras (UP) and Mumbai.',
    allergenInfo: 'May contain Gluten if compounded using wheat flour. Check base flour declaration.',
    cautions: 'Extremely potent aroma; typically declared with percentage of compounding gum and flour.',
  },
  'rock salt': {
    name: 'Rock Salt / Sendha Namak',
    vernacularName: 'Sendha Namak / Saindhava Lavana',
    simpleExplanation: 'Mineral-rich non-iodized or iodized crystallized salt mined from ancient salt deposits.',
    culinaryPurpose: 'Moisture reduction via osmotic draw, preservative microbial control, and taste enhancement.',
    commonSources: 'Sub-Himalayan salt ranges and domestic mineral salt facilities.',
    allergenInfo: 'Not an allergen.',
    cautions: 'Contains natural sodium chloride; statutory labeling requires sodium declaration per 100g.',
  },
  'raw honey': {
    name: 'Raw Unheated Honey',
    vernacularName: 'Shahad / Thene / Thaen',
    simpleExplanation: 'Unfiltered, unheated sweet nectar gathered by honeybees from wild or orchard flora.',
    culinaryPurpose: 'Natural whole-food sweetener, moisture retention agent, and floral flavor carrier.',
    commonSources: 'Himalayan foothills (Himachal Pradesh, Uttarakhand), Sundarbans, and Western Ghats.',
    allergenInfo: 'Bee pollen trace proteins may affect hypersensitive individuals.',
    cautions: 'Infant botulism advisory: Not recommended for infants under 12 months of age. Crystallization is a natural physical characteristic and does not indicate spoilage.',
  },
  'jaggery': {
    name: 'Traditional Jaggery (Gur)',
    vernacularName: 'Gur / Bellam / Vellam',
    simpleExplanation: 'Unrefined traditional sweetener made by boiling raw sugarcane juice without chemical clarifying agents.',
    culinaryPurpose: 'Natural caramel-molasses sweetener and body-building ingredient in traditional confectionery.',
    commonSources: 'Kolhapur (Maharashtra), Mandya (Karnataka), Muzaffarnagar (UP), and Anakapalle (AP).',
    allergenInfo: 'Not an allergen.',
    cautions: 'Hygroscopic nature requires airtight packaging in high-humidity climates.',
  },
  'cow ghee': {
    name: 'Pure Desi Cow Ghee',
    vernacularName: 'Ghee / Neyyi / Ney',
    simpleExplanation: 'Clarified butterfat simmered slowly to remove water and caramelized milk solids.',
    culinaryPurpose: 'High smoke-point cooking fat, rich nutty aroma carrier, and texture enhancer in sweets and savouries.',
    commonSources: 'Traditional bilona churning or dairy processing facilities across Gujarat, Rajasthan, and Haryana.',
    allergenInfo: 'Contains Milk / Dairy derivatives.',
    cautions: 'Contains saturated fats and cholesterol. Statutory nutrition table must declare total and saturated fat content.',
  },
  'ragi': {
    name: 'Finger Millet (Ragi)',
    vernacularName: 'Ragi / Mandua / Kezhvaragu',
    simpleExplanation: 'Nutrient-dense ancient climate-resilient small millet grain with high natural calcium content.',
    culinaryPurpose: 'Whole grain flour base for porridge, flatbreads, dosas, and extruded snacks.',
    commonSources: 'Karnataka, Tamil Nadu, Andhra Pradesh, and Uttarakhand.',
    allergenInfo: 'Naturally gluten-free grain. Cross-contact notes required if milled in shared wheat facilities.',
    cautions: 'High dietary fiber content; requires adequate hydration during extrusion and dough kneading.',
  },
  'cumin seeds': {
    name: 'Whole Cumin Seeds (Jeera)',
    vernacularName: 'Jeera / Jilakara / Seeragam',
    simpleExplanation: 'Aromatic dried seed of the Cuminum cyminum herb with a warm, distinctive earthy aroma.',
    culinaryPurpose: 'Tempering spice, digestive aromatics, and foundational seasoning in curries and snacks.',
    commonSources: 'Gujarat and Rajasthan (Unjha market hub).',
    allergenInfo: 'Not an allergen.',
    cautions: 'Volatile essential oils degrade over prolonged exposure to light and air.',
  },
  'coriander': {
    name: 'Coriander Seeds & Powder',
    vernacularName: 'Dhania / Dhaniyalu / Kothamalli',
    simpleExplanation: 'Dried spherical seeds of the cilantro herb with sweet citrus-peppery aroma.',
    culinaryPurpose: 'Thickening and body-building ground spice, citrus aroma, and flavor balancing.',
    commonSources: 'Madhya Pradesh (Guna), Rajasthan (Ramganj Mandi), and Gujarat.',
    allergenInfo: 'Not an allergen.',
    cautions: 'Store in moisture-proof containers to avoid mold growth.',
  },
  'red chilli': {
    name: 'Red Chilli Powder',
    vernacularName: 'Lal Mirch / Mirapakaya Karam',
    simpleExplanation: 'Ground sun-dried red chillies providing vibrant natural color and capsaicin heat.',
    culinaryPurpose: 'Heat level adjustment, red pigment colorant, and antioxidant preservation support.',
    commonSources: 'Guntur (Andhra Pradesh), Byadgi (Karnataka), and Mathania (Rajasthan).',
    allergenInfo: 'Not an allergen.',
    cautions: 'Scoville heat rating varies by variety (e.g. Byadgi is high color/low heat; Guntur is high heat).',
  },
  'black pepper': {
    name: 'Tellicherry Black Pepper',
    vernacularName: 'Kali Mirch / Miriyalu / Milagu',
    simpleExplanation: 'Sun-cured unripe berries of Piper nigrum with strong piperine pungency.',
    culinaryPurpose: 'Pungent seasoning, bio-enhancer for curcumin, and meat/vegetable spice rub.',
    commonSources: 'Malabar and Idukki regions of Kerala, and Kodagu (Karnataka).',
    allergenInfo: 'Not an allergen.',
    cautions: 'Coarse crush preserves volatile aromas longer than fine micronized powders.',
  },
  'cardamom': {
    name: 'Green Cardamom (Chhoti Elaichi)',
    vernacularName: 'Elaichi / Yelakulu / Elakkai',
    simpleExplanation: 'Highly aromatic dried seed pods from the Cardamom Hills with sweet camphorous aroma.',
    culinaryPurpose: 'Premium dessert flavoring, beverage spice, and signature aromatic enhancer.',
    commonSources: 'Idukki (Kerala) and Valparai (Tamil Nadu).',
    allergenInfo: 'Not an allergen.',
    cautions: 'Requires airtight packaging to retain volatile cineole and terpinyl acetate oils.',
  },
  'cloves': {
    name: 'Cloves (Syzygium aromaticum)',
    vernacularName: 'Laung / Lavangalu / Kirambu',
    simpleExplanation: 'Aromatic dried flower buds containing high concentrations of eugenol.',
    culinaryPurpose: 'Warm numbing sweetness, antimicrobial food preservation, and spice blends.',
    commonSources: 'Kanyakumari (Tamil Nadu) and Western Ghats.',
    allergenInfo: 'Not an allergen.',
    cautions: 'Intense flavor; recommended in precise minute proportions in finished foods.',
  },
  'cinnamon': {
    name: 'Ceylon Cinnamon (Dalchini)',
    vernacularName: 'Dalchini / Dalchinachekka / Karuvapattai',
    simpleExplanation: 'Delicate inner bark of Cinnamomum verum with sweet woody scent.',
    culinaryPurpose: 'Sweet spice flavor in baked goods, tea blends, biryanis, and confectionery.',
    commonSources: 'Kerala, Sri Lanka, and Western Ghat foothills.',
    allergenInfo: 'Not an allergen.',
    cautions: 'True Ceylon cinnamon has negligible coumarin levels compared to Chinese Cassia.',
  },
  'fennel seeds': {
    name: 'Fennel Seeds (Saunf)',
    vernacularName: 'Saunf / Sopu / Sombu',
    simpleExplanation: 'Sweet licorice-flavored aromatic dried seeds from the Foeniculum vulgare plant.',
    culinaryPurpose: 'Digestive mouth freshener, sweet pickling spice, and cooling aromatic.',
    commonSources: 'Gujarat and Rajasthan.',
    allergenInfo: 'Not an allergen.',
    cautions: 'Essential anethole oil provides characteristic sweet aroma.',
  },
  'sesame seeds': {
    name: 'Sesame Seeds (Til)',
    vernacularName: 'Til / Nuvvulu / Ellu',
    simpleExplanation: 'Tiny oil-rich seeds with a rich nutty flavor when toasted.',
    culinaryPurpose: 'Nutty flavor garnish, sesame brittle (chikki) base, and traditional seasoning.',
    commonSources: 'Gujarat, West Bengal, and Madhya Pradesh.',
    allergenInfo: 'Contains Sesame Seeds. Declared as a major food allergen under FSSAI Regulations.',
    cautions: 'High unsaturated fat content; sensitive to oxidative rancidity if stored in warm humid conditions.',
  },
  'tamarind': {
    name: 'Tamarind Pulp',
    vernacularName: 'Imli / Chintapandu / Puli',
    simpleExplanation: 'Tart fruit pulp harvested from tamarind pods rich in tartaric acid.',
    culinaryPurpose: 'Sour flavor foundation for sambars, rasams, chutneys, and sauces.',
    commonSources: 'Karnataka, Andhra Pradesh, and Tamil Nadu.',
    allergenInfo: 'Not an allergen.',
    cautions: 'High natural tartaric acid content naturally lowers pH, aiding microbial stability.',
  },
  'citric acid': {
    name: 'Citric Acid (INS 330)',
    vernacularName: 'Nimbu ka Sat / Citric Acid',
    simpleExplanation: 'Organic food-grade acid identical to the natural acid found in citrus fruits.',
    culinaryPurpose: 'Acidity regulator, antioxidant synergist, and flavor tartness adjuster.',
    commonSources: 'Produced by natural fermentation of carbohydrate substrates.',
    allergenInfo: 'Not an allergen.',
    cautions: 'Statutory additive: Must be declared under class name "Acidity Regulator (INS 330)".',
    isAdditive: true,
    insNumber: 'INS 330',
  },
  'acetic acid': {
    name: 'Acetic Acid / Synthetic Vinegar (INS 260)',
    vernacularName: 'Sirka / Acetic Acid',
    simpleExplanation: 'Food-grade organic acid providing clean pungent sourness and pH reduction.',
    culinaryPurpose: 'Antimicrobial pickling preservative and souring agent.',
    commonSources: 'Acetous fermentation of ethanol or approved food-grade synthesis.',
    allergenInfo: 'Not an allergen.',
    cautions: 'Must be labeled as "Synthetic Vinegar" or "Acidity Regulator (INS 260)" per FSSAI regulations.',
    isAdditive: true,
    insNumber: 'INS 260',
  },
  'sodium benzoate': {
    name: 'Sodium Benzoate (INS 211)',
    vernacularName: 'Class II Preservative',
    simpleExplanation: 'Food-grade preservative salt that inhibits the growth of yeasts and molds in acidic foods.',
    culinaryPurpose: 'Class II chemical preservative used in fruit squashes, sauces, jams, and pickles.',
    commonSources: 'Synthetic food-grade manufacture.',
    allergenInfo: 'Not an allergen, though rare sensitivity may occur in asthmatic individuals.',
    cautions: 'Strict FSSAI maximum limits apply (typically 100 to 750 ppm depending on food category). Must be declared as "Class II Preservative (INS 211)".',
    isAdditive: true,
    insNumber: 'INS 211',
  },
  'potassium sorbate': {
    name: 'Potassium Sorbate (INS 202)',
    vernacularName: 'Class II Preservative (INS 202)',
    simpleExplanation: 'Polyunsaturated fatty acid salt effective against yeast and mold proliferation.',
    culinaryPurpose: 'Class II preservative preserving moisture-rich bakery, cheese, syrups, and condiments.',
    commonSources: 'Food-grade synthesis conforming to purity standards.',
    allergenInfo: 'Not an allergen.',
    cautions: 'Activity is optimal below pH 6.5. Must be declared under statutory ingredient labeling.',
    isAdditive: true,
    insNumber: 'INS 202',
  },
  'wheat flour': {
    name: 'Whole Wheat Flour (Atta)',
    vernacularName: 'Gehun ka Atta / Godhumalu Pindi',
    simpleExplanation: 'Whole cereal grain flour milled with endosperm, germ, and bran intact.',
    culinaryPurpose: 'Staple flour for rotis, breads, biscuits, and traditional snacks.',
    commonSources: 'Madhya Pradesh (Sharbati), Punjab, and Haryana.',
    allergenInfo: 'Contains Gluten / Wheat. Statutory allergen declaration mandatory.',
    cautions: 'Requires moisture monitoring (max 14% moisture under FSSAI specifications).',
  },
  'bengal gram': {
    name: 'Besan (Gram Flour)',
    vernacularName: 'Besan / Senagapindi / Kadalai Maavu',
    simpleExplanation: 'Fine flour ground from split hulled brown chickpeas (chana dal).',
    culinaryPurpose: 'Batter binder, thickener, and high-protein base for savouries, pakodas, and sweets.',
    commonSources: 'Rajasthan, Madhya Pradesh, and Maharashtra.',
    allergenInfo: 'Legume flour; may cause reactions in individuals with severe legume allergies.',
    cautions: 'Store in dry conditions to avoid weevil infestation.',
  }
};

/**
 * Searches and explains ingredients using curated data with token overlap matching
 */
export function explainIngredient(rawName: string): IngredientExplanation {
  const clean = rawName.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const cleanTokens = clean.split(/\s+/).filter(t => t.length > 2);

  // 1. Exact or substring match
  for (const [key, explanation] of Object.entries(INGREDIENT_DATABASE)) {
    if (clean.includes(key) || key.includes(clean)) {
      return explanation;
    }
  }

  // 2. Token overlap match (e.g. "raw green mango" matches key "raw mango")
  let bestMatch: IngredientExplanation | null = null;
  let maxOverlap = 0;

  for (const [key, explanation] of Object.entries(INGREDIENT_DATABASE)) {
    const keyTokens = key.split(/\s+/);
    const overlapCount = keyTokens.filter(kt => cleanTokens.includes(kt)).length;
    if (overlapCount > maxOverlap && overlapCount >= 1) {
      maxOverlap = overlapCount;
      bestMatch = explanation;
    }
  }

  if (bestMatch && maxOverlap >= 1) {
    return bestMatch;
  }

  // Fallback for general uncataloged ingredient
  return {
    name: rawName,
    vernacularName: 'Desi Food Ingredient',
    simpleExplanation: 'Wholesome agricultural or culinary food ingredient.',
    culinaryPurpose: 'Provides nutrition, flavor, and texture characteristics in the food preparation.',
    commonSources: 'Verified agricultural farms and food processing facilities across India.',
    allergenInfo: 'Check standard allergen list: verify if product contains gluten, dairy, peanuts, tree nuts, or mustard.',
    cautions: 'Ensure purity and confirm ingredient quality against statutory FSSAI specifications.',
  };
}
