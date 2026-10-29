import { RuleDefinition, RuleHit } from "./types.js";
import { extractQuote } from "./normalize.js";
import { isFreeMailDomain } from "../config/freeMail.js";
import { checkLookalikeDomain } from "../links/lookalike.js";
import { PLAUSIBILITY_LIMITS } from "../config/plausibility.js";
import { extractOrganizationCandidates } from "../extraction/organization.js";

function testRegex(regex: RegExp, text: string): boolean {
  return regex.test(text);
}

/**
 * Checks if a matched term is negated within the same clause (up to ~5-6 tokens before the match).
 * Cues: no, not, never, without, free of, do not, don't, dont, neither, nahi, fee waiver, waived.
 * Stops looking if crossing clause boundaries (., !, ?, \n, ;).
 */
export function isClauseNegated(text: string, matchIndex: number): boolean {
  if (matchIndex <= 0) return false;
  let clauseStart = matchIndex - 1;
  while (clauseStart >= 0 && !/[.!?\n;]/.test(text[clauseStart])) {
    clauseStart--;
  }
  const clausePrefix = text.slice(clauseStart + 1, matchIndex).trim();
  const tokens = clausePrefix.split(/\s+/).filter(Boolean);
  const windowTokens = tokens.slice(-6).join(" ").toLowerCase();

  return (
    /\b(?:no|not|never|without|neither|nahi|waived|waiver|not\s+(?:required?|pay|charge|ask)|do\s+not\s+(?:share|pay|send)|don't\s+(?:share|pay|send)|dont\s+(?:share|pay|send)|free\s+of)\b/i.test(
      windowTokens
    ) ||
    /no\s+fees?\s+is\s+charged/i.test(clausePrefix) ||
    /please\s+do\s+not\s+share\s+any\s+payment/i.test(clausePrefix) ||
    /this\s+is\s+not\s+a\s+paid\s+internship/i.test(clausePrefix)
  );
}

/**
 * PAY-001: Upfront fee for offer/selection (Hard Disqualifier)
 * registration, training, kit, deposit, processing, documentation, placement fee, Hinglish
 */
export const rulePay001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:registration|processing|security|training|kit|onboarding|verification|document(?:ation)?|placement|acceptance|seat)\s*(?:fee|fees|charge|charges|deposit|cost|amount|payment)|(?:pay|deposit|send)\s*(?:₹|rs\.?|inr)?\s*\d+\s*(?:as|for)?\s*(?:registration|processing|security|training|kit|deposit|document(?:ation)?|placement|charges?)|(?:fees?\s*bharna\s*(?:padega|hoga)|paisa\s*dena\s*(?:padega|hoga))/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-001",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        title: "Upfront fee, placement, or documentation charge requested",
        whyItMatters:
          "Legitimate employers, internships, and scholarship programs never ask candidates to pay registration, training, documentation, or placement fees.",
        evidenceQuote: quote,
        unknowns: [
          {
            item: "Recruiter / sender financial legitimacy",
            howToVerify:
              "Never pay money for employment or internships. Contact company HR via their official website.",
          },
        ],
      });
    }
  }
  return hits;
};

/**
 * PAY-002: Direct payment via UPI, QR code, gift cards, crypto, wallet, wire transfer (Hard Disqualifier)
 * UPI ID: token name@handle where handle has NO dot (e.g. brightpath.hr@okbank, x@ybl, x@okicici)
 */
export const rulePay002: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:(?:pay|send|transfer|gpay|phonepe|paytm|upi|wire\s*transfer)\s*(?:(?:₹|rs\.?|inr)?\s*\d+[\d,]*)?\s*(?:to|via|on|at|id)?\s*(?:[6-9]\d{9}|[a-zA-Z0-9.\-_]{2,64}@(?!example|invalid|test|localhost)([a-zA-Z0-9_-]{2,32}))\b(?!\.))|(?:\b(?:upi\s*id\s*[:\-]?\s*)[a-zA-Z0-9.\-_]{2,64}@(?!example|invalid|test|localhost)([a-zA-Z0-9_-]{2,32})\b(?!\.))|(?:scan\s*(?:the)?\s*qr\s*(?:code)?(?:\s*to\s*pay)?)|(?:send\s*via\s*(?:gpay|phonepe|paytm|upi|wire\s*transfer|wallet))|(?:pay\s*first[,\s]+receive\s*offer\s*later)/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-002",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        title: "Payment requested via UPI, QR, wallet, wire transfer, or unverified channel",
        whyItMatters:
          "Payments directed to personal UPI, QR codes, wallet apps, or wire transfers lack corporate escrow, invoice tracking, or fraud dispute recourse.",
        evidenceQuote: quote,
        unknowns: [
          {
            item: "Recipient bank account & corporate registration",
            howToVerify:
              "Ask for official corporate banking details and cross-check company status on the MCA portal.",
          },
        ],
      });
    }
  }
  return hits;
};

/**
 * PAY-003: Refundable deposit promise
 * refundable, fully refundable, will be refunded, returned after completion/training attached to any payment
 */
export const rulePay003: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:refundable(?:\s*security)?\s*(?:deposit|registration|fee|charges?|amount)?|100%\s*refundable|will\s*be\s*(?:refunded|returned)|(?:returned|refunded)\s*after\s*(?:training|first\s*month|joining|completion))/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-003",
        category: "payment",
        severity: "high",
        hardDisqualifier: false,
        title: "'Refundable' deposit promise",
        whyItMatters:
          "Scammers frequently promise fees will be '100% refunded with your first stipend' to lower user hesitation.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * PAY-004: Required purchase of equipment/software/course from vendor
 */
