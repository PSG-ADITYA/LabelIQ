import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ProductLabel, AppSettings, ProductionBatch, BatchStatus } from '../types/label';
import { DEMO_PICKLE_V1, DEMO_PICKLE_V2, BLANK_LABEL_TEMPLATE } from '../data/demoData';
import { api, AiTestResponse } from '../services/api';
import { getPublicTraceabilityUrl } from '../utils/batchUtils';

export type NavTab = 
  | 'home'
  | 'dashboard'
  | 'ai-draft'
  | 'create'
  | 'scanner'
  | 'editor'
  | 'batches'
  | 'recommendations'
  | 'validation'
  | 'comparison'
  | 'history'
  | 'settings'
  | 'verify';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface LabelContextType {
  currentLabel: ProductLabel;
  savedProducts: ProductLabel[];
  batches: ProductionBatch[];
  activeTab: NavTab;
  settings: AppSettings;
  comparisonTarget: ProductLabel | null;
  toasts: Toast[];
  aiConnectionStatus: AiTestResponse | null;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setActiveTab: (tab: NavTab) => void;
  updateCurrentLabel: (partial: Partial<ProductLabel>, recordHistory?: boolean) => void;
  saveCurrentProduct: () => void;
  loadProduct: (id: string) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  renameProduct: (id: string, newName: string) => void;
  setDraftStatus: (status: 'draft' | 'in_review' | 'print_ready') => void;
  setComparisonTarget: (target: ProductLabel | null) => void;
  resetToDemo: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  createNewBlankLabel: () => void;
  loadDemoPickle: () => void;
  createWizardStep: number;
  setCreateWizardStep: (step: number) => void;
  // Production Batches methods
  loadBatches: () => Promise<void>;
  createBatch: (batchData: Partial<ProductionBatch>) => Promise<string | null>;
  updateBatchStatus: (batchId: string, status: BatchStatus, packagedUnits?: number) => Promise<void>;
  duplicateBatch: (batchId: string) => Promise<void>;
  applyBatchToEditor: (batch: ProductionBatch) => void;
  checkAiConnection: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  preferredUnit: 'mm',
  defaultJurisdiction: 'fssai_2020',
  geminiApiKey: '',
  useLiveAi: false,
  darkMode: false,
  minimumFontSizePt: 8.0,
};

const LabelContext = createContext<LabelContextType | undefined>(undefined);

