const fs = require('fs');
const path = require('path');

async function testScanWithRealPhoto() {
  console.log('--- Testing AI Scanner with Real Packaging Photo ---');
  const imagePath = path.resolve(__dirname, '../public/sample_label_photo.jpg');
  if (!fs.existsSync(imagePath)) {
    console.error('File not found:', imagePath);
    return;
  }

  const fileBuffer = fs.readFileSync(imagePath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="labelFile"; filename="sample_mango_pickle_label.jpg"\r\n` +
    `Content-Type: image/jpeg\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, fileBuffer, footer]);

  console.log(`Sending image (${fileBuffer.length} bytes) to http://localhost:5000/api/scan...`);
  const t0 = Date.now();
  const res = await fetch('http://localhost:5000/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body
  });

  const latency = (Date.now() - t0) / 1000;
  console.log(`Response HTTP Status: ${res.status} in ${latency}s`);
  const json = await res.json();
  console.log('Extraction Method:', json.extractionMethod);
  console.log('Extracted Data:\n', JSON.stringify(json.extractedData, null, 2));

  return json;
}

testScanWithRealPhoto();
