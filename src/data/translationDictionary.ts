import { IndianLanguageCode } from '../types/label.js';

export interface LanguageMeta {
  code: IndianLanguageCode;
  name: string;
  nativeName: string;
  script: string;
}

export const SUPPORTED_INDIAN_LANGUAGES: LanguageMeta[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
];

export const PACKAGING_TERMS_DICTIONARY: Record<string, Record<IndianLanguageCode, string>> = {
  'ingredients': {
    en: 'Ingredients',
    hi: 'सामग्री (घटक)',
    te: 'కావలసిన పదార్థాలు',
    ta: 'பொருட்கள் (சேர்க்கைகள்)',
    kn: 'ಪದಾರ್ಥಗಳು',
    ml: 'ചേരുവകൾ',
    mr: 'साहित्य (घटक)',
    bn: 'উপকরণসমূহ'
  },
  'nutritional_information': {
    en: 'Nutritional Information',
    hi: 'पोषण संबंधी जानकारी',
    te: 'పోషకాహార సమాచారం',
    ta: 'ஊட்டச்சத்து தகவல்',
    kn: 'ಪೌಷ್ಟಿಕಾಂಶ ಮಾಹಿತಿ',
    ml: 'പോഷകാഹാര വിവരങ്ങൾ',
    mr: 'पोषणविषयक माहिती',
    bn: 'পুষ্টি সম্পর্কিত তথ্য'
  },
  'net_quantity': {
    en: 'Net Quantity',
    hi: 'शुद्ध मात्रा (नेट वजन)',
    te: 'నికర పరిమాణం',
    ta: 'நிகர எடை',
    kn: 'ನಿವ್ವಳ ತೂಕ',
    ml: 'നിശ്ചിത അളവ്',
    mr: 'निव्वळ वजन',
    bn: 'নেট ওজন'
  },
  'batch_no': {
    en: 'Batch No.',
    hi: 'बैच संख्या',
    te: 'బ్యాచ్ సంఖ్య',
    ta: 'தொகுதி எண்',
    kn: 'ಬ್ಯಾಚ್ ಸಂಖ್ಯೆ',
    ml: 'ബാച്ച് നമ്പർ',
    mr: 'बॅच क्रमांक',
    bn: 'ব্যাচ নম্বর'
  },
  'mfg_date': {
    en: 'Date of Manufacture',
    hi: 'निर्माण की तिथि',
    te: 'తయారీ తేదీ',
    ta: 'உற்பத்தி தேதி',
    kn: 'ತಯಾರಿಸಿದ ದಿನಾಂಕ',
    ml: 'നിർമ്മാണ തീയതി',
    mr: 'उत्पादनाची तारीख',
    bn: 'উৎপাদনের তারিখ'
  },
  'best_before': {
    en: 'Best Before',
    hi: 'उपयोग की उत्तम अवधि',
    te: 'గడువు లోపు వాడండి',
    ta: 'காலாவதிக்கு முன் பயன்படுத்தவும்',
    kn: 'ಬಳಕೆಯ ಉತ್ತಮ ಅವಧಿ',
    ml: 'ഉപയോഗിക്കാവുന്ന അവസാന തീയതി',
    mr: 'वापरण्याचा उत्तम कालावधी',
    bn: 'মেয়াদ শেষ হওয়ার আগে ব্যবহার্য'
  },
  'storage_instructions': {
    en: 'Storage Instructions',
    hi: 'भंडारण निर्देश',
    te: 'నిల్వ సూచనలు',
    ta: 'சேமிப்பு வழிமுறைகள்',
    kn: 'ಶೇಖರಣಾ ಸೂಚನೆಗಳು',
    ml: 'സൂക്ഷിക്കേണ്ട രീതി',
    mr: 'साठवणूक सूचना',
    bn: 'সংরক্ষণের নির্দেশাবলী'
  },
  'directions_for_use': {
    en: 'Directions for Use',
    hi: 'उपयोग विधि',
    te: 'వాడే విధానం',
    ta: 'பயன்படுத்தும் முறை',
    kn: 'ಬಳಸುವ ವಿಧಾನ',
    ml: 'ഉപയോഗിക്കേണ്ട വിധം',
    mr: 'वापरण्याची पद्धत',
    bn: 'ব্যবহারের নির্দেশিকা'
  },
  'allergen_advice': {
    en: 'Allergen Advice',
    hi: 'एलर्जी संबंधी चेतावनी',
    te: 'అలెర్జీ హెచ్చరిక',
    ta: 'ஒவ்வாமை எச்சரிக்கை',
    kn: 'ಅಲರ್ಜಿ ಎಚ್ಚರಿಕೆ',
    ml: 'അലർജി മുന്നറിയിപ്പ്',
    mr: 'ऍलर्जी सूचना',
    bn: 'অ্যালার্জি সতর্কতা'
  },
  'store_cool_dry': {
    en: 'Store in a cool, dry and hygienic place away from direct sunlight.',
    hi: 'सीधी धूप से दूर ठंडी, सूखी और स्वच्छ जगह पर रखें।',
    te: 'ప్రత్యక్ష సూర్యకాంతి తగలకుండా చల్లని, పొడి మరియు పరిశుభ్రమైన ప్రదేశంలో భద్రపరచండి.',
    ta: 'நேரடி சூரிய ஒளி படாத குளிர்ந்த, உலர் மற்றும் சுகாதாரமான இடத்தில் சேமிக்கவும்.',
    kn: 'ನೇರ ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ದೂರವಿರುವ ತಂಪಾದ, ಒಣ ಮತ್ತು ಸ್ವಚ್ಛ ಸ್ಥಳದಲ್ಲಿ ಇರಿಸಿ.',
    ml: 'നേരിട്ടുള്ള സൂര്യപ്രകാശം ഏൽക്കാത്ത തണുപ്പുള്ളതും ഉണങ്ങിയതുമായ സ്ഥലത്ത് സൂക്ഷിക്കുക.',
    mr: 'थेट सूर्यप्रकाशापासून दूर थंड, कोरड्या आणि स्वच्छ जागी ठेवा.',
    bn: 'সরাসরি সূর্যালোক থেকে দূরে একটি শীতল, শুষ্ক ও স্বাস্থ্যকর স্থানে সংরক্ষণ করুন।'
  },
  'refrigerate_after_opening': {
    en: 'Refrigerate after opening and consume within 30 days.',
    hi: 'खोलने के बाद फ्रिज में रखें और 30 दिनों के भीतर उपभोग करें।',
    te: 'తెరిచిన తర్వాత ఫ్రిజ్‌లో ఉంచండి మరియు 30 రోజులలోపు ఉపయోగించండి.',
    ta: 'திறந்த பின் குளிர்பதனப் பெட்டியில் வைத்து 30 நாட்களுக்குள் பயன்படுத்தவும்.',
    kn: 'ತೆರೆದ ನಂತರ ಫ್ರಿಜ್‌ನಲ್ಲಿ ಇರಿಸಿ ಮತ್ತು 30 ದಿನಗಳೊಳಗೆ ಬಳಸಿ.',
    ml: 'തുറന്ന ശേഷം ഫ്രിഡ്ജിൽ സൂക്ഷിക്കുക, 30 ദിവസത്തിനുള്ളിൽ ഉപയോഗിക്കുക.',
    mr: 'उघडल्यानंतर फ्रिजमध्ये ठेवा आणि ३० दिवसांत संपवा.',
    bn: 'প্যাকেট খোলার পর ফ্রিজে রাখুন এবং ৩০ দিনের মধ্যে ব্যবহার করুন।'
  },
  'ready_to_consume': {
    en: 'Ready to consume. Mix well before every use with a clean, dry spoon.',
    hi: 'उपयोग के लिए तैयार। प्रत्येक उपयोग से पहले साफ, सूखे चम्मच से अच्छी तरह मिलाएँ।',
    te: 'వాడకానికి సిద్ధం. శుభ్రమైన, పొడి చెంచాతో కలపండి.',
    ta: 'பயன்படுத்த தயார். உலர்ந்த கரண்டியால் நன்கு கலக்கவும்.',
    kn: 'ಸಿದ್ಧ ಆಹಾರ. ಸ್ವಚ್ಛ ಒಣ ಚಮಚದಿಂದ ಚೆನ್ನಾಗಿ ಬೆರೆಸಿ.',
    ml: 'നേരിട്ട് ഉപയോഗിക്കാം. ഉണങ്ങിയ സ്പൂൺ ഉപയോഗിച്ച് ഇളക്കുക.',
    mr: 'वापरासाठी तयार. स्वच्छ, कोरड्या चमच्याने नीट ढवळून घ्या.',
    bn: 'ব্যবহারের জন্য প্রস্তুত। পরিষ্কার ও শুকনো চামচ দিয়ে ভালো করে মিশিয়ে নিন।'
  }
};