export const rulePay004: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:must\s*purchase|mandatory\s*to\s*(?:buy|purchase)|pay\s*for\s*(?:laptop|software|kit|id\s*card|study\s*material|uniform|training\s*module)|buy\s*from\s*(?:our|recommended|partner)\s*vendor)/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-004",
        category: "payment",
        severity: "high",
        hardDisqualifier: false,
        title: "Mandatory equipment, kit, or software purchase",
        whyItMatters:
          "Legitimate employers provide required work tools or specify software requirements without forcing purchases through designated unverified vendors.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * PAY-005: Pay money to unlock funds (advance fee, GST/tax release charges) (Hard Disqualifier)
 * pay GST/tax/processing/clearance/customs/release/unlock/handling charges (of ₹X) to release/receive/claim/unlock ₹Y
 * scholarship amount will be released after payment
 */
export const rulePay005: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:(?:to\s*release\s*(?:the\s*)?(?:amount|funds?|scholarship)[,\s]+)?pay\s*(?:(?:₹|rs\.?|inr)?\s*\d+[\d,]*\s*(?:as|for)?\s*)?(?:gst|tax|processing|courier|clearance|customs|release|unlock|handling)?\s*(?:and\s*processing)?\s*(?:charges?|fees?)[\s\S]{0,50}?(?:to\s*release|to\s*receive|to\s*claim|to\s*unlock))|(?:pay\s*(?:(?:₹|rs\.?|inr)?\s*\d+[\d,]*\s*(?:as|for)?\s*)?(?:gst|tax|processing|courier|clearance|customs|release|unlock|handling)\s*(?:and\s*processing)?\s*(?:charges?|fees?)\s*(?:of\s*(?:₹|rs\.?|inr)?\s*\d[\d,]*)?)|(?:pay\s*(?:₹|rs\.?|inr)?\s*\d+\s*(?:to\s*unlock|to\s*release|to\s*receive))|(?:pay\s*(?:tax|gst|courier|clearance|conversion)\s*(?:fee|charges?)?\s*(?:to\s*claim|to\s*receive|for\s*scholarship))|(?:scholarship\s*amount\s*will\s*be\s*released\s*after\s*payment)|(?:deposit\s*(?:(?:₹|rs\.?|inr)?\s*\d+[\d,]*\s*)?(?:before|to)\s*disburs(?:e|ement))/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-005",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        title: "Pay money to unlock or receive funds (GST / processing fee)",
        whyItMatters:
          "Advance-fee fraud requires paying 'taxes', 'GST', or 'release fees' before receiving prizes, loans, or scholarships.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * PAY-006: Gift card or cryptocurrency payment (Hard Disqualifier)
 */
export const rulePay006: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:(?:pay|send|purchase|buy)\s*(?:with|via|in|a|an)?\s*(?:bitcoin|btc|usdt|eth|crypto(?:currency)?|google\s*play\s*(?:card|code|voucher)|amazon\s*(?:gift\s*card|voucher)|steam\s*card|apple\s*gift\s*card))|(?:google\s*play\s*(?:card|code|voucher)|amazon\s*(?:gift\s*card|voucher)|steam\s*(?:gift\s*)?card)/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-006",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        title: "Payment via gift cards or cryptocurrency requested",
        whyItMatters:
          "Gift cards and cryptocurrencies are irreversible payment rails universally exploited by scammers to launder fraudulent funds.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * PAY-007: Laptop dispatched after payment / Pay-first onboarding sequencing (Hard Disqualifier)
 * 'Your laptop will be dispatched after payment', 'after payment', 'once payment is received/confirmed',
 * 'reply with the payment receipt/screenshot/UTR/transaction ID', 'send payment proof'
 */
export const rulePay007: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:(?:laptop|equipment|device|kit)\s*(?:will\s*be)?\s*dispatched\s*after\s*payment)|(?:(?:after|once)\s*payment\s*is\s*(?:received|confirmed|made|done))|(?:reply\s*with\s*(?:the\s*)?payment\s*(?:receipt|screenshot|utr|transaction\s*id))|(?:send\s*payment\s*proof)|(?:pay\s*(?:first|upfront|advance)[,\s]+(?:(?:and\s+then|then|and|before)\s*)?(?:receive|get|generate|send|issue)\s*(?:the\s*)?(?:offer|letter|appointment|confirmation|laptop|equipment))/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-007",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        title: "Laptop dispatch or onboarding conditioned on prior payment",
        whyItMatters:
          "Legitimate employers never demand payment receipts or condition equipment dispatch on upfront transfers.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * PAY-008: Mandatory software kit, equipment deposit, uniform, interview fee, or vendor purchase (Hard Disqualifier)
 * 'purchase the mandatory software kit for ₹3,000', 'buy the laptop/software/licence/tools from our vendor',
 * 'welcome kit', 'ID card charges', 'uniform fee', 'training material fee', 'course purchase', 'equipment deposit',
 * 'interview fee', 'offer-letter fee', 'background-verification fee'
 */
export const rulePay008: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:(?:purchase|buy|pay\s*for)\s*(?:the\s*)?mandatory\s*(?:software|hardware|laptop|tool|kit|course|training)(?:\s*kit)?(?:\s*for\s*(?:₹|rs\.?|inr)?\s*\d+)?)|(?:buy\s*(?:the\s*)?[a-zA-Z\s]{0,40}?(?:laptop|software|licen[cs]e|tools?)\s*from\s*(?:our|a|the)?\s*vendor)|(?:welcome\s*kit\s*(?:fee|charges?))|(?:id\s*card\s*charges?)|(?:uniform\s*fee)|(?:training\s*material\s*fee)|(?:course\s*purchase)|(?:equipment\s*deposit)|(?:mandatory\s*software\s*kit)|(?:(?:mandatory\s*)?interview\s*fee)|(?:offer-?letter\s*fee)|(?:background-?verification\s*fee)|(?:software\s*fee)|(?:laptop\s*fee)|(?:visa\s*advance)|(?:travel\s*advance)|(?:accommodation\s*advance)|(?:visa\s*processing\s*fee)/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "PAY-008",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        title: "Mandatory software kit, equipment purchase, or vendor fee requested",
        whyItMatters:
          "Legitimate corporate employers supply work software and tools directly and do not force candidates to purchase kits or licenses from designated vendors.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * PAY-009: Cheque deposit and partial refund scam (Hard Disqualifier)
 */
