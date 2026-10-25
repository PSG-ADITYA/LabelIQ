import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  variant?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  variant = 'light'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem: Modern Agritech Leaf Checkmark Tag */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center rounded-xl bg-forest-950 border border-limeaccent-400/50 shadow-md group-hover:border-limeaccent-400 transition-all`}>
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full p-1"
          aria-label="LabelIQ Brand Emblem"
        >
          {/* Modern Geometric Badge Background */}
          <rect x="4" y="4" width="32" height="32" rx="9" fill="#0B2E20" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.4" />
          
          {/* Botanical Sprout / Leaf Blade */}
          <path 
            d="M11 29C10 20 16 12 25 10C24 19 18 27 11 29Z" 
            fill="#10B981" 
            fillOpacity="0.35" 
            stroke="#34D399" 
            strokeWidth="2" 
            strokeLinejoin="round" 
          />

          {/* Bold Verification Checkmark in Electric Lime */}
          <path 
            d="M13 21.5L18.5 27L29 13.5" 
            stroke="#A3E635" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Seed of Authenticity Accent */}
          <circle cx="28.5" cy="11.5" r="1.8" fill="#FAF8F5" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className={`flex items-baseline font-extrabold tracking-tight ${textSizes[size]} ${variant === 'dark' ? 'text-forest-950' : 'text-white'}`}>
            <span className="font-serif tracking-tight">Label</span>
            <span className="text-limeaccent-400 font-sans tracking-normal">IQ</span>
            <span className="ml-1 text-[10px] font-mono font-bold tracking-widest text-limeaccent-400/90 uppercase">Studio</span>
          </div>
          <span className={`font-sans font-medium uppercase tracking-wider text-forest-300 ${subtitleSizes[size]}`}>
            Farmer-First Packaging
          </span>
        </div>
      )}
    </div>
  );
};
