const puppeteer = require('d:/SMRITARA/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5175/';

async function testBrowser() {
  console.log('--- Launching Chrome via Puppeteer-Core for LabelIQ Verification ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    // 1. Verify Homepage
    const title = await page.title();
    console.log('Page Title:', title);

    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasBrand = bodyText.includes('LabelIQ') || bodyText.includes('Food Label');
    console.log('Homepage contains Brand/LabelIQ:', hasBrand);

    const artifactDir = 'C:\\Users\\srira\\.gemini\\antigravity-ide\\brain\\de13211c-04c9-4cc3-8412-ecd62fd2ea16';
    const homeScreenshotPath = path.join(artifactDir, 'homepage_screenshot.png');
    await page.screenshot({ path: homeScreenshotPath, fullPage: false });
    console.log('Homepage screenshot saved to:', homeScreenshotPath);

    // 2. Check for Dashboard or navigate to Dashboard
    console.log('Looking for Dashboard navigation...');
    const navButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      return btns.map(b => ({ text: b.innerText.trim(), tag: b.tagName }));
    });
    console.log('Available navigation elements:', navButtons.filter(b => b.text.length > 0).slice(0, 15));

    // Click Dashboard button or tab if present
    const clickedDashboard = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, a, nav *'));
      const dashItem = items.find(el => el.innerText && el.innerText.toLowerCase().includes('dashboard'));
      if (dashItem) {
        dashItem.click();
        return true;
      }
      return false;
    });

    console.log('Clicked Dashboard:', clickedDashboard);
    await new Promise(r => setTimeout(r, 1200));

    const dashText = await page.evaluate(() => document.body.innerText);
    const hasBatchStats = dashText.includes('Batches') || dashText.includes('Products') || dashText.includes('Compliance');
    console.log('Dashboard contains expected sections:', hasBatchStats);

    const dashScreenshotPath = path.join(artifactDir, 'dashboard_screenshot.png');
    await page.screenshot({ path: dashScreenshotPath, fullPage: false });
    console.log('Dashboard screenshot saved to:', dashScreenshotPath);

    // 3. Test Visual Editor tab
    const clickedEditor = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, a, nav *'));
      const editorItem = items.find(el => el.innerText && el.innerText.toLowerCase().includes('editor'));
      if (editorItem) {
        editorItem.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Editor:', clickedEditor);
    await new Promise(r => setTimeout(r, 1200));

    const editorScreenshotPath = path.join(artifactDir, 'editor_screenshot.png');
    await page.screenshot({ path: editorScreenshotPath, fullPage: false });
    console.log('Editor screenshot saved to:', editorScreenshotPath);

    console.log('Console errors encountered:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }

  } catch (err) {
    console.error('Browser Test Error:', err);
  } finally {
    await browser.close();
  }
}

testBrowser();