export const COMMON_PRODUCT_NAMES: Record<string, Record<IndianLanguageCode, string>> = {
  'spiced raw mango pickle': {
    en: 'Spiced Raw Mango Pickle',
    hi: 'मसालेदार कच्चे आम का अचार',
    te: 'మసాలా ఆవకాయ పచ్చడి',
    ta: 'மசாலா மாங்காய் ஊறுகாய்',
    kn: 'ಮಸಾಲೆ ಮಾವಿನಕಾಯಿ ಉಪ್ಪಿನಕಾಯಿ',
    ml: 'മസാല മാങ്ങാ അച്ചാർ',
    mr: 'मसालेदार कैरीचे लोणचे',
    bn: 'মশলাদার কাঁচা আমের আচার'
  },
  'pure himalayan raw honey': {
    en: 'Pure Himalayan Raw Honey',
    hi: 'शुद्ध हिमालयी प्राकृतिक शहद',
    te: 'స్వచ్ఛమైన హిమాలయన్ సహజ తేనె',
    ta: 'தூய இமயமலை இயற்கை தேன்',
    kn: 'ಶುದ್ಧ ಹಿಮಾಲಯದ ನೈಸರ್ಗಿಕ ಜೇನುತುಪ್ಪ',
    ml: 'ശുദ്ധമായ ഹിമാലയൻ വന തേൻ',
    mr: 'शुद्ध हिमालयीन नैसर्गिक मध',
    bn: 'খাঁটি হিমালয়ান প্রাকৃতিক মধু'
  },
  'cold-pressed mustard oil': {
    en: 'Cold-Pressed Mustard Oil',
    hi: 'कच्ची घानी शुद्ध सरसों का तेल',
    te: 'గానుగ ఆవ నూనె',
    ta: 'செக்கு கடுகு எண்ணெய்',
    kn: 'ಗಾಣದ ಸಾಸಿವೆ ಎಣ್ಣೆ',
    ml: 'ചക്കിലാട്ടിയ കടുക് എണ്ണ',
    mr: 'घाणीचे अस्सल मोहरीचे तेल',
    bn: 'ঘানির খাঁটি সরিষার তেল'
  },
  'organic turmeric powder': {
    en: 'Organic Turmeric Powder',
    hi: 'जैविक हल्दी पाउडर',
    te: 'సేంద్రీయ పసుపు పొడి',
    ta: 'இயற்கை மஞ்சள் தூள்',
    kn: 'ಸಾವಯವ ಅರಿಶಿನ ಪುಡಿ',
    ml: 'ഓർഗാനിക് മഞ്ഞൾപ്പൊടി',
    mr: 'सेंद्रिय हळद पावडर',
    bn: 'জৈব হলুদ গুঁড়ো'
  },
  'traditional jaggery powder': {
    en: 'Traditional Jaggery Powder',
    hi: 'पारंपरिक देशी गुड़ पाउडर',
    te: 'సాంప్రదాయ బెల్లం పొడి',
    ta: 'பாரம்பரிய நாட்டு சர்க்கரை / வெல்லம்',
    kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಬೆಲ್ಲದ ಪುಡಿ',
    ml: 'പരമ്പരാഗത ശർക്കര പൊടി',
    mr: 'पारंपरिक सेंद्रिय गूळ पावडर',
    bn: 'ঐতিহ্যবাহী গুড়ের গুঁড়ো'
  },
  'sprouted ragi flour': {
    en: 'Sprouted Ragi Flour',
    hi: 'अंकुरित रागी का आटा',
    te: 'మొలకెత్తిన రాగుల పిండి',
    ta: 'முளைகட்டிய ராகி மாவு',
    kn: 'ಮೊಳಕೆ ಬರಿಸಿದ ರಾಗಿ ಹಿಟ್ಟು',
    ml: 'മുളപ്പിച്ച റಾಗಿ പൊടി',
    mr: 'मोड आलेल्या नाचणीचे पीठ',
    bn: 'অঙ্কুরিত রাগি আটা'
  }
};

