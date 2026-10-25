import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Feather, 
  Utensils, 
  Layers, 
  ShieldAlert, 
  Check, 
  Plus, 
  X, 
  Compass, 
  Sun,
  Eye,
  Award
} from 'lucide-react';
import { TasteAndOriginPanel, TasteAndOriginTheme } from '../types/label';

interface TasteAndOriginEditorProps {
  value?: TasteAndOriginPanel;
  onChange: (panel: TasteAndOriginPanel) => void;
  category: string;
}

const THEME_OPTIONS: Array<{ id: TasteAndOriginTheme; label: string; desc: string }> = [
  { id: 'traditional-indian', label: 'Traditional Indian', desc: 'Warm turmeric, terracotta, rich heritage aesthetics' },
  { id: 'farmer-market', label: 'Natural Farmer-Market', desc: 'Earthy kraft tones, raw botanical accents' },
  { id: 'artisanal', label: 'Premium Artisanal', desc: 'Sophisticated typography, high-contrast dark forest' },
  { id: 'organic', label: 'Organic-Inspired', desc: 'Clean leaf greens, minimalist nature cues' },
  { id: 'minimal', label: 'Modern Minimal', desc: 'Crisp contemporary monochrome, airy margins' },
  { id: 'retail', label: 'Bright Retail', desc: 'Vibrant consumer shelf-appeal, bold callouts' },
  { id: 'export', label: 'Export-Oriented', desc: 'Sleek global gourmet luxury, refined bilingual layout' },
];

