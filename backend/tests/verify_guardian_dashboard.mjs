import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const SCRATCH_DIR = '/Users/mahekaghija/.gemini/antigravity-ide/brain/a17bdf9b-e3ff-4bd6-94b4-20788686e8d6/scratch';
if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9224;

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
    '--window-size=1200,900',
    '--user-data-dir=/tmp/chrome_atti_guardian_test'
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
      return res?.result?.value;
    }

    async function captureScreenshot(filename) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const filepath = path.join(SCRATCH_DIR, filename);
      fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${filepath}`);
      return filepath;
    }

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('2. Navigating to http://localhost:5173');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    // 1. Check if we need to click "Continue as Demo Family Member"
    console.log('3. Authenticating as Demo Family Member (Ananya Sharma)');
    const clickedDemo = await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const familyBtn = btns.find(b => b.textContent && b.textContent.includes('Continue as Demo Family Member'));
        if (familyBtn) {
          familyBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Clicked demo family member:', clickedDemo);
    await sleep(3000);

    // 2. Section 1 Overview
    console.log('4. Capturing Section 1: Overview');
    const overviewInfo = await evaluate(`
      (() => {
        return {
          header: document.querySelector('h1')?.textContent || '',
          patientName: document.querySelector('h2')?.textContent || '',
          hasSection1: Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('SECTION 1: OVERVIEW')),
          hasSection2: Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('SECTION 2: PATIENT & CARE')),
          hasSection3: Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('SECTION 3: MEMORIES')),
          hasSection4: Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('SECTION 4: SAFETY & SUPPORT')),
          safetyBadge: document.body.innerText.includes('Safe &') || document.body.innerText.includes('Safe Zone'),
          medicationCards: Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Telmisartan')),
          activitySummary: Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes("Today's Activity Summary"))
        };
      })()
    `);
    console.log('Overview info evaluated:', overviewInfo);
    await captureScreenshot('guardian_section1_overview.png');

    // 3. Switch to Section 2: Patient & Care
    console.log('5. Navigating to Section 2: Patient & Care');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('SECTION 2: PATIENT & CARE'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);
    await captureScreenshot('guardian_section2_patient_profile.png');

    // Click Medications subtab
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('B. Medication Management'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_section2_medications.png');

    // Click Appointments subtab
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('C. Doctor Appointments'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_section2_appointments.png');

    // Click Activities subtab
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('D. Daily Activities & Routines'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_section2_activities.png');

    // 4. Switch to Section 3: Memories
    console.log('6. Navigating to Section 3: Memories');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('SECTION 3: MEMORIES'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);
    await captureScreenshot('guardian_section3_family_friends.png');

    // Click Familiar Places subtab
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('C. Familiar Places'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_section3_places.png');

    // Click Forgotten Facts subtab
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('D. Forgotten Facts & FAQs'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_section3_facts.png');

    // 5. Switch to Section 4: Safety & Support
    console.log('7. Navigating to Section 4: Safety & Support');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('SECTION 4: SAFETY & SUPPORT'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);
    await captureScreenshot('guardian_section4_location_safezone.png');

    // Click Emergency QR subtab
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('C. Emergency QR'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_section4_emergency_qr.png');

    // Click Care Team subtab
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('D. Family & Care Team'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_section4_care_team.png');

    // 6. Test Notifications Modal
    console.log('8. Opening Notifications Modal');
    await evaluate(`
      (() => {
        const bellBtn = document.querySelector('button[title="Care Notifications"]');
        if (bellBtn) bellBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('guardian_notifications_modal.png');

    // Close notifications modal
    await evaluate(`
      (() => {
        const closeBtn = document.querySelector('.fixed button');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // 7. Test Patient View Preview (Strict Preservation Check)
    console.log('9. Switching to Patient View preview to verify strict preservation');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('Patient View'));
        if (btn) btn.click();
      })()
    `);
    await sleep(2500);
    await captureScreenshot('patient_view_preserved.png');

    const patientPreserved = await evaluate(`
      (() => {
        return {
          title: document.title,
          hasAskButton: Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Tap to Speak') || el.textContent?.includes('Ask Me Anything') || el.textContent?.includes('Listening')),
          hasActivityBox: Array.from(document.querySelectorAll('*')).some(el => el.textContent?.includes('Upcoming Activity') || el.textContent?.includes('Current Location') || el.textContent?.includes('Green Park'))
        };
      })()
    `);
    console.log('Patient view preservation verification:', patientPreserved);

    console.log('Verification finished successfully!');
    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
