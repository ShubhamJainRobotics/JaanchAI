import {
  ExtractedFields,
  ExtractedFieldItem,
  CheckRow,
  CompletenessResult,
  CompletenessDetail,
  SenderInput,
} from "../schemas/index.js";
import { extractEntities } from "./entities.js";
import { extractOrganizationDecision } from "./organization.js";
import { findSpan } from "../text/spans.js";

function parseIndianDate(raw: string): string | null {
  // Matches dd/mm/yyyy or dd-mm-yyyy or dd Month yyyy
  const dmyMatch = raw.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  const monthNames = [
    "jan(?:uary)?",
    "feb(?:ruary)?",
    "mar(?:ch)?",
    "apr(?:il)?",
    "may",
    "jun(?:e)?",
    "jul(?:y)?",
    "aug(?:ust)?",
    "sep(?:tember)?",
    "oct(?:ober)?",
    "nov(?:ember)?",
    "dec(?:ember)?",
  ];
  const textualRegex = new RegExp(
    `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames.join("|")})\\s+(\\d{4})\\b`,
    "i"
  );
  const textMatch = raw.match(textualRegex);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthStr = textMatch[2].toLowerCase().slice(0, 3);
    const year = parseInt(textMatch[3], 10);
    const monthIdx = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].indexOf(monthStr);
    if (monthIdx >= 0) {
      const date = new Date(year, monthIdx, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
  }
  return null;
}

