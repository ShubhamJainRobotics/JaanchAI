export const INPUT_LIMITS = {
  textMin: 20,
  textMax: 8000,
  claimedOrgMax: 120,
  fileMaxBytes: 5 * 1024 * 1024,
  pdfMaxOcrPages: 5,
  maxLinksPerAnalysis: 10,
} as const;

export const AI_CONSENT_TEXT =
  "Send a redacted copy of this text (emails, phone numbers, ID and account numbers removed) to Google Gemini to add context. The rule-based analysis works without this.";
