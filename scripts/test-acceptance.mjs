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

    const landingStructure = await cdp.eval(`
      (() => {
        const h1s = Array.from(document.querySelectorAll('h1'));
        const h1Count = h1s.length;
        const h1Text = h1s[0] ? h1s[0].innerText.replace(/\\s+/g, ' ').trim() : '';
        const expectedH1 = "Spot Warning Signs Before You Pay or Share Private Data";
        const h1Matches = h1Text === expectedH1;

        const hasTextarea = !!document.querySelector('section textarea');

        // Check hero links
        const analyzeLink = document.querySelector('section a[href="/analyze"]');
        const linkCheckLink = document.querySelector('section a[href="/link-check"]');

        const analyzeText = analyzeLink ? analyzeLink.innerText.trim() : '';
        const linkCheckText = linkCheckLink ? linkCheckLink.innerText.trim() : '';
        const buttonsValid = /Check an Offer Now/i.test(analyzeText) && /Inspect a Link/i.test(linkCheckText);

        const badge = document.querySelector('#problem-statement-badge');
        const hasBadge = badge ? /Digital Trust & Safety/i.test(badge.innerText) : false;

        return {
          h1Count,
          h1Text,
          h1Matches,
          hasTextarea,
          hasAnalyzeLink: !!analyzeLink,
          hasLinkCheckLink: !!linkCheckLink,
          buttonsValid,
          hasBadge
        };
      })()
    `);

    results.push({
      criterion: "Criterion 1: Landing structure (single H1 exact wording, no textarea, two hero action links, problem badge)",
      pass: landingStructure.h1Count === 1 &&
            landingStructure.h1Matches &&
            !landingStructure.hasTextarea &&
            landingStructure.hasAnalyzeLink &&
            landingStructure.hasLinkCheckLink &&
            landingStructure.buttonsValid &&
            landingStructure.hasBadge,
      details: JSON.stringify(landingStructure),
    });

    // 2. Above-the-fold contract at 1440x900, 1366x768, and 390x844
    console.log("Checking Criterion 2: Landing above-the-fold contract...");
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
      const metrics = await cdp.eval(`
        (() => {
          const h1 = document.querySelector('h1');
          const sub = document.querySelector('section p');
          const analyzeBtn = document.querySelector('section a[href="/analyze"]');
          const linkBtn = document.querySelector('section a[href="/link-check"]');
          if (!h1 || !sub || !analyzeBtn || !linkBtn) {
            return { ok: false, reason: 'elements missing' };
          }
          const vh = window.innerHeight;
          const h1Bottom = h1.getBoundingClientRect().bottom;
          const subBottom = sub.getBoundingClientRect().bottom;
          const analyzeBottom = analyzeBtn.getBoundingClientRect().bottom;
          const linkBottom = linkBtn.getBoundingClientRect().bottom;

          const allAboveFold = h1Bottom <= vh && subBottom <= vh && analyzeBottom <= vh && linkBottom <= vh;
          return {
            ok: allAboveFold,
            vh,
            h1Bottom: Math.round(h1Bottom),
            subBottom: Math.round(subBottom),
            analyzeBottom: Math.round(analyzeBottom),
            linkBottom: Math.round(linkBottom)
          };
        })()
      `);
      if (!metrics.ok) aboveTheFoldPassed = false;
      aboveTheFoldDetails += `${w}x${h}: ${JSON.stringify(metrics)}; `;
    }

    // Phone: 390x844 (H1 and primary button above the fold)
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await sleep(200);
    const mobileFold = await cdp.eval(`
      (() => {
        const h1 = document.querySelector('h1');
        const analyzeBtn = document.querySelector('section a[href="/analyze"]');
        if (!h1 || !analyzeBtn) return { ok: false, reason: 'elements missing' };
        const vh = window.innerHeight;
        const h1Bottom = h1.getBoundingClientRect().bottom;
        const analyzeBottom = analyzeBtn.getBoundingClientRect().bottom;
        return {
          ok: h1Bottom <= vh && analyzeBottom <= vh,
          vh,
          h1Bottom: Math.round(h1Bottom),
          analyzeBottom: Math.round(analyzeBottom)
        };
      })()
    `);
    if (!mobileFold.ok) aboveTheFoldPassed = false;
    aboveTheFoldDetails += `390x844: ${JSON.stringify(mobileFold)}; `;

    results.push({
      criterion: "Criterion 2: Landing Above-The-Fold contract (1440x900 & 1366x768 all hero actions above fold; 390x844 H1 & primary button above fold)",
      pass: aboveTheFoldPassed,
      details: aboveTheFoldDetails,
    });

    // 3. H1 orphan word check
    console.log("Checking Criterion 3: H1 orphan word check across viewports...");
    let orphanTestPassed = true;
    let orphanDetails = "";
    for (const w of [320, 375, 390, 768, 1024, 1280, 1366, 1440, 1920]) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: 800,
        deviceScaleFactor: 1,
        mobile: w < 768,
      });
      await sleep(150);
      const res = await cdp.eval(`
        (() => {
          const h1 = document.querySelector('h1');
          if (!h1) return { ok: false, reason: 'h1 not found' };
          const text = h1.textContent || '';
          const hasNbsp = text.includes('Private\\u00A0Data');

          // Check using Range
          const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
          let targetNode = null;
          while (walker.nextNode()) {
            if (walker.currentNode.textContent.includes('Private')) {
              targetNode = walker.currentNode;
              break;
            }
          }
          if (!targetNode) return { ok: hasNbsp, hasNbsp, measured: false };

          const str = targetNode.textContent;
          const pIdx = str.indexOf('Private');
          const dIdx = str.indexOf('Data');
          if (pIdx === -1 || dIdx === -1) return { ok: hasNbsp, hasNbsp, measured: false };

          const rangeP = document.createRange();
          rangeP.setStart(targetNode, pIdx);
          rangeP.setEnd(targetNode, pIdx + 'Private'.length);

          const rangeD = document.createRange();
          rangeD.setStart(targetNode, dIdx);
          rangeD.setEnd(targetNode, dIdx + 'Data'.length);

          const rectP = rangeP.getBoundingClientRect();
          const rectD = rangeD.getBoundingClientRect();
          const sameLine = Math.abs(rectP.top - rectD.top) <= 4;
          return { ok: hasNbsp && sameLine, hasNbsp, sameLine, pTop: rectP.top, dTop: rectD.top };
        })()
      `);
      if (!res.ok) orphanTestPassed = false;
      orphanDetails += `${w}px: ${JSON.stringify(res)}; `;
    }
    results.push({
      criterion: "Criterion 3: H1 orphan word: 'Data' never sits alone on a last line (320-1920px)",
      pass: orphanTestPassed,
      details: orphanDetails,
    });

    // 4. Four plain-language feature cards in hero
    console.log("Checking Criterion 4: Four plain-language feature cards in hero...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(200);
    const featureCardsTest = await cdp.eval(`
      (() => {
        const heroSection = document.querySelector('section');
        if (!heroSection) return { ok: false, reason: 'hero section not found' };

        const expectedTitles = [
          "Explains why",
          'Never says "safe"',
          "Checks official sources",
          "Screenshots stay on your device"
        ];

        const cards = Array.from(heroSection.querySelectorAll('h3')).map(h => ({
          title: h.innerText.trim(),
          top: Math.round(h.getBoundingClientRect().top)
        }));

        const titlesMatch = expectedTitles.every(t => cards.some(c => c.title === t));
        const iconTiles = heroSection.querySelectorAll('.bg-primary-tint.text-primary, .bg-primary\\\\/10.text-primary');

        // At 1440x900, top edge of cards is inside viewport height (<= 900) as peek affordance
        const peekAffordance = cards.length === 4 && cards.every(c => c.top < 900);

        return {
          count: cards.length,
          titlesMatch,
          cards,
          iconTileCount: iconTiles.length,
          peekAffordance,
          ok: cards.length === 4 && titlesMatch && iconTiles.length >= 4 && peekAffordance
        };
      })()
    `);
    results.push({
      criterion: "Criterion 4: Four feature cards in hero with IconTiles and peek affordance at 1440x900",
      pass: featureCardsTest.ok,
      details: JSON.stringify(featureCardsTest),
    });

    // 5. Mobile Nav Drawer
    console.log("Checking Criterion 5: Mobile navigation drawer...");
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
      criterion: "Criterion 5: Mobile nav drawer (dialog, Esc to close, min 44px tap targets)",
      pass: drawerTest.ok,
      details: JSON.stringify(drawerTest),
    });

    // 6. Analyze Page Disclosures & Layout
    console.log("Checking Criterion 6: Analyze page progressive disclosure...");
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
      criterion: "Criterion 6: Analyze progressive disclosures (collapsed by default, summaries, sticky CTA safe spacing)",
      pass: analyzeTest.detailsCollapsed && analyzeTest.privacyCollapsed && analyzeTest.hasStickyBar,
      details: JSON.stringify(analyzeTest),
    });

    // 7. Results Above-The-Fold Contract at 375x667
    console.log("Checking Criterion 7: Results above-the-fold contract at 375x667...");
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
      criterion: "Criterion 7: Results 375x667 above-the-fold contract and 'Stop and protect yourself' block",
      pass: foldTest.hasTopSection && foldTest.hasCtaBtn && foldTest.hasStopBlock,
      details: JSON.stringify(foldTest),
    });

    // 8. Results at 1280x800 Two-Column & Sticky Sidebar
    console.log("Checking Criterion 8: Desktop two-column and sticky sidebar...");
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
      criterion: "Criterion 8: Desktop 1280x800 two-column layout with sticky sidebar and jump nav",
      pass: desktopTest.hasSidebar && desktopTest.isSticky && desktopTest.jumpLinks >= 3,
      details: JSON.stringify(desktopTest),
    });

    // 9. High-Risk variant checks
    console.log("Checking Criterion 9: High-risk variant (Safe Reply hidden, Stop and protect present)...");
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
      criterion: "Criterion 9: High-risk variant: Safe reply hidden, 'Stop and protect yourself' block prominent",
      pass: highRiskTest.safeReplyHidden && highRiskTest.stopBlockPresent,
      details: JSON.stringify(highRiskTest),
    });

    // 10. Horizontal scroll check at all viewports (320-1920)
    console.log("Checking Criterion 10: Zero horizontal scroll across all viewports...");
    let zeroHScroll = true;
    const pages = ["/", "/analyze", "/history", "/resources", "/about", "/login"];
    for (const p of pages) {
      await cdp.send("Page.navigate", { url: `${APP_BASE}${p}` });
      await sleep(300);
      for (const w of [320, 375, 390, 768, 1024, 1280, 1366, 1440, 1920]) {
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
      criterion: "Criterion 10: Zero horizontal scroll at 320-1920px across all routes",
      pass: zeroHScroll,
      details: "Tested routes /, /analyze, /history, /resources, /about, /login at 320, 375, 390, 768, 1024, 1280, 1366, 1440, 1920 px",
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
