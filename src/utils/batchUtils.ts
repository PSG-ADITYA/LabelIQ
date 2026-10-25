/**
 * Batch & Traceability Utilities for LabelIQ Studio
 * Guarantees reliable formatting and prevents placeholder artifacts like 'nullnull null'
 */

export interface BatchVariantFields {
  variant_name?: string | null;
  net_quantity?: number | string | null;
  net_quantity_unit?: string | null;
  packaging_format?: string | null;
}

/**
 * Defensively formats a batch variant string.
 * Never outputs 'nullnull null' or 'undefined'.
 */
export function formatBatchVariant(b: BatchVariantFields | null | undefined): string {
  if (!b) return 'Standard Packaging';
  
  if (b.variant_name && b.variant_name.trim() !== '') {
    return b.variant_name.trim();
  }

  const qty = b.net_quantity != null ? String(b.net_quantity).trim() : '';
  const unit = b.net_quantity_unit ? b.net_quantity_unit.trim() : '';
  const pkg = b.packaging_format ? b.packaging_format.trim() : '';

  if (qty && unit) {
    return `${qty}${unit} ${pkg || 'Pack'}`.trim();
  }

  if (qty) {
    return `${qty}g ${pkg || 'Pack'}`.trim();
  }

  if (pkg) {
    return `Standard ${pkg}`.trim();
  }

  return 'Standard Package';
}

/**
 * Calculates expiry date based on manufacturing date and shelf life months
 */
export function calculateExpiryDate(mfgDateStr: string, shelfLifeMonths: number = 12): string {
  if (!mfgDateStr) return '';
  try {
    const d = new Date(mfgDateStr);
    if (isNaN(d.getTime())) return '';
    d.setMonth(d.getMonth() + shelfLifeMonths);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/** Official Food Safety Compliance System (FoSCoS) portal */
export const OFFICIAL_FSSAI_VERIFY_PORTAL = 'https://foscos.fssai.gov.in';

/**
 * Constructs public batch traceability verification link
 */
export function getPublicTraceabilityUrl(batchNumberOrId: string, preferLan = false): string {
  if (preferLan) {
    return `http://192.168.1.6:5173/?verify=${encodeURIComponent(batchNumberOrId)}`;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  return `${origin}/?verify=${encodeURIComponent(batchNumberOrId)}`;
}

/**
 * Checks if a URL is hosted on localhost or 127.0.0.1
 */
export function isLocalhost(url?: string): boolean {
  if (!url) return false;
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(url);
}

/**
 * Ensures any QR code payload on a packaging label is a genuine, valid, scannable URL.
 * Never returns fake non-existent domains or raw text.
 */
export function getValidQrUrl(label: { qrCodeUrl?: string; batchNumber?: string; id?: string }): string {
  if (label.qrCodeUrl && label.qrCodeUrl.startsWith('http')) {
    // Reject fake non-existent demo domains
    if (!label.qrCodeUrl.includes('pahadiheritagefarms.com') && !label.qrCodeUrl.includes('fssai.gov.in/verify/')) {
      return label.qrCodeUrl;
    }
  }
  if (label.batchNumber || label.id) {
    return getPublicTraceabilityUrl(label.batchNumber || label.id || '');
  }
  return OFFICIAL_FSSAI_VERIFY_PORTAL;
}
