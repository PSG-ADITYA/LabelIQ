import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
import { ACTIVE_REGULATORY_FRAMEWORKS } from '../data/fssaiRules';
import { MeasurementUnit } from '../types/label';
import { api, AiTestResponse } from '../services/api';
import { 
  Settings, 
  Key, 
  Globe, 
  Scale, 
  ShieldCheck, 
  RotateCcw, 
  Save, 
  ExternalLink, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Database,
  Download,
  CheckCircle2,
  RefreshCw,
  Cpu
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDemo, showToast, aiConnectionStatus, checkAiConnection, loadBatches } = useLabel();

  // Diagnostics panel is only accessible when explicitly triggered by developer query param (?dev=1 or ?debug=1)
  const isDeveloperMode = typeof window !== 'undefined' && 
    (new URLSearchParams(window.location.search).get('dev') === '1' || new URLSearchParams(window.location.search).get('debug') === '1');

  const [aiTestResult, setAiTestResult] = useState<AiTestResponse | null>(null);
  const [isTestingAi, setIsTestingAi] = useState<boolean>(false);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isResettingDb, setIsResettingDb] = useState<boolean>(false);

  const handleRunAiDiagnostic = async () => {
    setIsTestingAi(true);
    showToast('Executing safe backend AI ping (no key logged)...', 'info');
    try {
      const res = await api.testAiConnection();
      setAiTestResult(res);
      await checkAiConnection();
      if (res.status === 'live_authenticated') {
        showToast(`Gemini AI connection verified (${res.model || 'gemini-3.5-flash-lite'})!`, 'success');
      } else {
        showToast(`AI status: ${res.status}. ${res.message || ''}`, 'warning');
      }
    } catch (err: any) {
      showToast('AI diagnostic failed.', 'error');
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    showToast('Exporting SQLite database snapshot...', 'info');
    try {
      const backup = await api.exportBackup();
      if (!backup) throw new Error('Backup failed');
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `labeliq_sqlite_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded SQLite backup snapshot!', 'success');
    } catch {
      showToast('Could not download database backup.', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database demo records to authentic default batches and recipes?')) return;
    setIsResettingDb(true);
    try {
      const ok = await api.resetDemoDatabase();
      if (ok) {
        await loadBatches();
        resetToDemo();
        showToast('SQLite database re-seeded with authentic pickle batches!', 'success');
      } else {
        showToast('Database reset failed.', 'error');
      }
    } catch {
      showToast('Error resetting database.', 'error');
    } finally {
      setIsResettingDb(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-slate-100 text-slate-800">
              <Settings className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Configuration &amp; Standards</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Platform Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure packaging dimensions, review FSSAI gazette rules, run AI diagnostics, and manage SQLite database backups.
          </p>
        </div>
      </div>

      {/* Measurement & Units Preference */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-forest-800" />
          Packaging Dimensions &amp; Units
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default Measurement Unit
            </label>
            <select
              value={settings.preferredUnit}
              onChange={(e) => updateSettings({ preferredUnit: e.target.value as MeasurementUnit })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white"
            >
              <option value="mm">Millimetres (mm) - Recommended for packaging</option>
              <option value="cm">Centimetres (cm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Statutory Minimum Font Size Threshold
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="6"
                max="12"
                value={settings.minimumFontSizePt}
                onChange={(e) => updateSettings({ minimumFontSizePt: parseFloat(e.target.value) || 8 })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cream-300 font-mono"
              />
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">pt (~1.0mm)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Jurisdiction & Rule Sourcing */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-forest-800" />
          Applicable Food Regulatory Standards
        </h3>

        <div className="space-y-4">
          {ACTIVE_REGULATORY_FRAMEWORKS.map((fw) => (
            <div
              key={fw.id}
              className={`p-4 rounded-xl border transition-all ${
                settings.defaultJurisdiction === fw.id
                  ? 'border-forest-900 bg-forest-50/40 ring-1 ring-forest-800'
                  : 'border-cream-200 bg-cream-50/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{fw.name}</span>
                    {fw.isFullyImplemented ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Engine Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        General Codex Guidance
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Authority: {fw.authority} &middot; Gazette Ref: {fw.officialGazetteRef}
                  </p>
                </div>

                <a
                  href={fw.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 hover:text-forest-950 shrink-0"
                >
                  Official Gazette <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="mt-3 text-[11px] text-slate-600 border-t border-cream-200/80 pt-2 flex flex-wrap gap-4">
                <span>Effective Date: <strong>{fw.effectiveDate}</strong></span>
                <span>Last Sourced: <strong>{fw.lastReviewedDate}</strong></span>
                <span>Scope: <strong>{fw.scope}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DEVELOPER-ONLY DIAGNOSTICS (Rendered ONLY when ?dev=1 or ?debug=1 is explicitly passed in URL) */}
      {isDeveloperMode && (
        <div className="bg-white rounded-2xl border-2 border-forest-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-forest-800" />
              <span>Developer AI Diagnostics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-limeaccent-300 font-bold">DEV MODE</span>
            </h3>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
              aiConnectionStatus?.configured 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {aiConnectionStatus?.configured ? `Live Ready (${aiConnectionStatus.model || 'gemini-3.5-flash-lite'})` : 'Local OCR Mode (Tesseract v7)'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Developer diagnostics tool for testing server-side Gemini connectivity. Never exposes credentials to browser bundles or public users.
          </p>

          <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs font-bold text-forest-950">Active AI Model</div>
                <div className="text-[11px] text-forest-800 font-mono">
                  {aiConnectionStatus?.model || 'gemini-3.5-flash-lite'}
                </div>
              </div>
              <button
                disabled={isTestingAi}
                onClick={handleRunAiDiagnostic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin' : ''}`} />
                Test Live AI Connection
              </button>
            </div>

            {aiTestResult && (
              <div className="mt-2 p-3 rounded-lg bg-white border border-forest-200 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${aiTestResult.status === 'live_authenticated' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="font-bold text-slate-900">
                    Status: {aiTestResult.status} {aiTestResult.latencyMs ? `(${aiTestResult.latencyMs}ms)` : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{aiTestResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SQLite Database & Audit Records Persistence */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-forest-800" />
            SQLite Database &amp; Traceability Records
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-forest-50 text-forest-800 border border-forest-200">
            better-sqlite3 &bull; WAL Mode
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Product formulations, recipe versions, production batches, and audit events are persisted in the normalized SQLite database (<code className="bg-cream-100 px-1 py-0.5 rounded font-mono text-[11px]">d:\LabelIQ\labeliq.db</code>).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            disabled={isBackingUp}
            onClick={handleDownloadBackup}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 text-slate-800 font-semibold text-xs border border-cream-300 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-forest-800" />
            Export SQLite Snapshot (.json)
          </button>

          <button
            disabled={isResettingDb}
            onClick={handleResetDatabase}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            Re-Seed Authentic Demo Batches
          </button>
        </div>
      </div>
    </div>
  );
};
