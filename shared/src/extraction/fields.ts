import {
  ExtractedFields,
  ExtractedFieldItem,
  CheckRow,
  CompletenessResult,
  CompletenessDetail,
} from "../schemas/index.js";
import { extractQuote } from "../rules/normalize.js";
import { extractEntities } from "./entities.js";

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

export function extractOfferFields(text: string, claimedOrg?: string): ExtractedFields {
  const entities = extractEntities(text);

  // 1. Organization
  let organization: ExtractedFieldItem | null = null;
  if (claimedOrg && claimedOrg.trim().length >= 2 && text.toLowerCase().includes(claimedOrg.toLowerCase())) {
    const idx = text.toLowerCase().indexOf(claimedOrg.toLowerCase());
    organization = {
      value: text.slice(idx, idx + claimedOrg.length),
      evidenceQuote: text.slice(Math.max(0, idx - 15), Math.min(text.length, idx + claimedOrg.length + 15)),
      source: "rule",
    };
  } else if (entities.organizationCandidates.length > 0) {
    const topOrg = entities.organizationCandidates[0];
    organization = {
      value: topOrg.name,
      evidenceQuote: topOrg.evidenceQuote,
      source: "rule",
    };
  } else {
    const orgRegex =
      /(?:(?:at|for|by|from|with)\s+)?([A-Z][a-zA-Z0-9&.\s]{2,40}(?:Pvt\.?\s*Ltd\.?|Limited|Technologies|Solutions|Corporation|Foundation|University|Labs|Infotech))/i;
    const orgMatch = text.match(orgRegex);
    if (orgMatch && orgMatch[1]) {
      organization = {
        value: orgMatch[1].trim(),
        evidenceQuote: extractQuote(text, orgRegex),
        source: "rule",
      };
    }
  }

  // 2. Role or Program (explicit title or program name, not generic 'an opportunity')
  let roleOrProgram: ExtractedFieldItem | null = null;
  const roleRegex =
    /(?:(?:position|role|post)\s*(?:of|as)?\s*[:\-]?\s*([A-Za-z0-9&/\s\-]{3,45}(?:Intern(?:ship)?|Engineer|Developer|Analyst|Associate|Specialist|Manager|Consultant|Executive|Fellowship|Scholarship)))|(?:\b([A-Za-z\s]{3,40}(?:Internship|Fellowship|Scholarship))\b)/i;
  const roleMatch = text.match(roleRegex);
  if (roleMatch && (roleMatch[1] || roleMatch[2])) {
    const rawRole = (roleMatch[1] || roleMatch[2]).trim();
    if (!/^(?:an|the|this)?\s*opportunity$/i.test(rawRole)) {
      roleOrProgram = {
        value: rawRole,
        evidenceQuote: extractQuote(text, roleRegex),
        source: "rule",
      };
    }
  }

  // 3. Eligibility
  // Must be explicit requirement phrasing: degree/branch/year, minimum CGPA, skills required, 'eligible if/for', 'open to students of'
  // Does NOT count: descriptions of candidate ('willingness to learn', 'suitable candidate')
  let eligibility: ExtractedFieldItem | null = null;
  const eligRegex =
    /(?:eligibilit(?:y|ies)\s*(?:criteria)?|who\s*is\s*eligible|eligible\s*(?:if|for)|open\s*to\s*students\s*of|minimum\s*(?:cgpa|percentage|marks)|degree\s*required|qualification\s*required|mandatory\s*skills|prerequisites?)\s*[:\-]?\s*([^\n.;]{4,80})/i;
  const eligMatch = text.match(eligRegex);
  if (eligMatch) {
    const matchedVal = eligMatch[0].trim();
    // Guard against generic candidate descriptions
    if (!/willingness\s*to\s*learn|suitable\s*candidate|initial\s*review/i.test(matchedVal)) {
      eligibility = {
        value: matchedVal,
        evidenceQuote: extractQuote(text, eligRegex),
        source: "rule",
      };
    }
  }

  // 4. Location or Work Mode
  // city, 'remote', 'work from home', 'hybrid', 'onsite'
  let locationOrMode: ExtractedFieldItem | null = null;
  const locRegex =
    /(?:(?:work\s*mode|location|job\s*location)\s*[:\-]?\s*(?:[^\n.;]{2,30}))|(?:work\s*from\s*home|wfh|remote|hybrid|onsite|in-?office|bangalore|bengaluru|hyderabad|pune|mumbai|delhi|noida|gurugram|chennai|kolkata)/i;
  const locMatch = text.match(locRegex);
  if (locMatch) {
    locationOrMode = {
      value: locMatch[0].trim(),
      evidenceQuote: extractQuote(text, locRegex),
      source: "rule",
    };
  }

  // 5. Duration or Event Date
  // duration, start date, or event date
  let duration: ExtractedFieldItem | null = null;
  const durRegex =
    /(?:(?:proposed\s*)?start\s*date|event\s*date|date\s*of\s*joining|joining\s*date)\s*[:\-]?\s*([^\n.;]{4,30})|(?:duration|tenure|period)\s*[:\-]?\s*(\d+\s*(?:weeks?|months?|days?|years?))|(\d+[\s\-]*(?:weeks?|months?)\s*(?:internship|program)?)/i;
  const durMatch = text.match(durRegex);
  if (durMatch) {
    duration = {
      value: (durMatch[1] || durMatch[2] || durMatch[3] || durMatch[0]).trim(),
      evidenceQuote: extractQuote(text, durRegex),
      source: "rule",
    };
  }

  // 6. Compensation
  // stipend/salary/scholarship/prize amount or explicit 'unpaid'
  // Does NOT count: 'attractive stipend' without amount
  let compensation: ExtractedFields["compensation"] = null;
  const compRegex =
    /(?:stipend|salary|compensation|reward|prize|grant)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(?:per\s*month|\/month|\/pm|per\s*annum|\/annum|lpa)?|(?:(?:unpaid|without\s*stipend|nil\s*stipend|voluntary)\s*(?:internship|role|position)?)/i;
  const compMatch = text.match(compRegex);
  if (compMatch) {
    const rawTextMatched = compMatch[0].trim();
    if (/unpaid|without\s*stipend/i.test(rawTextMatched)) {
      compensation = {
        value: {
          kind: "stipend",
          amountInr: 0,
          period: "month",
          raw: "Unpaid",
        },
        evidenceQuote: extractQuote(text, compRegex),
        source: "rule",
      };
    } else {
      const rawNum = compMatch[1]?.replace(/,/g, "");
      const amountInr = rawNum ? parseInt(rawNum, 10) : undefined;
      const kind: "stipend" | "salary" | "scholarship" | "prize" =
        /stipend/i.test(rawTextMatched)
          ? "stipend"
          : /scholarship|grant/i.test(rawTextMatched)
          ? "scholarship"
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
        evidenceQuote: extractQuote(text, compRegex),
        source: "rule",
      };
    }
  }

  // 7. Selection Process
  // named step(s): interview, test/assessment, round, group discussion, shortlist criteria or evaluation method before offer
  // Does NOT count: 'initial review of your profile', 'shortlisted' alone, or onboarding instructions
  let selectionProcess: ExtractedFieldItem | null = null;
  const procRegex =
    /(?:selection\s*process|evaluation\s*(?:process|method)|interview\s*rounds?|technical\s*interview|hr\s*interview|coding\s*assessment|online\s*assessment|online\s*test|group\s*discussion|written\s*test|shortlisting\s*criteria)\s*[:\-]?\s*([^\n.;]{4,60})/i;
  const procMatch = text.match(procRegex);
  if (procMatch) {
    selectionProcess = {
      value: procMatch[0].trim(),
      evidenceQuote: extractQuote(text, procRegex),
      source: "rule",
    };
  }

  // 8. Deadline
  // explicit application/response date or 'apply by/before <date>'
  // Does NOT count: relative onboarding windows (e.g. 'within 48 hours')
  let deadline: ExtractedFieldItem | null = null;
  const ddlRegex =
    /(?:deadline|last\s*date(?:\s*to\s*apply)?|apply\s*(?:before|by)|applications?\s*close\s*on|valid\s*till|expires\s*on)\s*[:\-]?\s*([^\n,;]{4,35})/i;
  const ddlMatch = text.match(ddlRegex);
  if (ddlMatch) {
    const rawVal = ddlMatch[1]?.trim() || ddlMatch[0].trim();
    // Verify it is not a relative onboarding window
    if (!/within\s*\d+\s*(?:hours|days)|48\s*hours|24\s*hours|immediately/i.test(rawVal)) {
      const parsedIso = parseIndianDate(rawVal);
      deadline = {
        value: parsedIso || rawVal,
        evidenceQuote: extractQuote(text, ddlRegex),
        source: "rule",
      };
    }
  }

  // 9. Official Contact Channel
  // an email/phone/portal for the organization
  let contactChannel: ExtractedFieldItem | null = null;
  if (entities.emails.length > 0) {
    const email = entities.emails[0];
    contactChannel = {
      value: email.value,
      evidenceQuote: email.evidenceQuote,
      source: "rule",
    };
  } else if (entities.phones.length > 0) {
    const phone = entities.phones[0];
    contactChannel = {
      value: phone.value,
      evidenceQuote: phone.evidenceQuote,
      source: "rule",
    };
  }

  // 10. Official Website or Application Link
  // a URL/domain for the organization or application portal
  // Does NOT count: an email address
  let officialLink: ExtractedFieldItem | null = null;
  if (entities.urls.length > 0) {
    // Select first URL that is not just an email domain
    const candidateUrl = entities.urls[0];
    officialLink = {
      value: candidateUrl.value,
      evidenceQuote: candidateUrl.evidenceQuote,
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
