import React, { useState, useRef, useEffect } from 'react';
import { useLabel, NavTab } from '../context/LabelContext';
import { BrandLogo } from './BrandLogo';
import { 
  FileText, 
  Scan, 
  Sparkles, 
  Layers, 
  Clock, 
  Settings, 
  Plus, 
  Home, 
  AlertCircle,
  Package,
  ChevronDown,
  QrCode,
  Sliders
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, currentLabel, createNewBlankLabel, loadDemoPickle, batches, isDirty } = useLabel();
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: NavTab) => {
    if (tabId === activeTab) return;
    if (isDirty && (activeTab === 'create' || activeTab === 'editor' || activeTab === 'scanner' || activeTab === 'ai-draft')) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes in your active packaging draft. Switching sections may discard your current progress. Are you sure you want to proceed?'
      );
      if (!confirmSwitch) return;
    }
    setActiveTab(tabId);
  };

  const handleCreateProductClick = () => {
    if (currentLabel.productName && currentLabel.productName !== 'Extracted Food Product' && !currentLabel.isDemoSample) {
      if (window.confirm('You have an active product draft with changes. Creating a new product will discard your unsaved edits. Are you sure you want to start a new blank product?')) {
        createNewBlankLabel();
      }
    } else {
      createNewBlankLabel();
    }
  };

  const primaryNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'home', label: 'Studio', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'scanner', label: 'Scan Label', icon: <Scan className="w-3.5 h-3.5" /> },
    { id: 'ai-draft', label: 'Create with AI', icon: <Sparkles className="w-3.5 h-3.5 text-limeaccent-400" /> },
    { id: 'create', label: 'Manual Form', icon: <Plus className="w-3.5 h-3.5" /> },
    { id: 'editor', label: 'Label Canvas', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'batches', label: 'Batches', icon: <Package className="w-3.5 h-3.5" />, badge: batches.length },
  ];

  const moreToolsItems: { id: NavTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'recommendations', label: 'Theme Gallery', desc: 'Browse all 12 packaging templates', icon: <Layers className="w-4 h-4 text-limeaccent-400" /> },
    { id: 'verify', label: 'QR Verify Portal', desc: 'Simulate smartphone consumer scan', icon: <QrCode className="w-4 h-4 text-emerald-400" /> },
    { id: 'history', label: 'Audit Vault', desc: 'Saved recipe and label history', icon: <Clock className="w-4 h-4 text-amber-400" /> },
    { id: 'settings', label: 'Settings & Storage', desc: 'Database sync and preferences', icon: <Settings className="w-4 h-4 text-slate-300" /> },
  ];

  return (
    <header className="bg-forest-950 text-cream-50 sticky top-0 z-50 shadow-lg border-b border-forest-800/80 no-print">
      {/* Demo Data Notice - only rendered when fictional demo data is loaded */}
      {currentLabel.isDemoSample && (
        <div className="bg-amber-950/90 text-amber-200 px-4 py-1.5 text-xs flex items-center justify-between border-b border-amber-800/40">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Fictional sample data loaded for preview. Not saved as a real product draft.</span>
          </div>
          <button 
            onClick={createNewBlankLabel}
            className="text-xs text-amber-300 underline hover:text-amber-100 font-semibold cursor-pointer"
          >
            Clear Sample Data
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo & Wordmark */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center cursor-pointer group py-1"
          >
            <BrandLogo size="sm" variant="dark" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-limeaccent-400 text-forest-950 font-bold shadow-xs'
                      : 'text-cream-200 hover:text-white hover:bg-forest-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-forest-950 text-limeaccent-400' : 'bg-forest-800 text-cream-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* More Tools Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreToolsOpen(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  moreToolsItems.some(i => i.id === activeTab)
                    ? 'bg-forest-800 text-limeaccent-300 font-bold'
                    : 'text-cream-200 hover:text-white hover:bg-forest-900'
                }`}
              >
                <span>More Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${moreToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreToolsOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-forest-950 border border-forest-800 shadow-2xl py-2 z-50 animate-fadeIn text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-forest-800/80 mb-1">
                    Advanced Utilities
                  </div>
                  {moreToolsItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleNavClick(item.id);
                        setMoreToolsOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-forest-900 transition-colors ${
                        activeTab === item.id ? 'bg-forest-900/80 text-limeaccent-300 font-bold' : 'text-cream-100'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div>
                        <div className="font-semibold text-xs text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Primary Action Button & Quick Demo Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadDemoPickle();
                setActiveTab('editor');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-limeaccent-300 font-semibold text-xs border border-forest-700 transition-all cursor-pointer"
              title="Instant Demo: Load authentic sample pickle jar"
            >
              <Sparkles className="w-3.5 h-3.5 text-limeaccent-400" />
              <span className="hidden sm:inline">Demo Mode</span>
            </button>

            <button
              onClick={handleCreateProductClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-limeaccent-400 hover:bg-limeaccent-300 text-forest-950 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Create new blank product profile"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation for Tablet/Medium Screens */}
        <div className="hidden sm:flex lg:hidden items-center gap-1 overflow-x-auto py-2 border-t border-forest-800/80 no-scrollbar">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-limeaccent-400 text-forest-950 font-bold shadow-xs'
                    : 'text-cream-200 hover:bg-forest-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[9px] font-mono px-1 rounded-full ${
                    isActive ? 'bg-forest-950 text-limeaccent-400' : 'bg-forest-800 text-cream-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on small mobile viewports < sm) */}
      <nav 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-forest-950/95 backdrop-blur-md border-t border-forest-800/90 px-2 py-1 flex items-center justify-around shadow-2xl safe-area-bottom no-print"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all min-w-[50px] min-h-[44px] ${
            activeTab === 'home' ? 'text-limeaccent-400 font-extrabold' : 'text-cream-300 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => handleNavClick('ai-draft')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all min-w-[50px] min-h-[44px] ${
            activeTab === 'ai-draft' ? 'text-limeaccent-400 font-extrabold' : 'text-cream-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-limeaccent-400" />
          <span>AI Draft</span>
        </button>

        <button
          onClick={() => handleNavClick('scanner')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all min-w-[50px] min-h-[44px] ${
            activeTab === 'scanner' ? 'text-limeaccent-400 font-extrabold' : 'text-cream-300 hover:text-white'
          }`}
        >
          <Scan className="w-4 h-4 mb-0.5" />
          <span>Scanner</span>
        </button>

        <button
          onClick={() => handleNavClick('editor')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all min-w-[50px] min-h-[44px] ${
            activeTab === 'editor' ? 'text-limeaccent-400 font-extrabold' : 'text-cream-300 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => handleNavClick('batches')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-bold transition-all min-w-[50px] min-h-[44px] relative ${
            activeTab === 'batches' ? 'text-limeaccent-400 font-extrabold' : 'text-cream-300 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4 mb-0.5" />
          <span>Batches</span>
          {batches.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-limeaccent-400" />
          )}
        </button>
      </nav>
    </header>
  );
};
