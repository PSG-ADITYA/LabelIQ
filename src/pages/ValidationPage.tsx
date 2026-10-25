import React, { useState } from 'react';
import { useLabel } from '../context/LabelContext';
import { validateProductLabel } from '../utils/validationEngine';
import { ValidationSeverity, ValidationCategory } from '../types/label';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Sliders, 
  Download, 
  Printer, 
  Eye, 
  ArrowRight, 
  BookOpen,
  Scale
} from 'lucide-react';

export const ValidationPage: React.FC = () => {
  const { currentLabel, setActiveTab } = useLabel();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const summary = validateProductLabel(currentLabel);

  const filterTabs: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Issues', count: summary.issues.length },
    { id: 'Missing Information', label: 'Missing Info', count: summary.issues.filter(i => i.category === 'Missing Information').length },
    { id: 'Needs Correction', label: 'Needs Correction', count: summary.issues.filter(i => i.category === 'Needs Correction').length },
    { id: 'Needs Human Verification', label: 'Human Review', count: summary.issues.filter(i => i.category === 'Needs Human Verification').length },
    { id: 'Layout Issues', label: 'Layout Issues', count: summary.issues.filter(i => i.category === 'Layout Issues').length },
    { id: 'Passed Checks', label: 'Passed Checks', count: summary.passedChecks.length },
  ];

  const displayedIssues = selectedFilter === 'Passed Checks'
    ? summary.passedChecks
    : selectedFilter === 'all'
    ? summary.issues
    : summary.issues.filter(i => i.category === selectedFilter);

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-900">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-forest-800 uppercase tracking-wider">Regulatory Compliance Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Label Validation Report</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic algorithmic checks against FSSAI Labelling Regulations (2020) and Legal Metrology standards for &quot;{currentLabel.productName || 'Untitled Label'}&quot;.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold text-xs border border-cream-300 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Audit Report
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-limeaccent-400" />
            Return to Editor
          </button>
        </div>
      </div>

      {/* Audit Status Overview Banner */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        summary.errorsCount === 0
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-rose-50/80 border-rose-200 text-rose-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {summary.errorsCount === 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Statutory Checklist Cleared
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {summary.errorsCount} Blocking Issue(s) Detected
                </span>
              )}
              <span className="text-xs text-slate-600 font-medium">
                {summary.passedCount} of {summary.totalChecks} checks satisfied
              </span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {summary.complianceRatingNotice}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="text-center px-3 py-1.5 bg-white/80 rounded-xl border border-cream-300">
              <span className="text-rose-700 font-bold text-lg block">{summary.errorsCount}</span>
              <span className="text-slate-500 text-[10px] uppercase font-sans">Errors</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white/80 rounded-xl border border-cream-300">
              <span className="text-amber-700 font-bold text-lg block">{summary.warningsCount}</span>
              <span className="text-slate-500 text-[10px] uppercase font-sans">Warnings</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-white/80 rounded-xl border border-cream-300">
              <span className="text-emerald-700 font-bold text-lg block">{summary.passedCount}</span>
              <span className="text-slate-500 text-[10px] uppercase font-sans">Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-cream-200 no-print">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedFilter === tab.id
                ? 'bg-forest-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-forest-900 hover:bg-cream-100'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedFilter === tab.id ? 'bg-forest-800 text-limeaccent-300' : 'bg-cream-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {displayedIssues.length > 0 ? (
          displayedIssues.map((issue) => {
            const isPassed = issue.severity === 'passed';
            const isError = issue.severity === 'error';
            const isWarning = issue.severity === 'warning';
            const isLayout = issue.severity === 'layout';

            const borderColors = isPassed
              ? 'border-emerald-200 bg-white'
              : isError
              ? 'border-rose-300 bg-rose-50/20'
              : isLayout
              ? 'border-purple-200 bg-purple-50/20'
              : 'border-amber-200 bg-amber-50/20';

            const badgeBg = isPassed
              ? 'bg-emerald-100 text-emerald-800'
              : isError
              ? 'bg-rose-100 text-rose-800'
              : isLayout
              ? 'bg-purple-100 text-purple-800'
              : 'bg-amber-100 text-amber-800';

            return (
              <div 
                key={issue.id} 
                className={`p-5 rounded-2xl border shadow-sm transition-all space-y-3 ${borderColors}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeBg}`}>
                      {issue.category}
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-medium">
                      [{issue.ruleCode}]
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {issue.title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-slate-500 italic">
                    Source: <strong className="text-slate-700 not-italic">{issue.source}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {issue.message}
                </p>

                {/* What was detected & Why it matters block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-cream-50/80 p-3 rounded-xl border border-cream-200">
                  <div>
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                      Regulatory Context (Why it matters):
                    </span>
                    <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                      {issue.whyItMatters}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-forest-900 block text-[11px] uppercase tracking-wider">
                      Required Action:
                    </span>
                    <p className="text-slate-700 mt-0.5 text-[11px] leading-relaxed font-medium">
                      {issue.actionableStep}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">Trigger: {issue.triggerField}</span>
                      {!isPassed && (
                        <button
                          onClick={() => setActiveTab('create')}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 hover:text-forest-950 underline underline-offset-2"
                        >
                          Edit in Form <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-cream-200 p-8 text-center text-xs text-slate-500">
            No items found under the selected &quot;{selectedFilter}&quot; filter.
          </div>
        )}
      </div>

      {/* Anti-Hallucination & Legal Non-Certification Disclaimer */}
      <div className="rounded-2xl bg-cream-100/80 border border-cream-300 p-5 space-y-2 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-bold text-forest-950">
          <Scale className="w-4 h-4 text-forest-800 shrink-0" />
          <span>Statutory Compliance & Legal Disclaimer</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          LabelIQ evaluates packaging parameters against programmed deterministic rules of the <em>Food Safety and Standards (Labelling and Display) Regulations, 2020</em>. A passing result indicates that algorithmic validation criteria were satisfied for the entered data. Software checks do not constitute legal advice, statutory inspection, or official certification by FSSAI or any food authority. Commercial food business operators remain responsible for laboratory shelf-life tests, accurate analytical values, and physical container safety.
        </p>
      </div>
    </div>
  );
};
