import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TARGET_DIR = process.argv[2] || "docs/ui-shots/before";
const PORT = 9222;
const APP_BASE = "http://localhost:4173";

fs.mkdirSync(TARGET_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
}

const mockBaseResult = {
  id: null,
  saved: false,
  domain: "internship",
  summary: "Comprehensive student verification analysis",
  signals: [
    {
      ruleId: "PAY-001",
      category: "payment",
      severity: "critical",
      source: "rule",
      title: "Upfront security deposit demanded",
      whyItMatters: "Legitimate internships do not ask candidates to pay security deposits.",
      evidenceQuote: "Pay ₹999 refundable security deposit within 2 hours",
      hardDisqualifier: true,
    },
    {
      ruleId: "URG-002",
      category: "urgency",
      severity: "high",
      source: "rule",
      title: "Extreme urgency pressure",
      whyItMatters: "Artificial deadlines prevent candidates from performing due diligence.",
      evidenceQuote: "within two hours to confirm your position",
    },
  ],
  unknowns: [
    { item: "Employer Identity", howToVerify: "Check the registered company portal and MCA records." },
  ],
  checklist: [
    { id: "1", title: "Verify company registration on MCA portal", completed: false, category: "identity" },
    { id: "2", title: "Never transfer any deposit or registration fee", completed: true, category: "financial" },
  ],
  links: [{ originalUrl: "https://example-careers.xyz/verify", domain: "example-careers.xyz", status: "SUSPICIOUS" }],
  checks: [
    { checkKey: "payment_demand", outcome: "fail", label: "No upfront fees required", confidence: "high" },
    { checkKey: "official_domain", outcome: "fail", label: "Sender official domain match", confidence: "high" },
    { checkKey: "registration_mca", outcome: "unknown", label: "MCA corporate registry lookup", confidence: "low" },
    { checkKey: "public_reviews", outcome: "pass", label: "Negative scam report check", confidence: "medium" },
    { checkKey: "official_listing", outcome: "unknown", label: "Official portal listing match", confidence: "low" },
    { checkKey: "recruiter_contact", outcome: "user_attested", label: "Recruiter identity verification", confidence: "medium" },
    { checkKey: "stipend_terms", outcome: "pass", label: "Reasonable stipend and conditions", confidence: "medium" },
    { checkKey: "urgency_check", outcome: "fail", label: "Absence of coercive deadline", confidence: "high" },
  ],
  reportGuidance: {
    show: true,
    helpline: "1930",
    portalUrl: "https://cybercrime.gov.in",
    keepAsEvidence: ["WhatsApp chat screenshots", "UPI reference ID", "Offer letter PDF"],
  },
  aiUsed: false,
  aiStatus: "not_requested",
  textOnlyConfidence: "high",
  durationMs: 78,
  disclaimer: "Jaanch provides automated risk indicators based on student safety heuristics and does not constitute formal legal counsel.",
  createdAt: new Date().toISOString(),
};

const mockHighRisk = {
  ...mockBaseResult,
  status: "HIGH_RISK",
  ruleScore: 82,
  paymentAlert: true,
  reasons: [
    "Upfront security deposit requested (₹999)",
    "Unverified personal email and lookalike communication channel",
    "Artificial 2-hour confirmation urgency window",
  ],
  patternInsight: {
    patternType: "security_deposit_scam",
    title: "Security Deposit Advance Fee Scam",
    description: "Fraudulent recruiters claim a refundable deposit is required for equipment or ID card issuance, then cease communication.",
    frequencyNote: "Observed in 42% of reported student WhatsApp internship scams.",
    recommendedAction: "Cease all payment communication immediately.",
  },
};

