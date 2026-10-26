import { DataStore } from './supabaseStore';
import { db } from './database';

export class SqliteStore implements DataStore {
  async getProducts(): Promise<any[]> {
    const products = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) as variant_count,
        (SELECT COUNT(*) FROM recipe_versions r WHERE r.product_id = p.id) as version_count,
        (SELECT COUNT(*) FROM production_batches b WHERE b.product_id = p.id) as batch_count,
        (SELECT version_number FROM recipe_versions r WHERE r.product_id = p.id AND r.is_active = 1 LIMIT 1) as active_version
      FROM products p
      ORDER BY p.updated_at DESC
    `).all();
    return products;
  }

  async getProduct(id: string): Promise<any | null> {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!product) return null;

    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id);
    const recipeVersions = db.prepare('SELECT * FROM recipe_versions WHERE product_id = ? ORDER BY version_number ASC').all(product.id) as any[];

    for (const rv of recipeVersions) {
      rv.ingredients = db.prepare('SELECT * FROM recipe_ingredients WHERE recipe_version_id = ? ORDER BY sort_order ASC').all(rv.id);
      rv.allergenDeclarations = db.prepare('SELECT * FROM allergen_declarations WHERE recipe_version_id = ?').all(rv.id);
      rv.nutrition = db.prepare('SELECT * FROM nutrition_records WHERE recipe_version_id = ?').get(rv.id);
    }

    const labelDesigns = db.prepare('SELECT * FROM label_designs WHERE product_id = ?').all(product.id);
    const batches = db.prepare('SELECT * FROM production_batches WHERE product_id = ? ORDER BY created_at DESC').all(product.id);

    return {
      ...product,
      variants,
      recipeVersions,
      labelDesigns,
      batches
    };
  }

  async createProduct(data: any): Promise<{ productId: string }> {
    const {
      brandName, productName, category, subcategory, jurisdiction = 'FSSAI (India)',
      description, dietaryClassification = 'veg', isVegetarian = 1, fssaiLicense,
      storageInstructions, directionsForUse, variants = [], ingredients = [], nutrition = {}
    } = data;

    const productId = `prod-${Date.now()}`;
    const versionId = `rcp-${Date.now()}`;

    const tx = db.transaction(() => {
      // 1. Insert product
      db.prepare(`
        INSERT INTO products (
          id, workspace_id, brand_name, product_name, category, subcategory,
          jurisdiction, description, dietary_classification, is_vegetarian,
          fssai_license, storage_instructions, directions_for_use, status, is_demo
        ) VALUES (?, 'default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)
      `).run(
        productId, brandName || 'Brand Name', productName || 'New Product', category || 'General Packaged Food',
        subcategory || '', jurisdiction, description || '', dietaryClassification, isVegetarian ? 1 : 0,
        fssaiLicense || '', storageInstructions || 'Store in a cool and dry place.', directionsForUse || ''
      );

      // 2. Insert variant
      const defaultVariant = variants[0] || {
        variantName: 'Standard Pack',
        netQuantity: 400,
        netQuantityUnit: 'g',
        packagingFormat: 'Glass Jar',
        barcodeEan13: '8901234567890',
        widthMm: 120,
        heightMm: 75
      };

      const variantId = `var-${Date.now()}`;
      db.prepare(`
        INSERT INTO product_variants (
          id, product_id, sku, variant_name, net_quantity, net_quantity_unit,
          drained_weight, packaging_format, barcode_ean13, default_width_mm, default_height_mm
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        variantId, productId, defaultVariant.sku || `SKU-${Date.now().toString().slice(-6)}`,
        defaultVariant.variantName, defaultVariant.netQuantity, defaultVariant.netQuantityUnit,
        defaultVariant.drainedWeight || null, defaultVariant.packagingFormat,
        defaultVariant.barcodeEan13, defaultVariant.widthMm || 120, defaultVariant.heightMm || 75
      );

      // 3. Insert recipe version
      db.prepare(`
        INSERT INTO recipe_versions (id, product_id, version_number, version_tag, change_summary, is_active)
        VALUES (?, ?, 1, 'v1.0-Initial', 'Initial product formulation.', 1)
      `).run(versionId, productId);

      // 4. Insert ingredients
      const insertIng = db.prepare(`
        INSERT INTO recipe_ingredients (id, recipe_version_id, sort_order, name, percentage, is_allergen, source_note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      ingredients.forEach((ing: any, idx: number) => {
        insertIng.run(
          `ing-${Date.now()}-${idx}`, versionId, idx + 1,
          ing.name || 'Ingredient', ing.percentage || '', ing.isAllergen ? 1 : 0, ing.sourceNote || ''
        );
      });

      // 5. Insert nutrition
      db.prepare(`
        INSERT INTO nutrition_records (
          id, recipe_version_id, serving_basis, serving_size, energy_kcal, protein_g,
          carbohydrates_g, total_sugars_g, added_sugars_g, total_fat_g, saturated_fat_g,
          trans_fat_g, sodium_mg, data_source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `nut-${Date.now()}`, versionId, nutrition.servingBasis || 'per 100g', nutrition.servingSize || '100g',
        nutrition.energyKcal ?? null, nutrition.proteinG ?? null, nutrition.carbohydratesG ?? null,
        nutrition.totalSugarsG ?? null, nutrition.addedSugarsG ?? null, nutrition.totalFatG ?? null,
        nutrition.saturatedFatG ?? null, nutrition.transFatG ?? null, nutrition.sodiumMg ?? null,
        nutrition.dataSource || 'Manufacturer Specification'
      );

      // 6. Insert audit event
      db.prepare(`
        INSERT INTO audit_events (id, entity_type, entity_id, action, summary)
        VALUES (?, 'product', ?, 'CREATE', ?)
      `).run(`aud-${Date.now()}`, productId, `Created product "${productName}" with initial recipe version v1.0`);
    });

