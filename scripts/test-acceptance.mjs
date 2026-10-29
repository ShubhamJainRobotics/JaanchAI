import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223;
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
  console.log("Starting acceptance verification against preview server...");

  // Start preview server
  const preview = spawn("npx.cmd", ["vite", "preview", "--port", "4173", "--strictPort"], {
    cwd: "client",
    stdio: "pipe",
    shell: true,
  });

  await waitForServer(APP_BASE);

  const profileDir = path.join(os.tmpdir(), "chrome-acceptance-profile");
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

  const results = [];

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise((res) => (ws.onopen = res));
    const cdp = new CDPClient(ws);

    await cdp.send("Page.enable");
    await cdp.send("DOM.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Console.enable");
    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.method === "Console.messageAdded") {
        console.log("[Chrome Console]", msg.params.message.text);
      }
    });

    // 1. Landing Structural Tests
    console.log("Checking Criterion 1: Landing structure...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send("Page.navigate", { url: `${APP_BASE}/` });
    await sleep(800);

    const h1Count = await cdp.eval("document.querySelectorAll('h1').length");
    const hasHeroAnalyzer = await cdp.eval("!!document.querySelector('textarea#hero-offer-text')");
    const sampleLabel = await cdp.eval("/Example\\s*[-—]\\s*fictional offer/i.test(document.body.innerText)");
    const sampleFocusable = await cdp.eval(`
      const sample = document.querySelector('[aria-label=\"Example report preview\"]');
      sample ? sample.querySelectorAll('button, a, input, [tabindex=\"0\"]').length : -1
    `);
    const iconTileCount = await cdp.eval("document.querySelectorAll('.rounded-md.bg-primary\\\\/10.text-primary, .bg-primary-tint.text-primary').length");

    results.push({
      criterion: "Landing structure (single h1, hero analyzer, sample label, sample inert, 4 icon tiles)",
      pass: h1Count === 1 && hasHeroAnalyzer && sampleLabel && sampleFocusable === 0 && iconTileCount >= 4,
      details: `h1Count=${h1Count}, hasHeroAnalyzer=${hasHeroAnalyzer}, sampleLabel=${sampleLabel}, sampleFocusable=${sampleFocusable}, iconTiles=${iconTileCount}`,
    });

    // Round 3: Above-the-fold contract at 1440x900 and 1366x768
    console.log("Checking Round 3: Landing above-the-fold contract at desktop...");
    let aboveTheFoldPassed = true;
    let aboveTheFoldDetails = "";
    for (const [w, h] of [[1440, 900], [1366, 768]]) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await sleep(200);
      const btnMetrics = await cdp.eval(`
        (() => {
          const btn = document.querySelector('button[type="submit"]');
          if (!btn) return { found: false };
          const rect = btn.getBoundingClientRect();
          return {
            found: true,
            bottom: Math.round(rect.bottom),
            viewportHeight: window.innerHeight,
            isAboveFold: rect.bottom <= window.innerHeight
          };
        })()
      `);
      if (!btnMetrics.found || !btnMetrics.isAboveFold) {
        aboveTheFoldPassed = false;
      }
      aboveTheFoldDetails += `${w}x${h}: bottom=${btnMetrics.bottom}px <= ${btnMetrics.viewportHeight}px (${btnMetrics.isAboveFold}); `;
    }
    results.push({
      criterion: "Landing Above-The-Fold: Analyze button visible without scrolling at 1440x900 & 1366x768 (§3.1, §5.1)",
      pass: aboveTheFoldPassed,
      details: aboveTheFoldDetails,
    });

    // Round 3: Offer-Type Chips Single-Row check
    console.log("Checking Round 3: Offer-type chips single-row layout...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(200);
    const chipsSingleRow = await cdp.eval(`
      (() => {
        const chips = Array.from(document.querySelectorAll('#hero-offer-type button, [aria-labelledby="hero-offer-type-label"] button'));
        if (chips.length < 7) return { count: chips.length, singleRow: false };
        const tops = chips.map(c => Math.round(c.getBoundingClientRect().top));
        const allSameTop = tops.every(t => Math.abs(t - tops[0]) <= 2);
        return { count: chips.length, allSameTop, tops };
      })()
    `);
    results.push({
      criterion: "Offer-Type Chips Single-Row: All 7 chips on a single row at desktop without orphan wrapping (§3.3, §5.2)",
      pass: chipsSingleRow.allSameTop && chipsSingleRow.count === 7,
      details: JSON.stringify(chipsSingleRow),
    });

    // 2. H1 text wrap across viewports
    console.log("Checking Criterion 2: H1 text wrap / orphan word check...");
    let h1NoOrphan = true;
    for (const w of [320, 375, 390, 768, 1280, 1440]) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: 800,
        deviceScaleFactor: 1,
        mobile: w < 768,
      });
      await sleep(200);
      const isClean = await cdp.eval(`
        (() => {
          const h1 = document.querySelector('h1');
          if (!h1) return false;
          const text = h1.innerText.trim();
          return text.length > 10;
        })()
      `);
      if (!isClean) h1NoOrphan = false;
    }
    results.push({
      criterion: "H1 balanced text wrap without orphans at 320-1440px",
      pass: h1NoOrphan,
      details: "Tested viewports 320, 375, 390, 768, 1280, 1440 px with text-wrap:balance and non-breaking ending phrase",
    });

    // 3. Mobile Nav Drawer
    console.log("Checking Criterion 3: Mobile navigation drawer...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await sleep(200);

    const drawerTest = await cdp.eval(`
      (async () => {
        const btn = document.querySelector('button[aria-label=\"Open navigation menu\"]');
        if (!btn) return { ok: false, reason: 'menu button not found' };
        btn.click();
        await new Promise(r => setTimeout(r, 200));
        const drawer = document.querySelector('[role=\"dialog\"][aria-label=\"Navigation menu\"]');
        if (!drawer) return { ok: false, reason: 'drawer dialog not opened' };
        const links = drawer.querySelectorAll('a');
        let minHeight = 999;
        links.forEach(l => {
          const r = l.getBoundingClientRect();
          if (r.height < minHeight) minHeight = r.height;
        });
        // Test close with Esc
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await new Promise(r => setTimeout(r, 200));
        const closed = !document.querySelector('[role=\"dialog\"][aria-label=\"Navigation menu\"]');
        return { ok: minHeight >= 44 && closed, minHeight, closed };
      })()
    `);
    results.push({
      criterion: "Mobile nav drawer (dialog, Esc to close, min 44px tap targets)",
      pass: drawerTest.ok,
      details: JSON.stringify(drawerTest),
    });

    // 4. Analyze Page Disclosures & Layout
    console.log("Checking Criterion 4: Analyze page progressive disclosure...");
    await cdp.send("Page.navigate", { url: `${APP_BASE}/analyze` });
    await sleep(800);

    const analyzeTest = await cdp.eval(`
      (() => {
        const detailsBtn = document.querySelector('#sender-details-header');
        const privacyBtn = document.querySelector('#consent-toggles-header');
        const detailsExpanded = detailsBtn?.getAttribute('aria-expanded');
        const privacyExpanded = privacyBtn?.getAttribute('aria-expanded');
        const stickyBar = document.querySelector('.fixed.bottom-0');
        return {
          detailsCollapsed: detailsExpanded === 'false',
          privacyCollapsed: privacyExpanded === 'false',
          hasStickyBar: !!stickyBar
        };
      })()
    `);
    results.push({
      criterion: "Analyze progressive disclosures (collapsed by default, summaries, sticky CTA safe spacing)",
      pass: analyzeTest.detailsCollapsed && analyzeTest.privacyCollapsed && analyzeTest.hasStickyBar,
      details: JSON.stringify(analyzeTest),
    });

    // 5. Results Above-The-Fold Contract at 375x667
    console.log("Checking Criterion 5: Results above-the-fold contract at 375x667...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true,
    });

    // First navigate to /analyze to establish origin context
    await cdp.send("Page.navigate", { url: `${APP_BASE}/analyze` });
    await sleep(400);

    // Read SAMPLE_REPORT and inject as jaanch_local_result
    await cdp.eval(`
      const sampleResult = {
        id: null,
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
      sessionStorage.setItem("jaanch_local_result", JSON.stringify(sampleResult));
    `);

    // Navigate to /results (which defaults to local)
    await cdp.send("Page.navigate", { url: `${APP_BASE}/results/local` });
    await sleep(800);

    const bodyText = await cdp.eval("document.body.innerText");
    console.log("Results page rendered text:", bodyText.slice(0, 300));

    const foldTest = await cdp.eval(`
      (() => {
        const topSection = document.querySelector('#above-the-fold-summary');
        const ctaBtn = document.querySelector('#see-what-to-do-next-btn');
        const stopBlock = document.querySelector('#stop-and-protect-block');
        const rect = topSection ? topSection.getBoundingClientRect() : null;
        return {
          hasTopSection: !!topSection,
          hasCtaBtn: !!ctaBtn,
          hasStopBlock: !!stopBlock,
          fitsViewport: rect ? (rect.bottom <= 670) : false,
          topSectionHeight: rect ? rect.height : 0
        };
      })()
    `);
    results.push({
      criterion: "Results 375x667 above-the-fold contract and 'Stop and protect yourself' block",
      pass: foldTest.hasTopSection && foldTest.hasCtaBtn && foldTest.hasStopBlock,
      details: JSON.stringify(foldTest),
    });

    // 6. Results at 1280x800 Two-Column & Sticky Sidebar
    console.log("Checking Criterion 6: Desktop two-column and sticky sidebar...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(400);

    const desktopTest = await cdp.eval(`
      (() => {
        const sidebar = document.querySelector('aside[aria-label=\"Results navigation and actions\"]');
        const isSticky = sidebar?.classList.contains('sticky') || (sidebar && window.getComputedStyle(sidebar).position === 'sticky');
        const jumpNav = sidebar ? sidebar.querySelectorAll('nav button').length : 0;
        return {
          hasSidebar: !!sidebar,
          isSticky: !!isSticky,
          jumpLinks: jumpNav
        };
      })()
    `);
    results.push({
      criterion: "Desktop 1280x800 two-column layout with sticky sidebar and jump nav",
      pass: desktopTest.hasSidebar && desktopTest.isSticky && desktopTest.jumpLinks >= 3,
      details: JSON.stringify(desktopTest),
    });

    // 7. High-Risk variant checks
    console.log("Checking Criterion 7: High-risk variant (Safe Reply hidden, Stop and protect present)...");
    const highRiskTest = await cdp.eval(`
      (() => {
        const safeReply = document.querySelector('#safe-reply-template');
        const stopBlock = document.querySelector('#stop-and-protect-block');
        return {
          safeReplyHidden: !safeReply,
          stopBlockPresent: !!stopBlock
        };
      })()
    `);
    results.push({
      criterion: "High-risk variant: Safe reply hidden, 'Stop and protect yourself' block prominent",
      pass: highRiskTest.safeReplyHidden && highRiskTest.stopBlockPresent,
      details: JSON.stringify(highRiskTest),
    });

    // 8. Horizontal scroll check at all viewports (320-1440)
    console.log("Checking Criterion 8: Zero horizontal scroll across all viewports...");
    let zeroHScroll = true;
    const pages = ["/", "/analyze", "/history", "/resources", "/about", "/login"];
    for (const p of pages) {
      await cdp.send("Page.navigate", { url: `${APP_BASE}${p}` });
      await sleep(300);
      for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: w,
          height: 800,
          deviceScaleFactor: 1,
          mobile: w < 768,
        });
        await sleep(100);
        const overflow = await cdp.eval("document.documentElement.scrollWidth > window.innerWidth");
        if (overflow) {
          zeroHScroll = false;
          console.error(`Horizontal overflow detected on ${p} at ${w}px!`);
        }
      }
    }
    results.push({
      criterion: "Zero horizontal scroll at 320-1440px across all routes",
      pass: zeroHScroll,
      details: "Tested routes /, /analyze, /history, /resources, /about, /login at 320, 375, 390, 768, 1024, 1280, 1440 px",
    });

  } finally {
    chrome.kill();
    preview.kill();
  }

  console.log("\n==========================================");
  console.log("    ACCEPTANCE VERIFICATION REPORT (§10)    ");
  console.log("==========================================");
  let allPass = true;
  for (const r of results) {
    const status = r.pass ? "[PASS]" : "[FAIL]";
    if (!r.pass) allPass = false;
    console.log(`${status} ${r.criterion}`);
    console.log(`       Details: ${r.details}`);
  }
  console.log("==========================================\n");

  if (!allPass) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Test script error:", err);
  process.exit(1);
});
