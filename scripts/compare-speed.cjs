const { spawnSync } = require('child_process');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('d:/LabelIQ/.env.labeliq', 'utf8'));
const key = env.GEMINI_API_KEY;

const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];

for (const m of models) {
  const t0 = Date.now();
  console.log(`Checking ${m}...`);
  const res = spawnSync('curl.exe', [
    '-i',
    '-m', '25',
    '-s',
    '-X', 'POST',
    `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
    '-H', 'Content-Type: application/json',
    '-H', `x-goog-api-key: ${key}`,
    '-d', '@req.json'
  ], { encoding: 'utf8' });

  const dt = (Date.now() - t0) / 1000;
  console.log(`${m}: exit=${res.status}, time=${dt}s`);
  const statusLine = res.stdout.split('\n')[0] || 'no output';
  console.log(`${m}: ${statusLine}`);
}
