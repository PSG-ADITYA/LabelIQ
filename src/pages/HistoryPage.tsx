import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
import { validateProductLabel } from '../utils/validationEngine';
import { 
  Clock, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  Eye, 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  Plus,
  FileText
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { 
    savedProducts, 
    currentLabel, 
    loadProduct, 
    duplicateProduct, 
    deleteProduct, 
    createNewBlankLabel,
    setActiveTab, 
    showToast 
  } = useLabel();

  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = savedProducts.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Backup export as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedProducts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LabelIQ_Products_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported product database as JSON.', 'success');
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          localStorage.setItem('labeliq_products', JSON.stringify(parsed));
          window.location.reload();
        } else {
          showToast('Invalid JSON backup file structure.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-forest-100 text-forest-900">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-forest-800 uppercase tracking-wider">Product Library</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Saved Products & Label History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access previous production batches, duplicate existing designs, or export JSON backup files for offline archival.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold text-xs border border-cream-300 transition-all"
            title="Download JSON backup"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold text-xs border border-cream-300 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={createNewBlankLabel}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-limeaccent-400" />
            New Label
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search saved products by name, brand, or category..."
          className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-cream-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prod) => {
          const summary = validateProductLabel(prod);
          const isSelected = currentLabel.id === prod.id;

          return (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                isSelected ? 'border-forest-800 ring-2 ring-forest-800/20' : 'border-cream-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                    {prod.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    v{prod.version || 1}.0
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {prod.productName || 'Untitled Label'}
                  </h3>
                  <p className="text-xs text-slate-500">{prod.brandName}</p>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-cream-100">
                  <div className="flex justify-between">
                    <span>Net Qty:</span>
                    <strong className="font-mono text-slate-800">{prod.netQuantity} {prod.netQuantityUnit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <strong className="font-mono text-slate-800">{prod.dimensions.width}×{prod.dimensions.height} {prod.dimensions.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>FSSAI License:</span>
                    <span className="font-mono text-slate-700">{prod.fssaiLicense || 'Unset'}</span>
                  </div>
                </div>

                {/* Statutory Status Badge */}
                <div className="pt-2">
                  {summary.errorsCount === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Statutory Checklist Cleared ({summary.passedCount})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {summary.errorsCount} Error(s) Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(prod.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => loadProduct(prod.id)}
                    className="px-3 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open
                  </button>
                  <button
                    onClick={() => duplicateProduct(prod.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-cream-100 transition-colors"
                    title="Duplicate Draft"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete draft "${prod.productName}"?`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-cream-200 space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No matching products found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
};
