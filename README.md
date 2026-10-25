# LabelIQ — Intelligent Food Labels. Simpler Compliance.

> **Hackathon Theme:** *Beyond the Screen — Build for a Smarter, More Inclusive Future.*  
> **Mission:** Empower small food manufacturers, home-based food businesses, cottage artisans, startups, and packaging designers with accessible, professional food-label design, AI packaging scanning, and statutory FSSAI compliance verification.

---

## 🌟 Overview & Real-World Impact

Small food artisans and home kitchens frequently face immense barriers in meeting statutory food packaging standards. Mistakes such as missing mandatory 14-digit FBO license numbers, improper ingredient weight ordering, omitted allergen warnings (e.g., mustard, sesame), incorrect metric unit notation, or fonts that are too small for consumer legibility can lead to costly batch recalls, regulatory fines, or product seizures.

**LabelIQ** solves this by providing:
1. **Guided Multi-Step Label Creator:** Step-by-step entry for product identity, ingredients, nutrition facts, batch traceability, and custom physical packaging dimensions.
2. **AI Packaging Document Scanner:** Uploads JPG, PNG, and PDF packaging proofs or jar photos. Extracts structured data, flags low-confidence readings, and highlights illegible sections.
3. **Live Visual Canvas Editor:** Exact physical scaling in millimetres (`mm`), centimetres (`cm`), or inches (`in`). Real-time bleed and safe margins, zoom controls without distorting export, and instant layout overflow detection.
4. **Deterministic FSSAI 2020 Validation Engine:** Audits mandatory regulations with clear plain-language explanations: *What was detected*, *Why it matters*, *Which field triggered it*, and *Actionable next steps*.
5. **Recipe Comparison & Formulation Diff:** Compares recipe versions (e.g. Traditional Mango Pickle vs Reformulated Lite-Salt Mango Pickle) to detect allergen additions and sodium shifts before new labels are printed.
6. **Print-Ready PDF & High-Res Vector Export:** Generates vector-accurate PDFs and print-friendly layouts with physical margins.

---

## 🎨 Brand Identity & Design System

- **Primary Colors:** Deep Forest Green (`#133E2B`), Warm Cream (`#FAF8F5`), White (`#FFFFFF`), with restrained Lime accents (`#84CC16`).
- **Typography:** `Plus Jakarta Sans` for clean, accessible legibility; `JetBrains Mono` for batch and metric precision.
- **Brand Motif:** Custom SVG logo combining a physical packaging label outline with an intelligent scan checkmark.
- **Tone:** Professional, accessible, supportive for non-technical small business owners.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite.
- **Styling:** Tailwind CSS with custom physical print and canvas media queries.
- **12 Packaging Templates:** Heritage Premium, Clean & Modern, Organic-inspired, Bold Artisan, Minimal Monochrome, Artisan Bakery, Spice Market, Premium Beverage, Healthy Snack, Dairy Fresh, Gourmet Condiment, Custom Brand.
- **Icons:** Lucide React.
- **Graphics & PDF Generation:** `html2canvas` and `jsPDF` (matching exact physical millimeters).
- **Backend API:** Node.js, Express, TypeScript (`tsx watch`), Multer (secure memory-only file processing), Cors, Dotenv.
- **Dual-Engine Document OCR:** Local **Tesseract.js v7** for authentic on-device optical character recognition + Google Gemini 1.5 Flash Vision for live multimodal semantic parsing. Honest detection of blank/unreadable packaging proofs without fabricating demo data.
- **Recipe-to-Label Impact Matrix:** Interactive formulation diff comparing V1 baseline vs reformulated V2 with individual change approvals and new version generation.

---

## 🚀 Getting Started (Step-by-Step for Beginners)

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your system.

### 2. Installation
Open your terminal in the project directory (`d:\LabelIQ`) and run:
```bash
npm install
```

### 3. Run the Development Server
Start both the Express backend API (Port 5000) and the Vite frontend (Port 5173/5174) with a single command:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```
*(If port 5173 is already in use, Vite will automatically serve on `http://localhost:5174` as indicated in the terminal).*