export const rulePay009: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:deposit\s*(?:this|the|a)?\s*cheque[\s\S]{0,140}?(?:send|transfer|wire|return)\s*(?:the\s*)?(?:part|some|remaining|back|balance|₹|rs\.?|inr|\d+)|(?:advance\s*cheque|cheque\s*deposit)[\s\S]{0,140}?(?:send|transfer|wire)\s*(?:back|remaining))/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "PAY-009",
      category: "payment",
      severity: "critical",
      hardDisqualifier: true,
      title: "Cheque overpayment and partial transfer back",
      whyItMatters:
        "Fraudulent cheque overpayment scam: the counterfeit cheque will bounce days later, leaving the victim liable for all transferred funds.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * DAT-001: Bank login, card details, passwords, OTPs, UPI PIN (Hard Disqualifier)
 */
export const ruleDat001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:net-?banking\s*password|login\s*password|atm\s*pin|upi\s*pin|cvv(?:\s*number)?|one\s*time\s*password|share\s*(?:your\s*)?otp|enter\s*(?:your\s*)?otp|card\s*number\s*and\s*cvv|credit\s*card\s*details|debit\s*card\s*details)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "DAT-001",
      category: "data_request",
      severity: "critical",
      hardDisqualifier: true,
      title: "Banking credentials, OTP, or UPI PIN requested",
      whyItMatters:
        "No genuine entity will ever request your password, CVV, OTP, or UPI PIN. Sharing this grants immediate access to drain your accounts.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * DAT-002: Aadhaar, PAN, bank account details before selection/onboarding (Hard Disqualifier)
 */
export const ruleDat002: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:\baadhaar(?:\s*card|\s*number)?\b|\bpan(?:\s*card|\s*number)?\b|\bbank\s*account\s*(?:number|passbook|details)\b|upload\s*both\s*sides\s*of\s*(?:id|aadhaar|pan)|selfie\s*with\s*(?:id|aadhaar|pan)|send\s*bank\s*account)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "DAT-002",
      category: "data_request",
      severity: "critical",
      hardDisqualifier: true,
      title: "Aadhaar, PAN, or bank account requested upfront",
      whyItMatters:
        "Demanding government identity cards or bank details before an interview or formal selection process exposes students to identity theft and synthetic identity fraud.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * DAT-003: Install remote app, APK, or screen share
 */
export const ruleDat003: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:anydesk|teamviewer|rustdesk|quicksupport|install\s*(?:the\s*)?(?:\.apk|app\s*from\s*link)|download\s*apk|screen\s*shar(?:e|ing)\s*(?:app|session)|allow\s*remote\s*access)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "DAT-003",
      category: "data_request",
      severity: "high",
      title: "Request to install remote-access tool or unverified APK",
      whyItMatters:
        "Remote desktop utilities (AnyDesk, TeamViewer) and external APK files allow bad actors to inspect your screen, intercept OTPs, and take over devices.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * DAT-004: Academic certificates or full address proof requested before interview/offer
 */
export const ruleDat004: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:upload\s*academic\s*certificates|send\s*degree\s*certificates?|full\s*address\s*proof|original\s*certificates?\s*submission)\s*(?:before|prior\s*to)\s*(?:interview|offer\s*letter)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "DAT-004",
      category: "data_request",
      severity: "medium",
      title: "Academic certificates or address proof requested prematurely",
      whyItMatters:
        "Legitimate employers review resumes first; original certificate submission or address proofs are collected only during formal onboarding.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * DAT-005: Passport scans before legitimate process (Hard Disqualifier)
 */
export const ruleDat005: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:passport\s*(?:scan|copy|photo|details)\s*(?:immediately|before\s*selection|now|for\s*screening))/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "DAT-005",
      category: "data_request",
      severity: "critical",
      hardDisqualifier: true,
      title: "Passport scan or copy requested before legitimate process",
      whyItMatters:
        "Unsolicited or premature requests for full passport scans pose severe identity theft and visa scam risks.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * DAT-006: Personal-data bundle requested before sender is verified
 * any 3 of {full name, phone, address, DOB, résumé/CV, photo, ID number}
 */
export const ruleDat006: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];

  let count = 0;
  if (/(?:full\s*name|name\s*as\s*per|your\s*name)/i.test(ctx.normalizedText)) count++;
  if (/(?:contact\s*number|phone(?:\s*number)?|mobile(?:\s*number)?|whatsapp\s*number)/i.test(ctx.normalizedText)) count++;
  if (/(?:current\s*address|permanent\s*address|residential\s*address|home\s*address)\b/i.test(ctx.normalizedText)) count++;
  if (/(?:date\s*of\s*birth|dob|birth\s*date)\b/i.test(ctx.normalizedText)) count++;
  if (/(?:(?:updated\s*)?r[eé]sum[eé]|cv|curriculum\s*vitae)\b/i.test(ctx.normalizedText)) count++;
  if (/(?:passport\s*size\s*photo|recent\s*photograph|photo(?:graph)?)\b/i.test(ctx.normalizedText)) count++;
  if (/(?:id\s*(?:proof|number|card)|identity\s*card|student\s*id)\b/i.test(ctx.normalizedText)) count++;

  if (count >= 3) {
    const dataRegex =
      /(?:full\s*name|contact\s*number|phone|r[eé]sum[eé]|cv|address|date\s*of\s*birth|dob|photo)/i;
    const quote = extractQuote(ctx.rawText, dataRegex);

    hits.push({
      ruleId: "DAT-006",
      category: "data_request",
      severity: "low",
      hardDisqualifier: false,
      title: "Personal data bundle requested before sender verification",
      whyItMatters:
        "Personal details requested before the sender is verified. Share only what is needed, and only after you confirm who is asking.",
      evidenceQuote: quote,
      unknowns: [
        {
          item: "Sender identity & legitimate need for personal data",
          howToVerify:
            "Share only the minimum (e.g., résumé without home address/ID numbers) and only after verification.",
        },
      ],
    });
  }
  return hits;
};

