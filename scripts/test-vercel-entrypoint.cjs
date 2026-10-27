process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

const http = require('http');

async function test() {
  console.log('--- Testing Vercel Serverless Entrypoint Loading ---');
  const apiModule = await import('../api/index.js');
  const handler = apiModule.default;
  if (typeof handler !== 'function') {
    throw new Error('Vercel handler is not a function');
  }
  console.log('✓ Successfully loaded api/index.js default handler.');

  // Create a real local HTTP server wrapping the Vercel handler
  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`✓ Test HTTP server listening on ${baseUrl}`);

  try {
    // 1. Health check
    console.log('\n--- 1. Testing GET /api/health ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    console.log('Status:', healthRes.status);
    const healthJson = await healthRes.json();
    console.log('Service:', healthJson.service, '| Status:', healthJson.status, '| aiConfigured:', healthJson.aiConfigured);
    if (healthRes.status !== 200 || healthJson.status !== 'ok') {
      throw new Error(`Health check failed with status ${healthRes.status}`);
    }
    console.log('✓ /api/health passed.');

    // 2. AI draft generation
    console.log('\n--- 2. Testing POST /api/ai/draft ---');
    const draftPayload = {
      description: 'Handcrafted raw mango pickle in cold-pressed mustard oil with fenugreek and red chillies.',
      category: 'Pickles, Chutneys and Sauces',
      knownFields: {
        brandName: 'Malnad Heritage Farms',
        netQuantity: 300
      }
    };
    const draftRes = await fetch(`${baseUrl}/api/ai/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftPayload)
    });
    console.log('Status:', draftRes.status);
    const draftJson = await draftRes.json();
    console.log('Success:', draftJson.success, '| Method:', draftJson.method);
    console.log('Product:', draftJson.draft?.productName, '| Brand:', draftJson.draft?.brandName);
    console.log('Ingredients count:', draftJson.draft?.ingredients?.length);
    if (draftRes.status !== 200 || !draftJson.success) {
      throw new Error(`AI Draft generation failed with status ${draftRes.status}: ${JSON.stringify(draftJson)}`);
    }
    console.log('✓ /api/ai/draft passed.');

    console.log('\n=============================================');
    console.log('🎉 ALL VERCEL SERVERLESS TESTS PASSED LOCALLY');
    console.log('=============================================\n');
  } finally {
    server.close();
  }
}

test().catch(err => {
  console.error('\n❌ Serverless test failed:', err);
  process.exit(1);
});
