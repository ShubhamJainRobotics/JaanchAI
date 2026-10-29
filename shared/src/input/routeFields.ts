import { AnalyzeRequest, SenderInput } from "../schemas/index.js";

export interface RouteFieldsResult {
  request: AnalyzeRequest;
  notices: string[];
}

/**
 * Strips zero-width characters, trims, and applies Unicode NFKC normalization.
 */
export function sanitizeString(val?: string | null): string {
  if (!val) return "";
  return val
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .normalize("NFKC")
    .trim();
}

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_DOMAIN_PATTERN =
  /^(?:https?:\/\/)?(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|org|net|in|co\.in|edu|gov|io|invalid|test|example|tech|ai|dev|app|me|link|ly|xyz|top|live|online|site|club|vip|shop)(?:\/[^\s]*)?$/i;
const PHONE_PATTERN = /^(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$|^[6-9]\d{9}$|^0[1-9]\d{8,10}$/;
const UPI_PATTERN = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9_-]{2,32}$/;

/**
 * Validates and reroutes mistakenly placed input fields before pipeline execution.
 * Authority: runs first on server; also runs on client for immediate interactive feedback.
 */
export function routeFields(input: AnalyzeRequest | Record<string, any>): RouteFieldsResult {
  const notices: string[] = [];

  // Deep clone input to avoid mutating caller object
  const req: any = {
    ...input,
    text: sanitizeString(input.text),
    domain: input.domain || "internship",
    inputType: input.inputType || "text",
    channel: input.channel || "other",
  };

  const sender: SenderInput = req.sender ? { ...req.sender } : {};
  let claimedOrg = sanitizeString(req.claimedOrg);

  // Sanitize sender fields
  if (sender.email) sender.email = sanitizeString(sender.email);
  if (sender.phone) sender.phone = sanitizeString(sender.phone);
  if (sender.upiId) sender.upiId = sanitizeString(sender.upiId);
  if (sender.websiteUrl) sender.websiteUrl = sanitizeString(sender.websiteUrl);
  if (sender.displayName) sender.displayName = sanitizeString(sender.displayName);
  if (sender.socialHandle) sender.socialHandle = sanitizeString(sender.socialHandle);
  if (sender.recruiterName) sender.recruiterName = sanitizeString(sender.recruiterName);

  // Rule 1: Check if claimedOrg looks like an email, URL, phone, or UPI
  if (claimedOrg) {
    if (EMAIL_PATTERN.test(claimedOrg)) {
      if (!sender.email) {
        sender.email = claimedOrg;
        notices.push(
          `We moved '${claimedOrg}' to the sender email field — it looked like an email address, not an organization name.`
        );
      } else {
        notices.push(
          `We removed '${claimedOrg}' from the organization field because it looked like an email address, and sender email was already provided.`
        );
      }
      claimedOrg = "";
    } else if (URL_DOMAIN_PATTERN.test(claimedOrg)) {
      let formattedUrl = claimedOrg;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      if (!sender.websiteUrl) {
        sender.websiteUrl = formattedUrl;
        notices.push(
          `We moved '${claimedOrg}' to the sender website field — it looked like a website URL or domain, not an organization name.`
        );
      } else {
        notices.push(
          `We removed '${claimedOrg}' from the organization field because it looked like a web domain, and website URL was already provided.`
        );
      }
      claimedOrg = "";
    } else if (PHONE_PATTERN.test(claimedOrg.replace(/\s+/g, ""))) {
      if (!sender.phone) {
        sender.phone = claimedOrg;
        notices.push(
          `We moved '${claimedOrg}' to the sender phone field — it looked like a phone number, not an organization name.`
        );
      } else {
        notices.push(
          `We removed '${claimedOrg}' from the organization field because it looked like a phone number, and phone was already provided.`
        );
      }
      claimedOrg = "";
    } else if (UPI_PATTERN.test(claimedOrg) && !claimedOrg.includes(".com") && !claimedOrg.includes(".in")) {
      if (!sender.upiId) {
        sender.upiId = claimedOrg;
        notices.push(
          `We moved '${claimedOrg}' to the sender UPI ID field — it looked like a UPI payment address, not an organization name.`
        );
      } else {
        notices.push(
          `We removed '${claimedOrg}' from the organization field because it looked like a UPI payment address, and UPI ID was already provided.`
        );
      }
      claimedOrg = "";
    }
  }

  // Rule 2: Check if sender fields lack their expected shape and look like an organization or another field
  if (sender.email && !EMAIL_PATTERN.test(sender.email)) {
    if (URL_DOMAIN_PATTERN.test(sender.email)) {
      if (!sender.websiteUrl) {
        sender.websiteUrl = sender.email.startsWith("http") ? sender.email : `https://${sender.email}`;
        notices.push(
          `We moved '${sender.email}' from email to sender website — it looked like a website URL, not an email address.`
        );
      } else {
        notices.push(
          `We cleared '${sender.email}' from email because it looked like a website URL, and sender website was already provided.`
        );
      }
      delete sender.email;
    } else if (!sender.email.includes("@")) {
      if (!claimedOrg) {
        claimedOrg = sender.email;
        notices.push(
          `We moved '${sender.email}' from the email field to organization name — it did not contain an '@' sign and looked like an organization.`
        );
      } else {
        notices.push(
          `We cleared invalid email '${sender.email}' because it lacked a valid email format.`
        );
      }
      delete sender.email;
    }
  }

  if (sender.websiteUrl && !URL_DOMAIN_PATTERN.test(sender.websiteUrl)) {
    if (!sender.websiteUrl.includes(".") && /[a-zA-Z]/.test(sender.websiteUrl)) {
      if (!claimedOrg) {
        claimedOrg = sender.websiteUrl;
        notices.push(
          `We moved '${sender.websiteUrl}' from website to organization name — it looked like an organization name, not a URL.`
        );
      } else {
        notices.push(
          `We cleared invalid website '${sender.websiteUrl}' because it lacked a valid URL structure.`
        );
      }
      delete sender.websiteUrl;
    }
  }

  if (sender.phone && !PHONE_PATTERN.test(sender.phone.replace(/[\s-]+/g, ""))) {
    // If phone contains letters
    if (/[a-zA-Z]/.test(sender.phone)) {
      if (!claimedOrg) {
        claimedOrg = sender.phone;
        notices.push(
          `We moved '${sender.phone}' from phone to organization name — it contained alphabetical characters.`
        );
      } else {
        notices.push(
          `We cleared invalid phone '${sender.phone}' because it contained non-numeric characters.`
        );
      }
      delete sender.phone;
    }
  }

  req.claimedOrg = claimedOrg || undefined;
  req.sender = Object.keys(sender).length > 0 ? sender : undefined;

  return {
    request: req as AnalyzeRequest,
    notices,
  };
}
