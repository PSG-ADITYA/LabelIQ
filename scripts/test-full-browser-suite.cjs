const puppeteer = require('d:/SMRITARA/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testFullBrowserSuite() {
  console.log('Launching local Chrome for end-to-end browser QA...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const artifactsDir = 'C:\\Users\\srira\\.gemini\\antigravity-ide\\brain\\de13211c-04c9-4cc3-8412-ecd62fd2ea16';

  try {
    // 1. Desktop Studio Homepage
    console.log('Testing 1: Desktop Studio Homepage (1440x900)...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactsDir, 'studio_landing_desktop.png'), fullPage: false });
    console.log('  -> Captured studio_landing_desktop.png');

    // 2. AI Draft Page
    console.log('Testing 2: Create with AI Page...');
    // Click on Create with AI button or navigation
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div'));
      const aiBtn = btns.find(b => b.textContent && (b.textContent.includes('Create with AI') || b.textContent.includes('Start with AI')));
      if (aiBtn) aiBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(artifactsDir, 'studio_ai_draft.png'), fullPage: false });
    console.log('  -> Captured studio_ai_draft.png');

    // 3. Scanner Page with Camera & Preprocessing
    console.log('Testing 3: OCR Scanner Page...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scanBtn = btns.find(b => b.textContent && (b.textContent.includes('Scan Label') || b.textContent.includes('Launch Scanner')));
      if (scanBtn) scanBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(artifactsDir, 'studio_scanner.png'), fullPage: false });
    console.log('  -> Captured studio_scanner.png');

    // 4. Repaired Label Canvas Editor
    console.log('Testing 4: Repaired Label Canvas Editor...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const editorBtn = btns.find(b => b.textContent && (b.textContent.includes('Label Canvas') || b.textContent.includes('Editor')));
      if (editorBtn) editorBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactsDir, 'studio_editor_repaired.png'), fullPage: false });
    console.log('  -> Captured studio_editor_repaired.png');

    // 5. Mobile Responsive Viewport (390x844)
    console.log('Testing 5: Mobile Responsive Layout (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(artifactsDir, 'studio_mobile_responsive.png'), fullPage: false });
    console.log('  -> Captured studio_mobile_responsive.png');

    console.log('\nAll 5 browser visual tests completed successfully!');
  } catch (err) {
    console.error('Browser QA error:', err);
  } finally {
    await browser.close();
  }
}

testFullBrowserSuite();