const mockNeedsReview = {
  ...mockBaseResult,
  status: "NEEDS_REVIEW",
  ruleScore: 35,
  paymentAlert: false,
  signals: [
    {
      ruleId: "VAG-001",
      category: "completeness",
      severity: "medium",
      source: "rule",
      title: "Vague job responsibilities",
      whyItMatters: "Legitimate listings describe specific tasks, tools, and prerequisites.",
      evidenceQuote: "Work from home simple tasks high stipend",
    },
  ],
  reasons: [
    "Missing verifiable corporate domain or official careers listing",
    "Stipend offered without defined technical responsibilities",
  ],
  patternInsight: {
    patternType: "unverified_outreach",
    title: "Unverified Third-Party Outreach",
    description: "The sender may be an informal intermediary or small startup lacking a public web presence.",
    frequencyNote: "Requires manual verification against official university or corporate portals.",
    recommendedAction: "Request formal listing link and corporate email.",
  },
};

const mockLikelyGenuine = {
  ...mockBaseResult,
  status: "LIKELY_GENUINE",
  ruleScore: 8,
  paymentAlert: false,
  signals: [],
  reasons: [
    "Official corporate domain verified and authenticated",
    "Structured selection process with technical interview",
    "Zero financial demands or sensitive credential requests",
  ],
  patternInsight: null,
};

const VIEWPORTS = [
  { name: "375x667", width: 375, height: 667, mobile: true },
  { name: "390x844", width: 390, height: 844, mobile: true },
  { name: "768x1024", width: 768, height: 1024, mobile: true },
  { name: "1280x800", width: 1280, height: 800, mobile: false },
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];

async function main() {
  console.log(`Starting Chrome for screenshots into ${TARGET_DIR}...`);
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    `--remote-debugging-port=${PORT}`,
    "--remote-allow-origins=*",
  ]);

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise((res) => (ws.onopen = res));
    const cdp = new CDPClient(ws);

    await cdp.send("Page.enable");
    await cdp.send("DOM.enable");

    async function capture(pageName, url, setupFn) {
      for (const vp of VIEWPORTS) {
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile,
        });

        await cdp.send("Page.navigate", { url: `${APP_BASE}${url}` });
        await sleep(350);

        if (setupFn) {
          await cdp.send("Runtime.evaluate", {
            expression: setupFn,
            awaitPromise: true,
          });
          await sleep(200);
        }

        const { data } = await cdp.send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: false,
        });

        const outPath = path.join(TARGET_DIR, `${pageName}-${vp.name}.png`);
        fs.writeFileSync(outPath, Buffer.from(data, "base64"));
        console.log(`  Saved: ${outPath}`);
      }
    }

    // 1. Landing
    await capture("landing", "/");

    // 2. Analyze Empty
    await capture("analyze-empty", "/analyze");

    // 3. Analyze Filled
    await capture("analyze-filled", "/analyze", `
      (() => {
        const el = document.getElementById("input-message-text");
        if (el) {
          el.value = "Congratulations! You have been selected for an internship. Pay ₹999 as a refundable security deposit within two hours.";
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);

    // 4. Results High Risk
    await capture("results-high-risk", "/results/local", `
      sessionStorage.setItem("jaanch_local_result", ${JSON.stringify(JSON.stringify(mockHighRisk))});
      window.location.reload();
    `);

    // 5. Results Needs Review
    await capture("results-needs-review", "/results/local", `
      sessionStorage.setItem("jaanch_local_result", ${JSON.stringify(JSON.stringify(mockNeedsReview))});
      window.location.reload();
    `);

    // 6. Results Likely Genuine
    await capture("results-likely-genuine", "/results/local", `
      sessionStorage.setItem("jaanch_local_result", ${JSON.stringify(JSON.stringify(mockLikelyGenuine))});
      window.location.reload();
    `);

    // 7. History
    await capture("history", "/history");

    // 8. Resources
    await capture("resources", "/resources");

    // 9. About
    await capture("about", "/about");

    // 10. Login
    await capture("login", "/login");

    ws.close();
    console.log("All screenshots captured successfully.");
  } finally {
    chromeProc.kill();
  }
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