/**
 * TGB-001: Unrealistic earnings for trivial effort
 */
export const ruleTgb001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:earn\s*(?:₹|rs\.?|inr)?\s*(?:[3-9]\d{3}|[1-9]\d{4,})\s*(?:per|\/)\s*day|typing\s*job|data\s*entry\s*from\s*(?:mobile|home)|like\s*and\s*subscribe\s*tasks?|earn\s*(?:50k|1\s*lakh|30k)\s*(?:monthly|per\s*month)\s*(?:by\s*working|for)\s*(?:1|2|one|two)\s*hours?|part-?time\s*online\s*work\s*daily\s*income)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "TGB-001",
      category: "too_good_to_be_true",
      severity: "high",
      title: "Unrealistically high payout for trivial daily tasks",
      whyItMatters:
        "Promises of several thousand rupees per day for tasks like video liking, review posting, or simple typing are classic hooks for task-based financial scams.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * TGB-002: 100% guaranteed placement/job/prize
 */
export const ruleTgb002: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:100%\s*guaranteed\s*(?:placement|job|selection|seat)|guaranteed\s*(?:offer|placement\s*support)|direct\s*hiring\s*without\s*exam)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "TGB-002",
      category: "too_good_to_be_true",
      severity: "medium",
      title: "'100% Guaranteed' selection or placement claim",
      whyItMatters:
        "No reputable organization guarantees job placement or selection regardless of performance or qualifications.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * TGB-003: Prize or lottery claim with unverified context
 */
export const ruleTgb003: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:you\s*have\s*won\s*(?:a\s*)?(?:lottery|lucky\s*draw|cash\s*prize|iphone|car|reward)|selected\s*as\s*(?:lucky|grand)\s*winner|claim\s*your\s*prize)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "TGB-003",
      category: "too_good_to_be_true",
      severity: "medium",
      title: "Prize, lottery, or reward without prior contest entry",
      whyItMatters:
        "Winning contests or lotteries that you never entered is an indicator of advance-fee fraud.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * TGB-004: Guaranteed selection, job, scholarship, or absurd income (Hard Disqualifier)
 * '100% guaranteed', 'guaranteed selection/placement/job', 'no interview required/needed', 'assured selection', 'sure-shot'
 */
export const ruleTgb004: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:100%\s*(?:selection\s*)?guaranteed|selection\s*(?:is\s*)?100%\s*guaranteed|guaranteed\s*(?:selection|placement|job|internship|scholarship|income)|no\s*interview\s*(?:required|needed)|assured\s*selection|sure-?shot|earn\s*(?:₹|rs\.?|inr)?\s*\d+\s*(?:lakh|k)?\s*(?:without|with\s*no)\s*(?:effort|skills?|experience))/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "TGB-004",
        category: "too_good_to_be_true",
        severity: "critical",
        hardDisqualifier: true,
        title: "Guaranteed selection or offer without interview",
        whyItMatters:
          "Legitimate employers conduct interviews or assessments before selection. Claims of '100% guaranteed' selection or 'no interview required' are predatory lures.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * REC-001: Asked to recruit other students, buy course, or do paid tasks (Hard Disqualifier)
 */
export const ruleRec001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:recruit\s*(?:\d+|other|more|friends?|peers?)\s*(?:students?|friends?|peers?|candidates?|members?)?|refer\s*(?:\d+|friends?|peers?)\s*(?:to|for)\s*(?:unlock|get\s*your|activate)|buy\s*(?:our|a)\s*course\s*(?:to\s*get|before\s*getting)|complete\s*paid\s*tasks?\s*before\s*(?:receiving|getting))/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "REC-001",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        title: "Requirement to recruit students, purchase courses, or pay for tasks",
        whyItMatters:
          "Pyramid schemes, multi-level marketing, and fake placement drives condition employment on recruiting peers or buying expensive training materials.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * GOV-001: Government scheme claim on non-government domain OR requesting payment (Hard Disqualifier)
 * Government of India, government scholarship/benefit/scheme + non-gov domain or payment
 */
