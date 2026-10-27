import { OpportunityDomain, Channel, RuleHit } from "shared";

export interface AnalysisPromptParams {
  domain: OpportunityDomain;
  channel: Channel;
  claimedOrg?: string;
  ruleHits: RuleHit[];
  redactedText: string;
}

export function buildAnalysisPrompt(params: AnalysisPromptParams): string {
  const ruleHitsJsonLines =
    params.ruleHits.length > 0
      ? params.ruleHits
          .map(
            (h) =>
              `- [${h.ruleId}] ${h.title}${h.hardDisqualifier ? " (HARD DISQUALIFIER)" : ""} (Quote: "${h.evidenceQuote}")`
          )
          .join("\n")
      : "None detected.";

  // Strip any closing untrusted_message tags from text
  const safeText = params.redactedText.replace(/<\/?untrusted_message>/gi, "");

  return `Opportunity domain: ${params.domain}
How it reached the user: ${params.channel}
Organization claimed by user (may be empty): ${params.claimedOrg || "None specified"}

Deterministic rule engine findings already detected (including hard disqualifiers):
${ruleHitsJsonLines}
(Do NOT repeat these rule findings. Focus only on novel context or subtleties.)

Task:
1. Identify ADDITIONAL warning signs not already covered by the rule findings, each with an exact evidenceQuote from the message.
2. List what remains UNVERIFIED and how the user can verify each item independently.
3. Suggest up to 4 extra verification steps specific to this message and domain.
4. Write a 2-sentence plain-language overview for a student. Do not give a verdict.
5. Give your confidence (low|medium|high) in how much the text alone can tell us.

<untrusted_message>
${safeText}
</untrusted_message>`;
}
