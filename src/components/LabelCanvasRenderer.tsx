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

  // Auto-correct layout style: A portrait orientation (height > width) cannot wrap horizontally into two columns,
  // so auto-treat as single comprehensive panel containing all statutory details.
  const isWrap = dims.layoutStyle === 'two-panel' && (widthMm >= heightMm * 1.15);
  const effectiveWidthMm = (isWrap && viewPanel !== 'both') ? Math.round(widthMm / 2) : widthMm;
  const pixelWidth = Math.round(effectiveWidthMm * scale);
  const pixelHeight = Math.round(heightMm * scale);

  // 2. Resolve Template & Aesthetics
  const template = getTemplateById(dims.labelTheme);
  const effectiveBg = dims.customBgColor || template.palette.background;
  const effectiveText = dims.customTextColor || template.palette.text;
  const effectivePrimary = dims.customPrimaryColor || template.palette.primaryAccent;
  const effectiveSecondary = dims.customAccentColor || template.palette.secondaryAccent;
  const effectiveBorder = dims.customBorderColor || template.palette.border;
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
  const fontScale = dims.fontSizeScale || 1.0;
  // Height-aware scaling factor: standard 75mm label = 1.0, 110mm tall label = 1.32, 40mm short = 0.78
  const heightFactor = Math.min(1.4, Math.max(0.78, heightMm / 75));
  const dynamicScale = fontScale * heightFactor;

  const safeMarginPx = Math.max(3, Math.round((dims.safeMargin || 3) * scale));
  const bleedPx = Math.max(2, Math.round((dims.bleed || 2) * scale));
  const baseFontSizePx = Math.max(7.5, dynamicScale * (heightMm < 60 ? 9 : 10.5));

  // Dynamic code sizing proportional to label height so bottom content is never clipped
  const qrSizePx = Math.max(18, Math.min(Math.round(7 * scale), Math.round(pixelHeight * 0.15)));
  const barcodeHeightPx = Math.max(12, Math.min(Math.round(5 * scale), Math.round(pixelHeight * 0.12)));
  const barcodeWidthPx = Math.max(40, Math.min(Math.round(15 * scale), Math.round(pixelWidth * (viewPanel === 'both' ? 0.20 : 0.28))));

  // Genuine QR Code Traceability Payload (Configurable: FoSCoS portal, Public traceability, or custom URL)
  const qrPayload = getValidQrUrl(label);

  // Clean, defensive ingredients display text
  const validIngredients = label.ingredients.length > 0
    ? label.ingredients
        .filter(i => i && i.name && i.name.trim() !== '' && i.name.trim().toLowerCase() !== 'ingredients to be entered.')
        .map(i => `${i.name.trim()}${i.percentage ? ` (${i.percentage})` : ''}`)
    : [];

  const ingredientsText = validIngredients.length > 0 
    ? validIngredients.join(', ')
    : '100% natural pure agricultural produce.';

  // Helper: Render Left/Information Panel
  const renderInfoPanel = (isHalfWidth: boolean = true) => (
    <div className={`flex flex-col justify-between h-full min-h-0 ${isHalfWidth ? 'col-span-6 pr-2 border-r' : 'w-full'}`} style={{ borderColor: effectiveBorder, fontSize: `${8 * dynamicScale}px` }}>
      {/* Scrollable / Flexible Upper Stack */}
      <div className="space-y-1 overflow-hidden min-h-0 flex-1 flex flex-col justify-start">
        {/* Ingredients List */}
        <div className="border-b pb-1 pt-0.5 shrink-0" style={{ borderColor: effectiveBorder }}>
          <span className="font-extrabold uppercase tracking-wider block" style={{ color: effectivePrimary, fontSize: `${8.5 * dynamicScale}px` }}>
            Ingredients:
          </span>
          <p className="leading-normal mt-0.5 opacity-90 line-clamp-3 pt-0.5 pb-0.5" style={{ fontSize: `${8 * dynamicScale}px`, lineHeight: 1.4 }}>
            {ingredientsText}
          </p>
        </div>

        {/* Allergen Declaration Statement */}
        {label.allergenDeclarations && label.allergenDeclarations.length > 0 && (
          <div 
            className="p-1 rounded border shrink-0" 
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
              borderColor: 'rgba(239, 68, 68, 0.3)',
              fontSize: `${7.5 * dynamicScale}px`,
              lineHeight: 1.35
            }}
          >
            <span className="font-black uppercase block text-rose-600">
              Allergen Advice:
            </span>
            <p className="font-bold leading-normal">
              {label.allergenDeclarations.join(' ')}
            </p>
          </div>
        )}

        {/* Nutrition Table (Only when enabled and applicable) */}
        {dims.showNutritionTable && (
          <div className="border rounded overflow-hidden shrink-0 mt-0.5" style={{ borderColor: effectiveBorder, fontSize: `${7 * dynamicScale}px` }}>
            <div 
              className="font-bold px-1 py-0.5 flex justify-between"
              style={{ backgroundColor: effectiveBadgeBg, color: effectiveBadgeText, fontSize: `${7.5 * dynamicScale}px` }}
            >
              <span>NUTRITIONAL FACTS</span>
              <span className="font-normal">{label.nutrition.servingBasis || 'per 100g'}</span>
            </div>

            <table className="w-full text-left border-collapse leading-normal" style={{ fontSize: `${7 * dynamicScale}px` }}>
              <tbody>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.5 font-semibold">Energy</td>
                  <td className="px-1 py-0.5 text-right font-mono">{label.nutrition.energyKcal ?? '-'} kcal</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.5 font-semibold">Protein</td>
                  <td className="px-1 py-0.5 text-right font-mono">{label.nutrition.proteinG ?? '-'} g</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.5 font-semibold">Carbohydrates</td>
                  <td className="px-1 py-0.5 text-right font-mono">{label.nutrition.carbohydratesG ?? '-'} g</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1.5 py-0.5 opacity-80">- Total Sugars</td>
                  <td className="px-1 py-0.5 text-right font-mono">{label.nutrition.totalSugarsG ?? '-'} g</td>
                </tr>
                <tr className="border-b font-bold" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1.5 py-0.5">- Added Sugars</td>
                  <td className="px-1 py-0.5 text-right font-mono">{label.nutrition.addedSugarsG ?? '-'} g</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.2)' }}>
                  <td className="px-1 py-0.5 font-semibold">Total Fat</td>
                  <td className="px-1 py-0.5 text-right font-mono">{label.nutrition.totalFatG ?? '-'} g</td>
                </tr>
                <tr>
                  <td className="px-1 py-0.5 font-bold" style={{ color: effectivePrimary }}>Sodium</td>
                  <td className="px-1 py-0.5 text-right font-mono font-bold" style={{ color: effectivePrimary }}>
                    {label.nutrition.sodiumMg ?? '-'} mg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Storage & Precise Consumer Care: Pinned to bottom, never pushed out */}
      <div className="shrink-0 border-t pt-0.5 mt-0.5 leading-normal opacity-90 space-y-0.5" style={{ borderColor: effectiveBorder, fontSize: `${6.5 * dynamicScale}px`, lineHeight: 1.35 }}>
        <div className="truncate py-0.2"><strong>Storage:</strong> {label.storageInstructions || 'Store in a cool dry place.'}</div>
        <div className="truncate py-0.2"><strong>Packed By:</strong> {label.manufacturer.name || 'Artisan Producer'}, {label.manufacturer.address}{label.manufacturer.city ? `, ${label.manufacturer.city}` : ''}</div>
        {(label.manufacturer.customerCarePhone || label.manufacturer.customerCareEmail) && (
          <div className="truncate font-semibold py-0.2" style={{ color: effectivePrimary }}>
            <strong>Consumer Care: </strong>
            {label.manufacturer.customerCarePhone && <span>Ph: {label.manufacturer.customerCarePhone}</span>}
            {label.manufacturer.customerCarePhone && label.manufacturer.customerCareEmail && <span> · </span>}
            {label.manufacturer.customerCareEmail && <span>Email: {label.manufacturer.customerCareEmail}</span>}
          </div>
        )}
      </div>
    </div>
  );

  // Helper: Render Right / Principal Display Panel (PDP)
  const renderPdpPanel = (isHalfWidth: boolean = true) => {
    const prodTitle = label.bilingual?.enabled && label.bilingual?.displayMode === 'regional-only' && label.bilingual?.translatedProductName
      ? label.bilingual.translatedProductName
      : (label.productName || 'Product Title');

    const titleFontSize = (prodTitle.length > 28 
      ? (isHalfWidth ? 9.5 : 11) 
      : prodTitle.length > 18 
      ? (isHalfWidth ? 10.5 : 12.5) 
      : (isHalfWidth ? 11.5 : 14)) * dynamicScale;

    return (
      <div className={`flex flex-col justify-between h-full min-h-0 ${isHalfWidth ? 'col-span-6 pl-1.5' : 'w-full'}`} style={{ fontSize: `${8 * dynamicScale}px` }}>
        {/* Top Half: Brand, Title, Veg Logo, Description & Net Quantity */}
        <div className="min-h-0 flex-1 flex flex-col justify-start">
          {/* Brand Header & Statutory Veg / Non-Veg Symbol */}
          <div className="flex items-start justify-between gap-1">
            <div className="space-y-0.2 min-w-0 flex-1">
              {label.brandLogoUrl && (
                <img src={label.brandLogoUrl} alt="Logo" className="h-4 w-auto object-contain mb-0.5" />
              )}
              <span className="font-bold uppercase tracking-wider block truncate py-0.2" style={{ color: effectivePrimary, fontSize: `${8 * dynamicScale}px`, lineHeight: 1.35 }}>
                {label.brandName || 'Brand Name'}
              </span>
              <h2 className="font-extrabold leading-normal tracking-tight line-clamp-2 py-0.2" style={{ fontSize: `${titleFontSize}px`, lineHeight: 1.3 }}>
                {prodTitle}
              </h2>
              {label.bilingual?.enabled && label.bilingual?.displayMode === 'bilingual' && label.bilingual?.translatedProductName && (
                <div className="font-bold leading-normal truncate opacity-90 py-0.2" style={{ color: effectivePrimary, fontSize: `${8.5 * dynamicScale}px`, lineHeight: 1.35 }}>
                  {label.bilingual.translatedProductName}
                </div>
              )}
              {label.description && (
                <p className="line-clamp-2 mt-0.5 opacity-80 leading-normal py-0.2" style={{ fontSize: `${7.5 * dynamicScale}px`, lineHeight: 1.35 }}>
                  {label.description}
                </p>
              )}
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

        {/* Brand Quote / Tagline (e.g. "Pure Farm Harvested with Love") */}
        {(label.brandQuote || template.tagline) && (
          <div 
            className="my-1 px-1.5 py-0.5 rounded text-center italic font-medium truncate shrink-0"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.06)', 
              color: effectivePrimary, 
              fontSize: `${7.5 * dynamicScale}px`,
              border: `1px solid ${effectiveBorder}`,
              lineHeight: 1.35
            }}
          >
            "{label.brandQuote || template.tagline}"
          </div>
        )}

        {/* Template Badge & Legal Metrology Net Quantity */}
        <div className="mt-0.5 flex items-center justify-between gap-1 shrink-0">
          <div 
            className="p-0.5 px-1.5 rounded border flex items-center gap-1.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: effectiveBorder }}
          >
            <span className="uppercase tracking-wider opacity-70" style={{ fontSize: `${6.5 * dynamicScale}px` }}>Net Qty:</span>
            <span className="font-black tracking-tight" style={{ fontSize: `${9.5 * dynamicScale}px` }}>
              {label.netQuantity} {label.netQuantityUnit}
            </span>
          </div>

          {template.badgeLabel && (
            <span 
              className="font-extrabold uppercase tracking-widest px-1 py-0.2 rounded shrink-0"
              style={{ backgroundColor: effectiveBadgeBg, color: effectiveBadgeText, fontSize: `${6.5 * dynamicScale}px` }}
            >
              {template.badgeLabel}
            </span>
          )}
        </div>

        {/* WRAP PDP MIDDLE BODY (When in Two-Panel Wrap mode): Fills the middle gracefully */}
        {isHalfWidth && (
          <div className="mt-1 pt-0.5 space-y-1 flex-1 min-h-0 flex flex-col justify-center">
            {/* Front Sensory Notes / Origin Badge */}
            <div 
              className="p-1 rounded text-center leading-normal space-y-0.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px dashed ${effectiveBorder}` }}
            >
              <span className="font-extrabold uppercase tracking-widest block" style={{ color: effectivePrimary, fontSize: `${7 * dynamicScale}px` }}>
                {label.tasteAndOrigin?.regionalOrigin ? `Origin: ${label.tasteAndOrigin.regionalOrigin}` : 'Authentic Small-Batch Formulation'}
              </span>
              <p className="opacity-80 italic line-clamp-2" style={{ fontSize: `${6.5 * dynamicScale}px`, lineHeight: 1.35 }}>
                {label.tasteAndOrigin?.producerStory || label.description || 'Crafted with premium natural ingredients following traditional methods.'}
              </p>
            </div>

            {/* Quick Statutory Reminder: Directs consumer to side panel */}
            <div className="text-center opacity-70 font-mono tracking-tight" style={{ fontSize: `${6 * dynamicScale}px` }}>
              <span>Detailed Nutrition & Statutory Declarations on Left Panel ◀</span>
            </div>
          </div>
        )}

        {/* SINGLE-PANEL BODY: Renders Ingredients, Allergens, Nutrition & Storage when NOT in 2-column wrap mode */}
        {!isHalfWidth && (
          <div className="mt-1.5 pt-2 border-t space-y-1.5 flex-1 min-h-0 flex flex-col justify-between" style={{ borderColor: effectiveBorder }}>
            {/* Ingredients & Allergens Stack */}
            <div className="space-y-0.5 shrink-0 pt-0.5">
              <div className="leading-normal opacity-90 line-clamp-2 pt-0.5 pb-0.5" style={{ fontSize: `${7.5 * dynamicScale}px`, lineHeight: 1.4 }}>
                <strong style={{ color: effectivePrimary }}>Ingredients: </strong>
                <span>{ingredientsText}</span>
              </div>

              {label.allergenDeclarations && label.allergenDeclarations.length > 0 && (
                <div 
                  className="px-1.5 py-0.5 rounded font-bold text-rose-600 truncate py-0.2 shrink-0" 
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', fontSize: `${7 * dynamicScale}px`, border: '1px solid rgba(239, 68, 68, 0.25)', lineHeight: 1.35 }}
                >
                  ⚠ Allergen Declaration: {label.allergenDeclarations.join(' ')}
                </div>
              )}
            </div>

            {/* Nutrition Facts Table (Detailed for tall labels >= 75mm, compact strip for smaller labels) */}
            {dims.showNutritionTable && (
              heightMm >= 75 ? (
                <div className="border rounded overflow-hidden shrink-0 mt-0.5" style={{ borderColor: effectiveBorder, fontSize: `${6.5 * dynamicScale}px` }}>
                  <div 
                    className="font-bold px-1 py-0.2 flex justify-between"
                    style={{ backgroundColor: effectiveBadgeBg, color: effectiveBadgeText, fontSize: `${7 * dynamicScale}px` }}
                  >
                    <span>NUTRITIONAL FACTS</span>
                    <span className="font-normal">{label.nutrition.servingBasis || 'per 100g'}</span>
                  </div>
                  <table className="w-full text-left border-collapse leading-normal" style={{ fontSize: `${6.5 * dynamicScale}px` }}>
                    <tbody>
                      <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.18)' }}>
                        <td className="px-1 py-0.2 font-semibold">Energy</td>
                        <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.energyKcal ?? '-'} kcal</td>
                        <td className="px-1 py-0.2 font-semibold border-l" style={{ borderColor: 'rgba(150,150,150,0.18)' }}>Total Fat</td>
                        <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.totalFatG ?? '-'} g</td>
                      </tr>
                      <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.18)' }}>
                        <td className="px-1 py-0.2 font-semibold">Protein</td>
                        <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.proteinG ?? '-'} g</td>
                        <td className="px-1 py-0.2 font-semibold border-l" style={{ borderColor: 'rgba(150,150,150,0.18)' }}>Saturated Fat</td>
                        <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.saturatedFatG ?? '-'} g</td>
                      </tr>
                      <tr className="border-b" style={{ borderColor: 'rgba(150,150,150,0.18)' }}>
                        <td className="px-1 py-0.2 font-semibold">Carbohydrates</td>
                        <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.carbohydratesG ?? '-'} g</td>
                        <td className="px-1 py-0.2 font-semibold border-l" style={{ borderColor: 'rgba(150,150,150,0.18)' }}>Trans Fat</td>
                        <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.transFatG ?? '0'} g</td>
                      </tr>
                      <tr>
                        <td className="px-1 py-0.2 opacity-85">Total Sugars</td>
                        <td className="px-1 py-0.2 text-right font-mono">{label.nutrition.totalSugarsG ?? '-'} g</td>
                        <td className="px-1 py-0.2 font-bold border-l" style={{ color: effectivePrimary, borderColor: 'rgba(150,150,150,0.18)' }}>Sodium</td>
                        <td className="px-1 py-0.2 text-right font-mono font-bold" style={{ color: effectivePrimary }}>{label.nutrition.sodiumMg ?? '-'} mg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div 
                  className="px-1 py-0.5 rounded border flex flex-wrap items-center justify-between gap-1 font-mono shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: effectiveBorder, fontSize: `${6.5 * dynamicScale}px` }}
                >
                  <span><strong>Cal:</strong> {label.nutrition.energyKcal ?? '-'}kcal</span>
                  <span><strong>P:</strong> {label.nutrition.proteinG ?? '-'}g</span>
                  <span><strong>C:</strong> {label.nutrition.carbohydratesG ?? '-'}g</span>
                  <span><strong>F:</strong> {label.nutrition.totalFatG ?? '-'}g</span>
                  <span><strong>Na:</strong> {label.nutrition.sodiumMg ?? '-'}mg</span>
                </div>
              )
            )}

            {/* Origin Story / Sensory Badge for tall single-panel labels (fills dead space gracefully) */}
            {heightMm >= 90 && (label.tasteAndOrigin?.regionalOrigin || label.tasteAndOrigin?.producerStory) && (
              <div 
                className="p-1 rounded text-center leading-normal space-y-0.5 shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px dashed ${effectiveBorder}` }}
              >
                <span className="font-extrabold uppercase tracking-widest block" style={{ color: effectivePrimary, fontSize: `${7 * dynamicScale}px` }}>
                  {label.tasteAndOrigin?.regionalOrigin ? `Origin: ${label.tasteAndOrigin.regionalOrigin}` : 'Authentic Small-Batch Formulation'}
                </span>
                <p className="opacity-80 italic line-clamp-2" style={{ fontSize: `${6.5 * dynamicScale}px`, lineHeight: 1.35 }}>
                  {label.tasteAndOrigin?.producerStory || 'Crafted with premium natural ingredients following traditional methods.'}
                </p>
              </div>
            )}

            {/* Storage & Customer Care Info */}
            <div className="opacity-85 leading-normal shrink-0 mt-0.5 space-y-0.5 py-0.2" style={{ fontSize: `${6.5 * dynamicScale}px`, lineHeight: 1.35 }}>
              <div className="truncate py-0.2"><strong>Storage:</strong> {label.storageInstructions || 'Store in a cool dry place away from direct sunlight.'}</div>
              <div className="truncate py-0.2"><strong>Packed By:</strong> {label.manufacturer.name || 'Artisan Producer'}, {label.manufacturer.city || label.manufacturer.address}</div>
              {(label.manufacturer.customerCarePhone || label.manufacturer.customerCareEmail) && (
                <div className="truncate font-semibold py-0.2" style={{ color: effectivePrimary }}>
                  <strong>Consumer Care: </strong>
                  {label.manufacturer.customerCarePhone && <span>Ph: {label.manufacturer.customerCarePhone}</span>}
                  {label.manufacturer.customerCarePhone && label.manufacturer.customerCareEmail && <span> · </span>}
                  {label.manufacturer.customerCareEmail && <span>Email: {label.manufacturer.customerCareEmail}</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Batch, Dates, FSSAI, Barcode & QR Code */}
      <div className="shrink-0 space-y-0.5 pt-1 border-t mt-auto" style={{ borderColor: effectiveBorder }}>
        {/* Batch Numbers and Dates with Best Before support */}
        <div className="grid grid-cols-2 gap-x-1.5 leading-normal opacity-90 font-mono py-0.2" style={{ fontSize: `${7 * dynamicScale}px`, lineHeight: 1.4 }}>
          <div className="truncate py-0.2"><span className="opacity-70 font-sans font-semibold">Batch:</span> {label.batchNumber || 'N/A'}</div>
          <div className="truncate py-0.2"><span className="opacity-70 font-sans font-semibold">Mfg:</span> {label.mfgDate || 'N/A'}</div>
          <div className="truncate col-span-1 py-0.2" title={label.bestBeforePeriod || label.expiryDate}>
            <span className="opacity-70 font-sans font-semibold">Exp:</span> {label.bestBeforePeriod ? label.bestBeforePeriod : (label.expiryDate || `${label.bestBeforeMonths || 12}M`)}
          </div>
          <div className="truncate py-0.2"><span className="opacity-70 font-sans font-semibold">MRP:</span> ₹{label.mrp ? label.mrp.toFixed(2) : 'Incl. taxes'}</div>
        </div>

        {/* FSSAI License & Code Graphics */}
        <div className="pt-0.5 flex items-center justify-between leading-normal border-t" style={{ borderColor: effectiveBorder, fontSize: `${6.5 * dynamicScale}px` }}>
          <div className="space-y-0.2 min-w-0 flex-1 pr-1.5">
            <div className="flex items-center gap-1 py-0.2">
              <span className="font-black font-sans tracking-tight" style={{ fontSize: `${7.5 * dynamicScale}px` }}>fssai</span>
              <span className="font-mono font-bold tracking-tight whitespace-nowrap" style={{ fontSize: `${6.5 * dynamicScale}px` }}>{label.fssaiLicense || 'XXXXXXXXXXXXXX'}</span>
            </div>
            <div className="truncate opacity-75 font-sans py-0.2" style={{ fontSize: `${6 * dynamicScale}px`, lineHeight: 1.35 }}>
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
};

  // Helper: Render Taste & Origin Presentation Panel
  const renderTasteOriginPanel = () => {
    const to = label.tasteAndOrigin;
    return (
      <div className="flex flex-col justify-between h-full min-h-0 w-full p-1 space-y-1">
        <div className="space-y-1 min-h-0 flex-1 overflow-hidden">
          <div className="border-b pb-0.5 flex items-center justify-between" style={{ borderColor: effectiveBorder }}>
            <span className="font-extrabold uppercase tracking-widest" style={{ color: effectivePrimary, fontSize: `${7.5 * fontScale}px` }}>
              TASTE & ORIGIN
            </span>
            {to?.regionalOrigin && (
              <span className="font-bold opacity-80 truncate max-w-[120px]" style={{ fontSize: `${6.5 * fontScale}px` }}>
                {to.regionalOrigin}
              </span>
            )}
          </div>

          {/* Producer story */}
          {to?.producerStory && (
            <p className="italic leading-tight opacity-90 line-clamp-3" style={{ fontSize: `${7 * fontScale}px` }}>
              "{to.producerStory}"
            </p>
          )}

          {/* Tasting notes */}
          {to?.tastingNotes && to.tastingNotes.length > 0 && (
            <div className="space-y-0.5">
              <span className="font-black uppercase opacity-70 block" style={{ fontSize: `${6 * fontScale}px` }}>Tasting Notes:</span>
              <div className="flex flex-wrap gap-0.5">
                {to.tastingNotes.slice(0, 4).map((note, i) => (
                  <span 
                    key={i} 
                    className="font-bold px-1 py-0.2 rounded"
                    style={{ backgroundColor: effectiveBadgeBg, color: effectiveBadgeText, fontSize: `${6 * fontScale}px` }}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Serving suggestion */}
          {to?.servingSuggestions && (
            <div className="leading-tight pt-0.5 opacity-80 line-clamp-2" style={{ fontSize: `${6.5 * fontScale}px` }}>
              <strong>Pairing:</strong> {to.servingSuggestions}
            </div>
          )}
        </div>

        {/* Footer with Batch QR */}
        <div className="pt-0.5 border-t flex items-center justify-between shrink-0" style={{ borderColor: effectiveBorder }}>
          <div className="opacity-75 font-mono" style={{ fontSize: `${6 * fontScale}px` }}>
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
        borderRadius: `${(dims.borderRadiusMm !== undefined ? dims.borderRadiusMm : 3) * scale}px`,
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
          {/* Fold Line Guide for Wrap Labels (Only when guides are explicitly toggled on) */}
          {!isExportMode && showSafeMarginGuide && (
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
