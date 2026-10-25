import { LabelTheme, LayoutStyle } from '../types/label';

export interface LabelTemplateDefinition {
  id: LabelTheme;
  name: string;
  categoryTag: string; // e.g. "Pickles & Preserves", "Bakery", "Beverages"
  description: string;
  palette: {
    background: string;
    text: string;
    primaryAccent: string;
    secondaryAccent: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    tableHeaderBg: string;
  };
  fontFamily: 'sans' | 'serif' | 'slab' | 'mono';
  borderStyle: 'ornate' | 'clean' | 'thick' | 'pill' | 'hairline' | 'rustic';
  recommendedLayout: LayoutStyle;
  tagline: string;
  badgeLabel?: string;
}

export const LABEL_TEMPLATES: LabelTemplateDefinition[] = [
  {
    id: 'heritage-premium',
    name: 'Heritage Premium',
    categoryTag: 'Pickles, Chutneys & Condiments',
    description: 'Deep forest green and warm cream with ornate vintage framing, regal gold badges, and classic serif hierarchy.',
    palette: {
      background: '#0F2F20',
      text: '#FAF8F5',
      primaryAccent: '#84CC16',
      secondaryAccent: '#E2D4C6',
      border: '#1E4E37',
      badgeBg: '#133E2B',
      badgeText: '#BEF264',
      tableHeaderBg: 'rgba(255, 255, 255, 0.1)',
    },
    fontFamily: 'serif',
    borderStyle: 'ornate',
    recommendedLayout: 'two-panel',
    tagline: 'Traditional Indian Culinary Heritage',
    badgeLabel: 'AUTHENTIC HERITAGE',
  },
  {
    id: 'clean-modern',
    name: 'Clean & Modern',
    categoryTag: 'General Packaged Food',
    description: 'Pure crisp white background with Swiss minimalist typography, high-contrast dark slate text, and modern geometric badges.',
    palette: {
      background: '#FFFFFF',
      text: '#0F172A',
      primaryAccent: '#2563EB',
      secondaryAccent: '#64748B',
      border: '#E2E8F0',
      badgeBg: '#EFF6FF',
      badgeText: '#1D4ED8',
      tableHeaderBg: '#F1F5F9',
    },
    fontFamily: 'sans',
    borderStyle: 'clean',
    recommendedLayout: 'standard',
    tagline: 'Pure Ingredients. Clear Transparency.',
    badgeLabel: 'MODERN ESSENTIALS',
  },
  {
    id: 'organic-inspired',
    name: 'Organic-inspired',
    categoryTag: 'Farm & Organic Produce',
    description: 'Earthy sage green and warm oatmeal with botanical accents, soft leaf emblems, and natural craft paper tones.',
    palette: {
      background: '#F7F5EE',
      text: '#2C3E2D',
      primaryAccent: '#406343',
      secondaryAccent: '#8F7151',
      border: '#D0C9B6',
      badgeBg: '#E4ECD9',
      badgeText: '#2D4B2E',
      tableHeaderBg: '#EFECE1',
    },
    fontFamily: 'sans',
    borderStyle: 'rustic',
    recommendedLayout: 'two-panel',
    tagline: '100% Sustainably Sourced & Farm Fresh',
    badgeLabel: 'CERTIFIED ORGANIC ORIGIN',
  },
  {
    id: 'bold-artisan',
    name: 'Bold Artisan',
    categoryTag: 'Craft & Small Batch',
    description: 'Deep matte charcoal with warm amber accents, heavy woodcut divider rules, and punchy uppercase craft lettering.',
    palette: {
      background: '#18181B',
      text: '#F4F4F5',
      primaryAccent: '#F59E0B',
      secondaryAccent: '#A1A1AA',
      border: '#27272A',
      badgeBg: '#451A03',
      badgeText: '#FCD34D',
      tableHeaderBg: '#27272A',
    },
    fontFamily: 'slab',
    borderStyle: 'thick',
    recommendedLayout: 'two-panel',
    tagline: 'Small Batch Artisan Crafted',
    badgeLabel: 'MASTER CRAFTED',
  },
  {
    id: 'minimal-monochrome',
    name: 'Minimal Monochrome',
    categoryTag: 'Luxury Pantry & Confectionery',
    description: 'Ultra-refined high-fashion monochrome with hairline dividers, exquisite negative space, and sleek editorial typography.',
    palette: {
      background: '#FAFAFA',
      text: '#09090B',
      primaryAccent: '#18181B',
      secondaryAccent: '#71717A',
      border: '#E4E4E7',
      badgeBg: '#09090B',
      badgeText: '#FFFFFF',
      tableHeaderBg: '#F4F4F5',
    },
    fontFamily: 'serif',
    borderStyle: 'hairline',
    recommendedLayout: 'minimal',
    tagline: 'Purity of Formulation',
    badgeLabel: 'LIMITED EDITION',
  },
  {
    id: 'artisan-bakery',
    name: 'Artisan Bakery',
    categoryTag: 'Bakery & Confectionery',
    description: 'Warm terracotta and soft wheat cream with comforting rounded typography, oven-baked warmth, and wholesome charm.',
    palette: {
      background: '#FFF9F2',
      text: '#4A2810',
      primaryAccent: '#C86D51',
      secondaryAccent: '#D99B6A',
      border: '#F2D7BF',
      badgeBg: '#FCE7D6',
      badgeText: '#873B14',
      tableHeaderBg: '#F8ECE1',
    },
    fontFamily: 'serif',
    borderStyle: 'pill',
    recommendedLayout: 'standard',
    tagline: 'Freshly Baked Daily from Stoneground Grains',
    badgeLabel: 'ARTISANAL OVEN',
  },
  {
    id: 'spice-market',
    name: 'Spice Market',
    categoryTag: 'Spices & Seasonings',
    description: 'Vibrant saffron turmeric and deep paprika red with patterned border accents, celebrating rich Indian spice heritage.',
    palette: {
      background: '#FFFBF0',
      text: '#451A03',
      primaryAccent: '#D97706',
      secondaryAccent: '#B91C1C',
      border: '#FDE68A',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
      tableHeaderBg: '#FEEBC8',
    },
    fontFamily: 'slab',
    borderStyle: 'ornate',
    recommendedLayout: 'two-panel',
    tagline: 'Aromatic Sun-Dried Traditional Spices',
    badgeLabel: 'SINGLE ORIGIN SPICE',
  },
  {
    id: 'premium-beverage',
    name: 'Premium Beverage',
    categoryTag: 'Non-Alcoholic Beverages & Syrups',
    description: 'Cool arctic navy with energetic cyan accents, vertical branding ribbon, and sleek cold-chain styling.',
    palette: {
      background: '#0B132B',
      text: '#F0F9FF',
      primaryAccent: '#06B6D4',
      secondaryAccent: '#38BDF8',
      border: '#1C2541',
      badgeBg: '#164E63',
      badgeText: '#67E8F9',
      tableHeaderBg: '#1C2541',
    },
    fontFamily: 'sans',
    borderStyle: 'clean',
    recommendedLayout: 'standard',
    tagline: 'Cold-Pressed. Never from Concentrate.',
    badgeLabel: 'CHILLED PERFECTION',
  },
  {
    id: 'healthy-snack',
    name: 'Healthy Snack',
    categoryTag: 'Snacks, Namkeen & Savouries',
    description: 'Energetic lime green and sunshine yellow with punchy nutritional stat callouts and a lively, playful lifestyle layout.',
    palette: {
      background: '#FFFFFF',
      text: '#1C1917',
      primaryAccent: '#65A30D',
      secondaryAccent: '#D97706',
      border: '#E7E5E4',
      badgeBg: '#ECFCCB',
      badgeText: '#365314',
      tableHeaderBg: '#F5F5F4',
    },
    fontFamily: 'sans',
    borderStyle: 'pill',
    recommendedLayout: 'two-panel',
    tagline: 'Guilt-Free Crunch & Clean Nutrition',
    badgeLabel: 'ROASTED NOT FRIED',
  },
  {
    id: 'dairy-fresh',
    name: 'Dairy Fresh',
    categoryTag: 'Dairy Products',
    description: 'Pure pastoral sky blue and fresh milk white with wholesome rounded badge pills and farm-fresh dairy purity.',
    palette: {
      background: '#F0F9FF',
      text: '#0C4A6E',
      primaryAccent: '#0284C7',
      secondaryAccent: '#0369A1',
      border: '#BAE6FD',
      badgeBg: '#E0F2FE',
      badgeText: '#075985',
      tableHeaderBg: '#E0F2FE',
    },
    fontFamily: 'sans',
    borderStyle: 'pill',
    recommendedLayout: 'standard',
    tagline: '100% Pure Pasture Grass-Fed Dairy',
    badgeLabel: 'FARM FRESH DAIRY',
  },
  {
    id: 'gourmet-condiment',
    name: 'Gourmet Condiment',
    categoryTag: 'Luxury Relishes & Table Sauces',
    description: 'Deep royal burgundy with champagne gold accents, fine-dining typography, and luxury gourmet condiment prestige.',
    palette: {
      background: '#2A0826',
      text: '#FDF4FF',
      primaryAccent: '#F59E0B',
      secondaryAccent: '#E879F9',
      border: '#4A154B',
      badgeBg: '#4A154B',
      badgeText: '#FDE047',
      tableHeaderBg: 'rgba(255, 255, 255, 0.08)',
    },
    fontFamily: 'serif',
    borderStyle: 'ornate',
    recommendedLayout: 'two-panel',
    tagline: 'Artisanal Culinary Table Reserve',
    badgeLabel: 'GOURMET RESERVE',
  },
  {
    id: 'custom-brand',
    name: 'Custom Brand',
    categoryTag: 'Custom Brand Identity',
    description: 'Fully customizable studio template. Set your brand primary color, accent hues, typography family, and logo placement.',
    palette: {
      background: '#FFFFFF',
      text: '#1E293B',
      primaryAccent: '#133E2B',
      secondaryAccent: '#64748B',
      border: '#CBD5E1',
      badgeBg: '#F1F5F9',
      badgeText: '#0F172A',
      tableHeaderBg: '#F8FAFC',
    },
    fontFamily: 'sans',
    borderStyle: 'clean',
    recommendedLayout: 'two-panel',
    tagline: 'Crafted for Distinctive Brand Packaging',
    badgeLabel: 'CUSTOM BRAND',
  },
];

// Helper to look up template by ID (supporting legacy fallback aliases)
export function getTemplateById(id: LabelTheme): LabelTemplateDefinition {
  // Normalize legacy IDs
  let targetId = id;
  if (id === 'clean-white') targetId = 'clean-modern';
  if (id === 'kraft-paper') targetId = 'organic-inspired';
  if (id === 'artisan-dark') targetId = 'bold-artisan';
  if (id === 'forest-heritage') targetId = 'heritage-premium';

  return LABEL_TEMPLATES.find(t => t.id === targetId) || LABEL_TEMPLATES[0];
}
