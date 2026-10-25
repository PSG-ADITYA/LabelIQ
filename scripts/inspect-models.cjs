const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function checkModels() {
  const envPath = path.resolve(__dirname, '../.env.labeliq');
  const raw = fs.readFileSync(envPath, 'utf8');
  const parsed = dotenv.parse(raw);
  const apiKey = parsed.GEMINI_API_KEY ? parsed.GEMINI_API_KEY.trim() : '';

  const listRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: { 'x-goog-api-key': apiKey }
  });
  const data = await listRes.json();
  const candidates = (data.models || []).filter(m => m.supportedGenerationMethods?.includes('generateContent'));

  console.log('Candidates for generateContent:');
  for (const m of candidates) {
    const id = m.name.replace('models/', '');
    if (id.includes('flash') || id.includes('pro') || id.includes('3.8')) {
      console.log(`- ${id} (disp: ${m.displayName})`);
    }
  }

  // Let's test a few models with 10s timeout: gemini-3.8-flash, gemini-2.5-flash, gemini-flash-latest, etc.
  const toTest = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
  for (const modelId of toTest) {
    console.log(`\nTesting ${modelId}...`);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK' }] }]
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      console.log(`${modelId} Status:`, res.status);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (res.ok) {
          console.log(`${modelId} Success:`, json.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
        } else {
          console.log(`${modelId} Error:`, json.error?.message || json);
        }
      } catch (e) {
        console.log(`${modelId} Raw:`, text.slice(0, 200));
      }
    } catch (err) {
      console.log(`${modelId} Request failed/timed out:`, err.name, err.message);
    }
  }
}

checkModels();
