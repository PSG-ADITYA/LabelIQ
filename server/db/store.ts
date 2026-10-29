import { DataStore, SupabaseStore } from './supabaseStore.js';
import { SqliteStore } from './sqliteStore.js';
import { getSupabaseConfig } from './supabaseClient.js';

class InMemoryStore implements DataStore {
  private products: any[] = [
    {
      id: 'prod-demo-pickle',
      brand_name: 'Pahadi Heritage Foods',
      product_name: 'Traditional Mango Pickle',
      category: 'Pickles, Chutneys & Sauces',
      dietary_classification: 'veg',
      fssai_license: '10019022009841',
      variant_count: 1,
      version_count: 1,
      batch_count: 1,
      active_version: 1,
      created_at: new Date().toISOString()
    }
  ];

  private batches: any[] = [
    {
      id: 'batch-demo-1',
      product_id: 'prod-demo-pickle',
      batch_number: 'HK-BATCH-2026-B469',
      mfg_date: '2026-10-29',
      expiry_date: '2027-10-29',
      best_before_months: 12,
      planned_units: 250,
      packaged_units: 0,
      batch_size_quantity: 100,
      batch_size_unit: 'kg',
      status: 'Planned',
      notes: 'Scheduled commercial production run.',
      product_name: 'Traditional Mango Pickle',
      brand_name: 'Pahadi Heritage Foods',
      category: 'Pickles, Chutneys & Sauces',
      variant_name: '400g Glass Jar',
      net_quantity: 400,
      net_quantity_unit: 'g',
      packaging_format: 'Glass Jar',
      barcode_ean13: '8901030382914',
      created_at: new Date().toISOString()
    }
  ];

  async getProducts(): Promise<any[]> {
    return this.products;
  }

  async getProduct(id: string): Promise<any | null> {
    const p = this.products.find(x => x.id === id);
    if (!p) return null;
    return {
      ...p,
      variants: [{ id: 'var-1', product_id: p.id, variant_name: 'Standard Pack', net_quantity: 400, net_quantity_unit: 'g' }],
      recipeVersions: [{ id: 'rcp-1', version_number: 1, is_active: 1, ingredients: [], allergenDeclarations: [], nutrition: {} }],
      batches: this.batches.filter(b => b.product_id === p.id)
    };
  }

  async createProduct(data: any): Promise<{ productId: string }> {
    const id = `prod-${Date.now()}`;
    this.products.unshift({
      id,
      brand_name: data.brandName || 'Brand',
      product_name: data.productName || 'Product',
      category: data.category || 'General Food',
      dietary_classification: data.dietaryClassification || 'veg',
      fssai_license: data.fssaiLicense || '10019022009841',
      variant_count: 1,
      version_count: 1,
      batch_count: 0,
      active_version: 1,
      created_at: new Date().toISOString()
    });
    return { productId: id };
  }

  async createRecipeVersion(_productId: string, _versionData: any): Promise<{ versionId: string; versionNumber: number }> {
    return { versionId: `rcp-${Date.now()}`, versionNumber: 2 };
  }

  async getBatches(): Promise<any[]> {
    return this.batches;
  }

  async createBatch(batchData: any): Promise<{ batchId: string }> {
    const batchId = `batch-${Date.now()}`;
    const newBatch = {
      id: batchId,
      product_id: batchData.productId || batchData.product_id || 'prod-demo-pickle',
      batch_number: batchData.batchNumber || batchData.batch_number || `BATCH-${Date.now().toString().slice(-4)}`,
      mfg_date: batchData.mfgDate || batchData.mfg_date || new Date().toISOString().slice(0, 10),
      expiry_date: batchData.expiryDate || batchData.expiry_date || new Date(Date.now() + 365*24*3600*1000).toISOString().slice(0, 10),
      best_before_months: batchData.bestBeforeMonths || batchData.best_before_months || 12,
      planned_units: batchData.plannedUnits ?? batchData.planned_units ?? 250,
      packaged_units: 0,
      batch_size_quantity: batchData.batchSizeQuantity || batchData.batch_size_quantity || 100,
      batch_size_unit: batchData.batchSizeUnit || batchData.batch_size_unit || 'kg',
      status: 'Planned',
      notes: batchData.notes || 'Scheduled commercial production run.',
      product_name: batchData.product_name || 'Traditional Mango Pickle',
      brand_name: batchData.brand_name || 'Pahadi Heritage Foods',
      category: batchData.category || 'Pickles, Chutneys & Sauces',
      variant_name: batchData.variant_name || 'Standard Pack',
      net_quantity: batchData.netQuantity || batchData.net_quantity || 400,
      net_quantity_unit: batchData.netQuantityUnit || batchData.net_quantity_unit || 'g',
      packaging_format: batchData.packagingFormat || batchData.packaging_format || 'Glass Jar',
      created_at: new Date().toISOString()
    };
    this.batches.unshift(newBatch);
    return { batchId };
  }

  async updateBatch(id: string, partial: { status?: string; packagedUnits?: number; notes?: string }): Promise<boolean> {
    const b = this.batches.find(x => x.id === id);
    if (b) {
      if (partial.status) b.status = partial.status;
      if (partial.packagedUnits !== undefined) b.packaged_units = partial.packagedUnits;
      if (partial.notes !== undefined) b.notes = partial.notes;
    }
    return true;
  }

  async duplicateBatch(id: string): Promise<{ newBatchId: string; newBatchNumber: string }> {
    const b = this.batches.find(x => x.id === id);
    const newBatchId = `batch-${Date.now()}`;
    const newBatchNumber = b ? `${b.batch_number}-COPY` : `BATCH-COPY-${Date.now().toString().slice(-4)}`;
    if (b) {
      this.batches.unshift({
        ...b,
        id: newBatchId,
        batch_number: newBatchNumber,
        status: 'Planned',
        created_at: new Date().toISOString()
      });
    }
    return { newBatchId, newBatchNumber };
  }

