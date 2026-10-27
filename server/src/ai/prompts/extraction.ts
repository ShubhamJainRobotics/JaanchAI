export function buildExtractionPrompt(
  redactedText: string,
  missingFields: string[]
): string {
  const safeText = redactedText.replace(/<\/?untrusted_message>/gi, "");

  return `The deterministic parsing pass missed the following offer fields:
${missingFields.map((f) => `- ${f}`).join("\n")}

Task:
Extract ONLY the missing fields listed above from the message below.
Rules:
1. For each field you find, provide the extracted 'value' and an exact, verbatim 'evidenceQuote' copied directly from the text.
2. If a field is not explicitly stated in the text, you MUST return null for that field. Never guess or hallucinate.
3. Every non-null field MUST have an exact substring evidenceQuote.

<untrusted_message>
${safeText}
</untrusted_message>`;
}
