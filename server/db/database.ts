import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'labeliq.db');

let _sqliteInstance: Database.Database | null = null;

function getSqliteInstance(): Database.Database {
  if (!_sqliteInstance) {
    _sqliteInstance = new Database(DB_PATH);
    _sqliteInstance.pragma('journal_mode = WAL');
    _sqliteInstance.pragma('foreign_keys = ON');
  }
  return _sqliteInstance;
}

export const db: Database.Database = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getSqliteInstance();
    const val = (instance as any)[prop];
    if (typeof val === 'function') {
      return val.bind(instance);
    }
    return val;
  }
});

export function initDatabase(): void {
  if (process.env.VERCEL) {
    console.log('[Database] Skipping local SQLite initialization in Vercel serverless environment.');
    return;
  }
  console.log(`[Database] Initializing SQLite database at ${DB_PATH}...`);

  db.exec(`
    -- 1. Workspaces
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      jurisdiction TEXT DEFAULT 'FSSAI (India)',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Products (Master Product Profiles)
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      workspace_id TEXT DEFAULT 'default',
      brand_name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      jurisdiction TEXT DEFAULT 'FSSAI (India)',
      description TEXT,
      dietary_classification TEXT DEFAULT 'veg',
      is_vegetarian INTEGER DEFAULT 1,
      fssai_license TEXT,
      storage_instructions TEXT,
      directions_for_use TEXT,
      status TEXT DEFAULT 'active',
      is_demo INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Product Packaging Variants (e.g., 200g jar, 400g jar, 1kg catering pack)
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      sku TEXT,
      variant_name TEXT NOT NULL,
      net_quantity REAL NOT NULL,
      net_quantity_unit TEXT NOT NULL,
      drained_weight REAL,
      packaging_format TEXT DEFAULT 'Glass Jar',
      barcode_ean13 TEXT,
      default_width_mm REAL DEFAULT 120,
      default_height_mm REAL DEFAULT 75,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 4. Recipe Versions (Formulation History & Audit Trail)
    CREATE TABLE IF NOT EXISTS recipe_versions (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      version_tag TEXT NOT NULL,
      change_summary TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 5. Recipe Ingredients
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipe_version_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      percentage TEXT,
      is_allergen INTEGER DEFAULT 0,
      source_note TEXT,
      FOREIGN KEY (recipe_version_id) REFERENCES recipe_versions(id) ON DELETE CASCADE
    );

    -- 6. Allergen Statements
    CREATE TABLE IF NOT EXISTS allergen_declarations (
      id TEXT PRIMARY KEY,
      recipe_version_id TEXT NOT NULL,
      declaration_text TEXT NOT NULL,
      cross_contact_notes TEXT,
      FOREIGN KEY (recipe_version_id) REFERENCES recipe_versions(id) ON DELETE CASCADE
    );

    -- 7. Nutrition Facts Records
    CREATE TABLE IF NOT EXISTS nutrition_records (
      id TEXT PRIMARY KEY,
      recipe_version_id TEXT NOT NULL UNIQUE,
      serving_basis TEXT DEFAULT 'per 100g',
      serving_size TEXT DEFAULT '100g',
      energy_kcal REAL,
      protein_g REAL,
      carbohydrates_g REAL,
      total_sugars_g REAL,
      added_sugars_g REAL,
      total_fat_g REAL,
      saturated_fat_g REAL,
      trans_fat_g REAL,
      sodium_mg REAL,
      data_source TEXT DEFAULT 'Laboratory Testing / Formulation Analysis',
      FOREIGN KEY (recipe_version_id) REFERENCES recipe_versions(id) ON DELETE CASCADE
    );

    -- 8. Label Designs
    CREATE TABLE IF NOT EXISTS label_designs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      recipe_version_id TEXT,
      template_id TEXT NOT NULL,
      width_mm REAL NOT NULL,
      height_mm REAL NOT NULL,
      unit TEXT DEFAULT 'mm',
      orientation TEXT DEFAULT 'landscape',
      layout_style TEXT DEFAULT 'two-panel',
      font_family TEXT DEFAULT 'serif',
      font_size_scale REAL DEFAULT 1.0,
      bleed_mm REAL DEFAULT 2.0,
      safe_margin_mm REAL DEFAULT 3.0,
      border_radius_mm REAL DEFAULT 3.0,
      custom_primary_color TEXT,
      custom_accent_color TEXT,
      custom_bg_color TEXT,
      custom_text_color TEXT,
      show_veg_logo INTEGER DEFAULT 1,
      show_nutrition_table INTEGER DEFAULT 1,
      show_barcode INTEGER DEFAULT 1,
      show_qr_code INTEGER DEFAULT 1,
      qr_code_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 9. Production Batches
    CREATE TABLE IF NOT EXISTS production_batches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      recipe_version_id TEXT,
      label_design_id TEXT,
      batch_number TEXT NOT NULL,
      mfg_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      best_before_months INTEGER DEFAULT 12,
      batch_size_quantity REAL NOT NULL,
      batch_size_unit TEXT NOT NULL,
      planned_units INTEGER NOT NULL,
      packaged_units INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Planned', -- Planned, In Production, Packaged, Released, Archived
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 10. Audit History Events
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_products_workspace ON products(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_recipe_product ON recipe_versions(product_id);
    CREATE INDEX IF NOT EXISTS idx_batches_product ON production_batches(product_id);
    CREATE INDEX IF NOT EXISTS idx_batches_number ON production_batches(batch_number);
  `);

  console.log('[Database] Schema initialized successfully.');
}
