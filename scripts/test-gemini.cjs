const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function testGemini() {
  console.log('--- Testing Gemini Configuration ---');
  const envPath = path.resolve(__dirname, '../.env.labeliq');
  if (!fs.existsSync(envPath)) {
    console.log('FAIL: .env.labeliq not found at', envPath);
    return;
  }

  const raw = fs.readFileSync(envPath, 'utf8');
  const parsed = dotenv.parse(raw);
  const apiKey = parsed.GEMINI_API_KEY ? parsed.GEMINI_API_KEY.trim() : '';

  if (!apiKey) {
    console.log('FAIL: No valid GEMINI_API_KEY variable found in .env.labeliq');
    return;
  }

  console.log(`Key found in .env.labeliq (length: ${apiKey.length}, preview: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)})`);

  // 1. Test model list with secure header
  try {
    const listRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!listRes.ok) {
      const errText = await listRes.text();
      console.log(`Model List Error (HTTP ${listRes.status}):`, errText);
      return;
    }
    const listJson = await listRes.json();
    console.log(`PASS: Models list retrieved successfully. Total models: ${listJson.models ? listJson.models.length : 0}`);
    
    const models = (listJson.models || []).map(m => m.name.replace('models/', ''));
    const testModel = 'gemini-3.8-flash';
    const has38 = models.includes(testModel);
    console.log(`Model "${testModel}" exists in API catalog: ${has38}`);

    console.log(`Testing generateContent with model: ${testModel} via secure headers...`);
    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with exactly: LIVE_GEMINI_OK' }] }]
        })
      }
    );

    const genJson = await genRes.json();
    console.log(`HTTP Status: ${genRes.status}`);
    if (genRes.ok) {
      const reply = genJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log(`PASS: Gemini response received successfully: "${reply}"`);
    } else {
      console.log(`Gemini generateContent returned HTTP ${genRes.status}:`, genJson.error?.message);
    }
  } catch (err) {
    console.error('Network / Fetch Exception:', err.message);
  }
}

testGemini();