export const ruleGov001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const govRegex =
    /(?:pm\s*(?:yojana|scheme|internship)|pradhan\s*mantri|ministry\s*of|national\s*scholarship\s*portal|nsp\s*scholarship|government\s*(?:of\s*india|scholarship|benefit|grant|internship|scheme)|central\s*merit\s*scholarship)/i;

  const match = ctx.normalizedText.match(govRegex);
  if (match && match.index !== undefined) {
    // Check if sender or links are non-government or if payment is requested
    const requestsPayment =
      /(?:fee|pay|deposit|charge|amount|rs\.?|₹|inr)\s*\d+/i.test(ctx.normalizedText) ||
      /(?:pay\s*(?:gst|tax|processing|charge|fee))/i.test(ctx.normalizedText) ||
      /(?:complete\s*payment)/i.test(ctx.normalizedText);

    // Look for non-gov domain in text or links
    const linkMatches = ctx.rawText.match(/(?:https?:\/\/)?([a-zA-Z0-9-]+\.)+(?:com|org|net|in|co\.in|io|invalid|test|example|tech|xyz)(?:\/[^\s]*)?/gi) || [];
    let hasNonGovDomain = false;
    for (const raw of linkMatches) {
      const clean = raw.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
      if (!clean.endsWith(".gov.in") && !clean.endsWith(".nic.in")) {
        hasNonGovDomain = true;
        break;
      }
    }

    if (ctx.senderDomain) {
      const sDomain = ctx.senderDomain.toLowerCase();
      if (!sDomain.endsWith(".gov.in") && !sDomain.endsWith(".nic.in")) {
        hasNonGovDomain = true;
      }
    }

    if (requestsPayment || hasNonGovDomain) {
      const quote = extractQuote(ctx.rawText, govRegex);
      hits.push({
        ruleId: "GOV-001",
        category: "source_authenticity",
        severity: "critical",
        hardDisqualifier: true,
        title: "Government scheme impersonation with payment request or unofficial domain",
        whyItMatters:
          "Official Indian government schemes operate strictly through .gov.in or .nic.in domains and never charge citizens registration or release fees.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * URG-001: Tight countdown pressure, pay within 1 hour, Complete payment today (High)
 */
export const ruleUrg001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:within\s*(?:2|two|1|one|3|three|24)\s*hours?|pay\s*within\s*(?:1|one|2|two)\s*hours?|today\s*only|expires\s*(?:tonight|today|in\s*\d+\s*hours?)|confirm\s*immediately\s*or\s*lose\s*(?:the\s*)?offer|last\s*slot|immediately|urgent\s*confirmation\s*required|complete\s*payment\s*today|pay\s*today|confirm\s*today)/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "URG-001",
        category: "urgency",
        severity: "high",
        title: "Artificial urgency or immediate deadline pressure",
        whyItMatters:
          "Creating intense time pressure prevents students from consulting parents, placement cells, or conducting background checks.",
        evidenceQuote: quote,
      });
    }
  }
  return hits;
};

/**
 * URG-002: Threats of cancellation or blacklisting
 */
export const ruleUrg002: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:offer\s*will\s*be\s*cancell?ed|seat\s*will\s*be\s*(?:given|transferred)\s*to\s*(?:another|next|someone)|will\s*be\s*blacklisted|legal\s*action|loss\s*of\s*eligibility)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "URG-002",
      category: "urgency",
      severity: "medium",
      title: "Threat of penalty, blacklisting, or forfeiture",
      whyItMatters:
        "Intimidation tactics coerce quick compliance before skepticism sets in.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * URG-003: Scarcity pressure: 'only 2 seats left', 'limited-time government benefit'
 */
export const ruleUrg003: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:only\s*\d+\s*seats?\s*left|limited-?time\s*(?:government\s*)?benefit|limited\s*slots?\s*remaining|first\s*come\s*first\s*serve\s*basis)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "URG-003",
      category: "urgency",
      severity: "medium",
      title: "Scarcity pressure and artificial slot limitations",
      whyItMatters:
        "Scammers invoke artificial seat limits to prompt hasty action without critical verification.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * URG-004: Short action window attached to onboarding/confirmation/registration
 */
export const ruleUrg004: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:within\s*(?:24|48|72)\s*(?:hours|hrs)|by\s*tomorrow|immediately|asap|at\s*the\s*earliest)[^.\n\r]{0,60}(?:onboarding|registration|confirmation|confirm|reply|process|documents?|details|joining)|(?:onboarding|registration|confirmation|confirm|reply|process|documents?|details|joining)[^.\n\r]{0,60}(?:within\s*(?:24|48|72)\s*(?:hours|hrs)|by\s*tomorrow|immediately|asap|at\s*the\s*earliest)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "URG-004",
      category: "urgency",
      severity: "low",
      hardDisqualifier: false,
      title: "Short deadline to act on onboarding or registration",
      whyItMatters:
        "Short deadline to act — legitimate employers allow time to verify.",
      evidenceQuote: quote,
      unknowns: [
        {
          item: "Onboarding timeline flexibility",
          howToVerify:
            "Ask for more time — a genuine employer will allow you to verify first.",
        },
      ],
    });
  }
  return hits;
};

/**
 * CNT-001: Major spelling/grammar/formatting errors
 * Conservative heuristic: >= 4 distinct errors; max 1 hit; severity low (3 points); never changes status alone
 */
export const ruleCnt001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const errorPatterns = [
    /\brecieve\b/i,
    /\bcongradulat/i,
    /\boppurtunit/i,
    /\bseperate\b/i,
    /\bcomapny\b/i,
    /\boffical\b/i,
    /\bapplicatn\b/i,
    /\bintrested\b/i,
    /\bimmediatly\b/i,
    /\bkindly\s+do\s+the\s+needful\b/i,
    /[!?]{3,}/,
    /\b[A-Z]{4,}\s+[A-Z]{4,}\s+[A-Z]{4,}\b/,
  ];

  let distinctErrors = 0;
  let firstQuote = "";

  for (const pattern of errorPatterns) {
    if (pattern.test(ctx.rawText)) {
      distinctErrors++;
      if (!firstQuote) {
        firstQuote = extractQuote(ctx.rawText, pattern);
      }
    }
  }

  if (distinctErrors >= 4) {
    hits.push({
      ruleId: "CNT-001",
      category: "content_quality",
      severity: "low",
      title: "Multiple spelling, grammar, or formatting irregularities",
      whyItMatters:
        "Genuine senders also make mistakes; this alone proves nothing. However, multiple severe inconsistencies are common in mass-phishing templates.",
      evidenceQuote: firstQuote || ctx.rawText.slice(0, 40),
    });
  }
  return hits;
};

/**
 * MIS-001: Missing organization identity or registration
 */
export const ruleMis001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const hasClaimedOrg = !!ctx.claimedOrg && ctx.claimedOrg.trim().length > 1;

  // Fix C (§5): MIS-001 fires ONLY when there is no organization candidate at all
  const candidates = extractOrganizationCandidates(ctx.rawText);
  if (!hasClaimedOrg && candidates.length === 0) {
    hits.push({
      ruleId: "MIS-001",
      category: "missing_details",
      severity: "medium",
      title: "No identifiable organization or company details",
      whyItMatters:
        "The message does not name an established corporate entity, CIN, LLPIN, or verifiable institutional sponsor.",
      evidenceQuote: extractQuote(ctx.rawText, /^[^\n.]+/),
      unknowns: [
        {
          item: "Organization legal name and registration",
          howToVerify:
            "Ask the sender for the company's registered name, corporate domain, and CIN number to check on mca.gov.in.",
        },
      ],
    });
  }
  return hits;
};

