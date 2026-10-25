import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * Standard EAN-13 Checksum Calculation
 * Validates or computes the standard 13th check digit
 */
export function calculateEan13Checksum(code12: string): number {
  const digits = code12.replace(/\D/g, '').slice(0, 12).split('').map(Number);
  if (digits.length < 12) return 0;
  
  let sumOdd = 0;
  let sumEven = 0;
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) sumOdd += digits[i]; // Odd position (1st, 3rd, 5th...)
    else sumEven += digits[i];            // Even position (2nd, 4th, 6th...)
  }
  const total = sumOdd + sumEven * 3;
  return (10 - (total % 10)) % 10;
}

export function isValidEan13(code13: string): boolean {
  const clean = code13.replace(/\D/g, '');
  if (clean.length !== 13) return false;
  const expectedChecksum = calculateEan13Checksum(clean.slice(0, 12));
  return parseInt(clean[12], 10) === expectedChecksum;
}

export function formatOrFixEan13(rawCode: string): { code: string; isValid: boolean; notice: string } {
  const clean = rawCode.replace(/\D/g, '');
  if (clean.length === 13) {
    const valid = isValidEan13(clean);
    return {
      code: clean,
      isValid: valid,
      notice: valid ? 'Valid GS1/EAN-13 checksum.' : 'Checksum digit mismatch for EAN-13.'
    };
  } else if (clean.length === 12) {
    const check = calculateEan13Checksum(clean);
    return {
      code: clean + check,
      isValid: true,
      notice: `Calculated 13th checksum digit: ${check}`
    };
  } else {
    // Pad or fallback to standard demo EAN-13 with valid checksum (8901234567890 has check digit 0)
    const padded = (clean + '890123456789').slice(0, 12);
    const check = calculateEan13Checksum(padded);
    return {
      code: padded + check,
      isValid: true,
      notice: 'Normalized to 13-digit EAN demonstration code.'
    };
  }
}

/**
 * Standard EAN-13 Barcode Module Encoding
 * 95 total modules: 3 left guard (101) + 42 left digits (6x7) + 5 center (01010) + 42 right digits (6x7) + 3 right guard (101)
 */
const EAN_L_CODES = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011'
];
const EAN_G_CODES = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111'
];
const EAN_R_CODES = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100'
];
const EAN_PARITY_TABLE = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
];

export const BarcodeSvg: React.FC<{
  code: string;
  width?: number;
  height?: number;
  className?: string;
  dark?: boolean;
}> = ({ code, width = 110, height = 36, className = '', dark = false }) => {
  const { code: normalizedCode, isValid } = formatOrFixEan13(code || '8901234567890');

  // Build binary module string
  const firstDigit = parseInt(normalizedCode[0], 10) || 0;
  const parity = EAN_PARITY_TABLE[firstDigit] || 'LLLLLL';
  
  let modules = '101'; // Left guard
  
  // Left 6 digits
  for (let i = 1; i <= 6; i++) {
    const digit = parseInt(normalizedCode[i], 10) || 0;
    const isL = parity[i - 1] === 'L';
    modules += isL ? EAN_L_CODES[digit] : EAN_G_CODES[digit];
  }
  
  modules += '01010'; // Center guard
  
  // Right 6 digits (always R codes)
  for (let i = 7; i <= 12; i++) {
    const digit = parseInt(normalizedCode[i], 10) || 0;
    modules += EAN_R_CODES[digit];
  }
  
  modules += '101'; // Right guard

  const strokeColor = dark ? '#FFFFFF' : '#0F172A';
  const totalModules = modules.length; // 95 modules

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalModules * 1.5 + 16} 36`}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="overflow-visible"
      >
        {/* White backing for scanner contrast */}
        <rect 
          x={0} 
          y={0} 
          width={totalModules * 1.5 + 16} 
          height={36} 
          fill={dark ? 'transparent' : '#FFFFFF'} 
          rx={1}
        />
        
        {/* Draw 95 standard binary modules */}
        {modules.split('').map((bit, idx) => {
          if (bit === '1') {
            const isGuard = idx < 3 || (idx >= 45 && idx < 50) || idx >= 92;
            const barHeight = isGuard ? 26 : 22;
            return (
              <rect
                key={idx}
                x={8 + idx * 1.5}
                y={2}
                width={1.4}
                height={barHeight}
                fill={strokeColor}
              />
            );
          }
          return null;
        })}

        {/* Human readable numerals at base */}
        <text
          x={totalModules * 0.75 + 8}
          y={33}
          fontSize="7"
          fontWeight="700"
          fontFamily="monospace"
          fill={strokeColor}
          textAnchor="middle"
          letterSpacing="0.8"
        >
          {normalizedCode}
        </text>
      </svg>
    </div>
  );
};

/**
 * Genuine Standard 2D QR Code Renderer
 * Uses the official `qrcode` engine to generate 100% compliant, scannable QR Code SVGs.
 */
export const QrCodeSvg: React.FC<{
  value?: string;
  size?: number;
  className?: string;
  dark?: boolean;
}> = ({ 
  value = 'https://foscos.fssai.gov.in', 
  size = 48, 
  className = '', 
  dark = false 
}) => {
  const [svgString, setSvgString] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const payload = value && value.trim().length > 0 
      ? value 
      : 'https://foscos.fssai.gov.in';

    QRCode.toString(payload, {
      type: 'svg',
      margin: 1,
      color: {
        dark: dark ? '#FFFFFF' : '#0F172A',
        light: dark ? '#00000000' : '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
      .then((svg) => {
        if (isMounted) setSvgString(svg);
      })
      .catch((err) => {
        console.warn('QR code generation warning:', err);
      });

    return () => { isMounted = false; };
  }, [value, dark]);

  if (!svgString) {
    return (
      <div 
        style={{ width: `${size}px`, height: `${size}px` }} 
        className={`bg-cream-100 rounded border border-cream-300 flex items-center justify-center ${className}`}
      >
        <span className="text-[8px] font-mono text-slate-400">QR...</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};
