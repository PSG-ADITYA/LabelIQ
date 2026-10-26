/**
 * Non-Destructive Data Migration: SQLite -> Supabase PostgreSQL
 * 
 * Safeguards:
 * 1. Read-only against local SQLite (labeliq.db is never modified or deleted).
 * 2. Uses Supabase .upsert() with { onConflict: 'id' } so that re-running never
 *    creates duplicates or deletes existing remote records.
 * 3. Dry-run mode by default unless --execute flag is explicitly supplied.
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');

// Load environment from .env.labeliq or .env
const envFile = fs.existsSync(path.resolve(process.cwd(), '.env.labeliq'))
  ? path.resolve(process.cwd(), '.env.labeliq')
  : path.resolve(process.cwd(), '.env');

if (fs.existsSync(envFile)) {
  const envConfig = dotenv.parse(fs.readFileSync(envFile));
  for (const k in envConfig) {
    if (!process.env[k]) process.env[k] = envConfig[k];
  }
}

const isExecute = process.argv.includes('--execute');
const dbPath = path.resolve(process.cwd(), 'labeliq.db');

if (!fs.existsSync(dbPath)) {
  console.error(`[Migration] SQLite database file not found at ${dbPath}`);
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Migration] Supabase credentials missing (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

console.log('==================================================================');
console.log(`  LabelIQ SQLite -> Supabase Non-Destructive Data Migration       `);
console.log(`  Mode: ${isExecute ? 'LIVE EXECUTION (--execute)' : 'DRY-RUN (Simulated)'} `);
console.log('==================================================================\n');

const sqliteDb = new Database(dbPath, { readonly: true });
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const TABLES_IN_ORDER = [
  'workspaces',
  'products',
  'product_variants',
  'recipe_versions',
  'recipe_ingredients',
  'allergen_declarations',
  'nutrition_records',
  'label_designs',
  'production_batches',
  'audit_events'
];

async function migrate() {
  const stats = {};

  for (const table of TABLES_IN_ORDER) {
    let rows = [];
    try {
      rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();
    } catch (e) {
      console.warn(`[Table ${table}] Not found in SQLite: ${e.message}`);
      continue;
    }

    stats[table] = { localCount: rows.length, status: 'pending' };
    console.log(`➜ [${table}] Found ${rows.length} local records in SQLite.`);

    if (rows.length === 0) {
      stats[table].status = 'skipped_empty';
      continue;
    }

    // Convert integer boolean columns (0/1) to true/false for PostgreSQL boolean columns
    const sanitizedRows = rows.map(row => {
      const copy = { ...row };
      if ('is_vegetarian' in copy) copy.is_vegetarian = Boolean(copy.is_vegetarian);
      if ('is_demo' in copy) copy.is_demo = Boolean(copy.is_demo);
      if ('is_active' in copy) copy.is_active = Boolean(copy.is_active);
      if ('is_allergen' in copy) copy.is_allergen = Boolean(copy.is_allergen);
      if ('show_veg_logo' in copy) copy.show_veg_logo = Boolean(copy.show_veg_logo);
      if ('show_nutrition_table' in copy) copy.show_nutrition_table = Boolean(copy.show_nutrition_table);
      if ('show_barcode' in copy) copy.show_barcode = Boolean(copy.show_barcode);
      if ('show_qr_code' in copy) copy.show_qr_code = Boolean(copy.show_qr_code);
      return copy;
    });

    if (isExecute) {
      // Non-destructive upsert in chunks of 50
      const chunkSize = 50;
      let insertedCount = 0;
      for (let i = 0; i < sanitizedRows.length; i += chunkSize) {
        const chunk = sanitizedRows.slice(i, i + chunkSize);
        const { error } = await supabase
          .from(table)
          .upsert(chunk, { onConflict: 'id', ignoreDuplicates: false });

        if (error) {
          console.error(`❌ [${table}] Upsert error: ${error.message} (code: ${error.code})`);
          stats[table].status = `error: ${error.message}`;
          break;
        } else {
          insertedCount += chunk.length;
        }
      }
      if (stats[table].status === 'pending') {
        stats[table].status = `upserted ${insertedCount} records successfully`;
        console.log(`   ✓ [${table}] Safely upserted ${insertedCount} records to Supabase.`);
      }
    } else {
      stats[table].status = `dry-run ok: ${rows.length} records ready for upsert`;
    }
  }

  sqliteDb.close();

  console.log('\n==================================================================');
  console.log('  Migration Summary                                              ');
  console.log('==================================================================');
  console.log(JSON.stringify(stats, null, 2));

  if (!isExecute) {
    console.log('\nNOTE: This was a DRY RUN. Zero remote records were modified.');
    console.log('To apply changes to Supabase after verifying schema, pass --execute.');
  }
}

migrate().catch(err => {
  console.error('[Fatal Migration Error]', err);
  process.exit(1);
});