/**
 * MIS-002: Missing role/duties/duration/stipend
 */
export const ruleMis002: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  if (
    ctx.domain === "internship" ||
    ctx.domain === "job" ||
    ctx.domain === "freelance"
  ) {
    const mentionsDetails =
      /(?:responsibilit(?:y|ies)|job\s*description|role|duration|months?|stipend|salary|skills?|eligibilit(?:y|ies)|work\s*hours|scope)/i;

    if (!mentionsDetails.test(ctx.normalizedText)) {
      hits.push({
        ruleId: "MIS-002",
        category: "missing_details",
        severity: "medium",
        title: "Vague role terms and missing job duties",
        whyItMatters:
          "Legitimate recruitment messages define the job profile, core responsibilities, project duration, and stipend structure.",
        evidenceQuote: ctx.rawText.slice(0, Math.min(ctx.rawText.length, 60)),
      });
    }
  }
  return hits;
};

/**
/**
 * MIS-003: Selection/shortlisting extended without prior interview or evaluation step described
 */
export const ruleMis003: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const shortlistRegex =
    /(?:congratulations!?(?:\s*you\s*(?:have\s*been|are))?\s*(?:selected|shortlisted)|you\s*have\s*been\s*(?:shortlisted|selected|chosen)|shortlisted\s*for|direct\s*selection|direct\s*joining|selected\s*for\s*(?:an?\s*)?(?:internship|job|position|scholarship)|\bcongratulations\b)/i;

  const onboardingRegex =
    /(?:onboarding|confirm(?:\s*your)?\s*(?:position|seat|slot|internship|job|offer|acceptance)|reply\s*to\s*this\s*email|send\s*(?:your)?\s*(?:details|resume|cv|documents)|next\s*steps|proceed\s*with)/i;

  const isShortlisted = shortlistRegex.test(ctx.normalizedText);
  const hasOnboardingOrData = onboardingRegex.test(ctx.normalizedText);

  if (isShortlisted && hasOnboardingOrData) {
    const mentionsEvaluation =
      /(?:after\s*reviewing\s*your\s*interview|based\s*on\s*your\s*test\s*score|subsequent\s*to\s*(?:the\s*)?interview|interview\s*rounds?|technical\s*assessment|coding\s*test|group\s*discussion|written\s*test)/i.test(
        ctx.normalizedText
      );

    if (!mentionsEvaluation) {
      const quote =
        extractQuote(ctx.rawText, shortlistRegex) ||
        extractQuote(ctx.rawText, onboardingRegex);

      // Check whether role, org, and stipend are all present
      const hasRole = /(?:position|role|internship)\s*(?:of|as)?/i.test(ctx.normalizedText);
      const hasOrg = /(?:at|with)\s+[A-Z]/i.test(ctx.rawText) || Boolean(ctx.claimedOrg);
      const hasStipend = /(?:stipend|salary|₹|rs\.?|inr)\s*\d+/i.test(ctx.normalizedText);

      const hasAllDetails = hasRole && hasOrg && hasStipend;
      const severity = hasAllDetails ? "low" : "medium";

      hits.push({
        ruleId: "MIS-003",
        category: "missing_details",
        severity,
        hardDisqualifier: false,
        title: "Offer or shortlisting without interview or evaluation step described",
        whyItMatters:
          "Reputable organizations typically conduct an interview, test, or formal assessment before extending an offer or onboarding request.",
        evidenceQuote: quote,
        unknowns: [
          {
            item: "Selection basis & evaluation process",
            howToVerify:
              "Ask for the interview or evaluation process and who will conduct it.",
          },
        ],
      });
    }
  }
  return hits;
};


/**
 * MIS-004: Generic impersonal greeting
 */
export const ruleMis004: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:dear\s*(?:candidate|student|applicant|job\s*seeker|winner|user|sir\/madam|friend))/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "MIS-004",
      category: "missing_details",
      severity: "low",
      title: "Generic greeting rather than personalized communication",
      whyItMatters:
        "Mass-broadcast solicitations use generic placeholders like 'Dear Candidate' or 'Dear Student'.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * MIS-005: Vague job description: no responsibilities, no company details, no selection process
 */
export const ruleMis005: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  if (ctx.domain === "internship" || ctx.domain === "job") {
    const hasDuties = /(?:responsibilit|duties|task|work\s*on|deliverable)/i.test(
      ctx.normalizedText
    );
    const hasOrg = !!ctx.claimedOrg || /(?:company|pvt|ltd|corp)/i.test(ctx.normalizedText);
    const hasProcess = /(?:interview|test|assessment|shortlist|apply)/i.test(
      ctx.normalizedText
    );

    if (!hasDuties && !hasOrg && !hasProcess) {
      hits.push({
        ruleId: "MIS-005",
        category: "missing_details",
        severity: "medium",
        title: "Completely vague opportunity with missing duties, process, and corporate identity",
        whyItMatters:
          "Unsolicited job messages lacking specific job roles, corporate details, or selection processes are commonly used to harvest student contacts.",
        evidenceQuote: ctx.rawText.slice(0, Math.min(ctx.rawText.length, 60)),
      });
    }
  }
  return hits;
};

/**
 * MIS-006: Salary/stipend/prize unrealistic for role and student level
 */