export function extractOfferFields(
  text: string,
  claimedOrg?: string,
  sender?: SenderInput
): ExtractedFields {
  const entities = extractEntities(text);
  const orgDecision = extractOrganizationDecision(text);

  // 1. Organization — completeness ticks only for confidence >= medium
  let organization: ExtractedFieldItem | null = null;
  if (
    claimedOrg &&
    claimedOrg.trim().length >= 2 &&
    text.toLowerCase().includes(claimedOrg.toLowerCase())
  ) {
    const idx = text.toLowerCase().indexOf(claimedOrg.toLowerCase());
    const span = findSpan(text, idx, claimedOrg.length);
    organization = {
      value: text.slice(idx, idx + claimedOrg.length),
      evidenceQuote: span.quote,
      source: "rule",
    };
  } else if (orgDecision.organization && (orgDecision.confidence === "high" || orgDecision.confidence === "medium")) {
    organization = {
      value: orgDecision.organization,
      evidenceQuote: orgDecision.evidenceQuote,
      source: "rule",
    };
  }

  // 2. Role or Program Title
  // <Words> Intern|Internship|Trainee|Apprentice|Analyst|Developer|Engineer|Writer|Designer|Associate|Executive|Fellow|Scholar
  // followed by optional role|position|program|opportunity
  // position of <Title>, hiring <title>, for the <Title> role, scholarship names
  let roleOrProgram: ExtractedFieldItem | null = null;
  const rolePatterns = [
    // Pattern 1: hiring <Title> (e.g. "hiring intern for content writting")
    /\bhiring\s+((?:[a-zA-Z\s]{0,30}?\s+)?(?:intern(?:ship)?|trainee|apprentice|analyst|developer|engineer|writer|designer|associate|executive|fellow|scholar)(?:\s+for\s+[a-zA-Z\s]{2,30})?)\s*(?:in|at|\.|\,|$)/i,
    // Pattern 2: position/role of/for <Title>
    /(?:(?:position|role|post)\s*(?:of|as|for)?\s*[:\-]?\s*([A-Za-z0-9&/\s\-]{2,50}?(?:Intern(?:ship)?|Engineer|Developer|Analyst|Associate|Specialist|Manager|Consultant|Executive|Fellow(?:ship)?|Scholar(?:ship)?|Trainee|Apprentice|Writer|Designer)))\b/i,
    // Pattern 3: Capitalized Title words before role/position/program/opportunity or stand-alone
    /\b((?:[A-Z][a-zA-Z0-9&/\-]*\s+){0,3}(?:Intern(?:ship)?|Trainee|Apprentice|Analyst|Developer|Engineer|Writer|Designer|Associate|Executive|Fellow|Scholar))\s*(?:role|position|program|opportunity)?\b/,
    // Pattern 4: Scholarship or Fellowship program title
    /\b([A-Z][a-zA-Z0-9&/\s\-]{3,50}?(?:Merit\s+Scholarship(?:\s+\d{4})?|Scholarship\s+Scheme|Fellowship\s+Program))\b/i,
  ];

  for (const regex of rolePatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      let rawRole = match[1].trim().replace(/\s+(?:at|in|with)$/i, "");
      rawRole = rawRole.replace(/^(?:for\s+(?:a\s+|an\s+|the\s+)?|as\s+(?:a\s+|an\s+)?|the\s+|a\s+|an\s+)/i, "").trim();
      if (
        !/^(?:an|the|this)?\s*opportunity$/i.test(rawRole) &&
        rawRole.length >= 4 &&
        match.index !== undefined
      ) {
        const span = findSpan(text, match.index, match[0].length);
        roleOrProgram = {
          value: rawRole,
          evidenceQuote: span.quote,
          source: "rule",
        };
        break;
      }
    }
  }

  // 3. Eligibility
  // Strict definition: whole requirement sentence via findSpan with wholeSentence: true
  let eligibility: ExtractedFieldItem | null = null;
  const eligRegex =
    /(?:eligibilit(?:y|ies)\s*(?:criteria)?|who\s*is\s*eligible|eligible\s*(?:if|for)|open\s*to\s*students\s*of|minimum\s*(?:cgpa|percentage|marks)|degree\s*required|qualification\s*required|mandatory\s*skills|prerequisites?)\s*[:\-]?\s*([^\n;]{4,150})/i;
  const eligMatch = text.match(eligRegex);
  if (eligMatch && eligMatch.index !== undefined) {
    const matchedVal = eligMatch[0].trim();
    if (!/willingness\s*to\s*learn|suitable\s*candidate|initial\s*review/i.test(matchedVal)) {
      const span = findSpan(text, eligMatch.index, eligMatch[0].length, { wholeSentence: true });
      eligibility = {
        value: span.quote,
        evidenceQuote: span.quote,
        source: "rule",
      };
    }
  }

  // 4. Location or Work Mode
  let locationOrMode: ExtractedFieldItem | null = null;
  const locRegex =
    /(?:(?:work\s*mode|location|job\s*location)\s*[:\-]?\s*(?:[^\n.;]{2,30}))|(?:work\s*from\s*home|wfh|remote|hybrid(?:\s*\([^)]*\))?|onsite|in-?office|bangalore|bengaluru|hyderabad|pune|mumbai|delhi|noida|gurugram|chennai|kolkata)/i;
  const locMatch = text.match(locRegex);
  if (locMatch && locMatch.index !== undefined) {
    const span = findSpan(text, locMatch.index, locMatch[0].length);
    locationOrMode = {
      value: locMatch[0].trim(),
      evidenceQuote: span.quote,
      source: "rule",
    };
  }

  // 5. Duration or Event Date
  let duration: ExtractedFieldItem | null = null;
  const durRegex =
    /(?:(?:proposed\s*)?start\s*date|event\s*date|date\s*of\s*joining|joining\s*date)\s*[:\-]?\s*([^\n.;]{4,30})|(?:duration|tenure|period)\s*[:\-]?\s*(\d+\s*(?:weeks?|months?|days?|years?))|(\b\d+[\s\-]*(?:weeks?|months?|days?)\b(?:\s*(?:internship|program))?)/i;
  const durMatch = text.match(durRegex);
  if (durMatch && durMatch.index !== undefined) {
    const span = findSpan(text, durMatch.index, durMatch[0].length);
    duration = {
      value: (durMatch[1] || durMatch[2] || durMatch[3] || durMatch[0]).trim(),
      evidenceQuote: span.quote,
      source: "rule",
    };
  }

  // 6. Compensation
  let compensation: ExtractedFields["compensation"] = null;
  const compRegex =
    /(?:stipend|salary|compensation|reward|prize|grant|worth|scholarship)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(?:rupees)?\s*(?:per\s*month|\/month|\/pm|per\s*annum|\/annum|lpa)?|(?:(?:unpaid|without\s*stipend|nil\s*stipend|voluntary)\s*(?:internship|role|position)?)/i;
  const compMatch = text.match(compRegex);
  if (compMatch && compMatch.index !== undefined) {
    const rawTextMatched = compMatch[0].trim();
    const span = findSpan(text, compMatch.index, compMatch[0].length);
    if (/unpaid|without\s*stipend/i.test(rawTextMatched)) {
      compensation = {
        value: {
          kind: "stipend",
          amountInr: 0,
          period: "month",
          raw: "Unpaid",
        },
        evidenceQuote: span.quote,
        source: "rule",
      };
    } else {
      const rawNum = compMatch[1]?.replace(/,/g, "");
      const amountInr = rawNum ? parseInt(rawNum, 10) : undefined;
      const kind: "stipend" | "salary" | "scholarship" | "prize" =
        /scholarship|grant|worth/i.test(rawTextMatched)
          ? "scholarship"
          : /stipend/i.test(rawTextMatched)
          ? "stipend"
          : /prize|reward/i.test(rawTextMatched)
          ? "prize"
          : "salary";

      const period = /per\s*month|\/month|\/pm/i.test(rawTextMatched)
        ? "month"
        : /per\s*annum|\/annum|lpa/i.test(rawTextMatched)
        ? "year"
        : "month";

      compensation = {
        value: {
          kind,
          amountInr,
          period,
          raw: rawTextMatched,
        },
        evidenceQuote: span.quote,
        source: "rule",
      };
    }
  }

  // 7. Selection Process
  // Named step(s): interview, assessment, test, round, group discussion, screening, shortlisting criteria, evaluation, aptitude, case study,
  // including misspellings like "a interview", "intervew".
  // Guard against "no interview"
  let selectionProcess: ExtractedFieldItem | null = null;
  const procRegex =
    /(?:(?:will\s*)?call\s*for\s*(?:an?|the)?\s*interv(?:iew|ew)|selection\s*process|evaluation\s*(?:process|method)|interview\s*rounds?|technical\s*interview|hr\s*interview|coding\s*assessment|online\s*assessment|online\s*test|group\s*discussion|written\s*test|shortlisting\s*criteria|aptitude(?:\s*test)?|case\s*study|technical\s*round|hr\s*round|screening\s*round|(?:technical|online|final)\s+interv(?:iew|ew))\b/i;

  const procMatch = text.match(procRegex);
  if (procMatch && procMatch.index !== undefined) {
    // Negation guard: ensure not preceded by "no", "without", "no interview needed/required"
    const windowStart = Math.max(0, procMatch.index - 25);
    const preceding = text.slice(windowStart, procMatch.index).toLowerCase();
    const isNegated = /\b(?:no|without|zero|never)\s*$/i.test(preceding);

    if (!isNegated) {
      const span = findSpan(text, procMatch.index, procMatch[0].length);
      selectionProcess = {
        value: procMatch[0].trim(),
        evidenceQuote: span.quote,
        source: "rule",
      };
    }
  }

  // 8. Deadline
  let deadline: ExtractedFieldItem | null = null;
  const ddlRegex =
    /(?:deadline|last\s*date(?:\s*to\s*apply)?|apply\s*(?:before|by)|applications?\s*close\s*on|valid\s*till|expires\s*on)\s*[:\-]?\s*([^\n,;]{4,35})/i;
  const ddlMatch = text.match(ddlRegex);
  if (ddlMatch && ddlMatch.index !== undefined) {
    const rawVal = ddlMatch[1]?.trim() || ddlMatch[0].trim();
    if (!/within\s*\d+\s*(?:hours|days)|48\s*hours|24\s*hours|immediately/i.test(rawVal)) {
      const parsedIso = parseIndianDate(rawVal);
      const span = findSpan(text, ddlMatch.index, ddlMatch[0].length);
      deadline = {
        value: parsedIso || rawVal,
        evidenceQuote: span.quote,
        source: "rule",
      };
    }
  }

  // 9. Official Contact Channel
  // Present if any email, phone, or portal in text OR supplied in sender.*
  let contactChannel: ExtractedFieldItem | null = null;
  if (entities.emails.length > 0) {
    const em = entities.emails[0];
    contactChannel = {
      value: em.value,
      evidenceQuote: em.evidenceQuote,
      source: "rule",
    };
  } else if (entities.phones.length > 0) {
    const ph = entities.phones[0];
    contactChannel = {
      value: ph.value,
      evidenceQuote: ph.evidenceQuote,
      source: "rule",
    };
  } else if (sender?.email) {
    contactChannel = {
      value: sender.email,
      evidenceQuote: `Supplied sender email: ${sender.email}`,
      source: "rule",
    };
  } else if (sender?.phone) {
    contactChannel = {
      value: sender.phone,
      evidenceQuote: `Supplied sender phone: ${sender.phone}`,
      source: "rule",
    };
  } else if (sender?.websiteUrl) {
    contactChannel = {
      value: sender.websiteUrl,
      evidenceQuote: `Supplied sender website: ${sender.websiteUrl}`,
      source: "rule",
    };
  }

  // 10. Official Website or Application Link
  let officialLink: ExtractedFieldItem | null = null;
  if (entities.urls.length > 0) {
    const candidateUrl = entities.urls[0];
    officialLink = {
      value: candidateUrl.value,
      evidenceQuote: candidateUrl.evidenceQuote,
      source: "rule",
    };
  } else if (sender?.websiteUrl) {
    officialLink = {
      value: sender.websiteUrl,
      evidenceQuote: `Supplied sender website: ${sender.websiteUrl}`,
      source: "rule",
    };
  }

  return {
    organization,
    roleOrProgram,
    eligibility,
    locationOrMode,
    duration,
    compensation,
    selectionProcess,
    deadline,
    contactChannel,
    officialLink,
  };
}

