import React from 'react';
import { useLabel } from '../context/LabelContext';
import { ShieldAlert, Sparkles, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useLabel();

  return (
    <footer className="bg-forest-950 text-cream-200 border-t border-forest-800/80 mt-16 no-print">
      {/* Hackathon Theme Callout */}
      <div className="bg-forest-900/60 border-b border-forest-800/60 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-limeaccent-500/20 text-limeaccent-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-white">Hackathon Theme: Beyond the Screen — Build for a Smarter, More Inclusive Future</p>
              <p className="text-cream-300">Empowering cottage food producers, home kitchens, and packaging teams with accessible regulatory AI tools.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-cream-300">
            <HeartHandshake className="w-4 h-4 text-limeaccent-400" />
            <span>Inclusive Packaging Design & Multilingual Ready</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-forest-800 border border-limeaccent-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-limeaccent-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Label<span className="text-limeaccent-400">IQ</span></span>
            </div>
            <p className="text-xs text-cream-300 leading-relaxed">
              Intelligent Labels. Simpler Compliance. A full-stack AI-assisted food packaging design, OCR scanning, and regulatory validation suite.
            </p>
            <p className="text-[11px] text-cream-400">
              &copy; {new Date().getFullYear()} LabelIQ Platform. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Workflows</h4>
            <ul className="text-xs space-y-1.5 text-cream-300">
              <li><button onClick={() => setActiveTab('create')} className="hover:text-limeaccent-400">Guided Label Builder</button></li>
              <li><button onClick={() => setActiveTab('scanner')} className="hover:text-limeaccent-400">AI Document Scanner</button></li>
              <li><button onClick={() => setActiveTab('editor')} className="hover:text-limeaccent-400">Live Canvas Editor</button></li>
              <li><button onClick={() => setActiveTab('validation')} className="hover:text-limeaccent-400">FSSAI Validation Engine</button></li>
              <li><button onClick={() => setActiveTab('comparison')} className="hover:text-limeaccent-400">Recipe Diff & Shift Report</button></li>
            </ul>
          </div>

          {/* Regulatory Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Regulatory Standards</h4>
            <ul className="text-xs space-y-1.5 text-cream-300">
              <li>FSSAI Labelling & Display Regs, 2020</li>
              <li>Legal Metrology Packaged Commodities</li>
              <li>Codex Alimentarius CXS 1-1985</li>
              <li>Mandatory 14-Digit FBO Verification</li>
              <li>Veg / Non-Veg Standard Logo Specs</li>
            </ul>
          </div>

          {/* Statutory Disclaimer */}
          <div className="space-y-2 bg-forest-900/40 p-3.5 rounded-xl border border-forest-800">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Statutory Compliance Notice</span>
            </div>
            <p className="text-[11px] text-cream-300 leading-relaxed">
              LabelIQ provides automated advisory checks against published regulatory criteria. Software validation does not constitute legal certification or statutory approval from FSSAI or any government agency. Always conduct independent verification before mass print production.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
