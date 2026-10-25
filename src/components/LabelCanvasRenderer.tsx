import React, { useEffect, useRef } from 'react';
import { ProductLabel } from '../types/label';
import { getTemplateById } from '../data/labelTemplates';
import { BarcodeSvg, QrCodeSvg } from '../utils/barcodeGenerator';
import { getValidQrUrl } from '../utils/batchUtils';

export interface LabelCanvasRendererProps {
  label: ProductLabel;
  scale?: number; // Pixels per millimeter (default 3.6 for high DPI)
  showBleedGuide?: boolean;
  showSafeMarginGuide?: boolean;
  viewPanel?: 'both' | 'front-only' | 'info-only' | 'taste-origin';
  isExportMode?: boolean;
  className?: string;
  onOverflowDetected?: (isOverflowing: boolean, details: string) => void;
}

export const LabelCanvasRenderer: React.FC<LabelCanvasRendererProps> = ({
  label,
  scale = 3.6,
  showBleedGuide = false,
  showSafeMarginGuide = false,
  viewPanel = 'both',
  isExportMode = false,
  className = '',
  onOverflowDetected
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dims = label.dimensions;

  // 1. Calculate physical millimeters
  let widthMm = dims.width || 120;
  let heightMm = dims.height || 75;
  if (dims.unit === 'cm') { widthMm *= 10; heightMm *= 10; }
  if (dims.unit === 'in') { widthMm *= 25.4; heightMm *= 25.4; }

  // Adjust width if user selected single-panel inspection view
  const isWrap = dims.layoutStyle === 'two-panel';
  const effectiveWidthMm = (isWrap && viewPanel !== 'both') ? Math.round(widthMm / 2) : widthMm;
  const pixelWidth = Math.round(effectiveWidthMm * scale);
  const pixelHeight = Math.round(heightMm * scale);

  // 2. Resolve Template & Aesthetics
  const template = getTemplateById(dims.labelTheme);
  const effectiveBg = dims.customBgColor || template.palette.background;
  const effectiveText = dims.customTextColor || template.palette.text;
  const effectivePrimary = dims.customPrimaryColor || template.palette.primaryAccent;
  const effectiveSecondary = dims.customAccentColor || template.palette.secondaryAccent;
  const effectiveBorder = template.palette.border;
  const effectiveBadgeBg = template.palette.badgeBg;
  const effectiveBadgeText = template.palette.badgeText;
  const effectiveFontFamily = dims.fontFamily || template.fontFamily;

  const fontClass = 
    effectiveFontFamily === 'serif' ? 'font-serif' :
    effectiveFontFamily === 'slab' ? 'font-serif tracking-tight font-black' :
    effectiveFontFamily === 'mono' ? 'font-mono' : 'font-sans';

  // 3. Overflow Detection: Accurate scrollHeight vs clientHeight inspection
  useEffect(() => {
    if (!onOverflowDetected || !containerRef.current) return;
    const node = containerRef.current;
    const excessH = node.scrollHeight - node.clientHeight;
    const excessW = node.scrollWidth - node.clientWidth;
    const isOverflowing = excessH > 4 || excessW > 4;
    
    if (isOverflowing) {
      onOverflowDetected(
        true,
        `Label content length (${node.scrollHeight}px) exceeds printable area (${node.clientHeight}px) by ${Math.max(excessH, excessW)}px at ${dims.width}×${dims.height}${dims.unit}. Please reduce font scale or widen packaging dimensions.`
      );
    } else {
      onOverflowDetected(false, '');
    }
  }, [label, scale, viewPanel, onOverflowDetected, pixelWidth, pixelHeight]);

  // Scaled Margins and Element Boundaries
  const safeMarginPx = Math.max(3, Math.round((dims.safeMargin || 3) * scale));
  const bleedPx = Math.max(2, Math.round((dims.bleed || 2) * scale));
  const baseFontSizePx = Math.max(7.5, (dims.fontSizeScale || 1.0) * (heightMm < 60 ? 9 : 10.5));

  // Dynamic code sizing proportional to label height so bottom content is never clipped
  const qrSizePx = Math.max(20, Math.min(Math.round(8.5 * scale), Math.round(pixelHeight * 0.22)));
  const barcodeHeightPx = Math.max(14, Math.min(Math.round(6 * scale), Math.round(pixelHeight * 0.16)));
  const barcodeWidthPx = Math.max(48, Math.min(Math.round(18 * scale), Math.round(pixelWidth * (viewPanel === 'both' ? 0.22 : 0.35))));

  // Genuine QR Code Traceability Payload (Always a 100% valid, scannable web URL)
  const qrPayload = getValidQrUrl(label);

  // Helper: Render Left/Information Panel
  const renderInfoPanel = (isHalfWidth: boolean = true) => (
    <div className={`flex flex-col justify-between h-full min-h-0 ${isHalfWidth ? 'col-span-6 pr-2 border-r' : 'w-full'}`} style={{ borderColor: effectiveBorder }}>
      {/* Scrollable / Flexible Upper Stack */}
      <div className="space-y-1 overflow-hidden min-h-0 flex-1 flex flex-col justify-start">
        {/* Ingredients List */}
        <div className="border-b pb-0.5 shrink-0" style={{ borderColor: effectiveBorder }}>
          <span className="font-extrabold uppercase text-[8.5px] tracking-wider block" style={{ color: effectivePrimary }}>
            Ingredients:
          </span>
          <p className="leading-tight mt-0.5 text-[8px] opacity-90 line-clamp-3">
            {label.ingredients.length > 0 
              ? label.ingredients.map(i => `${i.name}${i.percentage ? ` (${i.percentage})` : ''}`).join(', ')
              : 'Ingredients to be entered.'
            }
          </p>
        </div>

        {/* Allergen Declaration Statement */}
        {label.allergenDeclarations && label.allergenDeclarations.length > 0 && (
          <div 
            className="p-1 rounded border shrink-0" 
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
              borderColor: 'rgba(239, 68, 68, 0.3)' 
            }}
          >
            <span className="font-black uppercase text-[7.5px] block text-rose-600">
              Allergen Advice:
            </span>
            <p className="text-[7.5px] font-bold leading-tight">
              {label.allergenDeclarations.join(' ')}
            </p>
          </div>
        )}

        {/* Nutrition Table (Only when enabled and applicable) */}
        {dims.showNutritionTable && (
          <div className="border rounded overflow-hidden shrink-0 mt-0.5" style={{ borderColor: effectiveBorder }}>
            <div 
              className="font-bold text-[7.5px] px-1 py-0.2 flex justify-between"
              style={{ backgroundColor: effectiveBadgeBg, color: effectiveBadgeText }}
            >
              <span>NUTRITIONAL FACTS</span>
              <span className="font-normal">{label.nutrition.servingBasis || 'per 100g'}</span>
            </div>

            <table className="w-full text-left text-[7px] border-collapse leading-tight">
              <tbody>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.2 font-semibold">Energy</td>
                  <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.energyKcal ?? '-'} kcal</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.2 font-semibold">Protein</td>
                  <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.proteinG ?? '-'} g</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.2 font-semibold">Carbohydrates</td>
                  <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.carbohydratesG ?? '-'} g</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1.5 py-0.2 opacity-80">- Total Sugars</td>
                  <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.totalSugarsG ?? '-'} g</td>
                </tr>
                <tr className="border-b font-bold" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1.5 py-0.2">- Added Sugars</td>
                  <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.addedSugarsG ?? '-'} g</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.2 font-semibold">Total Fat</td>
                  <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.totalFatG ?? '-'} g</td>
                </tr>
                <tr>
                  <td className="px-1 py-0.2 font-bold" style={{ color: effectivePrimary }}>Sodium</td>
                  <td className="px-1 py-0.2 text-right font-mono font-bold" style={{ color: effectivePrimary }}>
                    {label.nutrition.sodiumMg ?? '-'} mg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Storage & Consumer Instructions: Pinned to bottom, never pushed out */}
      <div className="shrink-0 text-[7px] border-t pt-0.5 mt-0.5 leading-tight opacity-85" style={{ borderColor: effectiveBorder }}>
        <div className="truncate"><strong>Storage:</strong> {label.storageInstructions || 'Store in a cool dry place.'}</div>
        <div className="truncate opacity-75"><strong>Mfg By:</strong> {label.manufacturer.name || 'Packer'}, {label.manufacturer.address}</div>
      </div>
    </div>
  );

  // Helper: Render Right / Principal Display Panel (PDP)
  const renderPdpPanel = (isHalfWidth: boolean = true) => (
    <div className={`flex flex-col justify-between h-full min-h-0 ${isHalfWidth ? 'col-span-6 pl-1.5' : 'w-full'}`}>
      {/* Top Half: Brand, Title, Veg Logo, Description & Net Quantity */}
      <div className="min-h-0 flex-1 flex flex-col justify-start">
        {/* Brand Header & Statutory Veg / Non-Veg Symbol */}
        <div className="flex items-start justify-between gap-1">
          <div className="space-y-0.2 min-w-0 flex-1">
            {label.brandLogoUrl && (
              <img src={label.brandLogoUrl} alt="Logo" className="h-4 w-auto object-contain mb-0.5" />
            )}
            <span className="text-[8px] font-bold uppercase tracking-wider block truncate" style={{ color: effectivePrimary }}>
              {label.brandName || 'Brand Name'}
            </span>
            <h2 className="font-extrabold leading-tight text-[11px] sm:text-[12px] tracking-tight truncate">
              {label.bilingual?.enabled && label.bilingual?.displayMode === 'regional-only' && label.bilingual?.translatedProductName
                ? label.bilingual.translatedProductName
                : (label.productName || 'Product Title')}
            </h2>
            {label.bilingual?.enabled && label.bilingual?.displayMode === 'bilingual' && label.bilingual?.translatedProductName && (
              <div className="text-[8.5px] font-bold leading-tight truncate opacity-90" style={{ color: effectivePrimary }}>
                {label.bilingual.translatedProductName}
              </div>
            )}
            <p className="text-[7.5px] line-clamp-1 mt-0.5 opacity-80 leading-snug">
              {label.description}
            </p>
          </div>

          {/* Statutory FSSAI Veg / Non-Veg Symbol */}
          {dims.showVegLogo && (
            <div className="shrink-0 pt-0.5">
              {label.dietaryClassification === 'veg' ? (
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 bg-white rounded-xs flex items-center justify-center p-0.5 shadow-2xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-amber-800 bg-white rounded-xs flex items-center justify-center p-0.5 shadow-2xs">
                  <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5.5px] border-b-amber-800" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Template Badge & Legal Metrology Net Quantity */}
        <div className="mt-1 flex items-center justify-between gap-1 shrink-0">
          <div 
            className="p-0.5 px-1.5 rounded border flex items-center gap-1.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: effectiveBorder }}
          >
            <span className="text-[6.5px] uppercase tracking-wider opacity-70">Net Qty:</span>
            <span className="text-[9.5px] font-black tracking-tight">
              {label.netQuantity} {label.netQuantityUnit}
            </span>
          </div>

          {template.badgeLabel && (
            <span 
              className="text-[6.5px] font-extrabold uppercase tracking-widest px-1 py-0.2 rounded shrink-0"
              style={{ backgroundColor: effectiveBadgeBg, color: effectiveBadgeText }}
            >
              {template.badgeLabel}
            </span>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: Batch, Dates, FSSAI, Barcode & QR Code */}
      {/* Crucial fix: shrink-0 and mt-auto guarantees this final line is NEVER clipped or cut off */}
      <div className="shrink-0 space-y-0.5 pt-0.5 border-t mt-auto" style={{ borderColor: effectiveBorder }}>
        {/* Batch Numbers and Dates */}
        <div className="grid grid-cols-2 gap-x-1 text-[7px] leading-tight opacity-90 font-mono">
          <div className="truncate"><span className="opacity-70 font-sans">Batch:</span> {label.batchNumber || 'N/A'}</div>
          <div className="truncate"><span className="opacity-70 font-sans">Mfg:</span> {label.mfgDate || 'N/A'}</div>
          <div className="truncate"><span className="opacity-70 font-sans">Exp:</span> {label.expiryDate || `${label.bestBeforeMonths}M`}</div>
          <div className="truncate"><span className="opacity-70 font-sans">MRP:</span> ₹{label.mrp ? label.mrp.toFixed(2) : 'Incl. taxes'}</div>
        </div>

        {/* FSSAI License & Code Graphics */}
        <div className="pt-0.5 flex items-center justify-between text-[6.5px] leading-tight border-t" style={{ borderColor: effectiveBorder }}>
          <div className="space-y-0.2 truncate max-w-[120px]">
            <div className="flex items-center gap-1">
              <span className="font-black text-[7.5px] tracking-tight">fssai</span>
              <span className="font-mono font-bold tracking-tight text-[6.5px]">{label.fssaiLicense || 'XXXXXXXXXXXXXX'}</span>
            </div>
            <div className="truncate opacity-75 text-[6px]">
              {label.manufacturer.name || 'Artisan Producer'}
            </div>
          </div>

          {/* Barcode & Genuine Traceability QR Code */}
          <div className="flex items-center gap-1 shrink-0">
            {dims.showBarcode && (
              <BarcodeSvg 
                code={label.barcode || '8901234567890'} 
                width={barcodeWidthPx} 
                height={barcodeHeightPx} 
              />
            )}
            {dims.showQrCode && (
              <QrCodeSvg 
                value={qrPayload} 
                size={qrSizePx} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper: Render Taste & Origin Presentation Panel
  const renderTasteOriginPanel = () => {
    const to = label.tasteAndOrigin;
    return (
      <div className="flex flex-col justify-between h-full min-h-0 w-full p-1 space-y-1">
        <div className="space-y-1 min-h-0 flex-1 overflow-hidden">
          <div className="border-b pb-0.5 flex items-center justify-between" style={{ borderColor: effectiveBorder }}>
            <span className="text-[7.5px] font-extrabold uppercase tracking-widest" style={{ color: effectivePrimary }}>
              TASTE & ORIGIN
            </span>
            {to?.regionalOrigin && (
              <span className="text-[6.5px] font-bold opacity-80 truncate max-w-[120px]">
                {to.regionalOrigin}
              </span>
            )}
          </div>

          {/* Producer story */}
          {to?.producerStory && (
            <p className="text-[7px] italic leading-tight opacity-90 line-clamp-3">
              "{to.producerStory}"
            </p>
          )}

          {/* Tasting notes */}
          {to?.tastingNotes && to.tastingNotes.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-[6px] font-black uppercase opacity-70 block">Tasting Notes:</span>
              <div className="flex flex-wrap gap-0.5">
                {to.tastingNotes.slice(0, 4).map((note, i) => (
                  <span 
                    key={i} 
                    className="text-[6px] font-bold px-1 py-0.2 rounded"
                    style={{ backgroundColor: effectiveBadgeBg, color: effectiveBadgeText }}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Serving suggestion */}
          {to?.servingSuggestions && (
            <div className="text-[6.5px] leading-tight pt-0.5 opacity-80 line-clamp-2">
              <strong>Pairing:</strong> {to.servingSuggestions}
            </div>
          )}
        </div>

        {/* Footer with Batch QR */}
        <div className="pt-0.5 border-t flex items-center justify-between shrink-0" style={{ borderColor: effectiveBorder }}>
          <div className="text-[6px] opacity-75 font-mono">
            {to?.harvestSeason || 'Artisan Small-Batch'}
          </div>
          <QrCodeSvg value={qrPayload} size={qrSizePx} />
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      id="label-canvas-container"
      className={`relative select-text overflow-hidden transition-all shadow-md ${fontClass} ${className}`}
      style={{
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        padding: `${safeMarginPx}px`,
        backgroundColor: effectiveBg,
        color: effectiveText,
        border: `2px solid ${effectiveBorder}`,
        borderRadius: `${(dims.borderRadiusMm || 3) * scale}px`,
        boxSizing: 'border-box',
      }}
    >
      {/* Visual Safe Margin Guide (Only when toggled, strictly hidden in export/print) */}
      {showSafeMarginGuide && !isExportMode && (
        <div
          className="absolute inset-0 border border-dashed border-emerald-500/60 pointer-events-none no-print z-10"
          style={{ margin: `${safeMarginPx}px` }}
          title="Safe Margin Guide (Keep all text inside)"
        />
      )}

      {/* Visual Bleed Margin Guide (Only when toggled, strictly hidden in export/print) */}
      {showBleedGuide && !isExportMode && (
        <div
          className="absolute inset-0 border border-dashed border-rose-500/60 pointer-events-none no-print z-10"
          style={{ margin: `${bleedPx}px` }}
          title="Bleed Margin Guide"
        />
      )}

      {/* Ornate Corner Accents for Heritage / Spice / Gourmet Templates */}
      {(template.borderStyle === 'ornate' || template.borderStyle === 'rustic') && (
        <>
          <div className="absolute top-1 left-1.5 text-[9px] pointer-events-none opacity-40 select-none" style={{ color: effectivePrimary }}>✦</div>
          <div className="absolute top-1 right-1.5 text-[9px] pointer-events-none opacity-40 select-none" style={{ color: effectivePrimary }}>✦</div>
          <div className="absolute bottom-1 left-1.5 text-[9px] pointer-events-none opacity-40 select-none" style={{ color: effectivePrimary }}>✦</div>
          <div className="absolute bottom-1 right-1.5 text-[9px] pointer-events-none opacity-40 select-none" style={{ color: effectivePrimary }}>✦</div>
        </>
      )}

      {/* RENDER MODES: TWO-PANEL (WRAP) OR INDEPENDENT PANEL VIEWS */}
      {viewPanel === 'taste-origin' ? (
        /* Taste & Origin Presentation Panel */
        <div className="w-full h-full" style={{ fontSize: `${baseFontSizePx}px` }}>
          {renderTasteOriginPanel()}
        </div>
      ) : isWrap && viewPanel === 'both' ? (
        /* Full Two-Panel Continuous Wrap */
        <div 
          className="w-full h-full grid grid-cols-12 gap-2 relative"
          style={{ fontSize: `${baseFontSizePx}px` }}
        >
          {/* Fold Line Guide for Wrap Labels */}
          {!isExportMode && (
            <div className="absolute inset-y-0 left-1/2 -ml-px w-px border-l border-dashed border-slate-400/40 pointer-events-none z-10 flex flex-col justify-between py-1">
              <span className="text-[6px] font-mono text-slate-400 bg-white/70 px-0.5 rounded -translate-x-1/2">FOLD</span>
              <span className="text-[6px] font-mono text-slate-400 bg-white/70 px-0.5 rounded -translate-x-1/2">LINE</span>
            </div>
          )}
          {renderInfoPanel(true)}
          {renderPdpPanel(true)}
        </div>
      ) : isWrap && viewPanel === 'info-only' ? (
        /* Single Inspected Info Panel */
        <div className="w-full h-full" style={{ fontSize: `${baseFontSizePx}px` }}>
          {renderInfoPanel(false)}
        </div>
      ) : (
        /* Single Front PDP Panel */
        <div className="w-full h-full" style={{ fontSize: `${baseFontSizePx}px` }}>
          {renderPdpPanel(false)}
        </div>
      )}
    </div>
  );
};