export const ruleMis006: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  // Detect monthly internship stipend > 1,50,000 INR
  const stipendMatch = ctx.normalizedText.match(
    /(?:stipend|salary|pay)\s*(?:of|is|:)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(?:per\s*month|\/month|\/pm)/i
  );

  if (stipendMatch && stipendMatch[1]) {
    const num = parseInt(stipendMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(num) && num > PLAUSIBILITY_LIMITS.MAX_MONTHLY_INTERNSHIP_INR) {
      hits.push({
        ruleId: "MIS-006",
        category: "missing_details",
        severity: "medium",
        title: "Stipend or compensation amount unrealistic for a student opportunity",
        whyItMatters:
          "Internship stipends exceeding standard industry benchmarks are frequently used to induce irrational compliance.",
        evidenceQuote: stipendMatch[0],
      });
    }
  }
  return hits;
};

/**
 * MIS-007: Undefined registration or onboarding step mentioned
 */
export const ruleMis007: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:after\s*registration|complete\s*(?:the\s*)?registration|registration\s*process|during\s*registration)\b/i;

  const match = ctx.normalizedText.match(regex);
  if (match && match.index !== undefined) {
    if (!isClauseNegated(ctx.normalizedText, match.index)) {
      const quote = extractQuote(ctx.rawText, regex);
      hits.push({
        ruleId: "MIS-007",
        category: "missing_details",
        severity: "low",
        hardDisqualifier: false,
        title: "Undefined registration step mentioned",
        whyItMatters:
          "An undefined 'registration' step. Ask exactly what it involves and whether any fee applies.",
        evidenceQuote: quote,
        unknowns: [
          {
            item: "Registration requirements & terms",
            howToVerify:
              "Ask in writing: what does 'registration' involve, and is any fee required at any stage?",
          },
        ],
      });
    }
  }
  return hits;
};

/**
 * CHN-001: Free personal email provider used for official communications
 */
export const ruleChn001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(ctx.normalizedText)) !== null) {
    const domain = match[1];
    if (isFreeMailDomain(domain)) {
      const quote = match[0];
      hits.push({
        ruleId: "CHN-001",
        category: "channel",
        severity: "medium",
        title: "Sender using free public email service",
        whyItMatters:
          "Authorized recruiters and university officials write from their company's registered domain (e.g. name@company.com), not public webmail accounts.",
        evidenceQuote: quote,
        unknowns: [
          {
            item: "Recruiter identity and company email domain",
            howToVerify:
              "Request the recruiter to send the communication from their official corporate email address.",
          },
        ],
      });
      break;
    }
  }
  return hits;
};

/**
 * CHN-002: Pressure to communicate only through WhatsApp, Telegram, or personal phone
 */
export const ruleChn002: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:contact\s*(?:only\s*)?(?:on|via)\s*telegram|join\s*(?:our\s*)?telegram\s*(?:group|channel)|message\s*(?:me\s*)?on\s*whatsapp|telegram\s*(?:id|username):?\s*@[\w_]+|dm\s*on\s*telegram|t\.me\/[\w_]+)/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "CHN-002",
      category: "channel",
      severity: "medium",
      title: "Communication channeled exclusively via Telegram or WhatsApp",
      whyItMatters:
        "Moving discussions to encrypted messaging platforms enables bad actors to avoid corporate compliance tracking and delete chat logs.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * CHN-003: URL shorteners used
 */
export const ruleChn003: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex =
    /(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|cutt\.ly|t\.co|is\.gd|rebrand\.ly|rb\.gy|shorturl\.at|buff\.ly)\/[a-zA-Z0-9_\-]+/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "CHN-003",
      category: "channel",
      severity: "medium",
      title: "Shortened link obscures real destination URL",
      whyItMatters:
        "Link shorteners conceal the true destination hostname, making it difficult to verify whether it leads to an official site or a credential phishing page.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * CHN-004: Link domain does not match claimed organization's official domain
 */
export const ruleChn004: RuleDefinition = (_ctx) => {
  // Evaluated during full pipeline integration when matched registry org is present
  return [];
};

/**
 * SND-001: Display name / email / claimed organization inconsistent (High)
 */
export const ruleSnd001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  // If claimed org is provided and sender email contains a free mail or conflicting domain
  if (ctx.claimedOrg && ctx.senderEmail) {
    const domain = ctx.senderDomain?.toLowerCase() || "";

    if (isFreeMailDomain(domain)) {
      hits.push({
        ruleId: "SND-001",
        category: "sender_identity",
        severity: "high",
        title: "Sender identity mismatch: claimed organization uses public personal email",
        whyItMatters:
          `The offer claims to represent '${ctx.claimedOrg}', but the sender address is on a personal webmail host (${domain}).`,
        evidenceQuote: ctx.senderEmail,
      });
    }
  }
  return hits;
};

/**
 * SND-002: Email domain is a lookalike of a registry organization or known brand (Hard Disqualifier)
 */
export const ruleSnd002: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const domainsToCheck = new Set<string>();
  if (ctx.senderDomain) domainsToCheck.add(ctx.senderDomain.toLowerCase());
  if (ctx.senderEmail) {
    const d = ctx.senderEmail.split("@")[1];
    if (d) domainsToCheck.add(d.toLowerCase());
  }

  // Also check email domains and URLs found in message body
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  let emMatch;
  while ((emMatch = emailRegex.exec(ctx.rawText)) !== null) {
    domainsToCheck.add(emMatch[1].toLowerCase());
  }

  const urlRegex = /\bhttps?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(ctx.rawText)) !== null) {
    domainsToCheck.add(urlMatch[1].toLowerCase());
  }

  for (const domain of domainsToCheck) {
    const res = checkLookalikeDomain(domain);
    if (res.isLookalike) {
      hits.push({
        ruleId: "SND-002",
        category: "sender_identity",
        severity: "critical",
        hardDisqualifier: true,
        title: `Sender domain is a lookalike impersonation of ${res.brandName}`,
        whyItMatters: res.reason || "Domain impersonates a known brand.",
        evidenceQuote: domain,
      });
    }
  }
  return hits;
};

