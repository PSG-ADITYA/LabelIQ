const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runPersistenceTest() {
  console.log('--- Step 1: Creating Product via API ---');
  const prodPayload = {
    brandName: 'Antigravity Artisans',
    productName: 'Organic Roasted Cumin Seed',
    category: 'Spices & Seasonings',
    fssaiLicense: '10022022001234',
    dietaryClassification: 'veg',
    variants: [{
      variantName: 'Pouch 200g',
      netQuantity: 200,
      netQuantityUnit: 'g',
      packagingFormat: 'Foil Pouch',
      barcodeEan13: '8901234567890',
      widthMm: 100,
      heightMm: 140
    }]
  };

  const createProdRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, prodPayload);

  console.log('Product Creation Status:', createProdRes.status, createProdRes.data);
  const productId = createProdRes.data.productId;
  const variantId = createProdRes.data.variantId;

  console.log('--- Step 2: Creating Production Batch via API ---');
  const testBatchNum = `AG-PERSIST-${Date.now().toString().slice(-4)}`;
  const batchPayload = {
    productId,
    variantId,
    batchNumber: testBatchNum,
    mfgDate: '2026-10-25',
    expiryDate: '2027-10-24',
    bestBeforeMonths: 12,
    batchSizeQuantity: 50,
    batchSizeUnit: 'kg',
    plannedUnits: 250,
    notes: 'Persistence verification batch'
  };

  const createBatchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/batches',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, batchPayload);

  console.log('Batch Creation Status:', createBatchRes.status, createBatchRes.data);
  const batchId = createBatchRes.data.batchId;

  console.log(`\nCreated Product: ${productId}, Batch: ${batchId} (${testBatchNum})`);

  // Direct DB check before restart
  const dbPath = path.resolve(__dirname, '../labeliq.db');
  let db = new Database(dbPath);
  let pRow = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  let bRow = db.prepare('SELECT * FROM production_batches WHERE id = ?').get(batchId);
  console.log('Pre-restart DB record found:', Boolean(pRow), Boolean(bRow));
  db.close();

  return { productId, batchId, testBatchNum };
}

runPersistenceTest().then(res => {
  console.log('TEST_KEYS:' + JSON.stringify(res));
}).catch(console.error);
