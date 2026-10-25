import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
import { ProductionBatch, BatchStatus } from '../types/label';
import { 
  Package, 
  Plus, 
  Calendar, 
  Tag, 
  Copy, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Printer, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Boxes,
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';
import { formatBatchVariant, calculateExpiryDate } from '../utils/batchUtils';

export const BatchManagementPage: React.FC = () => {
  const { 
    batches, 
    currentLabel, 
    createBatch, 
    updateBatchStatus, 
    duplicateBatch, 
    applyBatchToEditor, 
    showToast,
    setActiveTab 
  } = useLabel();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showSheetModal, setShowSheetModal] = useState<ProductionBatch | null>(null);

  // Form State for New Batch
  const [batchForm, setBatchForm] = useState({
    batchNumber: `HK-BATCH-${new Date().getFullYear()}-B${Math.floor(100 + Math.random() * 900)}`,
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bestBeforeMonths: 12,
    batchSizeQuantity: 100,
    batchSizeUnit: 'kg',
    plannedUnits: 250,
    variantName: '400g Standard Jar',
    netQuantity: 400,
    netQuantityUnit: 'g',
    packagingFormat: 'Glass Jar',
    notes: 'Scheduled commercial production run.',
  });

  const filteredBatches = batches.filter(b => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  // Calculate Batch Sheet Print Output
  const calculateSheetPlan = (batch: ProductionBatch) => {
    // Standard A4 sheet can hold approximately 4 labels of 120x75mm with 3mm bleed
    const labelsPerSheet = 4;
    const totalSheets = Math.ceil(batch.planned_units / labelsPerSheet);
    return {
      labelsPerSheet,
      totalSheets,
      continuousRollMeters: (batch.planned_units * 0.08).toFixed(1), // approx 80mm pitch
    };
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.batchNumber || !batchForm.mfgDate || !batchForm.expiryDate) {
      showToast('Please complete all required batch identifiers and dates.', 'warning');
      return;
    }

    const res = await createBatch({
      product_id: currentLabel.id || 'prod-demo-pickle',
      batch_number: batchForm.batchNumber,
      mfg_date: batchForm.mfgDate,
      expiry_date: batchForm.expiryDate,
      best_before_months: batchForm.bestBeforeMonths,
      batch_size_quantity: batchForm.batchSizeQuantity,
      batch_size_unit: batchForm.batchSizeUnit,
      planned_units: batchForm.plannedUnits,
      variant_name: batchForm.variantName,
      net_quantity: batchForm.netQuantity,
      net_quantity_unit: batchForm.netQuantityUnit,
      packaging_format: batchForm.packagingFormat,
      notes: batchForm.notes,
    });

    if (res) {
      setShowCreateModal(false);
      // Reset form with new sequence
      setBatchForm(prev => ({
        ...prev,
        batchNumber: `HK-BATCH-${new Date().getFullYear()}-B${Math.floor(100 + Math.random() * 900)}`,
      }));
    }
  };

  const getStatusBadge = (status: BatchStatus) => {
    switch (status) {
      case 'Planned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">Planned</span>;
      case 'In Production':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">In Production</span>;
      case 'Packaged':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Packaged</span>;
      case 'Released':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">Released</span>;
      case 'Archived':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">Archived</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header in Editorial SelfSync Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cream-200 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-800">
            <span className="w-2 h-2 rounded-full bg-limeaccent-500 animate-pulse" />
            <span>Traceability & Batch Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Production Batches
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Manage multi-quantity production runs (e.g. 100 jars, 500 jars, 1kg tubs). Reuse approved formulation profiles while injecting batch-specific dates, numbers, and barcodes into packaging labels.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-limeaccent-400" />
          Schedule New Batch
        </button>
      </div>

      {/* Production Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Scheduled Runs</span>
          <div className="text-2xl font-black text-slate-900">{batches.length}</div>
          <span className="text-[11px] text-slate-500">Persisted in SQLite database</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active in Production</span>
          <div className="text-2xl font-black text-amber-700">
            {batches.filter(b => b.status === 'In Production' || b.status === 'Planned').length}
          </div>
          <span className="text-[11px] text-slate-500">Awaiting packaging or release</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Units Planned</span>
          <div className="text-2xl font-black text-forest-900">
            {batches.reduce((sum, b) => sum + (b.planned_units || 0), 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Across 200g, 400g & 1kg variants</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active Recipe Baseline</span>
          <div className="text-sm font-bold text-slate-900 truncate">
            {currentLabel.productName || 'Dadi\'s Mango Pickle'}
          </div>
          <span className="text-[11px] font-mono text-forest-800 font-semibold">v{currentLabel.version}.0 Approved</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'Planned', 'In Production', 'Packaged', 'Released', 'Archived'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-forest-900 text-white shadow-xs'
                : 'bg-cream-100 text-slate-600 hover:bg-cream-200'
            }`}
          >
            {status === 'all' ? 'All Batches' : status}
          </button>
        ))}
      </div>

      {/* Batches Table / Card List */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        {filteredBatches.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Boxes className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No production batches found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Schedule your first batch to generate production labels with real batch codes, dates, and quantity variants.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Create First Batch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream-50 border-b border-cream-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product & Variant</th>
                  <th className="py-3 px-4">Planned Run</th>
                  <th className="py-3 px-4">Mfg / Exp Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredBatches.map((batch) => {
                  const sheetInfo = calculateSheetPlan(batch);

                  return (
                    <tr key={batch.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-forest-800" />
                          <span>{batch.batch_number}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ID: {batch.id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{batch.product_name || currentLabel.productName}</div>
                        <span className="text-[11px] text-forest-800 font-medium">
                          {formatBatchVariant(batch)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {batch.planned_units} units
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {batch.batch_size_quantity} {batch.batch_size_unit} batch mass
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div><span className="text-slate-400 text-[10px]">Mfg:</span> {batch.mfg_date}</div>
                          <div><span className="text-slate-400 text-[10px]">Exp:</span> {batch.expiry_date}</div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(batch.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* 1-Click Load into Label Editor */}
                          <button
                            onClick={() => applyBatchToEditor(batch)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-xs"
                            title="Load batch parameters into Visual Editor"
                          >
                            <FileText className="w-3.5 h-3.5 text-limeaccent-400" />
                            Generate Labels
                          </button>

                          {/* Print Sheet Planning Modal */}
                          <button
                            onClick={() => setShowSheetModal(batch)}
                            className="p-1.5 text-slate-600 hover:text-forest-900 hover:bg-cream-100 rounded-lg"
                            title="Inspect label sheet & roll export planning"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Duplicate Batch for Next Run */}
                          <button
                            onClick={() => duplicateBatch(batch.id)}
                            className="p-1.5 text-slate-600 hover:text-forest-900 hover:bg-cream-100 rounded-lg"
                            title="Duplicate for recurring run"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Status cycle switcher */}
                          <select
                            value={batch.status}
                            onChange={(e) => updateBatchStatus(batch.id, e.target.value as BatchStatus)}
                            className="text-[11px] py-1 px-1.5 rounded border border-cream-300 bg-white"
                          >
                            <option value="Planned">Planned</option>
                            <option value="In Production">In Production</option>
                            <option value="Packaged">Packaged</option>
                            <option value="Released">Released</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW BATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-cream-200 overflow-hidden">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between bg-cream-50/50">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">New Production Run</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Schedule Batch & Packaging Details</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-cream-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch / Lot Identifier *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.batchNumber}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-800"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Unique lot number printed on pack</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Packaging Variant *</label>
                  <select
                    value={batchForm.variantName}
                    onChange={(e) => {
                      const val = e.target.value;
                      let net = 400;
                      let u: any = 'g';
                      if (val.includes('200g')) net = 200;
                      if (val.includes('1kg')) { net = 1000; u = 'g'; }
                      setBatchForm(prev => ({ ...prev, variantName: val, netQuantity: net, netQuantityUnit: u }));
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300"
                  >
                    <option value="200g Tasting Jar">200g Tasting Jar (Hexagonal Glass)</option>
                    <option value="400g Standard Jar">400g Standard Jar (Round Glass)</option>
                    <option value="1kg Family Tub">1kg Family Tub (Food-Grade PET)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturing Date *</label>
                  <input
                    type="date"
                    required
                    value={batchForm.mfgDate}
                    onChange={(e) => {
                      const newMfg = e.target.value;
                      const autoExp = calculateExpiryDate(newMfg, batchForm.bestBeforeMonths);
                      setBatchForm(prev => ({ 
                        ...prev, 
                        mfgDate: newMfg,
                        expiryDate: autoExp || prev.expiryDate 
                      }));
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry / Best-Before Date *</label>
                  <input
                    type="date"
                    required
                    value={batchForm.expiryDate}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Packaging Units *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={batchForm.plannedUnits}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, plannedUnits: parseInt(e.target.value) || 0 }))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-cream-300"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">e.g. 100 jars, 500 jars</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Batch Mass / Volume</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={batchForm.batchSizeQuantity}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, batchSizeQuantity: parseFloat(e.target.value) || 0 }))}
                      className="w-2/3 text-xs font-mono px-3 py-2 rounded-xl border border-cream-300"
                    />
                    <select
                      value={batchForm.batchSizeUnit}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, batchSizeUnit: e.target.value }))}
                      className="w-1/3 text-xs px-2 py-2 rounded-xl border border-cream-300"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">liters</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Traceability & QA Notes</label>
                <textarea
                  rows={2}
                  value={batchForm.notes}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300"
                  placeholder="Notes on raw material lot, ambient humidity, operator sign-off..."
                />
              </div>

              <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-md"
                >
                  Save & Schedule Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-LABEL SHEET EXPORT PLANNING MODAL */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-cream-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800">Production Print Planning</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Multi-Label Sheet Calculation
                </h3>
              </div>
              <button
                onClick={() => setShowSheetModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Code:</span>
                <span className="font-mono font-bold text-slate-900">{showSheetModal.batch_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Planned Quantity:</span>
                <span className="font-bold text-slate-900">{showSheetModal.planned_units} packaged labels</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Labels Per A4 Sheet:</span>
                <span className="font-bold text-slate-900">{calculateSheetPlan(showSheetModal).labelsPerSheet} labels</span>
              </div>
              <div className="flex justify-between border-t border-cream-200 pt-2 text-forest-900 font-bold">
                <span>Total A4 Pages Required:</span>
                <span className="text-sm font-mono">{calculateSheetPlan(showSheetModal).totalSheets} pages</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1">
                <span>Roll Continuous Pitch:</span>
                <span className="font-mono">{calculateSheetPlan(showSheetModal).continuousRollMeters} meters continuous</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-snug">
              ℹ️ Exporting from LabelIQ generates exact high-resolution vector PDF proofs. Exporting does not directly communicate with physical packaging or printing machinery.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSheetModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-cream-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  applyBatchToEditor(showSheetModal);
                  setShowSheetModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs"
              >
                Open in Visual Editor &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