export const LabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved products with local storage persistence
  const [savedProducts, setSavedProducts] = useState<ProductLabel[]>(() => {
    try {
      const stored = localStorage.getItem('labeliq_products');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return [DEMO_PICKLE_V1, DEMO_PICKLE_V2];
  });

  // Current active label
  const [currentLabel, setCurrentLabel] = useState<ProductLabel>(() => {
    try {
      const stored = localStorage.getItem('labeliq_current_draft');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read current draft', e);
    }
    return DEMO_PICKLE_V1;
  });

  // Undo / Redo history stacks & dirty state
  const [undoStack, setUndoStack] = useState<ProductLabel[]>([]);
  const [redoStack, setRedoStack] = useState<ProductLabel[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Production Batches
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [aiConnectionStatus, setAiConnectionStatus] = useState<AiTestResponse | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const tabParam = search.get('tab') as NavTab;
      const validTabs: NavTab[] = ['home', 'dashboard', 'ai-draft', 'create', 'scanner', 'editor', 'batches', 'recommendations', 'validation', 'comparison', 'history', 'settings', 'verify'];
      if (tabParam && validTabs.includes(tabParam)) return tabParam;
      if (search.get('verify') || window.location.hash.startsWith('#verify')) return 'verify';
    }
    return 'home';
  });

  // App settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('labeliq_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not read settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Comparison target (v2 vs current)
  const [comparisonTarget, setComparisonTarget] = useState<ProductLabel | null>(DEMO_PICKLE_V2);

  // Active step in CreateLabel wizard (allows scanner and AI draft to navigate directly to Step 2)
  const [createWizardStep, setCreateWizardStep] = useState<number>(1);

  // Notifications toast list
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('labeliq_products', JSON.stringify(savedProducts));
    } catch (e) {
      console.warn('Failed to save products to localStorage', e);
    }
  }, [savedProducts]);

  useEffect(() => {
    try {
      localStorage.setItem('labeliq_current_draft', JSON.stringify(currentLabel));
    } catch (e) {
      console.warn('Failed to save current draft', e);
    }
  }, [currentLabel]);

  useEffect(() => {
    try {
      localStorage.setItem('labeliq_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  // Load batches from backend SQLite database
  const loadBatches = useCallback(async () => {
    const list = await api.getBatches();
    setBatches(list);
  }, []);

  // Check AI connection status
  const checkAiConnection = useCallback(async () => {
    const res = await api.testAiConnection();
    setAiConnectionStatus(res);
  }, []);

  // On mount: load batches & AI status and check URL query
  useEffect(() => {
    loadBatches();
    checkAiConnection();

    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const tabParam = search.get('tab') as NavTab;
      const validTabs: NavTab[] = ['home', 'dashboard', 'ai-draft', 'create', 'scanner', 'editor', 'batches', 'recommendations', 'validation', 'comparison', 'history', 'settings', 'verify'];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      } else if (search.get('verify') || window.location.hash.startsWith('#verify')) {
        setActiveTab('verify');
      }
    }
  }, [loadBatches, checkAiConnection]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Warn user on leaving page if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const updateCurrentLabel = (partial: Partial<ProductLabel>, recordHistory: boolean = true) => {
    if (recordHistory) {
      setUndoStack(prev => [...prev.slice(-30), currentLabel]);
      setRedoStack([]);
      setIsDirty(true);
    }
    setCurrentLabel(prev => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentLabel]);
    setCurrentLabel(previous);
    setIsDirty(true);
    showToast('Undo applied.', 'info');
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentLabel]);
    setCurrentLabel(next);
    setIsDirty(true);
    showToast('Redo applied.', 'info');
  };

  const setDraftStatus = (status: 'draft' | 'in_review' | 'print_ready') => {
    updateCurrentLabel({ draftStatus: status });
    showToast(`Draft status set to ${status === 'print_ready' ? 'Print-Ready' : status === 'in_review' ? 'In Review' : 'Draft'}.`, 'info');
  };

  const saveCurrentProduct = () => {
    const updated = {
      ...currentLabel,
      updatedAt: new Date().toISOString(),
    };
    setCurrentLabel(updated);
    setSavedProducts(prev => {
      const exists = prev.some(p => p.id === updated.id);
      if (exists) {
        return prev.map(p => (p.id === updated.id ? updated : p));
      } else {
        return [updated, ...prev];
      }
    });
    setIsDirty(false);
    showToast(`Draft "${updated.productName || 'Untitled Label'}" saved successfully!`, 'success');
  };

  const renameProduct = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSavedProducts(prev => prev.map(p => (p.id === id ? { ...p, productName: trimmed, updatedAt: new Date().toISOString() } : p)));
    if (currentLabel.id === id) {
      setCurrentLabel(prev => ({ ...prev, productName: trimmed, updatedAt: new Date().toISOString() }));
    }
    showToast(`Renamed product to "${trimmed}".`, 'success');
  };

  const loadProduct = (id: string) => {
    const target = savedProducts.find(p => p.id === id);
    if (target) {
      setCurrentLabel(target);
      setUndoStack([]);
      setRedoStack([]);
      setIsDirty(false);
      showToast(`Loaded "${target.productName}" into editor.`, 'info');
      setActiveTab('editor');
    }
  };

  const deleteProduct = (id: string) => {
    setSavedProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product draft deleted.', 'info');
    if (currentLabel.id === id) {
      setCurrentLabel(DEMO_PICKLE_V1);
      setIsDirty(false);
    }
  };

  const duplicateProduct = (id: string) => {
    const original = savedProducts.find(p => p.id === id);
    if (!original) return;
    const duplicated: ProductLabel = {
      ...original,
      id: `prod-${Date.now()}`,
      productName: `${original.productName} (Copy)`,
      version: 1,
      draftStatus: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemoSample: false,
    };
    setSavedProducts(prev => [duplicated, ...prev]);
    showToast(`Created duplicate of "${original.productName}".`, 'success');
  };

  const resetToDemo = async () => {
    setCurrentLabel(DEMO_PICKLE_V1);
    setComparisonTarget(DEMO_PICKLE_V2);
    setSavedProducts([DEMO_PICKLE_V1, DEMO_PICKLE_V2]);
    setUndoStack([]);
    setRedoStack([]);
    setIsDirty(false);
    await api.resetDemoDatabase();
    await loadBatches();
    showToast('Reset to authentic demo workspace with Sample Batches B108 & B109.', 'info');
  };

  const createNewBlankLabel = () => {
    setCurrentLabel(BLANK_LABEL_TEMPLATE);
    setActiveTab('create');
    showToast('Started brand-new empty label draft. No sample data preselected.', 'info');
  };

  const loadDemoPickle = () => {
    setCurrentLabel(DEMO_PICKLE_V1);
    showToast('Loaded demo pickle product data.', 'info');
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
    showToast('Settings updated.', 'success');
  };

  // Create Batch
  const createBatch = async (batchData: Partial<ProductionBatch>): Promise<string | null> => {
    try {
      const res = await api.createBatch(batchData);
      if (res.success && res.batchId) {
        await loadBatches();
        showToast(`Created production batch "${batchData.batch_number}"!`, 'success');
        return res.batchId;
      } else {
        // Fallback to local session batch if remote schema pending or offline
        const localId = `batch-local-${Date.now()}`;
        const newBatch: ProductionBatch = {
          id: localId,
          product_id: batchData.product_id || currentLabel.id || 'prod-demo-pickle',
          variant_id: batchData.variant_id || 'var-default',
          batch_number: batchData.batch_number || `BATCH-${Date.now().toString().slice(-4)}`,
          mfg_date: batchData.mfg_date || new Date().toISOString().slice(0, 10),
          expiry_date: batchData.expiry_date || new Date(Date.now() + 365*24*3600*1000).toISOString().slice(0, 10),
          best_before_months: batchData.best_before_months || 12,
          batch_size_quantity: batchData.batch_size_quantity || 100,
          batch_size_unit: batchData.batch_size_unit || 'kg',
          planned_units: batchData.planned_units || 250,
          packaged_units: 0,
          status: 'Planned',
          notes: batchData.notes || '',
          product_name: currentLabel.productName || 'Traditional Mango Pickle',
          brand_name: currentLabel.brandName || 'Pahadi Heritage Foods',
          category: currentLabel.category || 'General Food',
          variant_name: `${currentLabel.netQuantity}${currentLabel.netQuantityUnit} Standard`,
          net_quantity: currentLabel.netQuantity || 400,
          net_quantity_unit: currentLabel.netQuantityUnit || 'g',
          packaging_format: 'Glass Jar',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setBatches(prev => [newBatch, ...prev]);
        showToast(`Batch "${newBatch.batch_number}" saved to local session. (Remote cloud database uninitialized: run server/db/supabase-migration.sql to enable permanent cloud sync).`, 'warning');
        return localId;
      }
    } catch {
      const localId = `batch-local-${Date.now()}`;
      const newBatch: ProductionBatch = {
        id: localId,
        product_id: batchData.product_id || currentLabel.id || 'prod-demo-pickle',
        variant_id: batchData.variant_id || 'var-default',
        batch_number: batchData.batch_number || `BATCH-${Date.now().toString().slice(-4)}`,
        mfg_date: batchData.mfg_date || new Date().toISOString().slice(0, 10),
        expiry_date: batchData.expiry_date || new Date(Date.now() + 365*24*3600*1000).toISOString().slice(0, 10),
        best_before_months: batchData.best_before_months || 12,
        batch_size_quantity: batchData.batch_size_quantity || 100,
        batch_size_unit: batchData.batch_size_unit || 'kg',
        planned_units: batchData.planned_units || 250,
        packaged_units: 0,
        status: 'Planned',
        notes: batchData.notes || '',
        product_name: currentLabel.productName || 'Traditional Mango Pickle',
        brand_name: currentLabel.brandName || 'Pahadi Heritage Foods',
        category: currentLabel.category || 'General Food',
        variant_name: `${currentLabel.netQuantity}${currentLabel.netQuantityUnit} Standard`,
        net_quantity: currentLabel.netQuantity || 400,
        net_quantity_unit: currentLabel.netQuantityUnit || 'g',
        packaging_format: 'Glass Jar',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setBatches(prev => [newBatch, ...prev]);
      showToast(`Batch "${newBatch.batch_number}" saved to local session (offline).`, 'info');
      return localId;
    }
  };

  // Update Batch Status
  const updateBatchStatus = async (batchId: string, status: BatchStatus, packagedUnits?: number) => {
    const ok = await api.updateBatch(batchId, { status, packagedUnits });
    if (ok) {
      await loadBatches();
      showToast(`Batch status updated to ${status}.`, 'info');
    } else {
      showToast('Could not update batch status.', 'error');
    }
  };

  // Duplicate Batch
  const duplicateBatch = async (batchId: string) => {
    const res = await api.duplicateBatch(batchId);
    if (res.success) {
      await loadBatches();
      showToast(`Duplicated batch as "${res.newBatchNumber}"!`, 'success');
    } else {
      showToast('Could not duplicate batch.', 'error');
    }
  };

  // Apply Batch Parameters directly into Current Label for instant visual generation & export
  const applyBatchToEditor = (batch: ProductionBatch) => {
    setCurrentLabel(prev => ({
      ...prev,
      batchNumber: batch.batch_number,
      mfgDate: batch.mfg_date,
      expiryDate: batch.expiry_date,
      bestBeforeMonths: batch.best_before_months,
      netQuantity: batch.net_quantity || prev.netQuantity,
      netQuantityUnit: (batch.net_quantity_unit as any) || prev.netQuantityUnit,
      barcode: batch.barcode_ean13 || prev.barcode,
      qrCodeUrl: getPublicTraceabilityUrl(batch.batch_number),
    }));
    showToast(`Loaded Batch ${batch.batch_number} parameters into Visual Editor!`, 'success');
    setActiveTab('editor');
  };

  return (
    <LabelContext.Provider
      value={{
        currentLabel,
        savedProducts,
        batches,
        activeTab,
        settings,
        comparisonTarget,
        toasts,
        aiConnectionStatus,
        isDirty,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undo,
        redo,
        setActiveTab,
        updateCurrentLabel,
        saveCurrentProduct,
        loadProduct,
        deleteProduct,
        duplicateProduct,
        renameProduct,
        setDraftStatus,
        setComparisonTarget,
        resetToDemo,
        updateSettings,
        showToast,
        removeToast,
        createNewBlankLabel,
        loadDemoPickle,
        createWizardStep,
        setCreateWizardStep,
        loadBatches,
        createBatch,
        updateBatchStatus,
        duplicateBatch,
        applyBatchToEditor,
        checkAiConnection,
      }}
    >
      {children}
    </LabelContext.Provider>
  );
};

export const useLabel = (): LabelContextType => {
  const context = useContext(LabelContext);
  if (!context) {
    throw new Error('useLabel must be used within a LabelProvider');
  }
  return context;
};