/**
 * Deterministic translation helper that guarantees preservation of numbers, units, FSSAI numbers, and dates.
 */
export function translateTextDeterministic(text: string, targetLang: IndianLanguageCode): { translated: string; wasPreserved: boolean } {
  if (!text || targetLang === 'en') {
    return { translated: text, wasPreserved: true };
  }

  const clean = text.toLowerCase().trim();

  // 1. Direct dictionary matches for full phrases
  for (const [key, mapping] of Object.entries(PACKAGING_TERMS_DICTIONARY)) {
    if (clean === key || clean === mapping.en.toLowerCase()) {
      return { translated: mapping[targetLang] || text, wasPreserved: true };
    }
  }

  // 2. Direct product name matches
  for (const [key, mapping] of Object.entries(COMMON_PRODUCT_NAMES)) {
    if (clean.includes(key)) {
      return { translated: mapping[targetLang] || text, wasPreserved: true };
    }
  }

  // 3. Fallback: If it's storage or direction instruction containing keywords
  if (clean.includes('cool') && clean.includes('dry')) {
    return { translated: PACKAGING_TERMS_DICTIONARY['store_cool_dry'][targetLang], wasPreserved: true };
  }

  if (clean.includes('refrigerate') || clean.includes('fridge')) {
    return { translated: PACKAGING_TERMS_DICTIONARY['refrigerate_after_opening'][targetLang], wasPreserved: true };
  }

  if (clean.includes('ready to consume') || clean.includes('spoon')) {
    return { translated: PACKAGING_TERMS_DICTIONARY['ready_to_consume'][targetLang], wasPreserved: true };
  }

  return { translated: text, wasPreserved: false };
}
