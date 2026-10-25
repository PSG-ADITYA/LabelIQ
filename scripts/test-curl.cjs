const { spawnSync } = require('child_process');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('d:/LabelIQ/.env.labeliq', 'utf8'));
const key = env.GEMINI_API_KEY;

fs.writeFileSync('d:/LabelIQ/req-fast.json', JSON.stringify({
  contents: [{ parts: [{ text: 'Respond with OK' }] }],
  generationConfig: {
    thinkingConfig: {
      thinkingBudget: 0
    }
  }
}));

console.log('Sending request to gemini-3.8-flash with thinkingBudget: 0...');
const t0 = Date.now();
const res = spawnSync('curl.exe', [
  '-i',
  '-m', '30',
  '-X', 'POST',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
  '-H', 'Content-Type: application/json',
  '-H', `x-goog-api-key: ${key}`,
  '-d', '@req-fast.json'
], { encoding: 'utf8' });

console.log(`Time taken: ${(Date.now() - t0) / 1000}s`);
console.log('OUTPUT:\n', res.stdout);
