import {
  ExtractedFields,
  ListingComparison,
  ListingFieldComparison,
} from "../schemas/index.js";

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(
    a
      .toLowerCase()
      .split(/\W+/)
      .filter((s) => s.length > 1)
  );
  const setB = new Set(
    b
      .toLowerCase()
      .split(/\W+/)
      .filter((s) => s.length > 1)
  );
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Normalize duration string into approximate weeks.
 * e.g., "2 months" -> 8 weeks, "6 months" -> 26 weeks, "8 weeks" -> 8 weeks
 */
export function normalizeDurationWeeks(dur: string): number | null {
  const clean = dur.toLowerCase().trim();
  const monthMatch = clean.match(/(\d+)\s*months?/);
  if (monthMatch) {
    return parseInt(monthMatch[1], 10) * 4.33;
  }
  const weekMatch = clean.match(/(\d+)\s*weeks?/);
  if (weekMatch) {
    return parseInt(weekMatch[1], 10);
  }
  const dayMatch = clean.match(/(\d+)\s*days?/);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10) / 7;
  }
  return null;
}

/**
 * Normalize compensation string to numeric INR amount.
 * e.g., "10,000", "10k" -> 10000, "1.5 lakh" -> 150000
 */
export function normalizeCompensationInr(comp: string): number | null {
  const clean = comp.toLowerCase().replace(/[,₹]/g, "").trim();

  const lakhMatch = clean.match(/([\d.]+)\s*lakh/);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  const kMatch = clean.match(/([\d.]+)\s*k\b/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  const numMatch = clean.match(/\b(\d{3,9})\b/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return null;
}

export function compareListing(
  offerFields: ExtractedFields,
  listingFields: ExtractedFields,
  options?: {
    sourceType?: "platform_fetch" | "pasted_text";
    listingUrl?: string;
    orgOfficialDomains?: string[];
  }
): ListingComparison {
  const comparedFields: ListingFieldComparison[] = [];
  let organizationMatched = false;
  let roleMatched = false;
  let hasMismatches = false;
  let matchedFieldsCount = 0;

  // 1. Organization Comparison
  const offerOrg = offerFields.organization?.value || null;
  const listOrg = listingFields.organization?.value || null;
  if (!offerOrg || !listOrg) {
    comparedFields.push({
      field: "organization",
      offerValue: offerOrg,
      listingValue: listOrg,
      outcome: "unknown",
      detail: "Organization missing from offer or listing.",
    });
  } else {
    const sim = jaccardSimilarity(offerOrg, listOrg);
    if (sim >= 0.5 || offerOrg.toLowerCase() === listOrg.toLowerCase()) {
      organizationMatched = true;
      matchedFieldsCount++;
      comparedFields.push({
        field: "organization",
        offerValue: offerOrg,
        listingValue: listOrg,
        outcome: "match",
        detail: `Organization matched: '${offerOrg}' ≈ '${listOrg}'.`,
      });
    } else {
      hasMismatches = true;
      comparedFields.push({
        field: "organization",
        offerValue: offerOrg,
        listingValue: listOrg,
        outcome: "mismatch",
        detail: `Organization mismatch: offer stated '${offerOrg}' but listing stated '${listOrg}'.`,
      });
    }
  }

  // 2. Role Title Comparison
  const offerRole = offerFields.roleOrProgram?.value || null;
  const listRole = listingFields.roleOrProgram?.value || null;
  if (!offerRole || !listRole) {
    comparedFields.push({
      field: "roleOrProgram",
      offerValue: offerRole,
      listingValue: listRole,
      outcome: "unknown",
      detail: "Role title missing on one side.",
    });
  } else {
    const sim = jaccardSimilarity(offerRole, listRole);
    if (sim >= 0.5 || offerRole.toLowerCase().includes(listRole.toLowerCase()) || listRole.toLowerCase().includes(offerRole.toLowerCase())) {
      roleMatched = true;
      matchedFieldsCount++;
      comparedFields.push({
        field: "roleOrProgram",
        offerValue: offerRole,
        listingValue: listRole,
        outcome: "match",
        detail: `Role title matched: '${offerRole}' and '${listRole}'.`,
      });
    } else {
      hasMismatches = true;
      comparedFields.push({
        field: "roleOrProgram",
        offerValue: offerRole,
        listingValue: listRole,
        outcome: "mismatch",
        detail: `Role title mismatch: '${offerRole}' does not match official listing '${listRole}'.`,
      });
    }
  }

  // 3. Duration Comparison (tolerance: +-1 week)
  const offerDur = offerFields.duration?.value || null;
  const listDur = listingFields.duration?.value || null;
  if (!offerDur || !listDur) {
    comparedFields.push({
      field: "duration",
      offerValue: offerDur,
      listingValue: listDur,
      outcome: "unknown",
      detail: "Duration missing on one side.",
    });
  } else {
    const weeksOffer = normalizeDurationWeeks(offerDur);
    const weeksList = normalizeDurationWeeks(listDur);
    if (weeksOffer !== null && weeksList !== null) {
      if (Math.abs(weeksOffer - weeksList) <= 1.5) {
        matchedFieldsCount++;
        comparedFields.push({
          field: "duration",
          offerValue: offerDur,
          listingValue: listDur,
          outcome: "match",
          detail: `Duration matched (${offerDur} ≈ ${listDur}).`,
        });
      } else {
        hasMismatches = true;
        comparedFields.push({
          field: "duration",
          offerValue: offerDur,
          listingValue: listDur,
          outcome: "mismatch",
          detail: `Duration mismatch: offer claims ${offerDur} but official listing specifies ${listDur}.`,
        });
      }
    } else {
      comparedFields.push({
        field: "duration",
        offerValue: offerDur,
        listingValue: listDur,
        outcome: "unknown",
        detail: "Could not parse duration into normalized weeks.",
      });
    }
  }

  // 4. Compensation Comparison (0% numeric tolerance)
  const offerComp =
    offerFields.compensation?.value.amountInr ??
    (offerFields.compensation ? normalizeCompensationInr(offerFields.compensation.value.raw) : null);
  const listComp =
    listingFields.compensation?.value.amountInr ??
    (listingFields.compensation ? normalizeCompensationInr(listingFields.compensation.value.raw) : null);

  if (offerComp === null || listComp === null) {
    comparedFields.push({
      field: "compensation",
      offerValue: offerFields.compensation?.value.raw || null,
      listingValue: listingFields.compensation?.value.raw || null,
      outcome: "unknown",
      detail: "Compensation amount missing on one side.",
    });
  } else {
    if (offerComp === listComp) {
      matchedFieldsCount++;
      comparedFields.push({
        field: "compensation",
        offerValue: `₹${offerComp}`,
        listingValue: `₹${listComp}`,
        outcome: "match",
        detail: `Compensation amount matched exactly: ₹${offerComp}.`,
      });
    } else {
      hasMismatches = true;
      comparedFields.push({
        field: "compensation",
        offerValue: `₹${offerComp}`,
        listingValue: `₹${listComp}`,
        outcome: "mismatch",
        detail: `Compensation mismatch: offer states ₹${offerComp} but official listing specifies ₹${listComp}.`,
      });
    }
  }

  // 5. Deadline Comparison
  const offerDdl = offerFields.deadline?.value || null;
  const listDdl = listingFields.deadline?.value || null;
  if (!offerDdl || !listDdl) {
    comparedFields.push({
      field: "deadline",
      offerValue: offerDdl,
      listingValue: listDdl,
      outcome: "unknown",
      detail: "Deadline not stated on one side.",
    });
  } else {
    if (offerDdl === listDdl) {
      matchedFieldsCount++;
      comparedFields.push({
        field: "deadline",
        offerValue: offerDdl,
        listingValue: listDdl,
        outcome: "match",
        detail: `Application deadline matched: ${offerDdl}.`,
      });
    } else {
      hasMismatches = true;
      comparedFields.push({
        field: "deadline",
        offerValue: offerDdl,
        listingValue: listDdl,
        outcome: "mismatch",
        detail: `Deadline mismatch: offer deadline ${offerDdl} differs from listing ${listDdl}.`,
      });
    }
  }

  // Determine overall status
  let status: ListingComparison["status"] = "unknown";
  if (hasMismatches) {
    status = "mismatch";
  } else if (organizationMatched && roleMatched && matchedFieldsCount >= 2) {
    status = "match";
  } else if (organizationMatched || roleMatched) {
    status = "partial";
  }

  return {
    status,
    sourceType: options?.sourceType || null,
    listingUrl: options?.listingUrl || null,
    organizationMatched,
    roleMatched,
    hasMismatches,
    matchedFieldsCount,
    comparedFields,
    notes: hasMismatches
      ? "Discrepancies exist between the received offer details and the official source."
      : organizationMatched && roleMatched
      ? "Core role and organization details match the official listing."
      : "Incomplete listing comparison data.",
  };
}
