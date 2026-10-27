export interface LinkExplainParams {
  hostname: string;
  registrableDomain?: string | null;
  observations: string[];
  ageDays?: number | string;
}

export function buildLinkExplainPrompt(params: LinkExplainParams): string {
  return `Explain the following technical link observations in simple terms for an Indian student:
Hostname: ${params.hostname}
Registrable domain: ${params.registrableDomain || "Unknown"}
Domain age: ${params.ageDays ? `${params.ageDays} days` : "Unknown / unavailable"}
Observations:
${params.observations.map((o) => `- ${o}`).join("\n")}

Constraints:
- Rephrase the supplied technical observations in 2-3 calm, plain sentences.
- Do NOT make new technical claims, guess IP addresses, or invent facts.
- Do NOT declare the link is definitively genuine or a scam.
- Suggest up to 4 specific, safe next checks for the student.`;
}
