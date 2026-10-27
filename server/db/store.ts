import { DataStore, SupabaseStore } from './supabaseStore.js';
import { SqliteStore } from './sqliteStore.js';
import { getSupabaseConfig } from './supabaseClient.js';

class HybridDataStore implements DataStore {
  private supabaseStore: SupabaseStore | null = null;
  private sqliteStore: SqliteStore | null = null;
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
        // If table does not exist in Supabase (migration pending) and SQLite is available locally, fallback
        if (this.sqliteStore && (err.code === '42P01' || err.code === 'PGRST205' || err.message?.includes('does not exist') || err.message?.includes('relation') || err.message?.includes('schema cache'))) {
          console.warn(`[Store] Supabase table pending for ${String(fnName)}, falling back to local SQLite: ${err.message}`);
          const fallbackMethod = (this.sqliteStore as any)[fnName];
          return await fallbackMethod.apply(this.sqliteStore, args);
        }
        throw err;
      }
    }

    // Default to SQLite
    if (this.sqliteStore) {
      const method = (this.sqliteStore as any)[fnName];
      if (typeof method === 'function') {
        return await method.apply(this.sqliteStore, args);
      }
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
