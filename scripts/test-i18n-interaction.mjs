import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9224;
const APP_BASE = "http://localhost:4173";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {}
    await sleep(250);
  }
  throw new Error(`Server at ${url} did not become available in ${timeoutMs}ms`);
}

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: "PUT" });
      if (res.ok) {
        const json = await res.json();
        return json.webSocketDebuggerUrl;
      }
    } catch {}
    await sleep(200);
  }
  throw new Error("Could not connect to Chrome debugging port");
}

class CDPClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }
}

async function run() {
  console.log("Starting i18n interaction verification against preview server...");

  const preview = spawn("npx.cmd", ["vite", "preview", "--port", "4173", "--strictPort"], {
    cwd: "client",
    stdio: "pipe",
    shell: true,
  });

  await waitForServer(APP_BASE);

  const profileDir = path.join(os.tmpdir(), "chrome-i18n-profile");
  fs.mkdirSync(profileDir, { recursive: true });

  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-allow-origins=*",
      "--disable-web-security",
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise((res) => (ws.onopen = res));
    const cdp = new CDPClient(ws);

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send("Page.navigate", { url: `${APP_BASE}/` });
    await sleep(600);

    // Initial English State Check
    console.log("Step 1: Check default English state...");
    const enState = await cdp.eval(`
      (() => {
        const lang = document.documentElement.lang;
        const h1 = document.querySelector('h1')?.innerText.replace(/\\s+/g, ' ').trim();
        const navSub = document.querySelector('header span.text-muted-subtle')?.innerText.trim();
        return { lang, h1, navSub };
      })()
    `);
    console.log("Default EN state:", enState);
    if (enState.lang !== "en" || !enState.h1.includes("Know it's real")) {
      throw new Error("Default English state mismatch: " + JSON.stringify(enState));
    }

    // Click Hindi button
    console.log("Step 2: Switching to Hindi (हिंदी)...");
    await cdp.eval(`
      (() => {
        const hiBtn = Array.from(document.querySelectorAll('header button')).find(b => b.innerText.trim() === 'हिंदी');
        if (hiBtn) hiBtn.click();
      })()
    `);
    await sleep(400);

    const hiState = await cdp.eval(`
      (() => {
        const lang = document.documentElement.lang;
        const h1 = document.querySelector('h1')?.innerText.replace(/\\s+/g, ' ').trim();
        const portalsTitle = document.querySelector('h2.font-serif')?.innerText.replace(/\\s+/g, ' ').trim();
        const step1Title = document.querySelector('#how-it-works h3')?.innerText.trim();
        return { lang, h1, portalsTitle, step1Title };
      })()
    `);
    console.log("Hindi state:", hiState);
    if (hiState.lang !== "hi" || !hiState.h1.includes("सच्चाई जानें")) {
      throw new Error("Hindi switch failed: " + JSON.stringify(hiState));
    }

    // Click Kannada button
    console.log("Step 3: Switching to Kannada (ಕನ್ನಡ)...");
    await cdp.eval(`
      (() => {
        const knBtn = Array.from(document.querySelectorAll('header button')).find(b => b.innerText.trim() === 'ಕನ್ನಡ');
        if (knBtn) knBtn.click();
      })()
    `);
    await sleep(400);

    const knState = await cdp.eval(`
      (() => {
        const lang = document.documentElement.lang;
        const h1 = document.querySelector('h1')?.innerText.replace(/\\s+/g, ' ').trim();
        const step1Title = document.querySelector('#how-it-works h3')?.innerText.trim();
        return { lang, h1, step1Title };
      })()
    `);
    console.log("Kannada state:", knState);
    if (knState.lang !== "kn" || !knState.h1.includes("ನಿಜವೆಂದು ತಿಳಿಯಿರಿ")) {
      throw new Error("Kannada switch failed: " + JSON.stringify(knState));
    }

    // Switch back to English via footer
    console.log("Step 4: Switching back to English via Footer button...");
    await cdp.eval(`
      (() => {
        const enFooterBtn = Array.from(document.querySelectorAll('footer button')).find(b => b.innerText.trim() === 'English');
        if (enFooterBtn) enFooterBtn.click();
      })()
    `);
    await sleep(400);

    const revertedEnState = await cdp.eval(`
      (() => {
        const lang = document.documentElement.lang;
        const h1 = document.querySelector('h1')?.innerText.replace(/\\s+/g, ' ').trim();
        return { lang, h1 };
      })()
    `);
    console.log("Reverted EN state:", revertedEnState);
    if (revertedEnState.lang !== "en" || !revertedEnState.h1.includes("Know it's real")) {
      throw new Error("Revert to English failed: " + JSON.stringify(revertedEnState));
    }

    console.log("\n>>> ALL i18N INTERACTION TESTS PASSED SUCCESSFULLY! <<<");
  } finally {
    try {
      chrome.kill("SIGKILL");
    } catch {}
    try {
      preview.kill("SIGKILL");
    } catch {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

