/**
 * Redacts personally identifiable information (PII) before any server-side AI processing.
 * Also sanitizes delimiters to prevent prompt injection.
 */
export function redactPII(text: string): string {
  if (!text) return "";

  let result = text;

  // Prevent prompt injection delimiter escaping
  result = result.replace(/<\/?untrusted_message>/gi, "[FILTERED_TAG]");

  // 1. Email addresses
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL]"
  );

  // 2. UPI IDs (e.g. name@okhdfcbank, user@paytm, 9876543210@ybl)
  result = result.replace(/[\w.\-]{2,}@[a-z]{2,}/gi, "[UPI_ID]");

  // 3. Indian PAN Card: 5 uppercase letters, 4 digits, 1 uppercase letter
  result = result.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, "[ID_NUMBER]");

  // 4. Card-like sequences: 13-19 digits, possibly hyphen or space separated
  result = result.replace(
    /\b(?:\d{4}[ -]?){3}\d{1,4}\b|\b\d{13,19}\b/g,
    "[CARD_NUMBER]"
  );

  // 5. Explicit bank account patterns (preceded by account/a/c/acc)
  result = result.replace(
    /(?:(?:account|acc|a\/c)(?:\s*(?:no\.?|number|#))?[:\s]*)(\b\d{9,18}\b)/gi,
    "account [ACCOUNT_NUMBER]"
  );

  // 6. Aadhaar-like 12-digit numbers: 4-4-4 or 12 digits
  result = result.replace(/\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g, "[ID_NUMBER]");

  // 7. Indian Mobile Numbers: (+91 followed by 10 digits starting with 6-9)
  result = result.replace(
    /(?:\+91[\s-]?)?[6-9]\d{9}\b/g,
    "[PHONE]"
  );

  // 8. General Bank Account numbers: 9 to 18 consecutive digits
  result = result.replace(/\b\d{9,18}\b/g, "[ACCOUNT_NUMBER]");

  return result;
}