### 4. Optional: Configure Live Gemini AI API Key
The application includes a fully functioning **Transparent Demo Mode** that works out of the box without any external API keys or payments.

If you wish to enable live AI vision processing for custom images:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourSecretKeyHere
   ```
3. Alternatively, enter your key directly inside the application under the **Settings** page. Keys are retained in your browser session and never committed to source control.

---

## 📋 The 9 Application Pages

| # | Page Name | Primary Features |
|---|-----------|------------------|
| 1 | **Home / Landing** | Value proposition, hackathon theme alignment, interactive fictional pickle demo card, feature breakdown. |
| 2 | **Dashboard** | Active product highlights, statutory pass rate percentage gauge, recent drafts table, and educational tips for artisans. |
| 3 | **Create New Label** | 5-step guided form: A. Identity, B. Ingredients & Allergens, C. Mandatory Nutrition, D. Traceability & License, E. Physical Dimensions. |
| 4 | **AI Label Scanner** | Drag-and-drop JPG/PNG/PDF upload, preview before processing, OCR extraction, confidence badges, unreadable section alerts, field review. |
| 5 | **Visual Editor** | Live canvas with millimeter scaling, safe margins, bleed indicators, zoom controls, barcode and veg logo toggles, Vector PDF export. |
| 6 | **Validation Report** | Categorized findings: *Missing Info*, *Needs Correction*, *Needs Human Review*, *Layout Issues*, *Passed Checks* with regulatory citations. |
| 7 | **Recipe Comparison** | Side-by-side formulation diff (V1 vs V2), allergen impact alerts, sodium shift calculations, affected label panel checklist. |
| 8 | **Saved Labels** | Product catalog, duplicate draft, version history, and one-click JSON backup export/import. |
| 9 | **Settings** | Preferred measurement units (`mm`/`cm`/`in`), FSSAI 2020 gazette references, Gemini API credentials, and demo reset. |

---

## 🥒 Authentic Demo Case Study: Mango Pickle

To allow immediate evaluation without requiring custom image uploads or database setup, LabelIQ comes preloaded with an authentic small-batch food product:

- **Product:** *Heritage Dadi's Spiced Raw Mango Pickle* (400g, Glass Jar, 120mm × 75mm).
- **Baseline Recipe (V1):** Traditional formulation cured in cold-pressed mustard oil with 11% salt (4,280 mg sodium per 100g) and mustard allergen declaration.
- **Reformulated Recipe (V2):** Modernized "Lite-Salt" recipe with salt reduced to 7% (2,750 mg sodium per 100g), added white sesame oil (triggering a **Critical New Allergen Alert**), and natural preservative INS 202.
- **Packaging Scanner Demo:** One-click demo scanner simulation extracting product metadata with traceable raw text snippets and confidence notes.

---

## ⚖️ Regulatory Integrity & Anti-Hallucination Policy

- **No Fabricated Data:** Missing nutrition facts remain missing. LabelIQ never generates fictional laboratory values.
- **Source Attribution:** Every check is explicitly attributed to either an *FSSAI Deterministic Rule*, *Layout Constraint*, or *AI Suggestion*.
- **No False Certification:** LabelIQ does not provide a single unqualified "100% compliant" badge or claim official government approval. Software checks indicate that programmatic rules were satisfied; independent laboratory and legal verification is recommended before commercial printing.
- **Official Citation:** Sourced from the *Food Safety and Standards Authority of India (FSSAI) Packaging and Labelling Regulations, 2020* (effective December 14, 2021).

---

## 🔒 Security & Privacy Practices

- **Memory-Only Document Handling:** Uploaded images and PDFs are processed in memory buffers and are never retained indefinitely on disk.
- **Secret Protection:** API keys remain either server-side in `.env` or in local browser storage, and are never logged to public client logs.
- **Input Sanitization:** Multi-layer MIME type validation, file size bounds (10MB limit), and numeric format sanitization.

---

## 🚢 Production Build Verification

To verify that the production bundle builds without errors:
```bash
npm run build
```
This runs TypeScript checking (`tsc -b`) and produces an optimized production build in `dist/`.
