import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TARGET_DIR = process.argv[2] || "docs/ui-shots/r3-before";
const PORT = 9224;
const APP_BASE = "http://localhost:4173";

fs.mkdirSync(TARGET_DIR, { recursive: true });

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

const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844, mobile: true },
  { name: "768x1024", width: 768, height: 1024, mobile: false },
  { name: "1366x768", width: 1366, height: 768, mobile: false },
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];

const mockHighRiskResult = {
  id: "local",
  saved: false,
  domain: "internship",
  status: "HIGH_RISK",
  claimedOrg: "Apex Systems Labs",
  paymentAlert: true,
  reasons: [
    { checkKey: "payment_demand", effect: "high_risk", detail: "Legitimate internships do not ask candidates to pay refundable deposits." },
    { checkKey: "urgency_check", effect: "high_risk", detail: "Offers expiring within 2 hours are designed to prevent independent checks." }
  ],
  ruleScore: 78,
  summary: "High-risk indicators identified: upfront fee requirement and artificial 2-hour deadline pressure.",
  signals: [
    {
      ruleId: "PAY-001",
      category: "payment",
      severity: "critical",
      source: "rule",
      title: "Upfront security deposit demanded",
      whyItMatters: "Legitimate internships never require candidates to pay for training, security deposits, or ID cards.",
      evidenceQuote: "Pay ₹1,500 refundable security deposit within 2 hours to confirm your seat",
      hardDisqualifier: true
    },
    {
      ruleId: "URG-002",
      category: "urgency",
      severity: "high",
      source: "rule",
      title: "Artificial 2-hour deadline",
      whyItMatters: "Scammers create false panic so you pay before verifying the offer with mentors or official sources.",
      evidenceQuote: "within 2 hours to confirm your seat or offer will be cancelled"
    }
  ],
  checks: [
    { checkKey: "payment_demand", outcome: "fail", label: "No upfront fees required", confidence: "high" },
    { checkKey: "official_domain", outcome: "fail", label: "Sender official domain match", confidence: "high" },
    { checkKey: "registration_mca", outcome: "unknown", label: "MCA corporate registry lookup", confidence: "low" },
    { checkKey: "public_reviews", outcome: "pass", label: "Negative scam report check", confidence: "medium" },
    { checkKey: "official_listing", outcome: "unknown", label: "Official portal listing match", confidence: "low" },
    { checkKey: "recruiter_contact", outcome: "user_attested", label: "Recruiter identity verification", confidence: "medium" },
    { checkKey: "stipend_terms", outcome: "pass", label: "Reasonable stipend and conditions", confidence: "medium" },
    { checkKey: "urgency_check", outcome: "fail", label: "Absence of coercive deadline", confidence: "high" }
  ],
  unknowns: [
    { item: "Employer Corporate Registration", howToVerify: "Check the Ministry of Corporate Affairs (MCA) database for company CIN/LLPIN." },
    { item: "Official Job Listing", howToVerify: "Check company careers page directly or AICTE portal." }
  ],
  checklist: [
    { position: 1, label: "Never transfer any deposit or registration fee", portalKey: null, completed: true }
  ],
  nextSteps: {
    variant: "protect",
    banner: ["Do not pay any upfront deposit."],
    alreadyChecked: [
      { checkKey: "payment_demand", outcome: "fail", label: "Upfront security fee", detail: "Demanded ₹1,500 security deposit", source: "rule" },
      { checkKey: "urgency_check", outcome: "fail", label: "Artificial deadline", detail: "2-hour expiration window", source: "rule" }
    ],
    yourTurn: [
      { stepKey: "no-funds", title: "Do not transfer any money", whyItMatters: "Any request for upfront payment is a warning sign.", howToVerify: "Stop payment discussions immediately.", completed: false, priority: 1 },
      { stepKey: "verify-mca", title: "Verify the company through official MCA records", whyItMatters: "Ensure legal registration.", howToVerify: "Search mca.gov.in.", completed: false, priority: 2 }
    ],
    more: []
  },
  links: [],
  reportGuidance: {
    show: true,
    helpline: "1930",
    portalUrl: "https://cybercrime.gov.in",
    keepAsEvidence: [
      "WhatsApp chat screenshots",
      "UPI payment requests or QR codes",
      "Offer letter messages and sender numbers"
    ]
  },
  aiUsed: false,
  aiStatus: "not_requested",
  textOnlyConfidence: "high",
  durationMs: 38,
  disclaimer: "Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent.",
  createdAt: "2026-10-29T10:00:00.000Z"
};

async function run() {
  console.log(`Capturing Round 3 screenshots into ${TARGET_DIR}...`);

  // Start preview server
  const preview = spawn("npx.cmd", ["vite", "preview", "--port", "4173", "--strictPort"], {
    cwd: "client",
    stdio: "pipe",
    shell: true,
  });

  await waitForServer(APP_BASE);

  const profileDir = path.join(os.tmpdir(), "chrome-r3-profile");
  fs.mkdirSync(profileDir, { recursive: true });

  // Start Chrome with remote debugging
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
    await cdp.send("DOM.enable");
    await cdp.send("Runtime.enable");

    // Establish origin and inject mock data
    await cdp.send("Page.navigate", { url: `${APP_BASE}/analyze` });
    await sleep(400);
    await cdp.eval(`
      sessionStorage.setItem("jaanch_local_result", JSON.stringify(${JSON.stringify(mockHighRiskResult)}));
    `);

    const pages = [
      { key: "landing", path: "/" },
      { key: "analyze", path: "/analyze" },
      { key: "results-high-risk", path: "/results/local" },
    ];

    const themes = ["light", "dark"];

    for (const theme of themes) {
      for (const vp of VIEWPORTS) {
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile,
        });

        for (const pg of pages) {
          await cdp.send("Page.navigate", { url: `${APP_BASE}${pg.path}` });
          await sleep(500);

          // Apply theme class
          if (theme === "dark") {
            await cdp.eval(`document.documentElement.classList.add('dark')`);
          } else {
            await cdp.eval(`document.documentElement.classList.remove('dark')`);
          }
          await sleep(200);

          const { data } = await cdp.send("Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: false,
          });

          const filename = `${pg.key}-${vp.name}-${theme}.png`;
          const filepath = path.join(TARGET_DIR, filename);
          fs.writeFileSync(filepath, Buffer.from(data, "base64"));
          console.log(`  Saved: ${filename}`);
        }
      }
    }
  } finally {
    chrome.kill();
    preview.kill();
  }

  console.log("All Round 3 screenshots captured successfully.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