  async getPublicVerify(identifier: string): Promise<any | null> {
    const b = this.batches.find(x => x.batch_number === identifier || x.id === identifier) || this.batches[0];
    return {
      batch: b,
      product: {
        brand_name: b.brand_name,
        product_name: b.product_name,
        category: b.category,
        fssai_license: '10019022009841'
      },
      verifiedAt: new Date().toISOString(),
      officialFoscosPortal: 'https://foscos.fssai.gov.in'
    };
  }

  async getPublicStory(_id: string): Promise<any | null> {
    return {
      regionalOrigin: 'Almora, Kumaon Himalayas, Uttarakhand',
      producerStory: 'Handcrafted in small batches by women-led farmer collectives using organic orchard produce.',
      tastingNotes: ['Sun-ripened tartness', 'Cold-pressed mustard aroma', 'Warm aromatic spices'],
      harvestSeason: 'Spring 2026 Reserve'
    };
  }

  async exportBackup(): Promise<any> {
    return { products: this.products, batches: this.batches };
  }
}

class HybridDataStore implements DataStore {
  private supabaseStore: SupabaseStore | null = null;
  private sqliteStore: SqliteStore | null = null;
  private inMemoryStore: InMemoryStore = new InMemoryStore();
  private isSupabasePrimary: boolean = false;
  private isInitialized: boolean = false;

  private initIfNeeded() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    const config = getSupabaseConfig();
    const isVercel = Boolean(process.env.VERCEL);

    if (config.isConfigured && config.url && (config.serviceKey || config.anonKey)) {
      this.supabaseStore = new SupabaseStore(config.url, (config.serviceKey || config.anonKey)!);
      this.isSupabasePrimary = true;
      console.log('[Store] SupabaseStore activated as primary database.');
    } else if (isVercel) {
      console.warn('[Store] Vercel environment detected without full Supabase credentials.');
    }

    // Initialize local SQLite store if not on Vercel
    if (!isVercel) {
      this.sqliteStore = new SqliteStore();
    }
  }

  private async execute<T>(fnName: keyof DataStore, ...args: any[]): Promise<T> {
    this.initIfNeeded();
    // If Supabase is primary, attempt it first
    if (this.isSupabasePrimary && this.supabaseStore) {
      try {
        const method = (this.supabaseStore as any)[fnName];
        if (typeof method === 'function') {
          const res = await method.apply(this.supabaseStore, args);
          if (res !== null && res !== undefined) {
            return res;
          }
          if (this.sqliteStore) {
            const fallbackMethod = (this.sqliteStore as any)[fnName];
            if (typeof fallbackMethod === 'function') {
              const fallbackRes = await fallbackMethod.apply(this.sqliteStore, args);
              if (fallbackRes !== null && fallbackRes !== undefined) {
                return fallbackRes;
              }
            }
          }
          return res;
        }
      } catch (err: any) {
        console.warn(`[Store] Supabase execution error for ${String(fnName)}, engaging resilient fallback: ${err?.message || err}`);
        if (this.sqliteStore) {
          try {
            const fallbackMethod = (this.sqliteStore as any)[fnName];
            if (typeof fallbackMethod === 'function') {
              return await fallbackMethod.apply(this.sqliteStore, args);
            }
          } catch (sqlErr: any) {
            console.warn(`[Store] SQLite fallback failed for ${String(fnName)}:`, sqlErr?.message);
          }
        }
        const memMethod = (this.inMemoryStore as any)[fnName];
        if (typeof memMethod === 'function') {
          return await memMethod.apply(this.inMemoryStore, args);
        }
        throw err;
      }
    }

    // Default to SQLite if available
    if (this.sqliteStore) {
      const method = (this.sqliteStore as any)[fnName];
      if (typeof method === 'function') {
        return await method.apply(this.sqliteStore, args);
      }
    }

    // Resilient fallback to InMemoryStore
    const memMethod = (this.inMemoryStore as any)[fnName];
    if (typeof memMethod === 'function') {
      return await memMethod.apply(this.inMemoryStore, args);
    }

    throw new Error(`[Store] No active database provider configured for ${String(fnName)}.`);
  }

  async getProducts(): Promise<any[]> {
    return this.execute('getProducts');
  }

  async getProduct(id: string): Promise<any | null> {
    return this.execute('getProduct', id);
  }

  async createProduct(data: any): Promise<{ productId: string }> {
    return this.execute('createProduct', data);
  }

  async createRecipeVersion(productId: string, versionData: any): Promise<{ versionId: string; versionNumber: number }> {
    return this.execute('createRecipeVersion', productId, versionData);
  }

  async getBatches(): Promise<any[]> {
    return this.execute('getBatches');
  }

  async createBatch(batchData: any): Promise<{ batchId: string }> {
    return this.execute('createBatch', batchData);
  }

  async updateBatch(id: string, partial: { status?: string; packagedUnits?: number; notes?: string }): Promise<boolean> {
    return this.execute('updateBatch', id, partial);
  }

  async duplicateBatch(id: string): Promise<{ newBatchId: string; newBatchNumber: string }> {
    return this.execute('duplicateBatch', id);
  }

  async getPublicVerify(identifier: string): Promise<any | null> {
    return this.execute('getPublicVerify', identifier);
  }

  async getPublicStory(id: string): Promise<any | null> {
    return this.execute('getPublicStory', id);
  }

  async exportBackup(): Promise<any> {
    return this.execute('exportBackup');
  }
}

export const dataStore: DataStore = new HybridDataStore();
