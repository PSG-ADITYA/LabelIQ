import { ProductionBatch, BatchStatus, ProductLabel } from '../types/label';

export const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` 
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
    try {
      const res = await fetch(`${API_BASE}/batches`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.batches || [];
    } catch {
      return [];
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
      if (!res.ok) throw new Error(data.error || 'Failed to create batch');
      return { success: true, batchId: data.batchId };
    } catch (err: any) {
      return { success: false, error: err.message };
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
