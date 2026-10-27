export interface DiscrepancyItem {
  field: string;
  offerValue: string | null;
  listingValue: string | null;
}

export function buildListingDiscrepancyPrompt(
  discrepancies: DiscrepancyItem[]
): string {
  const discrepancyLines = discrepancies
    .map(
      (d) =>
        `- Field: ${d.field} | Offer stated: "${d.offerValue || "Not stated"}" | Official listing stated: "${d.listingValue || "Not stated"}"`
    )
    .join("\n");

  return `Here are structured comparison discrepancies between an offer message received by a student and the official website listing:
${discrepancyLines}

Task:
1. Provide a plain-language explanation (plainExplanation, max 400 chars) explaining these specific discrepancies calmly to a student.
2. Provide up to 4 polite, specific clarification questions (whatToAskTheRecruiter) the student can ask the official HR department to resolve these discrepancies.
Rules:
- You may ONLY restate and explain the supplied discrepancies above.
- Do NOT declare the offer to be genuine or a scam.
- Output ONLY JSON matching the schema.`;
}
