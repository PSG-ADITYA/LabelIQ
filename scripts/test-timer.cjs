const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function testWithTimer() {
  const envPath = path.resolve(__dirname, '../.env.labeliq');
  const raw = fs.readFileSync(envPath, 'utf8');
  const parsed = dotenv.parse(raw);
  const apiKey = parsed.GEMINI_API_KEY ? parsed.GEMINI_API_KEY.trim() : '';

  const models = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3-flash-preview'];

  for (const m of models) {
    console.log(`\nStarting test for ${m}...`);
    const t0 = Date.now();
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say HELLO' }] }]
        })
      });
      const ms = Date.now() - t0;
      console.log(`${m}: HTTP ${res.status} in ${ms}ms`);
      const data = await res.json();
      if (res.ok) {
        console.log(`SUCCESS [${m}]:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
        break; // Found working fast model!
      } else {
        console.log(`ERROR [${m}]:`, data.error?.message);
      }
    } catch (err) {
      console.log(`EXCEPTION [${m}]:`, err.message);
    }
  }
}

testWithTimer();
