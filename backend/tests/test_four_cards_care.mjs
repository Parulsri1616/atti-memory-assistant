import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ARTIFACT_DIR = '/Users/mahekaghija/.gemini/antigravity-ide/brain/a17bdf9b-e3ff-4bd6-94b4-20788686e8d6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9227;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('1. Starting headless Chrome on port', PORT);
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,960',
    '--user-data-dir=/tmp/chrome_atti_four_cards_test_2'
  ], { stdio: 'ignore' });

  await sleep(1500);

  try {
    const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let idCounter = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = idCounter++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result?.value;
    }

    async function captureScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);
      return outPath;
    }

    await send('Page.enable');
    await send('DOM.enable');

    console.log('2. Navigating to http://localhost:5173');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    // Auto-login to caregiver dashboard
    console.log('3. Logging into Guardian Dashboard');
    await evaluate(`
      (async () => {
        const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="email" i]');
        const passInput = document.querySelector('input[type="password"]');
        if (emailInput && passInput) {
          emailInput.value = 'ananya@example.com';
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          passInput.value = 'password123';
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
          const submitBtn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In') || b.textContent.includes('Login'));
          if (submitBtn) submitBtn.click();
        }
      })()
    `);
    await sleep(2500);

    // Navigate to Care Management tab at bottom navbar
    console.log('4. Navigating to Care Management section');
    const clickedCare = await evaluate(`
      (() => {
        const careBtn = document.querySelector('button[aria-label*="Care Management" i]') ||
          Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Care Management'));
        if (careBtn) {
          careBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Clicked care button:', clickedCare);
    await sleep(2000);

    // Capture initial Medications card view
    await captureScreenshot('care_hero_4cards_medications.png');

    // Click Card 2: Doctor Visits
    console.log('5. Clicking Doctor Visits card');
    await evaluate(`
      (() => {
        const docBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Doctor Visits'));
        if (docBtn) docBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('care_hero_4cards_doctor_visits.png');

    // Click Card 3: Daily Routines
    console.log('6. Clicking Daily Routines card');
    await evaluate(`
      (() => {
        const actBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Daily Routines'));
        if (actBtn) actBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('care_hero_4cards_daily_routines.png');

    // Click Card 4: Refills & Stock
    console.log('7. Clicking Refills & Stock card');
    await evaluate(`
      (() => {
        const refBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Refills & Stock'));
        if (refBtn) refBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('care_hero_4cards_refills_stock.png');

    console.log('All screenshots captured successfully!');
    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chromeProc.kill();
  }
}

run();