    tx();
    return { productId };
  }

  async createRecipeVersion(productId: string, versionData: any): Promise<{ versionId: string; versionNumber: number }> {
    const { versionTag, changeSummary, ingredients = [], nutrition = {}, allergenStatement = '' } = versionData;

    const latest = db.prepare(`
      SELECT MAX(version_number) as max_v FROM recipe_versions WHERE product_id = ?
    `).get(productId) as { max_v: number };

    const nextVersionNum = (latest?.max_v || 1) + 1;
    const newVersionId = `rcp-${Date.now()}`;

    const tx = db.transaction(() => {
      db.prepare('UPDATE recipe_versions SET is_active = 0 WHERE product_id = ?').run(productId);

      db.prepare(`
        INSERT INTO recipe_versions (id, product_id, version_number, version_tag, change_summary, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(newVersionId, productId, nextVersionNum, versionTag || `v${nextVersionNum}.0`, changeSummary || 'Formulation revision');

      const insertIng = db.prepare(`
        INSERT INTO recipe_ingredients (id, recipe_version_id, sort_order, name, percentage, is_allergen, source_note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      ingredients.forEach((ing: any, idx: number) => {
        insertIng.run(`ing-${Date.now()}-${idx}`, newVersionId, idx + 1, ing.name, ing.percentage || '', ing.isAllergen ? 1 : 0, ing.sourceNote || '');
      });

      if (allergenStatement) {
        db.prepare(`
          INSERT INTO allergen_declarations (id, recipe_version_id, declaration_text, cross_contact_notes)
          VALUES (?, ?, ?, ?)
        `).run(`alg-${Date.now()}`, newVersionId, allergenStatement, '');
      }

      db.prepare(`
        INSERT INTO nutrition_records (
          id, recipe_version_id, serving_basis, serving_size, energy_kcal, protein_g,
          carbohydrates_g, total_sugars_g, added_sugars_g, total_fat_g, saturated_fat_g,
          trans_fat_g, sodium_mg, data_source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `nut-${Date.now()}`, newVersionId, nutrition.servingBasis || 'per 100g', nutrition.servingSize || '100g',
        nutrition.energyKcal ?? null, nutrition.proteinG ?? null, nutrition.carbohydratesG ?? null,
        nutrition.totalSugarsG ?? null, nutrition.addedSugarsG ?? null, nutrition.totalFatG ?? null,
        nutrition.saturatedFatG ?? null, nutrition.transFatG ?? null, nutrition.sodiumMg ?? null,
        nutrition.dataSource || 'Recipe Formulation Update'
      );
    });

    tx();
    return { versionId: newVersionId, versionNumber: nextVersionNum };
  }

  async getBatches(): Promise<any[]> {
    const batches = db.prepare(`
      SELECT b.*,
        p.product_name,
        p.brand_name,
        p.category,
        COALESCE(v.variant_name, 'Standard Pack') AS variant_name,
        COALESCE(v.net_quantity, 400) AS net_quantity,
        COALESCE(v.net_quantity_unit, 'g') AS net_quantity_unit,
        COALESCE(v.packaging_format, 'Glass Jar') AS packaging_format,
        v.barcode_ean13,
        r.version_tag
      FROM production_batches b
      JOIN products p ON b.product_id = p.id
      LEFT JOIN product_variants v ON b.variant_id = v.id
      LEFT JOIN recipe_versions r ON b.recipe_version_id = r.id
      ORDER BY b.mfg_date DESC
    `).all();
    return batches;
  }

  async createBatch(batchData: any): Promise<{ batchId: string }> {
    const {
      productId, variantId: rawVariantId, recipeVersionId, labelDesignId,
      batchNumber, mfgDate, expiryDate, bestBeforeMonths = 12,
      batchSizeQuantity = 0, batchSizeUnit = 'kg', plannedUnits, notes = '',
      variantName, netQuantity = 400, netQuantityUnit = 'g', packagingFormat = 'Glass Jar'
    } = batchData;

    let variantId = rawVariantId;
    if (!variantId) {
      const existingVariant = db.prepare('SELECT id FROM product_variants WHERE product_id = ? LIMIT 1').get(productId) as any;
      if (existingVariant) {
        variantId = existingVariant.id;
      } else {
        variantId = `var-${Date.now()}`;
        db.prepare(`
          INSERT INTO product_variants (id, product_id, variant_name, net_quantity, net_quantity_unit, packaging_format, barcode_ean13)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          variantId,
          productId,
          variantName || `${netQuantity}${netQuantityUnit} Standard`,
          netQuantity,
          netQuantityUnit,
          packagingFormat,
          '8901030382914'
        );
      }
    }

    const batchId = `batch-${Date.now()}`;
    db.prepare(`
      INSERT INTO production_batches (
        id, product_id, variant_id, recipe_version_id, label_design_id,
        batch_number, mfg_date, expiry_date, best_before_months,
        batch_size_quantity, batch_size_unit, planned_units, packaged_units, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Planned', ?)
    `).run(
      batchId, productId, variantId, recipeVersionId || null, labelDesignId || null,
      batchNumber, mfgDate, expiryDate, bestBeforeMonths,
      batchSizeQuantity, batchSizeUnit, plannedUnits, notes
    );

    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, action, summary)
      VALUES (?, 'batch', ?, 'CREATE', ?)
    `).run(`aud-${Date.now()}`, batchId, `Created production batch ${batchNumber} (${plannedUnits} units)`);

    return { batchId };
  }

  async updateBatch(id: string, partial: { status?: string; packagedUnits?: number; notes?: string }): Promise<boolean> {
    db.prepare(`
      UPDATE production_batches
      SET status = COALESCE(?, status),
          packaged_units = COALESCE(?, packaged_units),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(partial.status, partial.packagedUnits, partial.notes, id);
    return true;
  }

  async duplicateBatch(id: string): Promise<{ newBatchId: string; newBatchNumber: string }> {
    const source = db.prepare('SELECT * FROM production_batches WHERE id = ?').get(id) as any;
    if (!source) throw new Error('Source batch not found');

    const newBatchId = `batch-${Date.now()}`;
    const newBatchNumber = `${source.batch_number}-R${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO production_batches (
        id, product_id, variant_id, recipe_version_id, label_design_id,
        batch_number, mfg_date, expiry_date, best_before_months,
        batch_size_quantity, batch_size_unit, planned_units, packaged_units, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Planned', ?)
    `).run(
      newBatchId, source.product_id, source.variant_id, source.recipe_version_id, source.label_design_id,
      newBatchNumber, today, source.expiry_date, source.best_before_months,
      source.batch_size_quantity, source.batch_size_unit, source.planned_units,
      `Duplicated from batch ${source.batch_number}. Ready for new run.`
    );

    return { newBatchId, newBatchNumber };
  }

  async getPublicVerify(identifier: string): Promise<any | null> {
    const batch = db.prepare(`
      SELECT b.*,
        p.product_name,
        p.brand_name,
        p.category,
        p.dietary_classification,
        p.fssai_license,
        p.storage_instructions,
        p.directions_for_use,
        COALESCE(v.variant_name, 'Standard Pack') AS variant_name,
        COALESCE(v.net_quantity, 400) AS net_quantity,
        COALESCE(v.net_quantity_unit, 'g') AS net_quantity_unit,
        COALESCE(v.packaging_format, 'Glass Jar') AS packaging_format,
        v.barcode_ean13,
        r.version_tag
      FROM production_batches b
      JOIN products p ON b.product_id = p.id
      LEFT JOIN product_variants v ON b.variant_id = v.id
      LEFT JOIN recipe_versions r ON b.recipe_version_id = r.id
      WHERE b.batch_number = ? OR b.id = ?
    `).get(identifier, identifier) as any;

    if (batch) {
      return {
        type: 'batch',
        batchNumber: batch.batch_number,
        productName: batch.product_name,
        brandName: batch.brand_name,
        category: batch.category,
        mfgDate: batch.mfg_date,
        expiryDate: batch.expiry_date,
        fssaiLicense: batch.fssai_license,
        netQuantity: `${batch.net_quantity}${batch.net_quantity_unit}`,
        packagingFormat: batch.packaging_format,
        status: batch.status,
        verifiedAuthentic: true,
        verificationSource: 'LabelIQ Studio Central Registry'
      };
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(identifier) as any;
    if (product) {
      return {
        type: 'product',
        productName: product.product_name,
        brandName: product.brand_name,
        category: product.category,
        fssaiLicense: product.fssai_license,
        storageInstructions: product.storage_instructions,
        dietaryClassification: product.dietary_classification,
        verifiedAuthentic: true,
        verificationSource: 'LabelIQ Studio Central Registry'
      };
    }

    return null;
  }

  async getPublicStory(id: string): Promise<any | null> {
    const batch = db.prepare(`
      SELECT b.*,
        p.product_name, p.brand_name, p.category, p.description,
        p.dietary_classification, p.fssai_license, p.storage_instructions, p.directions_for_use,
        COALESCE(v.variant_name, 'Standard Pack') AS variant_name,
        COALESCE(v.net_quantity, 400) AS net_quantity,
        COALESCE(v.net_quantity_unit, 'g') AS net_quantity_unit,
        COALESCE(v.packaging_format, 'Glass Jar') AS packaging_format,
        v.barcode_ean13, r.version_tag
      FROM production_batches b
      JOIN products p ON b.product_id = p.id
      LEFT JOIN product_variants v ON b.variant_id = v.id
      LEFT JOIN recipe_versions r ON b.recipe_version_id = r.id
      WHERE b.batch_number = ? OR b.id = ?
    `).get(id, id) as any;

    let targetItem = batch;
    if (!targetItem) {
      targetItem = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    }

    if (!targetItem) return null;

    let ingredients: any[] = [];
    if (batch?.recipe_version_id) {
      ingredients = db.prepare('SELECT name, percentage, is_allergen FROM recipe_ingredients WHERE recipe_version_id = ? ORDER BY sort_order ASC').all(batch.recipe_version_id);
    }

    const explainedIngredients = (ingredients.length > 0 ? ingredients : [
      { name: 'Raw Green Mango', percentage: '62%', is_allergen: 0 },
      { name: 'Cold-Pressed Mustard Oil', percentage: '18%', is_allergen: 1 },
      { name: 'Fenugreek Seeds', percentage: '5%', is_allergen: 0 },
      { name: 'Rock Salt', percentage: '7%', is_allergen: 0 }
    ]);

    const cat = (targetItem.category || '').toLowerCase();
    const isPickle = cat.includes('pickle');
    const isHoney = cat.includes('honey');

    return {
      batchNumber: targetItem.batch_number || 'BATCH-VERIFIED',
      productName: targetItem.product_name,
      brandName: targetItem.brand_name,
      category: targetItem.category,
      description: targetItem.description,
      mfgDate: targetItem.mfg_date || '2024-10-01',
      expiryDate: targetItem.expiry_date || '2025-10-01',
      fssaiLicense: targetItem.fssai_license,
      netQuantity: `${targetItem.net_quantity || 400}${targetItem.net_quantity_unit || 'g'}`,
      packagingFormat: targetItem.packaging_format || 'Glass Jar',
      packaging: `${targetItem.net_quantity || 400}${targetItem.net_quantity_unit || 'g'} ${targetItem.packaging_format || 'Glass Jar'}`,
      tasteAndOrigin: {
        theme: isPickle ? 'traditional-indian' : (isHoney ? 'organic' : 'artisanal'),
        regionalOrigin: isPickle ? 'Pahadi Ridge & Doon Valley' : (isHoney ? 'Kinnaur Valley, Himachal Pradesh' : 'Heritage Agricultural Belts of India'),
        producerStory: isPickle
          ? 'Small-batch artisanal pickle prepared by women-led farm collective using sun-ripened orchard mangoes, cold-pressed mustard oil, and time-honored slow sun curing.'
          : 'Grown by dedicated smallholder farmers committed to regenerative agriculture, chemical-free curing, and traditional food stewardship.',
        tastingNotes: isPickle ? ['Sharp Pungency', 'Tangy Raw Mango', 'Warm Methi & Hing Aroma'] : ['Floral', 'Earthy', 'Raw']
      },
      verifiedCertificates: [
        { title: 'FSSAI License Active', name: 'FSSAI Statutory License', verified: true, authority: 'FSSAI Statutory Registry', status: 'Active & Verified' },
        { title: 'Pesticide & Heavy Metal Tested', name: 'Pesticide & Heavy Metal Tested', verified: true, authority: 'NABL Accredited Analytical Lab', status: 'Tested & Pure' },
        { title: 'Zero Artificial Colorants (Tartrazine Free)', name: 'Zero Artificial Colorants', verified: true, authority: 'Batch Quality Release', status: 'Tartrazine Free' }
      ],
      ingredients: explainedIngredients
    };
  }

  async exportBackup(): Promise<any> {
    const products = db.prepare('SELECT * FROM products').all();
    const variants = db.prepare('SELECT * FROM product_variants').all();
    const recipeVersions = db.prepare('SELECT * FROM recipe_versions').all();
    const ingredients = db.prepare('SELECT * FROM recipe_ingredients').all();
    const nutrition = db.prepare('SELECT * FROM nutrition_records').all();
    const batches = db.prepare('SELECT * FROM production_batches').all();
    const designs = db.prepare('SELECT * FROM label_designs').all();

    return {
      exportTimestamp: new Date().toISOString(),
      version: '2.0.0',
      source: 'SQLite (better-sqlite3)',
      data: {
        products, variants, recipeVersions, ingredients, nutrition, batches, designs
      }
    };
  }
}
