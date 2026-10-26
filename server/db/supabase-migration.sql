-- ============================================================================
-- LabelIQ Studio 4.0 — Supabase PostgreSQL Production Migration
-- Architecture: Compatible with both local string IDs ('prod-...', 'batch-...')
-- and UUIDs, with Row Level Security (RLS) and idempotent table creation.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  jurisdiction TEXT DEFAULT 'FSSAI (India)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default workspace for guest / local artisans
INSERT INTO public.workspaces (id, name, jurisdiction)
VALUES ('default', 'Primary Studio Workspace', 'FSSAI (India)')
ON CONFLICT (id) DO NOTHING;

-- 3. Master Food Products
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE SET DEFAULT DEFAULT 'default',
  brand_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  jurisdiction TEXT DEFAULT 'FSSAI (India)',
  description TEXT,
  dietary_classification TEXT DEFAULT 'veg' CHECK (dietary_classification IN ('veg', 'non-veg', 'vegan')),
  is_vegetarian BOOLEAN DEFAULT TRUE,
  fssai_license TEXT,
  storage_instructions TEXT,
  directions_for_use TEXT,
  status TEXT DEFAULT 'active',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Packaging Variants (e.g. 200g jar, 400g jar, 1kg pouch)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT,
  variant_name TEXT NOT NULL,
  net_quantity NUMERIC(10,2) NOT NULL,
  net_quantity_unit TEXT NOT NULL,
  drained_weight NUMERIC(10,2),
  packaging_format TEXT DEFAULT 'Glass Jar',
  barcode_ean13 TEXT,
  default_width_mm NUMERIC(8,2) DEFAULT 120.00,
  default_height_mm NUMERIC(8,2) DEFAULT 75.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Recipe Versions (Historical Formulation Audit Trail)
CREATE TABLE IF NOT EXISTS public.recipe_versions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  version_tag TEXT NOT NULL,
  change_summary TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Recipe Ingredients
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_version_id TEXT NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  name TEXT NOT NULL,
  percentage TEXT,
  is_allergen BOOLEAN DEFAULT FALSE,
  source_note TEXT
);

-- 7. Allergen Declarations
CREATE TABLE IF NOT EXISTS public.allergen_declarations (
  id TEXT PRIMARY KEY,
  recipe_version_id TEXT NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE,
  declaration_text TEXT NOT NULL,
  cross_contact_notes TEXT
);

-- 8. Nutrition Facts Records
CREATE TABLE IF NOT EXISTS public.nutrition_records (
  id TEXT PRIMARY KEY,
  recipe_version_id TEXT NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE UNIQUE,
  serving_basis TEXT DEFAULT 'per 100g',
  serving_size TEXT DEFAULT '100g',
  energy_kcal NUMERIC(8,2),
  protein_g NUMERIC(8,2),
  carbohydrates_g NUMERIC(8,2),
  total_sugars_g NUMERIC(8,2),
  added_sugars_g NUMERIC(8,2),
  total_fat_g NUMERIC(8,2),
  saturated_fat_g NUMERIC(8,2),
  trans_fat_g NUMERIC(8,2),
  sodium_mg NUMERIC(8,2),
  data_source TEXT DEFAULT 'Laboratory Testing / Formulation Analysis'
);

-- 9. Visual Label Designs
CREATE TABLE IF NOT EXISTS public.label_designs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
  recipe_version_id TEXT REFERENCES public.recipe_versions(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL,
  width_mm NUMERIC(8,2) NOT NULL,
  height_mm NUMERIC(8,2) NOT NULL,
  unit TEXT DEFAULT 'mm',
  orientation TEXT DEFAULT 'landscape',
  layout_style TEXT DEFAULT 'two-panel',
  font_family TEXT DEFAULT 'serif',
  font_size_scale NUMERIC(4,2) DEFAULT 1.0,
  bleed_mm NUMERIC(4,2) DEFAULT 2.0,
  safe_margin_mm NUMERIC(4,2) DEFAULT 3.0,
  border_radius_mm NUMERIC(4,2) DEFAULT 3.0,
  custom_primary_color TEXT,
  custom_accent_color TEXT,
  custom_bg_color TEXT,
  custom_text_color TEXT,
  show_veg_logo BOOLEAN DEFAULT TRUE,
  show_nutrition_table BOOLEAN DEFAULT TRUE,
  show_barcode BOOLEAN DEFAULT TRUE,
  show_qr_code BOOLEAN DEFAULT TRUE,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Production Batches
CREATE TABLE IF NOT EXISTS public.production_batches (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
  recipe_version_id TEXT REFERENCES public.recipe_versions(id) ON DELETE SET NULL,
  label_design_id TEXT REFERENCES public.label_designs(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL,
  mfg_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  best_before_months INT DEFAULT 12,
  batch_size_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  batch_size_unit TEXT NOT NULL DEFAULT 'kg',
  planned_units INT NOT NULL,
  packaged_units INT DEFAULT 0,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Production', 'Packaged', 'Released', 'Archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Audit History Events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_workspace ON public.products(workspace_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_product ON public.recipe_versions(product_id);
CREATE INDEX IF NOT EXISTS idx_batches_product ON public.production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batches_number ON public.production_batches(batch_number);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Service role key retains full bypass. Public and authenticated access is allowed.
-- ============================================================================
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergen_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated full read/write access for LabelIQ API serverless requests
CREATE POLICY "Public workspaces access" ON public.workspaces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public products access" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public variants access" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public recipe versions access" ON public.recipe_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public ingredients access" ON public.recipe_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public allergens access" ON public.allergen_declarations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public nutrition access" ON public.nutrition_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public label designs access" ON public.label_designs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public production batches access" ON public.production_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public audit events access" ON public.audit_events FOR ALL USING (true) WITH CHECK (true);
