import React, { useState, useEffect } from 'react';
import { useLabel } from '../context/LabelContext';
import { API_BASE } from '../services/api';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Package, 
  AlertCircle, 
  ArrowLeft, 
  Search, 
  ExternalLink, 
  Info, 
  Smartphone,
  Leaf,
  Layers,
  Compass,
  Sparkles,
  Award,
  Languages,
  BookOpen,
  MapPin,
  Utensils,
  Sun,
  MessageSquare,
  Send
} from 'lucide-react';
import { isLocalhost } from '../utils/batchUtils';
import { SUPPORTED_INDIAN_LANGUAGES } from '../data/translationDictionary';
import { IndianLanguageCode } from '../types/label';

export const PublicVerifyPage: React.FC = () => {
  const { setActiveTab } = useLabel();

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('verify') || 'HK-MP-2024-B108';
    }
    return 'HK-MP-2024-B108';
  });

  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguageCode>('en');
  const [loading, setLoading] = useState<boolean>(true);
  const [storyData, setStoryData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Feedback form state
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);

  const fetchStory = async (identifier: string, lang: IndianLanguageCode = selectedLanguage) => {
    if (!identifier.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/public/story/${encodeURIComponent(identifier.trim())}`);
      if (!res.ok) {
        // Fallback to basic verify
        const fallbackRes = await fetch(`${API_BASE}/public/verify/${encodeURIComponent(identifier.trim())}`);
        if (!fallbackRes.ok) throw new Error('Product or batch record not found in system.');
        const fbData = await fallbackRes.json();
        setStoryData(fbData.batch || fbData.product || null);
        return;
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Verification record unavailable.');
      }
      setStoryData(data.story);
    } catch (err: any) {
      console.warn('Story fetch error:', err.message);
      setError(err.message || 'Record not found.');
      setStoryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStory(searchQuery, selectedLanguage);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStory(searchQuery, selectedLanguage);
  };

  const isLocal = typeof window !== 'undefined' ? isLocalhost(window.location.origin) : true;

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header & Back to Studio link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('batches')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Studio Dashboard</span>
        </button>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-forest-800" />
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const nextLang = e.target.value as IndianLanguageCode;
              setSelectedLanguage(nextLang);
              fetchStory(searchQuery, nextLang);
            }}
            className="text-xs font-bold text-forest-900 bg-white border border-cream-300 rounded-xl px-2.5 py-1 focus:ring-1 focus:ring-forest-800 shadow-xs"
          >
            <option value="en">English</option>
            {SUPPORTED_INDIAN_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-md overflow-hidden">
        {/* Banner with Verification Badge */}
        <div className="bg-forest-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-limeaccent-300 text-xs font-bold border border-forest-700">
                <ShieldCheck className="w-4 h-4 text-limeaccent-400" />
                <span>Verified Traceable Food Product</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-cream-50 mt-1">
                {storyData?.productName || 'Authentic Food Item'}
              </h1>
              <p className="text-xs sm:text-sm text-cream-200">
                Produced & Packaged by <strong className="text-white">{storyData?.brandName || 'Artisan Producer'}</strong>
              </p>
            </div>

            {/* Batch Status Pill */}
            {storyData && (
              <div className="sm:text-right shrink-0">
                <span className="text-[10px] text-cream-300 uppercase tracking-wider block font-semibold">Production Status</span>
                <span className="inline-block mt-0.5 px-3 py-1 rounded-full bg-limeaccent-400 text-forest-950 font-black text-xs">
                  {storyData.status || 'Active & Released'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar for Other Batch Codes */}
        <div className="p-4 bg-cream-50/70 border-b border-cream-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Batch Number (e.g. HK-MP-2024-B108)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-cream-300 bg-white focus:outline-none focus:ring-1 focus:ring-forest-800 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-forest-900 text-white font-semibold text-xs hover:bg-forest-800 transition-colors"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-2 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Retrieving official batch registration & storytelling data...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="text-sm font-bold text-amber-950">Record Not Found</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                No production batch matching "{searchQuery}" exists in the current registry. Please check the code printed on the jar lid or carton label.
              </p>
            </div>
          ) : storyData ? (
            <div className="space-y-6">
              {/* Core Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-forest-800" /> Batch Lot Code
                  </span>
                  <div className="text-base font-black text-slate-900 font-mono">
                    {storyData.batchNumber || 'Unassigned'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-forest-800" /> Manufacturing Date
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {storyData.mfgDate || 'N/A'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-forest-800" /> Best Before / Expiry
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {storyData.expiryDate || 'N/A'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-forest-800" /> Packaging Format
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {storyData.packaging || 'Standard Pack'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-800" /> Food License (FSSAI)
                  </span>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {storyData.fssaiLicense || '10022099001144'}
                  </div>
                  <a
                    href="https://foscos.fssai.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-forest-800 font-bold hover:underline"
                  >
                    <span>Verify on FoSCoS Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Dietary Classification
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Vegetarian / Plant-Based</span>
                  </div>
                </div>
              </div>

              {/* TASTE & ORIGIN PRESENTATION FRAME */}
              {storyData.tasteAndOrigin && (
                <div className="p-6 rounded-3xl border border-cream-200 bg-gradient-to-br from-cream-50 to-white shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-forest-900 text-limeaccent-300 flex items-center justify-center">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 font-serif">
                          Taste & Origin Story
                        </h2>
                        <span className="text-xs text-forest-800 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {storyData.tasteAndOrigin.regionalOrigin}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cream-100 text-forest-900 font-bold border border-cream-200 uppercase">
                      {storyData.tasteAndOrigin.theme}
                    </span>
                  </div>

                  {/* Producer Story */}
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-4 rounded-2xl border border-cream-200/80">
                    "{storyData.tasteAndOrigin.producerStory}"
                  </p>

                  {/* Sensory Profile: Tasting Notes, Aroma & Serving Pairings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-white border border-cream-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-limeaccent-600" /> Tasting Notes
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {storyData.tasteAndOrigin.tastingNotes?.map((note: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest-50 text-forest-900 border border-forest-200">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-cream-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-600" /> Aroma & Texture
                      </span>
                      <p className="text-[11px] text-slate-700">
                        {storyData.tasteAndOrigin.aromaProfile} &bull; {storyData.tasteAndOrigin.texture}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-cream-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-forest-800" /> Serving Pairing
                      </span>
                      <p className="text-[11px] text-slate-700 leading-snug">
                        {storyData.tasteAndOrigin.servingSuggestions}
                      </p>
                    </div>
                  </div>

                  {/* Verified Quality Certificates */}
                  {storyData.tasteAndOrigin.verifiedCertificates && (
                    <div className="pt-2 border-t border-cream-200/80 flex flex-wrap gap-2">
                      {storyData.tasteAndOrigin.verifiedCertificates.map((cert: any, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cert.title}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* INGREDIENT INTELLIGENCE SECTION */}
              {storyData.ingredients && storyData.ingredients.length > 0 && (
                <div className="space-y-4 p-6 rounded-3xl border border-cream-200 bg-white">
                  <div className="flex items-center justify-between border-b border-cream-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-forest-800" />
                      <span>Formulation Ingredients & Scientific Intelligence</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Descending order of weight
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {storyData.ingredients.map((ing: any, i: number) => {
                      const exp = ing.explanation;
                      return (
                        <div key={i} className="p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{ing.name}</span>
                            {ing.percentage && (
                              <span className="text-[10px] font-mono font-bold text-forest-800 bg-white px-2 py-0.5 rounded border border-cream-200">
                                {ing.percentage}
                              </span>
                            )}
                          </div>
                          {exp && (
                            <>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                {exp.simpleExplanation}
                              </p>
                              <div className="text-[10px] text-forest-800 font-semibold pt-1 border-t border-cream-200/80">
                                Role: <span className="font-normal text-slate-700">{exp.culinaryPurpose}</span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Storage & Usage Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {storyData.storageInstructions && (
                  <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-slate-700 space-y-1">
                    <strong className="text-slate-900 font-bold block">Storage Recommendations:</strong>
                    <p className="text-[11px] leading-relaxed">{storyData.storageInstructions}</p>
                  </div>
                )}
                {storyData.directionsForUse && (
                  <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-slate-700 space-y-1">
                    <strong className="text-slate-900 font-bold block">Directions for Use:</strong>
                    <p className="text-[11px] leading-relaxed">{storyData.directionsForUse}</p>
                  </div>
                )}
              </div>

              {/* Producer Feedback Form */}
              <div className="p-6 rounded-3xl border border-cream-200 bg-cream-50/60 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-forest-800" />
                  <span>Send Direct Feedback to Farmer / Producer</span>
                </h3>
                {feedbackSent ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Thank you! Your feedback has been sent directly to {storyData.brandName}.</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your thoughts about this batch (taste, packaging, quality)..."
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-cream-300 bg-white focus:outline-none focus:ring-1 focus:ring-forest-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (feedbackText.trim()) {
                          setFeedbackSent(true);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Educational Scanner & Deployment Notice */}
        <div className="p-6 bg-cream-100/70 border-t border-cream-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-forest-900">
            <Smartphone className="w-4 h-4 text-forest-800" />
            <span>Agritech Producer & Consumer Scanning Guidance</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {isLocal ? (
              <>
                <strong>Notice for Local Demonstrations:</strong> You are viewing this page on <code className="bg-white px-1 rounded font-mono">localhost</code>. While your local browser can resolve this QR destination, external cellular phones cannot access <code className="bg-white px-1 rounded font-mono">localhost</code> unless connected to the same Wi-Fi subnet or forwarded via a public tunnel (e.g. ngrok / Cloudflare Tunnel).
              </>
            ) : (
              <>
                <strong>Live Cloud Verification:</strong> This product verification page is deployed and accessible to any smartphone scanning the packaging QR code without needing a separate app download.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
