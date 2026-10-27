import { getDomain } from "tldts";
import { HeaderAnalysis } from "../schemas/index.js";
import { parseEmailAddress } from "./email.js";

type AuthOutcome =
  | "pass"
  | "fail"
  | "softfail"
  | "neutral"
  | "none"
  | "temperror"
  | "permerror"
  | "unknown";

function normalizeAuthValue(val: string | undefined): AuthOutcome {
  if (!val) return "unknown";
  const clean = val.toLowerCase().trim();
  if (
    clean === "pass" ||
    clean === "fail" ||
    clean === "softfail" ||
    clean === "neutral" ||
    clean === "none" ||
    clean === "temperror" ||
    clean === "permerror"
  ) {
    return clean;
  }
  return "unknown";
}

export function parseEmailHeaders(raw: string): HeaderAnalysis {
  if (!raw || typeof raw !== "string") {
    return {
      from: null,
      replyTo: null,
      returnPath: null,
      receivedChainCount: 0,
      firstHost: null,
      lastHost: null,
      authResults: {
        spf: "unknown",
        dkim: "unknown",
        dmarc: "unknown",
      },
      dkimDomain: null,
      alignment: {
        spf: null,
        dkim: null,
      },
      mismatches: [],
    };
  }

  // Cap at 20,000 characters
  const truncated = raw.slice(0, 20000);

  // Unfold continuation lines (RFC 5322: lines starting with space or tab fold into previous line)
  const lines = truncated.split(/\r?\n/);
  const unfolded: string[] = [];
  for (const line of lines) {
    if (/^\s+[^\s]/.test(line) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += " " + line.trim();
    } else if (line.trim().length > 0) {
      unfolded.push(line);
    }
  }

  // Parse header map
  const headers = new Map<string, string[]>();
  for (const line of unfolded) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const name = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();
      const existing = headers.get(name) || [];
      existing.push(value);
      headers.set(name, existing);
    }
  }

  // From, Reply-To, Return-Path
  const fromHeader = headers.get("from")?.[0] || null;
  const replyToHeader = headers.get("reply-to")?.[0] || null;
  const returnPathHeader = headers.get("return-path")?.[0] || null;

  const parsedFrom = fromHeader ? parseEmailAddress(fromHeader) : null;
  const parsedReplyTo = replyToHeader ? parseEmailAddress(replyToHeader) : null;
  const parsedReturnPath = returnPathHeader
    ? parseEmailAddress(returnPathHeader)
    : null;

  // Received chain
  const receivedList = headers.get("received") || [];
  const receivedChainCount = receivedList.length;
  let firstHost: string | null = null;
  let lastHost: string | null = null;

  if (receivedList.length > 0) {
    // First received (top of message, closest to destination)
    const topMatch = receivedList[0].match(/from\s+([^\s;()]+)/i);
    firstHost = topMatch ? topMatch[1].toLowerCase() : null;

    // Last received (bottom of message, closest to origin)
    const bottomMatch = receivedList[receivedList.length - 1].match(
      /from\s+([^\s;()]+)/i
    );
    lastHost = bottomMatch ? bottomMatch[1].toLowerCase() : null;
  }

  // Authentication-Results and Received-SPF
  let spfOutcome: AuthOutcome = "unknown";
  let dkimOutcome: AuthOutcome = "unknown";
  let dmarcOutcome: AuthOutcome = "unknown";

  const authResults = headers.get("authentication-results");
  if (authResults && authResults.length > 0) {
    const authCombined = authResults.join(" ");

    // SPF match in Authentication-Results
    const spfMatch = authCombined.match(
      /\bspf=([a-z]+)(?:\s|\(|$|;)/i
    );
    if (spfMatch) {
      spfOutcome = normalizeAuthValue(spfMatch[1]);
    }

    // DKIM match in Authentication-Results
    const dkimMatch = authCombined.match(
      /\bdkim=([a-z]+)(?:\s|\(|$|;)/i
    );
    if (dkimMatch) {
      dkimOutcome = normalizeAuthValue(dkimMatch[1]);
    }

    // DMARC match in Authentication-Results
    const dmarcMatch = authCombined.match(
      /\bdmarc=([a-z]+)(?:\s|\(|$|;)/i
    );
    if (dmarcMatch) {
      dmarcOutcome = normalizeAuthValue(dmarcMatch[1]);
    }
  }

  // Fallback to Received-SPF header if SPF was not found in Authentication-Results
  if (spfOutcome === "unknown") {
    const recSpf = headers.get("received-spf")?.[0];
    if (recSpf) {
      const match = recSpf.match(/^([a-z]+)/i);
      if (match) {
        spfOutcome = normalizeAuthValue(match[1]);
      }
    }
  }

  // DKIM d= domain from DKIM-Signature
  let dkimDomain: string | null = null;
  const dkimSigs = headers.get("dkim-signature") || [];
  for (const sig of dkimSigs) {
    const dMatch = sig.match(/\bd=([a-zA-Z0-9.-]+)/i);
    if (dMatch) {
      dkimDomain = dMatch[1].toLowerCase();
      break;
    }
  }

  // Alignment checks
  let spfAlignment: boolean | null = null;
  let dkimAlignment: boolean | null = null;

  const fromDomain = parsedFrom?.domain || null;
  const fromRegDomain = fromDomain ? getDomain(fromDomain) || fromDomain : null;

  if (fromRegDomain && parsedReturnPath?.domain) {
    const retRegDomain =
      getDomain(parsedReturnPath.domain) || parsedReturnPath.domain;
    spfAlignment = fromRegDomain === retRegDomain;
  }

  if (fromRegDomain && dkimDomain) {
    const dkimRegDomain = getDomain(dkimDomain) || dkimDomain;
    dkimAlignment = fromRegDomain === dkimRegDomain;
  }

  // Domain mismatches
  const mismatches: string[] = [];
  if (
    fromRegDomain &&
    parsedReplyTo?.domain &&
    fromRegDomain !== (getDomain(parsedReplyTo.domain) || parsedReplyTo.domain)
  ) {
    mismatches.push(
      `From domain (${fromDomain}) does not align with Reply-To domain (${parsedReplyTo.domain}).`
    );
  }

  if (
    fromRegDomain &&
    parsedReturnPath?.domain &&
    fromRegDomain !== (getDomain(parsedReturnPath.domain) || parsedReturnPath.domain)
  ) {
    mismatches.push(
      `From domain (${fromDomain}) does not align with Return-Path domain (${parsedReturnPath.domain}).`
    );
  }

  return {
    from: parsedFrom?.email || fromHeader,
    replyTo: parsedReplyTo?.email || replyToHeader,
    returnPath: parsedReturnPath?.email || returnPathHeader,
    receivedChainCount,
    firstHost,
    lastHost,
    authResults: {
      spf: spfOutcome,
      dkim: dkimOutcome,
      dmarc: dmarcOutcome,
    },
    dkimDomain,
    alignment: {
      spf: spfAlignment,
      dkim: dkimAlignment,
    },
    mismatches,
  };
}

export const HEADER_COPY_HELP = {
  gmail: {
    client: "Gmail",
    steps: [
      "Open the email in Gmail on your computer.",
      "Click the three vertical dots (More options) next to the Reply button on the top right.",
      "Select 'Show original' from the menu.",
      "Click 'Copy to clipboard' or copy all text from the header box.",
      "Paste into the Jaanch header box.",
    ],
  },
  outlook: {
    client: "Microsoft Outlook",
    steps: [
      "Open the email in Outlook (web or desktop).",
      "Click the three horizontal dots (...) in the top right of the message pane.",
      "Select View -> View message source (or Message Details).",
      "Press Ctrl+A to select all header text, then Ctrl+C to copy.",
      "Paste into the Jaanch header box.",
    ],
  },
  appleMail: {
    client: "Apple Mail",
    steps: [
      "Select the email in Apple Mail.",
      "From the top menu bar, click View -> Message -> All Headers (or press Option+Command+H).",
      "Select the header lines and press Command+C to copy.",
      "Paste into the Jaanch header box.",
    ],
  },
} as const;
