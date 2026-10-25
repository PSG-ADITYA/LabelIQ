-- ============================================================================
-- LabelIQ Studio 4.0 — Supabase PostgreSQL Production Migration
-- Architecture: Multi-tenant, Farmer-First Packaging & Traceability
-- Includes Row Level Security (RLS), User Profiles, Workspaces, and Private Storage
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles (Linked 1:1 with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  business_or_farm_name TEXT,
  phone_number TEXT,
  fssai_license_default TEXT,
  jurisdiction_default TEXT DEFAULT 'FSSAI (India)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workspaces (Team & Artisan Business Collaboration)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  jurisdiction TEXT DEFAULT 'FSSAI (India)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Workspace Memberships & Roles
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 5. Master Food Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
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

-- 6. Product Packaging Variants (e.g. 200g jar, 400g jar, 1kg pouch)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
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

-- 7. Recipe Versions (Historical Formulation Audit Trail)
CREATE TABLE IF NOT EXISTS public.recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  version_tag TEXT NOT NULL,
  change_summary TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Recipe Ingredients
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  name TEXT NOT NULL,
  percentage TEXT,
  is_allergen BOOLEAN DEFAULT FALSE,
  source_note TEXT
);

-- 9. Allergen Declarations
CREATE TABLE IF NOT EXISTS public.allergen_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE,
  declaration_text TEXT NOT NULL,
  cross_contact_notes TEXT
);

-- 10. Nutrition Facts Records
CREATE TABLE IF NOT EXISTS public.nutrition_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID NOT NULL REFERENCES public.recipe_versions(id) ON DELETE CASCADE UNIQUE,
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

-- 11. Visual Label Designs
CREATE TABLE IF NOT EXISTS public.label_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  recipe_version_id UUID REFERENCES public.recipe_versions(id) ON DELETE SET NULL,
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

-- 12. Production Batches
CREATE TABLE IF NOT EXISTS public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  recipe_version_id UUID REFERENCES public.recipe_versions(id) ON DELETE SET NULL,
  label_design_id UUID REFERENCES public.label_designs(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL,
  mfg_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  best_before_months INT DEFAULT 12,
  batch_size_quantity NUMERIC(10,2) NOT NULL,
  batch_size_unit TEXT NOT NULL,
  planned_units INT NOT NULL,
  packaged_units INT DEFAULT 0,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Production', 'Packaged', 'Released', 'Archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Export Audit History
CREATE TABLE IF NOT EXISTS public.label_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label_design_id UUID REFERENCES public.label_designs(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES public.production_batches(id) ON DELETE SET NULL,
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'png', 'svg', 'print_sheet')),
  resolution_dpi INT DEFAULT 300,
  file_size_kb INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Audit History Events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures complete isolation between users, farms, and businesses
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergen_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Users manage only their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Automatic Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Workspaces: Visible and manageable by workspace members
CREATE POLICY "Workspace members view" ON public.workspaces FOR SELECT USING (
  owner_id = auth.uid() OR
  id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);
CREATE POLICY "Workspace creators insert" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Workspace owners update" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Workspace members access" ON public.workspace_members FOR ALL USING (
  user_id = auth.uid() OR
  workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
);

-- Products: Isolated to user or workspace member
CREATE POLICY "Products access" ON public.products FOR ALL USING (
  user_id = auth.uid() OR
  workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);

-- Product Variants: Scoped to product ownership
CREATE POLICY "Variants access" ON public.product_variants FOR ALL USING (
  product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid() OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()))
);

-- Recipe Versions: Scoped to product ownership
CREATE POLICY "Recipe versions access" ON public.recipe_versions FOR ALL USING (
  product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid() OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()))
);

-- Recipe Ingredients: Scoped to product ownership via recipe version
CREATE POLICY "Ingredients access" ON public.recipe_ingredients FOR ALL USING (
  recipe_version_id IN (
    SELECT rv.id FROM public.recipe_versions rv
    JOIN public.products p ON p.id = rv.product_id
    WHERE p.user_id = auth.uid() OR p.workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  )
);

-- Allergen Declarations: Scoped to product ownership via recipe version
CREATE POLICY "Allergens access" ON public.allergen_declarations FOR ALL USING (
  recipe_version_id IN (
    SELECT rv.id FROM public.recipe_versions rv
    JOIN public.products p ON p.id = rv.product_id
    WHERE p.user_id = auth.uid() OR p.workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  )
);

-- Nutrition Records: Scoped to product ownership via recipe version
CREATE POLICY "Nutrition access" ON public.nutrition_records FOR ALL USING (
  recipe_version_id IN (
    SELECT rv.id FROM public.recipe_versions rv
    JOIN public.products p ON p.id = rv.product_id
    WHERE p.user_id = auth.uid() OR p.workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  )
);

-- Label Designs: Scoped to product ownership
CREATE POLICY "Designs access" ON public.label_designs FOR ALL USING (
  product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid() OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()))
);

-- Production Batches: Scoped to product ownership
CREATE POLICY "Batches access" ON public.production_batches FOR ALL USING (
  product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid() OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()))
);

-- Public Traceability: Anyone can read public batch verification data for verified products
CREATE POLICY "Public read batch traceability" ON public.production_batches FOR SELECT USING (
  status IN ('Released', 'Packaged')
);

-- Label Exports: Scoped to user ownership
CREATE POLICY "Exports access" ON public.label_exports FOR ALL USING (
  user_id = auth.uid()
);

-- Audit Events: Scoped to user or workspace ownership
CREATE POLICY "Audit events access" ON public.audit_events FOR ALL USING (
  user_id = auth.uid() OR
  workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);

-- ============================================================================
-- PRIVATE STORAGE BUCKET FOR LABEL DOCUMENT SCANS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('labeliq-documents', 'labeliq-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can only upload and read their own documents in their user folder
CREATE POLICY "Users upload to own folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'labeliq-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'labeliq-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