export const TasteAndOriginEditor: React.FC<TasteAndOriginEditorProps> = ({
  value,
  onChange,
  category
}) => {
  const isEnabled = value?.enabled || false;
  const currentTheme = value?.theme || 'traditional-indian';

  const [newNoteInput, setNewNoteInput] = useState<string>('');

  const handleToggle = (enabled: boolean) => {
    onChange({
      enabled,
      theme: value?.theme || 'traditional-indian',
      regionalOrigin: value?.regionalOrigin || 'Heritage Himalayan & Western Foothills',
      producerStory: value?.producerStory || 'Grown and prepared by independent farmer collectives committed to sustainable harvest and traditional processing methods.',
      tastingNotes: value?.tastingNotes || ['Authentic Flavor', 'Subtle Natural Sweetness', 'Warm Spice Finish'],
      aromaProfile: value?.aromaProfile || 'Deep natural aromatics with delicate earthy undertones',
      texture: value?.texture || 'Rich authentic mouthfeel',
      servingSuggestions: value?.servingSuggestions || 'Enjoy as a culinary accompaniment or pair with your favorite meal.',
      harvestSeason: value?.harvestSeason || 'Spring / Autumn Harvest',
      elevationMeters: value?.elevationMeters || 1800,
    });
  };

  const updateField = (field: keyof TasteAndOriginPanel, val: any) => {
    onChange({
      ...(value || { enabled: true, theme: 'traditional-indian' }),
      [field]: val,
    });
  };

  const addTastingNote = () => {
    if (!newNoteInput.trim()) return;
    const notes = [...(value?.tastingNotes || []), newNoteInput.trim()];
    updateField('tastingNotes', notes);
    setNewNoteInput('');
  };

  const removeTastingNote = (idx: number) => {
    const notes = (value?.tastingNotes || []).filter((_, i) => i !== idx);
    updateField('tastingNotes', notes);
  };

  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-sm p-6 space-y-6">
      {/* Title & Enable Switch */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-cream-200">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <Compass className="w-5 h-5 text-forest-800" />
            <span>Taste & Origin Presentation Panel</span>
          </h3>
          <p className="text-xs text-slate-500">
            Showcase your farm's terroir, tasting notes, and culinary story distinct from mandatory legal declarations.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-900"></div>
        </label>
      </div>

      {isEnabled ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Statutory Boundary Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Regulatory Integrity:</strong> The Taste & Origin panel is designed for sensory guidance and farm storytelling. It must <strong>never</strong> make unsubstantiated medical, health, or uncertified superiority claims.
            </p>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Presentation Aesthetics & Theme:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => updateField('theme', theme.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    currentTheme === theme.id
                      ? 'border-forest-900 bg-forest-900 text-white shadow-sm'
                      : 'border-cream-200 bg-cream-50/50 hover:bg-cream-100/70 text-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs">{theme.label}</div>
                  <div className={`text-[11px] mt-0.5 line-clamp-2 ${currentTheme === theme.id ? 'text-cream-200' : 'text-slate-500'}`}>
                    {theme.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Regional Origin */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-forest-800" />
                <span>Regional Origin / Terroir:</span>
              </label>
              <input
                type="text"
                value={value?.regionalOrigin || ''}
                onChange={(e) => updateField('regionalOrigin', e.target.value)}
                placeholder="e.g. Kinnaur Valley, Himachal Pradesh"
                className="w-full text-xs rounded-xl border border-cream-300 p-2.5 bg-white focus:ring-1 focus:ring-forest-800"
              />
            </div>

            {/* Harvest Season & Elevation */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Harvest Season:</span>
                </label>
                <input
                  type="text"
                  value={value?.harvestSeason || ''}
                  onChange={(e) => updateField('harvestSeason', e.target.value)}
                  placeholder="e.g. Spring 2024"
                  className="w-full text-xs rounded-xl border border-cream-300 p-2.5 bg-white focus:ring-1 focus:ring-forest-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Elevation (Meters):</label>
                <input
                  type="number"
                  value={value?.elevationMeters || ''}
                  onChange={(e) => updateField('elevationMeters', parseInt(e.target.value, 10) || null)}
                  placeholder="e.g. 2200"
                  className="w-full text-xs rounded-xl border border-cream-300 p-2.5 bg-white focus:ring-1 focus:ring-forest-800"
                />
              </div>
            </div>
          </div>

          {/* Producer Story */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-forest-800" />
              <span>Producer / Farm Collective Story:</span>
            </label>
            <textarea
              rows={2}
              value={value?.producerStory || ''}
              onChange={(e) => updateField('producerStory', e.target.value)}
              placeholder="Tell consumers about your farming collective, heritage recipe, or traditional processing craft..."
              className="w-full text-xs rounded-xl border border-cream-300 p-2.5 bg-white focus:ring-1 focus:ring-forest-800"
            />
          </div>

          {/* Tasting Notes Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-forest-800" />
              <span>Tasting & Flavor Notes:</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {(value?.tastingNotes || []).map((note, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-forest-50 text-forest-900 border border-forest-200"
                >
                  <span>{note}</span>
                  <button
                    type="button"
                    onClick={() => removeTastingNote(idx)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTastingNote();
                    }
                  }}
                  placeholder="Add note (e.g. Tangy, Floral)"
                  className="text-xs rounded-xl border border-cream-300 px-3 py-1 bg-white focus:ring-1 focus:ring-forest-800 w-44"
                />
                <button
                  type="button"
                  onClick={addTastingNote}
                  className="p-1 rounded-lg bg-forest-900 text-white hover:bg-forest-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Aroma, Texture, Serving Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Aroma Profile:</label>
              <input
                type="text"
                value={value?.aromaProfile || ''}
                onChange={(e) => updateField('aromaProfile', e.target.value)}
                placeholder="e.g. Zesty, mustard-spice"
                className="w-full text-xs rounded-xl border border-cream-300 p-2 bg-white focus:ring-1 focus:ring-forest-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Texture:</label>
              <input
                type="text"
                value={value?.texture || ''}
                onChange={(e) => updateField('texture', e.target.value)}
                placeholder="e.g. Crisp chunks in rich oil"
                className="w-full text-xs rounded-xl border border-cream-300 p-2 bg-white focus:ring-1 focus:ring-forest-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Utensils className="w-3 h-3 text-forest-800" />
                <span>Serving Pairings:</span>
              </label>
              <input
                type="text"
                value={value?.servingSuggestions || ''}
                onChange={(e) => updateField('servingSuggestions', e.target.value)}
                placeholder="e.g. Pair with warm parathas"
                className="w-full text-xs rounded-xl border border-cream-300 p-2 bg-white focus:ring-1 focus:ring-forest-800"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-cream-50/70 border border-dashed border-cream-300 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Taste & Origin panel is currently disabled. Toggle the switch above to configure artisan storytelling for your packaging.
          </p>
          <button
            type="button"
            onClick={() => handleToggle(true)}
            className="px-4 py-1.5 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors"
          >
            Enable Taste & Origin Panel
          </button>
        </div>
      )}
    </div>
  );
};
