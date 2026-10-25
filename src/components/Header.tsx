import React from 'react';
import { useLabel, NavTab } from '../context/LabelContext';
import { BrandLogo } from './BrandLogo';
import { 
  FileText, 
  Scan, 
  Sparkles, 
  Layers, 
  GitCompare, 
  Clock, 
  Settings, 
  Plus, 
  CheckCircle2, 
  LayoutDashboard,
  Home,
  ShieldCheck,
  AlertCircle,
  Package
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, currentLabel, createNewBlankLabel, batches } = useLabel();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'home', label: 'Studio', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'ai-draft', label: 'Create with AI', icon: <Sparkles className="w-3.5 h-3.5 text-limeaccent-400" /> },
    { id: 'scanner', label: 'Scan Label', icon: <Scan className="w-3.5 h-3.5" /> },
    { id: 'create', label: 'Manual Form', icon: <Plus className="w-3.5 h-3.5" /> },
    { id: 'editor', label: 'Label Canvas', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'batches', label: 'Batches', icon: <Package className="w-3.5 h-3.5" />, badge: batches.length },
    { id: 'recommendations', label: 'Design AI', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'validation', label: 'FSSAI Audit', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'comparison', label: 'Recipe Diff', icon: <GitCompare className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Vault', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
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
            onClick={() => setActiveTab('home')}
            className="flex items-center cursor-pointer group py-1"
          >
            <BrandLogo size="sm" variant="dark" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={createNewBlankLabel}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-limeaccent-400 hover:bg-limeaccent-300 text-forest-950 font-bold text-xs transition-all shadow-xs active:scale-95"
              title="Create new blank product profile"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation for Large/Medium Screens */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-forest-800/80 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
    </header>
  );
};
