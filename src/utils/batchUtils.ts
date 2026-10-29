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

/** Official Food Safety Compliance System (FoSCoS) portal - Search & Licensing Verification */
export const OFFICIAL_FSSAI_VERIFY_PORTAL = 'https://foscos.fssai.gov.in';

/**
 * Constructs public batch traceability verification link
 */
export function getPublicTraceabilityUrl(batchNumberOrId: string, preferLan = false): string {
  if (preferLan) {
    return `http://192.168.1.6:5175/?verify=${encodeURIComponent(batchNumberOrId)}`;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5175';
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
 * Supports configurable destinations:
 * 1. 'public_traceability': LabelIQ public batch story & test certificates page
 * 2. 'foscos_portal': Official FoSCoS portal (search license)
 * 3. 'custom_url': Producer website
 */
export function getValidQrUrl(label: { 
  qrCodeUrl?: string; 
  batchNumber?: string; 
  id?: string;
  fssaiLicense?: string;
  qrDestinationType?: 'public_traceability' | 'foscos_portal' | 'custom_url';
}): string {
  // Option 1: Custom Producer Website URL
  if (label.qrDestinationType === 'custom_url' && label.qrCodeUrl && label.qrCodeUrl.startsWith('http')) {
    return label.qrCodeUrl;
  }

  // Option 2: Public Batch Traceability Page (when explicitly selected)
  if (label.qrDestinationType === 'public_traceability' && (label.batchNumber || label.id)) {
    return getPublicTraceabilityUrl(label.batchNumber || label.id || '');
  }

  // Option 3: Custom URL provided in qrCodeUrl (if non-default)
  if (label.qrCodeUrl && label.qrCodeUrl.startsWith('http') && !label.qrCodeUrl.includes('localhost') && !label.qrCodeUrl.includes('127.0.0.1')) {
    return label.qrCodeUrl;
  }

  // Default: Official FSSAI FoSCoS Portal (Government License & Compliance Verification)
  return OFFICIAL_FSSAI_VERIFY_PORTAL;
}
