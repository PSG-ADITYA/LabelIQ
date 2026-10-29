import { ProductionBatch, BatchStatus, ProductLabel } from '../types/label';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  database: string;
  aiConfigured: boolean;
  activeAiModel: string;
  ocrEngine: string;
  regulatoryMetadata: any;
}

export interface AiTestResponse {
  configured: boolean;
  status: string;
  model?: string;
  latencyMs?: number;
  message?: string;
  echo?: string;
}

export const api = {
  // 1. Health & AI
  async getHealth(): Promise<HealthResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async testAiConnection(): Promise<AiTestResponse> {
    try {
      const res = await fetch(`${API_BASE}/ai/test`);
      return await res.json();
    } catch (err: any) {
      return {
        configured: false,
        status: 'network_error',
        message: err.message || 'Cannot reach backend server on port 5000.',
      };
    }
  },

  // 2. Production Batches
  async getBatches(): Promise<ProductionBatch[]> {
    let remoteBatches: ProductionBatch[] = [];
    try {
      const res = await fetch(`${API_BASE}/batches`);
      if (res.ok) {
        const json = await res.json();
        remoteBatches = json.batches || [];
      }
    } catch {
      // Remote fetch failed, fallback to local storage
    }

    // Merge with client-side localStorage batches if any
    try {
      const localBatches: ProductionBatch[] = JSON.parse(localStorage.getItem('labeliq_local_batches') || '[]');
      const remoteIds = new Set(remoteBatches.map(b => b.id));
      const merged = [...remoteBatches];
      for (const lb of localBatches) {
        if (!remoteIds.has(lb.id)) {
          merged.push(lb);
        }
      }
      return merged;
    } catch {
      return remoteBatches;
    }
  },

  async createBatch(batchData: Partial<ProductionBatch>): Promise<{ success: boolean; batchId?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, batchId: data.batchId };
      }
      // If server returned error (e.g. table missing in schema cache), log and engage client fallback
      console.warn('[API] Server createBatch error, using resilient client persistence:', data.error);
    } catch (err: any) {
      console.warn('[API] Server unreachable for createBatch, using resilient client persistence:', err.message);
    }

    // Resilient fallback: Save to client-side localStorage so user workflow is never blocked
    try {
      const localBatches: ProductionBatch[] = JSON.parse(localStorage.getItem('labeliq_local_batches') || '[]');
      const batchId = `batch-local-${Date.now()}`;
      const newBatch: ProductionBatch = {
        id: batchId,
        product_id: batchData.product_id || (batchData as any).productId || 'prod-demo-pickle',
        product_name: batchData.product_name || (batchData as any).productName || 'Artisan Food Product',
        brand_name: batchData.brand_name || (batchData as any).brandName || 'Heritage Brand',
        category: batchData.category || 'General Food',
        variant_name: batchData.variant_name || (batchData as any).variantName || 'Standard Pack',
        batch_number: batchData.batch_number || (batchData as any).batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
        mfg_date: batchData.mfg_date || (batchData as any).mfgDate || new Date().toISOString().slice(0, 10),
        expiry_date: batchData.expiry_date || (batchData as any).expiryDate || new Date(Date.now() + 365*24*3600*1000).toISOString().slice(0, 10),
        best_before_months: batchData.best_before_months ?? (batchData as any).bestBeforeMonths ?? 12,
        planned_units: batchData.planned_units ?? (batchData as any).plannedUnits ?? 250,
        packaged_units: 0,
        batch_size_quantity: batchData.batch_size_quantity ?? (batchData as any).batchSizeQuantity ?? 100,
        batch_size_unit: batchData.batch_size_unit || (batchData as any).batchSizeUnit || 'kg',
        status: (batchData.status as BatchStatus) || 'Planned',
        notes: batchData.notes || 'Scheduled commercial production run.',
        packaging_format: batchData.packaging_format || (batchData as any).packagingFormat || 'Glass Jar',
        created_at: new Date().toISOString()
      };
      localBatches.unshift(newBatch);
      localStorage.setItem('labeliq_local_batches', JSON.stringify(localBatches));
      return { success: true, batchId };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Storage error' };
    }
  },

  async updateBatch(batchId: string, partial: { status?: BatchStatus; packagedUnits?: number; notes?: string }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async duplicateBatch(batchId: string): Promise<{ success: boolean; newBatchId?: string; newBatchNumber?: string }> {
    try {
      const res = await fetch(`${API_BASE}/batches/${batchId}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      return { success: res.ok, newBatchId: data.newBatchId, newBatchNumber: data.newBatchNumber };
    } catch {
      return { success: false };
    }
  },

  // 3. Products
  async getProducts(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.products || [];
    } catch {
      return [];
    }
  },

  async getProduct(id: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.product || null;
    } catch {
      return null;
    }
  },

  async createProduct(productData: any): Promise<{ success: boolean; productId?: string }> {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const json = await res.json();
      return { success: res.ok, productId: json.productId };
    } catch {
      return { success: false };
    }
  },

  // 4. Recommendations & Reference-Label Comparison
  async getRecommendations(reqData: any): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });
      const json = await res.json();
      return json.recommendations || [];
    } catch {
      return [];
    }
  },

  async compareReference(currentLabel: ProductLabel, referenceLabel: any): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/reference-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLabel, referenceLabel }),
      });
      const json = await res.json();
      return json.comparison || null;
    } catch {
      return null;
    }
  },

  // 5. Database Seed & Backup
  async resetDemoDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/database/seed-demo`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async exportBackup(): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/database/backup`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
