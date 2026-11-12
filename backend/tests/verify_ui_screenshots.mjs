import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const SCRATCH_DIR = '/Users/mahekaghija/.gemini/antigravity-ide/brain/a17bdf9b-e3ff-4bd6-94b4-20788686e8d6/scratch';
if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9223;

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
    '--window-size=440,920',
    '--user-data-dir=/tmp/chrome_atti_test'
  ], { stdio: 'ignore' });

  // Wait for Chrome to bind port
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
      return res.result?.value;
    }

    async function screenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(SCRATCH_DIR, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    }

    // Enable Page and DOM
    await send('Page.enable');
    await send('DOM.enable');

    // TEST 1: Welcome Screen
    console.log('Navigating to http://localhost:5173...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2000);

    // Verify Welcome buttons exist
    const hasDemoPatientBtn = await evaluate(`document.body.innerText.includes('Continue as Demo Patient')`);
    const hasDemoFamilyBtn = await evaluate(`document.body.innerText.includes('Continue as Demo Family Member')`);
    console.log('Welcome Screen Verification:', { hasDemoPatientBtn, hasDemoFamilyBtn });
    await screenshot('demo_screen_01_welcome.png');

    // TEST 2: Click 'Continue as Demo Patient'
    console.log('Clicking Continue as Demo Patient...');
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const pBtn = btns.find(b => b.innerText.includes('Continue as Demo Patient'));
      if (pBtn) pBtn.click();
    `);
    await sleep(2500);

    const hasMeeraHome = await evaluate(`document.body.innerText.includes('Meera')`);
    console.log('Patient Dashboard loaded:', { hasMeeraHome });
    await screenshot('demo_screen_02_patient_home.png');

    // TEST 3: Switch to Help Tab
    console.log('Clicking Help tab...');
    await evaluate(`
      const navBtns = Array.from(document.querySelectorAll('nav button, div[role="tablist"] button, button'));
      const helpBtn = navBtns.find(b => b.innerText.includes('Help') || b.querySelector('svg'));
      // Find the specific help button by looking for Help label
      const explicitHelp = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Help');
      if (explicitHelp) explicitHelp.click();
    `);
    await sleep(1500);
    const hasHelpQR = await evaluate(`document.body.innerText.includes('Patient Emergency Assistance QR Code')`);
    console.log('Help Section with Emergency QR:', { hasHelpQR });
    await screenshot('demo_screen_03_patient_help_qr.png');

    // TEST 4: Emergency Assistance Public View
    console.log('Navigating to emergency assist URL...');
    await send('Page.navigate', { url: 'http://localhost:5173/?view=assist&patient_id=1' });
    await sleep(2000);
    const hasEmergencyDetails = await evaluate(`
      document.body.innerText.includes('Meera Sharma') &&
      document.body.innerText.includes('Ananya Sharma') &&
      document.body.innerText.includes('Dr. Arjun Mehta')
    `);
    console.log('Public Emergency Assistance view:', { hasEmergencyDetails });
    await screenshot('demo_screen_04_emergency_assist.png');

    // TEST 5: Family Member Login & Caregiver Dashboard
    console.log('Navigating back to main app to test Family Member login...');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(1500);

    // If currently logged in, click Sign Out or clear cookie
    await evaluate(`
      const signOutBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign Out'));
      if (signOutBtn) signOutBtn.click();
    `);
    await sleep(1500);

    console.log('Clicking Continue as Demo Family Member...');
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const fBtn = btns.find(b => b.innerText.includes('Continue as Demo Family Member'));
      if (fBtn) fBtn.click();
    `);
    await sleep(2500);

    // Switch to desktop frame to see full caregiver portal
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1200,
      height: 850,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(1000);

    const hasCaregiverPortal = await evaluate(`
      document.body.innerText.includes('Caregiver Portal') &&
      document.body.innerText.includes('Ananya Sharma') &&
      document.body.innerText.includes('Meera Sharma')
    `);
    console.log('Caregiver Dashboard loaded:', { hasCaregiverPortal });
    await screenshot('demo_screen_05_caregiver_dashboard.png');

    // Close WS
    ws.close();
    console.log('ALL VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    chromeProc.kill();
  }
}

run().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
