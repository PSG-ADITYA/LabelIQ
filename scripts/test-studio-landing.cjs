const puppeteer = require('d:/SMRITARA/node_modules/puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5175/';

async function captureStudioLanding() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const studioBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Studio');
    if (studioBtn) studioBtn.click();
  });

  await new Promise(r => setTimeout(r, 800));

  const artifactDir = 'C:\\Users\\srira\\.gemini\\antigravity-ide\\brain\\de13211c-04c9-4cc3-8412-ecd62fd2ea16';
  const outPath = path.join(artifactDir, 'studio_homepage_screenshot.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('Studio landing screenshot saved to:', outPath);

  await browser.close();
}

captureStudioLanding();
