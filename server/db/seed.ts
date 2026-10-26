import { db } from './database';

export function seedDemoData(forceReset = false): void {
  if (process.env.VERCEL) return;
  const existing = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_demo = 1').get() as { count: number };
  if (existing.count > 0 && !forceReset) {
    console.log('[Seed] Demo data already exists. Skipping seed.');
    return;
  }

  if (forceReset) {
    console.log('[Seed] Resetting demo records...');
    db.exec(`
      DELETE FROM audit_events WHERE id IN ('aud-1', 'aud-2', 'aud-3');
      DELETE FROM production_batches WHERE product_id IN (SELECT id FROM products WHERE is_demo = 1);
      DELETE FROM label_designs WHERE product_id IN (SELECT id FROM products WHERE is_demo = 1);
      DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE is_demo = 1);
      DELETE FROM recipe_versions WHERE product_id IN (SELECT id FROM products WHERE is_demo = 1);
      DELETE FROM products WHERE is_demo = 1;
    `);
  }

  console.log('[Seed] Inserting authentic demo food product and production batches...');

  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (
      id, workspace_id, brand_name, product_name, category, subcategory,
      jurisdiction, description, dietary_classification, is_vegetarian,
      fssai_license, storage_instructions, directions_for_use, status, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT OR REPLACE INTO product_variants (
      id, product_id, sku, variant_name, net_quantity, net_quantity_unit,
      drained_weight, packaging_format, barcode_ean13, default_width_mm, default_height_mm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecipeVersion = db.prepare(`
    INSERT OR REPLACE INTO recipe_versions (
      id, product_id, version_number, version_tag, change_summary, is_active
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertIngredient = db.prepare(`
    INSERT OR REPLACE INTO recipe_ingredients (
      id, recipe_version_id, sort_order, name, percentage, is_allergen, source_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAllergen = db.prepare(`
    INSERT OR REPLACE INTO allergen_declarations (
      id, recipe_version_id, declaration_text, cross_contact_notes
    ) VALUES (?, ?, ?, ?)
  `);

  const insertNutrition = db.prepare(`
    INSERT OR REPLACE INTO nutrition_records (
      id, recipe_version_id, serving_basis, serving_size, energy_kcal, protein_g,
      carbohydrates_g, total_sugars_g, added_sugars_g, total_fat_g, saturated_fat_g,
      trans_fat_g, sodium_mg, data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBatch = db.prepare(`
    INSERT OR REPLACE INTO production_batches (
      id, product_id, variant_id, recipe_version_id, label_design_id,
      batch_number, mfg_date, expiry_date, best_before_months,
      batch_size_quantity, batch_size_unit, planned_units, packaged_units, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLabelDesign = db.prepare(`
    INSERT OR REPLACE INTO label_designs (
      id, product_id, variant_id, recipe_version_id, template_id,
      width_mm, height_mm, unit, orientation, layout_style, font_family, font_size_scale,
      bleed_mm, safe_margin_mm, border_radius_mm, custom_primary_color, custom_accent_color,
      custom_bg_color, custom_text_color, show_veg_logo, show_nutrition_table,
      show_barcode, show_qr_code, qr_code_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT OR REPLACE INTO audit_events (id, entity_type, entity_id, action, summary)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    // 1. Master Product
    const productId = 'prod-demo-pickle';
    insertProduct.run(
      productId,
      'default',
      "Dadi's Heritage Kitchen",
      'Spiced Raw Mango Pickle (Aam Ka Achar)',
      'Pickles, Chutneys & Condiments',
      'Artisanal Oil-Cured Mango Pickle',
      'FSSAI (India)',
      'Traditional sun-cured raw Ramkela mango pickle infused with roasted spices and cold-pressed organic mustard oil. Aged naturally for 21 days in earthen jars.',
      'veg',
      1,
      '10019022009841',
      'Store in a cool and dry place away from direct sunlight. Always use a clean dry spoon.',
      'Serve as an accompaniment with parathas, khichdi, or steamed rice with ghee.',
      'active',
      1
    );

    // 2. Packaging Variants
    insertVariant.run('var-pickle-200g', productId, 'DHK-MP-200G', '200g Tasting Jar', 200, 'g', 130, 'Hexagonal Glass Jar', '8901234567807', 95, 60);
    insertVariant.run('var-pickle-400g', productId, 'DHK-MP-400G', '400g Standard Jar', 400, 'g', 260, 'Round Glass Jar', '8901234567890', 120, 75);
    insertVariant.run('var-pickle-1kg', productId, 'DHK-MP-1KG', '1kg Family Tub', 1000, 'g', 650, 'Food-Grade PET Tub', '8901234567814', 180, 100);

    // 3. Recipe Version 1: Baseline Traditional (High Sodium)
    const v1Id = 'rcp-pickle-v1';
    insertRecipeVersion.run(v1Id, productId, 1, 'v1.0-Original', 'Traditional recipe formulation with 1400mg sodium per 100g.', 0);
    
    insertIngredient.run('ing-v1-1', v1Id, 1, 'Raw Green Mango Pieces', '62%', 0, 'Sourced from Ratnagiri farms');
    insertIngredient.run('ing-v1-2', v1Id, 2, 'Cold Pressed Mustard Oil', '18%', 1, 'Allergen: Contains Mustard');
    insertIngredient.run('ing-v1-3', v1Id, 3, 'Iodized Salt', '8%', 0, 'Preservative medium');
    insertIngredient.run('ing-v1-4', v1Id, 4, 'Red Chilli Powder', '4%', 0, 'Guntur Chilli');
    insertIngredient.run('ing-v1-5', v1Id, 5, 'Fenugreek Seeds (Methi)', '3%', 0, 'Roasted whole');
    insertIngredient.run('ing-v1-6', v1Id, 6, 'Yellow Mustard Seeds (Rai Dal)', '2.5%', 1, 'Cracked split seeds');
    insertIngredient.run('ing-v1-7', v1Id, 7, 'Turmeric Powder (Haldi)', '1.5%', 0, 'Salem turmeric');
    insertIngredient.run('ing-v1-8', v1Id, 8, 'Fennel Seeds (Saunf)', '0.6%', 0, 'Fragrant whole');
    insertIngredient.run('ing-v1-9', v1Id, 9, 'Asafoetida (Hing)', '0.3%', 0, 'Compounded compound');
    insertIngredient.run('ing-v1-10', v1Id, 10, 'Nigella Seeds (Kalonji)', '0.1%', 0, 'Black onion seeds');

    insertAllergen.run('alg-v1', v1Id, 'Contains: Mustard (Mustard Oil and Mustard Seeds).', 'Manufactured in a small-batch kitchen that also packages sesame seeds and tree nuts.');

    insertNutrition.run(
      'nut-v1', v1Id, 'per 100g', '15g (1 serving approx)',
      242, 2.8, 12.4, 3.2, 0, 20.1, 2.6, 0.05, 1400,
      'Accredited FSSAI Laboratory Testing Report NABL-2023-F092'
    );

    // 4. Recipe Version 2: Reformulation (Lite-Salt Sodium Shift)
    const v2Id = 'rcp-pickle-v2';
    insertRecipeVersion.run(v2Id, productId, 2, 'v2.0-LiteSalt', 'Reformulated with potassium-reduced salt blend. Sodium lowered by 35.7% from 1400mg to 900mg.', 1);

    insertIngredient.run('ing-v2-1', v2Id, 1, 'Raw Green Mango Pieces', '64%', 0, 'Increased fruit mass');
    insertIngredient.run('ing-v2-2', v2Id, 2, 'Cold Pressed Mustard Oil', '17%', 1, 'Allergen: Contains Mustard');
    insertIngredient.run('ing-v2-3', v2Id, 3, 'Low Sodium Sea Salt Blend', '5.5%', 0, 'Potassium fortified salt');
    insertIngredient.run('ing-v2-4', v2Id, 4, 'Red Chilli Powder', '4.2%', 0, 'Guntur Chilli');
    insertIngredient.run('ing-v2-5', v2Id, 5, 'Fenugreek Seeds (Methi)', '3.2%', 0, 'Roasted whole');
    insertIngredient.run('ing-v2-6', v2Id, 6, 'Yellow Mustard Seeds (Rai Dal)', '2.5%', 1, 'Cracked split seeds');
    insertIngredient.run('ing-v2-7', v2Id, 7, 'Turmeric Powder (Haldi)', '2.0%', 0, 'Salem turmeric');
    insertIngredient.run('ing-v2-8', v2Id, 8, 'Fennel Seeds (Saunf)', '0.8%', 0, 'Fragrant whole');
    insertIngredient.run('ing-v2-9', v2Id, 9, 'Asafoetida (Hing)', '0.5%', 0, 'Compounded compound');
    insertIngredient.run('ing-v2-10', v2Id, 10, 'Nigella Seeds (Kalonji)', '0.3%', 0, 'Black onion seeds');

    insertAllergen.run('alg-v2', v2Id, 'Contains: Mustard (Mustard Oil and Mustard Seeds).', 'Manufactured in a certified artisanal kitchen with dedicated allergen separation.');

    insertNutrition.run(
      'nut-v2', v2Id, 'per 100g', '15g (1 serving approx)',
      230, 2.9, 13.1, 3.0, 0, 18.8, 2.4, 0.03, 900,
      'Reformulation Nutritional Assay Certificate NABL-2024-C412'
    );

    // 5. Approved Label Design (Heritage Premium)
    const labelDesignId = 'lbl-pickle-heritage';
    insertLabelDesign.run(
      labelDesignId, productId, 'var-pickle-400g', v2Id, 'heritage-premium',
      120, 75, 'mm', 'landscape', 'two-panel', 'serif', 1.0,
      2.0, 3.0, 3.0, '#7A1C1C', '#C29B38', '#FDFBF7', '#1F2937',
      1, 1, 1, 1, 'PROD: Heritage Mango Pickle | BATCH: HK-MP-2024-B108 | EXP: 2025-10-24 | FSSAI: 10019022009841'
    );

    // 6. Production Batches
    // Batch 1: Small Artisan Run (100 jars for Farmers Market)
    insertBatch.run(
      'batch-dhk-108', productId, 'var-pickle-400g', v2Id, labelDesignId,
      'HK-MP-2024-B108', '2024-10-15', '2025-10-14', 12,
      40, 'kg', 100, 100, 'Packaged',
      'Artisanal pilot batch produced for Sunday Organic Farmers Market. Hand-filled in sterilized glass jars.'
    );

    // Batch 2: Commercial Distribution Run (500 jars for Retailers)
    insertBatch.run(
      'batch-dhk-109', productId, 'var-pickle-400g', v2Id, labelDesignId,
      'HK-MP-2024-B109', '2024-11-01', '2025-10-31', 12,
      200, 'kg', 500, 250, 'In Production',
      'Commercial wholesale batch destined for Nature Basket and artisanal organic cooperatives.'
    );

    // 7. Audit log
    insertAudit.run('aud-1', 'product', productId, 'CREATE', 'Created master product profile: Spiced Raw Mango Pickle');
    insertAudit.run('aud-2', 'recipe', v2Id, 'VERSION_UPGRADE', 'Created v2.0 LiteSalt recipe shifting sodium from 1400mg to 900mg (-35.7%)');
    insertAudit.run('aud-3', 'batch', 'batch-dhk-108', 'BATCH_RELEASE', 'Released production batch HK-MP-2024-B108 (100 jars)');
  });

  tx();
  console.log('[Seed] Demo data seeded successfully.');
}
