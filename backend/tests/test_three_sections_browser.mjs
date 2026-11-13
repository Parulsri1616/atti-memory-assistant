import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ARTIFACT_DIR = '/Users/mahekaghija/.gemini/antigravity-ide/brain/a17bdf9b-e3ff-4bd6-94b4-20788686e8d6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9225;

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
    '--user-data-dir=/tmp/chrome_atti_guardian_full_test'
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
      const filepath = path.join(ARTIFACT_DIR, filename);
      fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${filepath}`);
      return filepath;
    }

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('2. Navigating to http://localhost:5173');
    await send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2000);

    // 1. Authenticate as Demo Family Member
    console.log('3. Authenticating via #btn-demo-family');
    const clickedDemo = await evaluate(`
      (() => {
        const btn = document.getElementById('btn-demo-family');
        if (btn) {
          btn.click();
          return true;
        }
        const btns = Array.from(document.querySelectorAll('button'));
        const fBtn = btns.find(b => b.textContent && b.textContent.includes('Continue as Demo Family Member'));
        if (fBtn) {
          fBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Clicked demo family member:', clickedDemo);
    await sleep(3500);

    // Verify Section 1: Overview
    console.log('4. Verifying Section 1: Overview with real data');
    const overviewData = await evaluate(`
      (() => {
        const header = document.querySelector('h1')?.textContent || '';
        const patientName = document.querySelector('h2')?.textContent || '';
        const navButtons = Array.from(document.querySelectorAll('nav button')).map(b => b.textContent?.trim());
        const totalActs = document.body.innerText.includes('Total Activities');
        const scheduledActs = document.body.innerText.includes('Scheduled Activities');
        const quickActions = document.body.innerText.includes('Quick Actions');
        const medsSummary = document.body.innerText.includes('Medication Reminders');
        const apptsSummary = document.body.innerText.includes("Doctor's Appointments");
        return { header, patientName, navButtons, totalActs, scheduledActs, quickActions, medsSummary, apptsSummary };
      })()
    `);
    console.log('Overview verified data:', overviewData);
    await captureScreenshot('verified_section1_overview.png');

    // Test Quick Action: View Patient Location -> jumps to Section 3: Safety & Alerts
    console.log('5. Testing Quick Action navigation to Safety');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const locBtn = btns.find(b => b.textContent && b.textContent.includes('View Patient Location'));
        if (locBtn) locBtn.click();
      })()
    `);
    await sleep(1500);
    await captureScreenshot('verified_quick_action_to_safety.png');

    // Navigate to Section 2: Care Management via Bottom Navbar
    console.log('6. Navigating to Section 2: Care Management');
    await evaluate(`
      (() => {
        const navBtns = Array.from(document.querySelectorAll('nav button'));
        const careBtn = navBtns.find(b => b.textContent && b.textContent.includes('Care Management'));
        if (careBtn) careBtn.click();
      })()
    `);
    await sleep(1500);

    const careData = await evaluate(`
      (() => {
        const subtabs = Array.from(document.querySelectorAll('button')).filter(b => 
          b.textContent && (b.textContent.includes('Medication Management') || b.textContent.includes("Doctor's Appointments") || b.textContent.includes('Daily Activities'))
        ).map(b => b.textContent.trim());
        const medCards = Array.from(document.querySelectorAll('h4')).map(h => h.textContent);
        return { subtabs, medCards };
      })()
    `);
    console.log('Care Management Section data:', careData);
    await captureScreenshot('verified_section2_care_medications.png');

    // Switch to Doctor's Appointments subtab
    console.log('7. Switching to Subtab B: Doctor\'s Appointments');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const apptBtn = btns.find(b => b.textContent && b.textContent.includes("Doctor's Appointments"));
        if (apptBtn) apptBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('verified_section2_care_appointments.png');

    // Switch to Daily Activities subtab
    console.log('8. Switching to Subtab C: Daily Activities & Routines');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const actBtn = btns.find(b => b.textContent && b.textContent.includes('Daily Activities & Routines'));
        if (actBtn) actBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('verified_section2_care_activities.png');

    // Navigate to Section 3: Safety & Alerts via Bottom Navbar
    console.log('9. Navigating to Section 3: Safety & Alerts');
    await evaluate(`
      (() => {
        const navBtns = Array.from(document.querySelectorAll('nav button'));
        const safetyBtn = navBtns.find(b => b.textContent && b.textContent.includes('Safety & Alerts'));
        if (safetyBtn) safetyBtn.click();
      })()
    `);
    await sleep(1500);

    const safetyData = await evaluate(`
      (() => {
        const subtabs = Array.from(document.querySelectorAll('button')).filter(b => 
          b.textContent && (b.textContent.includes('Location & Safe Zones') || b.textContent.includes('SOS & Emergency') || b.textContent.includes('Emergency QR') || b.textContent.includes('Notifications & Alerts'))
        ).map(b => b.textContent.trim());
        const hasGeofence = document.body.innerText.includes('Safe Zone Geofence');
        return { subtabs, hasGeofence };
      })()
    `);
    console.log('Safety & Alerts Section data:', safetyData);
    await captureScreenshot('verified_section3_safety_location.png');

    // Switch to SOS & Emergency subtab
    console.log('10. Switching to Subtab B: SOS & Emergency');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const sosBtn = btns.find(b => b.textContent && b.textContent.includes('SOS & Emergency'));
        if (sosBtn) sosBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('verified_section3_safety_sos.png');

    // Switch to Emergency QR subtab
    console.log('11. Switching to Subtab C: Emergency QR');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const qrBtn = btns.find(b => b.textContent && b.textContent.includes('Emergency QR'));
        if (qrBtn) qrBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('verified_section3_safety_qr.png');

    // Switch to Notifications & Alerts subtab
    console.log('12. Switching to Subtab D: Notifications & Alerts');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const notifBtn = btns.find(b => b.textContent && b.textContent.includes('Notifications & Alerts'));
        if (notifBtn) notifBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('verified_section3_safety_notifications.png');

    // Test Mobile viewport (390 x 844)
    console.log('13. Testing Mobile Responsive View (iPhone 390x844)');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    // Navigate back to overview
    await evaluate(`
      (() => {
        const navBtns = Array.from(document.querySelectorAll('nav button'));
        const ovBtn = navBtns.find(b => b.textContent && b.textContent.includes('Overview'));
        if (ovBtn) ovBtn.click();
      })()
    `);
    await sleep(1000);
    await captureScreenshot('verified_mobile_3sections_navbar.png');

    console.log('ALL VERIFICATION WORKFLOWS AND SCREENSHOTS COMPLETED SUCCESSFULLY!');
  } finally {
    chromeProc.kill();
  }
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
