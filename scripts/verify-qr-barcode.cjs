const QRCode = require('qrcode');
const jsQR = require('jsqr');
const { PNG } = require('pngjs');

// 1. EAN-13 Validation Algorithm Test
function calculateEan13Checksum(code12) {
  const digits = code12.replace(/\D/g, '').slice(0, 12).split('').map(Number);
  if (digits.length < 12) return 0;
  let sumOdd = 0;
  let sumEven = 0;
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) sumOdd += digits[i];
    else sumEven += digits[i];
  }
  const total = sumOdd + sumEven * 3;
  return (10 - (total % 10)) % 10;
}

function isValidEan13(code13) {
  const clean = code13.replace(/\D/g, '');
  if (clean.length !== 13) return false;
  const expectedChecksum = calculateEan13Checksum(clean.slice(0, 12));
  return parseInt(clean[12], 10) === expectedChecksum;
}

async function testBarcode() {
  console.log('--- Testing EAN-13 Checksum Engine ---');
  const validTest = '8901234567890';
  const computedCheck = calculateEan13Checksum(validTest.slice(0, 12));
  console.log(`EAN-13: ${validTest} -> Computed 13th digit: ${computedCheck}`);
  
  if (computedCheck !== 0 || !isValidEan13(validTest)) {
    throw new Error(`FAIL: EAN-13 checksum calculation failed for ${validTest}`);
  }
  console.log('PASS: Valid EAN-13 check digit recognized correctly.');

  const invalidTest = '8901234567895'; // Wrong check digit (should be 0, not 5)
  if (isValidEan13(invalidTest)) {
    throw new Error(`FAIL: Invalid EAN-13 should have been rejected for ${invalidTest}`);
  }
  console.log('PASS: Invalid EAN-13 check digit rejected correctly.');
}

async function testQrCode() {
  console.log('\n--- Testing QR Code Generation & Independent jsQR Decoding ---');
  const samplePayload = 'PROD: Heritage Mango Pickle | BATCH: HK-MP-2024-B108 | EXP: 2025-10-24 | NET: 400g';
  
  // Generate PNG buffer using standard qrcode library
  const pngBuffer = await QRCode.toBuffer(samplePayload, {
    errorCorrectionLevel: 'M',
    type: 'png',
    margin: 2,
    scale: 4,
  });

  // Parse PNG buffer with pngjs to get raw RGBA Uint8ClampedArray
  const png = PNG.sync.read(pngBuffer);
  const rgbaData = new Uint8ClampedArray(png.data);

  // Decode with independent jsQR library
  const decoded = jsQR(rgbaData, png.width, png.height);

  if (!decoded) {
    throw new Error('FAIL: jsQR was unable to detect or decode the generated QR code image.');
  }

  console.log('Decoded QR Payload:', decoded.data);
  if (decoded.data !== samplePayload) {
    throw new Error(`FAIL: Decoded payload does not match original!\nExpected: ${samplePayload}\nReceived: ${decoded.data}`);
  }

  console.log('PASS: Independent QR decoder successfully verified 100% bit-exact payload match!');
}

async function main() {
  try {
    await testBarcode();
    await testQrCode();
    console.log('\nALL BARCODE & QR TESTS PASSED WITH 100% ACCURACY.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