/**
 * SND-003: Sender domain unrelated to claimed registry organization (Medium)
 */
export const ruleSnd003: RuleDefinition = (_ctx) => {
  // Evaluated during pipeline integration
  return [];
};

/**
 * SND-004: Misleading local-part or subdomain impersonation (Hard Disqualifier)
 * e.g., hr.microsoft.careers@gmail.com, careers@google-jobs-india.net, microsoft.com.apply-now.net
 */
export const ruleSnd004: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const email = ctx.senderEmail?.toLowerCase();

  const brandKeywords = ["microsoft", "google", "amazon", "apple", "tcs", "infosys", "wipro"];

  if (email) {
    const [localPart, emailDomain] = email.split("@");
    if (localPart && emailDomain) {
      // Local part contains brand keyword while domain is a free mail provider
      if (isFreeMailDomain(emailDomain)) {
        for (const brand of brandKeywords) {
          if (localPart.includes(brand)) {
            hits.push({
              ruleId: "SND-004",
              category: "sender_identity",
              severity: "critical",
              hardDisqualifier: true,
              title: "Misleading brand impersonation in email username",
              whyItMatters:
                `The sender uses '${localPart}' on a free '${emailDomain}' host to falsely imply official affiliation with ${brand}.`,
              evidenceQuote: email,
            });
            return hits;
          }
        }
      }

      // Subdomain spoofing: e.g. microsoft.com.apply-now.net
      if (emailDomain.includes(".com.") || emailDomain.includes(".org.") || emailDomain.includes(".in.")) {
        hits.push({
          ruleId: "SND-004",
          category: "sender_identity",
          severity: "critical",
          hardDisqualifier: true,
          title: "Subdomain deception impersonating official domain",
          whyItMatters:
            "The email domain embeds a reputable domain structure inside a third-party host.",
          evidenceQuote: emailDomain,
        });
        return hits;
      }
    }
  }

  // Also check text for such patterns
  const spoofedRegex = /[a-zA-Z0-9._%+-]*(?:microsoft|google|amazon|tcs|infosys)[a-zA-Z0-9._%+-]*@(gmail\.com|yahoo\.com|outlook\.com)/i;
  if (spoofedRegex.test(ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, spoofedRegex);
    hits.push({
      ruleId: "SND-004",
      category: "sender_identity",
      severity: "critical",
      hardDisqualifier: true,
      title: "Misleading brand impersonation in email username",
      whyItMatters:
        "The sender creates fake email addresses embedding brand names inside personal webmail providers.",
      evidenceQuote: quote,
    });
  }

  return hits;
};

/**
 * SND-005: Email header authentication failed in supplied headers (High)
 */
export const ruleSnd005: RuleDefinition = (_ctx) => {
  // Evaluated when email headers are parsed
  return [];
};

/**
 * REP-001: Sender identifier matched reported or confirmed record
 */
export const ruleRep001: RuleDefinition = (_ctx) => {
  // Evaluated during reported db lookup
  return [];
};

/**
 * LNK-001: Hyperlinks detected in communication
 */
export const ruleLnk001: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const regex = /https?:\/\/[^\s<>"'{}|\\^`[\]]+/i;

  if (testRegex(regex, ctx.normalizedText)) {
    const quote = extractQuote(ctx.rawText, regex);
    hits.push({
      ruleId: "LNK-001",
      category: "link",
      severity: "info",
      title: "Hyperlinks detected in communication",
      whyItMatters:
        "The message contains web links. Use Jaanch's Link Checker to inspect domain age and lookalike status before clicking.",
      evidenceQuote: quote,
    });
  }
  return hits;
};

/**
 * SND-006: Reserved or placeholder domain used (.invalid, .test, .example, .localhost, example.com/.net/.org)
 */
export const ruleSnd006: RuleDefinition = (ctx) => {
  const hits: RuleHit[] = [];
  const reservedRegex =
    /\b[a-zA-Z0-9.-]+\.(?:invalid|test|example|localhost)\b|\bexample\.(?:com|net|org)\b/i;

  const textMatch = ctx.rawText.match(reservedRegex);
  const domainMatch = ctx.senderDomain && reservedRegex.test(ctx.senderDomain);

  if (textMatch || domainMatch) {
    const quote = (textMatch ? textMatch[0] : ctx.senderDomain) || "reserved domain";
    hits.push({
      ruleId: "SND-006",
      category: "sender_identity",
      severity: "info",
      hardDisqualifier: false,
      title: "Reserved or placeholder domain detected",
      whyItMatters:
        "This domain is reserved and cannot belong to a real organization — it looks like a test or placeholder.",
      evidenceQuote: quote,
      unknowns: [
        {
          item: "Real official organization domain",
          howToVerify:
            "Find the organization's official website yourself and check whether this email domain appears there.",
        },
      ],
    });
  }
  return hits;
};

export const ALL_RULES: readonly RuleDefinition[] = [
  rulePay001,
  rulePay002,
  rulePay003,
  rulePay004,
  rulePay005,
  rulePay006,
  rulePay007,
  rulePay008,
  rulePay009,
  ruleDat001,
  ruleDat002,
  ruleDat003,
  ruleDat004,
  ruleDat005,
  ruleDat006,
  ruleUrg001,
  ruleUrg002,
  ruleUrg003,
  ruleUrg004,
  ruleCnt001,
  ruleMis001,
  ruleMis002,
  ruleMis003,
  ruleMis004,
  ruleMis005,
  ruleMis006,
  ruleMis007,
  ruleChn001,
  ruleChn002,
  ruleChn003,
  ruleChn004,
  ruleSnd001,
  ruleSnd002,
  ruleSnd003,
  ruleSnd004,
  ruleSnd005,
  ruleSnd006,
  ruleRep001,
  ruleTgb001,
  ruleTgb002,
  ruleTgb003,
  ruleTgb004,
  ruleRec001,
  ruleGov001,
  ruleLnk001,
];

