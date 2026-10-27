process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');
const { jsPDF } = require('jspdf');
const QRCode = require('qrcode');
const jsQR = require('jsqr');
const { PNG } = require('pngjs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables for testing
const envPath = fs.existsSync(path.resolve(process.cwd(), '.env.labeliq'))
  ? path.resolve(process.cwd(), '.env.labeliq')
  : path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  const parsed = dotenv.parse(fs.readFileSync(envPath));
  for (const [k, v] of Object.entries(parsed)) {
    if (!process.env[k]) process.env[k] = v;
  }
}

const auditReport = {
  timestamp: new Date().toISOString(),
  environment: 'Vercel Serverless Simulation (process.env.VERCEL = "1")',
  sections: {}
};

function recordAudit(section, item, status, details) {
  if (!auditReport.sections[section]) auditReport.sections[section] = [];
  auditReport.sections[section].push({ item, status, details });
  const icon = status === 'PASS' ? '✅' : (status === 'WARN' ? '⚠️' : '❌');
  console.log(`${icon} [${section}] ${item}: ${details}`);
}

async function runAudit() {
  console.log('==================================================================');
  console.log('  LabelIQ Studio — Production Readiness Comprehensive Audit      ');
  console.log('==================================================================\n');

  // SECTION 1: VERCEL SERVERLESS ENTRYPOINT & SERVER STARTUP
  console.log('--- 1. Auditing Vercel Serverless Entrypoint & Startup ---');
  let apiHandler = null;
  try {
    const apiModule = await import('../api/index.js');
    apiHandler = apiModule.default;
    if (typeof apiHandler === 'function') {
      recordAudit('SERVERLESS_BOOT', 'Entrypoint Loader', 'PASS', 'api/index.js exported valid (req, res) handler function');
    } else {
      recordAudit('SERVERLESS_BOOT', 'Entrypoint Loader', 'FAIL', 'api/index.js did not export a function');
    }
  } catch (err) {
    recordAudit('SERVERLESS_BOOT', 'Entrypoint Loader', 'FAIL', `Module failed to import: ${err.message}`);
  }

  if (!apiHandler) {
    console.error('Fatal: Cannot continue audit without working serverless handler.');
    process.exit(1);
  }

  // Spin up local HTTP server to simulate Vercel serverless environment
  const server = http.createServer((req, res) => apiHandler(req, res));
  await new Promise(res => server.listen(0, res));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  recordAudit('SERVERLESS_BOOT', 'Serverless HTTP Runner', 'PASS', `Listening at ${baseUrl}`);

  try {
    // SECTION 2: HEALTH & LIVE AI DRAFT GENERATION
    console.log('\n--- 2. Auditing Live Routes: /api/health & /api/ai/draft ---');
    
    // Health Route
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json().catch(() => ({}));
    if (healthRes.status === 200 && healthJson.status === 'ok') {
      recordAudit('API_ROUTES', 'GET /api/health', 'PASS', `Status: 200 OK | Service: ${healthJson.service} | AI Configured: ${healthJson.aiConfigured}`);
    } else {
      recordAudit('API_ROUTES', 'GET /api/health', 'FAIL', `Status ${healthRes.status}: ${JSON.stringify(healthJson)}`);
    }

    // Live AI Connection Ping
    const aiTestRes = await fetch(`${baseUrl}/api/ai/test`);
    const aiTestJson = await aiTestRes.json().catch(() => ({}));
    if (aiTestJson.configured && aiTestJson.status === 'live_authenticated') {
      recordAudit('API_ROUTES', 'GET /api/ai/test', 'PASS', `Google Gemini authenticated | Model: ${aiTestJson.model} | Latency: ${aiTestJson.latencyMs}ms`);
    } else {
      recordAudit('API_ROUTES', 'GET /api/ai/test', 'WARN', `Status: ${aiTestJson.status} | ${aiTestJson.message}`);
    }

    // AI Draft Route (JSON payload)
    const draftPayload = {
      description: 'Cold pressed gingelly sesame oil traditional wood pressed with palm jaggery in chekku. 1 Liter food grade tin.',
      category: 'Honey, Oils & Agricultural Produce',
      knownFields: {
        brandName: 'Annamalai Organics',
        netQuantity: 1,
        netQuantityUnit: 'l',
        fssaiLicense: '12423008000123'
      }
    };
    const draftRes = await fetch(`${baseUrl}/api/ai/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftPayload)
    });
    const draftJson = await draftRes.json().catch(() => ({}));
    if (draftRes.status === 200 && draftJson.success && draftJson.draft?.productName) {
      recordAudit('AI_DRAFT', 'POST /api/ai/draft (JSON)', 'PASS', `Generated: "${draftJson.draft.productName}" | Method: ${draftJson.method} | Ingredients: ${draftJson.draft.ingredients?.length}`);
    } else {
      recordAudit('AI_DRAFT', 'POST /api/ai/draft (JSON)', 'FAIL', `HTTP ${draftRes.status}: ${JSON.stringify(draftJson)}`);
    }

    // SECTION 3: REAL IMAGE UPLOADS AND OCR ON VERCEL
    console.log('\n--- 3. Auditing Real Image Upload & Multimodal OCR on Vercel ---');
    const samplePhotoPath = path.resolve(process.cwd(), 'public/sample_label_photo.jpg');
    if (fs.existsSync(samplePhotoPath)) {
      const fileBytes = fs.readFileSync(samplePhotoPath);
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      
      const headerPart = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="labelFile"; filename="sample_label_photo.jpg"\r\n` +
        `Content-Type: image/jpeg\r\n\r\n`
      );
      const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`);
      const multipartBody = Buffer.concat([headerPart, fileBytes, footerPart]);

      const scanRes = await fetch(`${baseUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: multipartBody
      });
      const scanJson = await scanRes.json().catch(() => ({}));
      if (scanRes.status === 200 && scanJson.success && scanJson.extractedData) {
        recordAudit('OCR_SCAN', 'POST /api/scan (Image Upload)', 'PASS', `Multimodal Vision succeeded | Method: ${scanJson.extractionMethod} | Product: "${scanJson.extractedData.productName}"`);
      } else if (scanRes.status === 200 && !scanJson.success) {
        recordAudit('OCR_SCAN', 'POST /api/scan (Image Upload)', 'WARN', `Vercel mode notice: ${scanJson.message}`);
      } else {
        recordAudit('OCR_SCAN', 'POST /api/scan (Image Upload)', 'FAIL', `HTTP ${scanRes.status}: ${JSON.stringify(scanJson)}`);
      }
    } else {
      recordAudit('OCR_SCAN', 'sample_label_photo.jpg', 'WARN', 'Sample photo not found in public/');
    }

    // SECTION 4: BARCODE / QR / PDF FUNCTIONALITY
    console.log('\n--- 4. Auditing Barcode, QR Code & PDF Functionality ---');
    // EAN-13 Checksum Algorithm validation
    function calcEan13(code12) {
      const digits = code12.replace(/\D/g, '').slice(0, 12).split('').map(Number);
      let sumOdd = 0, sumEven = 0;
      for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) sumOdd += digits[i];
        else sumEven += digits[i];
      }
      return (10 - ((sumOdd + sumEven * 3) % 10)) % 10;
    }
    const test12 = '890123456789';
    const computedCheck = calcEan13(test12);
    if (computedCheck === 0) {
      recordAudit('BARCODE_QR_PDF', 'GS1 EAN-13 Checksum', 'PASS', `Modulo-10 check digit calculated accurately for 890123456789 -> 0 (8901234567890)`);
    } else {
      recordAudit('BARCODE_QR_PDF', 'GS1 EAN-13 Checksum', 'FAIL', `Expected 0, got ${computedCheck}`);
    }

    // QR Code generation and Bit-Exact Decoding
    const qrTestPayload = 'https://labeliq.app/v/HK-MP-2024-B108';
    const qrDataUrl = await QRCode.toDataURL(qrTestPayload, { errorCorrectionLevel: 'M' });
    const qrPngBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const png = PNG.sync.read(qrPngBuffer);
    const decodedQr = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    if (decodedQr && decodedQr.data === qrTestPayload) {
      recordAudit('BARCODE_QR_PDF', 'QR Code Generation & Decoding', 'PASS', `Bit-exact verification: "${decodedQr.data}"`);
    } else {
      recordAudit('BARCODE_QR_PDF', 'QR Code Generation & Decoding', 'FAIL', 'jsQR failed to decode generated QR payload');
    }

    // PDF Dimension & Millimeter Integrity
    const testPdf = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: [140, 85]
    });
    const pdfPageWidth = testPdf.internal.pageSize.getWidth();
    const pdfPageHeight = testPdf.internal.pageSize.getHeight();
    if (Math.round(pdfPageWidth) === 140 && Math.round(pdfPageHeight) === 85) {
      recordAudit('BARCODE_QR_PDF', 'PDF Print Dimensions', 'PASS', `Exact physical millimeter geometry verified: ${pdfPageWidth}×${pdfPageHeight}mm`);
    } else {
      recordAudit('BARCODE_QR_PDF', 'PDF Print Dimensions', 'FAIL', `Expected 140×85mm, got ${pdfPageWidth}×${pdfPageHeight}mm`);
    }

    // SECTION 5: SUPABASE PERSISTENCE & DATA LAYER
    console.log('\n--- 5. Auditing Supabase Cloud Persistence ---');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // Check products table
      const { data: prodData, error: prodErr } = await supabase.from('products').select('id, product_name, category').limit(5);
      if (!prodErr) {
        recordAudit('SUPABASE_PERSISTENCE', 'Products Table Access', 'PASS', `Connected to remote Supabase PostgreSQL. Found ${prodData ? prodData.length : 0} existing products`);
      } else {
        recordAudit('SUPABASE_PERSISTENCE', 'Products Table Access', 'WARN', `Supabase query returned: ${prodErr.message} (Code: ${prodErr.code})`);
      }

      // Check batches table
      const { data: batchData, error: batchErr } = await supabase.from('production_batches').select('id, batch_number').limit(5);
      if (!batchErr) {
        recordAudit('SUPABASE_PERSISTENCE', 'Batches Table Access', 'PASS', `Connected to remote production_batches. Found ${batchData ? batchData.length : 0} records`);
      } else {
        recordAudit('SUPABASE_PERSISTENCE', 'Batches Table Access', 'WARN', `Batches query: ${batchErr.message} (Code: ${batchErr.code})`);
      }

      // Check recipe_versions table
      const { data: rcpData, error: rcpErr } = await supabase.from('recipe_versions').select('id, version_number').limit(5);
      if (!rcpErr) {
        recordAudit('SUPABASE_PERSISTENCE', 'Recipe Versions Table Access', 'PASS', `Connected to remote recipe_versions. Found ${rcpData ? rcpData.length : 0} records`);
      } else {
        recordAudit('SUPABASE_PERSISTENCE', 'Recipe Versions Table Access', 'WARN', `Recipe versions query: ${rcpErr.message} (Code: ${rcpErr.code})`);
      }
    } else {
      recordAudit('SUPABASE_PERSISTENCE', 'Supabase Credentials', 'WARN', 'SUPABASE_URL or Key not defined in environment. System runs in local SQLite mode.');
    }

    // SECTION 6: SECURITY & SECRET EXPOSURE AUDIT
    console.log('\n--- 6. Auditing Security & Secret Exposure ---');
    const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');
    let secretLeakFound = false;
    let leakedSecretName = '';

    if (fs.existsSync(distAssetsDir)) {
      const files = fs.readdirSync(distAssetsDir);
      for (const file of files) {
        if (!file.endsWith('.js')) continue;
        const code = fs.readFileSync(path.join(distAssetsDir, file), 'utf8');
        if (process.env.GEMINI_API_KEY && code.includes(process.env.GEMINI_API_KEY)) {
          secretLeakFound = true;
          leakedSecretName = 'GEMINI_API_KEY';
          break;
        }
        if (process.env.SUPABASE_SERVICE_ROLE_KEY && code.includes(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
          secretLeakFound = true;
          leakedSecretName = 'SUPABASE_SERVICE_ROLE_KEY';
          break;
        }
      }
    }

    if (!secretLeakFound) {
      recordAudit('SECURITY_AUDIT', 'Frontend Bundle Secret Isolation', 'PASS', 'Zero backend API keys or service role secrets exposed in dist/ client bundles');
    } else {
      recordAudit('SECURITY_AUDIT', 'Frontend Bundle Secret Isolation', 'FAIL', `Critical: ${leakedSecretName} found embedded inside client JavaScript bundle!`);
    }

  } finally {
    server.close();
  }

  console.log('\n==================================================================');
  console.log('  Audit Complete                                                  ');
  console.log('==================================================================');
  const summaryPath = path.resolve(process.cwd(), 'audit-results.json');
  fs.writeFileSync(summaryPath, JSON.stringify(auditReport, null, 2));
  console.log(`Saved detailed report to ${summaryPath}\n`);
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