export function checkCompleteness(
  fields: ExtractedFields
): { completeness: CompletenessResult; checks: CheckRow[] } {
  const REQUIRED_SPECS: Array<{
    key: keyof ExtractedFields;
    label: string;
    missingReason: string;
  }> = [
    {
      key: "organization",
      label: "Organization name",
      missingReason: "No named employer or issuing organization specified in the offer text.",
    },
    {
      key: "roleOrProgram",
      label: "Role or program title",
      missingReason: "No specific position, job, or program title clearly stated.",
    },
    {
      key: "eligibility",
      label: "Eligibility criteria",
      missingReason: "No explicit eligibility requirements (degree, CGPA, graduation year, or skills required).",
    },
    {
      key: "locationOrMode",
      label: "Location or work mode",
      missingReason: "Work mode (remote, hybrid, onsite) or office location not specified.",
    },
    {
      key: "duration",
      label: "Duration or event date",
      missingReason: "Internship duration, start date, or event timeline not provided.",
    },
    {
      key: "compensation",
      label: "Stipend, salary, or prize details",
      missingReason: "Stipend/salary amount not stated (or marked unpaid).",
    },
    {
      key: "selectionProcess",
      label: "Selection and evaluation process",
      missingReason: "No interview, assessment test, or evaluation round specified before offer issuance.",
    },
    {
      key: "deadline",
      label: "Application deadline",
      missingReason: "No explicit application or response deadline date provided.",
    },
    {
      key: "contactChannel",
      label: "Official contact channel",
      missingReason: "No corporate email address, phone number, or official portal provided.",
    },
    {
      key: "officialLink",
      label: "Official website or application link",
      missingReason: "No official company website or verified portal link included.",
    },
  ];

  const present: string[] = [];
  const missing: string[] = [];
  const details: CompletenessDetail[] = [];
  const checks: CheckRow[] = [];

  for (const spec of REQUIRED_SPECS) {
    const fieldVal = fields[spec.key];
    if (fieldVal) {
      present.push(spec.label);
      details.push({
        key: spec.key,
        label: spec.label,
        present: true,
        evidenceQuote: fieldVal.evidenceQuote,
      });
      checks.push({
        checkKey: `field_${spec.key}`,
        label: spec.label,
        outcome: "pass",
        detail:
          typeof fieldVal.value === "object"
            ? (fieldVal.value as any).raw || "Present in offer details"
            : String(fieldVal.value),
        source: "rule",
      });
    } else {
      missing.push(spec.label);
      details.push({
        key: spec.key,
        label: spec.label,
        present: false,
        reason: spec.missingReason,
      });
      checks.push({
        checkKey: `field_${spec.key}`,
        label: spec.label,
        outcome: "unknown",
        detail: spec.missingReason,
        source: "rule",
      });
    }
  }

  return {
    completeness: {
      present,
      missing,
      score: present.length,
      details,
    },
    checks,
  };
}
